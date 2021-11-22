---
layout: post
title: window10 wsl docker
tags: windows10 wsl docker
categories: wsl
---
> 


### 0. [wsl 安装](https://docs.microsoft.com/en-us/windows/wsl/install)
### 1. 安装ubuntu 20.4
### 2. 迁移虚拟硬盘
1. 关闭wsl
    ```bat
      wsl --shutdown
    ```
1. 查看wsl信息
    ```bat
      wsl -l -v
      Name            STATE           VERSION
      Ubuntu-20.04    Running         2
    ```
1. 导出虚拟机 wsl --export <DistroName> <PathtoTarArchive>
    ```bat
      wsl --export Ubuntu-20.04 D:\wsl\ubuntu-20.04\Ubuntu-20.04.tar
    ```
1. 注销原有的虚拟机  wsl --unregister <DistroName>
    ```bat
      wsl --unregister Ubuntu-20.04
    ```
1. 导入虚拟机至新位置 wsl --import <DistroName> <PathToDistroNewDirectory> <PathToTarArchive>
    ```bat
      wsl --import Ubuntu-20.04  D:\wsl\ubuntu-20.04\ D:\wsl\ubuntu-20.04\Ubuntu-20.04.tar
    ```
1. 设置默认用户 (指定原有虚拟机用户)
    ```bat
      ubuntu2004.exe config --default-user xxxx
    ```
### 3. 安装命令行工具[补充] Windows Terminal Preview 
1. Microsofe Store 搜索安装
### 4. 指定源
1. [使用阿里源](https://developer.aliyun.com/mirror/ubuntu?spm=a2c6h.13651102.0.0.20a61b11QBIo9k)
1. 打开```/etc/apt/sources.list```
    ```shell
      vim /etc/apt/sources.list
    ```
1. 替换```http://archive.ubuntu.com/``` 为 ```mirrors.aliyun.com```
    ```shell
      # 冒号 然后粘贴
      %s/http:\/\/archive.ubuntu.com/http:\/\/mirrors.aliyun.com/g
    ```
### 5. 安装[docker-ce](https://developer.aliyun.com/mirror/docker-ce?spm=a2c6h.13651102.0.0.48dc1b11QTUriI)
1. [另一版参考](https://mirrors.tuna.tsinghua.edu.cn/help/docker-ce/)
1. 卸载旧版本(如果有)
    ```shell
      sudo apt-get remove docker docker-engine docker.io
    ```
1. 安装必要的一些系统工具
    ```shell
      sudo apt-get update
      sudo apt-get -y install apt-transport-https ca-certificates curl software-properties-common
    ```
1. 安装GPG证书
    ```shell
      curl -fsSL https://mirrors.aliyun.com/docker-ce/linux/ubuntu/gpg | sudo apt-key add -
    ```
1. 写入软件源信息
    ```shell
      sudo add-apt-repository "deb [arch=amd64] https://mirrors.aliyun.com/docker-ce/linux/ubuntu $(lsb_release -cs) stable"
    ```
1. 更新并安装Docker-CE
    ```shell
      sudo apt-get -y update
      sudo apt-get -y install docker-ce
    ```

1. 如果是其他类型cpu [请直接看](https://mirrors.tuna.tsinghua.edu.cn/help/docker-ce/)
1. 更新
    ```shell
      sudo apt-get update
      sudo apt-get install docker-ce
    ```
1. 启动服务
    - sudo service docker start
    - sudo service docker restart
    - sudo service docker stop

### 6. 修改docker源
  - [阿里云源](https://cr.console.aliyun.com/cn-hangzhou/instances/mirrors)
    ```
        sudo mkdir -p /etc/docker
        sudo tee /etc/docker/daemon.json <<-'EOF'
        {
          "registry-mirrors": ["https://qhezhclp.mirror.aliyuncs.com"]
        }
        EOF
        sudo systemctl daemon-reload
        sudo systemctl restart docker
    ```
### [docker compose](https://docs.docker.com/compose/install/)
1. 下载稳定版本包
    ```shell
      sudo curl -L "https://github.com/docker/compose/releases/download/1.29.2/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    ```
1. 添加可执行权限
    ```shell
      sudo chmod +x /usr/local/bin/docker-compose
    ```
### 其他
1. [window下工具](https://nickjanetakis.com/blog/a-linux-dev-environment-on-windows-with-wsl-2-docker-desktop-and-more)

### vscode 使用
1. [安装 remote wsl](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-wsl)
1. ubuntu系统中打开项目
    ```shell
      code .
    ```