---
draft: true
title: "[Linux] 线程同步分析总汇: 什么是条件变量？生产者消费者模型是什么？POSIX信号量怎么用？阻塞队列和环形队列模拟生产者消费者模型"
pubDate: "2023-04-19"
description: '在线程只使用互斥的方式去访问临界资源时, 就有可能造成线程饥饿的情况.
那么 有没有一种可能, 可以让所有线程像排队一样, 一个一个地访问临界资源. 当一个线程访问完临界资源后, 再重新去队尾排队呢？.'
image: https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/202306251802921.webp
categories:
    - Blogs
tags: 
    - 多线程
    - POSIX信号量
    - 生产者消费者模型
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

## 生产者消费者模型介绍 **

生产者消费者模型, 是一种编程模型

> 这里的生产者和消费者, **不以生物学的角度**看待

不过如何理解的话, 可以举一个生活中的例子

以生活中的超市为例: 

超市是供所有人来购买商品的, 那么可以将人看作消费者, 以下 *以学生来代表消费者*

而超市中的商品, 是由工厂供应商来生产供应的, 那么可以 *将工厂看作生产者*

那么, 学生购买商品, 工厂供应商品, 其实都是通过**超市**这个渠道的:

![|big](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/image-20230420102219748.webp)

---

为什么学生不直接通过工厂来购买商品, 工厂不根据学生的具体需求来生产供应呢？

为什么？来想象一件事情: 

有一位学生想要吃一包辣条, 他就直接去了生产辣条的工厂

学生说: 我想吃一包辣条, 你们给我生产一包

工厂听到有人需要一包辣条, 就开动机器只生产了一包辣条, 卖给了学生一包辣条

这合理吗？很明显不合理啊！

学生想要买一包辣条, 需要先去工厂告诉工厂, 然后等~

工厂听到学生要买一包辣条, 然后就开动机器去制作了一包, 制作完成卖给学生

这样的成本可太高了吧

工厂 为生产一包辣条 机器就开动了, 那这机器、电力等各种损耗一包辣条肯定没法弥补

还有学生, 像简简单单买包辣条还要告诉工厂, 让工厂现场生产, 这纯浪费时间

所以, 工厂一般情况下是无法直接与消费者买卖商品的

---

工厂无法直接与消费者买卖商品, 就可以通过超市这个媒介

超市因为要供所有的消费者来购买商品, 所以一般需要大量的商品

这时候 工厂就可以火力全开生产商品了

而消费者 也可以直接在超市购买现成的商品

那么, 超市的存在 第一个作用就是**提高了效率**

除此之外, 工厂也不需要直接根据学生的需求再来生产商品

假设只要有商品就能卖出去:

那么 工厂就可以不停的生产商品, 为的是给超市供货

而超市只要保持有商品, 那么 学生过来直接购买就可以了, 也不用再去跟工厂说

这就把上面例子中 学生与工厂之间的强耦合关系就没有了, 变成了松耦合

消费者没有去购买商品, 工厂也可以一直生产; 工厂没有生产商品, 只要超市里有, 消费者也可以直接去购买

这 也就是超市的第二个作用 **解耦**

那么, 超市有没有很像 工厂与消费者之间的缓冲区 一样的存在？

---

将这样的模型拿到编程中, 将消费者 看作**消费线程**, 将生产者 看作**生产线程**

消费线程需要从超市中拿东西, 生产线程需要向超市中放东西

超市又可以看做什么呢？

超市其实就可以看作是**临界资源**

而在生活中, 消费者不可能只有一个, 生产者也不可能只有一个

那么: 

1. #### 消费者与消费者之间是什么关系？

  消费者与消费者之间好像是没有关系, 你买你的我买我的, 互不干扰

  但是 仔细想一想, **消费者与消费者之间实际是一种 竞争关系**

  互不干扰是因为商品充足, 如果商品不足的话, 是需要竞争的

  而竞争关系, 其实是一种**互斥关系**

2. #### 生产者与生产者之间是什么关系？

  生产者与生产者之间, 其实也是一种竞争关系

  竞争超市内的空间资源, 竞争谁可以给超市供货

  即 **互斥关系**

3. #### 消费者与生产者之间需要什么关系？

	消费者和生产者, 看似是没有之间的关系的
	
	但是思考一个问题, 既然超市是临界资源, 那么消费者和生产者是可能在同一时间访问临界资源的
	
	如果 供应商再给超市供货的时候, 货还没有供完, 货架上的东西还没有放完
	
	在生活中我们可以直接拿走一个, 然后去超市结账
	
	但是, 如果从计算机的角度来看, 生产线程还没有向临界资源内写完数据, 消费线程可以从临界资源中拿走数据吗？
	
	很明显是不可以的, 因为 消费线程可能拿不到完整的资源
	
	所以, **以计算机的角度来说, 消费者和生产者首先 要保持一个互斥关系**
	
	而除了互斥之外, 其实 **还需要保持*同步***
	
	因为消费者不能在超市没有商品的时候购买商品, 需要等待, 让生产者先向超市供货
	
	生产者也不能在超市的空间资源已满的情况下继续向超市供货, 需要等待, 让消费者先购买商品
	
	等到超市有商品了, 再通知消费者来购买
	
	等到超市有空间了, 再通知生产者来供货

以计算机的角度看待这个生产者消费者模型: 

生产者消费者模型存在的关系: **生产者之间(互斥关系)**, **消费者之间(互斥关系)**, **生产者和消费者之间(互斥、同步关系)**, 共`3`类

生产者和消费者: 是线程承担的`2`种角色

超市: 为生产者和消费者之间提供缓冲、解耦, 类似 缓冲区、临界资源的`1`个交易场所

交易场所是让不同的线程之间进行**"交易"**的

**即, 可以将生产者消费者模型以这种: `3、2、1`的思想来理解**

而在编程中, 就可以围绕这个`3、2、1`的模型, 来解决问题

即, 多线程访问临界资源, 生产线程之间保持互斥、消费线程之间保持互斥、生产线程和消费线程之间保持互斥、同步

这样来整理思路, 可以方便解决很多问题

而最重要的就是: **如何让生产线程和消费线程之间保持互斥和同步?**

同步需要根据条件让生产线程和消费线程等待和唤醒

那么 **如何让生产线程或消费线程等待？又如何让生产线程和消费线程被唤醒？又如何判断所需条件是否被满足？**

而 让线程等待和唤醒线程的功能, 其实**条件变量**就可以为我们提供

### 生产者消费者模型的优点

生产者消费者模型的优点, 可以有三个: 

1. 解耦, 可以将两个角色之间的 强耦合关系 变为 松耦合关系
2. 支持并发
3. 支持忙闲不均

这就是生产者消费者模型的优点 

## 以阻塞队列模拟生产者消费者模型 **

阻塞队列: 

当队列为空时, 从队列中获取元素的操作将会被阻塞, 直到队列中被放入了元素

当队列为满时, 向队列中存放元素的操作也会被阻塞, 直到有元素被从队列中取出

(以上的操作都是基于不同的线程来说的, 线程在对阻塞队列进程操作时会被阻塞)  

阻塞队列的特点像一个管道, 可以使用阻塞队列, 模拟一个生产者消费者模型

那么, 阻塞队列的大致结构为: 

![|inline](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/image-20230420151703532.webp)

成员变量: 

1. `uint32_t _cap` 记录阻塞队列的容量
2. `queue<T> _bq`, 即为阻塞队列本身
3. `_mutex`、`_conCond`、`_proCond` 一个互斥锁, 两个线程分别用的条件变量

构造函数负责初始化容量、互斥锁和条件变量, 析构函数负责摧毁 互斥锁和条件变量

结构定义完成之后, 就需要根据我们需要实现的功能 封装一些私有的成员函数: 

上锁、解锁、条件等待、唤醒等待、判空、判满、生产任务、消费任务

![|inline](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/image-20230420163113768.webp)

这些都是私有的接口, 实际还需要两个公共的接口

完整的从阻塞队列中消费的接口 以及 完整的向阻塞队列中生产的接口:

![|inline](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/image-20230420163247899.webp)

实现了之后, 就可以测试一下了: 

`blockQueue.hpp:`

```cpp
#pragma once
#include <iostream>
#include <queue>
#include <pthread.h>
#include <unistd.h>
#include <cstdlib>
using std::queue;
using std::cout;
using std::endl;

const uint32_t gDefultCap = 5;

template <class T>
class blockQueue {
public:
    // 构造函数
    blockQueue(uint32_t cap  = gDefultCap) 
        :_cap(cap) {
        pthread_mutex_init(&_mutex, nullptr);           // 初始化锁
        pthread_cond_init(&_proCond, nullptr);          // 初始化生产线程使用的条件变量
        pthread_cond_init(&_conCond, nullptr);          // 初始化消费线程使用的条件变量
    }
    // 析构函数
    ~blockQueue() {
        pthread_mutex_destroy(&_mutex);
        pthread_cond_destroy(&_conCond);
        pthread_cond_destroy(&_proCond);
    }
    // 生产接口
    void push(const T &in) {
        // 生产的全过程为
        // 1. 上锁
        // 2. 判满. 满不生产 条件等待, 不满则生产.
        // 3. 生产之后, 解锁
        // 4. 唤醒消费接口

        lockQueue();        // 上锁
        while(isFull()) {
            // 满 进入条件等待
            condWait(_proCond);        // 传入生产线程所用的条件变量, 让生产线程等待
        }
        // 不满 则生产
        pushCore(in);
        // 解锁
        unlockQueue();
        condWakeUp(_conCond);          // 传入消费线程所用的条件变量, 唤醒消费线程
    }

    T pop() {
        // 消费的全过程为
        // 1. 上锁
        // 2. 判空. 空则不消费 条件等待, 不空 则消费
        // 3. 消费之后, 解锁
        // 4. 唤醒生产接口

        lockQueue();
        while(isEmpty()) {
            condWait(_conCond);
        }
        T tmp = popCore();
        unlockQueue();
        condWakeUp(_proCond);

        return tmp;
    }


private:
    // 队列上锁
    void lockQueue() {
        pthread_mutex_lock(&_mutex);
    }
    // 队列解锁
    void unlockQueue() {
        pthread_mutex_unlock(&_mutex);
    }
    // 判空
    bool isEmpty() {
        return _bq.empty();
    }
    // 判满
    bool isFull() {
        return _bq.size() == _cap;
    }
    // 条件等待
    void condWait(pthread_cond_t &cond) {
        pthread_cond_wait(&cond, &_mutex);
    }
    // 唤醒等待
    void condWakeUp(pthread_cond_t &cond) {
        pthread_cond_signal(&cond);
    }
    // 生产任务
    void pushCore(const T &in) {
        // 即为向队列中添加任务
        _bq.push(in);
    }
    // 消费任务
    T popCore() {
        // 即从队列中拿出任务
        T tmp = _bq.front();
        _bq.pop();
        return tmp;
    }

private:
    uint32_t _cap;                  // 队列容量
    queue<T> _bq;                   // 阻塞队列
    pthread_mutex_t _mutex;         // 互斥锁
    pthread_cond_t _conCond;        // 消费线程使用的条件变量
    pthread_cond_t _proCond;        // 生产线程使用的条件变量
};
```

`blockQueue.cc:` 

```cpp
#include <iostream>
#include <ctime>
#include "blockQueue.hpp"
using std::cout;
using std::endl;

void* productor(void* args) {
    blockQueue<int>* pBq = static_cast<blockQueue<int>*>(args);
    while (true) {
        // 制作数据
        int data = rand() % 10;
        // 向队列中生产数据
        pBq->push(data);
        cout << "productor 生产数据完成……" << data << endl;
        sleep(2);
    }

    return nullptr;
}

void* consumer(void* args) {
    blockQueue<int>* pBq = static_cast<blockQueue<int>*>(args);
    while (true) {
        int data = pBq->pop();
        cout << "consumer 消费数据完成……" << data << endl;
    }

    return nullptr;
}

int main() {
    // 设置一个随机数种子
    srand((unsigned long)time(nullptr) ^ getpid());
    // 定义阻塞队列
    // 创建两个线程

    blockQueue<int> bq;

    pthread_t pro, con;
    pthread_create(&pro, nullptr, productor, &bq); // 生产线程
    pthread_create(&con, nullptr, consumer, &bq);  // 消费线程

    pthread_join(pro, nullptr);
    pthread_join(con, nullptr);

    return 0;
}
```

我们 使用阻塞队列, 

创建`productor`生产者, 每`2s`创建随机数并`push`入队列中

创建`consumer`消费者, 从队列中取数据, 不做间隔限制

执行结果为: 

![|inline](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/pro_con_data_test.gif)

`productor`生产线程 每2s, 生产一个数据, `consumer`消费线程跟随生产的节奏来消费数据.

如果我们修改一下生产和消费的间隔, 或许更能说明条件变量的作用: 

![|inline](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/image-20230420165209035.webp)

消费线程2s一消费, 生产线程1s一生产: 

![|inline](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/pro_con_data_12.gif)

可以看到, 刚开始因为 队列未满, 所以`1s`生成一个, 顺序为: `5 4 3 3 4 0 1 6`

而 消费`2s`一次的顺序为 `5 4 3 3`

之后 队列满, 所以 生产数据的速度会跟随消费数据的速度

---

### 问题1: 条件判断的语句

上面实现 生产和消费 接口的时候, 判断条件是否满足使用的是`while()`而不是`if()`为什么？

这个问题, 已经回答过了, 在上面分析`pthread_cond_wait()`流程的时候

### 问题2: 什么时候唤醒 或者 什么时候解锁？

![|inline](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/image-20230420171705354.webp)

上面实现的接口, **队列的解锁是在唤醒线程之前的, 即先解锁, 再唤醒线程**

那么, **可不可以 先唤醒线程, 再解锁呢？** 有没有什么影响呢？

其实是没有多少影响的

先解锁, 再唤醒线程; 也就意味着 唤醒线程之前 锁已经准备好了, 线程可以直接竞争锁

而 如果是先唤醒线程, 再解锁; 其实也就是 线程可以先准备着竞争锁, 等锁被解开之后, 再竞争锁就可以了

**没有数据安全上的影响**

## 理解生产者消费者模型的 并发

经过对条件变量的介绍和使用, 以及对生产者消费者模型的介绍和模拟

其实已经对条件变量 差不多是很熟悉了

也可以理解 生产者消费者模型的**解耦** **支持忙闲不均**的优点

但是, 好像并没有看到, 生产者消费者模型的 **支持并发**?

消费者从超市消费商品是互斥的, 生产者给超市生产商品也是互斥的, 消费者与生产者也不能同时从超市消费或给超市生产

**并发体现在哪里呢？**

上面模拟了一个生产者消费者模型, 但是生产数据和消费数据的过程其实并不明显

因为只有定义和返回 只有一个语句

下面使用另外一个类, 当作阻塞队列的数据类型:

`Task.hpp:`

```cpp
#pragma once
#include <iostream>
#include <string>

class Task {
public:
    Task(int one = 0, int two = 0, char op = 0)
        : elemOne_(one)
        , elemTwo_(two)
        , operator_(op) {}

    // 仿函数定义
    int operator()() {
        return run();
    }

    int run() {
        int result = 0;
        switch (operator_) {
        case '+':
            result = elemOne_ + elemTwo_;
            break;
        case '-':
            result = elemOne_ - elemTwo_;
            break;
        case '*':
            result = elemOne_ * elemTwo_;
            break;
        case '/': 
            // 除0处理
            if (elemTwo_ == 0) {
                std::cout << "div zero, abort" << std::endl;
                result = -1;
            }
            else {
                result = elemOne_ / elemTwo_;
            }
            break;
        case '%': 
            // 除0处理
            if (elemTwo_ == 0) {
                std::cout << "mod zero, abort" << std::endl;
                result = -1;
            }
            else {
                result = elemOne_ % elemTwo_;
            }
            break;
        default:
            std::cout << "非法操作: " << operator_ << std::endl;
            break;
        }

        return result;
    }

    int get(int* e1, int* e2, char* op) {
        *e1 = elemOne_;
        *e2 = elemTwo_;
        *op = operator_;

        return 0;
    }

private:
    int elemOne_;
    int elemTwo_;
    char operator_;
};
```

 `blockQueue.cc:`

```cpp
#include <iostream>
#include <ctime>
#include "blockQueue.hpp"
#include "Task.hpp"
using std::cout;
using std::endl;

const std::string ops = "+-*/%";

// 生产任务接口
void* productor(void* args) {
    blockQueue<Task>* pBq = static_cast<blockQueue<Task>*>(args);
    while (true) {
        // 制作任务
        int elemOne = rand() % 50;
        int elemTwo = rand() % 10;
        char oper = ops[rand() % 4];        // 操作符
        Task t(elemOne, elemTwo, oper);
        // 生产任务
        pBq->push(t);
        cout << "producter[" << pthread_self() << "] " <<
            (unsigned long)time(nullptr) << " 生产了一个任务: " <<
            elemOne << oper << elemTwo << "=?" << endl;
        sleep(1);
    }

    return nullptr;
}

void* consumer(void* args) {
    blockQueue<Task>* pBq = static_cast<blockQueue<Task>*>(args);
    while (true) {
        // 消费任务
        Task t = pBq->pop();
        // 处理任务
        int result = t();
        int elemOne, elemTwo;
        char oper;
        t.get(&elemOne, &elemTwo, &oper);
        cout << "consumer[" << pthread_self() << "] " <<
            (unsigned long)time(nullptr) << " 消费了一个任务: " <<
            elemOne << oper << elemTwo << "=" << result << endl;
    }

    return nullptr;
}

int main() {
    // 设置一个随机数种子
    srand((unsigned long)time(nullptr) ^ getpid());
    // 定义阻塞队列
    // 创建两个线程
    blockQueue<Task> bq;

    pthread_t pro, con;
    pthread_create(&pro, nullptr, productor, &bq); // 生产线程
    pthread_create(&con, nullptr, consumer, &bq);  // 消费线程

    pthread_join(pro, nullptr);
    pthread_join(con, nullptr);

    return 0;
}
```

`blockQueue.hpp`还是上面的内容

那么, 这段代码的执行结果: 

![|inline](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/pro_con_task.gif)

上面代码, 是使用阻塞队列 模拟生产者消费者模型, **生产和消费加减乘除的任务**

---

但是上面这个例子, 好像还是没有表现出 生产者消费者模型对并发的支持

依旧是 消费者从超市消费商品是互斥的, 生产者给超市生产商品也是互斥的, 消费者与生产者也不能同时从超市消费或给超市生产

那么, 此模型支持并发, 究竟体现在哪里呢？

生产者消费者模型支持并发, 其实**并不是指 消费者和生产者可以并发的向"超市"消费或生产数据**

而是指, **生产者制作商品\任务 、消费者处理商品\任务 的这种过程, 其实是并发执行的**

在上例中, 就是生产者制作任务 和 消费者处理任务的过程 : 

![|inline](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/image-20230420183123290.webp)

虽然 还是不太明显, 但是 多行的语句其实已经可以说明, 制作任务和处理任务的过程其实是需要消耗一定的资源的, 比如时间

**并行的制作任务 再串行的向队列中生产. 串行的从队列中消费任务, 然后并行的处理任务**

向队列中生产任务, 只是将已经制作好的任务`push`入队列的过程

从队列中消费任务, 只是从队列中将任务`pop`出来的过程

在生产到队列中之前, 还有一个**可能会非常漫长的制作任务的过程**

在消费任务之后, 也有一个**可能非常漫长的处理任务的过程**

制作任务是可以并行制作的, 处理任务也是可以并行处理的, 制作任务和处理任务也是可以并行操作的

这些过程互不影响

也就是说, 生产者消费者模型支持并发的特点, **并不是在临界区并发**, 而是**生产前和消费后支持并发**

生产者消费者模型的支持忙闲不均, 同样体现在生产前和消费后的制作和处理上

## POSIX信号量

`信号量` 也是同步的一种机制

### 什么是信号量？

那么什么是信号量呢？信号量可以看作是一个计数器

以生活中的一个例子 来简单的解释一下信号量: 看电影

如果我们已经有了想要看的电影, 我们去电影院首先要做的事是什么？选放映厅, 然后选座

电影院的每一个放映厅的座位都是**有限**的, 不过**每一个空座位都可以被任何人选择**

要看电影, 就需要选座位买票, 每买一张票选一个座位, 放映厅内的空座位就会少一个

买到了电影票, 实际上就是选了放映厅内指定的座位, 让空座位`-1`

那么, 以编程的角度:

放映厅就可以看作为一个 **临界资源**, 每一个座位都是临界资源的一小部分资源

**所有的座位就可以看作是信号量**

当有人买票时选中了座位, 接下来可选择的座位就少了一个, 可以看作**信号量`--`**

如果有人退票, 就可以看作是**信号量`++`**

当放映厅里没有了空座位, 就表示**信号量减到了`0`**, 其他人再想要买票, 就需要等有人退票

也就是说, 信号量`-1`表示着临界资源中的一部分被选中了, 也就表示着之后只能选择临界资源的其他部分

这样一个看电影选票的例子, 其实就可以很好的解释信号量

那么, 提问: 如果一个放映厅只有一个座位, 也就是说**信号量最大为`1`**, 那么 信号量可以表示什么？

**互斥锁!** 

如果信号量只有1, 那么此信号量就可以当互斥锁用

此时, 信号量`1 –> 0`就是上锁的过程

信号量`0 –> 1`就是解锁的过程.

信号量最大为`1`时, 此信号量被称为**二元信号量**

---

上面例子, 是将放映厅当作了一个临界资源, 每个座位都是临界资源得一部分

编程中的 **临界资源也是可以分为一小部分一小部分的**

临界资源分为一小部分一小部分的, 通过**信号量操作**来让线程选中

申请信号量, 实际就是对一部分临界资源的申请

那么 **如果申请到了信号量, 就表示一定获得了一部分临界资源吗？**

这个问题的答案是肯定的

**只要申请到了信号量, 就一定获得了一部分临界资源**

因为, 申请到只要不释放, 别人就无法申请, 从原则上来说, 已经获得了这部分资源

信号量可以被所有线程申请和释放, 即`--` 和 `++`

即 信号量也是一个临界资源. 即 信号量的申请和释放需要时原子性的

而实际代码上的实现也确实如此: **信号量的申请`--` 和 信号量的释放`++` 都是 原子性的**

### 信号量的接口

介绍过互斥锁和条件变量之后, 信号量的接口和使用其实就显得很简单了

首先, 信号量的类型为`sem_t`

其常用的基本接口有: 

#### 1. `sem_init()初始化:`

![ ](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/image-20230421141600499.webp)

#### 2. `sem_destroy()销毁:`

![ ](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/image-20230421141642143.webp)

#### 3. `sem_wait()等待, 即申请信号量:`

![ ](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/image-20230421141814088.webp)

#### 4. `sem_post()释放信号量:`

![ ](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/image-20230421141900366.webp)

这些接口, 也都是`pthread`库提供的, 需要使用的是`semphore.h`头文件

## 以环形队列模拟生产者消费者模型 **

上面使用条件变量 以阻塞队列模拟了生产者消费者模型

现在, 我们通过信号量 以环形队列模拟生产者消费者模型

不过首先要介绍一下什么是环形队列以及环形队列的特点:

### 环形队列

环形队列的物理实现肯定不是环形的, 只不过可以使用普通的数组模拟出环形队列的感觉

比如: 一个有限的数组`[0, 7]`一共8个空间 就能够模拟出一个环形的队列

队列的特点是 **先进先出**

而环形队列实现先进先出的方法是: **可变的队头**

用数组实现的普通队列的先进先出一般是固定的队头, 如果以`[0, 7]`来实现, 那么队头恒为`0`

![|inline](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/image-20230421153132693.webp)

先进先出总是 从`0`位置出, 然后将后面的元素向前移动一位

而环形队列不同

环形队列可以看作将数组卷了起来: 

![|medium](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/image-20230421144734700.webp)

环形队列 使用两个"指针"来表示队头和队尾

并且, 不同于普通的队列, **环形队列的队头是可以变化的**

举个例子: 

如果, 环形队列中, `0` `1` `2` `3`位置存储有数据

那么, 队头指针指向`0`, 队尾指针指向`3`或`4`

**出队列时**, 需要获取`0`位置的数据, 然后 **队头指针++, 移动到`1`, 新的队头就是`1`位置**

**入队列时**, 就是 **队尾指针++在存放数据, 或者存放数据后再++**

这就是环形队列的特点

**出队列时, 队头`++`改变, 即, 环形队列的任意位置都可能是队头**

队头移动了一位, 也就表示 **队尾可以多向后走一位**, 就像是在转圈一样

数组实现环形队列可以使出队列的操作更快, 因为不用移动数据

但是, 环形队列有一个缺点, 就是**不容易直接判断队列是否为满或为空 **

环形队列: 

队列为空, 队头和队尾指针指向同一位置

队列为满, 队头和队尾指针也指向同一位置

所以, 环形队列判断为空或未满, 一般通过入队列出队列计数器, 或者恒在队头的前一个位置留空来实现

---

那么, **总结一下**

什么是环形队列？

首先, **环形队列的长度是一定的**

其次, 队头和队尾用两个"指针"表示

数据入队列, 数据存储在队尾指针位置, 队尾指针向后`++`

数据出队列, 从队头指针位置获取数据, 队头指针向后`++`

当指针移动到数组的最后一个元素时, 再`++`就会回到`0`位置

两指针在同一个位置时, 队列可能为空, 也可能为满: 

1. 如果刚创建的队列, 那就为空
2. 如果队尾指针刚追上队头指针, 那就为满
3. 如果队头指针刚追上队尾指针, 那就为空

那么, 环形队列如何模拟生产者消费者模型呢？

### 模拟模型

#### 思路

其实, 模拟的思路也很简单

还是将线程分为生产者和消费者

生产者**生产数据**的动作, 即为 **将数据入队列**

消费者**消费数据**的动作, 即为 **将数据出队列**

当队列为空时, 生产者可以生产, 消费者不能消费

当队列为满时, 生产者不能生产, 消费者可以消费

此时的**生产线程和消费线程需要访问同一个位置**,  是**互斥与同步**的关系

当队列为其他情况时, 生产者和消费者可以并发的生产和消费

因为, 此时生产线程和消费线程访问的不是同一个位置

并且, 在队列中 **生产者不能超越消费者, 消费者也不能超越生产者**

**即, 队列满时, 不能再生产, 队列空时, 不能再消费**

这些在实现时, **都是由信号量来保证的**

首先要知道, 在队列中: 

1. 生产者需要的是什么资源？

	需要**空间资源**, 因为需要向队列中, 入数据

2. 消费者需要的是什么资源？

	需要**数据资源**, 因为需要从队列中, 出数据

那么, 就可以针对不同的资源, 创建两个信号量

一个信号量 表示空间资源量`roomSem`, 另一个信号量 表示数据资源量`dataSem`

**生产者**, 需要等待 `roomSem`, 即申请 空间资源信号量, 申请成功 则**空间资源信号量`--`**

并且, 申请成功就表示获得了一块空间资源, 别人就无法获取

然后, 等到生产数据入队列之后, **数据资源信号量还需要`++`**, 因为 有数据入队列了

**消费者**, 需要等待`dataSem`, 申请 数据资源信号量, 申请成功 则**数据资源信号量`--`**

等到数据出队列之后, **空间资源信号量是需要`++`**的

那么, 初始情况下`roomSem`应该为多少？ `dataSem` 应该为多少？

初始情况, **队列中没有数据, 所以`roomSem`应该为`N`, `dataSem`应该为`0`**

只要控制好, `roomSem++`时, 对应的`dataSem`需要`--`;  `dataSem++`时, 对应的`roomSem`需要`--`

就可以保证生产者、消费者不会互相超越

队列中没有数据时, `roomSem`为`N`, `dataSem`为`0`, 需要生产者先生产

队列中满数据时, `roomSem`为`0`, `dataSem`为`N`, 需要消费者先消费

这两种情况,  **生产者和消费者访问的是同一块空间, 所以是需要互斥、同步的**

而在其他情况时, 生产者和消费者不是指向同一空间, 那么**生产和消费的动作就可以并发**的执行

---

上面说了这么多模拟生产者消费者模型的思路

其实都是在一个前提下: **不同的线程访问的是临界资源的不同部分**

#### 使用信号量 模拟 生产者消费者模型

下面, 就来正式以环形队列模拟一下, 生产者消费者模型: 

`ringQueue.hpp:`

```cpp
#pragma once
#include <iostream>
#include <vector>
#include <semaphore.h>
using std::cout;
using std::endl;
using std::vector;

const int gDefultCap = 10; 

template <class T>
class ringQueue {
public:
    // 构造函数
    ringQueue(const int cap = gDefultCap) 
        : _ringQueue(cap) 
        , _pIndex(0)
        , _cIndex(0) {
        sem_init(&_roomSem, 0, _ringQueue.size());
        sem_init(&_dataSem, 0, 0);
        // sem_init() 接口的 
        // 第一个参数是 需要初始化的信号量, 
        // 第二个参数是 线程共享(0)还是进程共享
        // 第三个参数是 需要初始化为多少
    }
    
    // 析构函数
    ~ringQueue() {
        sem_destroy(&_roomSem);
        sem_destroy(&_dataSem);
    }
    
    // 生产接口
    void push(const T &in) {
        // 生产数据
        // 先申请空间信号量
        sem_wait(&_roomSem);            // 申请成功则 _roomSem--, 否则等待
        _ringQueue[_pIndex] = in;       // 将数据放入 数组
        sem_post(&_dataSem);            // 数组中数据+1, 那么 dataSem 需要++
        _pIndex++;                      // 生产者下一次生产数据的位置 ++
        _pIndex %= _ringQueue.size();   // 跟新下标, 保证环形特性
    }
    
    // 消费接口
    T pop() {
        // 消费数据
        // 先申请数据信号量
        sem_wait(&_dataSem);            // 申请成功则 _dataSem--, 否则等待
        T tmp = _ringQueue[_cIndex];    // 存储应拿到的数据
        sem_post(&_roomSem);            // 拿出了数据, 空间+1, 那么 _roomSem ++
        _cIndex++;
        _cIndex %= _ringQueue.size();

        return tmp;
    }


private:
    vector<T> _ringQueue;   // 模拟循环队列的数组
    sem_t _roomSem;         // 空间资源信号量, 生产者申请
    sem_t _dataSem;         // 数据资源信号量, 消费者申请
    uint32_t _pIndex;       // 生产者生产数据的索引下标, 即插入数据的下标
    uint32_t _cIndex;       // 消费者消费数据的索引下标, 即获取数据的下标
};
```

环形队列模拟生产者消费者模型的封装实现, 没有什么需要特别注意的点

首先成员是: 
1. 一个数组, 用来模拟环形队列
2. 一个空间信号量、一个数据信号量. 分别用来控制生产者对空间的申请, 消费者对数据的申请
3. 一个生产数据的索引下标, 一个消费数据的索引下标, 分别用来表示插入数据的下标, 和拿出数据的下标

其次, 就是初始化信号量的操作. `sem_init()`的使用: 

```cpp
int sem_init(sem_t *sem, int pshared, unsigned int value);
```

此接口需要传入三个参数:
1. `sem_t* sem`, 需要初始化的信号量
2. `int pshared`, 信号量的类型. 暂不考虑, 传入`0`
3. `unsigned int value`, 信号量的初始值

注意:  此接口不能对一个信号量重复使用

最后, 需要注意的就是: 

需要使用`_cIndex %= _ringQueue.size()`和`_pIndex %= _ringQueue.size()`来控制环形特性

因为, 在生产数据和消费数据后, `_pIndex`和`_cIndex`需要`++`

如果不控制, 迟早超出数组, 所以需要 取模控制一下, 并控制环形特性

`ringQueue.cc:`

```cpp
#include "ringQueue.hpp"
#include <iostream>
#include <ctime>
#include <unistd.h>
using std::cout;

// 消费线程调用函数
void* consumer(void* args) {
    ringQueue<int>* ringQp = static_cast<ringQueue<int>*>(args);
    while (true) {
        sleep(3);
        int data = ringQp->pop();
        cout << "consumer_pthread[" << pthread_self() << "]"
             << " 消费了一个数据: " << data << endl;
    }
}

// 生产线程调用函数
void* productor(void* args) {
    ringQueue<int>* ringQp = static_cast<ringQueue<int>*>(args);
    while (true) {
        int data = rand() % 20;
        ringQp->push(data);
        cout << "productor_pthread[" << pthread_self() << "]"
             << " 生产了一个数据: " << data << endl;
        sleep(1);
    }
}

int main() {
    srand((unsigned long)time(nullptr) ^ getpid());

    ringQueue<int> ringQ;

    pthread_t con, pro;
    pthread_create(&con, nullptr, consumer, &ringQ);
    pthread_create(&pro, nullptr, productor, &ringQ);

    pthread_join(con, nullptr);
    pthread_join(pro, nullptr);

    return 0;
}
```

主函数相关的代码, 就没有需要注意的地方了.

实现之后, 编译执行这段代码: 

![|inline](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/ringQueue_c1_p1.gif)

在代码中设置, `1s`生产一次数据, `3s`消费一次数据

所以, 从代码的执行结果中可以看到: 

刚开始, 生产3个数据, 消费1个数据, 并且**按照生产的顺序消费**

到后面, 由于消费速度不快, 所以队列很快被占满, 但是**生产者也并没有超越消费者去生产数据, 而是等着消费者消费之后, 再生产**

这是因为信号量在控制着

队列被占满时, `sem_wait(_roomSem)`是无法申请成功空间信号量的, 因为此时`_roomSem`为0

队列为空时, 则相反

不过, 此时实现的代码是 单生产线程和单消费线程的

如果是, 多生产线程和多消费线程, 当前模拟的生产者消费者模型的代码会出现错误吗？

毫无疑问, 会出现错误

因为, 如果是多线程生产和消费, 那么**对索引下标的保护就不合格**

在多线程生产时, 只要队列中存在足够的空间, 多线程就会并发的去访问 索引下标

而一个对象内只有一个索引下标, 如果不对索引下标添加保护, 就一定会造成错误

所以, **需要用锁来对索引下标进行保护**

那么, `ringQueue`封装的成员就需要改进一下: 

```cpp
#pragma once
#include <iostream>
#include <vector>
#include <semaphore.h>
using std::cout;
using std::endl;
using std::vector;

const int gDefultCap = 30; 				// 实现了多线程, 适当的将队列放大 

template <class T>
class ringQueue {
public:
    // 构造函数
    ringQueue(const int cap = gDefultCap) 
        : _ringQueue(cap) 
        , _pIndex(0)
        , _cIndex(0) {
        sem_init(&_roomSem, 0, _ringQueue.size());
        sem_init(&_dataSem, 0, 0);
        // sem_init() 接口的 
        // 第一个参数是 需要初始化的信号量, 
        // 第二个参数是 
        // 第三个参数是 需要初始化为多少

        // 初始化锁
        pthread_mutex_init(&_pMutex, nullptr);
        pthread_mutex_init(&_cMutex, nullptr);
    }
    // 析构函数
    ~ringQueue() {
        sem_destroy(&_roomSem);
        sem_destroy(&_dataSem);

        pthread_mutex_destroy(&_pMutex);
        pthread_mutex_destroy(&_cMutex);
    }
    // 生产接口
    void push(const T &in) {
        // 生产数据
        // 先申请空间信号量
        sem_wait(&_roomSem);                // 申请成功则 _roomSem--, 否则等待
        pthread_mutex_lock(&_pMutex);       // 申请信号量成功后, 加锁
        _ringQueue[_pIndex] = in;           // 将数据放入 数组
        _pIndex++;                          // 生产者下一次生产数据的位置 ++
        _pIndex %= _ringQueue.size();       // 跟新下标, 保证环形特性
        pthread_mutex_unlock(&_pMutex);     // 访问完临界资源, 解锁
        sem_post(&_dataSem);                // 数组中数据+1, 那么 dataSem 需要++
    }
    // 消费接口
    T pop() {
        // 消费数据
        // 先申请数据信号量
        sem_wait(&_dataSem);            // 申请成功则 _dataSem--, 否则等待
        pthread_mutex_lock(&_cMutex);
        T tmp = _ringQueue[_cIndex];    // 存储应拿到的数据
        _cIndex++;
        _cIndex %= _ringQueue.size();
        pthread_mutex_unlock(&_cMutex);
        sem_post(&_roomSem); // 拿出了数据, 空间+1, 那么 _roomSem ++
        return tmp;
    }


private:
    vector<T> _ringQueue;   // 模拟循环队列的数组
    sem_t _roomSem;         // 空间资源信号量, 生产者申请
    sem_t _dataSem;         // 数据资源信号量, 消费者申请
    uint32_t _pIndex;       // 生产者生产数据的索引下标, 即插入数据的下标
    uint32_t _cIndex;       // 消费者消费数据的索引下标, 即获取数据的下标

    // 保护索引下标的锁
    pthread_mutex_t _cMutex;    // 消费数据索引下标的锁
    pthread_mutex_t _pMutex;    // 生产数据索引下标的锁
};
```

在类内, 添加**两个锁来分别保护 生产和消费数据的索引下标**

**为什么要用两个锁？** 

因为需要保证 生产和消费在不同位置的并发, 所以不能只用一把锁

并且, 在生产接口和消费接口中, 都是在 **申请到信号量之后上的锁, 这是为什么？**

因为, **申请到信号量 就表示其实可以看作已经获取到资源了**

所以, 申请到信号量之后再上锁, 可以实现让线程先预定资源再等待的功能

防止出现, 线程先因为锁 阻塞了一会, 终于抢到锁了, 却申请不到资源的情况

改进封装之后, 多线程试验一下

为了测试多线程是否做好了保护, 可以先让多个生产线程一直生产, 看一看会不会出错. 然后再消费线程: 

```cpp
#include "ringQueue.hpp"
#include <iostream>
#include <ctime>
#include <unistd.h>
using std::cout;

// 消费线程调用函数
void* consumer(void* args) {
    sleep(10);
    ringQueue<int>* ringQp = static_cast<ringQueue<int>*>(args);
    while (true) {
        sleep(1);
        int data = ringQp->pop();
        cout << "consumer_pthread[" << pthread_self() << "]"
             << " 消费了一个数据: " << data << endl;
    }
}

// 生产线程调用函数
void* productor(void* args) {
    ringQueue<int>* ringQp = static_cast<ringQueue<int>*>(args);
    while (true) {
        int data = rand() % 20;
        ringQp->push(data);
        cout << "productor_pthread[" << pthread_self() << "]"
             << " 生产了一个数据: " << data << endl;
        usleep(500000);
    }
}

int main() {
    srand((unsigned long)time(nullptr) ^ getpid());

    ringQueue<int> ringQ;

    pthread_t con1, con2, con3, pro1, pro2, pro3;
    pthread_create(&con1, nullptr, consumer, &ringQ);
    pthread_create(&con2, nullptr, consumer, &ringQ);
    pthread_create(&con3, nullptr, consumer, &ringQ);
    pthread_create(&pro1, nullptr, productor, &ringQ);
    pthread_create(&pro2, nullptr, productor, &ringQ);
    pthread_create(&pro3, nullptr, productor, &ringQ);

    pthread_join(con1, nullptr);
    pthread_join(con2, nullptr);
    pthread_join(con3, nullptr);
    pthread_join(pro1, nullptr);
    pthread_join(pro2, nullptr);
    pthread_join(pro3, nullptr);

    return 0;
}
```

我们让单线程每 0.5s 生产一个数据, 让10s后, 单消费线程再以 1s 消费一个数据的速度消费.

代码的执行结果为: 

![|inline](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/ringQueue_c3_p3.gif)

虽然打印的结果很混乱, 但是还是可以看出**没有出现生产或消费出错**的

这就是 以环形队列模拟生产者消费者模型

---

本片文章到这里就结束啦~

感谢阅读
