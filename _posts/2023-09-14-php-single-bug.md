---
layout: post
title: php 单例继承后存在的bug与解决
tags: php
categories: backend
---

* TOC
{:toc}

# php 单例继承后存在的bug与解决

## 先上代码

```php
    // 封装单例的类
    class BaseService
    {
        protected static $singleton;

        /**
         * @return $this
         */
        public static function getSingleton()
        {
            if (!static::$singleton) {
                static::$singleton = new static();
            }
            return static::$singleton;
        }

        private function __constructor()
        {}

        private function __clone()
        {}
    }

    // 继承BaseService的 SingleTestService 1
    class SingleTestService extends BaseService
    {
        //use SingleTrait;
        public function dump()
        {
            dump('hi this is single test services');
        }
    }

    // 继承BaseService的 SingleTestService 2
    class SingleTestService2 extends BaseService
    {
        //use SingleTrait;

        public function dump()
        {
            dump('hi this is single test services2');
        }
    }

    // 测试调用
    $single1 = SingleTestService::getSingleton();
    $single2 = SingleTestService2::getSingleton();
    $single1->dump();
    $single2->dump();
    // 猜猜输出什么
    // 都输出了 hi this is single test services
```

## bug

就是继承后，子类会共享同一个静态变量

解决：可以将 `protected static $singleton` 换成 `protected static $singletons` 数组

```php
    trait Singleton
    {
        //使用数组存起来
        protected static $singletons;

        /**
         * @param mixed ...$args
         * @return $this
         */
        public static function getSingleton(...$args)
        {
            $class = static::class;
            if (!empty($args)) {
                $class .= md5(self::getArgString($args));
            }
            if (empty(static::$singletons)) {
                static::$singletons = [];
            }
            if (!isset(static::$singletons[$class])) {
                static::$singletons[$class] = new static(...$args);
            }
            return static::$singletons[$class];
        }

        // 如果以参数为单例的话
        private static function getArgString($args)
        {
            $string = '';
            foreach ($args as $arg) {
                $string .= is_array($arg)
                    ? serialize($arg)
                    : (is_object($arg)
                        ? spl_object_id($arg)
                        : (string)$arg);
            }
            return $string;
        }
    }

```
