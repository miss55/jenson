---
layout: post
title: 监听pc大小写变化
tags: javascript
categories: frontend
---

* TOC
{:toc}

# 监听pc大小写变化

> 一般在用户输入密码时，想有个比较友好的提示
> 查了api后，浏览器是没有提供接口说当前字符模式是大写状态还是小写状态。

既然不能知道，只能曲线救国了。提供的接口有键盘输入事件，并且还能知道按了哪个键。所以我们监听用户输入两类键，一类是Caps Lock键，另一类是[a-z]键。

## 1、在已知当前大小写状态，当用户按下Caps Lock键(key=20)，我们就能知道当前大小写状态
>
> 全局监听是可以监听当前页面，但不排除用户离开当前页面切换大小写

## 2、用户输入[a-z]

我们判断他的范围keyCode在[65-90],
然后将key转成ascii码，对比是大写还是小写,大写ascii[65-90]，小写ascii[97-122]

## 3、如果用户使用shift+字母也可以将小写输出为大写

### 代码例子

```javascript
//监听大小写。。。。
(function() {
  //必须全局监听
  var isCapital = -1; //是否大写 -1:无状态、0:小写、1:大写
  jQuery(window).keyup(changeCapsLock);//监听全局
  //监听某个input
  jQuery('input', loginForm).on('keyup', function(e){
      var lastVal = '';
      if (e.keyCode >= 65 && e.keyCode <= 90) {
          lastVal = jQuery(this).val().substr(getCursortPosition.call(this,this)-1, 1).charCodeAt(0);
          if ( lastVal == e.keyCode) {
              e.shiftKey ? '' : isCapital = 1;
              tipsCapsLock.call(this);
          }else{
              e.shiftKey ? '' : isCapital = 0;
              tipsCapsLockClose.call(this)
          }
      } else {
          changeCapsLock.call(this, e);
      }
  });
  //是否切换大小写
  function changeCapsLock(e){
      e.stopPropagation();
      if (e.keyCode !== 20) {return;}
      switch(isCapital){
          case -1:
              break;
          case 0:
              isCapital = 1;
              tipsCapsLock.call(this,this);
              break;
          case 1:
              //关闭
              tipsCapsLockClose.call(this);
              isCapital = 0;
              break;
      }
  }
  //提示大小写
  function tipsCapsLock(){
      console.log('大写锁定已打开，可能会使您输入错误的密码。');
  }
  function tipsCapsLockClose(){
      console.log('大写已关闭');
  }
  //得到当前输入光标的位置
  function getCursortPosition (ctrl) {
      var CaretPos = 0;   // IE Support
      if (document.selection) {
          ctrl.focus ();
          var Sel = document.selection.createRange ();
          Sel.moveStart ('character', -ctrl.value.length);
          CaretPos = Sel.text.length;
      }
      // Firefox support
      else if (ctrl.selectionStart || ctrl.selectionStart == '0')
          CaretPos = ctrl.selectionStart;
      return (CaretPos);
  }
})()



```
