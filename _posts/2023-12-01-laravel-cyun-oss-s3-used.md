---
layout: post
title: laravel ctyun oss s3文件上传
tags: php laravel cyun oss s3
categories: php
---


* TOC
{:toc}

# laravel ctyun oss s3文件上传

## 介绍

1. 看了下官方提供的[demo](https://gitee.com/ctyun-xstore/ctyun-xstore-sdk-demo/tree/master/xos-php-demo)后，其实用的是aws的S3。所以我直接就放弃使用官方demo，直接看laravel存储系统里有关与[AWS S3](https://learnku.com/docs/laravel/10.x/filesystem/14865#amazon-s3-compatible-filesystems)使用，然后按照文档将相关参数配置上

## 使用

1. 检查文件是否已存在 `\Storage::disk('s3')->fileExists($path)`
1. 上传文件 `\Storage::disk('s3')->putFileAs($path , $file , $fileName)`
1. 更多其他操作直接看官网文档或者看Storage相关的代码 `vendor/laravel/framework/src/Illuminate/Filesystem/AwsS3V3Adapter.php`

## 总结

1. 看源码看依赖还是有好处的
