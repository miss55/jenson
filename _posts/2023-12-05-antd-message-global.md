---
layout: post
title: 通过自定义事件完美解决 antd message Static function can not consume报错
tags: js react antd
categories: js
---


* TOC
{:toc}

# 通过自定义事件完美解决 antd message Static function can not consume报错

> 随着5.0版本到来后，官方将全局静态调用message等等都标注为警告
> 全局message 控制台提示[antd: message] Static function can not consume

## 问题来源

如果在组件中这都不是事，官方已经提供[解决方式](https://ant-design.antgroup.com/components/app-cn#%E5%9F%BA%E7%A1%80%E7%94%A8%E6%B3%95)

但是如果这个调用在组件之外呢？虽然这个调用是及其不靠谱的，但是前期我看了很多antd项目都在请求中集中处理了错误，然后通过message输出消息

## 解决

1. 现在要求message使用只能在组件下，解决方法就是将message封装在组件下即可
1. 但又要让请求那边可以调用到，那就得看看WebApi能不能提供一种通知形式来做
1. 巧了，WebApi可以[自定义事件](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener)
1. <img src="/static/img/antd_global_message.png" alt="通过自定义事件完美解决 antd message Static function can not consume报错">

## 示例代码

1. message 组件，然后挂到你的项目上

```typescript
import React,{ FC, useEffect,} from "react"

import { message, } from "antd";
import {MESSAGE_EVENT_NAME} from 'utils/antdMessage'


type Props =  {
}

const Message:FC<Props> = props => {

  const [api, contextHolder] = message.useMessage();

  useEffect(() => {
    const bindEvent = (e:CustomEvent|any) => {
      const func = e?.detail?.type || 'info'
      const {content, duration, onClose} = e.detail?.params
      api[func](content, duration, onClose)
    }

    window.addEventListener(MESSAGE_EVENT_NAME, bindEvent)

    return () => {
      window.removeEventListener(MESSAGE_EVENT_NAME, bindEvent)
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

1. 当然上面的写法不优雅，我们就照着message的文档和interface写一个跟它一样的不就ok?

```typescript
// utils/antdMessage.ts
import { JointContent } from "antd/es/message/interface";

export const MESSAGE_EVENT_NAME = 'jenson_message';
export enum MESSAGE_TYPES {
    SUCCESS = 'success',
    ERROR = 'error',
    INFO = 'info',
    WARNING = 'warning',
    LOADING = 'loading',
}

const dispatch = (type: MESSAGE_TYPES, content: JointContent, duration?: number|VoidFunction, onClose?: VoidFunction) => {
    window.dispatchEvent(new CustomEvent(MESSAGE_EVENT_NAME, {
        detail: {
            params: {
                content,
                duration,
                onClose
            },
            type: type,
        }
    }))
}

export const message = {
    success(content: JointContent, duration?: number|VoidFunction, onClose?: VoidFunction) {
        dispatch(MESSAGE_TYPES.SUCCESS, content, duration, onClose)
    },
    error(content: JointContent, duration?: number|VoidFunction, onClose?: VoidFunction) {
        dispatch(MESSAGE_TYPES.ERROR, content, duration, onClose)
    },
    info(content: JointContent, duration?: number|VoidFunction, onClose?: VoidFunction) {
        dispatch(MESSAGE_TYPES.INFO, content, duration, onClose)
    },
    warning(content: JointContent, duration?: number|VoidFunction, onClose?: VoidFunction) {
        dispatch(MESSAGE_TYPES.WARNING, content, duration, onClose)
    },
    loading(content: JointContent, duration?: number|VoidFunction, onClose?: VoidFunction) {
        dispatch(MESSAGE_TYPES.LOADING, content, duration, onClose)
    }
}

// message.success('这是个成功的测试', 2, () => {
//   console.log ('能否能在结束后被执行')
// })

```
