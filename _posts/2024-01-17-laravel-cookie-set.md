---
layout: post
title: laravel cookie::queue 没添加到响应,没加密，或者不需要加密
tags: laravel cookie php
categories: php
---


* TOC
{:toc}

# laravel cookie::queue 没添加到响应,没加密，或者不需要加密

## api组添加cookie响应中返回

* 原因：`Cookie::queue` 需要 `\Illuminate\Cookie\Middleware\AddQueuedCookiesToResponse::class`中间件配合使用才能生效

* 因为queue后只是加入到 CookieJar `$this->queued`属性中，后并未处理，所以需要后置中间件处理

## Cookie设置了没加密

* 检查下是否加载了 `\App\Http\Middleware\EncryptCookies::class` 这个中间件

## 某些Cookie不需要加密

* 只需在 `\App\Http\Middleware\EncryptCookies::class` 中的 **$except**属性加上该cookie的名字
