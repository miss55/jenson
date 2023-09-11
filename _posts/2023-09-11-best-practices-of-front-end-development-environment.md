---
layout: post
title: 前端开发环境最佳实践
tags: docker node
categories: tool
---

* TOC
{:toc}

# 前端开发环境最佳实践

1. 情况
1. 选择
1. 具体操作

## 情况

目前主流的前端开发都是围绕着Node.js开发，文本编辑器或集成开发环境大多为Visual Studio Code、Sublime Text、Atom、WebStorm
文本编辑器或集成开发环境的操作系统大多数应该是window和mac
大多数前端开发应该都是直接通过当前操作系统来安装Node.js

### 先说说通过当前系统安装Node.js存在的问题

1. Node版本同时运行问题
1. 本地开发对本地硬件资源的消耗
1. 突然居家办公，公司电脑的代码如何搞
    > 当然下班前代码都提交就行了
1. 居家办公时，还得搭建一次，比如有些环境还要求安装其他应用

## 如果通过vscode进行远程开发

1. 优点
    * 解决环境多次部署问题
    * 减轻本地计算机的负担

1. 缺点
    * 依赖网络：比如网络不稳定之类的
    * 安全性：可能对网络进行一些安全性的配置，比如添加vpn，访问控制等等

虽然远程开发还是无法解决Node多版本同时运行问题，但是解决了环境重复部署和本地计算机负担（虽然对现在的电脑来说不是事，有可能服务器的硬件更烂）

## 如果远程开发+docker一起呢？

将Node.js所有开发环境都封装到docker内，那么Node.js的版本跟宿主机就完全没关系了。
具体的Node Docker如何创建请参考[仓库docker-node](https://github.com/miss55/docker-node/blob/main/README-zh.md)

1. 针对docker镜像安装，我已经对其作了一个友好安装，只需要 make 并指定响应版本即可自动安装
1. 再根据自己所使用的库，将react或vue里的文件放置到开发目录，**注意env.development.example 可能被覆盖，建议这个复制进去**
1. 当然有些不属于常规开发的，建议调整脚本来实现即可

如果想要使用vscode进行远程开发，其实很简单 [vscode将这一整个都打包到一个扩展里 Remote DevelopmentPreview](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.vscode-remote-extensionpack)

> 当然如果有特殊需求的，可以自己写一个Dockerfile，将所需的软件应用写进去，这样子项目环境到时候就不会不清不楚，裁你的时候也没有顾虑 &#x1F631; ~
