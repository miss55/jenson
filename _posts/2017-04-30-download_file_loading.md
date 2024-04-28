---
layout: post
title: 导出excel时实现loading效果
tags: php js excel
categories: common
---

* TOC
{:toc}

# 导出excel时实现loading效果

> 在一次导出比较长的excel时，发现导出2-3秒后，使用者会以为没点到，会重复按

## 第一种方法：另一个页面打开

## 第二种方法：设置状态导出时可以加loading、按钮置为不可点击

* 状态可以设置，但什么时候解除呢？
* 取巧的办法是直接loading个4-5s就重置状态
* 不取巧的话，就得让服务端响应通知
* 如果不额外发送请求是否能够解决？
* 还真有，因为刚刚的下载请求
* 无论导出成功或者失败都会有响应
* body是不可能放额外的，但是响应头可以，放到cookie里，那在点击下载的时候就可以去监听cookie变化即可
