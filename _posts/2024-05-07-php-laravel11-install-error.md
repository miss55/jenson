---
layout: post
title: laravel 11 install error &colon; Your requirements could not be resolved to an installable set of packages
tags: laravel cookie php
categories: php
---

* TOC
{:toc}

# laravel 11 install error &colon; Your requirements could not be resolved to an installable set of packages

## 情况

在安装laravel 11.0+ 时，突然报依赖有问题，报错内容为：

```text
Your requirements could not be resolved to an installable set of packages.

Problem 1
  - laravel/framework[v11.0.0, ..., v11.2.0] require fruitcake/php-cors ^1.3 -> found fruitcake/php-cors[dev-feat-setOptions, dev-master, dev-main, dev-test-8.2, v0.1.0, v0.1.1, v0.1.2, v1.0-alpha1, ..., 1.2.x-dev (alias of dev-master)] but it does not match the constraint.
  - Root composer.json requires laravel/framework ^11.0 -> satisfiable by laravel/framework[v11.0.0, ..., v11.2.0].
```

## 解决

1. 检查 `fruitcake/php-cors` 的最新版本（实际上已经是1.3了），为什么会报没有匹配呢？
1. 检查当前使用的镜像源（怀疑国内源没有更新，某阿里云的源经常出这种事，docker镜像源之前也有过这种情况，拉lasted版本的，结果版本很旧）
1. 如果不是官方源，试试切换到其他源，然后再执行安装
1. 镜像源管理推荐使用 `composer global require slince/composer-registry-manager`
    1. 列出所有源 `composer repo:ls`
    1. 使用某个源：`composer repo:use [use-repo]`
1. 比如我这边选择腾讯源： `composer repo:use tencent`

### 参考

1. [Composer 国内加速，修改镜像源](https://learnku.com/articles/15977/composer-accelerate-and-modify-mirror-source-in-china)