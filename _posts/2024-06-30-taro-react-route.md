---
layout: post
title: Taro React版微信小程序路由最佳实践
tags: taro weapp 小程序 react
categories: frontend
---

- TOC
{:toc}

# Taro React 版微信小程序路由最佳实践

Taro 提供的路由 api，实际上是基于微信小程序路由 api 的，所以使用上和微信小程序路由 api 一致。

而微信小程序的路由 api 类型有点复杂。比如：页面跳转时通过 `navigateTo`，但不支持 tab 跳转 `switchTab`。如果你的 page 比较灵活的话，比如动不动就将 page url 转成 tab，那么就需要修改跳转方式，这个对代码改动来说是一个很糟糕的体验。

## 基于 taro 调整跳转路由

实际上一个页面是 page 还是 tab 都是我们在 `src/app.config.ts` 进行配置的，所以我的做法是，将这些 Page 和 Tab 配置先通过在常量配置中配置，然后在 `src/app.config.ts`调用，后面就是重写路由调用即可

比如我自定义跳转路由的方法为： `goHref`

```ts
// 主要作用就是在此内部判断该url是tab 还是page，如果path带param，那么只需自行调整即可
export const goHref = (path: string, options) => {
  if (tabBarPaths?.includes(path)) {
    switchTab(path, options);
  } else {
    Taro.navigateTo({
      ...(typeof options === "function" ? { success: options } : options),
      url: path.startsWith("/") ? path : `/${path}`,
    });
  }
};
```

页面跳转，返回上一页等都是同理

## 项目实践问题

1. h5 版打包首页会飘的原因？
   - 大概情况应该是 `pages`数组第一个必须是你的 `entryPagePath`
1. 到最后一个栈了，如何解决再返回报错问题
   - 其实很好解决，只需要重写返回方法即可，返回时判断当前页面栈长度，大于 1 的就调用返回，小于等于 1 的就跳往或重定向到首页
1. 如果我想在页面返回到上一个页面后，那个页面自动刷新数据如何操作

   - Taro 中提供了一个 `useDidShow`这个方法，可以结合初始化的一些状态判断，就可以完美解决刷新问题。

   ```typescript
   // usePageShow
   import { useDidShow } from "@tarojs/taro";
   import { useEffect, useRef } from "react";

   export const usePageShow = (didShow: () => void) => {
     const showRef = useRef(false);
     useEffect(() => {
       showRef.current = true;
     }, []);
     useDidShow(() => {
       if (showRef.current) {
         didShow();
       }
     });
   };

   const Index = () => {
     const loadData = () => {
       //.....
     };

     usePageShow(() => {
       loadData();
     });

     useEffect(() => {
       loadData();
     });

     return <>渲染页面</>;
   };
   ```

1. 再比如如何防止页面跳链太深
    - 可以通过redirect重定向+back解决
    - 也可以通过 `PageContainer` 这个组件来解决，当前页面最多只有 1 个容器，若已存在容器的情况下，无法增加新的容器
    - 当然如何你使用了`Skyline`，应该也有很多不错的选择，不过`Skyline`只支持微信小程序

## 总结

微信小程序app.json配置化的确是带来很多便利，但json配置不如js代码来得灵活，以及我将这些配置变为常量后，可以省去调用page时的长度，也算是另一种节省小程序包大小吧

通过自定义路由跳转，给后续需求变化提供了便利

通过常量配置的概念，实际上很多地方可能也可以剥离出来，设置为常量
