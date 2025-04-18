---
draft: true
title: "[Linux] 线程同步分析II: 什么是生产者消费者模型? 阻塞队列模拟生产者消费者模型"
pubDate: "2023-04-22"
description: "如何实现一个生产者消费者模型?"
image: https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/202412191905970.webp
categories: ['tech']
tags: ["Linux系统", "多线程", "同步", "生产者消费者模型"]
---

# 生产者消费者模型介绍 **

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

## 生产者消费者模型的优点

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