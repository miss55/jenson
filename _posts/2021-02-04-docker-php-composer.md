---
layout: post
title: docker php composer使用
tags: docker-php-composer
categories: php
---
> 

### 目的
- 一般项目都是php和php composer分离处理的，否则，纯净的php执行容器就需要引用更多composer相关的东西
- 直接使用[docker composer官方容器](https://hub.docker.com/_/composer)

### 基本命令
  ```shell
    $ docker run --rm --interactive --tty \
      --volume "$PROJECT_PATH":/app \
      composer $RUN_CMD --ignore-platform-reqs
    # $PROJECT_PATH 项目目录
    # $RUN_CMD 需要执行的命令 比如: composer install
    # --ignore-platform-reqs 忽略php要求
  ```
