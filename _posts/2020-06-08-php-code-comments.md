---
layout: post
title: php代码注释最佳实践
tags: php code-comment phpstorm 
categories: backend
---

* TOC
{:toc}

# php代码注释最佳实践

> 虽然大家生成php文档基本都不使用php document，但写代码总需要注释的，而且有些注释不是给我们自己看的，而是给编辑器看的。毕竟php不是强类型语言，许多补全提示都依赖注释。
>
## 我所常用的或者常见的注释

* 在类上，比如author信息，类相关信息，以及一些对类属性和方法补充的注释
* 在函数或者方法上，比如没处理的异常，接受参数类型，响应参数类型等
* 在代码中 其实最常用就是 @var ，用来申明变量类型，例如下面例子

## 日常使用例子
>
> ide在一定程度中会自动补全代码，但有些不确定的类型，ide就没辙了，所以这时候就需要注释来凑，比如下面的 @var

  ```php
    use Yii;

    /**
    * This is the model class for table "posts".
    * Class Posts
    * @see \yii\db\ActiveRecord
    * @author jenson
    * @package app\models
    * @property int $id 文章主键   # new了这个类后，可以将直接调用该属性，一般这类属性由魔术方法处理
    * @property string|null $title 标题
    * @property string|null $content 文章内容
    * @property string|null $created_at 创建时间
    * @property string|null $updated_at 更新时间
    * @method string testMethod($param) 测试方法 # new了这个类后,编辑器可以识别到该方法
    */
    class Posts extends \yii\db\ActiveRecord
    {
        /**
        * {@inheritdoc}  # 继承文档
        * @return string # 返回字符串类型
        */
        public static function tableName()
        {
            return 'posts';
        }

        /**
        * @param string $name  # 参数
        **/
        public function testGetDb($name) {
            /**
            * @var \yii\db\Connection $db  # 申明下面的$db变量的类型，方便后面调用
            */
            $db =  \Yii::$app->get('db');
            $db->getQueryBuilder()->db;
        }
    }
  ```

## 完整的注释列表

| Tag|Element| Description |
| --|--|-- |
| api| 方法| 申明一个api |
| author| 任何 | 作者 |
| category| 文件，类 | 将一系列软件包组合在一起。 |
| copyright | 任何 | 版权 |
| deprecated | 任何| 说明当前文档标注内容属于弃用 |
| example | 任何 | 该标记用于解析一段文件内容，并将他们高亮显示。Phpdoc会试图从该标记给的文件路径中读取文件内容 |
| filesource | 文件 | 和example类似，只不过该标记将直接读取当前解析的php文件的内容并显示。   |
| global | 变量 |申明全局变量 |
| ignore | 任何 | 忽略指定内容 |
| internal |任何 | 内部使用 |
| license | 文件 | 许可证 指向一个资源 |
| link | 任何| 链接 |
| method | 类 | 申明一个方法 |
| package | 文件，类 | 将关联的元素分类为逻辑分组或细分。 |
| param|方法、函数| 什么其需要的参数 |
| property|类|申明一个类的属性 |
| property-read|类|同上 |
| property-write|类|同上 |
| return| 方法、函数| 返回 |
| see | 任何 | 指向其他地方 |
| since | 任何 | 指示相关元素的可用版本 |
| source | 任何 | 参考来源 |
| subpackage| 文件、类| 所属子包 |
| throws | 方法、函数 | 抛出的异常 |
| todo | 任何 | 记录待做的事 |
| uses | 任何 | 表示对单个关联元素的引用 |
| var | 属性 | 申明一个变量 |
| version | 任何 | 版本 |

## 注释元素

1. 类名
2. 基本变量类型，int or integer、float、bool or boolean、array、resource、 null、callable
3. 关键字，mixed、void、object、 false or true、self、static、$this
4. 数组类型，

    ```php
      /**
        * @var string[] $strings 字符串数组变量
        * @var callable[] $callables 
        *
        **/
    ```

5. 多类型组合

    ```php
    /**
      * @return string|null 
      *
      **/

    ```
