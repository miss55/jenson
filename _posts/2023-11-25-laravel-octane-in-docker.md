---
layout: post
title: laravel octane 基于docker安装与hyperf，webman性能对比
tags: php laravel docker octane swoole roadrunner hyperf webman
categories: php
---


* TOC
{:toc}

# laravel octane 基于docker安装实践

## 一、安装

1. RoadRunner
    1. 安装扩展 `composer require laravel/octane spiral/roadrunner`
    1. 安装 RoadRunner 二进制包 `./vendor/bin/rr get-binary`
        * 不行的话 **[加代理](https://greasyfork.org/scripts/412245)**，比如我在这里直接加前缀 `vendor/spiral/roadrunner-cli/src/Repository/Asset.php:33` 代码为 `$this->uri = 'https://dl.ghpig.top/'. $uri;`
1. Swoole
    > 前提安装 swoole:  pecl install swoole
    1. 安装扩展: `composer require laravel/octane`
1. OpenSwoole
    > 其实跟Swoole一样，名字不一样而已

1. 安装到项目中
    1. 生成配置文件等:  `php artisan octane:install`
        1. 选择你的安装的情况 roadrunner or swoole
    1. **开发环境** *推荐* ，不然你的watch会报错
        1. `apk add nodejs npm`
        1. `npm config set registry https://registry.npm.taobao.org`
        1. `npm install --save-dev chokidar`

## 二、nginx 配置

```conf

    # 默认
    map $http_upgrade $connection_upgrade {
        default upgrade;
        ''      close;
    }

    # 容器内 只能通过upstream方式转发
    upstream backend {
        server php8:8000;
    }

    server {
        listen 80;
        server_name backendstudy.local.com;
        #server_tokens off;

        root /www/backend/public;

        add_header X-Frame-Options "SAMEORIGIN";
        add_header X-Content-Type-Options "nosniff";

        index index.php;

        charset utf-8;

        # 因为不是全栈 所以只是部分path转发 与官方给的默认配置有出入
        location ~* ^/(api|web|horizon|telescope)/ {
            try_files $uri $uri/ @octane;
        }
        

        # horizon vendor
        location /vendor {
            alias  /www/backend/public/vendor/;
        }

        # fronend 
        location / {
            alias  /www/backend/public/dist/;
        }

        #location /index.php {
        #    try_files /not_exists @octane;
        #}

        #location / {
        #    try_files $uri $uri/ @octane;
        #}


        location = /favicon.ico { access_log off; log_not_found off; }
        location = /robots.txt  { access_log off; log_not_found off; }

        error_page 404 /index.php;
        
        location @octane {
            set $suffix "";

            if ($uri = /index.php) {
                set $suffix ?$query_string;
            }

            proxy_http_version 1.1;
            proxy_set_header Host $http_host;
            proxy_set_header Scheme $scheme;
            proxy_set_header SERVER_PORT $server_port;
            proxy_set_header REMOTE_ADDR $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection $connection_upgrade;

            proxy_pass http://backend$suffix;
        }


        location ~ /\.(?!well-known).* {
            deny all;
        }
    }


```

## 三、使用

1. 添加Makefile

    > fixed 在docker里，host必须绑定到 0.0.0.0

    ```makefile
    # 小心缩进，是Tab，不是空格
    help: ## Display this help screen
        @grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'
    dev: ## octane start in dev
        php artisan octane:start --watch --workers=4 --task-workers=2 --host=0.0.0.0 --port=8000
    start: ## octane start in dev
        php artisan octane:start --workers=4 --task-workers=2 --host=0.0.0.0 --port=8000
    reload: ## octane reload
        php artisan octane:reload
    stop: ## octane stop
        php artisan octane:stop
    run: ## run start by octane on production
        php artisan octane:start --host=0.0.0.0
    status: ## show octane status
        php artisan octane:status
    optimize: ## optimize cache and autoload
        composer dump-autoload
        php artisan optimize

    ```

## 四、生产使用

1. 建议[参照文档](https://learnku.com/docs/laravel/10.x/octane/14909#6cc110)，将命令打包到docker中去

## 五、不靠谱的性能测试

1. 测试并发，使用[wrk](https://github.com/wg/wrk)
    > 当前测试不是很严格，部分硬件性能没有完全压榨完全，另外测试是同一台宿主机的两台虚拟机
    > 这次测试主要想看下php阻塞对并发影响，虽然加上了内存模式+非阻塞异步事件IO，业务那块其实还是阻塞的
    > 本来使用ab，不过试了之后，发现ab测试会飘
    > 每个都是测试至少3遍，选其中表现最好的
    1. 环境
        1. 硬件 4核8G
        1. php版本
            1. php-fpm: PHP 8.1.23
            1. octane: PHP 8.1.23
            1. hyperf PHP 8.1.25
            1. webman: PHP 8.1.23，框架的确简陋了点，连个环境变量配置都没有

    1. hello world 组

        * php-fpm static 200

            ```text
                wrk -t8 -c400 -d30s http://fpm.local.com/api/hello
                Running 30s test @ http://fpm.local.com/api/hello
                8 threads and 400 connections
                Thread Stats   Avg      Stdev     Max   +/- Stdev
                    Latency     1.26s   190.76ms   1.80s    80.33%
                    Req/Sec    40.61     24.20   333.00     77.16%
                9315 requests in 30.10s, 3.15MB read
                Requests/sec:    309.47
                Transfer/sec:    107.29KB
            ```

        * octane swoole

            ```text
                wrk -t8 -c400 -d30s http://octane.local.com/api/hello
                Running 30s test @ http://octane.local.com/api/hello
                8 threads and 400 connections
                Thread Stats   Avg      Stdev     Max   +/- Stdev
                    Latency   537.92ms  112.21ms 958.60ms   70.75%
                    Req/Sec    95.31     46.90   380.00     70.21%
                22144 requests in 30.10s, 6.06MB read
                Requests/sec:    735.71
                Transfer/sec:    206.20KB

                # octane 的worker设置到8个,结果不是很理想

                wrk -t8 -c400 -d30s http://octane.local.com/api/hello
                Running 30s test @ http://octane.local.com/api/hello
                8 threads and 400 connections
                Thread Stats   Avg      Stdev     Max   +/- Stdev
                    Latency   581.83ms  167.72ms   1.34s    74.55%
                    Req/Sec    92.64     48.08   410.00     64.35%
                20476 requests in 30.10s, 5.60MB read
                Requests/sec:    680.28
                Transfer/sec:    190.66KB

            ```

        * hyperf

            ```text
                wrk -t8 -c400 -d30s http://hyperf.local.com/hello
                Running 30s test @ http://hyperf.local.com/hello
                8 threads and 400 connections
                Thread Stats   Avg      Stdev     Max   +/- Stdev
                    Latency    59.98ms   30.18ms 223.07ms   62.56%
                    Req/Sec   842.18    407.92     3.13k    78.64%
                201302 requests in 30.09s, 43.95MB read
                Requests/sec:   6689.38
                Transfer/sec:      1.46MB
            ```

        * webman

            ```text
                # process 8
                wrk -t8 -c400 -d30s http://webman.local.com/test/hello
                Running 30s test @ http://webman.local.com/test/hello
                8 threads and 400 connections
                Thread Stats   Avg      Stdev     Max   +/- Stdev
                    Latency     9.89ms    8.71ms 128.72ms   90.04%
                    Req/Sec     5.72k     1.30k   13.28k    58.71%
                1367121 requests in 30.09s, 218.97MB read
                Requests/sec:  45427.13
                Transfer/sec:      7.28MB

                # process 12
                wrk -t8 -c400 -d30s http://webman.local.com/test/hello
                Running 30s test @ http://webman.local.com/test/hello
                8 threads and 400 connections
                Thread Stats   Avg      Stdev     Max   +/- Stdev
                    Latency    10.27ms    8.21ms 120.76ms   85.99%
                    Req/Sec     5.41k     1.45k   13.83k    62.25%
                1295066 requests in 30.10s, 207.43MB read
                Requests/sec:  43031.45
                Transfer/sec:      6.89MB

            ```

    1. 本地数据库，通过User Id查询用户信息

        * php-fpm static 200

            ```text
                wrk -t6 -c400 -d30s http://fpm.local.com/api/test
                Running 30s test @ http://fpm.local.com/api/test
                6 threads and 400 connections
                Thread Stats   Avg      Stdev     Max   +/- Stdev
                    Latency     1.18s   134.97ms   1.38s    93.06%
                    Req/Sec   115.95    108.88   370.00     67.72%
                9909 requests in 30.10s, 5.60MB read
                Requests/sec:    329.24
                Transfer/sec:    190.54KB
            ```

        * octane swoole

            ```text
                wrk -t6 -c400 -d30s http://octane.local.com/api/test
                Running 30s test @ http://octane.local.com/api/test
                6 threads and 400 connections
                Thread Stats   Avg      Stdev     Max   +/- Stdev
                    Latency   764.12ms  146.47ms   1.24s    73.90%
                    Req/Sec    86.13     35.96   376.00     70.27%
                15351 requests in 30.08s, 8.02MB read
                Requests/sec:    510.35
                Transfer/sec:    272.95KB

                # octane 的worker设置到8个,结果不是很理想
                wrk -t8 -c400 -d30s http://octane.local.com/api/test
                Running 30s test @ http://octane.local.com/api/test
                8 threads and 400 connections
                Thread Stats   Avg      Stdev     Max   +/- Stdev
                    Latency   720.49ms  188.45ms   1.58s    81.37%
                    Req/Sec    69.49     31.71   404.00     78.24%
                16474 requests in 30.10s, 8.60MB read
                Requests/sec:    547.30
                Transfer/sec:    292.72KB
            ```

        * hyperf

            ```text
                wrk -t6 -c400 -d30s http://hyperf.local.com/test
                Running 30s test @ http://hyperf.local.com/test
                6 threads and 400 connections
                Thread Stats   Avg      Stdev     Max   +/- Stdev
                    Latency   211.14ms   86.29ms 610.61ms   67.81%
                    Req/Sec   314.08     85.60   540.00     66.22%
                56308 requests in 30.07s, 30.12MB read
                Requests/sec:   1872.36
                Transfer/sec:      1.00MB
            ```

        * webman

            ```text
                # process 8
                wrk -t8 -c400 -d30s http://webman.local.com/test/test
                Running 30s test @ http://webman.local.com/test/test
                8 threads and 400 connections
                Thread Stats   Avg      Stdev     Max   +/- Stdev
                    Latency    86.96ms   60.02ms   1.03s    84.61%
                    Req/Sec   610.23     84.88     1.23k    76.46%
                146078 requests in 30.09s, 72.15MB read
                Requests/sec:   4854.74
                Transfer/sec:      2.40MB

                # process 12
                wrk -t8 -c400 -d30s http://webman.local.com/test/test
                Running 30s test @ http://webman.local.com/test/test
                8 threads and 400 connections
                Thread Stats   Avg      Stdev     Max   +/- Stdev
                    Latency    91.43ms   69.79ms   1.35s    91.84%
                    Req/Sec   584.84     78.12     1.03k    74.83%
                139951 requests in 30.07s, 69.13MB read
                Requests/sec:   4654.85
                Transfer/sec:      2.30MB
            ```

    1. 本地数据库，循环查执行一百条查询sql，我观测到cpu hyperf 干到100%，但是 octane_swoole在70%-80%之间

        * php-fpm static 200

            ```text
                wrk -t8 -c400 -d30s http://fpm.local.com/api/batch
                Running 30s test @ http://fpm.local.com/api/batch
                8 threads and 400 connections
                Thread Stats   Avg      Stdev     Max   +/- Stdev
                    Latency     0.00us    0.00us   0.00us    -nan%
                    Req/Sec    13.03     11.23    80.00     78.76%
                1144 requests in 30.04s, 662.05KB read
                Socket errors: connect 0, read 0, write 0, timeout 1144
                Requests/sec:     38.08
                Transfer/sec:     22.04KB
            ```

        * octane swoole

            ```text
                wrk -t8 -c400 -d30s http://octane.local.com/api/batch
                Running 30s test @ http://octane.local.com/api/batch
                8 threads and 400 connections
                Thread Stats   Avg      Stdev     Max   +/- Stdev
                    Latency   961.31ms  565.22ms   1.99s    57.73%
                    Req/Sec    17.43     12.34    70.00     61.07%
                1297 requests in 30.04s, 693.53KB read
                Socket errors: connect 0, read 0, write 0, timeout 1200
                Requests/sec:     43.17
                Transfer/sec:     23.08KB

                # octane 的worker设置到8个,结果不是很理想
                wrk -t8 -c400 -d30s http://octane.local.com/api/batch
                Running 30s test @ http://octane.local.com/api/batch
                8 threads and 400 connections
                Thread Stats   Avg      Stdev     Max   +/- Stdev
                    Latency     1.07s   559.04ms   1.98s    58.16%
                    Req/Sec    10.78      8.83    69.00     71.53%
                1496 requests in 30.05s, 799.83KB read
                Socket errors: connect 0, read 0, write 0, timeout 1398
                Requests/sec:     49.78
                Transfer/sec:     26.61KB

            ```

        * hyperf

            ```text
                wrk -t8 -c400 -d30s http://hyperf.local.com/batch
                Running 30s test @ http://hyperf.local.com/batch
                8 threads and 400 connections
                Thread Stats   Avg      Stdev     Max   +/- Stdev
                    Latency     1.29s   434.40ms   1.97s    54.43%
                    Req/Sec    22.56     34.25   420.00     91.90%
                3474 requests in 30.04s, 1.08MB read
                Socket errors: connect 0, read 0, write 0, timeout 3395
                Non-2xx or 3xx responses: 2176
                Requests/sec:    115.66
                Transfer/sec:     36.81KB
            ```

        * webman

            ```text

                # process 8
                wrk -t8 -c400 -d30s http://webman.local.com/test/batch
                Running 30s test @ http://webman.local.com/test/batch
                8 threads and 400 connections
                Thread Stats   Avg      Stdev     Max   +/- Stdev
                    Latency     1.37s   494.45ms   2.00s    64.28%
                    Req/Sec    23.68     15.70   110.00     73.67%
                3453 requests in 30.07s, 1.71MB read
                Socket errors: connect 0, read 0, write 0, timeout 1734
                Requests/sec:    114.82
                Transfer/sec:     58.07KB

                # process 12
                wrk -t8 -c400 -d30s http://webman.local.com/test/batch
                Running 30s test @ http://webman.local.com/test/batch
                8 threads and 400 connections
                Thread Stats   Avg      Stdev     Max   +/- Stdev
                    Latency     1.33s   453.25ms   2.00s    64.50%
                    Req/Sec    17.77     11.77    80.00     68.64%
                3612 requests in 30.08s, 1.78MB read
                Socket errors: connect 0, read 0, write 0, timeout 1705
                Requests/sec:    120.08
                Transfer/sec:     60.74KB

            ```

1. 结果：
    1. webman的并发效果还是挺不错的，应该是框架很精简的原因吧，不过随着阻塞io的增多，协程模式优势会慢慢体现出来
    1. hyperf的性能的确比octane.swoole的好
    1. 按道理两边都是用Swoole Server 基于非阻塞事件IO，在单查询时，两边响应时长差别不大，但当并发上来后，octane.swoole就有点力不从心了

1. 原因：
    1. octane.swoole应该时控制器里的逻辑遇到阻塞IO时将整个进程都阻塞导致，因为CPU利用率没打满

1. Swoole 跟 Roadrunner 区别
    1. Swoole的worker基于[进程模式](https://wiki.swoole.com/#/http_server) ，Roadrunner的worker基于[线程模式](https://roadrunner.dev/docs/intro-config/current/en#cli-commands)。

## 六、总结与解决

1. 解决：
    1. 跟踪CPU负载，如果CPU消耗低于85-95%（持续），再增加worker数。
    1. 建议将不同请求拆分到不同实例上，然后再根据不同响应情况，配置worker数
    1. 将耗时的api拎出来优化，拆分，异步

1. 总结：
    1. 非阻塞异步事件IO+内存模式在有限的硬件资源里的确可以加快php响应
    1. 传统大部分php组件扩展都是阻塞型的，就算用上了非阻塞事件IO也是会拖慢整个进程或线程响应，没法做到纯协程那样worker数等于cpu核心数，可以适当提高些
    1. 如果使用协程式的框架，后续使用其他扩展时，也需要了解里面是否存在阻塞IO操作
