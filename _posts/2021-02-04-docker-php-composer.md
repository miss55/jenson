---
layout: post
title: docker php composer使用
tags: docker-php-composer
categories: tool
---

* TOC
{:toc}


# 目的
- 一般项目都是php和php composer分离处理的，否则，纯净的php执行容器就需要引用更多composer相关的东西
- 直接使用[docker composer官方容器](https://hub.docker.com/_/composer)

# 基本命令
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
# 脚本
1. 放置到 /usr/local/bin
```shell
#!/bin/bash

CMD="composer "
for i in "$*"; do
    CMD="$CMD $i"
done

RESULT=$(echo $CMD | grep -E "composer install|composer require")
if [ -n "$RESULT" ];then
  CMD="${CMD} --ignore-platform-reqs"
fi


REPO="https://mirrors.aliyun.com/composer/"

COMPOSER_TMP=${COMPOSER_HOME:-$HOME/.composer}

if [ ! -d $COMPOSER_TMP ];then
  # 创建composer cache 目录
  echo "mkdir directory ${COMPOSER_TMP}"
  mkdir ${COMPOSER_TMP}
  # 创建auth.json并指定github token， 如果失效请重新创建
  AUTH_FILE="${COMPOSER_TMP}/auth.json"
  echo "create ${AUTH_FILE} file"
  cat > ${AUTH_FILE} <<- EOF
  {
    "bitbucket-oauth": {},
    "github-oauth": {
        "github.com": "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"},
    "gitlab-oauth": {},
    "gitlab-token": {},
    "http-basic": {},
    "bearer": {}
}
EOF
fi

echo "run ${CMD}"

docker run --rm --interactive --tty \
        --volume "$PWD":/app \
        --user $(id -u):$(id -g) \
        --volume ${COMPOSER_HOME:-$HOME/.composer}:/tmp \
        composer /bin/sh -c "composer config -g repo.packagist composer ${REPO} && $CMD"

# in production please add --no-dev
# sh install_composer_docker.sh composer install
# sh install_composer_docker.sh composer require [composer package:version]
#                               composer require foo/bar:2.6.30
# version
#   确定版本 like 1.0.2
#   范围之内 like >=1.0  即 >=1.0,<2.0
#   星号匹配 like 1.0.*  即 1.0.[任意]
#   波浪号   like ~1.2.2  即 不升级到 1.3.0 版本 1.2 >= 版本号 < 1.3.0
#   ^ 比 ~广 like ^1.2.2  即 1.2.2 <= 版本号 < 2.0.0

# fixed 如果有某个依赖无法安装，可以试着使用 composer require 直接安装先

```


# 源
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