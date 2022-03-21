---
layout: post
title: php构造方法和析构方法
tags: php
categories: backend
---

* TOC
{:toc}

## 定义
1. 构造方法： 类在创建新对象时先调用的方法，适合在使用对象钱做一些初始化工作
2. 析构方法：在到对象的所有引用都被删除或者当对象被显式销毁时执行，就是看有什么操作是贯穿整个对象

## 使用场景
- 构造方法就比较好理解，可以做一些对象初始化工作，但析构方法，很大部分开发都没去使用。
- 析构方法使用场景：比如用来处理一些资源需要关闭，则可以使用析构方法隐式操作；比如需要在类销毁，比如某些在不确定环节处理的操作，可以绑在析构方法中
- 例子
    ```php
    class Destructor
    {
        private $fp;
        private $list; # 测试用的list

        public function __construct($file)
        {
            $this->list = ['in __construct'];
            if (! is_file($file)) {
                throw new \Exception("文件{$file}不存在");
            }
            $this->fp = fopen($file, 'r');
        }

        public function generateRows()
        {
            # 循环输出每一行文件
            $this->list[] = 'generateRows';
            while (true) {
                $rs = fgets($this->fp, 1024);
                if ($rs === false) {
                    break;
                }
                yield $rs;
            }
        }

        public function step1()
        { 
            # 测试用
            $this->list[] = 'xxxx1';
        }

        public function step2()
        {
            # 测试用
            $this->list[] = 'xxxx2';
            throw new \Exception("xxx 出错了");
        }

        private function saveList()
        {
            if (empty($this->list)) {
                return ;
            }
            # save this list
            unset($this->list);
        }

        public function __destruct()
        {
            $this->saveList();
            if ($this->fp) {
                // 关闭文件资源， 即使途中出现异常退出对象
                // 也会调用
                fclose($this->fp);
            }
        }
    }

    $de = new Destructor($filePath);
    foreach($de->generateRows() as $row) {
    echo $row, "<br>";
    }
    ```