---
draft: true
title: "[Linux-IO] 五种IO模型介绍(1): 理解IO、五种IO模型的概念、"
pubDate: "2024-12-03"
description: ""
# image: 
categories:
    - Blogs
tags: 
    - Linux系统
    - Linux网络
    - IO
---

# 重新理解`IO`

在`Linux`系统中, 使用文件`IO`相关的系统调用对文件描述符操作时, 比如`read()`、`recv()`或`recvfrom()`, 默认是阻塞模式的

即, **默认打开的文件描述符没有可读取数据时, `read()`、`recv()`或`recvfrom()`会阻塞等待, 直到可以读取到数据时, `read()`和`recv()`才能将数据从内核拷贝到用户空间中**

以最简单的**命名管道通信**为例:

`fifoServer.cc`

```cpp
#include <iostream>
#include <cstring>
#include <cerrno>
#include <sys/wait.h>
#include <sys/stat.h>
#include <fcntl.h>
#include <unistd.h>

#define IPC_PATH "./.fifo" // 命名文件路径

using std::cerr;
using std::cout;
using std::endl;

int main() {
    umask(0);
    if (mkfifo(IPC_PATH, 0666) != 0) {
        cerr << "mkfifo error" << endl;
        return 1;
    }

    int pipeFd = open(IPC_PATH, O_RDONLY);
    if (pipeFd < 0) {
        cerr << "open error" << endl;
        return 2;
    }

    cout << "命名管道文件, 已创建, 已打开" << endl;

    char buffer[1024];
    while (true) {
        cout << "阻塞" << endl;
        ssize_t ret = read(pipeFd, buffer, sizeof(buffer) - 1);
        cout << "阻塞结束" << endl;
        buffer[ret] = 0;

        if (ret == 0) {
            cout << "\n客户端(写入端)退出了, 我也退出吧";
            break;
        }
        else if (ret > 0) {
            cout << "客户端 -> 服务器 # " << buffer << endl;
        }
        else {
            cout << "read error: " << strerror(errno) << endl;
            break;
        }
    }

    close(pipeFd);
    cout << "\n服务端退出……" << endl;
    unlink(IPC_PATH);

    return 0;
}
```

`fifoClient.cc`

```cpp
#include <cstdio>
#include <cstring>
#include <fcntl.h>
#include <iostream>
#include <sys/stat.h>
#include <sys/wait.h>
#include <unistd.h>

#define IPC_PATH "./.fifo" // 命名文件路径

using std::cerr;
using std::cout;
using std::endl;

int main() {
    int pipeFd = open(IPC_PATH, O_WRONLY); // 只写打开命名管道, 不参与创建
    if (pipeFd < 0) {
        cerr << "open fifo error" << endl;
        return 1;
    }

    char line[1024]; // 用于接收命令行的信息
    while (true) {
        printf("请输入消息 $ ");
        fflush(stdout); // printf没有刷新stdout, 所以手动刷新
        memset(line, 0, sizeof(line));
        if (fgets(line, sizeof(line), stdin) != nullptr) {
            // 由于fgets 会接收 回车, 所以将 line的最后一位有效字符设置为 '\0'
            line[strlen(line) - 1] = '\0';
            // 向命名管道写入信息
            write(pipeFd, line, strlen(line));
            
            if (strcmp(line, "quit") == 0)
                break;
        }
        else {
            break;
        }
    }
    close(pipeFd);
    cout << "客户端(写入端)退出啦" << endl;

    return 0;
}
```

这段代码演示了简单的命名管道通信通信, 并在阻塞前后输出了标识:

![](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722160123214.gif)

可以看到, 当客户端未发送数据时, 服务端尝试读取`pipeFd`数据 处于阻塞状态

当客户端发送了数据时, `read()`能够从`pipeFd`中读取数据, 就结束阻塞

`write()`等一系列写操作的系统调用也是一样的, 当管道满了无法继续写入, 就会陷入阻塞, 直到管道不满才会继续写入

从例子中可以重新理解一下`IO`操作:

**一般情况下的`IO`操作, 实际由*阻塞 和 拷贝数据*两个状态组成** (`read()`、`write()`等的本质, 是将数据在内核和用户之间进行拷贝)

阻塞, 就是等待`IO`事件就绪, 拷贝数据, 就是将数据从内核或用户空间拷贝出来

这样最简单的`IO`操作, 大多数情况下**处于阻塞状态的时间占比更长**

此时, 要提高`IO`效率 从思路上看不难, 减少阻塞时间就好了

如何减少阻塞时间, 提高`IO`效率, 就是`IO`模型的作用

# 五种`IO`模型

五种`IO`模型: **阻塞`IO`** **非阻塞`IO`** **信号驱动`IO`** **多路转接`IO`(多路复用)** **异步`IO`**

## `IO`模型概念

### **阻塞`IO`**

阻塞`IO`是最常见的`IO`模型

在上面的命名管道通信例子中, 使用的就是阻塞`IO`. **`Linux`进程所有的文件描述符默认都是阻塞的**

**在内核将数据准备好之前, 系统调用会一直阻塞等待数据, 使整个执行流陷入等待, 直到数据准备好, 拷贝完毕 系统调用再返回, 即为 阻塞`IO`**

![|lwide](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722160128768.webp)

### 非阻塞`IO`

非阻塞`IO`稍微复杂一些

阻塞`IO`, 会等待数据准备就绪 并拷贝完成之后, 再进行返回. 非阻塞`IO`不会如此

**对于非阻塞`IO`, 如果内核还未准备好数据, 系统调用不会阻塞等待, 而是会直接返回`EWOULDBLOCK`或`EAGAIN`错误码, 此时系统调用结束, 执行流可继续执行其他代码**

非阻塞`IO`, 多了一个询问动作, 而不是呆呆地在内核中等待数据

一次系统调用, 就**只询问一次** 内核数据是否就绪. 如果数据没有就绪, 就返回一个错误码, 不再做其他动作; 如果就绪, 就拷贝数据再返回

因为, 非阻塞`IO`操作, 如果数据未准备好, 系统调用就直接返回了

所以, **非阻塞`IO`操作, 往往需要反复执行尝试从文件描述符中拷贝数据**, 即 **轮询操作**, 这其实是一种对`CPU`资源的浪费

![|lwide](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722160131013.webp)

> 阻塞`IO`不会浪费`CPU`资源, 因为阻塞时执行流不占用`CPU`资源

### 信号驱动`IO`

信号驱动`IO`, 从字面上就能猜出个大概

`Linux`进程信号的产生与进程的运行是异步的, 即 进程接收到信号之前, 信号的产生和发送不由进程控制

`Linux`存在一个`SIGIO`信号, 当文件描述符为信号驱动`IO`, 当数据准备就绪时, 操作系统就会给进程发送`SIGIO`信号

因此, 捕捉`SIGIO`信号, 并在此信号处理函数中进行数据拷贝, 就能实现信号驱动`IO`

**对于信号驱动`IO`, 不主动调用 系统调用, 而是捕捉`SIGIO`信号, 并在`SIGIO`信号处理函数中调用 系统调用, 实现`IO`由信号驱动**

![|lwide](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722160133670.webp)

### 多路转接`IO` **

**多路转接**, 也叫**多路复用**, 目前被广泛运用在网络通信系统中

理解`IO`操作实际上是由**等待资源 + 拷贝资源**组成之后

从**多路转接**这个`IO`模型的名字上, 可能可以猜到一些苗头

在`TCP`网络通信时, 使用`recv()`可以等待并接收某个套接字的数据, 因为文件描述符默认是阻塞的, 如果想要管理多个连接, 可以使用多线程来处理多个连接的套接字; 或者对不同的套接字设置非阻塞, 进行轮询, 只是浪费CPU资源

而**多路转接, 能够实现单线程处理多个连接的套接字的数据**

多路转接的大概思路为: **同时等待多个文件描述符的资源**, 当某个文件描述符资源就绪, 再对此文件描述符进行`IO`操作; 当某些文件描述符资源就绪, 就对这些文件描述符进行`IO`操作

以`select()`系统调用为例:

![|lwide](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722160136319.webp)

正常情况下的`IO`操作, 只能等待一个文件描述符, 而多路复用, 能够实现同时对多个文件描述符的等待

### 异步`IO`

异步`IO`也是结合进程信号实现的

信号驱动`IO`, 是在文件描述符数据就绪之后, 给进程发送`SIGIO`信号, 让进程执行系统调用拷贝数据

而异步`IO`, 是在设置好异步`IO`请求之后, 进程就可以放手了, 直到内核完成数据拷贝, 数据已经拷贝到用户空间之后, 内核会给进程发送信号, 再通过自定义信号处理函数, 进行数据处理

这里, 在数据拷贝完成之后, 内核发送的 进程信号和信号处理函数, 都是在设置异步`IO`请求时设置好的

即, **对于异步`IO`, 需要对指定文件描述符设置异步`IO`请求(读/写、信号、信号处理、数据存储位置等), 然后等待数据和拷贝数据的工作不由进程执行, 全权交给内核, 内核完成数据拷贝之后会向进程发送信号, 进程处理信号 完成异步`IO`**

![|lwide](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722160138543.webp)

## 相关名词概念

上面概念中, 有几个名词需要理解一下: **阻塞**和**非阻塞** **同步**和**异步**

**阻塞**和**非阻塞**, 一般根据系统调用正常执行的状态判断

**阻塞:** 系统调用在正常执行并获取结果之前, 会将当前执行流挂起, 暂停整个执行流的运行, 直到获取到结果, 才会恢复并返回

**非阻塞:** 系统调用正常执行, 即使不能马上获取结果, 也不会将执行流挂起, 而会立刻返回, 即使没有获取预想结果

`IO`的**同步**和**异步**, 是根据系统调用对执行流的影响判断的

**同步:** `IO`操作的在执行时, 会阻塞执行流的正常运行, 直到`IO`操作完成, 执行流才会继续运行

**异步:** `IO`操作的执行, 不会影响原执行流的正常运行, `IO`操作完成之后, 会通过回调函数或信号的方式通知执行流处理数据

> 这里的同步与异步, 所用场景是`IO`操作
>
> 线程中有**同步**和**互斥**, 与这里的并没有关系
>
> **线程的同步**, 是指一种控制线程以一定顺序执行的策略
>
> **线程的互斥**, 是指通过锁等手段, 控制线程不能同时运行的策略

## 简单的非阻塞`IO`

要实现非阻塞`IO`操作, 需要先了解一个系统调用`fcntl()`

```cpp
int fcntl(int fd, int cmd, ... /* arg */ );
```

![|lwide](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722160141275.webp)

`fnctl()`系统调用拥有两个显式参数和可变参数, 返回值类型是`int`:

1. `int fd`

    很明显, 第一个参数需要传入一个文件描述符

    `fcntl()`就是对此文件描述符进行操作

2. `int cmd`

    第二个参数, 需要传入一个命令, 表示要做什么操作

    可用的`cmd`, 在`man`手册中都有记录

    比如, 复制文件描述符相关的、文件描述符相关的、文件描述符状态相关的等等

3. **可变参数**

    可变参数是否需要传参, 都要根据`cmd`的传参来决定

    如果`cmd`传入的是`F_GETFL`, 用来获取文件描述符状态, 可变参数部分就不需要传参

    如果`cmd`传入的是`F_SETFL`, 用来设置文件描述符的状态, 可变参数部分就需要传参

4. **返回值**

    `fcntl()`的返回值同样与传入的`cmd`有关

    如果`cmd`传入`F_GETFL`, 那么 正确的返回结果就是 表示文件描述符状态的一个数据

    如果`cmd`传入`F_SETFL`, 那么 正确的返回结果就是`0`

    如果发生了错误, 就会返回`-1`

    ---

    只有需要获取文件描述符的某些属性时, `fcntl()`的返回值才会有实际的意义, 具体可查看`man`手册

下面的代码, 实现了一个简单的非阻塞`IO`:

**`util.hpp`:**

```cpp
#ifndef __UTIL_HPP__
#define __UTIL_HPP__

#include <fcntl.h>
#include <unistd.h>

#include <iostream>

namespace Util {
    // 对文件描述符设置非阻塞 的函数
    bool setNoBlock(int fd) {
        // 获取文件描述符的 原有属性
        int flag = fcntl(fd, F_GETFL);
        if (flag == -1) {
            return false;
        }

        // 设置文件描述符属性
        fcntl(fd, F_SETFL, flag | O_NONBLOCK);

        return true;
    }
}  // namespace Util

#endif
```

**`main.cc`:**

```cpp
#include <unistd.h>

#include <cstdio>
#include <cstring>
#include <functional>
#include <iostream>
#include <string>
#include <vector>

#include "util.hpp"

using func_t = std::function<void()>;

int main() {
    std::vector<func_t> funcs;
    funcs.push_back([]() {
        std::cout << "other task1 is running" << std::endl;
    });
    funcs.push_back([]() {
        std::cout << "other task2 is running" << std::endl;
    });
    funcs.push_back([]() {
        std::cout << "other task3 is running" << std::endl;
    });

    Util::setNoBlock(0);

    char buffer[1024] = { 0 };
    while (true) {
        int n = scanf("%s", buffer);
        if (n == -1) {
            std::cout << "errno: " << errno << ", desc: " << std::strerror(errno) << std::endl;
            for (const auto &f : funcs)
                f();
        }
        else
            std::cout << "some data: " << buffer << std::endl;

        sleep(1);
    }

    return 0;
}
```

先解释一下代码:

`util.hpp`中实现了一个**`setNoBlock(int fd)`函数, 用来将文件描述符设置为非阻塞模式**

具体的步骤是:

1. 先调用`fcntl()`系统调用, `cmd`传入`F_GETFL`, 并接收返回值`flag`

    用以获取文件描述符当前的状态属性

    获取的状态属性, 与文件描述符的读写状态和**访问模式**等相关

2. 再次调用`fcntl()`系统调用, `cmd`传入`F_SETFL`, 需要传入可变参数`flag | O_NONBLOCK`

    **设置文件描述符为非阻塞模式**

    ---

    为什么可变参数要传入`flag | O_NONBLOCK`?

    可变参数部分是需要设置的文件描述符属性, 并且设置是覆盖性的

    所以需要在不改变其他属性的前提下, 增加非阻塞模式, 就需要用**原有属性 | 新增模式**

`main.cc`中实现了简单的非阻塞`IO`

`C/C++`中存在一个最常见的阻塞`IO`文件描述符, **标准输入`(fd=0)`**

通过`setNoBlock(0)`可以将标准输入设置为非阻塞模式

并循环调用`scanf()`尝试从键盘获取字符串, 如果没有获取到 就执行其他任务

一般而言, `scanf()`在不输入数据的情况下, 会导致进程阻塞

而在对标准输入设置了非阻塞模式之后, 会是什么现象呢?

![](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722160145578.gif)

能够发现很神奇的一幕

即使没有输入数据, 进程也不会阻塞, 并且**在不输入数据时`scanf()`的返回值是`-1`, 因为一直在打印错误码**

错误码对应的错误信息是: **资源暂时不可用**

并且, 获取不到输入数据时, 进程会正常执行`funcs`中存储的任务

在能够获取到数据时, 正常获取数据

这就是一个最简单的非阻塞`IO`, 能够很好的体现出非阻塞`IO`的特点

---

除了通过`fcntl()`系统调用直接设置文件描述符的状态属性之外, 且除`read()`或`write()`之外的其他`IO`系统调用

比如, `sendto()` `send()` `recv()` `recvfrom()`

都存在一个参数`int flag`, 也可以通过此参数设置本次`IO`的属性, 不会影响文件描述符本身的属性

## 多路转接`IO`模型实现 **

`Linux`提供了三个不同的实现多路转接的接口`select()`、`poll()`和`epoll()`

他们都能实现同时等待不同文件描述符的接口, 但因为出现的时期不同, 所以实现的思路和原理也不相同

`epoll()`可以看作是其中最优秀的

### `select()`

`Linux`中`select()`的函数原型是这样的:

```cpp
int select(int nfds, 
           fd_set *restrict readfds,
           fd_set *restrict writefds,
           fd_set *restrict exceptfds,
           struct timeval *restrict timeout);
```

![|lwide](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722160148724.webp)

`select()`存在4个参数:

1. `int nfds`

    第一个参数, 需要传入**所监视文件描述符中的最大值+1**

    比如, 如果要监视的文件描述符有`3` `4` `5` `9`, 那么此参数就应该填入`9+1`

    **不是**传入监视的文件描述符的**个数**, 而是**所监视文件描述符中的最大值+1**

2. `fd_set *restrict readfds`

    第二个参数, 需要传入**需要监视可读状态的文件描述符集**

    即, 要监视是否能从文件描述符中读取数据

3. `fd_set *restrict writefds`

    第三个参数, 需要传入**需要监视可写状态的文件描述符集**

    即, 要监视是否能向文件描述符中写入数据

4. `fd_set *restrict exceptfds`

    第四个参数, 需要传入**需要监视异常状态的文件描述符集**

    即, 要监视文件描述符是否发生异常

    什么是异常状态呢?

    比如, 存在外带数据, 异常关闭, 读取发生错误等

5. `struct timeval *restrict timeout`

    第五个参数, 需要传入**`select()`本次监视的最长阻塞时间**

    这个参数是用来控制`select()`单次的等待时间的, 如果在此时间内没有文件描述符就绪

    **`select()`将会返回`0`**

`select()`的参数中存在两个结构体类型, 可能比较陌生:

1. `struct timeval`

    ![|wide](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722160152195.webp)

    这个结构体比较简单, 只有两个成员

    `time_t tv_sec`, 实际是`long int`类型的, 用于表示秒

    `suseconds_t tv_usec`, 实际也是`long int`类型的, 用于表示微秒

2. `fd_set`

    `fd_set`是一个位图结构, 表示文件描述符集

    ![|wide](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722160153760.webp)
    
    `struct fd_set`存在一个成员变量`__fd_mask fds_bits[__FD_SETSIZE / __NFDBITS]`
    
    也就是一个数组, `__fd_mask`实际就是`long int`类型
    
    `__FD_SETSIZE`在`Linux`中是`1024`的宏定义
    
    而`__NFDBITS`则是`(8 * (int)sizeof(__fd_mask))`
    
    所以, `struct fd_set`中其实只是存在一个`long int fds_bits[]`数组, 数组长度为`1024 / (8 * 8) => 1024 / 64 => 16`
    
    即, `fd_set`底层是`long int fds_bits[16]`, `long int大小为8字节` 数组长度为`16`
    
    所以, **`fd_set`底层是一个最长1024位的位图**

简单了解了`select()`的接口, 再了解一下`select()`的使用过程

`select()`中间三个`fd_set`类型的参数, 是以位图的形式传入需要监视的文件描述符

以读为例, 即 判断一个文件描述符中*是否能够读取到数据*:



`select()`第一个参数传入**需要被监视的文件描述符中的最大值+1**, 因为`select()`是通过**遍历位图**实现对设置的文件描述符进行监视的

### `poll()`





### `epoll()`

