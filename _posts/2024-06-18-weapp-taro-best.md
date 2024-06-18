---
layout: post
title: Taro小程序跨端跨框架使用最佳实践
tags: taro weapp 小程序 react
categories: frontend
---

- TOC
  {:toc}

# Taro 小程序跨端跨框架使用最佳实践

## 什么是 Taro

Taro 是一个开放式跨端跨框架解决方案，支持使用 React/Vue/Nerv 等框架来开发 微信 / 京东 / 百度 / 支付宝 / 字节跳动 / QQ / 飞书 / 快手 小程序 / H5 / RN 等应用。

现如今市面上端的形态多种多样，Web、React Native、微信小程序等各种端大行其道。当业务要求同时在不同的端都要求有所表现的时候，针对不同的端去编写多套代码的成本显然非常高，这时候只编写一套代码就能够适配到多端的能力就显得极为需要。

## Taro 的优缺点

1. 与原生微信小程序开发相比较：
   1. 优势：
   - Taro 框架更灵活，支持多种框架，以及 UI 框架组件
   - 更方便引入 NPM 包
   - 多端支持【实际上各端的 api 可能存在不一致，需结合官方文档，额外处理】
   - 开发效率提高【个人认为】
   1. 劣势：
   - 包大小可能没有原生的来得小
   - 性能可能没有原生更好
1. 与 uni-app 相比较
   1. 优势：
   - Taro 支持 React 和 Vue，uni-app 以 Vue 栈
   - Taro 由京东凹凸实验室打造的一套遵循 React 语法规范的多端统一开发框架，当然发展到现在也有很多其他开发者支持
   - Taro 目前为止还没听过有加料
   1. 劣势：
   - 赶了晚集，国内 Vue 栈的开发者比较多，且 uni-app 出现更早，基本上多端开发都会优先选择 uni-app

## 安装和使用

官方提供 cli 安装，[详细教程](https://docs.taro.zone/docs/GETTING-STARTED)

1. 安装 cli `$ npm install -g @tarojs/cli`
1. 项目初始化 `taro init myApp`
   - 根据自己的技术栈和编程习惯进行选择即可，最后根据自己的需求选择合适的模板
1. 常用的 UI 模板
   - NutUI，【推荐，不过样式比较重，需要重新自定义】
   - Taro UI 【不推荐，比较简陋】
   - Taroify ，第三方需要自行加载
1. 安装依赖包 `npm install`
1. 运行 `npm run dev:weapp` 其他小程序请参照 `package.json` 里的命令
1. 打包 `npm run build:weapp`
1. 查看或预览，直接通过微信开发者工具导入当前项目即可

## 开发日常

目前我选择了 `React, Typescript`

1. 引入第三方框架 [Taroify](https://taroify.github.io/taroify.com/quickstart/)

   1. 安装模块`npm i @taroify/core -S`
   1. 引入组件，推荐自动按需引入

      ```javascript
      // babel.config.js 或 babel.config.ts
      module.exports = {
        plugins: [
          [
            "import",
            {
              libraryName: "@taroify/core",
              libraryDirectory: "",
              style: true,
            },
            "@taroify/core",
          ],
          [
            "import",
            {
              libraryName: "@taroify/icons",
              libraryDirectory: "",
              camel2DashComponentName: false,
              style: () => "@taroify/icons/style",
            },
            "@taroify/icons",
          ],
        ],
      };
      ```

1. 多端开发时注意各api对端的支持请看，具体详看文档

1. 每次编译时提示警报：WARNING in external "taro_app_library@/remoteEntry.js"
    解决：
    方案一：关闭 prebundler

    ```typescript
      /* config/index.ts */
     const config = {
       ...
       compiler: {
         prebundle: {
           enable: false,
         },
         type: 'webpack5'
       },
     }
    ```

1. 每次编译时提示警报： chunk common [mini-css-extract-plugin] Conflicting order between
    解决：

    ```typescript
          //config/index.tx
          {
            mini: {
              enableExtract:true,
              miniCssExtractPluginOption: {
                //忽略 css 文件引入顺序
                ignoreOrder: true
              },
            }
          }
    ```

1. 版本问题，taro 自带的包都是固定版本，具体选用哪个版本是根据 cli 版本来确定的，具体[参照这里](https://docs.taro.zone/docs/GETTING-STARTED#%E4%BF%9D%E6%8C%81-cli-%E7%9A%84%E7%89%88%E6%9C%AC%E4%B8%8E%E5%90%84%E7%AB%AF%E4%BE%9D%E8%B5%96%E7%89%88%E6%9C%AC%E4%B8%80%E8%87%B4)

1. 修改了代码后，微信开发者工具预览没反应
    - 再次点击编译试试
    - 如果没效果，试试清除缓存，一个个缓存试或者全清
    - 如果还没效果，点击 详情 本地设置，如果启用条件编译，则点击取消，如果没有则点击使用，正常后再回来恢复即可
    - 如果还没有效果，你这人品不行啊
1. 预览包过大，解决方法
    1. 第一种：
        - 启动条件编译
        - 上传代码时压缩文件
        - 上传时过滤无依赖文件
    1. 第二种
        - 试试 `npm run build:weapp`
1. 路径别名问题 `@/` not found
    1. [建议按需配置](https://docs.taro.zone/docs/config-detail#alias)

    ```typescript
        // config/index.ts
        module.exports = {
          // ...
          alias: {
            '@/components': path.resolve(__dirname, '..', 'src/components'),
            '@/utils': path.resolve(__dirname, '..', 'src/utils'),
            '@/package': path.resolve(__dirname, '..', 'package.json'),
            '@/project': path.resolve(__dirname, '..', 'project.config.json'),
          },
        }
    ```

    ```typescript
      // tsconfig.json
      {
        "compilerOptions": {
          "baseUrl": ".",
          "paths": {
            "@/components/*": ["./src/components/*"],
            "@/utils/*": ["./src/utils/*"],
            "@/package": ["./package.json"],
            "@/project": ["./project.config.json"]
          }
        }
      }
    ```
