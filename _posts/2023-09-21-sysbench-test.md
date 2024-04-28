---
layout: post
title: 使用sysbench 对mysql进行性能测试
tags: sysbench mysql
categories: tool
---

* TOC
{:toc}

# 使用sysbench 对mysql进行性能测试

## 安装

根据你的操作系统进行安装，<a href="https://github.com/akopytov/sysbench#linux" target="_blank">参考 sysbench安装</a>

1. 快速安装
    * Debian/Ubuntu

        ```shell
        curl -s https://packagecloud.io/install/repositories/akopytov/sysbench/script.deb.sh | sudo bash
        sudo apt -y install sysbench
        ```

    * RHEL/CentOS:

        ```shell
        curl -s https://packagecloud.io/install/repositories/akopytov/sysbench/script.rpm.sh | sudo bash
        sudo yum -y install sysbench
        ```

    * Fedora:

        ```shell
        curl -s https://packagecloud.io/install/repositories/akopytov/sysbench/script.rpm.sh | sudo bash 
        sudo dnf -y install sysbench
        ```

    * Arch Linux:

        ```shell
        sudo pacman -Suy sysbench
        ```

    * macOs:

        ```shell
        # Add --with-postgresql if you need PostgreSQL support
        brew install sysbench
        ```

## 使用

查看安装成功后测试lua脚本的位置，比如我的是ubuntu的， ls -lah /usr/share/sysbench

```textplain
    -rwxr-xr-x   1 root root 1.5K Apr 24  2020 bulk_insert.lua
    -rw-r--r--   1 root root  15K Apr 24  2020 oltp_common.lua
    -rwxr-xr-x   1 root root 1.3K Apr 24  2020 oltp_delete.lua
    -rwxr-xr-x   1 root root 2.4K Apr 24  2020 oltp_insert.lua
    -rwxr-xr-x   1 root root 1.3K Apr 24  2020 oltp_point_select.lua
    -rwxr-xr-x   1 root root 1.7K Apr 24  2020 oltp_read_only.lua
    -rwxr-xr-x   1 root root 1.8K Apr 24  2020 oltp_read_write.lua
    -rwxr-xr-x   1 root root 1.1K Apr 24  2020 oltp_update_index.lua
    -rwxr-xr-x   1 root root 1.2K Apr 24  2020 oltp_update_non_index.lua
    -rwxr-xr-x   1 root root 1.5K Apr 24  2020 oltp_write_only.lua
    -rwxr-xr-x   1 root root 1.9K Apr 24  2020 select_random_points.lua
    -rwxr-xr-x   1 root root 2.1K Apr 24  2020 select_random_ranges.lua
    drwxr-xr-x   4 root root 4.0K Sep 21 09:09 tests

```

1. 找个地方新建一个测试目录
1. 准备测试的配置文件 `vi my.cnf`
    > table_size 代表表的数据量

    ```conf
        mysql-host='{your host}'
        mysql-port='{your port}'
        mysql-user='{your user}'
        mysql-password='{your password}'
        mysql-db='{your test database}'
        db-driver='mysql'
        table_size=1000
        tables=10
        report-interval=1
        percentile=95
        time=300
        events=0
        threads=8
    ```

1. 准备: `sysbench  --config-file=./my.cnf  /usr/share/sysbench/oltp_read_only.lua prepare`
1. 执行: `sysbench  --config-file=./my.cnf  /usr/share/sysbench/oltp_read_only.lua run`

    ```text
        sysbench 1.0.20 (using bundled LuaJIT 2.1.0-beta2)

        Running the test with following options:
        Number of threads: 1
        Initializing random number generator from current time


        Initializing worker threads...

        Threads started!

        SQL statistics:
            queries performed:
                read 执行的读查询次数:             52164
                write 执行的写查询次数:            0
                other 执行的其他查询次数:          7452
                total 执行的总查询次数:            59616
            transactions 已执行事务数量:           3726   (372.48 per sec.) （每秒事务数）
            queries 已执行的查询总数:              59616  (5959.70 per sec.) (每秒执行的查询总数)
            ignored errors 忽略的错误次数:         0      (0.00 per sec.)
            reconnects 重新连接次数:               0      (0.00 per sec.)

        General statistics:
            total time 测试总运行时间:             10.0021s
            total number of events 总事件数:      3726

        Latency (ms): 单位毫秒
                min 最小延迟:                     1.44
                avg 平均延迟:                     2.68
                max 最大延迟:                     17.75
                95th percentile 95%延迟低于:      4.25
                sum 总延迟:                       9994.82

        Threads fairness:
            events (avg/stddev) 事件数量的平均值和标准差:           3726.0000/0.00
            execution time 执行时间的平均值和标准差 (avg/stddev):   9.9948/0.00

    ```

## 其他选项

针对指定配置设置响应的并发测试

1. 通用选项

    * `--threads=N` 指定要使用的线程数。可以通过多线程来模拟并发访问
    * `--events=N` 限制测试事件数量。 您可以设置最大执行事件数量
    * `--time=N` 限制测试的总执行时间，以秒为单位
    * `--force-shutdown=STRING` 在测试完成后，等待指定的时间再强制关闭
    * `--thread-stack-size=SIZE` 设置每个线程堆栈大小
    * `--rate=N` 指定平均事务速率。如果设置为0，则表示无限速率。
    * `--report-interval=N` 定期报告中间统计时间间隔（以秒为单位）
    * `--report-checkpoints=[LIST,...]` 在指定的时间点生成完整的统计信息报告。时间点以秒为单位，以逗号分割
    * `--debug=[on|off]` 控制是否输出更多调试信息
    * `--validate=[on|off]` 控制是否进行可能验证检查
    * `--help` 打印帮助信息
    * `--version` 打印版本信息
    * `--config-file=FILENAME` 指定的配置文件加载命令选项

1. 日志选项

    * `--verbosity=N` 设置日志输出的详细程度，从0(输出关键信息) 到 5(调试级别)
    * `--percentile=N` 计算延迟统计信息时使用的百分数(1-100), 使用0金庸百分位数计算
    * `--histogram=[on|off]` 在报告中打印延迟直方图

## 其他测试

1. cpu测试 `sysbench cpu --cpu-max-prime=2000 run`
1. 内存测试 `sysbench memory  run`
1. 文件测试
    * 准备 `sysbench fileio --file-total-size=8G prepare`
    * 执行 `sysbench fileio --file-total-size=8G  --file-test-mode=rndrw --time=300 --max-requests=0 run`
