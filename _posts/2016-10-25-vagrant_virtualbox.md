---
layout: post
title: vagrant+virtualBox搭建自己的开发环境
tags: vagrant virtualBox
categories: tool
---

* TOC
{:toc}


## 1、为什么选择vagrant+virtualBox
<p class="descript">
可用脚本进行配置,创建自动化虚拟环境。通过vagrant封装好开发环境, 然后分发给每个团队成员, 可以不限制每个成员的系统,使用统一开发环境。从而避免不同环境导致各种bug。
</p>

<p class="descript">
以全文索引迅搜为例, 迅搜只有linux版的,如果本地开发环境是window版,这就没法开发了,就算将全文索引安装至内网服务器中,其sdk的某些功能对window有些限制。并且团队成员的开发环境不统一,会造成或多或少的环境差异的bug。比如php版本。
</p>

## 2、准备
1. **下载vagrant 和 virtualBox**
    - virtaulBox: <a href="https://www.virtualbox.org/wiki/Downloads" target="_blank">https://www.virtualbox.org/wiki/Downloads</a>

    - vagrant: <a href="https://www.vagrantup.com/downloads.html" target="_blank">https://www.vagrantup.com/downloads.html</a>


2. **下载vagrant box 镜像**
    - 可以从vagrant库中找一个(最好用下载工具下,否则速度有点慢) http://www.vagrantbox.es/

    - 或者可以从github找到相关的box 然后用其安装比如：https://github.com/rlerdorf/php7dev



3. **搭建**
    - 安装virtualBox
    - 安装vagrant
    - 添加镜像 ```vagrant box add BOX_NAME path.box```
      - 比如现在在d盘目录下, 添加一个在d盘box目录下的一个precise64.box 命名为ubuntu64 
      - ```vagrant box add ubuntu64 precise64.box```

    - 初始化 ```vagrant init BOX_NAME```

    - 配置 Vagrantfile
      - 添加网络映射
        - 比如 ```config.vm.network "private_network", ip: "10.2.2.168"``` 
      - 目录映射(可以在虚拟机创建完后在映射)
        - ```config.vm.synced_folder "../data", "/vagrant_data"```
      - 硬件分配
        - 可以适当分多点,默认内存只有512M
    - 启动 ```vagrant up```

4. **遇到的问题与解决**
    1. window 下遇到 "Vagrant attempted to execute the capability 'mount_virtualbox_shared_folder' on the detect guest OS 'darwin', but the guest doesn't support that capability. This capability is required for your configuration of Vagrant. Please either reconfigure Vagrant to avoid this capability or fix the issue by creating the capability."
        - 版本对不上，直接重装vagrant 和virtualbox。

    2. 主机与虚拟机互ping问题
        - 可能是防火墙问题,关闭防火墙试试。
        - 如果主机ping不通虚拟机,但虚拟机可以ping同主机,那么有可能是ip映射有问题,换个ip段再试

5. **相关推荐**
    - <a href="https://blog.csdn.net/zm_21/article/details/9410277/" target="_blank">vagrant 知识澄清与杂症诊治</a>
    - <a href="https://www.iteye.com/blog/topmanopensource-2002302" target="_blank"> vagrant 命令</a>

