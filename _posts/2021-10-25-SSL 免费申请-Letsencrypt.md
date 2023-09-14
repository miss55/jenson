---
layout: post
title: 转载 SSL 免费申请-Letsencrypt
tags: ssh https
categories: tool
---

* TOC
{:toc}

> 转载：[作者：adongs 标题：SSL 免费申请-Letsencrypt) 编写](https://adongs.com/articles/2019/08/12/1565606243689.html)


## 前言

Let's Encrypt是非营利性互联网安全研究组（ISRG）为您提供的免费，自动化和开放的证书颁发机构

### 方法一(前提是nginx是apt-get安装的默认目录下)

```shell
# 如果提示权限不足,在命令前面加上sudo即可

# 添加源
 add-apt-repository ppa:certbot/certbot

# 更新列表
 apt-get update

# 安装插件
 apt-get install python-certbot-nginx

# 在nginx配置文件中加入如下(/etc/nginx/sites-available/default)

server {
   listen 80;
   listent [::]:80;
   # server_name 是你需要申请的域名,多个以空格隔开
   server_name www.xxx.com xxx.com;
}

# 保存测试一下,确定修改对了
nginx -t

# 修改正确会有如下提示
nginx: the configuration file /etc/nginx/nginx.conf syntax is ok
nginx: configuration file /etc/nginx/nginx.conf test is successful

# 重启nginx
 service nginx reload

# 申请命令(-d你需要申请的域名,多个域名在后后面追加 -d www.xxx.com)
certbot --nginx -d www.xxx.com -d xxx.com

# 然后会有如下提示
```
![placeholder](https://adongs.github.io/assets/img/blog/ssl/1.png "ssl申请")

### 第二种安装方式(适用于没有安装nginx,或者安装位置不是默认位置)

```shell

# 如果提示权限不足,在命令前面加上sudo即可

# 添加源
 add-apt-repository ppa:certbot/certbot

# 更新列表
 apt-get update

# 安装插件
apt-get install python-certbot-apache

# 安装 letsencrypt
apt-get install letsencrypt

# 如果有多个域名 在后面追加 -d www.xxx.com ,email:你自己的邮箱
letsencrypt certonly --agree-tos --email test@qq.com -d www.xxx.com -d xxx.com

# 然后会有如下提示
```
![placeholder](https://adongs.github.io/assets/img/blog/ssl/2.png "ssl申请")

### 续签
```shell
# 续签命令
sudo certbot renew --dry-run
```


### 由于 Letsencrypt 证书有效期为3个月,所以我们需要添加一个定时任务进行定时更新

```shell
# 添加定时任务
crontab -e

# 添加如下内容
0 22   * * 6   root  certbot rennew --dry-run  && /opt/nginx/bin/nginx -s reload

#保存,重新载入
sudo service cron restart  

# 查看定时任务列表
crontab -l
```