---
layout: post
title: antd input 搜索忽略中文输入法中间输入过程，或者说识别中文输入法
tags: laravel cookie php
categories: php
---

* TOC
{:toc}

# antd input 搜索忽略中文输入法中间输入过程，或者说识别中文输入法

> 起因，在使用 antd的 AutoComplete 扩展时，发现自动补全会将输入法中间输入的过程也触发，然后找解决方法，找到了 composition 相关触发事件，想着用到 AutoComplete组件，发现并没有相关接口，遂去使用Input组件，结果也出了bug

## input 中 onCompositionEnd事件触发bug

在使用 **onCompositionStart**  **onCompositionEnd**  两个事件来判断输入法是否完成，结果 **onCompositionStart**一直触发，**onCompositionEnd**则一直不触发

找了一圈也没有为什么，想了下，这么明显的坑，看来不好解决，可能时react内部问题，所以就换别的思路。

## 通过onChange nativeEvent.isComposing 和 nativeEvent.data判断来解决

isComposing 可以判断当前输入是通过输入法输入模式

如此的话，就只剩下判断输入法是否完成与否。根据我的业务逻辑，只要输入中没有英文就完成，情况大概如下例子

```javascript

onChange={(event) => {
    const nativeEvent = event.nativeEvent
    const value = event.target.value
    if (nativeEvent['isComposing']) {
      // 判断是否存在英文，存在则判定为输入法 //data
      if (!/[a-zA-Z]/.test(nativeEvent['data'] || '')) {
        //触发搜索
        props.onSearch(value)
      }
    } else {
      // 触发搜索
      props.onSearch(value)
    }
    // 如果动态设置了value的话 写回value
    setValue(value)
  }}
```
