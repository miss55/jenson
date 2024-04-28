---
layout: post
title: docker compose alias
tags: docker docker-compose
categories: tool
---

* TOC
{:toc}

# docker compose alias

新版的docker内直接包含 **docker-compose** 命令，如果不习惯 `docker compose` 这种书写方式

解决方式：自定义一个shell 即可，名字为 docker-compose

> 别忘了添加可执行权限 **sudo chmod +x docker-compose**

代码示例:

```bash
#!/bin/bash

# 建议位置在  /usr/local/bin
docker compose $*

```
