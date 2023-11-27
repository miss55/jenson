---
layout: post
title: laravel octane 基于docker安装实践
tags: php laravel docker octane swoole roadrunner
categories: php
---

* TOC
{:toc}

# laravel octane 基于docker安装实践

## 安装

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

## nginx 配置

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
      server_name mdot.jenson.com ;
      root /www/localhost/middleground_ot/public;

      #access_log /dev/null;
      access_log  /var/log/nginx/nginx.middleground8_ot.access.log  main;
      error_log  /var/log/nginx/nginx.middleground8_ot.error.log  warn;
      add_header X-Frame-Options "SAMEORIGIN";
      add_header X-XSS-Protection "1; mode=block";
      add_header X-Content-Type-Options "nosniff";

      index index.html index.htm index.php;

      charset utf-8;

      
      location /socket.io {
        proxy_pass http://laravel-echo:6001; #could be localhost if Echo and NginX are on the same box
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "Upgrade";
      }

      # 因为不是全栈 所以只是部分path转发 与官方给的默认配置有出入
      location ~* ^/(api|web|horizon|telescope)/ {
        try_files $uri $uri/ @octane;
      }

      # horizon vendor
      location /vendor {
          alias  /www/localhost/middleground_ot/public/vendor/;
      }

      # fronend 
      location / {
          alias  /www/localhost/middleground_8/dist/;
      }

      # proxy octane 
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

          # 转发到 upstream
          proxy_pass http://backend$suffix;
      }


      location = /favicon.ico { access_log off; log_not_found off; }
      location = /robots.txt  { access_log off; log_not_found off; }

      error_page 404 /index.php;

      location ~ /\.(?!well-known).* {
          deny all;
      }
  }

```

## 使用

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

## 生产使用

1. 建议[参照文档](https://learnku.com/docs/laravel/10.x/octane/14909#6cc110)，将命令打包到docker中去

## 存在的问题

1. Swoole 跟 Roadrunner 区别
    1. Swoole的worker基于[进程模式](https://wiki.swoole.com/#/http_server) ，Roadrunner的worker基于[线程模式](https://roadrunner.dev/docs/intro-config/current/en#cli-commands)。

1. 测试并发，使用[wrk](https://github.com/wg/wrk)
    > 本来使用ab，不过试了之后，发现ab测试会飘，虽然本次测试不严谨，只是想说明，虽然加上了内存模式+非阻塞异步事件IO，业务那块其实还是阻塞的
    1. 对照组 使用hyperf，两边都是默认配置参数，使用dev模式，直接开刷
    1. hello world 组

        * octane_swoole

            ```text
                wrk -t8 -c400 -d30s http://octane_swoole.local.com/api/hello
                Running 30s test @ http://octane_swoole.local.com/api/hello
                8 threads and 400 connections
                Thread Stats   Avg      Stdev     Max   +/- Stdev
                    Latency   517.98ms  118.91ms 950.41ms   74.36%
                    Req/Sec    97.88     47.78   350.00     66.08%
                22992 requests in 30.10s, 6.29MB read
                Requests/sec:    763.84
                Transfer/sec:    214.08KB
            ```

        * hyperf

            ```text
                wrk -t6 -c400 -d30s http://hyperf.local.com/hello
                Running 30s test @ http://hyperf.local.com/hello
                6 threads and 400 connections
                Thread Stats   Avg      Stdev     Max   +/- Stdev
                    Latency    41.05ms   17.83ms 138.16ms   67.71%
                    Req/Sec     1.62k   483.10     3.01k    65.33%
                290595 requests in 30.08s, 63.45MB read
                Requests/sec:   9661.79
                Transfer/sec:      2.11MB
            ```

    1. 本地数据库，通过User Id查询用户信息
        * octane_swoole

            ```text
                wrk -t8 -c400 -d30s http://octane_swoole.local.com/api/test
                Running 30s test @ http://octane_swoole.local.com/api/test
                8 threads and 400 connections
                Thread Stats   Avg      Stdev     Max   +/- Stdev
                    Latency   770.29ms  140.17ms   1.26s    74.23%
                    Req/Sec    65.64     32.05   333.00     70.18%
                15384 requests in 30.10s, 8.04MB read
                Requests/sec:    511.12
                Transfer/sec:    273.39KB
            ```

        * hyperf

            ```text
                wrk -t8 -c400 -d30s http://hyperf.local.com/test
                Running 30s test @ http://hyperf.local.com/test
                8 threads and 400 connections
                Thread Stats   Avg      Stdev     Max   +/- Stdev
                    Latency   206.94ms   86.15ms 583.85ms   68.02%
                    Req/Sec   242.64     73.02   545.00     69.53%
                58019 requests in 30.10s, 31.04MB read
                Requests/sec:   1927.74
                Transfer/sec:      1.03MB
            ```

    1. 本地数据库，循环查执行一百条查询sql，我观测到cpu hyperf 干到100%，但是 octane_swoole在70%-80%之间
        * octane_swoole

            ```text
                wrk -t8 -c400 -d30s http://octane_swoole.local.com/api/batch
                Running 30s test @ http://octane_swoole.local.com/api/batch
                8 threads and 400 connections
                Thread Stats   Avg      Stdev     Max   +/- Stdev
                    Latency   993.38ms  587.19ms   1.98s    58.70%
                    Req/Sec    16.41     11.62    60.00     67.00%
                1293 requests in 30.05s, 691.39KB read
                Socket errors: connect 0, read 0, write 0, timeout 1201
                Requests/sec:     43.02
                Transfer/sec:     23.01KB
            ```

        * hyperf

            ```text
                wrk -t6 -c400 -d30s http://hyperf.local.com/batch
                Running 30s test @ http://hyperf.local.com/batch
                6 threads and 400 connections
                Thread Stats   Avg      Stdev     Max   +/- Stdev
                    Latency     1.32s   442.07ms   2.00s    53.85%
                    Req/Sec    28.12     44.97   470.00     92.68%
                3423 requests in 30.03s, 1.05MB read
                Socket errors: connect 0, read 0, write 0, timeout 3358
                Non-2xx or 3xx responses: 2185
                Requests/sec:    113.98
                Transfer/sec:     35.78KB
            ```

1. 结果：
    1. hyperf的性能的确比octane.swoole的好
    1. 按道理两边都是用Swoole Server 基于非阻塞事件IO，在单查询时，两边响应时长差别不大，但当并发上来后，octane.swoole就有点力不从心了

1. 原因：
    1. octane.swoole应该时控制器里的逻辑遇到阻塞IO时将整个进程都阻塞导致，因为CPU利用率没打满

## 总结与解决

1. 解决：
    1. 跟踪CPU负载，如果CPU消耗低于85-95%（持续），再增加worker数。
    1. 建议将不同请求拆分到不同实例上，然后再根据不同响应情况，配置worker数
    1. 将耗时的api拎出来优化，拆分，异步

1. 总结：