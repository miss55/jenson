---
layout: post
title: makefile除了用于管理和自动化编译源代码以生成可执行程序之外的用法
tags: makefile
categories: tool
---


* TOC
{:toc}

# makefile除了用于管理和自动化编译源代码以生成可执行程序之外的用法

## 什么 makefile

> 注意：makefile文本是使用Tab制表符不是空格，以及自定义命令名称不可以跟目录重复

* Makefile 是一种构建工具，通常用于管理和自动化编译源代码以生成可执行程序、库文件或其他构建目标。
* Makefile 文件包含一组规则和依赖关系，定义了如何编译和链接源代码文件以生成最终的目标文件。
* Makefile 使用 make 工具执行这些规则，并只编译发生更改的文件，从而提高构建效率。

> 如果只是用来编译构建，那遇到的机会就小很多了。一次偶然我用了一个golang项目，发现除了编译构建，也可以写一些其他命令。当然你也可以直接写成脚本执行

## 语法

> 本文不是从头到尾去讲make语法，只是大概提一下大概会用到的

1. make 命令执行
    1. `make`默认执行第一个目标，如果有先决条件，则会先执行先决条件

        ```makefile
            # $ make
            # exec prerequisites
            # exec targets

            targets: prerequisites
                echo "targets"
            prerequisites:
                echo "prerequisites"
        ```

    1. `make command` 指定命令执行

        ```makefile
            # $ make prerequisites
            # exec prerequisites

            targets: prerequisites
                echo "targets"
            prerequisites:
                echo "prerequisites"
        ```

1. 变量赋值等
    * 自动变量

        ```makefile
            hey: one two
                # 输出当前命令 hey
                echo $@

                # 输出所有比目标新的先决条件
                echo $?

                # 输出所有新的先决条件
                echo $^
            one:
                echo "exec one"
            two:
                echo "two"
        ```

    * `@` 抑制符，抑制输出
    * **=** 在调用是使用
    * **:=** 扩展使用，到点就生效,该变量立即赋值（会覆盖前面的值），当变量展开时，优先从前面展开
    * **?=** 仅设置尚未设置的变量
    * **+=** 追加赋值

1. if判断，例如：`foo := $(if this-is-not-empty,then!,else!)`

1. shell 命令调用，例如： `@echo $(shell ls -la)`

## 最佳实践

* 如果没有特殊需求将这个指令放到你指令前，后面你的指令后都加 **##** 来做帮助说明即可

    ```makefile
        help: ## Display this help screen
                @grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'
    ```

* 在工作中，难免需要通过命令行执行一些操作，有些操作不是临时的，可能后续都会用到，或者某些情况下会重复用到

  * 比如：docker重启nginx，进入到docker php 内部而且还需要指定用户，当然可以用tmux和`crtl+r`来补全完成
* 举例说明下，比如我提交的一个[docker gogs仓库的Makefile](https://github.com/miss55/docker-gogs/blob/main/Makefile)

    ```makefile
        SP ?=10022
        HP ?=10880
        DATA ?= "$(shell pwd)/data"
        help: ## Display this help screen
                @grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'
        start: ## run gogs
                nohup docker run --name=gogs_jenson --rm -p $(SP):22 -p $(HP):3000 -v $(DATA):/data   gogs/gogs > gogs.log 2>&1 &
        stop: ## stop gogs
                @echo "$(shell docker ps | grep 'gogs/gogs' && docker stop gogs_jenson||echo 'gogs not found')"
        show: ## show gogs docker command
                @echo "your command  make start SP=${SP} HP=${HP} "
                @echo "ssh port SP=: $(SP)"
                @echo "host port HP=: $(HP)"
                @echo "data path: $(DATA)"
                @echo "docker run --name=gogs --rm -p $(SP):22 -p $(HP):3000 -v $(DATA):/data   gogs/gogs"
        status: ## show status
                @RESULT="$(shell docker ps | grep 'gogs/gogs'||echo 'gogs not found')"; echo $$RESULT
    ```

  * 如果单执行 `make` 就会列出当前makefile有哪些命令

    ```text
        help                 Display this help screen
        start                run gogs
        stop                 stop gogs
        show                 show gogs docker command
        status               show status
    ```

  * `make show` 输出的结果，我们可以看到make start命令具体是做什么的，参数是什么之类的

    ```text
        your command    make start SP=10022 HP=10880
        ssh port SP=: 10022
        host port HP=: 10880
        docker run --name=gogs --rm -p 10022:22 -p 10880:3000 -v /home/jenson/study/data:/data   gogs/gogs
    ```

  * 那么后续我只需要使用`make start`, `make stop`, `make status` 等几个命令即可处理脚本里复杂的指令

* 再比如 [docker node里的makefile](https://github.com/miss55/docker-node/blob/main/Makefile) 以及docker node 的npm run dev 都经过封装，免得每次都输入一长串命令
  * 最后运行前端项目，我也是直接执行make命令即可，安装 `make install` 运行 `make start`, 打包 `make pack`
* 再比如后端项目中定义 `start install reload`等等命令一系列命令。
  * 这样子在cicd时，写cicd的人就不需要管这些命令具体调什么，只需要知道是一个什么动作即可
  * 比如`make reload`，具体命令可以自己去写，比如重新生成config,route缓存，重启队列，重启某些常驻服务等等
  * 而不是 `php artisan reload`，万一生产php不是全局呢？或者全局的那个版本不是你想要的那个呢？
* 再比如golang里打生产包时，需要加一些额外参数，难道你每次打包都要记这些参数吗？
