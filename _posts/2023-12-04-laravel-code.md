---
layout: post
title: laravel 源码阅读 v10.22.0
tags: php laravel
categories: php
---


* TOC
{:toc}

# laravel 源码阅读 v10.22.0

## http请求执行过程

1. **public/index.php**

    ```php
        # 如果处于维护模式则引入维护模式文件
        if (file_exists($maintenance = __DIR__.'/../storage/framework/maintenance.php')) {
            require $maintenance;
        }

        # 实例化服务容器 boostrap Application
        $app = require_once __DIR__.'/../bootstrap/app.php';

        # 从容器中取出 Kernel 主要设定了http所需的 中间件
        $kernel = $app->make(Kernel::class);

        # 处理请求
        $response = $kernel->handle(
            $request = Request::capture()
        )->send();
        
        # 终止请求
        $kernel->terminate($request, $response);
    ```

1. **\Illuminate\Foundation\Application::__construct**

    ```php
        初始化容器服务实例

        public function __construct($basePath = null)
        {
            if ($basePath) {
                $this->setBasePath($basePath);
            }

            # 注册绑定基础服务类
            $this->registerBaseBindings();
            # 注册绑定 事件，日志，路由
            $this->registerBaseServiceProviders();
            # 注册核心容器服务别名，就是别名跟跟服务类或者契约类映射绑定关系
            $this->registerCoreContainerAliases();
        }
        
    ```

1. **\Illuminate\Foundation\Http\Kernel::handle**

    ```php
        public function handle($request)
        {
            $this->requestStartedAt = Carbon::now();

            try {
                $request->enableHttpMethodParameterOverride();

                # 其实这里才是最重要最核心的
                # 
                $response = $this->sendRequestThroughRouter($request);
            } catch (Throwable $e) {
                $this->reportException($e);

                $response = $this->renderException($request, $e);
            }

            $this->app['events']->dispatch(
                new RequestHandled($request, $response)
            );

            return $response;
        }

        /**
         * Send the given request through the middleware / router.
         *
         * @param  \Illuminate\Http\Request  $request
         * @return \Illuminate\Http\Response
         */
        protected function sendRequestThroughRouter($request)
        {
            $this->app->instance('request', $request);

            Facade::clearResolvedInstance('request');

            # 启动
            $this->bootstrap();

            # 执行中间件，最后由实际路由绑定者执行请求并响应
            return (new Pipeline($this->app))
                        ->send($request)
                        ->through($this->app->shouldSkipMiddleware() ? [] : $this->middleware)
                        ->then($this->dispatchToRouter());
        }

        public function bootstrap()
        {
            if (! $this->app->hasBeenBootstrapped()) {
                # 加载环境变量，加载配置，异常捕获，注册门面，注册提供者，启动提供者
                $this->app->bootstrapWith($this->bootstrappers());
            }
        }
    ```

## 依赖注入，控制反转

1. 服务容器：用于管理类依赖以及实现依赖注入的强有力工具。依赖注入实现 => `\Illuminate\Container\BoundMethod::addDependencyForCallParameter`
1. 服务提供者：laravel中的服务都通过服务提供者来注册引导的。服务注册和和启动 => `\Illuminate\Contracts\Foundation\Application::bootstrapWith`
1. 门面别名：通过服务容器来实现类静态方法调用，通过 __callStatic调用 => `\Illuminate\Support\Facades\Facade::__callStatic`
1. 所有的Provider目录下的Manager类其实就是个工厂类，比如 `\Illuminate\Database\DatabaseManager::connection`， `\Illuminate\Log\LogManager::resolve`，`\Illuminate\Cache\CacheManager::resolve`等等

## laravel 设计模式

1. laravel 所使用中间件根据目的不同，既可以看作责任链，也可以看作装饰器
1. 所使用的事件是观察者模式，通过Event和Listener来实现
1. cache store 类使用了适配器模式，先用wrapper类将Cache类的功能生成，然后再使用Store类来统一接口
1. cache lock类使用了模板模式，父类Lock定义了算法骨架，一些算法操作延迟到了子类实现
1. `\Illuminate\Database\Eloquent\Builder` 和 `\Illuminate\Database\Query\Builder` 都使用建造者模式

## 快捷方法

1. `src/Illuminate/Collections/helpers.php`
1. `src/Illuminate/Events/functions.php`
1. `src/Illuminate/Foundation/helpers.php`
1. `src/Illuminate/Support/helpers.php`
1. `vendor/laravel/prompts/src/helpers.php`
1. `vendor/mockery/mockery/library/helpers.php`
