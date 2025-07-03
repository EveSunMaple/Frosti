---
draft: true
title: "[Linux] 网络编程 - 初见TCP套接字编程: 实现简单的单进程、多进程、多线程、线程池tcp服务器..."
pubDate: "2023-07-03"
description: 'UDP和TCP的部分特点. 最主要的区别就是: 
1. UDP非连接, 面向数据包
2. TCP连接, 面向字节流
所以, TCP多了三个用于连接的接口: connect()、listen()和accept() 这三个接口具体怎么使用, 下面实现简单的TCP网络通信时 介绍一下.'
image: https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/202307061551105.webp
categories:
    - Blogs
tags: 
    - Linux网络
    - 套接字
    - TCP
---

网络的上一篇文章, 介绍了网络编程的一些重要的概念, 以及 UDP套接字的编程演示

还实现了一个简单更简陋的`UDP`公共聊天室

> [[Linux] 网络编程 - 初见UDP套接字编程: 网络编程部分相关概念、TCP、UDP协议基本特点、网络字节序、socket接口使用、简单的UDP网络及聊天室实现...](https://www.humid1ch.cn/posts/Linux-Network-UDPSocket_I)

本篇文章, 介绍一下`TCP`套接字编程的接口 及 演示

# TCP套接字

在介绍UDP套接字编程的文章中, 列出了一些接口:

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

其中已经演示使用了: `socket()`、`bind()`、`sendto()`、`recvfrom()`

并且, 也介绍了`UDP`和`TCP`的部分特点

最主要的就是: 

1. `UDP`非连接, 面向数据包
2. `TCP`连接, 面向字节流

所以, `TCP`多了三个用于连接的接口: `connect()`、`listen()`和`accept()`

这三个接口具体怎么使用, 下面实现简单的`TCP`网络通信时进行介绍

## 简单的`TCP`网络通信

在介绍过`UDP`网络编程之后

`TCP`网络编程没有很多需要新介绍的内容

先定义一个头文件, 用来包含需要使用到的一些头文件、定义一些宏:

**`util.hpp`:**

```cpp
#pragma once

#include <arpa/inet.h>
#include <netinet/in.h>
#include <pthread.h>
#include <signal.h>
#include <sys/socket.h>
#include <sys/types.h>
#include <sys/wait.h>
#include <unistd.h>

#include <cstdlib>
#include <cstring>
#include <iostream>
#include <string>

#include "logMessage.hpp"

#define SOCKET_ERR 1
#define BIND_ERR 2
#define LISTEN_ERR 3
#define USE_ERR 4
#define CONNECT_ERR 5
#define FORK_ERR 6

#define BUFFER_SIZE 1024
```

还有日志打印相关头文件:

**`logMessage.hpp`:**

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

static const char* log_level[] = { "DEBUG", "NOTICE", "WARINING", "FATAL" };

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
	char* localTmStr = asctime(localTm);
	char* nC = strstr(localTmStr, "\n");
	if (nC) {
		*nC = '\0';
	}

	fprintf(out, "%s | %s | %s | %s\n", 
            log_level[level], 
            localTmStr, 
            name == nullptr ? "unknow" : name, 
            logInfo);
}
```

---

先实现一个没有实际功能的、只能连接TCP服务器:

**`tcpServer.cc`:**

```cpp
#include "util.hpp"

class tcpServer {
public:
	tcpServer(uint16_t port, const std::string& ip = "")
		: _port(port)
		, _ip(ip) {}

	void init() {
		// 先创建套接字文件描述符
		// 不过, 与UDP不同的是 TCP是面向字节流的, 所以套接字数据类型 要使用
		// 流式套接字
		_listenSock = socket(AF_INET, SOCK_STREAM, 0);

		if (_listenSock < 0) {
			// 套接字文件描述符创建失败
			logMessage(FATAL, "socket() faild:: %s : %d", strerror(errno), _listenSock);
			exit(SOCKET_ERR); // 创建套接字失败 以 SOCKET_ERR 退出
		}
		logMessage(DEBUG, "socket create success: %d", _listenSock);

		// 套接字创建成功, 就需要将向 sockaddr_in 里填充网络信息
		// 并将进程网络信息绑定到主机上
		struct sockaddr_in local;
		std::memset(&local, 0, sizeof(local));

		// 填充网络信息
		local.sin_family = AF_INET;
		local.sin_port = htons(_port);
		_ip.empty() ? (local.sin_addr.s_addr = htonl(INADDR_ANY)) : (inet_aton(_ip.c_str(), &local.sin_addr));

		// 绑定网络信息到主机
		if (bind(_listenSock, (const struct sockaddr*)&local, sizeof(local)) == -1) {
			// 绑定失败
			logMessage(FATAL, "bind() faild:: %s : %d", strerror(errno), _listenSock);
			exit(BIND_ERR);
		}
		logMessage(DEBUG, "socket bind success : %d", _listenSock);

		// 绑定了网络信息之后, 不同于 UDP, TCP是面向连接的
		// 所以 在TCP服务器绑定了进程网络信息到内核中之后
		// 其他主机就有可能向服务器发送连接请求了
		// 所以 在绑定了网络信息之后 要做的事就是: 监听套接字
		// 监听是否有其他主机发来连接请求 需要用到接口 listen()
		if (listen(_listenSock, 5) == -1) {
			logMessage(FATAL, "listen() faild:: %s : %d", strerror(errno), _listenSock);
			exit(LISTEN_ERR);
		}
		logMessage(DEBUG, "listen success : %d", _listenSock);
		// 开始监听之后, 别的主机就可以发送连接请求了.
	}

	// 服务器初始化完成之后, 就可以启动了
	void loop() {
		while (true) {
			struct sockaddr_in peer;		  // 输出型参数 接受所连接主机客户端网络信息
			socklen_t peerLen = sizeof(peer); // 输入输出型参数

			// 使用 accept() 接口, 接受来自其他网络客户端的连接
			// 成功会返回一个文件描述符, 失败则返回-1
			// 此函数是阻塞式的, 也就是说 在没有连接发送过来之前 进程会处于阻塞状态
			int serviceSock = accept(_listenSock, (struct sockaddr*)&peer, &peerLen);
			if (serviceSock == -1) {
				logMessage(WARINING, "accept() faild:: %s : %d", strerror(errno), serviceSock);
				continue;
			}

			// 走到这里, 就表示连接成功了
			// 连接成功之后, 就可以获取到连接客户端的网络信息了:
			uint16_t peerPort = ntohs(peer.sin_port);
			std::string peerIP = inet_ntoa(peer.sin_addr);
			logMessage(DEBUG, "accept success: [%s: %d] | %d ", peerIP.c_str(), peerPort, serviceSock);
		}
	}

private:
	uint16_t _port;	 // 端口号
	int _listenSock; // 服务器套接字文件描述符
	std::string _ip;
};

void Usage(std::string proc) {
	std::cerr << "Usage:: \n\t" << proc << " port ip" << std::endl;
	std::cerr << "example:: \n\t" << proc << " 8080 127.0.0.1" << std::endl;
}

int main(int argc, char* argv[]) {
	if (argc != 3 && argc != 2) {
		Usage(argv[0]);
		exit(USE_ERR);
	}
	uint16_t port = atoi(argv[1]);
	std::string ip;
	if (argc == 3) {
		ip = argv[2];
	}

	tcpServer svr(port, ip);

	svr.init();
	svr.loop();

	return 0;
}
```

此代码中, 类的成员函数还是那几个:

1. **`uint16_t _port`**, 用于存储服务器进程端口号

2. **`int _listenSock`**, 用于存储服务器进程创建的 **监听套接字**

    关于什么是监听套接字, 下面分析代码时介绍.

3. **`std::string _ip`**, 用于存储服务器进程IP

我们来分析一下 封装的类中的每个重要的成员函数:

1. `init()` 初始化函数, 初始化服务器信息

    ![|wide](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/202307141958725.webp)

    初始化函数, 要执行的就是一个服务器再启动之前 需要做的工作.

    首先是 调用`socket()`创建套接字, 类接受套接字的变量中起了一个名字叫`_listenSock`.

    由于, TCP面向的是字节流通信, 所以`socket()`第二个参数传入 **`SOCK_STREAM`**, 表示面向字节流:

    ![|wide](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/202307142007105.webp)

    然后就是一系列无论是UDP还是TCP都要实现的:

    1. 将服务器网络信息 填充到 在用户栈创建的`sockaddr_in`结构体中, **需要传输到网络中的内容要以网络字节序存储**

        ![|wide](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/202307142009618.webp)

    2. 将网络信息绑定到系统内核

        ![|wide](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/202307142012312.webp)

    不过, 下面的一个步骤 UDP就没有了. 

    在之前实现的UDP网络通信中, `bind()`就是UDP服务器初始化的最后一步.

    而 TCP不同, 因为TCP通信是 **需要建立连接** 的. 所以, 这里的TCP服务器初始化要比UDP的多一个步骤: **监听**

    即, 调用`listen()`接口, 让服务器开启监听状态.

    ![|wide](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/202307142019317.webp)

    执行`listen()`, 服务器会自动进入监听状态. 之后会一直监听 来自客户端 向服务器 发送的连接请求. 实际上监听的就是服务器的套接字. 监听的过程是非阻塞的. 

    > 关于`listen()`接口的第二个参数`int backlog`在之后再介绍.

    当服务器开始监听之后, 可以说 就有能力看到来自其他客户端的连接请求了

    至此, 初始化完毕.

2. `loop()` 服务器启动函数, 我们默认它是一个死循环

    ![|wide](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/202307142031811.webp)

    如果是UDP服务器, 启动之后 就可以接受客户端发送来的信息然后做处理了.

    但是TCP服务器不行, 因为TCP是 **面向连接** 的. 其他客户端想要将信息发送到服务器, 就必须先于服务器建立连接.

    而能否与服务器建立连接 是服务器说了算的. 只有 **服务器接受了来自客户端的连接请求 才是连接成功** 了.

    所以, 这里 TCP服务器开启的第一件事, 就是接受连接请求:

    ![|wide](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/202307142037406.webp)

    接受连接请求的接口是: `accept()`

    ![|wide](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/202307142049383.webp)

    `accept()`接口会按顺序接受来自客户端的连接请求. 并返回一个新的套接字文件描述符.

    这也就是说, 这个TCP服务器创建很多个套接字.

    而我们知道, UDP服务器中只会创建一个属于服务器的套接字.

    `accept()`新创建的套接字是什么呢? 与服务器原本的套接字有什么关系?

    我们知道, 服务器原本的套接字处于被监听的状态, 是为了能够接收到连接信息.

    当`accept()`接受了客户端的连接请求时, 会创建一个存储有 服务器本地网络信息 以及 客户端网络信息的套接字, 服务器可以通过此套接字与客户端进行通信.

    即, 

    1. 服务器原本的套接字

        服务器可以通过监听此套接字, 收到客户端的连接请求, 然后服务器就可以接受连接请求了. 

        只用来与客户端建立连接.

        此套接字, 被称为 `监听套接字`. 所以 服务器类中的用于存储套接字的成员变量, 才起名`_listenSock`

    2. `accept()`创建的套接字

        此套接字包括 服务器本地网络信息 和 客户端网络信息. 并且 此套接字也会被绑定到系统内核中, 并与服务器原套接字相独立.

        服务器可以通过此套接字与客户端进行通信.

        此套接字, 主要是用来给客户端提供服务的套接字.

        所以, 接受此套接字的变量可以起名为`serviceSock`

    `accept()`接口的后两个参数, 还是用来接收客户端网络信息的输出型参数.

    建立了连接之后, 就可以与客户端进行通信了.

实现了之后, 其实就已经可连接到服务器了.

我们可以使用浏览器测试:

![tcpServer](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/202308211608870.gif)

当我们使用浏览器访问服务器`(IP:Port)`时, 可以看到服务器`accept()`了连接请求. 但是由于服务器没有实现任何功能, 所以浏览器没有变化.

### 实现客户端通信

现在服务器并不具备任何的功能, 也不能接收来自客户端的信息

#### 服务器功能实现

下面我们来实现一个将客户端发来的信息小写转大写的功能.

```cpp
void low2upService(int sock, const std::string& clientIP, const uint16_t& clientPort) {
    assert(sock > 0);
    assert(!clientIP.empty());

    // 一个用于存储来自客户端信息的数组
    char inbuffer[BUFFER_SIZE];
    while (true) {
        // TCP获取来自客户端的信息的操作就是 read
        // 从 服务器与客户端连接 的文件描述符中 读取来自客户端的信息
        // 可看作 通过文件描述符 从文件读取内容
        ssize_t s = read(sock, inbuffer, sizeof(inbuffer) - 1);
        if (s > 0) {
            // 大于零 就是读取到数据了
            inbuffer[s] = '\0';
            // 我们实现一个操作, 如果 客户端传输过来的信息是 quit 这个单词, 就表示客户端请求退出
            // 就可以退出 服务循环了
            if (strcasecmp(inbuffer, "quit") == 0) { // strcasecmp 忽略大小写比较
                logMessage(DEBUG, "Client requests to quit: [%s: %d]", clientIP.c_str(), clientPort);
                break;
            }
            // 走到这里 就可以进行小写转大写了
            logMessage(DEBUG, "low2up before: [%s: %d] >> %s", clientIP.c_str(), clientPort, inbuffer);
            for (int i = 0; i < s; i++) {
                if (isalpha(inbuffer[i]) && islower(inbuffer[i]))
                    inbuffer[i] = toupper(inbuffer[i]);
            }
            logMessage(DEBUG, "low2up after: [%s: %d] >> %s", clientIP.c_str(), clientPort, inbuffer);

            // 上面做的都是对获取到的信息 进行转换
            // 最后需要做的就是 将转换后的信息 再重新回应给客户端
            // 而 回应给客户端 则是用 write, 可看做 通过文件描述符像文件写入内容
            write(sock, inbuffer, strlen(inbuffer));
        }
        else if (s == 0) {
            // s == 0, 表示什么?
            // 在管道通信中 read() 是阻塞式读取的. 此时 返回值为0, 表示管道的写入端关闭
            // 而 TCP类似, TCP中 read() 通常也是阻塞时读取的, 此时返回0, 表示客户端关闭
            // 所以此时, 该退出了
            logMessage(DEBUG, "Client has quited: [%s: %d]", clientIP.c_str(), clientPort);
            break;
        }
        else {
            // 到这里 本次 read() 出错
            logMessage(DEBUG, "Client [%s: %d] read:: %s", clientIP.c_str(), clientPort, strerror(errno));
            break;
        }
    }
    // 走到这里 循环已经退出了, 表示 client 也已经退出了
    // 所以 此时需要关闭文件描述符, 因为一个主机上的文件描述符数量是一定的, 达到上限之后 就无法再创建
    // 已经无用但没有被归还的文件描述符, 文件描述符泄漏
    close(sock);
    logMessage(DEBUG, "Service close %d sockFd", sock);
}
```

阅读代码 可以发现, 我们实现TCP通信 直接使用了`read()`和`write()`接口.

因为, TCP是一种面向流的协议. 所以, 可以直接使用`read()`和`write()`通过文件描述符 与 客户端进行通信.

此功能函数没有什么需要特别主义的点.

此成员函数实现之后, 就可以直接在`loop()`中调用此函数:

![|inline](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/202307151137163.webp)

至此, 一个简单的可以接收客户端消息 并 将消息中小写字母转换成大写字母的服务器就实现完毕了.

#### 客户端实现

服务器是可以接收消息, 也具有一定的功能了

但是, 客户端还没有实现呢

下面是客户端实现的代码:

```cpp
#include "util.hpp"

volatile bool quit = false;

void Usage(std::string proc) {
	std::cerr << "Usage:: \n\t" << proc << " serverIP serverPort" << std::endl;
	std::cerr << "example:: \n\t" << proc << " 127.0.0.1 8080" << std::endl;
}

int main(int argc, char* argv[]) {
	if (argc != 3) {
		Usage(argv[0]);
		exit(USE_ERR);
	}
	std::string serverIP = argv[1];
	uint16_t serverPort = atoi(argv[2]);

	// 先创建套接字文件描述符
	int sockFd = socket(AF_INET, SOCK_STREAM, 0);

	if (sockFd < 0) {
		// 套接字文件描述符创建失败
		logMessage(FATAL, "socket() faild:: %s : %d", strerror(errno), sockFd);
		exit(SOCKET_ERR); // 创建套接字失败 以 SOCKET_ERR 退出
	}
	logMessage(DEBUG, "socket create success: %d", sockFd);

	// 客户端创建套接字之后, 首先需要做什么?
	// 服务器创建套接字之后, 需要填充绑定网络信息, 客户端也需要,
	// 但是与UDP相同 不需要手动填充 与 bind
	// 需要listen吗? 不需要, 因为客户端不会被主动连接
	// 需要accept吗? 不需要
	// 此时 客户端需要做的是 获取填充服务器信息, 并向服务器请求连接!

	// 填充服务器基本网络信息
	struct sockaddr_in server;
	memset(&server, 0, sizeof(server));
	server.sin_family = AF_INET;
	server.sin_port = htons(serverPort);
	inet_aton(serverIP.c_str(), &server.sin_addr);

	// 发送连接请求
	if (connect(sockFd, (const struct sockaddr*)&server, sizeof(server)) == -1) {
		// 连接失败
		logMessage(FATAL, "Client connect() faild: %d, %s", sockFd, strerror(errno));
		exit(CONNECT_ERR);
	}
	logMessage(DEBUG, "Client connect success.");

	// 连接成功之后, 就可以向服务器发送信息了
	std::string message;
	while (!quit) { // 根据退出状态 识别客户端是否退出
		message.clear();
		std::cout << "请输入消息 >> ";
		std::getline(std::cin, message); // 从命令行获取消息 到 message中
		if (strcasecmp(message.c_str(), "quit") == 0) {
			// 我们实现了 输入 quit 这个单词就向服务器请求退出 的功能
			// 所以, 在输入 quit 这个单词时, 表示 需要退出
			// 就要将 客户端的退出状态设置为 true, 让客户端不进入下一次循环
			quit = true;
		}

		// 向客户端套接字文件描述符写入消息
		ssize_t sW = write(sockFd, message.c_str(), message.size());
		if (sW > 0) {
			// 写入成功, 就准备接收服务器的回复
			// 需要与服务器inbuffer大小一致
			message.resize(BUFFER_SIZE);
			ssize_t sR = read(sockFd, (char*)message.c_str(), BUFFER_SIZE);
			if (sR > 0) {
				message[sR] = '\0';
			}
			if (strcasecmp(message.c_str(), "quit")) {
				std::cout << "Server Echo>>> " << message << std::endl;
			}
		}
		else if (sW <= 0) {
			logMessage(FATAL, "Client write() faild: %d, %s", sockFd, strerror(errno));
			break;
		}
	}

	// 退出循环 客户端退出, 关闭文件描述符
	close(sockFd);

	return 0;
}
```

TCP客户端前面的实现 与UDP客户端前面的实现 步骤相同:

1. 创建套接字

    UDP创建面向数据包的套接字, TCP则创建面向流的

2. 填充服务器基本网络信息

之后, TCP客户端需要向TCP服务器发送连接请求, 只有在连接成功之后 才能进行通信.

连接请求的接口是:`connect()`

![](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/202307151149364.webp)

没错, `connect()`也会向`sendto()`那样 自动绑定客户端的网络信息.

连接成功之后, 就可以使用`write()`向服务器发送信息, 使用`read()`读取服务器的回复了. 这个过程中使用的文件描述符都是客户端套接字的文件描述符.

除了发送信息 接收回复功能的实现之外. 由于我们在服务器实现了 当客户端发送quit这个单词, 就表示客户端请求退出了. 所以客户端也要实现相应的功能.

具体的实现是:

![|inline](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/202307151155026.webp)

通过一个`bool`变量标识退出状态, 如果输入了`quit`这个单词 就不进入下一个循环.

最后, 退出循环之后, 关闭文件描述符. 客户端退出.

---

整个服务器和客户端的执行演示:

![](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/202308211606386.gif)

但是, 这个版本的服务器是有缺陷的:

![](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/202308211606462.gif)

当多客户端尝试连接服务器时, 会发现 服务器只会对第一个连接的客户端进行响应.

这是为什么?

我们这个服务器是 **单进程版本**, 此时连接多个客户端会出问题

当客户端连接到服务器之后, 会调用`low2upService()`这个函数

但是 这个函数的主体是什么? 是一个死循环.

单进程调用函数进入一个死循环, 就出不来了!

后面的客户端再连接进来, 服务器是没办法响应的, 因为进程唯一的一个执行流在一个死循环内呢

要怎么解决这个问题呢?

那就要用到多进程或多线程了

### 多进程服务器

单进程的服务器, 在给多个客户端提供服务时 会出问题.

那就用多进程服务器解决.

#### **`v1`**

多进程服务器也很简单, 只需要改一下`loop()`中 执行`low2upService()`的部分就可以了:

```cpp
// 服务器初始化完成之后, 就可以启动了
void loop() {
    signal(SIGCHLD, SIG_IGN); // 忽略子进程推出信号, 子进程退出时就会自动回收

    while (true) {
        struct sockaddr_in peer;		  // 输出型参数 接受所连接主机客户端网络信息
        socklen_t peerLen = sizeof(peer); // 输入输出型参数

        int serviceSock = accept(_listenSock, (struct sockaddr*)&peer, &peerLen);
        if (serviceSock == -1) {
            logMessage(WARINING, "accept() faild:: %s : %d", strerror(errno), serviceSock);
            continue;
        }

        uint16_t peerPort = ntohs(peer.sin_port);
        std::string peerIP = inet_ntoa(peer.sin_addr);
        logMessage(DEBUG, "accept success: [%s: %d] | %d ", peerIP.c_str(), peerPort, serviceSock);

        // 多进程v1
        pid_t id = fork();
        if (id == -1) {
            logMessage(FATAL, "Server fork() faild: %s", strerror(errno));
            exit(FORK_ERR);
        }
        else if (id == 0) {
            // 进入子进程
            // 子进程会继承 父进程的文件描述符表, 但是这已经是两个不同的进程了
            // 所以建议进入子进程之后, 先关闭_listenSock,
            // 防止子进程代码可能对此文件造成影响
            close(_listenSock);
            low2upService(serviceSock, peerIP.c_str(), peerPort);
            exit(0);
        }
        // 这里是父进程执行的内容
        close(serviceSock);
        // 父进程需要手动关闭 连接客户端创建的与客户端通信的文件描述符
        // 如果不关闭父进程会发生文件描述符泄漏
        // 父子进程在各子进程中关闭某文件描述符 是不影响对方的
    }
}

```

只需要使用`fork()`创建子进程, 然后将`low2upService()`放到子进程里执行就可以了.

![|inline](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/202307151601587.webp)

不过需要注意的问题是:

1. 子进程会继承父进程的文件描述符表, 也就意味着 父进程打开的`'文件'`子进程默认是打开的

    而且, 子进程与父进程已经是两个进程了, 无论是子进程还是父进程打开或关闭文件描述符, 都 **不会影响对方的文件描述符状态**

2. `_listenSock`是父进程的监听套接字, 对子进程来说 无用.

    所以, 建议进入子进程先关闭此套接字, 避免子进程执行的代码可能会影响父进程的监听

3. `serviceSock`是服务器与客户端通信的套接字.

    使用多进程, 变成了 子进程实现通信功能. 而 此套接字文件描述符的关闭操作 原本是在`low2upService()`中的, 现在子进程调用此函数, 所以子进程内不用再手动`close(serviceSock)`

    但是, 父进程已经不再执行`low2upService()`, 所以必须要`close(serviceSock)`. 否则父进程会发生文件描述符泄漏

4. 子进程退出时, 是需要父进程回收的. 

    如果父进程使用`wait()`进行等待, 默认是阻塞式的 无法使用. 如果使用`waitpid()`非阻塞, 也需要存储所有子进程的`pid`, 很麻烦.

    所以, 我们直接在`loop()`函数刚开始 执行`signal(SIGCHLD, SIG_IGN);`忽略子进程的退出信号. 这样子进程退出时, 会被自动回收.

完成之后, 再打开服务器 和 多客户端:

![](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/202308211606633.gif)

可以发现, 已经可以多客户端连接并通信了

#### **`v2`**

多进程的版本, 除了上面的, 还有一个版本:

```cpp
void loop() {
    // signal(SIGCHLD, SIG_IGN); // 忽略子进程推出信号, 子进程退出时就会自动回收

    while (true) {
        struct sockaddr_in peer;		  // 输出型参数 接受所连接主机客户端网络信息
        socklen_t peerLen = sizeof(peer); // 输入输出型参数

        int serviceSock = accept(_listenSock, (struct sockaddr*)&peer, &peerLen);
        if (serviceSock == -1) {
            logMessage(WARINING, "accept() faild:: %s : %d", strerror(errno), serviceSock);
            continue;
        }
        uint16_t peerPort = ntohs(peer.sin_port);
        std::string peerIP = inet_ntoa(peer.sin_addr);
        logMessage(DEBUG, "accept success: [%s: %d] | %d ", peerIP.c_str(), peerPort, serviceSock);

        // 连接到客户端之后, 就可以执行功能了
        // 执行转换功能 小写转大写

        pid_t id = fork();
        if (id == -1) {
            logMessage(FATAL, "Server fork() faild: %s", strerror(errno));
            exit(FORK_ERR);
        }
        else if (id == 0) {
            // 子进程
            close(_listenSock);
            // 再创建子进程, 并且此进程退出
            if (fork() > 0) {
                exit(0);
            }
            // 这部分是再次创建的子进程 执行的, 也就是孙子进程,
            // 因为父进程在创建出孙子进程时就推出了
            low2upService(serviceSock, peerIP.c_str(), peerPort);
            exit(0);
        }
        close(serviceSock);

        // 等待id子进程
        int ret = waitpid(id, nullptr, 0);
        // 就算是阻塞式的等待也无所谓, 因为 创建成功后马上就退出了
        if (ret == -1) {
            logMessage(FATAL, "Server waitpid() faild: %s", strerror(errno));
            exit(WAIT_ERR);
        }
        (void)ret;
    }
}
```

这个版本不在忽略子进程的退出信号. 而是利用了进程的一个特性

**如果子进程还没有退出, 但是其父进程退出了, 那么此子进程就成了孤儿进程, 会被操作系统领养**

**退出时会自动被操作系统回收**

即, 主父进程创建子进程之后, 子进程又创建了孙子进程

然后子进程退出, 让孙子进程与客户端通信

主父进程直接回收退出的子进程, 也不会发生一直阻塞等待的情况

![ ](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/202308211606793.gif)

### 多线程服务器

多进程版本实现, 消耗的资源很大, 所以可以实现多线程的版本

```cpp
#include "util.hpp"

class tcpServer; // threadData结构体要用, 所以先声明

struct threadData {
	threadData(uint16_t clientPort, std::string clientIP, int sock, tcpServer* ts)
		: _clientPort(clientPort)
		, _clientIP(clientIP)
		, _sock(sock)
		, _this(ts) {}

	uint16_t _clientPort;
	std::string _clientIP;
	int _sock;
	tcpServer* _this;
};

class tcpServer {
public:
	tcpServer(uint16_t port, const std::string& ip = "")
		: _port(port)
		, _ip(ip)
		, _listenSock(-1) {}

	static void* threadRoutine(void* args) {
		// 线程分离
		pthread_detach(pthread_self());

		threadData* tD = static_cast<threadData*>(args);
		tD->_this->low2upService(tD->_sock, tD->_clientIP, tD->_clientPort);

		// 线程执行任务结束后, 需要delete掉 tD
		delete tD;

		return nullptr;
	}

	void init() {
		_listenSock = socket(AF_INET, SOCK_STREAM, 0);

		if (_listenSock < 0) {
			// 套接字文件描述符创建失败
			logMessage(FATAL, "socket() faild:: %s : %d", strerror(errno), _listenSock);
			exit(SOCKET_ERR); // 创建套接字失败 以 SOCKET_ERR 退出
		}
		logMessage(DEBUG, "socket create success: %d", _listenSock);

		struct sockaddr_in local;
		std::memset(&local, 0, sizeof(local));

		// 填充网络信息
		local.sin_family = AF_INET;
		local.sin_port = htons(_port);
		_ip.empty() ? (local.sin_addr.s_addr = htonl(INADDR_ANY)) : (inet_aton(_ip.c_str(), &local.sin_addr));

		// 绑定网络信息到主机
		if (bind(_listenSock, (const struct sockaddr*)&local, sizeof(local)) == -1) {
			// 绑定失败
			logMessage(FATAL, "bind() faild:: %s : %d", strerror(errno), _listenSock);
			exit(BIND_ERR);
		}
		logMessage(DEBUG, "socket bind success : %d", _listenSock);

		if (listen(_listenSock, 5) == -1) {
			logMessage(FATAL, "listen() faild:: %s : %d", strerror(errno), _listenSock);
			exit(LISTEN_ERR);
		}
		logMessage(DEBUG, "listen success : %d", _listenSock);
		// 开始监听之后, 别的主机就可以发送连接请求了.
	}

	// 服务器初始化完成之后, 就可以启动了
	void loop() {
		while (true) {
			struct sockaddr_in peer;		  // 输出型参数 接受所连接主机客户端网络信息
			socklen_t peerLen = sizeof(peer); // 输入输出型参数

			int serviceSock = accept(_listenSock, (struct sockaddr*)&peer, &peerLen);
			if (serviceSock == -1) {
				logMessage(WARINING, "accept() faild:: %s : %d", strerror(errno), serviceSock);
				continue;
			}
			uint16_t peerPort = ntohs(peer.sin_port);
			std::string peerIP = inet_ntoa(peer.sin_addr);
			logMessage(DEBUG, "accept success: [%s: %d] | %d ", peerIP.c_str(), peerPort, serviceSock);

			// 连接到客户端之后, 就可以执行功能了
			// 执行转换功能 小写转大写

			// 多线程版本
			// 让多线程执行low2upService(), 是需要传参的, 所以需要定义一个结构体,
			// 存储可能使用到的参数
			threadData* tD = new threadData(peerPort, peerIP, serviceSock, this);
			pthread_t tid;
			pthread_create(&tid, nullptr, threadRoutine, (void*)tD);
		}
	}

	void low2upService(int sock, const std::string& clientIP, const uint16_t& clientPort) {
		assert(sock > 0);
		assert(!clientIP.empty());

		// 一个用于存储来自客户端信息的数组
		char inbuffer[BUFFER_SIZE];
		while (true) {
			ssize_t s = read(sock, inbuffer, sizeof(inbuffer) - 1);
			if (s > 0) {
				// 大于零 就是读取到数据了
				inbuffer[s] = '\0';
				if (strcasecmp(inbuffer, "quit") == 0) { // strcasecmp 忽略大小写比较
					logMessage(DEBUG, "Client requests to quit: [%s: %d]", clientIP.c_str(), clientPort);
					break;
				}
				// 走到这里 就可以进行小写转大写了
				logMessage(DEBUG, "low2up before: [%s: %d] >> %s", clientIP.c_str(), clientPort, inbuffer);
				for (int i = 0; i < s; i++) {
					if (isalpha(inbuffer[i]) && islower(inbuffer[i]))
						inbuffer[i] = toupper(inbuffer[i]);
				}
				logMessage(DEBUG, "low2up after: [%s: %d] >> %s", clientIP.c_str(), clientPort, inbuffer);

				write(sock, inbuffer, strlen(inbuffer));
			}
			else if (s == 0) {
				logMessage(DEBUG, "Client has quited: [%s: %d]", clientIP.c_str(), clientPort);
				break;
			}
			else {
				logMessage(DEBUG, "Client [%s: %d] read:: %s", clientIP.c_str(), clientPort, strerror(errno));
				break;
			}
		}
		// 走到这里 循环已经退出了, 表示 client 也已经退出了
		// 所以 此时需要关闭文件描述符, 因为一个主机上的文件描述符数量是一定的,
		// 达到上限之后 就无法再创建 已经无用但没有被归还的文件描述符,
		// 文件描述符泄漏
		close(sock);
		logMessage(DEBUG, "Service close %d sockFd", sock);
	}

private:
	uint16_t _port; // 端口号
	std::string _ip;
	int _listenSock; // 服务器套接字文件描述符
};
```

其实, 多线程版本的实现具体可以分为三个部分:

1. 为让线程可正常执行`tcpServer`类内函数, 所以要定义一个结构体, 存储需要用到的数据

    结构体对象作为回调函数的参数使用

    ![|wide](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/202307151724012.webp)

    结构体的成员变量除了客户端网络信息之外, 还有`tcpServer`对象指针.

    因为回调函数需要用`static`修饰, 所以在回调函数内是无法直接访问类内成员的. 所以需要使用`tcpServer`类对象指针.

2. 回调函数的定义, 主要作用就是执行服务

    ![|wide](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/202307151727427.webp)

    回调函数首先要执行线程分离. 因为主线程不能阻塞式`join`线程, 所以让线程自灭.

    然后就是通过结构体对象内的`tcpServer`对象指针, 调用类内服务函数

    执行完服务之后, 需要`delete`掉`threadData`指针, 因为它是`new`出来的. 并且无法在主线程内`delete`, 因为主线程无法判断, 其他线程是否使用完毕这块空间.

3. `loop()`内的线程创建

    ![|wide](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/202307151731723.webp)

    这里就是常规的创建线程, 让线程执行回调函数

    不过, 需要将所需的数据定义成一个结构体对象, 传入回调参数中.

至此, 多线程的版本就结束了:

![](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/202308211608861.gif)

可以很明显的看出来, 多线程的版本多客户端连接 会让服务器的文件描述符增加. 因为 **多线程共享文件描述符表**

### 线程池服务器

> 这里的例子使用线程池不太合理
>
> 因为, 这里的任务是死循环的
>
> 所以, 线程池会被占满, 只是试验一下

> 博主在之前的文章中实现过简单的线程池, 阅读下面内容之前, 建议阅读这篇文章:
>
> [[Linux] 最基础简单的线程池及其单例模式的实现](https://www.humid1ch.cn/posts/Linux-ThreadPool)

上面的多线程服务器功能实现的是, 每连接一个客户端创建一个线程, 这样效率太低了

线程池可以实现, 预先创建多个线程, 然后等到有客户端连接时 将此客户端需要的服务 分配给空闲线程, 从而提升服务客户端的效率

首先是线程池的实现:

**`threadPool.hpp`:**

```cpp
#pragma once

#include <cstddef>
#include <iostream>
#include <ostream>
#include <queue>
#include <cassert>
#include <pthread.h>
#include <unistd.h>
#include "lock.hpp" 	// RAII思想实现的锁

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
            // 或者 重载operator() 实现仿函数task()执行任务
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

    int getThreadNum() {
        return _threadNum;
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

**`lock.hpp`:**

```cpp
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
        //std::cout << "加锁成功..." << std::endl;
    }

    ~LockGuard() {
        _mutex->unlock();
        //std::cout << "解锁成功...." << std::endl;
    }

private:
    Mutex* _mutex;
};
```

我们的线程池实现的是 通过向线程池的任务队列添加任务, 然后将任务队列中的任务分配给线程池中的线程.

下面是任务类的代码:

```cpp
#pragma once

#include <iostream>
#include <string>
#include <functional>
#include <pthread.h>
#include <unistd.h>
#include "logMessage.hpp"

// 此例中的任务, 是tcp服务器与客户端通信
// 需要知道 客户端的网络信息, 还需要知道线程需要执行的功能函数
// 因为 此任务是在线程池中让线程执行的. 会在线程的回调函数中 通过此任务类调用, 所以此类还需要知道功能函数
class Task {
public:
    // 包装器 将功能函数包装起来 函数类型: void 函数名(int sock, std::string ip, uint16_t port)
    using callback_t = std::function<void(int, std::string, uint16_t)>;

    Task()
        : _sock(-1)
        , _port(-1) {}

    Task(int sock, std::string ip, uint16_t port, callback_t func)
        : _sock(sock)
        , _ip(ip)
        , _port(port)
        , _func(func) {}

    // 仿函数
    void operator()() {
        logMessage(DEBUG, "线程[%p] 处理 %s:%d 请求 ---开始", pthread_self(), _ip.c_str(), _port);

        _func(_sock, _ip, _port);

        logMessage(DEBUG, "线程[%p] 处理 %s:%d 请求 ---结束", pthread_self(), _ip.c_str(), _port);
    }

    void run() {
        (*this)();
    }

private:
    int _sock;        // 与客户端通信的套接字
    std::string _ip;  // 客户端IP
    uint16_t _port;   // 客户端端口号
    callback_t _func; // 功能回调函数
};
```
这里的任务类, 实际上就是存储有 服务器与客户端通信的套接字、客户端IP、客户端端口号以及服务器的服务函数的一个对象.

我们线程中实现的服务函数是`low2upService()`, 他的参数就是 与客户端通信用的套接字, 客户端IP和客户端端口号.

所以, `task`类的成员变量也就是 这三个外加一个服务函数.

> 此类中, 服务函数 我们用包装器包装起来, 并 将类型名设置为`callback_t`

最后就是服务器的实现了:

**`tcpServer.cc`:**

```cpp
#include "task.hpp"
#include "threadPool.hpp"
#include "util.hpp"

class tcpServer {
public:
	tcpServer(uint16_t port, const std::string& ip = "")
		: _port(port)
		, _ip(ip)
		, _listenSock(-1) {}

	void init() {
		_listenSock = socket(AF_INET, SOCK_STREAM, 0);

		if (_listenSock < 0) {
			logMessage(FATAL, "socket() faild:: %s : %d", strerror(errno), _listenSock);
			exit(SOCKET_ERR);
		}
		logMessage(DEBUG, "socket create success: %d", _listenSock);

		struct sockaddr_in local;
		std::memset(&local, 0, sizeof(local));

		// 填充网络信息
		local.sin_family = AF_INET;
		local.sin_port = htons(_port);
		_ip.empty() ? (local.sin_addr.s_addr = htonl(INADDR_ANY)) : (inet_aton(_ip.c_str(), &local.sin_addr));

		// 绑定网络信息到主机
		if (bind(_listenSock, (const struct sockaddr*)&local, sizeof(local)) == -1) {
			logMessage(FATAL, "bind() faild:: %s : %d", strerror(errno), _listenSock);
			exit(BIND_ERR);
		}
		logMessage(DEBUG, "socket bind success : %d", _listenSock);

		if (listen(_listenSock, 5) == -1) {
			logMessage(FATAL, "listen() faild:: %s : %d", strerror(errno), _listenSock);
			exit(LISTEN_ERR);
		}
		logMessage(DEBUG, "listen success : %d", _listenSock);
		// 开始监听之后, 别的主机就可以发送连接请求了.

		// 线程池版本
		// 服务器初始化时, 要加载线程池
		_tP = threadPool<Task>::getInstance();
	}

	// 服务器初始化完成之后, 就可以启动了
	void loop() {
		// 线程池版本, 在服务器启动时, 也开启线程池
		_tP->start();
		logMessage(DEBUG, "threadPool start success, thread num: %d", _tP->getThreadNum());

		while (true) {
			struct sockaddr_in peer;		  // 输出型参数 接受所连接主机客户端网络信息
			socklen_t peerLen = sizeof(peer); // 输入输出型参数

			// 使用 accept() 接口, 接受来自其他网络客户端的连接
			int serviceSock = accept(_listenSock, (struct sockaddr*)&peer, &peerLen);
			if (serviceSock == -1) {
				logMessage(WARINING, "accept() faild:: %s : %d", strerror(errno), serviceSock);
				continue;
			}
			// 走到这里, 就表示连接成功了
			uint16_t peerPort = ntohs(peer.sin_port);
			std::string peerIP = inet_ntoa(peer.sin_addr);
			logMessage(DEBUG, "accept success: [%s: %d] | %d ", peerIP.c_str(), peerPort, serviceSock);

			// 连接到客户端之后, 就可以执行功能了
			// 线程池版本
			// v1
			Task t(serviceSock, peerIP, peerPort,
				   std::bind(&tcpServer::low2upService, this, std::placeholders::_1, std::placeholders::_2,
							 std::placeholders::_3));
			_tP->pushTask(t);
		}
	}

	void low2upService(int sock, const std::string& clientIP, const uint16_t& clientPort) {
		assert(sock > 0);
		assert(!clientIP.empty());

		char inbuffer[BUFFER_SIZE];
		while (true) {
			ssize_t s = read(sock, inbuffer, sizeof(inbuffer) - 1);
			if (s > 0) {
				// 大于零 就是读取到数据了
				inbuffer[s] = '\0';
				if (strcasecmp(inbuffer, "quit") == 0) { // strcasecmp 忽略大小写比较
					logMessage(DEBUG, "Client requests to quit: [%s: %d]", clientIP.c_str(), clientPort);
					break;
				}
				// 走到这里 就可以进行小写转大写了
				logMessage(DEBUG, "low2up before: [%s: %d] >> %s", clientIP.c_str(), clientPort, inbuffer);
				for (int i = 0; i < s; i++) {
					if (isalpha(inbuffer[i]) && islower(inbuffer[i]))
						inbuffer[i] = toupper(inbuffer[i]);
				}
				logMessage(DEBUG, "low2up after: [%s: %d] >> %s", clientIP.c_str(), clientPort, inbuffer);

				write(sock, inbuffer, strlen(inbuffer));
			}
			else if (s == 0) {
				logMessage(DEBUG, "Client has quited: [%s: %d]", clientIP.c_str(), clientPort);
				break;
			}
			else {
				// 到这里 本次 read() 出错
				logMessage(DEBUG, "Client [%s: %d] read:: %s", clientIP.c_str(), clientPort, strerror(errno));
				break;
			}
		}
		// 走到这里 循环已经退出了, 表示 client 也已经退出了
		close(sock);
		logMessage(DEBUG, "Service close %d sockFd", sock);
	}

private:
	uint16_t _port; // 端口号
	std::string _ip;
	int _listenSock; // 服务器套接字文件描述符
	threadPool<Task>* _tP;
};

void Usage(std::string proc) {
	std::cerr << "Usage:: \n\t" << proc << " port ip" << std::endl;
	std::cerr << "example:: \n\t" << proc << " 8080 127.0.0.1" << std::endl;
}

int main(int argc, char* argv[]) {
	if (argc != 3 && argc != 2) {
		Usage(argv[0]);
		exit(USE_ERR);
	}
	uint16_t port = atoi(argv[1]);
	std::string ip;
	if (argc == 3) {
		ip = argv[2];
	}

	tcpServer svr(port, ip);

	svr.init();
	svr.loop();

	return 0;
}
```

实现过线程池之后, 服务器的实现就很简单.

而且, 由于使用了线程池 `tcpServer`类中, 不再涉及线程的相关内容.

改动几个地方:

1. 类中添加线程池 成员变量:

    ![|wide](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/202307152114816.webp)

2. 初始化时 加载线程池:

    ![|wide](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/202307152117369.webp)

3. 开启服务器时, 开启线程池.

    并且, 在原本该创建线程服务客户端时, 创建任务 并添加到线程池中:

    ![|wide](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/202307152122514.webp)

    这里构造任务对象时, 第四个参数使用了`std::bind()`C++标准库函数.

    此函数在博主[另一篇文章](https://www.humid1ch.cn/posts/C++11-Characteristic_II)有过介绍, 本篇文章就不赘述了

    使用`std::bind()`原因是, 服务函数`low2upService()`是类内函数, 不通过类对象是无法正常调用的.

这些内容实现之后, 就可以使用线程池服务客户端了:

![](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/202308211613293.gif)

---

这就是本篇文章的全部内容啦~

感谢阅读~
