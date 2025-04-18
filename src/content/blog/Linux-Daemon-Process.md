---
draft: true
title: "[Linux] 守护进程介绍、服务器的部署、日志文件..."
pubDate: "2023-07-17"
description: '我们使用的系统中, 一般以服务器的方式工作 对外提供服务的服务器, 都是以守护进程的方式在系统中工作的
比如, 我们使用Linux服务器时, 大多都会使用一些终端软件通过ssh远程连接服务器使用
守护进程, 一旦启动之后. 除非用户手动关闭, 否则不会被关闭 会一直运行'
image: https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/202307172256122.webp
categories: ['tech']
tags: ["Linux网络", "服务器"]
---

# 守护进程

我们使用的系统中, 一般以服务器的方式工作 对外提供服务的服务器, 都是以守护进程的方式在系统中工作的.

比如, 我们使用Linux服务器时, 大多都会使用一些终端软件通过`ssh`远程连接服务器使用.

这就是因为, Linux服务器中 通常默认运行着 **`ssh`服务器的守护进程**:

![](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/202307180953522.webp)

守护进程, 一旦启动之后. **除非用户手动关闭, 否则不会被关闭 会一直运行**.

## 有关进程的属性标识符

`ps ajx |head -1`可以打印出进程相关的头栏:

![|inline](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/202307180954498.webp)

简单介绍一下头栏的属性标识符是什么意思:

1. `PPID`: 父进程ID

2. `PID`: 进程ID

3. `PGID`: 进程组ID

    什么是进程组?

    我们为了做某些操作而创建的一系列进程, 即组成一个进程组.

    比如, 我们执行`sleep 1000 | sleep 2000 | sleep 3000 &`创建一个后台进程之后, 再查看进程的信息:

    ![|wide](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/202307180955608.webp)

    可以发现 现在系统中已经存在了3个`sleep`进程, 并且这三个进程具有相同的`PGID`. 也就是说, 这三个`sleep`是一个进程组的. 并且, 创建一个进程组 其第一个创建的进程就是一个进程组的组长. `PGID`即为组长的`PID`

    在此例中, 进程组组长即为`sleep 1000`, 所以`PGID`即为其`PID`.

    此时, 使用`jobs`查看当前任务, 就可以看到只有一组进程:

    ![|wide](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/202307180955215.webp)

4. `SID`: 会话ID

    什么是会话呢? 我们使用终端软件并使用`ssh`连接Linux服务器之后, 就会创建一个会话
    
    一个会话, 可以有多个进程组, 必须有且只有一个 **前台进程组** 和 0个或多个 **后台进程组**
    
    反过来, 当我们登录Linux服务器时 会创建一系列的进程组, 这些进程组构建成了一个会话.
    
    而, Windows也是一样的, 当我们登录Windows用户 就会由Windows启动左面环境并创建一个会话. 你可以在这个会话中启动任何软件, 并且 一般启动的软件都是属于这个会话的. 而且, 有时候认为Windows很卡了, 可能就会重启或者注销一下. **注销操作其实就是关闭此次的会话, 并关闭当前会话的进程**.
    
    那么, 为什么必须有一个前台进程组呢?
    
    要知道, 如果使用的是Windows, 那么系统启动之后就必须先启动一套可以供用户使用操作的桌面环境.
    
    而Linux无桌面环境的话, 启动时 就必须要先启动一个可以供用户使用的命令行解释器, 比如`bash`或者`zsh`, 否则整个系统就无法正常使用了.
    
    而 **会话 就是桌面环境或者命令行解释器构建的**.
    
    并且, **一个会话 任何时刻只能存在一个前台进程组**
    
    举个例子:
    
    ![|wide](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/202307181059631.webp)
    
    此例中, 使用`sleep 1000 | sleep 2000 | sleep 3000 &`创建的进程的`SID`都是5242
    
    这里的5242是什么呢?
    
    ![|wide](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/202307181104745.webp)
    
    `5242`即为`zsh`的`PID`, 并且可以看到`zsh`自成一族且为自己进程组的组长
    
    并且, 其`PID`即为会话ID, 即 **`zsh`即为会话首进程**, 本次的会话由`zsh`创建, 并成为会话的前台进程组
    
    后续, 我们通过命令行解释器 启动进程或者任务, 那么启动的这些进程或任务 也都属于`zsh`这个会话
    
    ---
    
    此时`jobs`:
    
    ![|wide](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/202307181116508.webp)
    
    当我们使用 `fg 1`, 将其提到前台, 我们再尝试输入命令, 就无法正常执行了:
    
    ![|wide](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/202307181118787.webp)
    
    这是因为, 当把`sleep 1000 | sleep 2000 | sleep 3000 &`提到前台, 由于一个会话只能有一个前台进程组(有且只能有一个进程组处于前台), 此时的前台进程组成了它, 而不是`zsh`这个命令行解释器.
    
    没有了命令行解释器, 就没有办法使用命令

## 什么是守护进程

了解了这部分内容之后. 我们在使用Linux时, **在命令行中启动一个进程**, 就可以理解为 **在会话中启动一个进程组**

并且, 此会话中的进程 执行`fork()`创建的子进程, 一般而言 也都属于这个会话

属于会话的进程在关闭终端时, 会受到一定的影响, 大部分都是关闭了. 

而 一个网络服务通常是不能被其他会话影响的, 所以 一个网络服务通常被设置脱离其他会话, 自己形成一个新的会话. 这样, 除非用户手动关闭, 否则此进程就不会被关闭.

就像`sshd`:

![](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/202307181129461.webp)

自己创建一个会话, 自己就是会话首进程, 自己是一个进程组.

这样的进程, 就被称为 **守护进程 或 精灵进程**

## 如何实现守护进程(服务器部署)

了解了什么是守护进程, 如何将我们服务器进程设置为守护进程呢?

### 1. `setsid()`

让进程成为守护进程很简单, 只需要执行`setsid()`就可以让当前进程创建一个独立的会话, 成为守护进程

不过, `setsid()`有一个非常重要的执行条件就是 **执行进程不能是进程组组长**

进程组组长是进程组的管理者. 如果是一个进程组组长要创建新会话, 那么进程组的其他成员该怎么办呢?

进程组的组长不能调用`setsid()`, 那么一个进程该如何调用呢?

其实很简单, `fork()`之后, 再让子进程调用就可以了, 因为此时的子进程是进程组的第二个进程.

所以, 创建守护进程的方式就是:

```cpp
if(fork() > 0)
    exit(0);
setsid();
```

此时, 就是子进程执行的`setsid()`, 也就可以成功设置守护进程, 不过需要注意的是 服务器的功能实现都要让子进程执行.

这是用此方法设置一个守护进程必须要做的事情.

其次就是一些可做可不做的事情:

1. 忽略 **`SIGPIPE`** 信号

    在使用管道时, 如果读端关闭, 写端会被终止也被关闭. 终止信号就是 **`SIGPIPE`**

    都是流式通信, TCP服务器也是这样的. 所以 TCP服务器可以设置忽略 **`SIGPIPE`** 信号

2. 改变进程工作路径

3. 关闭`0`、`1`、`2`文件描述符 或 将其重定向到 `/dev/null`

    `0`为标准输入, `1`为标准输出, `2`为标准错误

    因为, 当一个进程成为守护进程之后 就脱离了终端会话. 与 标准输入、输出、错误 不再有关系了.

    所以, 可能会关闭`0`、`1`、`2`. 但是很少这么做.

    更多的是将三个文件描述符重定向到`/dev/null`这个文件中. 此文件是Linux中的 **数据垃圾桶**, 向此文件中写入的内容 都会被丢弃. 

    ![|wide](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/202307181459050.webp)

    无论向`/dev/null`输入多少内容, 都会被丢弃

    大多都会打开`/dev/null`文件, 然后将`0`、`1`、`2`都重定向到打开的文件.

那么, 只需要一个函数就可以让进程设置为守护进程:

**`daemonize.hpp`:**

```cpp
#pragma once

#include <iostream>
#include <cstdio>
#include <signal.h>
#include <unistd.h>
#include <sys/types.h>
#include <sys/stat.h>
#include <fcntl.h>

void daemonize() {
    int fd = 0;

    // 1. 忽略SIGPIPE
    signal(SIGPIPE, SIG_IGN);
    // 2. 改变工作路径
    //chdir(const char *__path);
    // 3. 不要成为进程组组长
    if (fork() > 0) {
        exit(0);
    }
    // 4. 创建独立会话
    setsid();
    // 重定向文件描述符0 1 2
    if ((fd = open("/dev/null", O_RDWR)) != -1) { // 执行成功fd大概率为3
        dup2(fd, STDIN_FILENO);
        dup2(fd, STDOUT_FILENO);
        dup2(fd, STDERR_FILENO);

        // dup2三个标准流之后, fd就没有用了
        if (fd > STDERR_FILENO) {
            close(fd);
        }
    }
}
```

然后我们就可以使用`daemonize()`函数将服务器(之前编写的的TCP服务器)设置为守护进程:

> 此服务器的具体实现, 请阅读博主文章:
>
> [[Linux] 网络编程 - 初见TCP套接字编程](https://www.humid1ch.cn/posts/Linux-Network-TCPSocket_I)

**`tcpServer.cc`:**

```cpp
#include "util.hpp"
#include "threadPool.hpp"
#include "task.hpp"
#include "daemonize.hpp"

class tcpServer {
public:
    tcpServer(uint16_t port, const std::string& ip = "")
        : _port(port)
        , _ip(ip)
        , _listenSock(-1) {}

    void init() {
        // 先创建套接字文件描述符
        // 不过, 与UDP不同的是 TCP是面向字节流的, 所以套接字数据类型 要使用 流式套接字
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
        //signal(SIGCHLD, SIG_IGN); // 忽略子进程推出信号, 子进程退出时就会自动回收

        // 线程池版本, 在服务器启动时, 也开启线程池
        _tP->start();
        logMessage(DEBUG, "threadPool start success, thread num: %d", _tP->getThreadNum());
        while (true) {
            struct sockaddr_in peer;          // 输出型参数 接受所连接主机客户端网络信息
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

            // 连接到客户端之后, 就可以执行功能了
            // 执行转换功能 小写转大写
            // 线程池版本
            Task t(serviceSock, peerIP, peerPort, std::bind(&tcpServer::low2upService, this, std::placeholders::_1, std::placeholders::_2, std::placeholders::_3));
            _tP->pushTask(t);
        }
    }

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

    daemonize(); // 守护进程

    tcpServer svr(port, ip);

    svr.init();
    svr.loop();

    return 0;
}
```

在启动服务器之前, 配置好服务器信息之后, 执行`daemonize()`函数. 然后 再编译代码运行程序:

![](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/202308211607962.gif)

可以看到, 即使启动服务器时的会话关闭了, 服务器依然在运行中. 客户端依旧可以连接到服务器

> 这其实就是将服务器部署好了. 只要不关机, 正常情况下就可以一直向服务器申请连接.

而, 如果没有设置守护进程:

![](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/202308211607394.gif)

就会发现 当前会话关闭之后, 服务器就随着会话退出了. 此时客户端就连接不上服务器了.

### 2. `daemon`

上面介绍了直接使用`setsid()`设置守护进程

另外, Linux操作系统还提供了另外的系统调用:`daemon()`

`daemon()`可以一键完成`fork()`、`setsid()`以及重定向文件描述符的操作

![](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/202307181618440.webp)

不过 还是更推荐上一种方式, 因为可以更加灵活的设置守护进程.

### 3. `nohup`

`nohub`是一个系统命令, 可以设置进程为不挂起状态.

也就让进程成为了守护进程.

# 优化日志

当进程设置为守护进程之后, 进程就与终端的输入输出无关了

这又出现了一个问题, 服务器像屏幕中打印的日志不是看不到了吗?

所以, 需要将日志优化一下. 将 日志输出到文件中:

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
#include <unistd.h>
#include <sys/types.h>
#include <sys/stat.h>
#include <fcntl.h>

// 宏定义 四个日志等级
#define DEBUG 0
#define NOTICE 1
#define WARINING 2
#define FATAL 3

#define LOGFILEPATH "serverLog.log"

const char* log_level[] = {"DEBUG", "NOTICE", "WARINING", "FATAL"};

class log {
public:
    log()
        : _logFd(-1) {}

    void enable() {
        umask(0);

        _logFd = open(LOGFILEPATH, O_WRONLY | O_CREAT | O_APPEND, 0666);
        assert(_logFd != -1);
        dup2(_logFd, STDOUT_FILENO);
        dup2(_logFd, STDERR_FILENO);
    }

    ~log() {
        if (_logFd != -1) {
            // 将系统缓冲区内容刷入文件
            fsync(_logFd);
            close(_logFd);
        }
    }

private:
    int _logFd;
};

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
    if (nC) {
        *nC = '\0';
    }
    fprintf(out, "%s | %s | %s | %s\n",
            log_level[level],
            localTmStr,
            name == nullptr ? "unknow" : name,
            logInfo);

    // 将C缓冲区的内容 刷入系统
    fflush(out);
    // 将系统缓冲区的内容 刷入文件
    fsync(fileno(out));
}
```

优化过之后, 再服务器中定义一个`log`类就可以了:

![|inline](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/202307181646405.webp)

然后, 再运行服务器, 就可以看当前目录下创建了一个文件:

![](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/202308211607397.gif)

---

感谢阅读~

![|tiny](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/%E7%BF%BB%E6%BB%9A%E5%B0%8F%E7%8C%AB.gif)
