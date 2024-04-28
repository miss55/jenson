---
layout: post
title: php与mysql事务代码精简
tags: php mysql 
categories: backend
---

* TOC
{:toc}

# php与mysql事务代码精简

> mysql事务谁不会写，但代码写得漂亮就不一定了
> 不过还是需要注意，尽快速提交事务

* 一般比较精简的写法大概是，如果exception不处理的话可以去掉

  ```php
    $db = getDb();
    $flag = false;
    try {
      $db->startTransation();
      # todo save
      $db->commit();
      $flag = true;
    } catch(Exception1 $e) {
    } catch(Exception2 $e) {
    } finnally {
      if(!$flag) {
        $db->rollback();
      }
    }
  ```

* 经过我的精简，我将事务封装成一个类

  ```php
    class Transation {
      private $flag;
      private $db;
      
      public __construct() {
        $this->flag = false;
        $this->db = getDb(); # 自己补充db类
        $this->start();
      }

      private function start() {
        $this->db->startTransation();
      }

      public function success() {
        $this->flag = true;
      }

      public function finally() {
        if($this->flag) {
          $this->db->commit();
        } else {
          $this->db->rollback();
        }
      }
    }
    # 那么真正的业务中
    function doIt() {
      $transation = new Transation;
      try{
        # todo save
        $trasation->success();
      } finally {
        $trasation->finally();
      }
    }
  ```

* 将事务这样子封装有个好处，减少代码中出现一些不必要的临时变量，比如$flag

* 看到上面的代码，有没有小伙伴们疑问，为什么不把提交放到析构方法里呢?原因是对象回收是语言自己控制，很难得到我们预期那样。如果写在析构函数，可能就有些编程规范，让对象早点回收。
  * 例如：执行事务的方法体在执行事务后还有其他耗时操作的话，这样析构函数就没法立刻执行。但如果这个事务在方法中就单单只做事务，那就可以写在析构函数中
* 需要注意的最终版

    ```php
        class Transaction {
          private $flag;
          private $db;
          
          public __construct() {
            $this->flag = false;
            $this->db = getDb(); # 自己补充db类
            $this->db->startTransaction();
          }

          public function success() {
            $this->flag = true;
          }

          public function __destruct() {
            if($this->flag) {
              $this->db->commit();
            } else {
              $this->db->rollback();
            }
          }
        }
        # do
        function doIt() {
          $transaction = new Transaction;
          # todo save
          $transaction->success();
        }
    ```

* 当然也可以改成函数

    ```php
      function transaction($transaction) {
        try {
          $db = getDb(); # 自己补充db类
          $db->startTransaction();
          $transaction();
          $db->commit();
        } finally {
          $db->rollback();
        }
      }
    ```
