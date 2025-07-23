---
draft: true
title: "[Linux] 如何理解线程ID? 什么是线程局部存储? "
pubDate: "2023-04-15"
description: "在Linux中, 使用 pthread_create() 创建线程的时候, 第一个参数就是用来接收线程ID的"
image: https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/202306251802112.webp
categories:
    - Blogs
tags:
    - Linux系统
    - 多线程
---

前面的几篇文章, 介绍了线程的概念与控制的一些基本的内容.

虽然已经介绍了很多了, 但是 一直都没有详细的介绍一个重要的东西: `线程ID`

那么, 本篇文章 就来着重介绍一下, **`如何理解线程ID`**

---

# Linux线程`ID`

在`Linux`中, 使用`pthread_create()`创建线程的时候, 第一个参数就是用来接收线程ID的

> 此线程`ID`, **是`pthread`库维护线程时所使用的唯一标识符**
>
> 而不是`Linux`系统内核中 对于表示线程的`PCB`的线程ID
>
> `Linux`内核中的线程`ID`, 就是`PCB`的`pid`, 是`LWP`
>
> `Linux`内核中的`LWP`与`pthread`库维护的线程`ID`, 是 1对1的关系.
>
> `pthread`创建一个线程, 操作系统就会对新的`PCB`分配一个`LWP`, `pthread`库也会分配一个线程`ID`作为库维护线程的唯一标识符

那么线程`ID`是什么? 有什么意义呢? 

## 什么是线程`ID`

进程有进程`ID`, 即`PID`, 是**进程在操作系统中的唯一标识符**

而线程也有自己的`ID`, 通常叫做`TID`, 是**线程在操作系统中的唯一标识符**

一般为无符号的长整型`pthread_t`

`TID`, 一般都很大: 

```cpp
#include <iostream>
#include <pthread.h>
using std::cout;
using std::endl;

int main() {
    pthread_t tid1;
    pthread_create(&tid1, nullptr, nullptr, nullptr);
    cout << "tid1 = " << tid1 << endl;

    return 0;
}
```

![输出一个线程ID |inline](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722180943858.webp)

它为什么这么长呢? 

虽然线程`ID`是一个无符号的长整型, 但**实际上线程ID表示的是一个地址**

如果将获取到的`TID`以16进制输出:

![线程ID表示一个地址 |inline](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722180945365.webp)

## 如何理解线程`ID` **

通过一定方法获取的线程ID, 除了表示线程在操作系统中的**唯一标识**之外, 实际还**表示一个地址**

这个地址是什么呢? 

通过`pthread_create()`创建的线程, 在运行时 一定会产生一些临时数据: 临时变量、函数调用等

所以, 其实线程也有自己的栈结构, **新线程的栈是独立与主线程(进程)的**

既然线程存在一个独立的栈结构, 那么这个栈结构是谁创建的呢? 又在什么地方呢? 

### 线程的管理 **

使用过`pthread`库的接口, 编译生成的可执行程序. 运行时肯定是需要`libpthread.so`动态库的

![|inline](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722180947294.webp)

使用的`pthread`库, 是用户级的线程库

程序运行调用接口时, 会被**加载到内存**中, 再**映射到进程地址空间的共享区**

![|big](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722180949029.webp)

当线程需要调用`pthread`库中的接口时, 操作系统就会将磁盘中的动态库加载到内存中, 然后线程就会跳到共享区去找内存加载的动态库代码

> 进程中的代码一定包含三部分:
>
> 1. 程序编写的代码
> 2. 动态库代码
> 3. 系统内核代码

---

`pthread`线程库代码会被加载到内存中, 并被**映射到进程地址空间的共享区**

那么, 其实就可以将一个简单的调用了`pthread线程库`的进程抽象为这样: 

![|inline](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722180950964.webp)

---

再来思考一个问题, `Linux`中**线程是操作系统内核来管理的吗?**

`Linux`内核层面, 实际上没有线程的概念, 只有轻量级进程

所以`PCB`是操作系统内核管理的没错

但**线程并不是`Linux`内核管理的**, `Linux` 内核只有轻量级进程的概念、执行流的概念

即使可以模拟出线程, 但是**线程也不是`Linux`内核中实际存在的东西**

操作系统为用户提供了 创建 子进程、共用进程地址空间进程的接口, 并**没有提供直接创建、管理线程的接口**

我们使用的线程创建、控制等, 其实是`pthread`库, 封装了系统关于创建子进程相关接口而成的库接口

`pthread`库中, 帮我们实现了从轻量级进程到线程的过程: 创建线程栈、分配任务, 以及线程的控制等相关接口

那么, 说到这里其实可以明白了, 线程不是由操作系统内核代码管理的, 而是由`pthread`库代码管理的

操作系统内核为线程的模拟提供了轻量级进程的概念, 而**`pthread`库则通过轻量级进程和操作系统提供的接口实现了我们理解的线程**

创建进程, 是操作系统内核代码创建的, 操作系统进行对进程的管理, 实现了`PCB`

而创建线程, 可以说是`pthread`库代码创建的

那么, 为了方便线程的管理`pthread`库代码中也实现了**有关描述线程属性的结构体**

假如, `pthread`库中实现的描述线程属性的结构体 是`struct thread_struct{}`, 那么此结构体的成员就可以抽象为: 

```cpp
struct thread_struct {
    pthread_t tid; 			// 线程ID
    void* stack;			// 线程栈
    ……
}
```

即, `pthread`库维护有线程的栈、线程的分配等结构. 此结构体也是库维护的: 

![|big](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722180953607.webp)

描述线程属性的结构体, 会由 `pthread` 库创建并维护

> **图示的意思是, `pthread`库会创建并维护 线程属性的结构体, 而不是说此结构体会存储在库所在代码空间中, 更不是会存储在共享区**

介绍到现在, 其实已经可以回答两个问题了: 

1. 线程的栈是由谁创建的?

  使用`pthread_create()`创建线程, 那么线程的栈就是就是`pthread`库创建的

  因为 `pthread`库在创建线程的时候, 会创建线程的属性结构体, 结构体内维护由线程栈的信息

  > 这里介绍一个内容:
  >
  > `Linux`若使用`pthread`库创建线程, 则**进程地址空间内的栈区就是主线程的栈**
  >
  > **其他新线程的栈区**, 是在**由`pthread`库维护的一块空间内分配维护的**

2. 通过 `pthread` 库获取的线程`ID`, 表示的地址实际就是一个 **描述线程属性的结构体的地址**

  `pthread_t`到底是什么类型呢?

  **`取决于实现`**

  对于`Linux`目前实现的`NPTL`实现而言, `pthread_t`是一个无符号长整型

  可以用来表示`pthread` 库 维护线程时的唯一标识符

  也可以用来表示进程地址空间中的一个地址, 此地址就是**描述线程属性的结构体, 在进程中的地址**

> `pthread`库实现的线程是在`Linux`轻量级进程的基础上, 又维护了一些属性实现的
>
> 即, `pthread`库中描述线程属性的结构体应该是直接或间接维护有线程的`PCB`

> 对于Linux目前实现的`NPTL`实现而言, `pthread_t` 是一个 无符号长整型, 可以用来表示进程地址空间中的一个地址
>
> 但这种实现方式并不是`POSIX`标准规定的, 所以是**不符合`POSIX`标准**的
>
> 所以最好不要通过 此线程`ID`操作线程的属性, 不然可能会影响代码的可移植性

## 线程局部存储

`pthread`库中定义的描述线程的属性的结构体中, 维护有一个特殊区域: **线程局部存储区域**

这个区域的作用, 需要用代码来表现

我们知道, 进程中的数据, 对线程来说都是可以见的, 全局数据更是所有线程都可以修改

那么, 先来观察下面这段代码的执行结果: 

```cpp
#include <iostream>
#include <unistd.h>
#include <syscall.h>
#include <pthread.h>
using std::cout;
using std::endl;

int global_value = 100;

void* startRoutine(void* args) {
    const char* name = static_cast<const char*>(args);

    while (true) {
        printf("%s: %lu global_value: %d &global_value: %p Inc: %d lwp: %ld\n", 
                name, pthread_self(), global_value, &global_value, --global_value, ::syscall(SYS_gettid));

        sleep(1);
    }

    return nullptr;
}

int main() {
    pthread_t tid1, tid2, tid3;

    pthread_create(&tid1, nullptr, startRoutine, (void*)"thread1");
    pthread_create(&tid2, nullptr, startRoutine, (void*)"thread2");
    pthread_create(&tid3, nullptr, startRoutine, (void*)"thread3");

    pthread_join(tid1, nullptr);
    pthread_join(tid2, nullptr);
    pthread_join(tid3, nullptr);

    return 0;
}
```

执行这段代码: 

![所有线程都在修改全局变量 |inline](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722180957584.gif)

这段代码的执行结果就是, 创建的新线程都在对同一个`global_value`执行`--`操作

并且可以看到, 不同线程访问的`global_value`地址都是相同的会互相影响

但是, 如果我们在全局变量的定义前, 加一个`__thread`:

```cpp
__thread int global_value = 100;
```

然后执行代码: 

![|inline](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722180959360.gif)

可以看到一个明显的变化, 不同线程看到的是不同的地址, 实际看到的是不同的数据

这就是 **线程局部存储**, 只属于线程自己的局部存储数据

---

感谢阅读~
