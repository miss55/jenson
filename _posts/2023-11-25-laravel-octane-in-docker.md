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

1. 测试并发
    1. hello world 情况下并发能力上天。
    1. 本地数据库，一查已新增，并发能力上天，响应5ms上下。正常应该需要40.08 ms
    1. 本地数据库，循环查执行一百条查询sql，响应50ms上下，并发越多越惨。
    1. sleep 1s，直接gg, 也就是说如果存在长阻塞情况，还是会出现很糟糕的情况。
1. php原本就是阻塞IO操作，即使通过swoole，roadrunner 基于非阻塞事件IO，但是你的程序却都是阻塞阻塞的，这就导致再好的非阻塞模型也是gameover

1. 解决：
    1. 跟踪CPU负载，如果CPU消耗低于85-95%（持续），再增加worker数。
    1. 建议将不同请求拆分到不同实例上，然后再根据不同响应情况，配置worker数
    1. 将耗时的api拎出来优化，拆分，异步
