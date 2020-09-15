---
layout: post
title: php实现redis lock
tags: php redis-lock
categories: php
---
> 

#### 场景
- 在并发时，使用redis来做分布式锁。阅读了laravel的\Illuminate\Cache\RedisLock；发现其加锁还是有点小小的缺陷，不过在传统php中问题应该不大

#### 问题点：
1. 加锁的时候是分步加锁，会导致问题：如果第二步加过期时间没成功，则会导致死锁。
2. 删除锁的时候没有唯一判断，导致问题：如果当前的锁因为超时导致锁被另一个程序用上，则原来程序没有判断就将其删除

```php
    # laravel redis 锁部分代码
    /**
     * Attempt to acquire the lock.
     *
     * @return bool
     */
    public function acquire()
    {
        $result = $this->redis->setnx($this->name, 1);

        if ($result === 1 && $this->seconds > 0) {
            $this->redis->expire($this->name, $this->seconds);
        }

        return $result === 1;
    }

    /**
     * Release the lock.
     *
     * @return void
     */
    public function release()
    {
        $this->redis->del($this->name);
    }
```

#### 解决方法：
- 加锁可以使用set命令，并且加入EX和NX选项，并且value为一个版本号
- 或者可以使用redis lua script来将上面命令封装在一起
- 释放锁则使用lua脚本先判断版本号，如果一致则删除
- 比如：
    ```php
        public function acquire()
        {
            $redis = get_redis("redis");
            $result = $redis->set($this->name, $this->requireId, ['NX', 'EX' => $this->second]);

            return $result === true;
        }

        public function release()
        {
            $script = "if redis.call('get', '{$this->name}') == '{$this->requireId}' then return redis.call('del', '{$this->name}') else return 0 end";
            $result = $this->eval($script, 0, null);
            return $result === 1;
        }
    ```
#### 仍存在问题：
1. 业务执行时长大于超时时长
2. 业务执行一半程序退出，是否要能够恢复锁，涉及到版本号和超时的设置