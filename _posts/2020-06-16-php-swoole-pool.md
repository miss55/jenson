---
layout: post
title: swoole进程池
tags: php swoole process-pool 
categories: common
---
- swoole进程池+协程撑起并发
- 场景：并发高且正常进程下容易阻塞并且不需要太大计算为主的。比如结合官网的协程http客户端或者easyswoole的http client扩展来做爬虫，并发也是杠杠的。

- 运行实例代码
  ```
  php process.php start
  php process.php status
  php process.php stop
  ```
- 实例代码
  ```php
    <?php
      /**
      * Created by PhpStorm.
      * User: jenson
      * Date: 2020/6/15
      * Time: 22:30
      */

      use Swoole\Runtime;
      use Swoole\Timer;

      class ProcessPool
      {
          const PREFIX = 'plm_';
          const POOL_NAME = 'test';
          const WORK_PREFIX = 'worker';

          public function run($type)
          {
              switch ($type) {
                  case 'start':
                      $this->start();
                      break;
                  case 'stop':
                      $this->stop();
                      break;
                  case 'status':
                      $this->status();
                      break;
                  default:
                      echo "please set start, stop, status";
                      break;
              }
          }

          /**
          * 进程池管理
          * 启动
          * 停止 平滑
          * 查看状态
          */
          private function start()
          {
              swoole_set_process_name($this->getPoolName());
              Runtime::enableCoroutine();
              
              # 进程数
              $workerNum = 5;
              # 每个进程里的协程数
              $maxGo = 20;

              $pool = new \Swoole\Process\Pool($workerNum, 0, 0, true);
              \Swoole\Process::daemon();

              \Swoole\Process::signal(SIGTERM, function (\Swoole\Process\Pool $pool) {
                  $pool->shutdown();
                  unset($pool);
              });

              $childName = $this->getWorkerName();
              
              # 统计协程总执行数
              $atomic = new Swoole\Atomic();

              $pool->on("WorkerStart", function (\Swoole\Process\Pool $pool, $workerId) use ($atomic, $maxGo, $childName) {
                  $pool->getProcess()->name("{$childName}_{$workerId}");
                  $running = true;

                  # 保证协程数不超
                  $chan = new \Co\Channel($maxGo);
                  
                  # 监听15信号，平滑推出
                  pcntl_signal(SIGTERM, function () use (&$running, $workerId) {
                      $running = false;
                      Timer::clearAll();
                  });

                  while (true) {
                      if (! $running) {
                          break;
                      }
                      if ($chan->isFull()) {
                          co::sleep(1.0);
                      } else {
                          go(function () use ($atomic, $chan) {
                              try {
                                  $chan->push(1);
                                  $atomic->add();
                                  # todo 真正协程执行体
                                  echo "do it ".$atomic->get(). " \n";
                                  co::sleep(1.0);
                              } finally {
                                  $chan->pop();
                              }
                          });
                          co::sleep(0.1);
                      }
                      # 触发信号
                      pcntl_signal_dispatch();
                  }
              });

              $pool->on("WorkerStop", function ($pool, $workerId) {
                  echo "Worker#{$workerId} is stopped\n";
              });

              $pool->start();
          }

          private function stop()
          {
              echo "stop...\n";
              $name = self::POOL_NAME;
              $cmd = "ps -ef | grep \"{$name}\" | grep -v grep | awk '{print $2}'| xargs kill -15";
              exec($cmd);
              sleep(1);
              echo "stop success\n";
          }

          private function status()
          {
              $prefix = self::PREFIX;
              $cmd = "ps -ef | grep \"{$prefix}\" | grep -v grep";
              exec($cmd, $output);
              if (!empty($output)) {
                  echo "查看：\n \t" . implode("\n\t", $output) . "\n";
              } else {
                  echo "无\n";
              }
          }

          private function getPoolName()
          {
              return self::PREFIX . '_' . self::POOL_NAME;
          }

          private function getWorkerName()
          {
              return self::PREFIX . '_' . self::WORK_PREFIX;
          }

      }

      $args = $argv;

      $process = new ProcessPool();
      $process->run($args[1] ?? '');

  ```