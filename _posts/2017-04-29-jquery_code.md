---
layout: post
title: jquery 源码
tags: javscript jquery
categories: common
---

# 一、javscript一种直译式脚本语言，是一种动态类型、弱类型、基于原型的语言，内置支持类型。也是一种函数式语言。
- 特点：
  1. 基于对象
  2. 弱类型
  3. 没有块级作用域（ecmascript6之前吧）
  4. 等等

# 二、jquery 源码研究
> 基于版本为[1.12.0+](http://code.jquery.com/jquery-1.12.0.js)

1、 工厂模式
    - jq一开始就是一个大的自执行匿名函数

  ```javascript
    (function(global, factory){
      if (amd){
        factory( global, true ); // AMD模式
      } else {
        factory( global ); // 非AMD
      }
    })(typeof window !== "undefined" ? window : this, function(window, noGlobal){
        //TODO 具体jq的代码
    });
  ```

- 用了两个匿名方法饶了下，不仔细看真的给绕晕了，
- 工厂方法是为了让jq支持模块化加载。
- 闭包防止防止污染外部或被外部污染
  将全局变量window当作变量传入，其用意是有两点，一是避免通过变量提升的方式找window，加快查找速度；二是window这个字符长度为6，通过形参这么一折腾，就支持压缩了，压缩后长度为1

> 如果在源码被绕晕了不知道这些参数哪个跟哪个，估计是没搞懂函数中的形参、实参。
- 参数noGlobal，意思很明显：不是全局。 最后也是通过判断这个变量是否为undefined类型(判断是否是amd模式)，是才将jquery挂到window上
- 旧版的加载是

```javascript
  (function(window, undefined) {
    #TODO
  })(window)
```
- 这里的传入undefined是为了防止里面用到的undefined被外部污染


2、 Query函数
  ```javascript
    jQuery = function( selector, context ) {
      return new jQuery.fn.init( selector, context );
    }
  ```
- 通过new jq fn中的init。 那么fn是什么鬼，往下看就会看到 jQuery.fn = jQuery.prototype 这个赋值，其实fn就是jq的prototype，这么做的原因是长度为9,太长了~。
- 查阅fn中init函数,这个才是jq真正的构造器。解决我们使用jquery时传入各种类型参数。其中如果匿名函数(延迟加载这个),判断rootjQuery.ready是否存在，存在就执行ready压栈，等ready再执行，否则就立刻执行。剩下的都是去构造jquery对象， 
- 我们用jq一般是通过传class，标签名去查询，其实都是绑定到$(document)对象中去find，最后是Sizzle去查询，然后返回jq对象。 
- id则直接通过自带的 getElementById
- 如果要提高jq的性能，可以将第一次查询到的对象赋值到一个变量。

3、pushStack方法：
- 用来存储我们用选择器查找到的节点，将所有节点合并到一个数组中 ，添加两个上下文属性
- 这个方法很重要，因为后面很多方法都要通过调用该方法生成新的jq

4、 merge方法
- 合并两个数组。
- 第一行的 ```var len = +second.length``` 强制将length转为数组
- 将第二个参数所谓的数组合并到第一个参数数组上，因为有些没有提供length属性
- ```if ( len !== len ) {```这个有意思。 如果len不存或者是非数字，在被强转了之后就是 NaN，那么等式成立，这坑


5、 each方法
  - 使用对象冒充的两种方法 call和apply，区别是apply可以将参数继续传递，不用看个数
  - 两个for循环，一个是数组一个是对象
  - 如果返回值为false则立刻终止循环

6、 extend 方法
- 功能就是用来做数组或对象拷贝。主要点就是软拷贝和深拷贝。
- 深拷贝是一直递归调用extend方法，拷贝其对象或数组的值从而消除它们之间的引用，反之就是软考贝


7、 class2type 对象
- 用来放类对象toString与类型映射 ```toString.call(obj) ```
- 这是jquery type中使用的方法
- ```javascript
  [object Array]   : "array"
  [object Boolean] : "boolean"
  [object Date]    : "date"
  [object Error]   : "error"
  [object Function]: "function"
  [object Number]  : "number"
  [object Object]  : "object"
  [object RegExp]  : "regexp"
  [object String]  : "string"
  ```

8、 globalEval
  - 在全局中执行一段js代码。
  - 旧版是如果strict模式就在header添加一个script节点，然后再删除，从而达到执行该js代码。

9、 grep
- ```javascript
  grep: function( elems, callback, invert ) {
    var callbackInverse,
      matches = [],
      i = 0,
      length = elems.length,
      callbackExpect = !invert;
    // Go through the array, only saving the items
    // that pass the validator function
    for ( ; i < length; i++ ) {
      callbackInverse = !callback( elems[ i ], i );
      if ( callbackInverse !== callbackExpect ) {
          matches.push( elems[ i ] );
      }
    }
    return matches;
  }
  ```
- 使用过滤函数过滤数组元素。
- 此函数至少传递两个参数：待过滤数组和过滤函数。过滤函数必须返回 true 以保留元素或 false 以删除元素。
- invert 用来转换过滤逻辑。 默认不传的话是undefined。 通过加！将invert转成true;也就是callbackExpect默认是 true。
  callback回调加!，也是防止callback没有返回值,这样也将返回结果反转。默认callback返回true是要保留的, 则callbackInverse是false。
  > 这么做就是为了确保判断的类型全都是boolean值

10、 map方法
  - 将数组或者对象通过传进的回调函数生成新的数组。
  - callback返回值不null就会放入新数组

11、 proxy方法
- 字面意思就是代理，跟对象冒充作用一样。
- 普通的callback是不需要使用这种方法，要使用这个方法的前提是，你的callback是来自一个对象，里面的一些属性需要原来的对象的。
- 里面这句很有意思proxy.guid = fn.guid = fn.guid || jQuery.guid++; 如果fn.guid 存在，就不去增加全局的jQuery.guid++;

12、 addHandle() 函数
- ```javascript
  function addHandle( attrs, handler ) {
    var arr = attrs.split("|"),
      i = attrs.length;
    while ( i-- ) {
      Expr.attrHandle[ arr[i] ] = handler;
    }
  }
  ```
- 初看没看懂 i = attrs.length,的用意。如果常规的话应该是arr.length。
- 将其提出来运行了后，发现区别就是返回结果对象中会多个undefined属性。
  > 作者为了将函数的变量定义放在同一行，可真的

13、 createCache()函数
- 用来生成单例的缓存。
- 值通过key绑定到内置函数cache,当成cache的一个属性

14、 Callbacks回调函数(注释已经说得很清楚) 有几个选项：
- once 就是 fire只触发一次。而后面都不会。
- memony 会记住上一次最后一个fire的值，然后当你add function时，会触发这个function执行上次fire的值。 fire的时候，前面注册的function都会触发。
- 例子
  ```javascript
    // fn1和fn2都是 用来输出信息
    function fn1( value ){
      console.log( 'fn1:'+value );
    }
    var callbacks = callback('memory');
    callbacks.add( fn1 );
    callbacks.fire( "foo!" );
    callbacks.fire( "bar!" ); 
    console.log('------');
    callbacks.add( fn2 );
    callbacks.fire( "three!" ); 
    // fn1:foo!
    // fn1:bar!
    // -------
    // fn2: bar!
    // fn1:three!
    // fn2:three!
  ```
- unique: add重复的function只触发一次。
- stopOnFalse : callback返回false，将停止调用队列后边的回调函数

15、 noConflict方法
- 解决jq变量冲突，执行该方法，将赋值好的jquery变量还原成原来的。然后返回jq。
- 这给了我们一个启示，如果遇到有些时候我们不想改变其变量名和变里面的东西，但又想在其中加入新的东西。比如我想要window.alert调用时console也输出
- 
  ```javascript
    (function(win){
      var _alert = win.alert
      win.alert = function(val) {
        console.log(val)
        _alert(val)
      }
    })(window)
  ```

> 还有很多很多，jq的编程风格给了我对弱类型语言编程有很大的启示，比如变量类型确定性，避免在不确定类型中各种比较等等


