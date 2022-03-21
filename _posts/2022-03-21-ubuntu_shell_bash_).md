---
layout: post
title: Ubuntu shell 声明数组报错
tags: linux shell
categories: shell
---

* TOC
{:toc}

# Ubuntu shell 数组申明报错
### 报错
```shell
  sh test.sh 
  #.sh: 9: Syntax error: "(" unexpected
```
### 原因
ubuntu 的/bin/sh 是默认连接的dash

### 解决
/bin/bash