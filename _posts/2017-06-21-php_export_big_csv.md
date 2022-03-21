---
layout: post
title: php如何导出巨大数据excel表格
tags: php excel 生成器
categories: backend
---

* TOC
{:toc}

> 导出excel主要有两个需要解决的，1占内存，2耗时

# 一、解决超时问题
1. 通过任务形式在后台导出，然后前端提供导出下载链接
2. 需要修改php配置、php-fpm配置、nginx配置
    - php配置可以直接在脚本中设置最大执行时间``` ini_set('max_execution_time', 0);```
    - php-fpm 则需要修改配置 ```request_terminate_timeout=```
    - nginx 则需要修改配置 
    ```
    send_timeout= # 服务端想客户端传输数据超时
    fastcgi_read_timeout= # 读取fastcgi内容超时
    ```
    > 如果导出时间太长，最好不要用这种方法，毕竟需要修改nginx和php-fpm的配置

# 二、解决占内存问题
1. 导出excel库选择
  如果导出表格没要求，但数据量巨大的，我们可以使用自带的```fputcsv```来处理，第三库例如PhpSpreadsheet，平均每个单元格需要1k内存，100M内存单纯放单元格也只能放102400个，如果一行10个单元格，也就1w行左右
2. 获取数据时分批获取，比如去数据库获取10w条数据，我们可以使用框架集成的ORM批量获取方法，比如比如laravel提供的chunk，YII2 ORM提供的batch，否则我们只能自己去封装，个人比较推荐使用生成器去封装。例如我通过laravel去封装的

```php
    # 如果封装到查询类上效果更佳
    function getMysqlDataByYield()
    {
        $pageSize = 1000; # 每次获取数目
        $id = 0; # 用来分批查询的起始id
        $query = Product::query();
        while (true) {
            if ($id > 0) {
                $query->where('id', '>', $id);
            }
            $query->where('id', '<', 20000);
            $query->limit($pageSize)->orderBy('id');
            $rows = $query->get();
            if (empty($rows)) {
                break;
            }
            $rows = $rows->toArray();
            $count = count($rows);
            yield $rows;
            if ($count == $pageSize) {
                $id = $rows[$count - 1]['id'];
            } else {
                # 如果数目不对，说明是最后一页
                break;
            }
        }
    }
```

#### 三、导出excel例子

```php
  function download()
  {

    $filename = 'test.csv';
    # 如果担心超时，可以设置最大超时时间，不过也得看php-fpm和nginx设置的超时时间
    # 如果实在太久了，最好放到后台生成，然后提供导出路径即可
    ini_set('max_execution_time', 0);
    header('Expires: 0');
    header('Cache-Control: must-revalidate');
    header('Pragma: public');
    header('Content-Description: File Transfer');
    header('Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet; charset=utf-8');
    header("Content-Disposition: attachment;filename={$filename}");
    header('Cache-Control: max-age=0');
    $fp = fopen('php://output', 'a') #打开output流
    foreach (getMysqlDataByYield() as $rows) {
        foreach ($rows as $row) {
            mb_convert_variables('GBK', 'UTF-8', $row);
            fputcsv($fp, $row);
        }
        
        # 其实缓冲区这个有没有都无所谓，毕竟php和系统自己都已经设置好了
        # php buffer size 默认都是4k
        # nginx fastcgi_buffer_size 默认是64k
        ob_flush();#刷新输出缓冲到浏览器
        flush();#必须同时使用 ob_flush() 和flush() 函数来刷新输出缓冲。
    }
    fclose($fp); # 关闭输出流
  }
```
