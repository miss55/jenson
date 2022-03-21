---
layout: post
title: 将laravel的dd拎出来
tags: php laravel
categories: backend
---

* TOC
{:toc}

> dd 其实最后是调用[symfony/var-dumper](https://github.com/symfony/var-dumper)中的CliDumper或者HtmlDumper

# 步骤
## 1. 添加依赖 ```s"symfony/var-dumper": "~3.3",```
> 关于版本的话可以查看具体版本compose的依赖，看是否有限制

## 2. 装完后试试dump方法
> 如果自己框架没有dump方法的话，可以试试symfony自带的dump方法。

## 3. 替换掉symfony html的样式 ， 我们可以重写[HtmlDumper类](https://github.com/laravel/framework/blob/5.5/src/Illuminate/Support/Debug/HtmlDumper.php)

## 4. 使用```debug_backtrace```方法给我们输出方法定位
```php
  # 放在方法中的话，需要定位到调用方法位置，只需拿到debug中第二个位置的信息即可
  $debugs = debug_backtrace(DEBUG_BACKTRACE_IGNORE_ARGS, 2);
  $debug = $debugs[1];
  echo("file: {$debug['file']}, line: {$debug['line']}");
```

## 5. 完整的dd
```php
  if (! function_exists('dd')) {
      /**
       * Dump a value with elegance.
       *
       * @param  mixed  $value
       * @return void
       */
      public function _dd_echo($value)
      {
          if (class_exists(CliDumper::class)) {
              # TODO VarCloner和CliDumper自己通过命名空间引入
              # HtmlDumper可以使用上面3步骤的那个文件
              $dumper = in_array(PHP_SAPI, ['cli', 'phpdbg']) ? new CliDumper : new HtmlDumper;
              $dumper->dump((new VarCloner)->cloneVar($value));
          } else {
              var_dump($value);
          }
      }
      /**
       * Dump the passed variables and end the script.
       *
       * @param  mixed  $args
       * @return void
       */
      function dd(...$args)
      {

          foreach ($args as $x) {
              _dd_echo($x);
          }
          $debug = debug_backtrace(DEBUG_BACKTRACE_IGNORE_ARGS, 2)[1];
          _dd_echo("file: {$debug['file']}, line: {$debug['line']}");
          die(1);
      }
  }

```