---
draft: true
title: "[Linux] 多线程控制分析: 获取线程ID、线程退出分析、自动回收线程、线程分离..."
pubDate: "2023-04-14"
description: '我们知道, 进程有自己相关控制接口, 等待、创建等
而线程作为轻量级的进程, 其实也是有控制接口的.'
image: https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/202306251801575.webp
categories: ['tech']
tags: ["Linux系统", "多线程"]
---

`Linux`系统中, **线程是轻量级的进程**

已经介绍过了线程的相关概念, 见过了线程在`Linux`操作系统中的存在形式

知道了, 进程有自己相关控制接口, 等待、创建等

而线程作为轻量级的进程, 其实也是有控制接口的

# 线程控制

在介绍线程的相关概念的时候, 简单的演示了一下, 线程的创建和回收

以及使用`ps`命令, 展示了操作系统中正在运行的线程

## 线程的创建与回收演示

使用`pthread_create()`和`pthread_join()`两个接口来创建和回收线程已经演示过了: 

```cpp
#include <iostream>
#include <string>
#include <pthread.h>
#include <unistd.h>
using std::cout;
using std::endl;
using std::string;

void* callBack1(void* args) {
    string str = (char*)args;
    while (true) {
        cout << str << ": " << getpid() << " " << endl;
        sleep(1);
    }
}

int main() {
    pthread_t tid1;

    pthread_create(&tid1, nullptr, callBack1, (void*)"thread_1");

    while (true) {
        cout << " 主线程运行: " << getpid() << " " << endl;
        sleep(1);
    }

    pthread_join(tid1, nullptr);

    return 0;
}
```

![ |inline](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/thread_show_2023-4-14.gif)

这段代码的执行结果, 是两个线程同时运行

`pthread_create()`的使用并不复杂, 只需要接收线程`id`, 并指定线程需要执行的**回调函数**和**参数**就可以了

而`pthread_join()`这个回收线程的函数也不复杂, 只不过 此函数的第二个参数是一个**二级指针**

```cpp
int pthread_join(pthread_t thread, void** retval);
```

`void** retval`参数是一个输出型参数, 是用来接收数据的

不过为什么, `retval`是一个二级指针的类型呢? 

其实原因很简单, 因为我们在使用 `pthread_create()`接口创建线程的时候, 给线程指定的回调函数的返回值是 `void*`类型的

`pthread_join()`的作用是回收线程, 既然要回收线程那么就一定要接收到线程运行的结果, 即 **需要接收线程执行的回调函数的返回值**

函数的参数要接收一个指针类型的内容, 就是要用二级指针来接收

即, `pthread_join()`接口的第二个参数, 实际上可以**接收线程执行的回调函数的返回值**

可以使用下面这段代码测试一下: 

```cpp
#include <iostream>
#include <string>
#include <pthread.h>
#include <unistd.h>
using std::cout;
using std::endl;
using std::string;

void* callBack1(void* args) {
    string str = (char*)args;
    int cnt = 5;
    while (cnt) {
        cout << str << ": " << getpid() << " " << endl;
        sleep(1);
        cnt--;
    }

    return (void*)"thread_1 is over";
}

int main() {
    pthread_t tid1;

    pthread_create(&tid1, nullptr, callBack1, (void*)"thread_1");

    void* ret = nullptr;
    pthread_join(tid1, &ret);

    cout << "main thread join thread_1 , ready to print thread_1 ret" << endl; 

    sleep(2);
    cout << (char*)ret << endl;
    
    return 0;
}
```

这段代码的执行结果是: 

![thread_join_retval |inline](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/thread_join_retval.gif)

可以看到, 输出传入`join`接口的参数, 得到的结果是`thread_1`执行的回调函数的返回值.

---

`pthread_create()`和`pthread_join()`这两个接口的使用都不算困难

其实这两个接口都不是系统调用, 而是**第三方库`pthread`**中的接口

不过虽然他们不是系统调用, 却胜似系统调用, 因为`Linux`中其实是必须装载这个库的

这两个不是系统调用, `Linux`操作系统提供的真正的系统调用是什么呢? 

`Linux`操作系统的线程是轻量级进程, 也就是说`Linux`其实并没有提供创建线程的系统调用, 因为根本就没有独立的线程这个概念

所以, `Linux`操作系统给我们提供的创建线程的系统调用接口: 

`vfork():`

![ ](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/image-20230414175827070.webp)

这个系统调用接口是用来创建与父进程共享进程地址空间的子进程的, 其实就是一个线程

`clone():`

![ ](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/image-20230414175621677.webp) 

还有`clone()`系统调用. 这个接口作用是创建一个子进程来模拟线程. 

不过看参数就可以看出来这个函数, **太麻烦了！**

还需要自己定义方法, 自己定义一个子进程的栈(线程栈)等内容. 

这个接口是为了更加细粒度的定制创建一个线程, 就是太麻烦了, 非常的麻烦, 看看就好

更常用的还是`pthread`库中的接口: `pthread_create`等

## 获取线程`id`

`pthread_create()`接口的第一个参数是一个输出型参数, 其实就是为了接收线程`id`的

也就是说, 创建完线程之后 其实就已经得到了创建的线程的`id`: 

```cpp
#include <iostream>
#include <string>
#include <pthread.h>
#include <unistd.h>
using std::cout;
using std::endl;
using std::string;

void* callBack1(void* args) {
    string str = (char*)args;
    int cnt = 5;
    while (cnt) {
        cout << str << ": " << getpid() << " " << endl;
        sleep(1);
        cnt--;
    }

    return (void*)"thread_1 is over";
}

int main() {
    pthread_t tid1;

    pthread_create(&tid1, nullptr, callBack1, (void*)"thread_1");

    cout << "thread_1 id: " << tid1 << endl;

    while (true) {
        cout << " 主线程运行: " << getpid() << " " << endl;
        sleep(1);
    }

    return 0;
}
```

![thread_id |inline](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/thread_id.gif)

代码的执行结果显示, 线程的`id`是一个非常长的数值, 暂时不考虑其有什么含义

上面这种方法是通过**创建线程时接收到的id**, 来获取线程id

除此之外, `pthread`还提供了一个获取线程自己`id`的接口: `pthread_self()`

### `pthread_self()`获取线程`id`

![ ](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/image-20230414181551428.webp)

此接口作用是: 获取调用此接口的线程的`ID`, 并作为返回值返回

那么, 就可以定义一个函数, 来输出哪个线程和此线程的`ID`

```cpp
#include <iostream>
#include <string>
#include <pthread.h>
#include <unistd.h>
using std::cout;
using std::endl;
using std::string;

void printTid(const char* threadName, const pthread_t &tid) {
    cout << threadName << " is runing, " << "tid: " << tid << endl;
}

void* callBack1(void* args) {
    char* threadName = (char*)args;
    int cnt = 5;
    while (cnt) {
        printTid(threadName, pthread_self());
        sleep(1);
        cnt--;
    }

    return (void*)"thread_1 is over";
}

int main() {
    pthread_t tid1;

    pthread_create(&tid1, nullptr, callBack1, (void*)"thread_1");

    while(true) {
        cout << "主线程运行: " << getpid() << endl;
        sleep(1);
    }

    pthread_join(tid1, nullptr);

    return 0;
}
```

代码的执行结果为: 

![pthread_self |inline](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/pthread_self.gif)

线程成功获取了自己的`ID`

## 线程的状态

`Linux`中**不能使用`ps`像查看进程状态那样细致的查看线程的状态**

不过还是可以简单的判断一下的

对于线程, 如果线程退出了但是没有回收, 线程会怎么样呢? 

```cpp
#include <iostream>
#include <string>
#include <pthread.h>
#include <unistd.h>
using std::cout;
using std::endl;
using std::string;

void printTid(const char* threadName, const pthread_t &tid) {
    cout << threadName << " is runing, " << "tid: " << tid << endl;
}

void* callBack1(void* args) {
    char* threadName = (char*)args;
    int cnt = 5;
    while (cnt) {
        printTid(threadName, pthread_self());
        sleep(1);
        cnt--;
    }
    cout << "thread_1 is over" << endl;

    int* ret = new int(123);
    return (void*)ret;				// 返回一个堆区数据 123
}

int main() {
    pthread_t tid1;

    pthread_create(&tid1, nullptr, callBack1, (void*)"thread_1");
    
    sleep(15);  // 等15s, 让thread_1运行完

    void* ret = nullptr;
    pthread_join(tid1, &ret);
    cout << "main thread join thread_1 , ready to print thread_1 ret" << endl;
    
    sleep(2);

    cout << "print thread_1 ret: " << *((int*)ret) << endl;
    delete (int*)ret; 		// 释放堆区数据

    return 0;
}
```

我们可以使用命令行监控脚本, 然后在执行这段代码.

```shell
// 监控线程脚本
while :; do ps -aL |head -1 && ps -aL |grep myThread |grep -v grep; sleep 1; done;
```

![线程退出之后, 但还未join |inline](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/thread_over_beforejoin.gif)

执行和监控结果是, 当线程退出但还未被回收时, **线程会立刻从ps打印的列表中消失**

这说明什么呢? 能说明 线程会被操作系统自动回收, 不用`join`吗?  

不能, 因为`ps`终究只是一个软件

没有证据可以证明 线程退出之后会被立刻回收, 不用手动回收

事实也的确如此, **线程退出之后, 并不是自动回收的, 如果不手动`join`, 就可能会造成类似进程不回收一般的内存泄漏问题**

### 线程与进程共享信号处理方法

线程和进程是共享信号处理方法的. 这个概念在上一篇线程概念的文章中就已经提到过, 但是没有演示

在本篇文章中, 可以演示一下这个特点:

```cpp
#include <iostream>
#include <string>
#include <pthread.h>
#include <unistd.h>
using std::cout;
using std::endl;
using std::string;

void printTid(const char* threadName, const pthread_t &tid) {
    cout << threadName << " is runing, " << "tid: " << tid << endl;
}

void* callBack1(void* args) {
    char* threadName = (char*)args;
    while (true) {
        printTid(threadName, pthread_self());s
        sleep(1);
     }
}

int main() {
    pthread_t tid1;

    pthread_create(&tid1, nullptr, callBack1, (void*)"thread_1");

    while(true) {
        printTid("main thread", pthread_self());
        sleep(1);
    }
}
```

![线程和进程接收信号相同状态 ](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/Thread_Shared_SIG.gif)

向进程发送19信号, 所有线程都会暂停运行

向进程发送一个18信号, 所有线程又会恢复运行

> `ps`列表中, 表示进程状态的一栏`l`即表示 存在轻量化进程, 即多线程进程
>
> `+`表示前台进程

#### 线程异常

线程异常会影响整个进程, 原因是线程异常影响的是整个进程的代码和数据

所以, 如果线程异常 则整个进程都会异常

```cpp
#include <iostream>
#include <string>
#include <pthread.h>
#include <unistd.h>
using std::cout;
using std::endl;
using std::string;

void printTid(const char* threadName, const pthread_t &tid) {
    cout << threadName << " is runing, " << "tid: " << tid << ", pid: " << getpid() << endl;
}

void* callBack1(void* args) {
    char* threadName = (char*)args;
    int cnt = 5;
    while (true) {
        printTid(threadName, pthread_self());
        sleep(1);
        cnt--;
        if(cnt == 0) {
            int i = 1;
            i /= 0;
            // 段错误
            //int* pi = nullptr;
            //*pi = 123;
        }
     }
}

int main() {
    pthread_t tid1;

    pthread_create(&tid1, nullptr, callBack1, (void*)"thread_1");

    while(true) {
        printTid("main thread", pthread_self());
        sleep(1);
    }
    return 0;
}
```

![线程浮点异常 |inline](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/thread_error_float.gif)

![线程发生段错误 |inline](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/thread_error_segmentation.gif)

当线程出现不同的异常, 会影响进程的终止

这其实是线程的**健壮性较低**

>  不过这其实还是因为出`bug`了

## 线程退出

介绍进程时, 分析进程退出存在三种情况: 

1. 代码跑完, 结果正确, 正常退出
2. 代码跑完, 结果不正确, 正常退出
3. 代码没跑完, 进程异常退出

其实线程也是一样的, 线程退出也分为这三种

其实, 这三种情况可以统称为 **执行流的退出情况**

在父子进程中, 子进程退出不论是正常退出还是异常退出, **都会向父进程发送退出信息**

而 线程中, 只有线程正常退出且回收时, 主线程可以接收到线程的退出信息.

那么, 为什么线程异常时 主线程不会接收到来自线程的退出信息?

答案其实很简单, 因为**线程异常, 也就是进程异常**, 进程也会随之退出

接不接受线程的退出信息已经没有意义了

---

以正常退出的情况来说, 除了回调函数内`return`, 线程退出还可以使用接口退出

### `pthread_exit()`

![ ](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/image-20230414224857631.webp)

`pthread_exit()`接口也是`pthread`库提供的, 作用就是**以指定的退出信息使线程退出**

```cpp
#include <iostream>
#include <string>
#include <pthread.h>
#include <unistd.h>
using std::cout;
using std::endl;
using std::string;

void printTid(const char* threadName, const pthread_t &tid) {
    cout << threadName << " is runing, " << "tid: " << tid << ", pid: " << getpid() << endl;
}

void* callBack1(void* args) {
    char* threadName = (char*)args;
    int cnt = 5;
    while (true) {
        printTid(threadName, pthread_self());
        sleep(1);
        cnt--;
        if(cnt == 0) {
            pthread_exit((void*)123);
        }
     }
}

int main() {
    pthread_t tid1;

    pthread_create(&tid1, nullptr, callBack1, (void*)"thread_1");
    sleep(10);

    void* ret = nullptr;
    pthread_join(tid1, &ret);
    cout << "main thread join thread_1 , ready to print thread_1 ret" << endl;
    sleep(2);
    cout << "print thread_1 ret: " << (long long)ret << endl;
    
    return 0;
}
```

![线程退出 |inline](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/pthread_exit.gif)

### `pthread_cancel()`

![ ](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/image-20230414230626158.webp)

`pthread_cancel()` 接口可以向指定的线程发送取消请求

此接口可以**同一进程内, 任意线程调用并向任意线程发送**

即, 可以在主线程中调用向新线程发送请求, 也可以自己向自己发送请求

并且, 如果线程是被取消的, 那么此线程的退出信息就是`-1`

```cpp
#include <iostream>
#include <string>
#include <pthread.h>
#include <unistd.h>
using std::cout;
using std::endl;
using std::string;

void printTid(const char* threadName, const pthread_t &tid) {
    cout << threadName << " is runing, " << "tid: " << tid << ", pid: " << getpid() << endl;
}

void* callBack1(void* args) {
    char* threadName = (char*)args;
    int cnt = 5;
    while (true) {
        printTid(threadName, pthread_self());

        sleep(1);
        cnt--;
        if(cnt == 0) {
            pthread_exit((void*)123);
        }
     }
}

int main() {
    pthread_t tid1;

    pthread_create(&tid1, nullptr, callBack1, (void*)"thread_1");
    sleep(2);
	pthread_cancel(tid1); 						// 主线程向新线程发送取消请求
   	cout << "main thread cancel thread_1" << endl;

    void* ret = nullptr;
    pthread_join(tid1, &ret);
    cout << "main thread join thread_1 , ready to print thread_1 ret" << endl;
    sleep(2);
    cout << "print thread_1 ret: " << (long long)ret << endl;

    return 0;
}
```

首先, 主线程向新线程发送取消请求: 

![主线程向新线程发送取消请求 |inline](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/thread_cancel_main2new.gif)

新线程被取消 退出, 退出信息为`-1`, 即, 取消退出

主线程是可以向新线程发送取消信号的, 但是 **有可能发生错误**

上述代码中, 向新线程发送取消信号的动作 是在创建新线程2s之后执行的

如果将那2s的暂停取消(主线程中, `cancel`动作前的`sleep(2)`):

![主线程向新线程发送取消请求, 出现错误 |inline](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/thread_cancel_main2new_error.gif)

可以发现, 线程、进程都不正常的退出了.

> 同一进程内的所有线程都可以调用`pthread_cancel()`像任意线程发送取消信号
>
> 甚至可以向主线程发送取消信号, 线程自己也可以向自己发送取消信号.
>

### 被取消的线程的退信息

当线程被成功的取消, 用`pthread_join()`接收线程的退出信息. 结果得到的退出信息是`-1`

那, 这个`-1`是从哪里来的呢?

`Linux`中线程是由`PCB`模拟实现的, `PCB`中维护的都有自己执行流的退出信息

`return`也好, 调用`pthread_exit()`也好, 实际上都会修改`PCB`中维护的退出信息

而`pthread_cancel()`也是如此, 如果取消线程成功了, 操作系统就会修改线程`PCB`中的退出信息

将退出信息改为**`PTHREAD_CANCELED`**, 这是一个`pthread`库提供的宏, 其实就是`((void*)-1)`的宏定义: 

![ |large](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/image-20230415085216694.webp)

## 线程分离

操作系统中的线程, 在默认情况下是`joinable`的

即, 线程退出之后 是需要调用`pthread_join`进行接收线程信息和资源回收的, 否则可能会造成内存泄漏问题

不过, 如果一个线程不需要关心返回值, 如果不是需要回收资源, 其实`join`的必要没有那么大

那么, **对于不关心返回值的线程**, 可否不用`join`回收资源, 可否让线程自动回收资源呢? 

是可以的, 而 这样的操作叫**线程分离**

### `pthread_detach()`

![ ](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/image-20230415160811729.webp)

此接口的作用, 其实可以理解为**将线程与其父线程分离**, 即 主线程不在管这个线程, 主线程也就不关心退出信息, 不关心资源回收

这个接口一般线程自己调用或父线程调用

不过, `joinable`和分离是冲突的

毕竟 `joinable`表示线程需要调用`join`回收, 分离线程 则表示此线程是自动回收的, 很明显是两个冲突的状态:

![线程join成功 |inline](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/thread_join_success.gif)

这是线程被正常`join`的现象

如果我们设置分离: 

```cpp
#include <iostream>
#include <cstring>
#include <string>
#include <pthread.h>
#include <unistd.h>
using std::cout;
using std::endl;
using std::string;

void printTid(const char* threadName, const pthread_t& tid) {
    printf("%s is runing, tid: %lu, pid: %d\n", threadName, tid, getpid());
}

void* startRoutine(void* args) {
    pthread_detach(pthread_self());			// 线程分离
    
    string name = (char*)args;
    int cnt = 1;
    while (cnt--) {
        printTid(name.c_str(), pthread_self());
        sleep(1);
    }
    printf("%s is over\n", name.c_str());

    return nullptr;
}

int main() {
    pthread_t tid1, tid2, tid3, tid4;

    pthread_create(&tid1, nullptr, startRoutine, (void*)"thread_1");
    pthread_create(&tid2, nullptr, startRoutine, (void*)"thread_2");
    pthread_create(&tid3, nullptr, startRoutine, (void*)"thread_3");
    pthread_create(&tid4, nullptr, startRoutine, (void*)"thread_4");

    sleep(2);

    int joinRet = pthread_join(tid1, nullptr);
    cout << strerror(joinRet) << endl;
    joinRet = pthread_join(tid2, nullptr);
    cout << strerror(joinRet) << endl;
    joinRet = pthread_join(tid3, nullptr);
    cout << strerror(joinRet) << endl;
    joinRet = pthread_join(tid4, nullptr);
    cout << strerror(joinRet) << endl;

    return 0;
}
```

上面的这段代码, 在线程需要执行的回调函数内 调用`pthread_detach(pthread_self());`将线程自己分离

然后主线程内依旧使用 `pthread_join()` 回收

不过接收返回值, 判断`join`执行的结果: 

![分离和joinable状态不可共存 |inline](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/detach_joinable_without.gif)

可以看到, 主线程中的`pthread_join()`并没有成功的将`4`个线程回收掉

而是报出了`Invalid argument 无效参数`的错误

这其实就意味着, 分离过的线程 在运行结束之后就自动被回收了, 无法再用`pthread_join()`回收

---

上面举得例子是正确使用的情况

如果, 将主线程中的`sleep(2)`语句删除了, 并且只创建、回收一个线程: 

```cpp
#include <iostream>
#include <cstring>
#include <string>
#include <pthread.h>
#include <unistd.h>
using std::cout;
using std::endl;
using std::string;

void printTid(const char* threadName, const pthread_t& tid) {
    printf("%s is runing, tid: %lu, pid: %d\n", threadName, tid, getpid());
}

void* startRoutine(void* args) {
    pthread_detach(pthread_self());
    string name = (char*)args;
    int cnt = 1;
    while (cnt--) {
        printTid(name.c_str(), pthread_self());
        sleep(1);
    }
    printf("%s is over\n", name.c_str());

    return nullptr;
}

int main() {
    pthread_t tid1;

    pthread_create(&tid1, nullptr, startRoutine, (void*)"thread_1");

    int joinRet = pthread_join(tid1, nullptr);
    cout << strerror(joinRet) << endl;

    return 0;
}
```

依旧在 回调函数内将线程分离, 那么这段代码的执行结果是: 

![分离了, 但是join执行成功 |inline](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/detach_butjoinsucess.gif)

惊奇的发现, 线程退出之后成功得被`join`回收了.

这是什么原因? 不是在线程内分离线程了吗? 

其实是因为, 在主线程内创建了线程之后, 没有使主线程暂停一会, 直接就继续执行了`pthread_join()`

线程还没来得及将自己分离

所以线程退出时, 又会被主线程中的`pthread_join()`回收成功

要避免这种情况, 可以在创建线程之后将主线程等一会, 让新线程执行完分离再让主线程继续执行

或者, 可以直接在主线程内将线程分离

再或者不调用`pthread_join()`, 已经要分离了, 没有必要在调用了

```cpp
#include <iostream>
#include <cstring>
#include <string>
#include <pthread.h>
#include <unistd.h>
using std::cout;
using std::endl;
using std::string;

void printTid(const char* threadName, const pthread_t& tid) {
    printf("%s is runing, tid: %lu, pid: %d\n", threadName, tid, getpid());
}

void* startRoutine(void* args) {
    string name = (char*)args;
    int cnt = 1;
    while (cnt--) {
        printTid(name.c_str(), pthread_self());
        sleep(1);
    }
    printf("%s is over\n", name.c_str());

    return nullptr;
}

int main() {
    pthread_t tid1;

    pthread_create(&tid1, nullptr, startRoutine, (void*)"thread_1");
    pthread_detach(tid1);
    cout << "main thread detach thread_1" << endl;

    int joinRet = pthread_join(tid1, nullptr);
    cout << strerror(joinRet) << endl;
	
    sleep(5); 		// 防止主线程先退出
    
    return 0;
}
```

![在主线程中分离线程 |inline](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/detach_inmain_joinable_without.gif)

这样就可以解决`join`时, 新线程还未分离的问题

---

线程分离之后, 主线程就不再管分离的线程了

即使主线程先退出了, 也不会管分离的线程, 即主线程先退出, 被分离的线程可能还会运行

所以, **存在线程被分离时, 一般会将主线程不退出, 常驻内存**

线程分离, 就像是给线程设置了一下让线程如何退出

等线程执行完毕之后, 自动退出回收

所以, 其实**线程分离也可以看作是线程的第四种退出方式, 延迟退出**

> 第一种是, 回调函数返回
>
> 第二种是, `pthread_exit()`
>
> 第三种是, `pthread_cancel()`

---

到这里, 线程的概念和控制基本上介绍完了

但是还有一个问题, 就是**如何理解线程`id`**

不过会是下一篇文章的内容

感谢阅读~
