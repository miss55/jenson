---
layout: post
title: 关于html5 history接口的一个小实例
tags: javscript html5
categories: common
---
#### 
> 场景:当你在app里浏览图片时，点击图片，改图片会放大，点击手机的返回键的时候会自动关闭。如果用网页来实现，应该怎么实现！
###### 有三种种实现方法:
- 1、使用最常规的方法实现，通过页面跳转，这种效果最烂，用户体验可以说渣渣
- 2、通过锚点中的#号去实现(没去试)
- 3、通过h5的history接口实现
> 注：可能有部分浏览器兼容问题，所以我使用的是一个第三方的库文件
  - [https://github.com/browserstate/history.js](https://github.com/browserstate/history.js)
  - 作者的github上已经有 很多demo了，但如果没看懂的话 可以看看这篇
  - [关于history.js的使用](http://www.cnblogs.com/songbyjson/p/4886615.html)
  
###### history 主要接口
- 历史变动触发方法 ```History.Adapter.bind(window, 'statechange', ()=> {})```
- 历史压栈 ```History.pushState```
- 历史替换 ```History.replaceState```
- 历史返回 ```History.back()```
- 历史跳转 ```History.go(2)```

###### 例子：
  - 关于history这个接口， 这要是人工压入的历史记录都会触发一个叫statechange的事件。 
  - 举个例子:
    就像上面那张图片一样， 当你点击这张图片的时候，我手动压入历史记录操作，此时就触发触发statechange事件；
    当你点击返回上一页的时候，也会触发这个statechange事件;
    返回上一页后，点击前进也是一样会触发statechange事件;
    基本可以总结为，只要跟我们认为压入的记录有关的都会触发这个statechange事件，并且不会刷新页面。
