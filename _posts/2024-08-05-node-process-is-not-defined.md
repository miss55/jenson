---
layout: post
title: node 报 process is not defined，原因分析与解决
tags: node vue react webpack
categories: frontend
---

* TOC
{:toc}

# node 报 process is not defined，原因分析与解决

今天用taro脚手架起了个项目，也没做什么，加了个环境变量，然后想打印出来看下，结果就报了 `process is not defined`。一开始我以为是process需要额外的包处理。
仔细分析了下其过程，发现是我对其误解了。

那么我们来研究下为什么会出现 `process is not defined`

## 原因分析

实际上我们跑的开发环境有两个阶段，一个是**node处理阶段**，一个是**输出成浏览器访问阶段**。你想获取process的话，应该是在node处理阶段，而我们报的错却是在浏览器访问阶段。

有些同学就会说，我以前跑的时候都没问题，怎么换了个项目就出现了？

ok，实际上是在node处理阶段，process对象直接生成变量的值，比如我这里面的 process.env.NODE_ENV 实际上在浏览器上看到的应该是  `development`，既然如此那为什么还会报 `process is not defined`，你可以可以在浏览器调试下看看其源码

原因：**就是node处理阶段没找到 你设置的环境变量，所以就原样输出，浏览器阶段肯定没有process这个属性，自然就报错**

## 处理方法

1. **看看你的环境变量有没有设置，会不会拼写错了**
2. 某些框架只限制特定前缀的环境变量，请仔细阅读相关文档
