---
layout: post
title: php使用readfile下载大文件再也不会报Allowed memory size of xxxxxx bytes exhausted
tags: php SplFileObject file_download 
categories: backend
---

* TOC
{:toc}

# php使用readfile下载大文件再也不会报Allowed memory size of xxxxxx bytes exhausted

> Fatal Error： Allowed memory size of xxxxxx bytes exhausted

使用readfile下载文件时，文件越大需要的内存就越高，如果导出一个100MB的文件，则需要100MB的内存

> fixed 看了<a href="https://www.php.net/manual/zh/function.readfile.php#81032" target="_blank">官方文档</a>，耗内存不是readfile问题，是没有关闭ob缓冲区，所以导出时先关闭```ob_end_flush();```即可;使用下面可以限速~

## 1. 强制输出缓冲

1. 通过 fopen、fread、fflush 组合输出
2. 使用 SplFileObject来替代上面函数方式导出

## 2. file函数方式导出

  ```php
    $filename = storage_path('app/test_down.rar');

    //设置脚本的最大执行时间，设置为0则无时间限制
    set_time_limit(0);
    ini_set('max_execution_time', '0');

    // 输出的是字节流
    header('content-type:application/octet-stream');

    //返回文件大小类型是字节
    header('Accept-Ranges:bytes');
    //获得文件大小
    $fileSize = filesize($filename);
    header('Accept-Length:' . $fileSize);
    //设置文件名称
    header('content-disposition:attachment;filename=' . basename($filename));

    //每次输出1MB 其实4096也可以，比较nginx上的缓存是4096
    $read_buffer = 1024 * 1024 ;
    $handle = fopen($filename, 'rb');

    $fp = fopen('php://output', 'a');//打开output流
    // 循环读取 到最后
    while (! feof($handle)) {
        fwrite($fp, fread($handle, $total_buffer));
        fflush($fp);
    }

    //关闭句柄
    fclose($handle);
    fclose($fp);
  ```

## 3. 使用SplFileObject来输出

  ```php
    $filename = storage_path('app/test_down.rar');
    $file = new \SplFileObject($filename, 'r');
    if (! $file->isFile()) {
        throw new \Exception("file not found {$filename}");
    }

    //设置脚本的最大执行时间，设置为0则无时间限制
    set_time_limit(0);
    ini_set('max_execution_time', '0');

    header('content-type:application/octet-stream');
    header('Accept-Ranges:bytes');

  
    header('Accept-Length:' . $file->getSize());
    header('content-disposition:attachment;filename=' . $file->getBasename());

    $read_buffer = 1024 * 1024 ;

    $output = new \SplFileObject('php://output', 'a');

    //只要没到文件尾，就一直读取
    while (! $file->eof() ) {
        $output->fwrite($file->fread($read_buffer));
        $output->fflush();
    }
  ```
