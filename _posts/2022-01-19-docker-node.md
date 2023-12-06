---
layout: post
title: docker 构建node最佳实践
tags: docker node
categories: tool
---

* TOC
{:toc}

# docker 构建node最佳实践

> 注意：**目前已经做了最佳实践** [仓库docker-node](https://github.com/miss55/docker-node/blob/main/README-zh.md#%E4%BD%BF%E7%94%A8) <br/>
> 重点再此，经过多次实践，docker-node 我已经改良到只需简单几步就可以，具体直接看仓库的[readme的例子](https://github.com/miss55/docker-node/blob/main/README-zh.md#%E4%BD%BF%E7%94%A8)即可

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

    # while read line; do export $line; done < .env.development
    source ./.env.development

    # set host
    HOST_DOMAIN=$REACT_APP_HOST_DOMAIN
    HOST_IP=$REACT_APP_HOST_IP

    SET_HOST=" --add-host ${HOST_DOMAIN}:${HOST_IP}"

    if [ -z "$HOST_IP" -o -z "$HOST_DOMAIN" ];then
      # If the ip or domain name has a null then drop it
      SET_HOST=""
    fi

    CURRENT_DIR_NAME=`basename $PWD`
    CMD="$*"

    echo "current directory [ ${CURRENT_DIR_NAME} ]"

    CMD_MD5=`echo -n "$*$PWD" | md5sum | cut -d ' ' -f1`
    CONTAINNER_NAME="${CURRENT_DIR_NAME}_${CMD_MD5}"

    NODE_CACHE_DIRECTORY=$HOME/.node/.cache
    NODE_NPM_GLOBAL_DIRECTORY=$HOME/.node/${IMAGE_NAME}



    if [ ! -d "$NODE_CACHE_DIRECTORY" ]; then
        echo "Initially creating node cache directory: $NODE_CACHE_DIRECTORY"
        mkdir -p "$NODE_CACHE_DIRECTORY"
    fi

    if [ ! -d "$NODE_NPM_GLOBAL_DIRECTORY" ]; then
        echo "Initially creating npm global directory: $NODE_NPM_GLOBAL_DIRECTORY"
        mkdir -p "$NODE_NPM_GLOBAL_DIRECTORY/bin"
        mkdir -p "$NODE_NPM_GLOBAL_DIRECTORY/node_modules"
    fi


    # set port
    PORT_SET=""

    RESULT=$(echo $CMD | grep -E "npm run dev|npm start|yarn start|yarn run dev")
    if [ -n "$RESULT" ];then

        if [ -z "${PORT}" ]; then
          echo "Please set PORT={port} in .env.development"
          exit 1
        fi
        PORT_SET="-p ${PORT}:${PORT}"
        echo "Port mapping is ${PORT_SET}"
    fi

    echo "run command [ ${CMD} ]"


    # set user
    # NODE_USER="root:root"
    NODE_USER="node:node"
    HAS_GOLABL=`echo $CMD|grep ' -g '`
    if [ "$HAS_GOLABL" ] ; then
      NODE_USER="root:root"
    fi



    # Host generates global node_modules
    if [ ! -d "${NODE_NPM_GLOBAL_DIRECTORY}/bin" -o `ls ${NODE_NPM_GLOBAL_DIRECTORY}/bin/ | wc -l` -eq "0" ];then
      # Copy from within the container
      TEST_DOCKER_NODE_NAME="docker_test_node_name"
      docker rm ${TEST_DOCKER_NODE_NAME}
      docker run --name  ${TEST_DOCKER_NODE_NAME} ${IMAGE_NAME} /bin/sh -c "echo running test node"
      docker cp ${TEST_DOCKER_NODE_NAME}:/usr/local/lib/node_modules ${NODE_NPM_GLOBAL_DIRECTORY}/
      docker cp ${TEST_DOCKER_NODE_NAME}:/usr/local/bin ${NODE_NPM_GLOBAL_DIRECTORY}/
      docker rm ${TEST_DOCKER_NODE_NAME}
    fi

    # Stop containers that are already running again, if there are
    docker ps | grep "${CONTAINNER_NAME}" &&  docker stop "${CONTAINNER_NAME}" && sleep 2


    # Run docker
    docker run -it --rm --name $CONTAINNER_NAME \
      -v "$PWD":/usr/src/app \
      -v "$NODE_CACHE_DIRECTORY":/home/node/.cache \
      -v "${NODE_NPM_GLOBAL_DIRECTORY}/node_modules":/usr/local/lib/node_modules \
      -v "${NODE_NPM_GLOBAL_DIRECTORY}/bin":/usr/local/bin \
      -w /usr/src/app \
      ${SET_HOST} \
      ${PORT_SET} \
      --user $NODE_USER \
      ${IMAGE_NAME} \
      /bin/sh -c "${CMD}"

```

## node 一些问题

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

## 国内可选源

1. 腾讯源*推荐*：  ```npm config set registry http://mirrors.cloud.tencent.com/npm/```
1. 淘宝源：  ```npm config set registry https://registry.npm.taobao.org```
1. 官方源：```npm config set registry https://registry.npmjs.org/```
