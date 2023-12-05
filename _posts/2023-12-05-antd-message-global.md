---
layout: post
title: antd message 全局使用解决
tags: js react antd
categories: js
---


* TOC
{:toc}

# antd message 全局使用解决

> 随着5.0版本到来后，官方将全局静态调用message等等都标注为警告

## 问题来源

如果在组件中这都不是事，官方已经提供[解决方式](https://ant-design.antgroup.com/components/app-cn#%E5%9F%BA%E7%A1%80%E7%94%A8%E6%B3%95)

但是如果这个调用在组件之外呢？虽然这个调用是及其不靠谱的，但是前期我看了很多antd项目都在请求中集中处理了错误，然后通过message输出消息

## 解决

1. 现在要求message使用只能在组件下，解决方法就是将message封装在组件下即可
1. 但又要让请求那边可以调用到，那就得看看WebApi能不能提供一种通知形式来做
1. 巧了，WebApi可以[自定义事件](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener)

## 示例代码

1. message 组件，然后挂到你的项目上

```typescript
import { message, } from "antd";
import React,{ FC, useEffect,} from "react"



type Props =  {
}

const Message:FC<Props> = props => {

  const [api, contextHolder] = message.useMessage();

  useEffect(() => {
    const bindEvent = (e:CustomEvent|any) => {
      api.info(e?.detail?.message)
    }

    window.addEventListener('jenson_message', bindEvent)

    return () => {
      window.removeEventListener('jenson_message', bindEvent)
    }
  }, [api])

  return (
    <>
        {contextHolder}
    </>
  )
}

export default Message
```

1. request 中触发，[CustomEvent Api](https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent/CustomEvent#detail)

```typescript

    // # 手写事件多不美观啊，自个再封装封装成函数 message，这不更自在。
    window.dispatchEvent(new CustomEvent("jenson_message", {
        detail: {
            message: 'hello'
        }
    }))
```
