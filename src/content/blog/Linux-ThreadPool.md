---
draft: true
title: "[Linux] 最基础简单的线程池及其单例模式的实现"
pubDate: "2023-07-12"
description: ""
image: https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/202307121404386.webp
categories: ['tech']
tags: ["Linux系统", "多线程", "线程池"]
---

> 本篇文章主要用到线程相关内容, 下面是博主关于线程相关内容的文章:
>
> [[Linux] 线程同步分析: 什么是条件变量？生产者消费者模型是什么？POSIX信号量怎么用？阻塞队列和环形队列模拟生产者消费者模型](https://www.humid1ch.cn/posts/Linux-Thread-Synchronization)
>
> [[Linux] 线程互斥分析: 多线程的问题、互斥锁、C++封装使用互斥锁、线程安全分析、死锁分析...](https://www.humid1ch.cn/posts/Linux-Thread-Mutex)
>
> [[Linux] 如何理解线程ID？什么是线程局部存储？](https://www.humid1ch.cn/posts/Linux-ThreadID-Analysis)
>
> [[Linux] 多线程控制分析: 获取线程ID、线程退出分析、自动回收线程、线程分离...](https://www.humid1ch.cn/posts/Linux-Thread-Control)
>
> [[Linux] 多线程概念相关分析: 什么是线程、再次理解进程、线程的创建与查看、线程异常、线程与进程的对比...](https://www.humid1ch.cn/posts/Linux-Thread-Conceptual-Analysis)

---

# 线程池

什么是线程池?

线程池一种线程使用模式. 我们知道, 线程的创建、调度、销毁都是需要消耗资源的. 也就是说 线程过多会带来调度开销, 进而影响缓存局部性和整体性能. 

而线程池维护着多个线程, 这些线程等待着被分配可并发执行的任务. 这避免了在处理短时间任务时创建与销毁线程的代价.

说简单点, 就是 **线程池维护着多个线程, 这些线程都可以随时被调度、随时被派发任务, 不用在任务需要派发时再创建线程, 而是在需要派发任务时 可以直接调度线程池内的线程, 执行任务**

线程池的使用场景, 一般是 **任务量巨大, 但是任务内容小的、任务时间短** 的时候. 这样可以避免发生过多线程的创建与销毁. 或者 **需要快速响应的任务**, 因为不用再创建线程.

## 简单的固定线程数线程池

下面, 封装一个 **`简单`的 拥有固定线程数量的线程池**.

线程池维护着多个线程, 并不是说创建几个线程就可以了. 线程池还要管理这些线程的调度和执行, 整个实现类似一个变化的生产者消费者模型.

所以我们可以通过阻塞队列, 来实现对接收任务和同步调度线程.

**`threadPool.hpp`:**

```cpp
#pragma once

#include <iostream>
#include <queue>
#include <cassert>
#include <pthread.h>
#include <unistd.h>

#define THREADNUM 5

template <class T>
class threadPool {
public:
    threadPool(size_t threadNum = THREADNUM)
        : _threadNum(threadNum)
        , _isStart(false) {
        assert(_threadNum > 0);

        pthread_mutex_init(&_mutex, nullptr); // 初始化 锁
        pthread_cond_init(&_cond, nullptr);   // 初始化 条件变量
    }
    
    // 线程回调函数
    // static 修饰, 是因为需要让函数参数 取消this指针, 只留一个void*
    // 但是由于 需要访问类内成员, 所以 传参需要传入this指针
    static void* threadRoutine(void* args) {
        // 线程执行回调函数
        // 先分离, 自动回收
        pthread_detach(pthread_self());

        // 获取this指针
        threadPool<T>* tP = static_cast<threadPool<T>*>(args);
        while (true) {
            // 即将通过任务队列给线程分配任务, 即 多线程访问临界资源, 需要上锁
            tP->lockQueue();
            while (!tP->haveTask()) {
                // 任务队列中没有任务, 就让线程通过条件变量等待
                tP->waitForTask();
            }
            // 走到这里 说明条件队列中有任务
            // 线程已经可以获取到任务
            T task = tP->popTask();
            // 获取到任务之后 临界资源的访问就结束了, 可以释放锁了.
            // 尽量避免拿着锁 执行任务
            tP->unlockQueue();

            // 为任务类提供一个运行的接口, 这样获取到任务之后 直接 task.run();
            task.run();
        }
    }

    // 开启线程池
    void start() {
        try {
            // _isStart 为true 则说明线程池已经开启
            if (_isStart)
                throw "Error: thread pool already exists";
        }
        catch (const char* e) {
            std::cout << e << std::endl;
            return;
        }

        for (int i = 0; i < _threadNum; i++) {
            pthread_t temp;
            pthread_create(&temp, nullptr, threadRoutine, this); // 回调函数的参数传入this指针, 用于类访问内成员
        }
        // 开启线程池之后, 要把 _isStart 属性设置为 true
        _isStart = true;
    }

    // 给任务队列添加任务 并分配任务
    void pushTask(const T& in) {
        // 上锁
        lockQueue();
        _taskQueue.push(in);
        // 任务队列中已经存在任务, 线程就不用再等待了, 就可以唤醒线程
        choiceThreadForHandler();
        // 释放锁
        unlockQueue();
    }

    ~threadPool() {
        pthread_mutex_destroy(&_mutex);
        pthread_cond_destroy(&_cond);
    }

private:
    // 线程调度 即为从任务队列中给各线程分配任务
    // 所以 任务队列是临界资源需要上锁
    void lockQueue() {
        pthread_mutex_lock(&_mutex);
    }
    void unlockQueue() {
        pthread_mutex_unlock(&_mutex);
    }

    // 条件变量 使用条件, 判断是否任务队列是否存在任务
    bool haveTask() {
        return !_taskQueue.empty();
    }
    // 线程通过条件变量等待任务
    void waitForTask() {
        pthread_cond_wait(&_cond, &_mutex);
    }

    // 从任务队列中获取任务, 并返回
    T popTask() {
        T task = _taskQueue.front();
        _taskQueue.pop();

        return task;
    }

    // 唤醒在条件变量前等待的线程
    // 由于唤醒之后就是线程调度的过程
    // 所以函数名 是线程调度相关
    void choiceThreadForHandler() {
        pthread_cond_signal(&_cond);
    }

private:
    size_t _threadNum;        	// 线程池内线程数量
    bool _isStart;            	// 判断线程池是否已经开启
    std::queue<T> _taskQueue;	// 任务队列
    pthread_mutex_t _mutex;		// 锁 给临界资源使用 即任务队列 保证线程调度互斥
    pthread_cond_t _cond; 		// 条件变量 保证线程调度同步
};
```

这部分代码就是一个再简单不过的线程池.

这个最简单的线程池的功能就包括: 

1. 单次开启线程池, 创建多线程, 并让线程等待调度
2. 可以获取任务并存储任务
3. 由于通过多线程访问临界资源分配任务, 所以 要做到同步互斥地给线程分配任务
4. 得到任务之后, 线程执行任务, 执行完成继续等待调度 

所以, 成员变量至少要用到的成员变量有:

1. `size_t _threadNum`, 用来设置线程池中线程的数量
2. `bool _isStart`, 用来设置线程池开启状态
3. `std::queue<T> _taskQueue`, 任务队列, 临界资源. 用来接收主线程发来的任务. 存储任务, 向线程分配
4. `pthread_mutex_t _mutex`, 锁, 为保证多线程访问任务队列互斥, 且实现同步向线程分配任务
5. `pthread_cond_t _cond`, 条件变量, 为实现无任务时 线程等待调度, 且实现同步向线程分配任务

整个线程池中, 最重要的就是多线程所执行的回调函数的实现.

此函数中, 包括线程等待, 分配任务, 执行任务的功能, 并且参数的传递也很重要:

```cpp
// 线程回调函数
// static 修饰, 是因为需要让函数参数 取消this指针, 只留一个void*
// 但是由于 需要访问类内成员, 所以 传参需要传入this指针
static void* threadRoutine(void* args) {
    // 线程执行回调函数
    // 先分离, 自动回收
    pthread_detach(pthread_self());

    // 获取this指针
    threadPool<T>* tP = static_cast<threadPool<T>*>(args);
    while (true) {
        // 即将通过任务队列给线程分配任务, 即 多线程访问临界资源, 需要上锁
        tP->lockQueue();
        while (!tP->haveTask()) {
            // 任务队列中没有任务, 就让线程通过条件变量等待
            tP->waitForTask();
        }
        // 走到这里 说明条件队列中有任务, 线程已经可以获取任务
        T task = tP->popTask();
        // 获取到任务之后 临界资源的访问就结束了, 可以释放锁了.
        // 尽量避免拿着锁 执行任务
        tP->unlockQueue();

        // 为任务类提供一个运行的接口, 这样获取到任务之后 直接 task.run();
        task.run();
    }
}

// 类内创建线程时的操作
pthread_create(&temp, nullptr, threadRoutine, this);
```

我们知道, 线程需要执行的回调函数格式是这样的`void* 函数名(void*)`

但是, 类内的所有成员函数第一个参数是`this`指针. 所以我们需要将此函数用`static`修饰. 然而修饰之后, 此函数就不属于类内成员函数了, 所以无法直接调用访问类内成员. 所以, 参数需要传入类的`this`指针, 通过`this`指针访问对象成员.

所以, 此函数的首要的功能 除了分离线程之外, 就是要通过参数获取到调用对象的`this`指针

然后就要实现线程主要需要执行的功能:

首先, 线程需要 **在没有任务时, 通过条件变量陷入等待**. 而且, 线程在 **执行完任务** 时, 需要 **重新在没有任务时, 通过条件变量陷入等待**. 所以, 函数的主体功能是在 **一个循环** 内的.

![|inline](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/202307131442281.webp)

进入循环后, 就应该 **从任务队列中获取任务**, 但是 如果任务队列中 **没有任务, 线程就需要等待**.

并且, **线程** 无论是获取任务的过程 还是 判断是否有任务的过程, **访问的都是临界资源**, 而 **临界资源需要保证线程安全**, 所以 在进入循环之后的 **第一件事**, 应该是 **对临界资源上锁, 即 多线程争夺锁**. 争夺到锁之后, 才能访问临界资源:

![|inline](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/202307131459416.webp)

获取到任务之后, 就表示线程访问本次临界资源已经结束, 就可以释放锁, 然后执行任务了.

而, 除了线程执行的功能函数之外, 还有一个需要将任务放入任务队列的函数:

![|inline](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/202307131512275.webp)

至此, 有关线程池的主要功能函数就是先完毕了.

我们可以再结合下面这几个代码文件 测试一下:

**`logMessage.hpp`:**

```cpp
#pragma once

#include <cstdio>
#include <ctime>
#include <cstdarg>
#include <cassert>
#include <cstring>
#include <cerrno>
#include <cstdlib>

// 宏定义 四个日志等级
#define DEBUG 0
#define NOTICE 1
#define WARINING 2
#define FATAL 3

const char* log_level[] = {"DEBUG", "NOTICE", "WARINING", "FATAL"};

// 实现一个 可以输出: 日志等级、日志时间、用户、以及相关日志内容的 日志消息打印接口
void logMessage(int level, const char* format, ...) {
    // 通过可变参数实现, 传入日志等级, 日志内容格式, 日志内容相关参数

    // 确保日志等级正确
    assert(level >= DEBUG);
    assert(level <= FATAL);

    // 获取当前用户名
    char* name = getenv("USER");

    // 简单的定义log缓冲区
    char logInfo[1024];

    // 定义一个指向可变参数列表的指针
    va_list ap;
    // 将 ap 指向可变参数列表中的第一个参数, 即 format 之后的第一个参数
    va_start(ap, format);

    // 此函数 会通过 ap 遍历可变参数列表, 然后根据 format 字符串指定的格式, 将ap当前指向的参数以字符串的形式 写入到logInfo缓冲区中
    vsnprintf(logInfo, sizeof(logInfo) - 1, format, ap);

    // ap 使用完之后, 再将 ap置空
    va_end(ap); // ap = NULL

    // 通过判断日志等级, 来选择是标准输出流还是标准错误流
    FILE* out = (level == FATAL) ? stderr : stdout;

    // 获取本地时间
    time_t tm = time(nullptr);
    struct tm* localTm = localtime(&tm);
    char* localTmStr = asctime(localTm);
    char* nC = strstr(localTmStr, "\n");
    if(nC) {
        *nC = '\0';
    }
    fprintf( out, "%s | %s | %s | %s\n", 
            log_level[level],
            localTmStr,
            name == nullptr ? "unknow" : name, 
            logInfo );
}
```

**`intArithmeticTask.hpp`:**

```cpp
// 任务类
#pragma once

#include <iostream>
#include <map>
#include <string>
#include <functional>
#include <pthread.h>
#include "logMessage.hpp"

std::map<char, std::function<int(int, int)>> opFunctions{
    {'+', [](int elemOne, int elemTwo) { return elemOne + elemTwo; }},
    {'-', [](int elemOne, int elemTwo) { return elemOne - elemTwo; }},
    {'*', [](int elemOne, int elemTwo) { return elemOne * elemTwo; }},
    {'/', [](int elemOne, int elemTwo) {
         if (elemTwo == 0) {
             std::cout << "div zero, abort" << std::endl;
             return -1;
         }
         return elemOne / elemTwo;
     }},
    {'%', [](int elemOne, int elemTwo) {
         if (elemTwo == 0) {
             std::cout << "div zero, abort" << std::endl;
             return -1;
         }
         return elemOne % elemTwo;
     }}
};

class Task {
public:
    Task(int one = 0, int two = 0, char op = '0')
        : _elemOne(one)
        , _elemTwo(two)
        , _operator(op) {}

    void operator()() {
        run();
    }

    void run() {
        int result = 0;
        if (opFunctions.find(_operator) != opFunctions.end()) {
            result = opFunctions[_operator](_elemOne, _elemTwo);
            if ((_elemTwo == 0 && _operator == '/') ||(_elemTwo == 0 && _operator == '%')) 
                return;
            logMessage(NOTICE, "新线程[%lu] 完成算术任务: %d %c %d = %d", pthread_self(), _elemOne, _operator, _elemTwo, result);
        }
        else {
            std::cout << "非法操作: " << _operator << std::endl;
        }
    }

    void get(int* e1, int* e2, char* op) {
        *e1 = _elemOne;
        *e2 = _elemTwo;
        *op = _operator;
    }

private:
    int _elemOne;
    int _elemTwo;
    char _operator;
};
```

**`threadPool.cc`:**

```cpp
// 开启线程池, 任务派发主函数
#include <iostream>
#include <memory>
#include <ctime>
#include <cstdlib>
#include <pthread.h>
#include <string>
#include <unistd.h>
#include "logMessage.hpp"
#include "threadPool.hpp"
#include "intArithmeticTask.hpp"

const std::string operators = {"+-*/\%"};

int main() {
    std::unique_ptr<threadPool<Task>> tP(new threadPool<Task>);
    // 开启线程池
    tP->start();

    srand((unsigned int)time(nullptr) ^ getpid() ^ pthread_self());
    while (true) {
        int elemOne = rand()%20;
        int elemTwo = rand()%10;
        char oper = operators[rand()%operators.size()];

        logMessage(NOTICE, "主线程[%lu] 派发算术任务: %d %c %d = ?", pthread_self(), elemOne, oper, elemTwo);
        Task taskTmp(elemOne, elemTwo, oper);
        tP->pushTask(taskTmp);

        // 设置为1s添加 分配一个任务
        sleep(1);
    }
    
    return 0;
}
```

然后, 编译运行:

![](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/202308211603489.gif)

可以看到运行的结果就是 我们期望的结果, 主线程每秒添加并分配一个, 5个线程同步获取到任务并执行.

我们还可以将任务的处理速度设置慢一些, 任务的添加分配速度快一些, 更明显的看到多线程的并发

将 处理速度设置为`1s`, 添加分配速度设置为`0.1s`:

![](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/202308211604868.gif)

当派发速度变快 处理速度变慢, 之间超过5倍差的时候:

![](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/202307131602993.webp)

## 懒汉单例模式线程池

单例模式, 是指 只能创建一个实例对象的类

懒汉式的单例模式, 是指 在使用时才实例化单例对象的单例模式.

我们可以将 这个线程池 修改为单例模式:

**`lock.hpp`:**

```cpp
// 一个 RAII思想实现的锁
#pragma once

#include <iostream>
#include <pthread.h>

class Mutex {
public:
    Mutex() {
        pthread_mutex_init(&_lock, nullptr);
    }
    void lock() {
        pthread_mutex_lock(&_lock);
    }
    void unlock() {
        pthread_mutex_unlock(&_lock);
    }
    ~Mutex() {
        pthread_mutex_destroy(&_lock);
    }

private:
    pthread_mutex_t _lock;
};

class LockGuard {
public:
    LockGuard(Mutex* mutex)
        : _mutex(mutex) {
        _mutex->lock();
        std::cout << "加锁成功..." << std::endl;
    }

    ~LockGuard() {
        _mutex->unlock();
        std::cout << "解锁成功...." << std::endl;
    }

private:
    Mutex* _mutex;
};
```

**`threadPool.hpp`:**

```cpp
// 单例模式的线程池
#pragma once

#include <cstddef>
#include <iostream>
#include <ostream>
#include <queue>
#include <cassert>
#include <pthread.h>
#include <unistd.h>
#include "lock.hpp"

#define THREADNUM 5

template <class T>
class threadPool {
public:
    static threadPool<T>* getInstance() {
        // RAII锁
        static Mutex mutex;
        if (_instance == nullptr) {
            LockGuard lockG(&mutex);
            if (_instance == nullptr) {
                _instance = new threadPool<T>();
            }
        }

        return _instance;
    }
    // 线程回调函数
    // static 修饰, 是因为需要让函数参数 取消this指针, 只留一个void*
    // 但是由于 需要访问类内成员, 所以 传参需要传入this指针
    static void* threadRoutine(void* args) {
        // 线程执行回调函数
        // 先分离, 自动回收
        pthread_detach(pthread_self());

        // 获取this指针
        threadPool<T>* tP = static_cast<threadPool<T>*>(args);
        while (true) {
            // 即将通过任务队列给线程分配任务, 即 多线程访问临界资源, 需要上锁
            tP->lockQueue();
            while (!tP->haveTask()) {
                // 任务队列中没有任务, 就让线程通过条件变量等待
                tP->waitForTask();
            }
            // 走到这里 说明条件队列中有任务
            // 线程已经可以获取到任务
            T task = tP->popTask();
            // 获取到任务之后 临界资源的访问就结束了, 可以释放锁了.
            // 尽量避免拿着锁 执行任务
            tP->unlockQueue();

            // 为任务类提供一个运行的接口, 这样获取到任务之后 直接 task.run();
            task.run();
        }
    }

    // 开启线程池
    void start() {
        try {
            // _isStart 为true 则说明线程池已经开启
            if (_isStart)
                throw "Error: thread pool already exists";
        }
        catch (const char* e) {
            std::cout << e << std::endl;
            return;
        }

        for (int i = 0; i < _threadNum; i++) {
            pthread_t temp;
            pthread_create(
                &temp, nullptr, threadRoutine,
                this); // 回调函数的参数传入this指针, 用于类访问内成员
        }
        // 开启线程池之后, 要把 _isStart 属性设置为 true
        _isStart = true;
    }

    // 给任务队列添加任务 并分配任务
    void pushTask(const T& in) {
        // 上锁
        lockQueue();
        _taskQueue.push(in);
        // 任务队列中已经存在任务, 线程就不用再等待了, 就可以唤醒线程
        choiceThreadForHandler();
        // 释放锁
        unlockQueue();
    }

    ~threadPool() {
        pthread_mutex_destroy(&_mutex);
        pthread_cond_destroy(&_cond);
    }

    threadPool(const threadPool<T>&) = delete;
    threadPool<T>& operator=(const threadPool<T>&) = delete;

private:
    threadPool(size_t threadNum = THREADNUM)
        : _threadNum(threadNum)
        , _isStart(false) {
        assert(_threadNum > 0);

        pthread_mutex_init(&_mutex, nullptr); // 初始化 锁
        pthread_cond_init(&_cond, nullptr);   // 初始化 条件变量
    }
    // 线程调度 即为从任务队列中给各线程分配任务
    // 所以 任务队列是临界资源需要上锁
    void lockQueue() {
        pthread_mutex_lock(&_mutex);
    }
    void unlockQueue() {
        pthread_mutex_unlock(&_mutex);
    }

    // 条件变量 使用条件, 判断是否任务队列是否存在任务
    bool haveTask() {
        return !_taskQueue.empty();
    }
    // 线程通过条件变量等待任务
    void waitForTask() {
        pthread_cond_wait(&_cond, &_mutex);
    }

    // 从任务队列中获取任务, 并返回
    T popTask() {
        T task = _taskQueue.front();
        _taskQueue.pop();

        return task;
    }

    // 唤醒在条件变量前等待的线程
    // 由于唤醒之后就是线程调度的过程
    // 所以函数名 是线程调度相关
    void choiceThreadForHandler() {
        pthread_cond_signal(&_cond);
    }

private:
    size_t _threadNum;        // 线程池内线程数量
    bool _isStart;            // 判断线程池是否已经开启
    std::queue<T> _taskQueue; // 任务队列
    pthread_mutex_t _mutex; // 锁 给临界资源使用 即任务队列 保证线程调度互斥
    pthread_cond_t _cond; // 条件变量 保证线程调度同步

    static threadPool<T>* _instance;
};

template <class T>
threadPool<T>* threadPool<T>::_instance = nullptr;
```

运行结果:

![](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/202308211604510.gif)

执行效果是没有区别的.

---

感谢阅读~
