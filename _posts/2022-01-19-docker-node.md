---
layout: post
title: docker node
tags: docker node
categories: tool
---

* TOC
{:toc}

# docker 构建node

参考这个[仓库docker-node](https://github.com/miss55/docker-node/blob/main/README-zh.md) 已做了**改良**

## 创建Dockerfile

```Dockerfile
ARG NODE_VERSION
FROM node:${NODE_VERSION}
WORKDIR /usr/src/app

RUN sed -i 's/dl-cdn.alpinelinux.org/mirrors.ustc.edu.cn/g' /etc/apk/repositories

RUN apk update && \
apk add --update git && \
apk add --update openssh

RUN apk add --no-cache python2 python2-dev make g++
```

## 构建node 镜像
<!-- docker build --build-arg request_domain=mydomain Dockerfile -->
1. [node版本](https://hub.docker.com/_/node?tab=tags)
1. 命令

    ```shell
      docker build . --build-arg NODE_VERSION=[node版本] -t [镜像名称]
    ```

1. 例子

    ```shell
      docker build . --build-arg NODE_VERSION=14.18-alpine3.12 -t jenson/node-14.18
    ```

## npm install

1. [源](https://www.cnblogs.com/steven-yang/p/12317646.html)
1. 命令

    ```shell
    docker run -it --rm -v "$PWD":/usr/src/app \
      --name [名称] -w /usr/src/app \
      [镜像名] npm install --registry=https://registry.npm.taobao.org
    ```

1. 例子

    ```shell
    docker run -it --rm -v "$PWD":/usr/src/app \
      --name vue-admin -w /usr/src/app jenson/node-14.18 \
      npm install --registry=https://registry.npm.taobao.org
    ```

## npm start

1. 命令

    ```shell
    docker run -it --rm -v  -w /usr/src/app  \
      --name [名称]  \
      [本地路径]:/usr/src/app
      -p [本地端口]:[容器端口] \
      [镜像] [npm 命令]
    ```

1. 例子

    ```shell
      # vue run dev
      docker run -it --rm --name vue-admin \
        -v "$PWD":/usr/src/app \
        -w /usr/src/app \
        -p 9527:9527 \
        jenson/node-14.18  npm run dev
      
      # react start
      docker run -it --rm --name vue-admin \
        -v "$PWD":/usr/src/app \
        -w /usr/src/app \
        -p 9527:9527 \
        jenson/node-14.18  npm start
    ```

## npm build

1. 命令

    ```shell
    docker run -it --rm -v  -w /usr/src/app  \
      --name [名称]  \
      [本地路径]:/usr/src/app
      -p [本地端口]:[容器端口] \
      [镜像] [npm 命令]
    ```

1. 例子

    ```shell
      docker run -it --rm --name vue-admin \
        -v "$PWD":/usr/src/app \
        -w /usr/src/app \
        -p 9527:9527 \
        jenson/node-14.18  npm run build
    ```

## 封装成脚本

  ```shell
    #!/bin/bash
    CURRENT_DIR_NAME=`basename $PWD`
    echo $CURRENT_DIR_NAME

    CMD=""
    for i in "$*"; do
        CMD="$CMD $i"
    done


    PORT_SET=""
    RESULT=$(echo $CMD | grep -E "npm run dev|npm start|yarn start|yarn run dev")
    if [ -n "$RESULT" ];then
        IS_REACT=`cat package.json|grep '"react":'`
        PORT_FLAG=$([ -n "$IS_REACT" ] && echo "PORT=" || echo "port=")
        PORT=""

        if [ -e .env.development ]; then
          PORT_RESULT=`cat .env.development | grep -E "port|PORT"`
        fi
        if [ `echo "${PORT_RESULT}" | grep "#"` ]; then
          PORT_RESULT=""
        fi
        if [ -z "${PORT_RESULT}" ] && [ -e .env ];then
          PORT_RESULT=`cat .env | grep -E "port|PORT"`
        fi
        if [ `echo "${PORT_RESULT}" | grep "#"` ]; then
          PORT_RESULT=""
        fi
        if [ "$PORT_RESULT" ]; then
          PORT="$(echo $PORT_RESULT | cut -d '=' -f 2)"
        fi
        if [ -z "${PORT}" ]; then
          echo "please set ${PORT_FLAG}={port} in .env.development or .env"
          exit 1
        fi
        PORT_SET="-p ${PORT}:${PORT}"
        echo "port map is ${PORT_SET}"
    fi

    echo "run ${CMD}"

    # CMD="npm config set registry http://mirrors.cloud.tencent.com/npm/;${CMD}"
    CMD="npm config set registry https://registry.npmmirror.com/;${CMD}"
    #CMD="grep md.local.com /etc/hosts || echo 172.19.219.230  md.local.com >> /etc/hosts ;$CMD"

    NODE_USER=`echo $(id -u):$(id -g)`
    HAS_GOLABL=`echo $CMD|grep ' -g '`
    if [ "$HAS_GOLABL" ]; then
      NODE_USER="root:root"
    fi

    docker run -it --rm --name $CURRENT_DIR_NAME \
      -v "$PWD":/usr/src/app \
      -w /usr/src/app \
      ${PORT_SET} \
      --user $NODE_USER \
      jenson/node-17.5 \
      /bin/sh -c "$CMD"


    # in env react PORT=
    # in env vue port=
    # sh dnode.sh npm run dev
```

### node 一些问题

* ```docker run -it --rm  --name my-node-app -v "$PWD":/usr/src/app  node:14-alpine3.12 /bin/sh```

* python not found
  * [stackoverflow](https://stackoverflow.com/questions/62554991/how-do-i-install-python-on-alpine-linux)
  *

    ```shell
      # Install python/pip
      apk add --update --no-cache python2 && ln -sf python2 /usr/bin/python
      python2 -m ensurepip
    ```

* alpine 源  sed -i 's/dl-cdn.alpinelinux.org/mirrors.tuna.tsinghua.edu.cn/g' /etc/apk/repositories
  * [清华源](https://mirrors.tuna.tsinghua.edu.cn/help/alpine/)

### 国内可选源

1. 腾讯源*推荐*：  ```npm config set registry http://mirrors.cloud.tencent.com/npm/```
1. 淘宝源：  ```npm config set registry https://registry.npm.taobao.org```
1. 官方源：```npm config set registry https://registry.npmjs.org/```
