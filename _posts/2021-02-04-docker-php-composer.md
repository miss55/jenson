---
layout: post
title: docker php composer使用
tags: docker-php-composer
categories: tool
---
> 

### 目的
- 一般项目都是php和php composer分离处理的，否则，纯净的php执行容器就需要引用更多composer相关的东西
- 直接使用[docker composer官方容器](https://hub.docker.com/_/composer)

### 基本命令
1. 安装
  ```shell
    $ docker run --rm --interactive --tty \
      --volume "$PROJECT_PATH":/app \
      composer $RUN_CMD --ignore-platform-reqs
    # $PROJECT_PATH 项目目录
    # $RUN_CMD 需要执行的命令 比如: composer install
    # --ignore-platform-reqs 忽略php要求
  ```

1. 定时任务
  ```shell
    * * * * * cd ~/dnmp && /usr/local/bin/docker-compose  exec -T -u www-data  php php ${PROJECT_PATH}/artisan schedule:run >> /dev/null 2>&1
  ```
### 源
1. composer.json配置
  ```json
    "repositories": {
        "packagist": {
            "type": "composer",
            "url": "https://packagist.phpcomposer.com"
        }
    }
  ```
1. composer config repo.packagist composer https://packagist.phpcomposer.com
    1. ```  composer        https://packagist.org ```
    1. ```  phpcomposer     https://packagist.phpcomposer.com ```
    1. ```  aliyun          https://mirrors.aliyun.com/composer ```
    1. ```  tencent         https://mirrors.cloud.tencent.com/composer  ```
    1. ```  huawei          https://mirrors.huaweicloud.com/repository/php  ```
    1. ```  laravel-china   https://packagist.laravel-china.org ```
    1. ```  cnpkg           https://php.cnpkg.org ```
    1. ```  sjtug           https://packagist.mirrors.sjtug.sjtu.edu.cn ```