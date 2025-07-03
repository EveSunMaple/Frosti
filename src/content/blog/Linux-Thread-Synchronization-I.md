---
draft: true
title: "[Linux] 线程同步分析I: 线程为什么会饿死? 什么是条件变量? pthread_cond_wait()执行流程是怎么样的?"
pubDate: "2023-04-19"
description: '在线程只使用互斥的方式去访问临界资源时, 就有可能造成线程饥饿的情况.
那么 有没有一种可能, 可以让所有线程像排队一样, 一个一个地访问临界资源. 当一个线程访问完临界资源后, 再重新去队尾排队呢？.'
image: https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/202412191905529.webp
categories:
    - Blogs
tags: 
    - Linux系统
    - 多线程
    - 同步
---

线程互斥就是多线程在争抢使用临界资源, 谁抢到了谁就用, 抢不到的就等

这样不会因为多线程同时访问临界资源, 而可能造成错误

虽然没有错误, 但是, 思考另外一个问题: **这样合理吗？**

# 只互斥的问题: 饥饿

以最极端的例子来分析

当多线程互斥地争抢临界资源时

如果**存在一部分优先级非常高**的线程, 也**存在一部分优先级非常低(与高优先级线程存在断层)**的线程, 其他线程的优先级也不太低

那么可能会出现什么问题？

假设 高优先级线程A先抢夺到了临界资源, 然后上了互斥锁, 其他线程就只能在临界区外等

线程A访问完临界资源, 解了锁之后

所有线程又开始抢临界资源、抢锁

又有线程抢到了临界资源和锁, 也是高优先级的线程

那么 此线程用完临界资源, 解了锁之后

**所有线程又会抢临界资源、抢锁, 一直如此**

但是, 由于**有一部分线程的优先级非常低**, 与其他线程的优先级已经出现断层了.

那么, 在这种争抢的机制下, 这部分线程就**可能永远抢不到锁**, 也就永远无法被调度, 永远无法分配到资源

在这种情况下, 就可能出现 饥饿或饿死 的问题, 即, **执行流长时间无法获得某种资源的情况, 被称为 饥饿或饿死**

这种争抢临界资源的机制, 虽然没有错误, 但是很可能存在类似的线程饥饿的情况, 所以 是不太合理的

# 线程同步

在线程只使用互斥的方式去访问临界资源时, 就有可能造成线程饥饿的情况

那么 有没有一种可能, 可以让多线程在访问临界资源时, 依旧在某个时刻只能有一个线程访问临界资源

但是 可以让所有的线程按照一定的顺序访问临界资源呢?

即, 所有线程像排队一样, 一个一个地访问临界资源, 当一个线程访问完临界资源后, 再重新去队尾排队

这样就不会出现多线程争夺临界资源地情况, 而可能导致线程饥饿

确实存在这样的机制, 即 **在保证临界资源安全的前提下, 让执行流访问临界资源具有一定的顺序性**, 这种机制被称为**同步**

也就是本篇文章主要介绍的内容

> 虽然, 同步是指让执行流访问临界资源有一定顺序性的机制, 但是 互斥其实也是同步机制的一种
>
> 虽然, 只采用互斥 执行流访问资源还是乱序的
>
> 但, 它还是在一定程度上协调了多个线程的执行, 因为 互斥锁可以保证同一时刻 只有一个执行流访问临界资源
>
> 不过**本篇文章介绍时**会将同步和互斥区别开, 即 **同步不包括互斥**, 不然非常容易混淆.

## 条件变量

同步机制的实现, 一般离不开一个东西: **条件变量**

那么什么是条件变量呢？

**条件变量是一种可以实现线程同步的机制**

通过条件变量, 可以实现让线程有序的访问临界资源

线程需要访问临界资源时, 有时候如果临界资源不满足一定的条件, 可能不允许线程执行操作

比如, 如果线程需要访问一个队列, 但此时队列为空, 那么线程就无法访问, 就必须等待队列中出现新的内容之后, 此线程再访问队列

要想实现 如果某条件不满足时, 需要让线程等待, 且条件满足时, 可以让线程恢复继续执行的机制, 就需要用到 条件变量

解释了这么多, 究竟什么是条件变量呢？

其实, 代码中的条件变量 与 互斥锁很像

就是 `pthread`库提供的一个结构体类型`(pthread_cond_t)`的变量, 并且`pthread`库中也提供的操作条件变量的一些接口

### `cond`及接口

`cond`即 `condition`, 是条件的意思

`pthread_cond_t`即为**定义条件变量的类型**

条件变量的使用接口 与 互斥锁相似: 

![ ](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/image-20230419184512504.webp)

条件变量, 是由`pthread_cond_t`类型定义的

可以通过宏来初始化, 与互斥锁一样, **通过宏初始化**的条件变量变量 就**不需要去手动`destroy`**了

也可以通过`pthread_cond_init()`接口, 来初始化, 第一个参数是条件变量的地址, 第二个参数是条件变量的属性(可以不考虑)

通过`init`接口初始化的条件变量, 在不需要使用时, 需要调用`pthread_cond_destroy()`接口进行销毁

除了这两个接口外, 还有提供有使用条件变量的接口: 

![ ](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/image-20230419190529442.webp)

`pthread_cond_wait()`是`pthread`库提供的 使用条件变量进行等待的接口

线程调用此接口, 线程就会立即进入等待

`pthread_cond_timedwait()`也是`pthread`库提供的 使用条件变量进行等待的接口, 不过 此接口是一种让线程定时等待的接口

即, 可以通过此接口设置一定的时间, 在此时间内让线程等待

如果此时间内 等待被唤醒了, 继续执行代码, 如果超时了, 就返回一个错误码

这两个接口的参数, 除了需要条件变量, 还都**需要一个互斥锁**

从接口就可以反映出来, **条件变量一般是和互斥锁一起使用的**

这两个接口, 可以通过条件变量 **让线程等待**

![ ](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/image-20230419191343494.webp)

有通过条件变量 让线程等待的接口, 就有通过条件变量唤醒线程的接口.

`pthread_cond_signal()`, 调用此接口, 可以让**某个** **通过指定条件变量陷入等待的线程被唤醒**

`pthread_cond_broadcast()`, 调用此接口, 则可以让**所有** **通过指定条件变量陷入等待的线程唤被醒**

### `cond`及接口的使用演示

对于条件变量相关的接口, 先来演示一下, 条件变量是如何使用的: 

```cpp
#include <iostream>
#include <unistd.h>
#include <pthread.h>
using std::cin;
using std::cout;
using std::endl;

// 定义并初始化全局互斥锁
pthread_mutex_t mutex = PTHREAD_MUTEX_INITIALIZER;
// 定义全局条件变量
pthread_cond_t cond;

void* waitCommand(void* args) {
    pthread_detach(pthread_self()); 
    // 先让线程自己分离自己, 我们就不在主线程中回收线程了
    // 在此例中, 如果不分离, 线程回收会是个问题. 但具体问题后面再解释和解决
    // 这里我们只是展示一下 接口的最基本的用法和现象
    const char* name = (const char*)args;

    while (true) {
        pthread_cond_wait(&cond, &mutex);
        
        // 此输出不表示任务执行, 只用于表示此线程被唤醒一次
        cout << name << ", tid: " << pthread_self() << ", run……" << endl;
    }

    return nullptr;
}

int main() {
    pthread_cond_init(&cond, nullptr);

    pthread_t tid1, tid2, tid3;
    pthread_create(&tid1, nullptr, waitCommand, (void*)"Thread_1");
    pthread_create(&tid2, nullptr, waitCommand, (void*)"Thread_2");
    pthread_create(&tid3, nullptr, waitCommand, (void*)"Thread_3");
    
    while (true) {
        char c = 'a';
        cout << "请输入你的命令(N/Q):: ";
        cin >> c;
        if (c == 'N' | c == 'n') {
            pthread_cond_signal(&cond);
        }
        else
            break;
        
        usleep(1000);       // 让主线程usleep一下, 防止线程之间在屏幕上打印干扰
    }

    pthread_cond_destroy(&cond);
    return 0;
}
```

此代码中, 先定义并初始化了全局互斥锁和条件变量

然后创建线程, 线程执行的函数会使线程循环, 由条件变量进入等待

然后在主线程中通过输入`n`和`N`来调用唤醒函数, 唤醒线程, 观察现象: 

![show_cond |inline](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/show_cond.gif)

在其他线程通过条件变量等待时, 在主线程内通过 输入`N`和`n`来唤醒等待的线程

观察线程的唤醒现象, 其实可以发现**线程的唤醒是以一定顺序来执行的**

除了使用`pthread_cond_signal()`来单个唤醒等待的线程

还可以使用`pthread_cond_broadcast()`来广播唤醒所有等待的线程: 

![使用 broadcast 唤醒所有等待的线程 |inline](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/show_cond_broadcast.gif)

这里演示的是, `cond`条件变量的没有场景的用法

而介绍条件变量时说, 当前有条件不满足时, 会使用条件变量让线程等待

我们可以设置一个退出条件`quit`, 为真时即为满足, 为假时即为不满足

```cpp
#include <iostream>
#include <unistd.h>
#include <pthread.h>
using std::cin;
using std::cout;
using std::endl;

// 定义并初始化全局互斥锁
pthread_mutex_t mutex = PTHREAD_MUTEX_INITIALIZER;
// 定义全局条件变量
pthread_cond_t cond;

// // 定义一个全局退出变量, 用于判断条件
volatile bool quit = false;

void* waitCommand(void* args) {
    pthread_detach(pthread_self()); 
    
    const char* name = (const char*)args;

    while (!quit) {
        //  不满足退出条件, 就进来等待
        pthread_cond_wait(&cond, &mutex);
        
        // 此输出不表示任务执行, 只用于表示此线程被唤醒一次
        cout << name << ", tid: " << pthread_self() << ", run……" << endl;
    }
    pthread_mutex_unlock(&mutex);       // 暂时不解释 这里解锁的原因
    cout << name << ", tid: " << pthread_self() << ", end……" << endl;

    return nullptr;
}

int main() {
    pthread_cond_init(&cond, nullptr);

    pthread_t tid1, tid2, tid3;
    pthread_create(&tid1, nullptr, waitCommand, (void*)"Thread_1");
    pthread_create(&tid2, nullptr, waitCommand, (void*)"Thread_2");
    pthread_create(&tid3, nullptr, waitCommand, (void*)"Thread_3");
    
    while (true) {
        char c = 'a';
        cout << "请输入你的命令(N/Q):: ";
        cin >> c;
        if (c == 'N' | c == 'n') {
            pthread_cond_broadcast(&cond);
        }
        else {
            quit = true;						// 修改条件为满足
            pthread_cond_broadcast(&cond); 		// 然后唤醒线程, 再让线程判断条件是否满足
            break;
        }
        
        usleep(1000);       // 让主线程usleep一下, 防止线程之间在屏幕上打印干扰
    }

    pthread_cond_destroy(&cond);

    return 0;
}
```

这段代码中, 定义了一个条件`quit`, `quit`为真时即为满足条件, `quit`为假时即为不满足条件

循环判断条件是否满足, 不满足条件, 就让线程使用条件变量等待, 如果条件满足, 线程被唤醒就会退出此层循环

输入`N`和`n`时, 唤醒一下线程, 让线程继续判断条件是否满足, **非`N`和`n`时, 让退出条件被满足, 并唤醒线程**

执行结果为: 

![|inline](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/show_cond_broadcast_withquit.gif)

这就是条件和条件变量的最简单的使用

条件是线程是否继续执行的条件

条件变量的用法和功能, 是要在条件不满足时, 让线程此条件变量上等待

**条件变量不是条件, 条件是需求, 条件变量则是需求不满足时, 让线程等待的工具**

使用条件变量可以让多线程的执行具有一定的顺序性, 即可以实现同步

### 为什么条件变量需要与互斥锁一起使用？

上面展示的例子中, `pthread_cond_wait()`的使用需要同时用到 条件变量和互斥锁. 

这里为什么需要使用互斥锁呢？

首先, 条件等待是使用条件变量实现同步的一种机制

如果只有一个线程, 没有其他线程唤醒等待的线程, 线程就会一直等下去, 因为唯一的线程在等待, 也没有线程修改条件, 条件也不可能满足

所以需要一个线程使条件变得满足, 然后再唤醒等待的线程

这里的**条件**, 一般就是**线程需要访问的临界资源的状态**

就像介绍互斥时的抢票动作, 需要保证剩余票数>0才能抢票

而, 这种条件、需求是不可能的无缘无故地就自己满足的, 所以 **条件的满足势必存在临界资源数据的变化**

所以, 需要用互斥锁来保护临界资源, 即 **在判断条件是否满足之前要加锁**

所以, **线程使用条件变量的完整流程**应该是:

1. 线程判断条件是否满足之前, **先上锁**, 因为条件是可能被修改的临界资源

2. 然后, 再判断是否条件是否满足, 一般是循环判断

3. 如果**不满足**, 则进入循环体内, 调用`pthread_cond_wait()`

    此时, `pthread_cond_wait()`函数内部, 会**先对 为保护临界资源而上的锁 解锁**, 以确保其他线程能够正常访问到临界资源

    然后, 再通过条件变量陷入等待

    ---

    如果**满足**, 线程就正常执行

4. 线程通过条件变量等待时, 其他线程可以获取同一把锁, 然后访问临界资源

    **获取到锁的线程, 可以修改临界资源, 让条件变成满足**

5. 临界资源被某个线程修改, 即 条件变得满足时, 此线程会释放锁, 然后**唤醒 因为条件不满足, 在条件变量上等待的线程**

6. 在条件变量上等待的线程被唤醒时, **首先需要再次获取锁**

    因为, 虽然 其他线程发起唤醒这个动作时, 条件是满足的, 但是 线程真正被唤醒时, 条件可能又不满足了

    所以, 需要先获取锁, 然后**再判断条件是否满足**

    ---

    为什么线程真正被唤醒时, 条件可能又不满足了?

    首先, 确定一个点: **同一个条件, 不同线程会使用同一个条件变量来等待, 也会使用同一把锁来保护临界资源**

    所以, 由于不能保证只有一个线程在竞争同一条件, 也不能保证只有一个线程在竞争锁

    条件变量的线程唤醒动作, 可能会唤醒多个在同一个条件变量上等待的线程, 然后被唤醒的线程会竞争同一把锁

    但, 只有一个线程能够竞争到锁, 此时 其他被唤醒的线程又会等待锁

    竞争到锁的线程, 能够访问临界资源, 处理完任务, 就可能使条件再次变为不满足

    此时, 访问完临界资源的线程 释放锁, 就会有其他竞争锁的线程恢复执行, 此时就应该再次判断条件是否满足

    所以, **条件是否满足一般会循环判断**

整个过程的重点就是, **谁需要访问临界资源就立刻上锁, 谁不需要了就立刻解锁**

即 **保证整个过程中临界资源是被保护着的**

整个过程中, 一个线程中 除了第一次对临界资源上锁和最后一次对临界资源解锁, 中间所有的上锁和解锁的操作, 都是由`pthread_cond_wait()`完成的

线程需要等待时要调用`pthread_cond_wait()`解锁并等待, 在线程被唤醒时, 会自动再去竞争锁

解锁和上锁的操作都是在`pthread_cond_wait()`接口内部实现的

这也是为什么, 上面例子中, 想让多线程退出时需要在条件满足时先释放锁, 然后再让线程退出: 

![ |inline](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/image-20230420121724747.webp)

在`第2行`, 我们让线程分离自己, 不用回收.

在`第13行`, 我们执行了解锁操作

因为`pthread_cond_wait()`陷入等待时, 会释放锁, 然后被唤醒的时候, 又会会竞争锁

即, 退出条件满足时, 条件判断的循环退出之后, **锁是被线程占有的, 所以在退出之前要先解锁**

不然后面会出现死锁的状态(如果我们不分离线程的话): 

![ |inline](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/cond_exitnounlock_deadlock.gif)

---

为什么`pthread_cond_wait()`需要条件变量和互斥锁一起使用？

因为`pthread_cond_wait()`接口需要执行释放锁和竞争锁的操作, 所以 需要先看到锁