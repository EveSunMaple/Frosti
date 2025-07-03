---
draft: true
title: "[Linux] 网络编程 - 初见UDP套接字编程: 网络编程部分相关概念、TCP、UDP协议基本特点、大小端字节序、网络字节序、socket接口使用、简单的UDP网络及聊天室实现..."
pubDate: "2023-06-25"
description: '本篇文章正式开始Linux中的网络编程. 本文介绍了, 网络编程的一些概念, 以及简单的UDP套接字编程. 
实现了最简单的UDP公共聊天室'
image: https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/202307021623107.webp
categories:
    - Blogs
tags: 
    - Linux网络
    - 套接字
    - UDP
---

上一篇文章中, 我们简单的介绍了网络的最基础的部分内容, 没有涉及到编程相关的内容

从本篇文章开始, 就真正开始涉及到网络编程了

# 网络编程 - 套接字

在正式开始网络编程之前, 还需要介绍几个概念

## 一些概念

### 1. 源`IP`地址与目的`IP`地址

不同局域网的主机之间进行通信, 是通过`IP`地址进行的

那么, 其中**源`IP`地址就是发送主机的`IP`地址, 目的`IP`地址就是接收主机的`IP`地址**

要如何理解这两个`IP`地址呢? 其实就可以看作生活中的两个东西, **始发地和最终目的地**

假如, 要从家里自驾去某个地方旅游, 首先 家是不会变的, 其次 即使中途可能经过许多地方, 但是正常情况下 你的最终目的地是不会变的

### 2. 端口号和`socket`套接字 **

网络通信, 可以看成是两台主机在通信

不过, 我们在网络通信的时候, 只要将两台主机之间能够通信就可以了吗?

其实不是的, 不仅仅需要考虑两台主机之间相互交互数据

网络协议栈与主机之间的关系是什么?

![ ](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/202306252053653.webp)

网络层和传输层是属于操作系统的

更上层的应用层, 是给用户使用的

而网络通信、数据交互其实就是为用户提供的交互

无论是朋友之间发送信息还是玩网络游戏

网络通信, 都是给用户提供的交互

不过, 虽然操作系统是由用户操作的, 但是**在操作系统看来, 其实是进程在进行交互**

因为用户也是通过某程序 实现的网络通信 

即在操作系统层面, 用户的身份 通常是由程序体现的

要实现通信, 程序一定是在运行中的, 也就是**进程**

那么, 实际上两台主机进行通信就是通过运行应用层程序进行通信, 也就是**进程在通信、在交互数据**

**网络通信的本质, 即为 进程间通信**, 不过不是同一主机内的进程, 而是不同主机的进程

而**端口号**, 其实就是用来**表示唯一进程的标识符**, 他是传输层协议的内容

那么, 对当前主机来说:

1. `IP`地址, 保证了主机的唯一性
2. 端口号(`PORT`), 保证了主机内进程的唯一性

当`IP`地址与端口号, 以此格式结合使用: **`IP`地址:`PORT`**, 就可以**标识网络中的唯一进程**

此组合, 也被称为**`socket`套接字**

>  **1. 端口号, 是一个2字节16位的整数**  
>
> **2. 一个端口号, 只能被一个进程占用, 即 一个端口号只能标识一个进程**

#### 问题

**操作系统中, 不是已经存在`PID`来作为进程的唯一标识符了吗? 为什么还要有端口号? 为什么不直接使用`PID`来确定网络中的唯一进程呢?**

首先要明白, 技术层面来讲 使用`PID`直接作为确定网络中唯一进程的标识, 肯定是可行的

但是, 实际上操作系统中的**进程并不都需要网络通信**

那么直接使用PID来确定网络中的唯一进程, 并不完全契合

并且, `PID`在操作系统中主要是用来进程管理的

如果直接使用`PID`来确定网络中的唯一进程, 那么 就将操作系统的进程管理和网络强耦合起来了

这种做法是不明智的

### 3. 源端口号和目的端口号

源`IP`地址与目的`IP`地址, 是用来确定双端主机的

但是, **网络通信的本质是 进程间的通信**

既然是进程间通信, 那么就需要确定到源主机 和 目的主机 网络上的进程

所以, 就有了 **源端口号和目的端口号, 用来确定 源主机的发送进程 和 目的主机的接收进程**

> 结合源IP地址与目的IP地址
>
>  **源IP:源端口号**和**目的IP:目的端口号**就组成了一个**`socket`对**
>
> `socket`对, 即指 发送端`Socket`和接收端`Socket`的组合

### 4. 认识`TCP`协议基本特点

此处先对`TCP`(`Transmission Control Protocol`传输控制协议)有一个直观的认识, 后面会对`TCP`协议有一个更细节的介绍

TCP协议的基本特点:

1. 传输层协议

2. 有连接

    有连接是什么意思呢? 比如, 使用`SSH`连接服务器主机

    `SSH`就是用的TCP协议, 必须要与服务器主机建立连接之后, 才能正常的与服务器进行通信

3. 可靠传输

    什么是可靠传输? 可靠传输, 并不是一个主观的判断. 而是传输数据时, `TCP`会使用各种技术防止数据丢失或损坏, 这种实现方式称为可靠传输

    但, 并不表示`TCP`传输就一定是可靠的

4. 面向字节流

### 5. 认识`UDP`协议基本特点

此处也对`UDP`(`User Datagram Protocol`用户数据报协议)有一个直观的认识, 后面再详细讨论

`UDP`协议的基本特点:

1. 传输层协议

2. 无连接

    无连接, 顾名思义就是通信前, 双方不需要建立连接

    比如, 直播、短视频等

3. 不可靠传输

    `UDP`协议不会确保数据的完整性, 如果传输过程中数据丢失, `UDP`协议也不会管, 更不会重新发送

    就像直播时, 如果网络差 很可能会导致画面、音频卡顿、模糊等

4. 面向数据报

**可靠传输和不可靠传输没有优劣之分, 只有使用场景的合适与不合适**

**可靠与不可靠也只是根据传输特点的形容, 而不是实际使用的体验**

### 6. 网络字节序

内存中的**多字节数据相对于内存地址有大端和小端之分**

磁盘文件中的**多字节数据相对于文件中的偏移地址也有大端小端之分**

---

**什么是大小端字节序?**

以 内存中存储数据为例

长字节数据在内存中存储时, 不同平台可能存在不同的字节序存储方式:

1. 大端字节序: 数据的高位字节 存储在内存的低地址处, 低位字节 存储在内存的高地址处

2. 小端字节序: 数据的低位字节 存储在内存的低地址处, 高位字节 存储在内存的高地址处

    小端字节序存储, **不是将数据倒序存储**, 而是**以字节为单位**, 从低位数据到高位数据 存储到内存的 低地址到高地址

![|big](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/202306261642103.webp)

既然存储方式不同, 想要正确的读取到数据, 读取的顺序也需要不同.

**使用大端字节序的平台, 读取数据 需要从内存的有效低地址处开始 读取到内存到有效高地址处**

**而使用小端字节序的平台, 读取数据 需要从内存的有效高地址处开始 读取到内存的有效低地址处**

> CPU在读取内存中的数据时, 默认是从有效低地址开始的, 所以小端字节序平台, CPU默认读取到的数据 顺序是错误的.

---

既然 数据的存储不同的平台有大小端字节序之分, 那么 `如果不加以规定, 在网络通信中就有可能无法进行通信`.

如果各自平台都默认使用自己平台字节序的正确读取顺序(小端平台从高地址开始读取, 大端平台从低地址开始读取), 也默认使用自己平台字节序的存储顺序发送数据

那么大端字节序平台就不能正确的读取从小端字节序平台发来的数据, 小端字节序同理, 进而就不可能正常的建立通信.

那么, 网络通信的 网络字节流的地址 该怎么样去定义呢?

1. 发送主机通常将发送缓冲区中的数据按内存地址从低到高的顺序发出;
2. 接收主机把从网络上接到的字节依次保存在接收缓冲区中, 也是按内存地址从低到高的顺序保存;

因此, 网络数据流的地址应这样规定: 先发出的数据是低地址, 后发出的数据是高地址.

并且, **`TCP/IP协议规定: 网络数据流应采用大端字节序, 即低地址处高位字节.`**

不管这台主机是大端机还是小端机, 都要按照这个TCP/IP规定的网络字节序来发送/接收数据;

如果当前发送主机是小端, 就需要先将数据转成大端, 否则就忽略.

因此, **`大端字节序 也叫做 网络字节序`**

网络数据流被规范之后, 网络上流动的数据就恒为大端字节序, 那么 **接收端读取数据 就按照读取大端字节序数据的方式, 或将接收到的数据的存储顺序调整为小端字节序 然后在读取**, 就可以正常的读取到数据了.

> C语言提供了相应的数据转换字节序的接口:
>
> ![|wide](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/202306261749665.webp)
>
> 这些接口名很好记, `h` 表示 host, `n` 表示 network, `l` 表示 32位长整型, `s` 表示 16位短整型, `to` 表示 转换为
>
> ```cpp
> #include <arpa/inet.h>
> 
> // 本机字节序, 转换为网络字节序数据
> uint32_t htonl(uint32_t hostlong);
> uint16_t htons(uint16_t hostshort);
> 
> // 网络字节序, 转换为本机字节序数据
> uint32_t ntohl(uint32_t netlong);
> uint16_t ntohs(uint16_t netshort);
> ```
>
> 转换之后, 会通过返回值返回. 
>
> 如果, 本机就为 大端字节序存储, 则这些接口不会发生转换

## `socket`编程接口

socket编程有一些常见的`API`接口:

```cpp
// 创建 socket 文件描述符 (TCP/UDP, 客户端 + 服务器)
int socket(int domain, int type, int protocol);

// 绑定端口号 (TCP/UDP, 服务器)
int bind(int socket, const struct sockaddr* address, socklen_t address_len);

// 开始监听socket (TCP, 服务器)
int listen(int socket, int backlog);

// 接收请求 (TCP, 服务器)
int accept(int socket, struct sockaddr* address, socklen_t* address_len);

// 建立连接 (TCP, 客户端)
int connect(int sockfd, const struct sockaddr* addr, socklen_t addrlen);

// 发送报文 (UDP)
ssize_t sendto(int sockfd, const void *buf, size_t len, int flags, const struct sockaddr* dest_addr, socklen_t addrlen);

// 接收报文 (UDP)
ssize_t recvfrom(int socket, void* restrict buffer, size_t length, int flags, struct sockaddr* restrict address, socklen_t* restrict address_len);
```

仔细观察这些接口

可以发现, 除了监听`socket`和创建`socket`接口, 其他接口的参数中, 都存在一个的参数类型: **`struct sockaddr`**.

### **`struct sockaddr`**

`sockaddr`是一个结构体, 这个结构体的作用是什么呢?

套接字通信在设计的时候, 不仅实现了网络间通信, 也实现了本机内进程的通信

所以, 套接字我们通常分为两类: 网络套接字 和 域间套接字, 分别用于网络通信和本地(域间)通信

> 使用域间套接字可以实现本地进程的通信, 与之前介绍的 管道通信、共享内存通信 的功能大致相同
>
> 域间通信也可以称为**双向管道**
>
> 域间套接字的使用, 要比 网络套接字的使用简单, 因为域间套接字没有`IP`的概念, 没有端口号的概念
>
> 在使用时, 只需要提供一个文件的路径, 与命名管道听起来一样, 但是实际操作是不同的

套接字的设计分成了两类, 那么使用套接字实现进程通信的接口也分别实现了网络通信和本体通信两种吗?

其实并没有, 如果设计成两套接口就太复杂了, 既然都是套接字, 设计者就将网络套接字和域间套接字的通信接口统一起来了

但是问题又出现了, 实现网络通信和域间通信 需要的资源是不同的:

1. 使用网络套接字实现网络通信, 需要`IP`地址、端口号等资源, 所以设计了`struct sockaddr_in`等结构体, 来描述网络通信所需资源
2. 使用域间套接字实现域间通信, 需要 路径名 等资源, 所以设计了`struct sockaddr_un`结构体, 来描述域间通信所需资源

![|inline](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/202306281619679.webp)

> `struct sockaddr_in`的前16位是一个宏, **`AF_INET`**
>
> `struct sockaddr_un`的前16位同样是一个宏, **`AF_UNIX`**

所需的资源不同, 也就是说需要传递给接口的资源不同

但是, 网络套接字和域间套接字的接口是统一的, 那么 一个接口该如何接收不同类型的数据呢?

既然, 接口**需要接收不同类型的数据**, 那么就**不能将接口的参数设置为 上面的具体的描述资源的结构体**

而且, 上面列举出的接口的参数, 并没有`struct sockaddr_in`或`struct sockaddr_un`类型的, 而有一个 `struct sockaddr`

那么, `struct sockaddr`这个结构体究竟是什么呢?

此结构体的内容是这样的:

![|inline](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/202306281633081.webp)

单独看好像没有什么特殊的. 当 此结构体和 另外的结构体对比的时候:

![|inline](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/202306281644752.webp)

可以发现, 这三个结构体的首16位, 都指**地址类型**

> 地址类型, 不同的宏可以区分 协议 以及 区分网络通信还是域间通信
>
> **`AF_INET`**用于`IPv4`, **`AF_INET6`**用于`IPv6`
>
> 如果是域间通信, 则 此地址类型为**`AF_UNIX`**

其实, `struct sockaddr`是设计出来的一个抽象的中间结构体

使用在接口中, 就是为了能够让接口接收不同类型的数据资源

在使用`socket`接口的时候, 需要先将`struct sockaddr_in*`或`struct sockaddr_un*`等类型的结构体, 强转为`struct sockaddr*`然后再传给接口使用

因为, `sockaddr`类似的结构体的前16位都表示地址类型

所以, **接口接收到传来的数据之后, 会根据 前16的地址类型 来区分 协议以及通信方式, 更会根据地址类型判断出数据的原结构体类型, 然后将`sockaddr`结构体, 强转回原结构体类型, 以获取完整的通信信息**

### 接口演示: 简单的`UDP`网络通信

通过一部分接口的参数, 介绍了三个结构体(`struct sockaddr`、`struct sockaddr_in`和`struct sockaddr_un`)

了解到, 这三个结构体是用来存储网络信息的

在使用套接字接口的时候, 需要将所需的网络信息传递给接口

下面, 就通过实现一个简单的`UDP`网络通信演示一部分接口

演示接口之前, 还要先简单的介绍一个接口:

#### `int socket()`

```cpp
int socket(int domain, int type, int protocol);
```

`socket()` 的作用是创建一个`socket`文件描述符

man 手册中是这样介绍的:

![man For socket](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/202306301607179.webp)

使用一个接口, 肯定要先了解它的参数, `socket()`有三个参数:

1. `int domain`

    介绍`sockaddr`相关结构体时, 结构体的前16位是地址类型, 通常是一个宏, 用来区分协议以及通信方式的

    而这里的第一个参数`int domain`, 就是传入地址类型 区分通信方式的

    被称作`socket`的域

    ![|wide](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/202306301613672.webp)

    其中, **`AF_UNIX`**和**`AF_LOCAL`** 相同

    传入之后 都表示本地通信

    而**`AF_INET`**表示`ipv4`网络通信, **`AF_INET6`**则表示`ipv6`网络通信

    最常用的, 其实就只有 **`AF_UNIX`** 和 **`AF_INET`**

2. `int type`

    此参数是用来选择**套接字类型**的, 决定了通信时候对应的 **报文类型**

    ![|wide](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/202306301656128.webp)

    其中, 前四个**`SOCK_STREAM`** **`SOCK_DGRAM`** **`SOCK_SEQPACKET`** **`SOCK_RAW`**是最常用的

    1. **`SOCK_STREAM`**, 表示 流式套接字, 一般用于`TCP`

    2. **`SOCK_DGRAM`**, 表示 数据报式套接字, 一般用于`UDP`

    3. **`SOCK_SEQPACKET`**, 表示 连续数据报套接字

    4. **`SOCK_RAW`**, 表示 原始套接字

        使用此套接字, 通信可以直接绕过传输层的协议, 直接访问IP协议

        不过, 绕过传输层协议, 就表示需要自己实现一些传输协议的内容

        一般用于网络诊断等方面

3. `int protocol`

    这个参数用来选择**协议类型**

    此参数的选择 与 第二个参数 `type` 密切相关. 

    比如, `type`传入**`SOCK_STREAM`**, 此参数就需要传入**`IPPROTO_TCP`**, 就选择了 TCP协议

    但实际上, 我们不需要手动使用宏去选择

    网络通信时, 选定`type`并且只需要使用一种协议时, `protocol`可以直接传入`0`, 表示使用默认协议, 其实就是操作系统根据前面的参数选择的最适用的协议
    
    文章中在使用时, 一定都设置为`0`了

了解了`socket()`的参数之后, 还需要了解一下它的返回值

![ ](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/202306301754510.webp)

如果成功了, 就返回**新套接字的文件描述符**, 如果错误, 就返回`-1`, 并设置`errno`

没错, `socket()`执行成功返回的是一个文件描述符

实际上, `Linux`操作系统中 套接字操作都是通过文件描述符来实现的

不过我们现在只演示, 并不去了解它的细节

介绍了`socket()` 之后, 就可以开始简单的`UDP`网络通信程序的编写了

#### `UDP`网络通信

在编写网络服务之前, 先写一个打印日志内容的文件:

**`logMessage.hpp`**:

```cpp
#pragma once

#include <cassert>
#include <cerrno>
#include <cstdarg>
#include <cstdio>
#include <cstdlib>
#include <cstring>
#include <ctime>

// 宏定义 四个日志等级
#define DEBUG 0
#define NOTICE 1
#define WARINING 2
#define FATAL 3

const char* log_level[] = { "DEBUG", "NOTICE", "WARINING", "FATAL" };

// 实现一个 可以输出: 日志等级、日志时间、用户、以及相关日志内容的
// 日志消息打印接口

// 通过可变参数实现, 传入日志等级, 日志内容格式, 日志内容相关参数
void logMessage(int level, const char* format, ...) {
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

	// 此函数 会通过 ap 遍历可变参数列表, 然后根据 format 字符串指定的格式,
	// 将ap当前指向的参数以字符串的形式 写入到logInfo缓冲区中
	vsnprintf(logInfo, sizeof(logInfo) - 1, format, ap);

	// ap 使用完之后, 再将 ap置空
	va_end(ap); // ap = NULL

	// 通过判断日志等级, 来选择是标准输出流还是标准错误流
	FILE* out = (level == FATAL) ? stderr : stdout;

	// 获取本地时间
	time_t tm = time(nullptr);
	struct tm* localTm = localtime(&tm);

	fprintf(out, "%s | %s | %s | %s\n", 
            log_level[level], 
            asctime(localTm), 
            name == nullptr ? "unknow" : name,
            logInfo);
}
```

上面这段代码实现了`logMessage()`接口, 实现以特定的格式打印日志的功能

特定的格式是: ` 日志等级 | 本地时间 | 当前用户名 | 日志信息`

> 代码中使用了一些稍微有些陌生的类型、接口、宏
>
> 其中`va_list`通常定义, **指向可变参数列表的指针**
>
> **`va_start()`**是一个宏, 通常用来将`va_list`类型的变量 指向**可变参数列表的第一个参数**
>
> **`va_end()`**同样是一个宏, 通常用来将`va_list`类型的变量 **置空**
>
> 而 `vsnprintf()`这个名字很长的接口, 则是 通过`va_list` 类型的变量, 格式化向字符数组中写入内容的
>
> ![|wide](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/202306302058207.webp)
>
> 在上面代码中的作用就是
>
> **通过`ap`遍历可变参数列表, 然后根据`format`字符串指定的格式, 将`ap`当前指向的参数以字符串的形式 写入到`logInfo`缓冲区中**

完成日志接口之后, 正式开始实现一个简单的`UDP`网络通信

##### **最简单的`udpServer`**

要实现的最简单的`udpServer`, 需要满足什么功能?

1. 运行时, 传入端口号和IP, 以绑定本机网络信息
2. 运行后, 绑定网络信息到主机, 并获取发送到本机网络上的信息

了解了基本功能之后, 就可以尝试写一写了. 

首先就是头文件, 可以在`man`手册中 查看我们需要使用的接口、类型 的头文件都有什么:

1. `socket()、recvfrom()、bind()...`

    ![|wide](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/202307010939075.webp)

    ```cpp
    #include <sys/types.h>
    #include <sys/socket.h>
    ```

2. `htonl()、inet_addr()...`

    `htonl()`系列的接口已经简单的介绍过了

    `inet_addr()`接口的作用是转换`IP`地址的格式

    ![|wide](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/202307010947730.webp)

    ```cpp
    #include <sys/socket.h>
    #include <netinet/in.h>
    #include <arpa/inet.h>
    ```

这些就是套接字网络需要包含的最基本的头文件了.

那么, 一个简单的`udpServer`的实现代码:

**`udpServer.cc`:**

```cpp
#include <arpa/inet.h>
#include <netinet/in.h>
#include <sys/socket.h>
#include <sys/types.h>
#include <unistd.h>

#include <cerrno>
#include <cstdlib>
#include <cstring>
#include <iostream>
#include <string>

#include "logMessage.hpp"

using std::cout;
using std::endl;
using std::string;

// 封装UDP服务
class udpServer {
public:
	// 构造函数, 需要传入 port 和 ip
	// ip可以缺省, 因为ip可以默认为空, 后面解释理由
	udpServer(uint16_t port, string ip = "")
		: _port(port)
		, _ip(ip) {}
	// 析构函数
	~udpServer() {}

	// 服务器初始化函数
	// 具体功能就是 创建套接字 绑定主机网络信息
	void init() {
		// 1. 创建套接字, 并获取套接字文件描述符
		_sockFd = socket(AF_INET, SOCK_DGRAM, 0);
		// AF_INET 表示ipv4网络通信, SOCK_DGRAM 表示数据报格式报文, 0 表示默认协议

		if (_sockFd < 0) {
			// 套接字文件描述符创建失败
			logMessage(FATAL, "socket() faild:: %s : %d", strerror(errno), _sockFd);
			exit(1);
		}

		logMessage(DEBUG, "socket create success: %d", _sockFd);

		// 套接字创建成功
		// 2. 绑定网络信息
		//		bind(int __fd, const struct sockaddr *__addr, socklen_t __len);

		//  2.1 将网络信息 填充到 struct sockaddr_in 结构体中
		//		此结构体中 填充的内容是 需要在网络中存在的内容
		//		比如, 协议 IP 端口号等, 只有这些东西 在网络上存在, 其他主机才能与服务器通信
		struct sockaddr_in local;
		bzero(&local, sizeof(local)); // 将结构体内容全部置空

		//      填充网络信息
		//      1. 地址类型, 选择协议 通信方式
		local.sin_family = AF_INET;
		//      2. 端口号
		//	       端口号是需要向网络中发送的, 所以 需要从本地字节序 转换成网络字节序
		local.sin_port = htons(_port);
		//      3. IP
		//         IP 不能直接填充到结构体中, 因为类中的 _ip 是字符串,  而网络中的IP
		//         通常用4字节的二进制表示, 结构体中同样是此类型 in_addr_t =
		//         uint32_t 所以 还需要将 点分十进制字符串型的_ip 转换为 uint32_t 才能填充到结构体中
		local.sin_addr.s_addr = _ip.empty() ? htonl(INADDR_ANY) : inet_addr(_ip.c_str());
		//  这里使用了三目运算符 ? : 用来判断 传入的 ip 是否为空
		//	如果传入的IP为空, 则将 INADDR_ANY 这个 IP 填充到结构体中
        //	否则就将_ip字符串 转换为 in_addr_t 类型, 然后填充到结构体中
        //	INADDR_ANY, 其实是 强转为 in_addr_t 类型的 0
		//	1. 网络服务器 使用 INADDR_ANY 作为IP, 绑定到主机中, 表示监听本机上所有的IP 网络接口	   
        //      一台服务器主机可能有许多的IP, 使用 INADDR_ANY 意思就是说, 其他主机可以通过服务器主机上的任意IP:指定port 找到服务器进程实现通信
		//	2. 当绑定指定的IP时, 就表示 其他主机只能通过服务器主机上的指定IP:指定port 找到服务器进程实现通信. 
        //	    如果使用其他本机上的IP:指定port, 服务器是不会响应的
        //	    因为服务器进程 只接收通过指定 IP 发送给服务器进程的信息
		//  IP也是要向网络中发送的, 所以要将 IP转换成网络字节序. inet_addr()
		//  则会自动将ip转换为网络字节序

		// 填充完网络信息, 就要将网络信息 绑定到操作系统内核中, 进而将网络信息
		// 发送到网络上
		if (bind(_sockFd, (const struct sockaddr*)&local, sizeof(local)) == -1) {
			// 绑定失败
			logMessage(FATAL, "bind() faild:: %s : %d", strerror(errno), _sockFd);
			exit(2);
		}
		// 绑定成功
		logMessage(DEBUG, "socket bind success : %d", _sockFd);
	}

	// 服务器运行函数
	// 具体功能 实际上是 循环地监听、接收发送到服务器上的信息
	void start() {
		// 很多服务器本质上是一个死循环
		char inBuffer[1024]; // 用来存储发送过来的信息
		while (true) {
			struct sockaddr_in peer;		  // 输出型参数, 用来接收对方主机网络信息
			socklen_t peerLen = sizeof(peer); // 输入输出型参数

			// 接收发送到服务器上的信息, 以及发送端的网络信息
			// recvfrom(int __fd, 
            //          void *__restrict __buf,
            //          size_t __n,
            //          int __flags,
			//          struct sockaddr *__restrict __addr,
            //          socklen_t *__restrict __addr_len);
			// 后两个参数 即为接收发送端网络信息的输出型参数
			// 返回值 是 接收到发送过来的信息的字节数, 即放在 inBuffer里的字节数
			// 接收失败则返回 -1
			ssize_t s = recvfrom(_sockFd, inBuffer, sizeof(inBuffer) - 1, 0, (struct sockaddr*)&peer, &peerLen);

			if (s > 0) {
				// 当字符串结尾
				inBuffer[s] = 0;
			}
			else if (s == -1) {
				logMessage(WARINING, "recvfrom() error:: %s : %d", strerror(errno), _sockFd);
				continue;
			}

			// 读取成功, 除了读取到对方的数据, 你还要读取到对方的网络地址[ip:port]
			string peerIp = inet_ntoa(peer.sin_addr); // 拿到了对方的IP
			uint32_t peerPort = ntohs(peer.sin_port); // 拿到了对方的port

			// 打印出来对方给服务器发送过来的消息
			logMessage(NOTICE, "[%s:%d]# %s", peerIp.c_str(), peerPort, inBuffer);
		}
	}

private:
	// 服务器 端口号
	uint16_t _port;
	// 服务器 IP, 程序运行时, 一般传入的是 点分十进制表示的ip的字符串
	string _ip;
	// 服务器 套接字文件描述符
	int _sockFd;
};

static void Usage(const string porc) {
	cout << "Usage:\n\t" << porc << " port [ip]" << endl;
}

// main 函数需要获取命令函参数, 以实现获取端口号和ip
int main(int argc, char* argv[]) {
	// 如果 使用方法错误
	if (argc != 2 && argc != 3) {
		Usage(argv[0]);
		exit(3);
	}

	// 获取 端口号 和 IP
	uint16_t port = atoi(argv[1]);
	string ip;
	if (argc == 3) {
		ip = argv[2];
	}

	// 使用端口号和IP 实例化udpServer对象
	udpServer uSvr(port, ip);

	// 初始化, 并启动服务器
	uSvr.init();
	uSvr.start();

	return 0;
}
```

上面这段代码执行之后, 是这样的效果:

![udpServer_8080 |inline](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/202308211611645.gif)

运行时, 当选项使用错误 会输出 `Usage`. 选项输入正确, 则执行代码, 并输出 `logMessage`

当程序运行起来之后, 使用 `netstat -lnup` 可以查看操作系统中的UDP相关网络连接等信息:

![|inline](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/202307011608973.webp)

代码中需要注意的地方, 基本都在注释中介绍了.

当熟悉接口的使用之后, 其实非常的简单.

> 需要了解的是, `inet_addr()` 接口 可以将点分十进制字符串类型的IP地址, 转换为 in_addr_t 类型的IP
>
> 同时, 也会 **`将转换后的IP自动转换为网络字节序存储形式`**

到这里 一个简单的udp服务器其实就已经完成了. 这个服务器非常的简单, 只会接收信息 连回复功能都没有

##### **最简单的`udpClient`**

上面最简单的`udpServer`已经可以运行了

但是只有服务器, 没有客户端与之通信, 怎么能叫网络通信呢?

下面就来实现一下`udpClient`

客户端要实现什么功能呢?

1. 运行时, 传入服务器的`IP`和端口号, 以此找到目的网络进程
2. 运行后, 接收输入信息, 并发送给目的网络进程

在实现过`udpServer`之后, `udpClient`的实现会显得很简单

因为使用的接口、流程基本差不多

**`udpClient.cc`:**

```cpp
#include <arpa/inet.h>
#include <netinet/in.h>
#include <strings.h>
#include <sys/socket.h>
#include <sys/types.h>
#include <unistd.h>

#include <cassert>
#include <cstdint>
#include <cstdlib>
#include <iostream>
#include <ostream>
#include <string>

#include "logMessage.hpp"

using std::cin;
using std::cout;
using std::endl;
using std::getline;
using std::string;

static void Usage(const string porc) {
	cout << "Usage::\n\t" << porc << " server_IP server_Port" << endl;
}

int main(int argc, char* argv[]) {
	if (argc != 3) {
		Usage(argv[0]);
		exit(1);
	}

	// 先获取server_IP 和 server_Port
	string server_IP = argv[1];
	uint16_t server_Port = atoi(argv[2]);

	// 创建客户端套接字
	int sockFd = socket(AF_INET, SOCK_DGRAM, 0);
	if (sockFd < 0) {
		logMessage(FATAL, "socket() faild:: %s : %d", strerror(errno), sockFd);
		exit(2);
	}
	logMessage(DEBUG, "socket create success: %d", sockFd);

    /*!
     * udpServer 到这里就 填充网络信息 并绑定到操作系统内核中了
     * 客户端需不需要这些操作?
     * 答案是肯定的.
     * 但是这些操作, 最好不要我们自己去做, 让操作系统自动帮我们完成.
     * 为什么?
     * 因为我们不需要手动指定IP以及端口号, 尤其是端口号. 如果手动指定了端口号 还有可能会造成其他问题
     * 并且, 客户端也不需要手动指定端口号, 还不如让操作系统随机生成端口号.
     * 服务器需要手动指定端口号, 是因为服务器是需要让其他主机去连接的, 所以知道且固定. 如果是随机的, 那服务器绝对没人用.
     * 而客户端一般没人会主动来连接、访问, 一般都是每次打开客户端绑定网络时, 就让操作系统代操作, 不然手动指定端口号 可能会影响其他的网络进程
     * 所以 我们不需要手动去填充 udpClient 的网络信息, 也不需要手动绑定
     */

    // 填充服务器的网络信息
    // 从命令行接收到的服务器IP和端口号, 是需要填充在 sockaddr_in 结构体中的, 因为 向服务器网络进程发送信息需要使用
	struct sockaddr_in server;
	bzero(&server, sizeof(server));
	server.sin_family = AF_INET;
	server.sin_port = htons(server_Port);
	server.sin_addr.s_addr = inet_addr(server_IP.c_str());

	// 通信
	string inBuffer;
	while (true) {
		cout << "Please Enter >> ";
		getline(cin, inBuffer);

		// 向 server 发送消息
		sendto(sockFd, inBuffer.c_str(), inBuffer.size(), 0, (const struct sockaddr*)&server, sizeof(server));
		// 在首次向 server 发送消息的时候, 操作系统会自动将Client网络进程信息
		// 绑定到操作系统内核
	}

	close(sockFd);

	return 0;
}
```

上面这段代码的执行效果是这样的:

![udpClient |inline](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/202308211611306.gif)

在 最简单的`udpClient`的实现中, 最重要的一个点是:

**不要手动填充、绑定 客户端进程的网络信息, 而是交给 操作系统自动操作**

服务器需要手动指定端口号, 是因为服务器是需要保证可以让其他主机去连接, 所以需要知道且固定

而客户端一般没人会主动来连接、访问, 一般都是每次打开客户端绑定网络时, 就让操作系统代操作, 不然手动指定端口号可能会影响其他的网络进程

所以, 不需要手动去填充`udpClient`的网络信息, 也不需要手动绑定

##### **演示**

分别实现了最简单的`udpServer`和`udpClient`之后, 运行程序演示一下效果

![udpClient_2_udpServer](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/202308211611800.gif)

#### **`UDP` 实现最简单的公共聊天**

上面已经实现了`UDP`客户端向服务器发送信息

但是, 服务器并没有实现回复的功能

不过, 这么简单的发信息功能 好像也不需要回复

那么, 下面可以根据已经实现的这些功能, 再做一些修改和添加:

1. 服务器内, 使用哈希表实现一个存储不同主机进程信息的 用户表
2. 让服务器收到消息之后可以转发给 用户表内的所有用户进程
3. 让客户端也可以 接收来自服务器的信息, 并输出

这样是不是就可以实现一个最简单(简陋)的公共聊天室呢?

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
// 通过可变参数实现, 传入日志等级, 日志内容格式, 日志内容相关参数
void logMessage(int level, const char* format, ...) {
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

**`udpServer.cc`:**

```cpp
#include <arpa/inet.h>
#include <netinet/in.h>
#include <sys/socket.h>
#include <sys/types.h>
#include <unistd.h>

#include <cassert>
#include <cerrno>
#include <cstdlib>
#include <cstring>
#include <iostream>
#include <string>
#include <unordered_map>

#include "logMessage.hpp"

using std::cout;
using std::endl;
using std::string;
using std::unordered_map;

// 封装UDP服务
class udpServer {
public:
	// 构造函数, 需要传入 port 和 ip
	udpServer(uint16_t port, string ip = "")
		: _port(port)
		, _ip(ip)
		, _sockFd(-1) {}
	~udpServer() {}

	// 服务器初始化函数
	// 具体功能就是 创建套接字 绑定主机网络信息
	void init() {
		// 1. 首先就是创建套接字, 并获取套接字文件描述符
		_sockFd = socket(AF_INET, SOCK_DGRAM, 0);

		if (_sockFd < 0) {
			// 套接字文件描述符创建失败
			logMessage(FATAL, "socket() faild:: %s : %d", strerror(errno), _sockFd);
			exit(1);
		}

		logMessage(DEBUG, "socket create success: %d", _sockFd);

		struct sockaddr_in local;
		bzero(&local, sizeof(local)); // 将结构体内容全部置空
		local.sin_family = AF_INET;
		local.sin_port = htons(_port);
		local.sin_addr.s_addr = _ip.empty() ? htonl(INADDR_ANY) : inet_addr(_ip.c_str());

		// 填充完网络信息, 就要将网络信息 绑定到操作系统内核中, 进而将网络信息
		// 发送到网络上
		if (bind(_sockFd, (const struct sockaddr*)&local, sizeof(local)) == -1) {
			logMessage(FATAL, "bind() faild:: %s : %d", strerror(errno), _sockFd);
			exit(2);
		}

		logMessage(DEBUG, "socket bind success : %d", _sockFd);
	}

	// 服务器运行函数
	// 具体功能 实际上是 循环地监听、接收发送到服务器上的信息
	void start() {
		// 很多服务器本质上是一个死循环
		char inBuffer[1024]; // 用来存储发送过来的信息
		while (1) {
			struct sockaddr_in peer;		  // 输出型参数, 用来接收对方主机网络信息
			socklen_t peerLen = sizeof(peer); // 输入输出型参数

			ssize_t s = recvfrom(_sockFd, inBuffer, sizeof(inBuffer) - 1, 0, (struct sockaddr*)&peer, &peerLen);

			if (s > 0) {
				// 当字符串结尾
				inBuffer[s] = 0;
			}
			else if (s == -1) {
				logMessage(WARINING, "recvfrom() error:: %s : %d", strerror(errno), _sockFd);
				continue;
			}

			// 读取成功, 除了读取到对方的数据, 你还要读取到对方的网络地址[ip:port]
			string peerIp = inet_ntoa(peer.sin_addr); // 拿到了对方的IP
			uint32_t peerPort = ntohs(peer.sin_port); // 拿到了对方的port

			// 检查用户是否在服务器中, 不在则添加用户
			checkOnlineUser(peerIp, peerPort, peer);

			// 打印出来对方给服务器发送过来的消息
			logMessage(NOTICE, "[%s:%d]%s", peerIp.c_str(), peerPort, inBuffer);

			// 然后将消息转发到所有用户的客户端上, 实现多人聊天
			string infoUser(inBuffer);
			messageRoute(peerIp, peerPort, infoUser);
		}
	}

	void checkOnlineUser(string& ip, uint32_t port, struct sockaddr_in& peer) {
		string key = ip;
		key += ":";
		key += std::to_string(port);
		auto itUser = _users.find(key);

		// 判断用户是否已经存在, 不存在则添加
		if (itUser == _users.end()) {
			_users.insert({ key, peer });
		}
	}

	void messageRoute(string& ip, uint32_t port, string info) {
		string message = "[";
		message += ip;
		message += ":";
		message += std::to_string(port);
		message += "]";
		message += info;

		// 遍历 服务器用户列表, 将message 发送给每一个在服务器内的用户网络进程
		for (auto& user : _users) {
			sendto(_sockFd, message.c_str(), message.size(), 0, (struct sockaddr*)&(user.second), sizeof(user.second));
		}
	}

private:
	// 服务器 端口号
	uint16_t _port;
	// 服务器 IP, 程序运行时, 一般传入的是 点分十进制表示的ip的字符串
	string _ip;
	// 服务器 套接字文件描述符
	int _sockFd;
	// 服务器用户   key: ip:port, T:主机网络进程信息
	unordered_map<string, struct sockaddr_in> _users;
};

static void Usage(const string porc) {
	cout << "Usage:\n\t" << porc << " port [ip]" << endl;
}

// main 函数需要获取命令函参数, 以实现获取端口号和ip
int main(int argc, char* argv[]) {
	// 如果 使用方法错误
	if (argc != 2 && argc != 3) {
		Usage(argv[0]);
		exit(3);
	}

	// 获取 端口号 和 IP
	uint16_t port = atoi(argv[1]);
	string ip;
	if (argc == 3) {
		ip = argv[2];
	}

	// 使用端口号和IP 实例化udpServer对象
	udpServer uSvr(port, ip);

	// 初始化, 并启动服务器
	uSvr.init();
	uSvr.start();

	return 0;
}
```

**`udpClient.cc`:**

```cpp
#include <arpa/inet.h>
#include <netinet/in.h>
#include <pthread.h>
#include <sys/socket.h>
#include <sys/types.h>
#include <unistd.h>

#include <cassert>
#include <cstdlib>
#include <iostream>
#include <string>

#include "logMessage.hpp"

using std::cin;
using std::cout;
using std::endl;
using std::getline;
using std::string;

// 多线程 接收来自服务器的消息
void* recverAndPrint(void* args) {
	while (true) {
		int sockFd = *(int*)args;

		char buffer[1024];

		// recvfrom 需要两个输出型参数, 来接收来自服务器的网络进程信息
		// 所以需要两个临时变量
		struct sockaddr_in temp;
		socklen_t len = sizeof(temp);

		ssize_t s = recvfrom(sockFd, buffer, sizeof(buffer), 0, (struct sockaddr*)&temp, &len);
		if (s > 0) {
			buffer[s] = 0;
			cout << buffer << endl;
		}
	}
}

static void Usage(const string porc) {
	std::cerr << "Usage::\n\t" << porc << " server_IP server_Port nick_Name" << endl;
}

int main(int argc, char* argv[]) {
	if (argc != 4) {
		Usage(argv[0]);
		exit(1);
	}

	// 先获取server_IP 和 server_Port 以及用户的昵称
	string server_IP = argv[1];
	uint16_t server_Port = atoi(argv[2]);
	string nick_Name = argv[3];

	// 创建客户端套接字
	int sockFd = socket(AF_INET, SOCK_DGRAM, 0);
	if (sockFd < 0) {
		logMessage(FATAL, "socket() faild:: %s : %d", strerror(errno), sockFd);
		exit(2);
	}
	logMessage(DEBUG, "socket create success: %d", sockFd);

	struct sockaddr_in server;
	bzero(&server, sizeof(server));
	server.sin_family = AF_INET;
	server.sin_port = htons(server_Port);
	server.sin_addr.s_addr = inet_addr(server_IP.c_str());

	pthread_t t;
	pthread_create(&t, nullptr, recverAndPrint, &sockFd);

	// 通信
	while (true) {
		// 这里改为 使用 cerr, 是为了不将此语句, 重定向到命名管道
		std::cerr << "Please Enter >> ";
		string inBuffer;
		inBuffer += "[";
		inBuffer += nick_Name;
		inBuffer += "]# ";
		string tempS;
		getline(cin, tempS);
		inBuffer += tempS;

		// 向 server 发送消息
		sendto(sockFd, inBuffer.c_str(), inBuffer.size(), 0, (const struct sockaddr*)&server, sizeof(server));
		// 绑定到操作系统内核
	}

	close(sockFd);

	return 0;
}
```

**`makefile`:**

```makefile
.PHONY:all
all:udpServer udpClient

udpServer: udpServer.cc
	g++ -o $@ $^
udpClient: udpClient.cc
	g++ -o $@ $^ -lpthread

.PHONY:clean
clean:
	rm -rf udpServer udpClient
```

上面的代码实现了:

1. 服务器内, 通过哈希表 存储向服务器发消息的客户端用户.
2. 客户端, 可以接收用户从命令函输入的消息, 并发送给服务器
3. 服务器收到消息, 通过检测 客户端进程的网络信息 不存在, 向服务器内的用户表中 添加用户网络进程信息
4. 并将来自客户端的消息, 在服务器输出, 并将消息转发给用户表中的所有用户
5. 客户端会接受来自服务器的消息, 以此实现公共聊天

演示:

![udp_chat](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/202308211611104.gif)

从演示中可以看到, 当服务器打开 客户端打开之后, 客户端就可以向服务器发送消息了. 
> 演示中 Windows的客户端 我取消了接收服务器消息的功能. 

相比最简单的 udp网络通信的实现. **`udpServer`** 和 **`udpClient`** 变化的地方在这些部分:
1. `udpServer`

    ![|wide](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/202307021434724.webp)

    在 udpServer 代码中, 首先是在类中添加了一个 成员变量 `_users`, 是一个哈希表 用来存储用户网络进程信息

    然后就是 增添了这两个 成员函数: `checkOnlineUser()` `messageRoute()`

    `checkOnlineUser()`, 用来检测 向服务器发送消息的客户端是否已经在服务器的用户表中. 如果不在, 则添加. 

    `messageRoute()`, 则是实现消息路由转发的功能. 服务器 接收到 某个客户端发来的消息之后, 会将客户端的信息(IP:Port) 以及发过来的消息, 传入此函数内. 然后 此函数整合信息和消息, 再将整合后的信息 转发给所有在服务器用户表中的客户端用户.

2. `udpClient`

    ![|wide](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/202307021443300.webp)

    客户端代码的最大的不同, 就是多了一个多线程执行的函数 `recverAndPrint()`

    此函数的功能是, 接收来自服务器的消息. 其实就是 接收所有人发送的消息.

    此函数需要多线程执行, 为什么呢?

    我们在 `udpClient` 代码中, 获取用户在命令行输入的内容的实现是用 `getline();` 实现的. 

    是一个阻塞式的等待输入操作. 

    如果 `recverAndPrint()` 也在主线程内执行. 那么就会出现 只有用户输入完毕之后, 来自服务器的消息才能输出在客户端中 的现象. 就像这样:

    ![|wide](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/202308211612254.gif)

    这样显然是不正确的. 所以使用多线程执行 `recverAndPrint()`. 主线程不干扰此线程.

    `udpClient` 代码还有其他的修改.

    为了方便展示、查看 客户端接收到的服务器发来的信息. 演示时, 将 `udpClient` 的标准输出内容 重定向到了一个 命名管道文件中.

    并且, 为了将来自服务器的信息重定向到其中 并且不出现扰乱信息, 我们将 `udpClient` 中其他 部分输出 由 `std::cout 标准输出` 换成了 `std::cerr 标准错误`. 比如, 输入提示的部分:

    ![|wide](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/202307021518644.webp)

    这样 可以避免将 输入提示符 也重定向到管道文件中. 因为 命令行中 `>` 是标准输出重定向

    > `udpClient` 的改动, 涉及到 线程与重定向
    >
    > 博主 线程与重定向的相关文章:
    >
    > [[Linux] 线程同步分析: 什么是条件变量？生产者消费者模型是什么？POSIX信号量怎么用？阻塞队列和环形队列模拟生产者消费者模型](https://www.humid1ch.cn/posts/Linux-Thread-Synchronization)
    >
    > [[Linux] 线程互斥分析: 多线程会有什么问题？什么是互斥锁？C++怎么封装使用互斥锁？](https://www.humid1ch.cn/posts/Linux-Thread-Mutex)
    >
    > [[Linux] 如何理解线程ID？什么是线程局部存储？](https://www.humid1ch.cn/posts/Linux-ThreadID-Analysis)
    >
    > [[Linux] 多线程控制分析: 如何获取线程ID？如何自动回收线程？](https://www.humid1ch.cn/posts/Linux-Thread-Control)
    >
    > [[Linux] 多线程概念相关分析](https://www.humid1ch.cn/posts/Linux-Thread-Conceptual-Analysis)
    >
    > [[Linux] 详析 Linux下的 文件重定向 以及 文件缓冲区](https://www.humid1ch.cn/posts/Linux-Redirection&File-Buffers)

这样就实现了 最简单的 `udp公共聊天`

### **`inet_ntoa()`**的相关问题

上面在向`struct sockaddr_in`结构体内填充 IP地址时, 使用了一个接口: `inet_addr()`

将 点分十进制的`IP`转换成了`uint32_t(in_addr_t)`类型的4字节表示的`IP`

并且, `inet_addr()`会自动把4字节的`IP`存储顺序, 设置为**网络字节序**

`inet_addr()`接口的使用 非常的方便

但是, 与之同系列的另一个接口 是存在着一些问题的, 接口: **`inet_ntoa()`**

![](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/202307021535705.webp)

这个接口的功能也很简单, 就是将`struct in_addr`里存储的 4字节`IP`, 转换成我们可以看懂的点分十进制IP字符串, 然后以`char*`的类型返回

`char*`指针返回, 这就需要存在一块空间, 来存储转换后的`IP`字符串

而事实上, 这块空间是处于静态区的空间, `IP`字符串会存放在这块空间内

并且, 整个程序中`inet_ntoa()`也就只会返回 这块处于静态区的空间

这就意味着, 当`inet_ntoa()`在一个程序中多次执行时, 后面被转换出来的`IP`字符串会覆盖掉之前的`IP`字符串

因为, `inet_ntoa()`转换出来的`IP`字符串, 都只存储在这一块空间中

所以, 在使用`inet_ntoa()`时需要避免多次使用 或者 避免直接使用函数返回的指针

并且, `inet_ntoa()`也是一个线程不安全的接口, 因为所有的`inet_ntoa()`调用都访问的同一块静态空间

> 可以使用另外一个接口来替代 `inet_ntoa()`
>
> **`inet_ntop()`**
>
> ![|wide](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/202307021549074.webp)
>
> 这个接口, 可以将网络字节序的`IPv4`或`IPv6`地址转换为点分十进制字符串表示
>
> 其参数的使用:
>
> 1. **`int af`:** 指明地址族, `IPv4`或`IPv6`(**`AF_INET` 或 `AF_INET6`**)
> 2. **`const void* src`:** 需要传入 表示网络字节序IP的结构体的地址(**`in_addr` 或 `in6_addr`**)
> 3. **`char* dst`:** 存放转换之后的字符串的缓冲区指针
> 4. **`socklen_t`:** 缓冲区大小
>
> 并且, 此接口是线程安全的
