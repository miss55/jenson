---
layout: post
title: 框架选择
tags: framework
categories: other
---
> 

#### 为什么要使用框架
1. 为什么需要使用框架？
    - 虽然框架不是绝对必要的，但它是提高我们的开发效率的工具。能够提供结构化、可维护、可升级的程序，保证了程序质量。
    - 使用框架我们可以更专注于业务领域，而不是为某些非业务方面重复造轮子。
    - 框架的缺点就是增加复杂度以及学习成本，但这与从框架获得的好处相比，则可以忽略
#### 框架选择
1. 框架选择指标
    - 特点功能有哪些？适用当前业务场景？
    - 易用性怎么样？学习成本需要多高，框架功能迭代速度？
    - 稳定性如何？结合官方测试用例以及版本bug修复来看
    - 扩展性怎么样？第三方库支持怎么样？社区活跃度？
    - 维护性呢？框架维护团队？issue有多少？解决速度怎么样等等
1. 流行的框架之间比较

	| 框架 | 官方介绍 | 类别 | 热度<br>(web/framwork) | 易用性<br>(开发者) | 版本情况 |大版本升级 | 备注 |
	| --  | --   | --   | --  | --     | --      | --   | -- |
	| laravel | 具有表达力<br>优雅语法<br>重设计 | 企业级 | 61k/22.1k | 高 | <a href="6修复稳定" target="_blank">6修复稳定</a><br><a href="https://github.com/laravel/framework/blob/8.x/CHANGELOG-7.x.md">7修复添加</a><br><a href="https://github.com/laravel/framework/blob/8.x/CHANGELOG-8.x.md" target="_blank">8修复添加</a> | 提供升级(升级比较麻烦)| 从7,8版本中的changelog可见，<br>laravel几乎每个小版本都会新增功能 |
	| yii2 | 基于mvc<br>代码简洁优雅<br>高性能| 企业级 | 2k/13.5k | 高 | <a href="https://github.com/yiisoft/yii2/blob/2.0.32/framework/CHANGELOG.md" target="_blank">yii2处于修复稳定</a> |提供1.1->2.*| 从changelog可见，<br>yii2以及进入维护阶段，<br>没有新功能增加|
	| symfony | 组件重用型 | 企业级 | 23.9k | 高 | <a href="https://github.com/symfony/symfony/blob/master/CHANGELOG-5.1.md" target="_blank">修复稳定</a> |提供4.0.0->4.4.0->5.0.0->5.0.1| 基于可重用组件，laravel和yii都是借鉴symfony，商业也成熟|
	| thinkphp6 | 快速简单面向对象<br>使用php新特性以及<br>借鉴了其他优秀框架思想 | - | 7.5k/2.2k | - | <a href="https://github.com/top-think/framework/releases" target="_blank">6修复改进添加</a> | 提供，不建议大版本跨域 | 没接触过，<br>借用网友的话“实现了laravel的本地化” |
	| thinkphp3.2 | 快速简单面向对象 | - | 2.8k | 低 | 停止维护 | 已废弃 | 很适合小项目快速开发 | 
	| hyperf | 高速+灵活 | 协程、企业级| 3.1k| 高 | 1.1 安全维护<br><a href="https://hyperf.wiki/2.0/#/zh-cn/changelog" target="_blank">2.0积极支持中</a> |支持建议根据升级指南升级| 为 PHP 微服务铺路的框架，<br>web服务，网关服务，<br>分布式中间件，<br>微服务架构，物联网等|
	| easyswoole|驻内存型的分布式PHP框架|协程、企业级|3.8k| 高 | 3.x维护支持 | 没有相应升级模块，建议大版本别升级 | 同hyperf类似 | 


3. 最好不要大版本升级，因为框架和业务代码可能跟php特定版本相关

#### 结尾
1. 比较了多款php框架，现代框架基本都是基于composer+组件思想来开发的。
2. 其中部分框架对开发者不太友好，比如laravel，swoole相关，需要安装特定的ide helper
3. swoole相关的框架适应场景比较多，其他传统的基本上做web开发
4. 以上框架都提供了很多开箱即用组件，再加上第三方组件，开发效率其实伯仲之间
5. 个人觉得学习成本为 hyperf=easyswoole>=laravel>yii2>thinkphp3.2；另外两个框架没有实际用过
6. 稳定性这块，还是请查看各个框架github的issue+版本升级记录，看看哪个框架更符合，尽可能选择LTS版本
7. 如果选择的业务很复杂，建议选择swoole相关的框架，毕竟适应的场景多，能够一个框架解决，就不要用两个