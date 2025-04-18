---
draft: true
title: "[Linux] 详解 Linux管道通信: 匿名管道、命名管道的原理及使用等"
pubDate: "2023-04-02"
description: "Linux为我们提供了三种进程间通信的方法: 1. pipe 管道通信 2. System V标准通信 3. POSIX标准通信. 本篇文章的主要内容是 匹配管道通信"
image: https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/202306251758839.webp
categories: ['tech']
tags: ["Linux系统", "进程"]
---

进程地址空间的设计使进程拥有一块独立的空间, 为进程增添了独立性 和 安全性.

但是, 各种进程在操作系统中运行时, 总逃不了可能某些进程之间需要进行交流. 而此时, 进程地址空间的存在又好像成为了进程之间通信的一层阻隔.

---

# 进程通信

关于什么是进程通信的问题, 在操作系统中, 进程通信实际上就是 **不同进程之间传输、交换数据** 

那么为什么进程之间要通信呢？为了进程之间不互相干扰, 不是已经用进程地址空间将进程独立了吗？

## 为什么要有进程通信

虽然进程拥有自己的虚拟地址空间, 但是也并不能阻止进程之间可能存在通信的需求

比如: 

1. 进程之间数据传输: 

	一个进程需要将自身的数据 发送到 另一个进程; 或者 一个进程 需要 另一个进程的数据

2. 进程需要共享资源: 

	就像可能多个进程可以同时使用加载到内存中的动态库代码一样

3. 通知事件

	就比如, 在Linux中, 子进程运行终止 需要告诉父进程运行结果

4. 进程控制另一个进程: 

	比如, 我们在使用程序调试代码的时候, 其实就是一个进程完全控制了另一个进程的执行, 让我们可以在进程运行时打上断点、执行下一个语句等

5. ……

这些都是进程通信的需求, 有需求那么就要提供方法.

## Linux进程通信方法

Linux为我们提供了三种进程间通信的方法: 

1. `pipe 管道通信`

	管道通信相信许多人已经用过了, 在命令行中的标志就是: `|`: 
	
	![|wide](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/image-20230324112501490.webp)
	
	管道通信一般用于 **本地进程**  之间传输数据.
	
	比如在上面的例子中, 我们将ps 进程执行的数据通过管道传输给了 grep, 才能筛选出指定的内容
	
	管道通信又分为: **匿名管道** 和 **命名管道**
	
	管道通信是本片文章的主要内容

2. System V 进程通信

	System V 是一套进程通信的标准, 可以为操作系统提供进程通信的接口, 非本篇文章的主要内容

3. POSIX 进程通信

	POSIX 也是一套进程通信的标准, 这套标准可以为操作系统提供达成进程通信的接口, 也非本篇文章的主要内容

本篇文章的主要内容, 是 pipe管道通信, 不会涉及到 System V 和 POSIX 进程通信

# 管道

在正式介绍管道之前, 先来简单分析一下, 进程怎么样通信的？

进程是拥有自己的进程地址空间的, 也就是说进程之间, 不能像我们人与人之间直接面对面说话.

但进程终究是在操作系统中运行着, 并且使用着操作系统的各种资源. 那么, 进程之间是否可以通过操作系统中的资源进行通信呢？

就像 一个进程向文件中写入内容, 另一个进程从同一个文件中读取内容: 

![ |huge](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/image-20230324114404251.webp)

这个过程中, 我们通过访问同一个文件资源, 达成了一个进程向另一个进程传递数据的目的, 那这其实就是一种广义上的进程通信.

那么也就是说, 进程通信的前提其实是 **不同进程需要先能够看到、能够获取同一份资源(文件、内存等)**

**这个资源 的种类, 其实就决定了进程通信的方式** 

管道, 就是提供资源的一种手段, **管道其实是一种文件资源**

## 什么是管道？

管道, 是`Unix`中最古老的进程间通信的方式

管道, 其实就是 **一个进程连接到另一个进程的数据流**. 就像生活中, 管道是输送资源的: 石油、天然气等

而Linux系统中的管道, 则是输送数据的

就像这样我们之前在命令行中使用的命令: `ps -ajx | grep` 

我们使用管道, 将`ps`的执行结果传输到了`grep`中, 供`grep`筛选. 这之中, 管道就起到了传输数据的作用:

那么管道究竟是什么？

管道, 其实是 **一个打开的文件**. 但是这个文件很特殊, **向这个文件中写入数据实际上并不会真正写入磁盘中**

Linux系统中 描述进程已打开文件 的结构体`files_struct`, 其中存储着 指向打开文件的数组`fd_array`, 此数组的类型是 `struct files*`. 

而这个 `files结构体`中, 直接或间接描述了文件的所有属性, 以及 此文件的缓冲区相关信息: 

![ |huge](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/image-20230324122704908.webp)

缓冲区信息中, 包含着描述文件的`inode`结构体, 而`inode`结构体中其实描述着一个联合体: 

![ |inline](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/image-20230324123236480.webp)

这个处于`inode`结构体中的联合体, 其实就是为了标识这个文件的类型, 其中`pipe`就表示此文件的类型是管道文件.

> `inode`的此联合体, 可以表示三种文件: 
>
> 1. `i_pipe`, 管道文件
> 2. `i_dbev`, 块设备(磁盘)文件
> 3. `i_cdev`, 字符设备文件: 键盘等

通过文件的`inode`, 系统可以辨别出打开的文件是管道文件.

而 **向管道文件中写入数据实际上并不会写入到磁盘上, 而是只写入到文件的缓冲区中** , 因为管道文件主要是用来进程间通信的, 如果先写入磁盘另一个进程再读取, 整个过程就太慢了

这种不实际存储数据的行为特点, 其实也符合生活中管道的特点, **管道不能用来存储资源, 只能用来传输资源**

并且, 除了管道不实际存储资源以外, 管道还有一个特点: **管道是单向传输的** 

这是管道的特点, Linux的管道也是遵循这个特点的, 也就是说: 

**两个进程间使用管道通信时, 其中一个进程若以只写方式打开管道, 那么另一个进程就只能以只读方式打开文件**

![](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/image-20230325110131491.webp)

或者也可以反过来, 不过`管道的两端只能是不同的打开方式`

而管道的种类有两种: 

1. 匿名管道
2. 命名管道

这两种管道的命名, 直接反应出了管道文件的打开方式

## 匿名管道

匿名管道的创建, **不指定打开文件的文件名、文件路径等**, 即 **不会 有实际目标的 打开文件**

只是在内存中打开一个文件, 用于进程间的通信

而由于匿名管道是 **非明确目标的文件**, 也就意味着 **两个完全不相关的进程无法访问同一个管道**, 因为 匿名管道不在系统磁盘中存在, 完全不相关的进程无法找到这个管道文件

这也就意味着, **匿名管道 其实只能用于具有血缘关系的进程间通信**

匿名管道可以用于父子进程之间的通信, 那么管道的创建流程大概就是: 

![](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/image-20230325180631728.webp)

![ ](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/image-20230325180720445.webp)

![ ](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/image-20230325180850724.webp)

也就是说, 匿名管道的创建应该是 **由父进程创建, 然后 创建子进程 继承 父进程的管道, 子进程再关闭管道的写入端或读取端** 

这样就创建了一个管道通信

然而, 相信许多人对于这个过程都会有许多的问题: 

1. 为什么父子进程要分别以只读和只写方式打开两次文件, 然后再创建子进程呢？

	为什么不是父进程以一个方式打开, 子进程再以另一个方式打开呢？
	
	因为 **子进程会以继承父进程的方式打开同一个文件**, 即 子进程打开文件的方式与父进程是相同的
	
	那这样的话, 父子进程通过想要通过管道实现进程通信, 子进程就需要先关闭已打开的文件, 再以某种方式打开同一个文件
	
	这样比较麻烦, 如果在创建子进程之前, 父进程就已经以两种方式打开同一个文件, 那么再子进程创建之后, 只需要父进程关闭一个端口, 子进程关闭另一个端口就可以了

2. 必须父进程关闭读取端, 子进程关闭写入端吗？

	并不是的, 父子进程关闭哪个端口, 其实是 **根据需求**  关闭的.
	
	如果子进程要向父进程传输数据, 那么关闭读取端的就应该是子进程

3. 进程是如何知道管道被打开了什么端口的？或者说 **进程是如何知道管道被打开了几次的？** 

	其实在`file`结构体中, 存在一个计数变量`f_count`: 
	
	![|wide](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/image-20230327153807787.webp)
	
	不过, 这个变量实际上还是一个结构体, 用于计数



### 匿名管道的创建与使用

Linux操作系统提供了一个接口: 

![ ](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/image-20230324230532528.webp)

![ |inline](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/image-20230325183110031.webp)

且, `pipe()`, 如果 `创建管道成功, 则返回0, 否则返回-1`, 并设置`errno`

`pipe`系统调用的作用是, 打开一个管道文件. 其参数是一个 **输出型参数** 

在`pipe`系统调用 **执行成功之后, 参数数组内会存储两个元素** : 

1. `pipe[0],` 存储以 只读方式 打开管道时获得的`fd`
2. `pipe[1]`, 存储以 只写方式 打开管道时获得的`fd`

之后就可以根据需求, 选择父子进程的端口关闭

此系统接口具体的使用, 可以参考下面这段代码: 

```cpp
#include <iostream>
#include <unistd.h>
#include <cstring>

int main() {
    // 父进程 pipe()系统调用, 打开管道
    int pipeFd[2] = {0};
    int ret = pipe(pipeFd);
    if(ret != 0) {
        std::cerr << "pipe error" << std::endl;
        return 1;
    }

    // 创建子进程
    // 并让 父进程 通过管道 向子进程 传输数据
    pid_t id = fork();
    if(id < 0) {
        std::cerr << "fork error" << std::endl;
        return 2;
    }
    else if(id == 0) {
        // 子进程执行代码
        // 子进程接收数据, 所以关闭只写端口 pipeFd[1]
        close(pipeFd[1]);
        char buffer[1024];
        while (true)
        {    
            memset(buffer, 0, 1024);
            ssize_t s = read(pipeFd[0], buffer, sizeof(buffer)-1);
            if(s > 0) {
                // 读取成功
                buffer[s] = '\0';
                std::cout << buffer << std::endl;
            }
            else if(s == 0) {
                // 读取结束       
                std::cout << "父进程写入结束, 子进程读取也结束！" << std::endl;
                break;
            }
            else {
                // 读取失败
            }
        }
        
    }
    else {
        // 父进程执行代码
        // 父进程发送数据, 所以关闭只读端口 pipeFd[0]
        close(pipeFd[0]);
        // 父进程每秒写入一句, 共5句
        const char* msg = "你好子进程, 我是父进程, 我通过管道跟你通信, 此次发送编号:: ";
        int cnt = 0;
        while(cnt < 5) {
            char sendBuffer[1024];
            sprintf(sendBuffer, "%s %d", msg, cnt);
            write(pipeFd[1], sendBuffer, strlen(sendBuffer));
            sleep(1);
            cnt++;
        }
        std::cout << "父进程写入完毕" << std::endl;
    }

    return 0;
}
```

![匿名管道通信测试 |inline](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/%E5%8C%BF%E5%90%8D%E7%AE%A1%E9%81%93%E9%80%9A%E4%BF%A1%E6%B5%8B%E8%AF%95.gif)

可以看到, 我们成功使用`pipe()`接口创建了匿名管道, 在父进程与子进程之间建立了通信

但是, 上面的这个例子, 我们代码中写的时: 

1. 父进程每``1s``, 写入一次数据

	![|wide](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/image-20230325215305146.webp)

2. 子进程死循环读取父进程写的数据

	![|wide](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/image-20230325215158088.webp)

但是, 代码的执行结果是是什么？代码的执行结果 **并不是子进程死循环读取父进程写入到管道的内容** 

代码的结果像是, 子进程也每`1s`读取一次管道数据, 或是说 子进程等父进程新写入数据之后才会读取数据

这是什么原因呢？

**在父进程没有向管道内写入数据时, 子进程在等待!**

**父进程写入数据之后, 子进程才能`read()`到管道内容, 子进程读取、打印数据是以父进程的节奏为主的** 

在父子进程对管道进行读写操作时, 是有顺序性的

**此顺序是: 写入端必须先写入数据, 读取端才能够读取数据** 

也就是说, **当管道内部无数据时, 读取端的进程将会进入阻塞状态, 直到写入端写入数据** 

读取端进入阻塞状态, 是因为 **当管道内无数据时, 读取端进程会被放入到管道文件的等待队列中等待文件资源**

相对应的, **当管道内数据被写满时, 写入端的进程将会进入阻塞状态, 直到读取端读取数据** 

> `pipe`文件中, 存在等待队列: 
>
> ![ |huge](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/image-20230325221323595.webp)

可以通过修改父子进程的写入和读取数据的时间, 来验证一下管道文件是否存在读写顺序:

我们将, 父进程改为`10s`一写入, 再测试:

![匿名管道通信顺序测试 |inline](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/%E5%8C%BF%E5%90%8D%E7%AE%A1%E9%81%93%E9%80%9A%E4%BF%A1%E9%A1%BA%E5%BA%8F%E6%B5%8B%E8%AF%95.gif)

我们将, 子进程改为`15s`一读取, 再将父进程改为死循环写入并输出写入次数:

![匿名管道写满测试 |inline](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/%E5%8C%BF%E5%90%8D%E7%AE%A1%E9%81%93%E5%86%99%E6%BB%A1%E6%B5%8B%E8%AF%95.gif)

可以看到, **当父进程存在一定的写入间隔时, 子进程读取管道数据也会根据父进程的写入间隔进行读取**

**当父进程将管道写满, 子进程还未读取时, 父进程不会再向管道中写入内容**

这是因为, `pipe`文件内部存在访问控制机制, 而对于无访问控制机制的文件, 则不会存在写入与读取的顺序

> `pipe`文件存在访问控制机制, 会将管道文件的读写顺序控制为: **先写再读**
>
> 这其实也符合生活中的管道特点, **管道中传输的资源可以看作是一次性流通的**
>
> 比如 向管道中倒入一瓶水, 这瓶水完全经过管道流通之后, 水就不在管道中了. 管道通信也是这样的, 当读取端读取过管道中存在的数据时, 就可以看作此数据已经流出管道了, 不能在被二次读取. 

### 使用匿名管道控制进程

上面介绍了匿名管道的创建和简单的使用.

不过, 匿名管道的使用, 除了上面 用于进程间传输数据, 还可以用于控制进程.

一个 **简单的例子就是, 可以通过匿名管道向进程派发任务, 以达到控制进程的目的** 

简单来说就是, 写入端进程 可以向 读取端进程(一般为子进程)派发任务.

而派发任务的大致流程其实是: 通过传输任务的函数指针, 来让子进程执行指定的函数, 以达到派发任务的效果 

可以以下面这段代码为例: 

```cpp
#include <iostream>
#include <unistd.h>
#include <ctime>
#include <cstring>
#include <string>
#include <vector>
#include <unordered_map>
#include <sys/wait.h>
#include <sys/types.h>
#include <cassert>
using std::cout;
using std::endl;
using std::cerr;
using std::vector;
using std::string;
using std::unordered_map;

typedef void (*functor)();      // typedef 函数指针为 functor

vector<functor> functors;        // 创建函数指针数组, 用来存储函数指针

unordered_map<uint32_t, string> info;       // 用来存储 functors 对应元素存储的任务的信息

// 只用函数举例, 不实现具体功能
void f1() {
    cout << "这是一个处理日志的任务, 执行的进程 ID [" << getpid() << "]"
         << "执行时间是[" << time(nullptr) << "]\n" << endl;
    //
}
void f2() {
    cout << "这是一个备份数据任务, 执行的进程 ID [" << getpid() << "]"
         << "执行时间是[" << time(nullptr) << "]\n" << endl;
}
void f3() {
    cout << "这是一个处理网络连接的任务, 执行的进程 ID [" << getpid() << "]"
         << "执行时间是[" << time(nullptr) << "]\n" << endl;
}

void loadFunctor() {
    info.insert({functors.size(), "处理日志"});
    functors.push_back(f1);

    info.insert({functors.size(), "备份数据"});
    functors.push_back(f2);

    info.insert({functors.size(), "处理网络连接"});
    functors.push_back(f3);
}


int main() {
    // 0. 加载任务列表
    loadFunctor();      // 加载任务到数组中, 即 加载任务列表

    // 1. 创建管道
    int pipeFd[2] = {0};
    if(pipe(pipeFd) != 0) {
        cerr << "pipe error" << endl;
    }

    // 2. 创建子进程
    pid_t id = fork();
    if(id < 0) {
        cerr << "fork error" << endl;
    }
    else if(id == 0) {
        // 子进程执行代码
        // 关闭 写入端
        close(pipeFd[1]);
        while(true) {
            // 与写入端写入的数据相同的数据类型
            uint32_t operatorType = 0;
            ssize_t ret = read(pipeFd[0], &operatorType, sizeof(uint32_t));
            if(ret == 0) {
                cout << "父进程任务派完了, 我要走了……" << endl;
                break;
            }
            // 这里的read返回值 ret, 大小应该是sizeof(uint32_t), 可以断言判断一下
            assert(ret == sizeof(uint32_t));
            (void)ret;
            // 这里将ret强转为void类型, 是为了解决release编译模式中, 有可能因为ret没被使用而出现的warning
            // assert() 只在debug编译模式中有效, 使用release模式编译的话, assert()就没有了
            // 所以会出现 ret没被使用的情况

            if(operatorType < functors.size()) {
                // 如果从管道中接收的数据, 在functors(任务列表)的范围内, 则执行任务
                functors[operatorType]();
            }
            else {
                // 否则, 就可能出 bug 了
                cout << "BUG ? operatorType:: " << operatorType << endl;
            }
        }
        // 执行任务完成, 关闭读取端
        close(pipeFd[0]);
        exit(0);
    }
    else {
        // 父进程执行代码
        // 随机向子进程分配任务, 则需要先设定一个 srand
        srand((long long)time(nullptr));        // 用时间设定
        close(pipeFd[0]);
        int num = functors.size();
        int cnt = 1;               
        while (cnt <= 10)   // 随机派发 10 次任务
        {
            uint32_t commandCode = rand() % num;    // 随机生成 派发的任务编号

            cout << "父进程已派发任务:: " << info[commandCode] << ", 第 " << cnt << " 次派发" << endl;
            cnt++;
            
            write(pipeFd[1], &commandCode, sizeof(uint32_t));       // 向管道中写入任务编号
            sleep(1);
        }
        // 派发完成之后, 关闭写入端, 并回收子进程
        close(pipeFd[1]);
        pid_t result = waitpid(id, nullptr, 0);
        if(result) {
            cout << "waitpid success" << endl;
        }
    }

    return 0;
}
```

 执行这段代码的结果是: 

![单进程管道派发任务 |inline](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/%E5%8D%95%E8%BF%9B%E7%A8%8B%E7%AE%A1%E9%81%93%E6%B4%BE%E5%8F%91%E4%BB%BB%E5%8A%A1.gif)

父进程会随机的向子进程派发, 我们设置的任务, 并且子进程会执行 

我在这里简单的分析一下这段代码各部分的用途: 

> 1. 任务列表和任务信息部分: 
>
>     ![ |wide](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/image-20230327114104041.webp)
>
>     这部分的代码
>
>     首先, 定义了一个任务列表: `vector<functor> functors` 和 用来存放任务信息的哈希表: `unordered_map<uint32_t, string> info`
>
>     `functors` 用来存储函数指针, 其下标即为对应任务的任务号
>
>     `info` 用来存储任务信息, `pair`的`first`存储任务号, `second`存储任务信息
>
>     然后, 写了三个任务函数, 没有具体功能
>
>     最后, 写了一个 将任务加载到`functors`任务列表、将任务信息加载到`info`的函数.
>
> 2. 然后就是`main`函数:
>
>     ![ |wide](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/image-20230327114803469.webp)
>
>     `main`函数的内部其实可以分为4大块:
>
>     1. 加载任务列表, 即 执行 `loadFunctor()`函数, 以保证任务列表和任务信息的正常使用
>
>     2. 创建匿名管道
>
>     3. 创建子进程, 并编写子进程执行的代码
>
>         子进程需要执行的无非是, 读取管道信息, 并由读取到的信息判断、执行派发的任务
>
>     4. 编写父进程需要执行的代码
>
>         而父进程需要执行的就是, 向管道中写入数据, 达到向子进程随机派发任务的目的
>
> 3. 再然后应该去写, 父进程需要执行的代码:
>
>     ![ |wide](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/image-20230327115414065.webp)
>
>     父进程的功能是 向子进程随机派发任务列表中的任务, 也就需要取随机值, 先使用`srand`初始化随机数发射
>
>     然后 **关闭读取端**
>
>     然后派发任务:
>
>     派发任务需要 随机获取任务在`functors`中的编号, 所以 `uint32_t commandCode = rand() % num`, `commandCode` 就是随机获取的任务编号
>
>     然后 **向管道中以`uint32_t`为单位, 写入一个任务编号**, 就可以了
>
>     派发任务循环10次
>
> 4. 子进程需要执行的代码: 
>
>     ![ |wide](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/image-20230327152811581.webp)
>
>     子进程的需要实现: 可以从管道中接收父进程写入的任务编号
>
>     而父进程写入任务编号的类型是`uint32_t`, 所以 子进程读取时也需要以此类型读取
>
>     所以 子进程先关闭写入端
>
>     然后, 定义一个`uint32_t`类型的变量`(operatorType)`用于从管道中读取任务编号
>
>     然后, `ssize_t ret = read(pipeFd[0], &operatorType, sizeof(uint32_t))`
>
>     > `read()`: 会返回读取到的数据的字节数, 为0时, 表示写入端已不再写入数据
>
>     判断一下`read()`的返回值, 这里判断 为0是派发任务结束 之后
>
>     直接用`assert()`断言, `ret`的大小是`sizeof(uint32_t)`类型的, 不然就是读取错数据类型了
>
>     > `(void)ret`: 此语句的作用是 为了解决`release`编译模式中, 有可能因为`ret`没被使用而出现的`waring`
>     > `assert()`: 只在`debug`编译模式中有效, 使用`release`模式编译的话, `assert()`就没有了
>     > 所以`release`模式编译会出现`ret`没被使用的情况
>
>     然后判断 读取到的数据是否在`functors`任务列表的范围内, 如果在则执行对应位置任务
>
>     否则就是`bug`, 需要告知用户

### 使用匿名管道 控制多个进程

通过匿名管道可以向单个进程派发任务, 以达到控制进程的目的. 同样也可以对多个进程派发任务进而控制多个进程

不过, 对多个进程派发任务的话, 需要的就不是一个匿名管道, 而是对应的 **多个匿名管道**

既然需要创建多个匿名对象, 那么就 **需要让父进程知道, 对应的子进程所对应的管道的写端**

因为, 需要创建多个管道, 并创建多个子进程, 每个子进程需要对应一条管道. 如果父进程不知道子进程对应的管道, 那么也就无法派发任务, 无法控制子进程

一下面这段代码为例: 

```cpp
#include <iostream>
#include <unistd.h>
#include <ctime>
#include <cstring>
#include <string>
#include <vector>
#include <unordered_map>
#include <sys/wait.h>
#include <sys/types.h>
#include <cassert>
using std::cout;
using std::endl;
using std::cerr;
using std::vector;
using std::string;
using std::unordered_map;
using std::pair;

typedef void (*functor)();      // typedef 函数指针为 functor

vector<functor> functors;        // 创建函数指针数组, 用来存储函数指针

unordered_map<uint32_t, string> info;       // 用来存储 functors 对应元素存储的任务的信息

typedef pair<pid_t, int> elem;      // elem用来存储 子进程pid 以及对应管道的写入端fd
// first 存储子进程pid, second 存储对应管道写端fd

// 只用函数举例, 不实现具体功能
void f1() {
    cout << "这是一个处理日志的任务, 执行的进程 ID [" << getpid() << "]"
         << "执行时间是[" << time(nullptr) << "]\n" << endl;
    //
}
void f2() {
    cout << "这是一个备份数据任务, 执行的进程 ID [" << getpid() << "]"
         << "执行时间是[" << time(nullptr) << "]\n" << endl;
}
void f3() {
    cout << "这是一个处理网络连接的任务, 执行的进程 ID [" << getpid() << "]"
         << "执行时间是[" << time(nullptr) << "]\n" << endl;
}

void loadFunctor() {
    info.insert({functors.size(), "处理日志"});
    functors.push_back(f1);

    info.insert({functors.size(), "备份数据"});
    functors.push_back(f2);

    info.insert({functors.size(), "处理网络连接"});
    functors.push_back(f3);
}

void childProcWork(int readFd) {
    sleep(1);
    cout << "进程 [" << getpid() << "] 开始工作" << endl;
    
    while (true) {
        uint32_t operatorType = 0;
        ssize_t ret = read(readFd, &operatorType, sizeof(uint32_t));
        if(ret == 0) {
            cout << "父进程任务派完了, 我要走了……" << endl;
            break;
        }
        assert(ret == sizeof(uint32_t));
        (void)ret;

        if (operatorType < functors.size()) {
            functors[operatorType]();
        }
        else {
            cout << "BUG ? operatorType:: " << operatorType << endl;
        }
    }
    cout << "进程 [" << getpid() << "] 结束工作" << endl;
}

void blanceAssignWork(const vector<elem> &processFds) {
    srand((long long)time(nullptr));        // 设置随机数种子
	 
    // 随机对子进程 随机分配任务 num 次
    int cnt = 0;
    int num = 15;
    while (cnt < num) {
        sleep(1);
        // 随机选择子进程
        uint32_t pickProc = rand() % processFds.size();
        // 随机选择任务
        uint32_t pickWork = rand() % functors.size();

        write(processFds[pickProc].second, &pickWork, sizeof(uint32_t));

        cout << "父进程给进程: "  << processFds[pickProc].first << " 派发任务->" << info[pickWork] <<
             ", 对应管道写端fd: " << pickProc << ", 第 " << cnt << " 次派发" << endl;
        
        cnt--;
    }
}

int main() {
    // 0. 加载任务列表
    loadFunctor();

    // 循环创建5个子进程以及对应的管道
    vector<elem> assignMap;         // 子进程pid与对应管道的fd记录 
    int processNum = 5;
    for(int i = 0; i < processNum; i++) {
        int pipeFd[2] = {0};

        if(pipe(pipeFd) != 0) {
            cerr << "第 " << i << " 次, pipe 错误" << endl;
        }

        pid_t id = fork();
        if(id == 0) {
            // 子进程执行代码
            close(pipeFd[1]);

            childProcWork(pipeFd[0]);        // 子进程功能具体函数

            close(pipeFd[0]);
            exit(0);
        }
        // 因为在if(id == 0) 的最后, 执行了 exit(0); 所以子进程不会跳出 if(id == 0) 的内部
        // 所以下面都为父进程执行的代码
        // 父进程执行代码
        close(pipeFd[0]);
        assignMap.push_back(elem(id, pipeFd[1]));     
        // elem(id, pipeFd[1]) 创建pair<uint32_t, uint32_t> 匿名对象, 存储 此次创建子进程pid 和 打开管道的写端fd
        // 并存入 vector 中
    }
    cout << "创建子进程完毕" << endl;
    cout << "父进程, 开始随机给子进程 随机派发任务\n" << endl;

    sleep(1);
    blanceAssignWork(assignMap);        // 父进程派发任务函数


    // 回收所有子进程
    for(int i = 0; i < processNum; i++) 
        close(assignMap[i].second);
    
    for(int i = 0; i < processNum; i++)  {
        if(waitpid(assignMap[i].first, nullptr, 0)) {
            cout << "等待子进程_pid: " << assignMap[i].first << ", 等待成功. Number: " << i << endl;
        }
    }

    return 0;
}
```

这段代码的执行结果是: 

![多进程管道派发任务 |inline](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/%E5%A4%9A%E8%BF%9B%E7%A8%8B%E7%AE%A1%E9%81%93%E6%B4%BE%E5%8F%91%E4%BB%BB%E5%8A%A1.gif)

匿名管道向多个进程派发任务, 其中 **父进程向管道中写入的过程 和 子进程从管道中读取的过程 是没有变化的**

对比 单进程的管道控制, 多进程的管道控制其实只是需要 **在父进程中记录子进程的`pid`以及对应的管道写入端`fd`** 

### 匿名管道特点总结

上面匿名管道的多进程控制中, 父进程打开了多个子进程: 

![ ](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/image-20230327172513587.webp)

打开的所有子进程拥有相同的`ppid`, 即相同的父进程, 那么可以称这些进程为兄弟进程

而兄弟进程而是具有血缘关系的进程, 那么也就是说, 只要 **兄弟进程知道其他管道的写入端`fd`, 就可以实现兄弟进程间的通信**

实际上, 我们在命令行中使用的 `|`, 就是兄弟进程间的通信, 也就是说, **`| 其实就是命令行上的匿名管道`** 

---

关于 匿名管道的特点: 

1. 匿名管道 只能用于 具有血缘关系的进程之间的通信: 父子、兄弟
2. 匿名管道 **只能单向通信**, 是根据管道的特点专门设计成这样的. 是 **半双工通信的特殊情况**
3. 匿名管道 自带同步机制(`pipe`满, 则`writer`阻塞; `pipe`空, 则`reader`阻塞), 即自带访问控制机制
4. 匿名管道 是面向字节流的
5. 匿名管道 的生命周期 取决于什么时候彻底关闭管道文件(即`pipe`文件的打开计数为`0`)

## 命名管道

匿名管道只能用于具有血缘关系的进程之间的通信

如果想要实现, 毫不相干的进程之间通信, 则需要用到 **命名管道**

匿名管道是在进程中由`pipe()`系统调用创建的管道文件. 对用户来说其实是不可见的

也不能被其他毫无干系的进程打开. 只能通过`pipe()`创建、打开

而命名管道则不同, **命名管道对用户来说, 是可见的, 也就是说在进程内是可以指定路径打开的**

这也是 命名管道可以实现 毫不相干的进程之间通信的原因

### 命名管道的创建

命名管道有两种创建方法: 

1. 命令行创建

	命名管道可以在命令行使用命令创建 `mkfifo`:
	
	![|wide](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/image-20230327181301468.webp)
	
	管道都是先进先出的, 但是命名管道是可见的
	
	使用`mkfifo`可以创建命名管道文件: 
	
	![|wide](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/image-20230327181812864.webp)

2. 系统调用创建

	Linux除了给了`mkfifo`命令, 还给了`mkfifo()`系统调用:
	
	![|wide](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/image-20230327182036574.webp)
	
	`mkfifo(const char *pathname, mode_t mode)`有两个参数, 第一个参数肯定不用解释了, 是创建**`文件的路径及文件名`** 
	
	第二个参数`mode`是什么？
	
	`mode`其实是创建文件的权限, 以这种格式传参`0000`

### 命名管道的使用

命名管道的使用方法并不难

只需要创建命名管道、进程1 只写打开管道、进程2 只读打开管道、进程1 向管道中写入数据、进程2 从管道中读取数据就可以了.

下面这个例子, 可以实现最基本的命名管道使用: 

这个例子, 实现的功能是: 

进程1 从命令行接收用户输入的信息, 并写入到命名管道中

进程2 从命名管道中读取数据, 并输出到命令行中

`common.h:`

```cpp
// 进程1 和 进程2 都需要包含的头文件
#pragma once
#include <iostream>
#include <cstdio>
#include <cstring>
#include <cerrno>
#include <sys/wait.h>
#include <sys/stat.h>
#include <fcntl.h>
#include <unistd.h>

#define IPC_PATH "./.fifo"              // 命名文件路径
```

`clientFifo.cpp:`

```cpp
// 命名管道客户端, 即写入端, 不参与命名管道的创建
#include "common.h"

using std::cout;
using std::endl;
using std::cerr;

int main() {
    int pipeFd = open(IPC_PATH, O_WRONLY);      // 只写打开命名管道, 不参与创建
    if(pipeFd < 0) {
        cerr << "open fifo error" << endl;
        return 1;
    }

    char line[1024];        // 用于接收命令行的信息
    while (true) {
        printf("请输入消息 $ ");
        fflush(stdout);         // printf没有刷新stdout, 所以手动刷新
        memset(line, 0, sizeof(line));
        if(fgets(line, sizeof(line), stdin) != nullptr) {
            // 由于fgets 会接收 回车, 所以将 line的最后一位有效字符设置为 '\0'
            line[strlen(line) - 1] = '\0';
            // 向命名管道写入信息
            write(pipeFd, line, strlen(line));
        }
        else {
            break;
        }
    }
    close(pipeFd);
    cout << "客户端(写入端)推出啦" << endl;

    return 0;
}
```

`serverFifo.cpp:`

```cpp
// 命名管道服务端, 即读取端, 参与命名管道文件的创建
#include "common.h"

using std::cout;
using std::endl;
using std::cerr;

int main() {
    umask(0);
    if(mkfifo(IPC_PATH, 0666) != 0) {
        cerr << "mkfifo error" << endl;
        return 1;
    }

    int pipeFd = open(IPC_PATH, O_RDONLY);
    if(pipeFd < 0) {
        cerr << "open error" << endl;
        return 2;
    }

    cout << "命名管道文件, 已创建, 已打开" << endl;

    char buffer[1024];
    while (true) {
        ssize_t ret = read(pipeFd, buffer, sizeof(buffer)-1);
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

`makefile:`

```makefile
.PHONY:all
all:clientFifo serverFifo

clientFifo:clientFifo.cpp
	g++ $^ -o $@
serverFifo:serverFifo.cpp
	g++ $^ -o $@

.PHONY:clean
clean:
	rm -f clientFifo serverFifo .fifo
```

执行make, 然后运行两个可执行程序: 

![命名管道基本用法](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/%E5%91%BD%E5%90%8D%E7%AE%A1%E9%81%93%E5%9F%BA%E6%9C%AC%E7%94%A8%E6%B3%95.gif)

这样就实现了 毫不相干的两个进程之间的通信. 

这就是命名管道的基本用法
