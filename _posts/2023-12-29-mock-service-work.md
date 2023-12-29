---
layout: post
title: msw 模拟api请求 mock service work 使用
tags: makefile
categories: tool
---


* TOC
{:toc}

# msw 模拟api请求 mock service work 使用

## [msw有什么用](https://mswjs.io/)

如果你开发一个前端产品，只是想用来展示，不想搭建后端。那么部分需要与后端交互就需要mock，msw就是用来mock 后端api请求的

## 使用

1. 安装 `npm install msw --save-dev`

### 编写 request handle

1. 编写rest api
    * http.`all`
    * http.`head`
    * http.`get`
    * http.`post`
    * http.`put`
    * http.`delete`
    * http.`patch`
    * http.`options`

    ```javascript
        // src/mocks/handlers.js
        import { http } from 'msw'
        
        export const handlers = [
        
            http.get('/posts', () => {
                // Response resolver allows you to react to captured requests,
                // respond with mock responses or passthrough requests entirely.
                // For now, let's just print a message to the console.
                console.log('Captured a "GET /posts" request')
            }),
        ]
    ```

    * url上的query

        ```javascript
            http.get('/product', ({ request }) => {
                const url = new URL(request.url)
                const productId = url.searchParams.get('id')
            
                if (!productId) {
                return new HttpResponse(null, { status: 404 })
                }
            
                return HttpResponse.json({ productId })
            })
        ```

    * url上的params

        ```javascript
            http.delete('/user/:id', ({ params }) => {
                const { id } = params
                console.log('Deleting user with ID "%s"', id)
            })
        ```

    * url 上的body json

        ```javascript
            http.put('/post/:id', async ({ request, params }) => {
                const { id } = params
                const nextPost = await request.json()
                console.log('Updating post "%s" with:', id, nextPost)
            })
        ```

1. [编写 graphQL api](https://mswjs.io/docs/network-behavior/graphql)

1. response

    ```javascript
        http.get('/resource', () => {
            return new Response('Hello world!')
        }),
    ```

    * response json

        ```javascript
            http.post('/auth', () => {
                // Note that you DON'T have to stringify the JSON!
                return HttpResponse.json({
                user: {
                    id: 'abc-123',
                    name: 'John Maverick',
                },
                })
            }),
        ```

    * mocking error response

        ```javascript
            http.get('/user', () => {
                // Respond with "401 Unauthorized" to "GET /user" requests.
            return new HttpResponse(null, { status: 401 })
            })
        ```

    * network error

        ```javascript
            http.post('/checkout/cart', () => {
                return HttpResponse.error()
            })
        ```

### 集成

1. 通过浏览器

    * src/mocks/browser.js

    ```javascript
        // src/mocks/browser.js
        import { setupWorker } from 'msw/browser'
        import { handlers } from './handlers'
        
        export const worker = setupWorker(...handlers)
    ```

    * src/index.jsx

    ```javascript
        // src/index.jsx
        import React from 'react'
        import ReactDOM from 'react-dom'
        import { App } from './App'
        
        async function enableMocking() {
            if (process.env.NODE_ENV !== 'development') {
                return
            }
            
            const { worker } = await import('./mocks/browser')
            
            return worker.start()
        }
        
        enableMocking().then(() => {
            ReactDOM.render(<App />, rootElement)
        })
    ```

1. [通过Node](https://mswjs.io/docs/integrations/node)

## 其他

1. 高阶解析器-中间件

    ```javascript
        // mocks/middleware.js
        import { HttpResponse } from 'msw'
        
        export function withAuth(resolver) {
        return (input) => {
            const { request } = input
        
            if (!request.headers.get('Authorization')) {
            return new HttpResponse(null, { status: 401 })
            }
        
            return resolver(input)
        }
        }
    ```

1. 中间件

    ```javascript
        // 所有请求前置
        http.all('*', ({request, params}) => {
            console.debug('=====request===', request.url, params)
            const token = getTokenName(request)
            if(!request.headers.get('Authorization')) {
                return responseErrorJson('请先登录', 403)
            }
        })
    ```

1. [其他操作](https://mswjs.io/docs/recipes/file-uploads)
1. [官方demo](https://github.com/mswjs/examples/blob/main/examples/with-vue/src/main.ts)
