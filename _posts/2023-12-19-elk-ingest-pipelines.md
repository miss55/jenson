---
layout: post
title: elasticsearch 中使用 pipeline 对数据执行转换，丰富数据
tags: elasticsearch
categories: backend
---


* TOC
{:toc}

# elasticsearch 中使用 pipeline 对数据执行转换，丰富数据

## pipeline 是什么

在 Elasticsearch 中，管道（Pipeline）是一种用于在文档索引时执行一系列转换和处理操作的机制。管道能够对输入文档进行多步骤的处理，以生成最终的索引文档。管道的主要目的是对文档进行预处理，以便更有效地索引和检索数据。

> 我们主要为了给日志数据增加ip地理位置说明以及ip公私有和ip是否可信

## 创建管道

1. [参考例子](https://www.elastic.co/guide/en/elasticsearch/reference/current/common-log-format-example.html)
1. 在Kibana打开主菜单
1. 导航到对战管理>引入管道
    * 查看 ElasticSearch Ingest 管道的列表，并深入了解详细信息
    * 编辑或克隆现有的ElasticSearch收录的管道
1. 创建管道 > 新建管道
1. 输入 管道的名称和适当描述
1. 单击"添加处理器"选项，然后选择"Grok"作为处理器类型
1. 将字段配置为消息，将模式配置为Grok 模式
1. 最后，单机"添加"选项以保存处理器。还可以将处理器描述配置为"消息"中提取字段
1. 现在，为时间戳、IP 地址和用户代理字段设置处理器
1. 单击“添加文档”，并在“文档”选项卡中提供用于测试的示例文档。然后，单击“运行管道”选项
1. 测试成功后，可以关闭面板，然后单击“创建管道”选项

## 数据策略

1. [api doc](https://www.elastic.co/guide/en/elasticsearch/reference/7.10/put-enrich-policy-api.html)
1. 策略删除
    * `DELETE /_enrich/policy/{policy name}`
    * 示例 `DELETE /_enrich/policy/misp-enrich-block-ip`

1. 策略创建

    * ```text
        PUT /_enrich/policy/{policy name}
        {
            "match": {
                "indices": "{indexes}",
                "match_field": "{match field}",
                "enrich_fields": ["{field1}", "{field2}", ...]
            }
        }
      ```

    * ```text
        PUT /_enrich/policy/misp-enrich-block-ip
        {
            "match": {
                "indices": "fixed-misp-7.10.2",
                "match_field": "destination.ip",
                "enrich_fields": ["rule", "misp.threat_indicator"]
            }
        }
      ```

1. 策略执行
    * `PUT /_enrich/policy/{policy name}/_execute`
    * 示例: `PUT /_enrich/policy/misp-enrich-block-ip/_execute`

1. 策略状态查看
    * `GET /_enrich/_stats`

1. 策略查看
    * `GET /_enrich/policy/misp-enrich-block-ip`

## 例子 丰富IP结果


1. 管道创建
1. 创建脚本处理器
    1. 语言: painless
    1. 源:

        ```painless
            Pattern pattern = /^(127\.0\.0\.1)|(localhost)|(10\.\d{1,3}\.\d{1,3}\.\d{1,3})|(172\.((1[6-9])|(2\d)|(3[01]))\.\d{1,3}\.\d{1,3})|(192\.168\.\d{1,3}\.\d{1,3})$/;
            boolean flag = pattern.matcher(ctx.data.dest_ip).matches();
            if(flag) {
                ctx.data.dest_ip_flag = "private";
            } else {
                ctx.data.dest_ip_flag = "public";
            }
        ```

    1. 条件: `ctx?.data?.dest_ip != null`
    1. painless 断点测试 `Debug.explain(ctx._source)`
1. 创建数据丰富处理器
    1. 字段: data.dest_ip
    1. 策略名称: misp-enrich-block-ip
    1. 目标字段: data.dest_enrich
    1. 条件: ctx?.data?.dest_ip != null && ctx?.data?.dest_ip_flag=="public"
1. 测试数据

    ```json
    [
        {
            "_index": "index",
            "_id": "id",
            "_source": {
            "data": {
                "dest_ip": "192.168.1.1"
            }
            }
        },
        {
            "_index": "index",
            "_id": "id",
            "_source": {
            "data": {
                "dest_ip": "66.66.66.66"
            }
            }
        },
        {
            "_index": "index",
            "_id": "id",
            "_source": {
            "data": {
                "dest_ip": "101.43.209.65"
            }
            }
        }
    ]
    ```

### 脚本

1. create pattern

    ```java
        Pattern pattern = /^(127\.0\.0\.1)|(localhost)|(10\.\d{1,3}\.\d{1,3}\.\d{1,3})|(172\.((1[6-9])|(2\d)|(3[01]))\.\d{1,3}\.\d{1,3})|(192\.168\.\d{1,3}\.\d{1,3})$/;
        boolean flag = pattern.matcher(ctx.data.dest_ip).matches();
        if(flag) {
            ctx.data.dest_ip_flag = "private";
        } else {
            ctx.data.dest_ip_flag = "public";
        }
    ```

1. test data

    ```json
        [
            {
                "_index": "index",
                "_id": "id",
                "_source": {
                "data": {
                    "dest_ip": "192.168.1.1"
                }
                }
            },
            {
                "_index": "index",
                "_id": "id",
                "_source": {
                "data": {
                    "dest_ip": "66.66.66.66"
                }
                }
            },
            {
                "_index": "index",
                "_id": "id",
                "_source": {
                "data": {
                    "dest_ip": "101.43.209.65"
                }
                }
            }
        ]
    ```

1. output

    ```json
        {
            "doc": {
                "_index": "index",
                "_type": "_doc",
                "_id": "id",
                "_source": {
                "data": {
                    "dest_enrich": {
                        "destination": {
                            "ip": "101.43.209.65"
                        },
                        "rule": {
                            "description": "blockrules of rules.emergingthreats.net feed",
                            "id": "1",
                            "category": "Network activity",
                            "uuid": "61201a4f-5971-4f71-b287-0e3ba5603ffe"
                        },
                        "misp": {
                            "threat_indicator": {
                            "feed": "misp",
                            "attack_pattern": "[destination:ip = '101.43.209.65']",
                            "description": "blockrules of rules.emergingthreats.net feed",
                            "id": "61201a4f-5971-4f71-b287-0e3ba5603ffe",
                            "type": "ip-dst",
                            "attack_pattern_kql": "destination.ip: \"101.43.209.65\""
                            }
                        }
                    },
                    "dest_ip_flag": "public",
                    "dest_ip": "101.43.209.65"
                }
                },
                "_ingest": {
                "timestamp": "2022-09-08T09:18:38.568617863Z"
                }
            }
        }
    ```