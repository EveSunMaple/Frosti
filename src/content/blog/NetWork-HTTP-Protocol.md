---
draft: true
title: "[TCP/IP] 应用层代表协议--HTTP协议分析: 什么是url、http协议的请求和响应格式、如何响应文本或文件、http协议的GET和POST以及其他方法、状态码、重定向、什么是Cookie..."
pubDate: "2023-07-27"
description: "应用层协议实际是规定应用层在传输数据时需要遵循的一系列规则和标准. 如果都需要每个程序员都自己制定自己的协议 是非常麻烦的. 所以其他程序猿所写的非常好用的协议, 就会形成一个应用层特定的协议的标准, 本文的内容就是介绍一个非常重要的应用层协议HTTP协议"
image: https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/202307311030910.webp
categories: ['tech']
tags: ["Linux网络", "TCP-IP", "应用层", "协议", "HTTP"]
---

应用层协议实际是规定应用层在传输数据时需要遵循的一系列规则和标准

并且, 协议都是程序员制定的的

上一篇文章中, 为实现一个简单的网络计算器制定了一个简单的协议

虽然需要实现的功能非常的简单, 但是还是做了非常多的工.

而网络上需要传输的数据是非常多非常复杂的: 比如一个视频、图片、网页等资源

如果都需要每个程序员都自己制定自己的协议, 那是非常麻烦的

所以, 一些其他程序猿所写的非常好用的协议, 就会形成一个应用层特定的协议的标准

然后就可以直接供所有有需求的程序猿使用

比如应用层用的非常多的一些协议: `HTTP` `HTTPS` `FTP` `SMTP` `DNS` `...`

接下来要做的就是, 学习理解优秀的协议的一些使用和实现细节

# HTTP协议

平时使用浏览器时, 我们会访问一些网站:`CSDN`、`百度`、`Gitee`等

访问这些网站, 是通过网址访问的, 比如: `www.baidu.com`

但是我们访问网站之后, 再从网址栏复制网址 会发现多了一些东西:

![|inline](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/202307271036499.webp)

除了, `www.baidu.com` 前面还多出了`https://`, 我们看到的多出的一部分, 就是协议的部分

## `url`

平时我们提到的网址, 就是`url`.

一个完整的`url`结构是这样的:

**`http://user:pass@www.example.jp:80/dir/index.html?uid=1#ch1`**

![](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/202307271112101.webp)

其中最开始的部分就是表示协议, 不过我们当前的大部分网站使用的都是`HTTPS`了, 而不是`HTTP`

并且之后, 是需要填写登录信息的, 不过现在已经看不到了

现在都是以一个单独的网页或窗口的形式 输入账号密码登录, 然后像服务端发送请求, 再转换到`url`中再隐藏起来:

![](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/image-20230821152432217.webp)

之后就是`域名`和`端口号`

其中 使用域名访问网站时 是会被转换成对应的IP的, 也必须如此, 后面就是端口

`IP:Port`可以确定网络中的一个服务器.

但是, 在我们平常访问网站时**浏览器中显示的时候端口号是被隐藏的**

但是真正访问网站的时候, **端口号是必须要传入的**

那么也就是说, 在使用确定的协议时 在显示上 端口号是缺省的

那么, 通过浏览器访问指定的网站的时候, **浏览器必须自动为其添加端口号**

这就要介绍另外一个问题了, 浏览器如何知道端口号呢?

实际上, 一些众所周知的协议的服务, 端口号都是强绑定的

比如: `HTTP`是`80`, `HTTPS`是`443`, `ssh`服务则是`22`...

这些可以说是约定成俗的, 操作系统会将系统中的端口号预留出来不让其他服务使用

就好比生活中的电话: `110`是警察, `119`就是火警, `120`就是急救...

指明了协议以及域名和端口号, 就可以访问网站了

### `HTTP`和`HTTPS`的作用

我们在网络上查看、阅读的各种内容, 都是以网页的形式展现出来的, 主要都是`html`文件

比如这样:

![](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/202307281056882.webp)

执行`wget www.baidu.com`就可以直接获取到一个`index.html`文件. 文件的内容:

![](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/202307281056768.webp)

这就是百度首页面的`html`文件, 就是这个`html`文件, 呈现出了百度的首页

这样看来, `HTTP`和`HTTPS`好像是用来获取网页资源的, 或者说, 是用来传输文件资源的

大概的流程就是, 本地使用`HTTP`或`HTTPS`协议向服务器发送 获取资源请求, 服务器将资源传输回来, 本地再接收就可以了

除了网页资源, 我们在网上查看的视频、图片都是文件, 都可以通过`HTTP`和`HTTPS`协议传输

这也就是为什么, `HTTP`和`HTTPS`被称为**超文本传输协议**, 不过`HTTPS`是更加安全的

即, **`HTTP`协议是向特定的服务器申请某种文件资源, 并获取到本地 然后进行展示或使用的传输协议**

一般来说通过协议所申请的**文件都在网络服务器(软件)所在的服务器中存储着**, 如果没有在服务器中存储, 那就无法获取资源

不过, 一般来说服务器中的文件是非常的多的

此时, `url`中表示路径的部分, 就派上用场了

即, `url`中 紧挨着域名以及端口 表示文件路径的部分, 就表示这此次所申请的文件资源在服务器中的路径

这里路径的 第一个目录不是服务器的根目录, 而是设置的**`web`根目录**

而服务器大多都是`Linux`系统, 所以这也是为什么`url`中表示路径的部分使用的是`/`作为分隔符, 因为`Linux`中路径分隔符就是`/`:

![|inline](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/202307281527070.webp)

又比如在CSDN中的一篇文章:

![|inline](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/202307281530736.webp)

就是CSDN的服务器中的某个用户名目录下的层层目录的中的某个编好号文件

通过浏览器, 使用`HTTPS`协议向服务器中获取某个文件, 获取到了就在页面中展示出来

如果没有获取到, 一般会收到另一个文件内容:

![](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/202307281534665.webp)

> 既然获取的是文件资源, C/C++又提供了文件打开读取等功能
>
> 那么获取文件资源的过程其实就是, 接收到请求之后 根据提供的文件路径文件名找到文件, 然后打开
>
> 打开之后, 读取文件内容, 再将文件内容响应回客户端就可以了

理解了`HTTP`和`HTTPS`协议的作用以及, `url`的结构 再结合`url`的全称, 一下子就可以理解, `url`是什么

`url: Uniform Resource Locator, 统一资源定位符`

### `urlencode`和`urldecode`

在`url`的内容中 像`/` `?` `#`这样的字符, 已经有一种特殊的作用了, 所以这些字符不能随意的出现

那么, 如果`url`某个参数中带有特殊的字符, 就需要对特殊的字符进行编码 和 解码

除了特殊的字符, 还有文字等

`url`中 针对需要进行编码的符号的 编码规则是: 

1. 针对ASCII码表中的符号, 可以直接转换成16进制, 然后从右到左, 取4位(不足4位直接处理), 每2位当作1位, 前面加上`%`, 编码成`%XY`格式
2. 针对非ASCII码表中的符号、文字等, 先 其它规则进行编码 再对其他规则的编码16进制结果的每字节数据前加上`%`. 编码成多个`%XY`的格式

比如:

![](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/202307281700316.webp)

百度搜索`C++`, 在`url`中就显示为`C%2B%2B` `2B`就是`+`的16进制形式

`https://www.baidu.com/s?wd=C%2B%2B&rsv_spt=1&rsv_iqid=0xfdc1da9500081925&issp=1&f=8&rsv_bp=1&rsv_idx=2&ie=utf-8&rqlang=cn&tn=baiduhome_pg&rsv_enter=1&rsv_dl=tb&oq=%2526lt%253B%252B%252B&rsv_btype=t&inputT=1&rsv_t=b33aMahumMWox0zFsNrY2he0Sn8D%2BQ4jTCh9Kdwti9jiIQq4qTDXa%2F09UiGMOLpg%2Bgds&rsv_pq=8dec283100024fa3&rsv_sug3=30&rsv_sug1=23&rsv_sug7=100&rsv_sug2=0&rsv_sug4=340`

其中, `wd=C%2B%2B`就表示搜索的`C++`

或是:

![](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/202307281700927.webp)

百度搜索`博客`, 在`url`中好像还是显示`博客`, 不过当复制出来:

`https://www.baidu.com/s?wd=%E5%8D%9A%E5%AE%A2&rsv_spt=1&rsv_iqid=0xfdc1da9500081925&issp=1&f=8&rsv_bp=1&rsv_idx=2&ie=utf-8&rqlang=cn&tn=baiduhome_pg&rsv_enter=1&rsv_dl=tb&oq=%25E5%258D%259A%25E5%25AE%25A2&rsv_btype=t&inputT=1&rsv_t=48ffg6adF8KNYYP%2FQwg32HXkloqBfmRVDmN1V%2FLz0OMTPukALMBn7Iysz215bHNcwDNC&rsv_pq=e981c6280006c3e4&rsv_sug3=50&rsv_sug1=36&rsv_sug7=100&rsv_sug2=0&rsv_sug4=407&rsv_sug=1`

就会发现, `wd=%E5%8D%9A%E5%AE%A2`, 博客就通过其他的方式编码成了`%XY`的格式

## `HTTP`协议请求格式

`HTTP`协议的请求是**字符串**, 由**4部分组成, 每一部分由单行或多行组成. 每行以`\r\n`区分**

`http request`:

1. 第一行自成一部分: 

    **请求行**, 内容是 **请求方法 `url` `HTTP`协议版本**

    ![|wide](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/202307290959492.webp)

    这里的`url`可以只是完整`url`中资源的路径, 也可以是一个完整的`url`

2. 第二部分由多行组成:

    **请求报头**, 内容是请求的各种属性. 每行结构为:`key: value`. 

    ![|wide](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/202307291017682.webp)

3. 第三部分是单独一行的`\r\n`

    用来表示报头部分读取完毕:

    ![|wide](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/202307291018613.webp)

4. 第四部分则是需要请求的资源的有效载荷, 也是请求资源的正文部分

    ![|wide](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/202307291032951.webp)

将这四部分组合起来, 就是一个完整的`http requst`:

![](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/202307291033747.webp)

按照协议填充字符串之后, 就可以向服务器发送 进行资源请求了

## `HTTP`协议响应格式

与请求格式相同, `HTTP`协议的响应格式也是 **字符串**

同样是由 **4部分组成, 每一部分由单行或多行组成. 每行以`\r\n`区分**

`http request`:

1. 第一行自成一部分: 

    **响应行**, 内容是 **`HTTP`协议版本 状态码 状态码描述**

    ![|wide](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/202307291037391.webp)

    状态码即为, 请求的状态. 状态码描述即为, 对状态码的解释

2. 第二部分同样由多行组成:

    **响应报头**, 内容是响应正文的各种属性, 每行结构为:`key: value`

    ![|wide](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/202307291038451.webp)

3. 第三部分是单独一行的`\r\n`

    用来表示报头部分读取完毕:

    ![|wide](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/202307291018613.webp)

4. 第四部分则是需要响应回客户端的资源的有效载荷, 也是资源的正文部分

    ![|wide](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/202307291039594.webp)

将这四部分组合起来, 就是一个完整的`http requst`:

![](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/202307291040189.webp)

按照协议填充字符串之后, 就可以响应回客户端了

## 查看`HTTP`协议格式

`HTTP`协议的格式如上述所介绍的内容.

不过也可以 更加直观 具体的看一下请求和响应的内容:

1. 使用这些代码, 可以看到请求的内容:

    **`logMessage`:**

    ```cpp
    #pragma once
    
    #include <cassert>
    #include <cerrno>
    #include <cstdarg>
    #include <cstdio>
    #include <cstdlib>
    #include <cstring>
    #include <ctime>
    #include <fcntl.h>
    #include <sys/stat.h>
    #include <sys/types.h>
    #include <unistd.h>
    
    // 宏定义 四个日志等级
    #define DEBUG 0
    #define NOTICE 1
    #define WARINING 2
    #define FATAL 3
    
    const char* log_level[] = {"DEBUG", "NOTICE", "WARINING", "FATAL"};
    
    // 日志消息打印接口
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
        fprintf(out, "%s | %s | %s | %s\n", log_level[level], localTmStr,
                name == nullptr ? "unknow" : name, logInfo);
    
        // 将C缓冲区的内容 刷入系统
        fflush(out);
        // 将系统缓冲区的内容 刷入文件
        fsync(fileno(out));
    }
    ```

    **`tcpServer.hpp`:**

    ```cpp
    #pragma once
    
    #include <iostream>
    #include <string>
    #include <cstdlib>
    #include <cstring>
    #include <unistd.h>
    #include <signal.h>
    #include <pthread.h>
    #include <sys/wait.h>
    #include <sys/types.h>
    #include <sys/socket.h>
    #include <netinet/in.h>
    #include <arpa/inet.h>
    
    #include "logMessage.hpp"
    
    #define SOCKET_ERR 1
    #define BIND_ERR 2
    #define LISTEN_ERR 3
    #define USE_ERR 4
    #define CONNECT_ERR 5
    #define FORK_ERR 6
    #define WAIT_ERR 7
    
    void handlerHttpRequest(int sock) {
        char buffer[1024];
        ssize_t s = read(sock, buffer, sizeof buffer - 1);
        if (s > 0) {
            std::cout << buffer << std::endl;
        }
    }
    
    class tcpServer {
    public:
        tcpServer(uint16_t port, const std::string& ip = "")
            : _port(port)
            , _ip(ip)
            , _listenSock(-1) {}
    
        ~tcpServer() {
            if (_listenSock >= 0)
                close(_listenSock);
        }
    
        void init() {
            // 先创建套接字文件描述符
            _listenSock = socket(AF_INET, SOCK_STREAM, 0);
    
            if (_listenSock < 0) {
                logMessage(FATAL, "socket() faild:: %s : %d", strerror(errno), _listenSock);
                exit(SOCKET_ERR); // 创建套接字失败 以 SOCKET_ERR 退出
            }
            logMessage(DEBUG, "socket create success: %d", _listenSock);
    
            struct sockaddr_in local;
            std::memset(&local, 0, sizeof(local));
    
            // 填充网络信息
            local.sin_family = AF_INET;
            local.sin_port = htons(_port);
            _ip.empty() ? (local.sin_addr.s_addr = htonl(INADDR_ANY))
                        : (inet_aton(_ip.c_str(), &local.sin_addr));
    
            // 绑定网络信息到主机
            if (bind(_listenSock, (const struct sockaddr*)&local, sizeof(local)) == -1) {
                // 绑定失败
                logMessage(FATAL, "bind() faild:: %s : %d", strerror(errno), _listenSock);
                exit(BIND_ERR);
            }
            logMessage(DEBUG, "socket bind success : %d", _listenSock);
            // 监听是否有其他主机发来连接请求, 需要用到接口 listen()
            if (listen(_listenSock, 5) == -1) {
                logMessage(FATAL, "listen() faild:: %s : %d", strerror(errno), _listenSock);
                exit(LISTEN_ERR);
            }
            logMessage(DEBUG, "listen success : %d", _listenSock);
        }
    
        // 服务器初始化完成之后, 就可以启动了
        void loop() {
            while (true) {
                struct sockaddr_in peer;          // 输出型参数 接受所连接主机客户端网络信息
                socklen_t peerLen = sizeof(peer); // 输入输出型参数
    
                // 使用 accept() 接口, 接受来自其他网络客户端的连接
                int serviceSock = accept(_listenSock, (struct sockaddr*)&peer, &peerLen);
                if (serviceSock == -1) {
                    logMessage(WARINING, "accept() faild:: %s : %d", strerror(errno), serviceSock);
                    continue;
                }
                // 连接成功之后, 就可以获取到连接客户端的网络信息了:
                uint16_t peerPort = ntohs(peer.sin_port);
                std::string peerIP = inet_ntoa(peer.sin_addr);
                logMessage(DEBUG, "accept success: [%s: %d] | %d ", peerIP.c_str(), peerPort, serviceSock);
    
                pid_t id = fork();
                if (id == 0) {
                    close(_listenSock);
    
                    if (fork() > 0)
                        exit(0);
    
                    handlerHttpRequest(serviceSock);
                    exit(0);
                }
                waitpid(id, nullptr, 0);
    
                close(serviceSock);
            }
        }
    
    private:
        uint16_t _port; // 端口号
        std::string _ip;
        int _listenSock; // 服务器套接字文件描述符
    };
    ```

    **`tcpServer.cc`:**

    ```cpp
    #include "tcpServer.hpp"
    
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

    编译`tcpServer.cc`, 并运行可执行程序之后

    在浏览器输入IP地址 和 端口号, 就可以看到服务器进程接收到了请求, 并打印了出来:

    ![|wide](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/202307291737446.webp)

    其格式为:

    1. 第一行: 

        **请求方法:`GET`、`url`:`/`、`HTTP`协议版本:`HTTP/1.1`**

    2. 之后, 则为请求报头相关内容

    3. 最后添加了一个`\r\n`空行

2. 还可以使用`telnet`连接到服务器之后, 向服务器发送请求, 然后可以看到 响应的内容:

    ![|wide](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/202308211601900.gif)

    ![|wide](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/202307291749607.webp)

    这里相应的有效载荷其实就是百度首页的`html`文件内容

    ![|wide](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/202307291754534.webp)

## 给服务器添加`HTTP`响应

上面我们已经可以使用`HTTP`协议向服务器发送请求了

但是, 因为服务器没有任何的响应, 所以网页是打不开的 没有任何的数据

但是`HTTP`协议的响应格式已经介绍过了, 我们可以按照格式向连接到服务器的客户端进行`HTTP`协议响应

首先可以简单地扩展一下 `tcpServer.hpp`中`handlerHttpRequest()`函数的内容:

```cpp
void handlerHttpRequest(int sock) {
    char buffer[1024];
    ssize_t s = read(sock, buffer, sizeof buffer - 1);
    if (s > 0) {
        std::cout << buffer << std::endl;
    }

    std::string response;
    // 响应行
    response += "HTTP/1.1 200 OK\r\n";
    // 不添加其他报头
    response += "\r\n";

    response += "Hello World!";

    send(sock, response.c_str(), response.size(), 0);
}
```

然后重新编译启动服务器, 在访问服务器:

![](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/202308211601404.gif)

此时就可以看到客户端已经可以接收到服务器相应的资源了.

除了一个简单的字符串, 还可以响应`html`格式的文本, 让浏览器以`html`的渲染显示内容;

还可以直接响应一个文件, 让浏览器渲染展示文件内容

### 响应`html`文本

还是只扩展`handlerHttpRequest()`函数

```cpp
void handlerHttpRequest(int sock) {
    char buffer[1024];
    ssize_t s = read(sock, buffer, sizeof buffer - 1);
    if (s > 0) {
        std::cout << buffer << std::endl;
    }

    std::string response;
    // 响应行
    response += "HTTP/1.1 200 OK\r\n";
    // 不添加其他报头
    response += "\r\n";

    response += "<html><head><meta charset="utf-8"><title>HELLO</title></head><body><h1>标题 HELLO WORLD</h1><p>段落 hello world</p></body></html>";

    send(sock, response.c_str(), response.size(), 0);
}
```

这里使用`html`语法, 设置了: 

1. 网页编码: `utf-8`
2. 网页`title`: `HELLO`
3. 内容1级标题: `标题 HELLO WORLD`
4. 段落: `段落 hello world`

此时, 编译服务器并打开服务器, 再访问服务器:

![](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/202308211601950.gif)

可以看到, 浏览器已经可以按照`html`内容渲染网页

不过, 因为我们没有指定发送的有效载荷的内容是什么类型的, 所以有些浏览器可能不知道有效载荷内容的类型, 没有办法把`html`渲染出来

所以, 我们还可以在报头部分, 添加内容类型为`text/html`: `Centent-Type: text/html\r\n`

```cpp
void handlerHttpRequest(int sock) {
    char buffer[1024];
    ssize_t s = read(sock, buffer, sizeof buffer - 1);
    if (s > 0) {
        std::cout << buffer << std::endl;
    }

    std::string response;
    // 响应行
    response += "HTTP/1.1 200 OK\r\n";
    // 添加内容类型
    response += "Centent-Type: text/html\r\n";
    response += "\r\n";

    response += "<html><head><meta charset="utf-8"><title>HELLO</title></head><body><h1>标题 HELLO WORLD</h1><p>段落 hello world</p></body></html>";

    send(sock, response.c_str(), response.size(), 0);
}
```

然后, 可以先使用GET方法获取一下响应内容, 然后再用浏览器访问:

![](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/202308211624338.gif)

这里就指定了发送的有效载荷的内容是什么类型的了

> 现在的浏览器都会自动识别一些常用的格式类型

除了正文内容的类型, 为保证获取正文内容完整 还需要再报头中添加一个属性: `Content-Length`, 来指明正文内容的长度

所以, 这里的函数还需要改为:

```cpp
void handlerHttpRequest(int sock) {
    char buffer[1024];
    ssize_t s = read(sock, buffer, sizeof buffer - 1);
    if (s > 0) {
        std::cout << buffer << std::endl;
    }

    std::string response;
    std::string html = "<html><head><meta charset=\"utf-8\"><title>HELLO</title></head><body><h1>标题 HELLO WORLD</h1><p>段落 hello world</p></body></html>";
    // 响应行
    response += "HTTP/1.1 200 OK\r\n";
    // 正文内容类型
    response += "Content-Type: text/html\r\n";
    // 正文长度
    response += ("Content-Length: " + std::to_string(html.size()) + "\r\n");
    response += "\r\n";

    response += html;

    send(sock, response.c_str(), response.size(), 0);
}
```

![](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/202308211602654.gif)

### 响应文件内容

上面相应的正文内容, 都是直接在`response`字符串中添加的

但是实际的开发中, 正文内容肯定不是直接添加的 正文内容几乎都是从文件中读取的

因为, 服务器开发都是后端的事情, 如果要显示一个`html`网页 那是前端要做的内容. 如果用户要打开网页, 服务器要做的就是根据用户的请求找到相应的文件并打开. 然后再响应回用户

所以, 要响应文件内容的步骤就是:

1. 服务器接收到 文件资源的请求
2. 服务器从请求中获取文件路径
3. 服务器打开文件
4. 服务器读取文件内容
5. 服务器把文件内容添加在响应中
6. 服务器响应客户端

那么, 问题就来了: 

1. 如何获取文件路径?

    这个简单, `HTTP`协议的请求中, 第一行的第二个字段一般就表示需要请求的文件资源的路径

2. 如何读取文件的内容?

    这个也很简单, 无论是C语言还是C++都提供有文件的相关操作
    
    只需要按照一定的格式打开并读取就可以了

`HTTP`协议请求的第一行的第二个字段表示需要请求的资源的路径

一般是`/dir/index.html`的形式, 第一个`/`表示**`web`根目录**而不是系统的根目录

我们可以创建一个`wwwRoot`目录, 然后再获取请求中 文件资源的路径时, 将此路径添加到文件资源路径之前, 就获取了**`web`根目录**下的某个资源

响应文件, 获取资源路径和读取文件的操作, 可以分开写两个函数:

```cpp
#define CRLF "\r\n"
#define SPACE " "
#define SPACE_LEN strlen(SPACE)
#define HOME_PAGE "index.html"
#define ROOT_PATH "wwwRoot"

std::string getPath(std::string httpRequest) {
    // 要从请求的第一行获取资源路径
    // 所以要先找到请求的第一个`\r\n`
    std::size_t pos = httpRequest.find(CRLF);
    if (pos == std::string::npos) {
        return "";
    }
    // 找到第一行结尾之后, 就可以获取第一行的内容了
    std::string requestFirstLine = httpRequest.substr(0, pos);
    // 获取第一行的内容之后, 取两个空格, 空格之间的内容即为路径
    std::size_t firstSpacePos = requestFirstLine.find_first_of(SPACE);
    if (firstSpacePos == std::string::npos) {
        return "";
    }
    std::size_t secondSpacePos = requestFirstLine.find_last_of(SPACE);
    if (secondSpacePos == std::string::npos) {
        return "";
    }

    std::string path = requestFirstLine.substr(firstSpacePos + SPACE_LEN, secondSpacePos - (firstSpacePos + SPACE_LEN));

    // 如果请求的只有一个 / 那也肯定不能把 web根目录下的所有文件都响应回去
    // 当请求的文件路径是 / 时, 就将主页响应回去 一般为 index.html
    if (path.size() == 1 && path[0] == '/') {
        path += HOME_PAGE;
    }

    return path;
}

std::string readFile(const std::string& recource) {
    std::ifstream in(recource, std::ifstream::binary);
    if (!in.is_open())
        return "404";
    
	// 以二进制方式打开文件, 就需要按字节读取存储
    std::vector<char> buffer(std::istreambuf_iterator<char>(in), {});
    in.close();

    std::string fileContent(buffer.begin(), buffer.end());

    return fileContent;
}
```

然后, 修改一些`handlerHttpRequest()`函数:

```cpp
void handlerHttpRequest(int sock) {
    char buffer[1024];
    ssize_t s = read(sock, buffer, sizeof buffer - 1);
    if (s > 0) {
        std::cout << buffer << std::endl;
    }

    // 获取文件路径
    std::string path = getPath(buffer);
    std::string recource;
    recource += ROOT_PATH;
    recource += path;
    std::cout << recource << std::endl;

    // 获取文件内容
    std::string fileContent = readFile(recource);

    std::string response;
    // 响应行
    response += "HTTP/1.1 200 OK\r\n";
    // 可以根据文件文件的后缀来判断正文内容的类型是什么

    response += "Content-Type: text/html\r\n";
    response += ("Content-Length: " + std::to_string(fileContent.size()) + "\r\n");
    response += "\r\n";

    response += fileContent;

    send(sock, response.c_str(), response.size(), 0);
}
```

这一系列的代码编写完之后, 再运行服务器. 访问服务器时, 默认获取到的资源就是`wwwRoot/index.html`文件

我们可以简单的编写一下`wwwRoot/index.html`文件:

```html
<!doctype html>
<html>
  <meta charset="utf-8" />
  <head>
    <style>
      body {
        line-height: 3em;
        text-align: center;
      }

      p,
      h1,
      h2 {
        margin: 0 auto;
        width: 80%;
      }
    </style>
    <title>July.cc 导航</title>
  </head>

  <body>
    <h1>! 欢迎来到我的网页 !</h1>
    <p>~欢迎来访~</p>

    <img border="2px" src="https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/202307302017964.webp" alt="img-test" width="500px" height="500px"> </img>

    <h2>链接</h2>
    <p>个人博客链接: <a href="http://www.humid1ch.cn">July.cc Blogs</a></p>
  </body>
</html>
```

整个服务器的树形结构是这样的:

```shell
tree
.
├── logMessage.hpp
├── makefile
├── tcpServer
├── tcpServer.cc
├── tcpServer.hpp
└── wwwRoot
    └── index.html
```

此时, 启动服务器:

![](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/202308211602298.gif)

> 这里的图片, 使用的是图床中的图片
>
> 如果要使用本地图片, 需要对图片的二进制内容进行`base64`编码, 然后再进行传输
>
> 还需要对不同类型的文件进行不同的报文添加
>
> 如果是`html`, `Content-Type: text/html`
>
> 如果是`jpg`图片, `Content-Type: image/jpeg`
>
> 如果是`png`图片, `Content-Type: image/png`
>
> 具体的文件对应的`Content-Type`, 可以在网上搜一下 有非常的多

## `GET`与`POST`方法

在日常使用网络时, 最常见的网络行为无非就两种:

1. 需要把远端服务器的资源 获取到本地

    此行为, 就是上面我们使用`GET`获取服务器文件等内容的行为, 涉及到`GET`方法

2. 需要把输入的属性字段, 提交到远端服务器

    就比如在某些网页需要登录账号时, 就需要把输入的内容字段, 提交到远端的服务器中.

    而此行为, 可以通过两个方法实现:`GET`和`POST`

> `GET`与`POST`方法, 可以将输入的属性字段提交到远端服务器
>
> 一般情况下就是输入账号密码等内容
>
> 这就要提到 **表单**. 表单 是`html`的一个元素, 也是一种 允许用户在页面输入数据并将数据提交到服务器进行处理 的一种机制
>
> 基本的语法是:
>
> ```html
> <form action="submit_url" method="post">
> </form>
> ```
>
> `form`即为一个表单, 属性可以设置: 
>
> 1. `action`: 需要提交到的服务器资源的`url`
> 2. `method`: 需要使用的提交方法
>
> 内容则是一些表单元素, 用来供用户输入信息, 并提交

### `GET`方法

我们可以在`wwwRoot/index.html`中添加一个最简单的使用`GET`方法的表单, 用来输入账号和密码:

```html
<!doctype html>
<html>
  <meta charset="utf-8" />
  <head>
    <style>
      body {
        line-height: 3em;
        text-align: center;
      }

      p,
      h1,
      h2 {
        margin: 0 auto;
        width: 80%;
      }
    </style>
    <title>July.cc 导航</title>
  </head>

  <body>
    <h1>! 欢迎来到我的网页 !</h1>
    <p>~欢迎来访~</p>

    <img border="2px" border-radius="10px" src="https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/202307302017964.webp" alt="img-test" width="500px" height="500px"> </img>

    <form action="form/formTest.html" method="GET">
        账号: <input type="text" name="usernm"><br>
        密码: <input type="password" name="passwd"><br>
        <input type="submit" value="提交">
    </form>

    <h2>链接</h2>
    <p>个人博客链接: <a href="http://www.humid1ch.cn">July.cc Blogs</a></p>
  </body>
</html>
```

`form`相关内容, 即为一个表单

分别有两个输入框和一个`submit`按钮

在`index.html`中指定了 `form`使用`GET`方法获取`form/formTest.html`资源, 并提交输入信息. 并且, 还在`form`内添加了名为`usernm`和`passwd`的两个文本输入框.

然后运行并访问服务器:

![](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/202308211624456.gif)

页面多了几个元素, 并且, 在输入内容并点击提交之后

可以从地址框中看到, 尝试获取`form/formTest.html`文件资源, 并在其后添加有`?usernm=123123123&passwd=asdasdasd`, 这部分 是两个文本框的`key=value`值 

**`HTTP`中, `GET`方法会以明文的形式将对应的参数信息 拼接在`url`中**

可以举一个实际的例子:

使用百度网盘加密分享文件时, 一般都需要输入密码:

![](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/202307311524391.webp)

在知道密码的情况下, 可以直接以`pwd=xxxx`的形式将密码拼接在`url`之后, 然后就可以自动填写密码, 直接访问到加密分享的资源:

![](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/202307311530522.webp)

> 所以可以在使用百度网盘加密分享资源时, 直接在`url`后拼接上密码进行分享
>
> 但, 这并不意味着在这个场景中就是使用的`GET`方法, 只是兼容了`GET`方法

### `POST`方法

`POST`方法与`GET`方法, 只有些许的不同, 只需要观察现象就可以分别出来

使用也很简单, 只需要将`form`的`method`属性改为`POST`就可以了:

```html
<!doctype html>
<html>
  <meta charset="utf-8" />
  <head>
    <style>
      body {
        line-height: 3em;
        text-align: center;
      }

      p,
      h1,
      h2 {
        margin: 0 auto;
        width: 80%;
      }
    </style>
    <title>July.cc 导航</title>
  </head>

  <body>
    <h1>! 欢迎来到我的网页 !</h1>
    <p>~欢迎来访~</p>

    <img border="2px" border-radius="10px" src="https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/202307302017964.webp" alt="img-test" width="500px" height="500px"> </img>

    <form action="form/formTest.html" method="POST">
        账号: <input type="text" name="usernm"><br>
        密码: <input type="password" name="passwd"><br>
        <input type="submit" value="提交">
    </form>

    <h2>链接</h2>
    <p>个人博客链接: <a href="http://www.humid1ch.cn">July.cc Blogs</a></p>
  </body>
</html>
```

再次访问服务器, 显示上与`GET`方法是没有区别的.

但是在填写数据并提交之后, 有所不同:

![](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/202308211624863.gif)

使用`POST`方法提交字段, 字段被添加到了请求正文中 而不是`url`中

即, **`HTTP`中, `POST`方法会以明文的形式将对应的参数信息 添加在 请求正文 中**

### `GET`与`POST`对比

`GET`与`POST`方法最明显的区别, 除了名字不同之外, 就是提交时 参数信息存放的位置不同.

1. `GET`方法, 通过`url`传参
2. `POST`方法, 通过正文传参
3. `GET`方法, 传参不私密
4. `POST`方法, 传参相对更私密
5. `HTTP`中, 这两个方法都是明文传参, 都不安全
6. 因为`POST`通过正文传参, 所以较大较多的内容都用`POST`方法传参

### 其他`HTTP`协议方法

`HTTP`协议的方法有很多, 功能各不同, 支持的协议版本也有不同.

除了上面的`GET`和`POST`方法之外, 还有其他的方法:

| 方法          | 功能说明                 | 支持协议版本 |
| ------------- | ------------------------ | ------------ |
| **`PUT`**     | 向服务器传输文件         | 1.0、1.1     |
| **`HEAD`**    | 获得报文首部             | 1.0、1.1     |
| **`DELETE`**  | 删除服务器文件           | 1.0、1.1     |
| **`OPTIONS`** | 查询服务器支持的方法     | 1.1          |
| **`TRACE`**   | 追踪路径                 | 1.1          |
| **`CONNECT`** | 要求使用隧道协议连接代理 | 1.1          |
| **`LINK`**    | 建立与资源之间的联系     | 1.0          |
| **`UNLINK`**  | 断开连接关系             | 1.0          |

这上面的`8`中方法, 一个服务器基本都不会允许用户使用, 最多也是允许 **`OPTIONS`** 

首先是, **`PUT`**和**`DELETE`**

这两个都可以对服务器上的文件进行覆盖或删除, 可能会对服务器文件造成损坏或丢失等问题.

**`TRACE`**, 使用此方法 服务器会将原始的请求报文返回给客户端

一般来说, 原始请求报文中可能会携带有隐私信息等内容

使用 **`TRACE`** 方法会带来安全隐患

其他方法, 则会因为一些占用服务器的资源、影响服务器正常开销等情况, 同样被禁止掉

## `HTTP`协议 状态码

`HTTP`协议的响应中, 报文首行会携带此次请求处理的状态码, 以及状态码描述

常见的状态码一般有:

|           | 类别                             | 原因                       |
| --------- | -------------------------------- | -------------------------- |
| **`1xx`** | `Informational(信息性状态码)`    | 接受的请求正在处理         |
| **`2xx`** | `Success(成功状态码)`            | 请求 正常处理完毕          |
| **`3xx`** | `Redirection(重定向状态码)`      | 需要进行附加操作以完成请求 |
| **`4xx`** | `Client Error(客户端错误状态码)` | 服务器无法处理请求         |
| **`5xx`** | `Server Error(服务器错误状态码)` | 服务器处理请求时发生错误   |

1. **`1xx`**

    一般在请求处理较慢时响应. 告诉客户端请求依然正在处理, 并没有出错, 只是较慢 还没有处理完成

2. **`2xx`**

    就是成功了, 比如`200`, 状态码描述是`OK`

3. **`3xx`**

    重定向相关状态码, 具体情况下面介绍

4. **`4xx`**

    出现`4xx`一般是客户端的请求存在错误

    比如`404(NOT FOUND)`, 找不到请求的资源, 并不是服务器处理的问题, 而是因为请求出错, 请求的资源根本就没有

    **不能赖服务器**

5. **`5xx`**

    这个才是服务器处理请求出错时响应的状态码
    
    比如, 正确接收到了请求, 在打开文件时出错了? 或者处理时出错了? 或者传输时出错了? 
    
    这些问题, 响应的状态码都是`5xx`
    
    比如: `504(Bad Gateway)`, 网关超时 一看就是**服务器在处理时出现了问题**

> 市面上的浏览器, 由于各种内核各种版本
>
> 很可能对协议的支持都不同, 浏览器针对各种页面的渲染效果也可能不同
>
> 而对状态码的解释识别也有可能不同, 所以 服务器的状态码很多没有按照标准设置
>
> 所以还有可能出现 超过`5xx`的状态码 都不稀奇

## `HTTP`常见报头属性

`HTTP`中常见的报头属性 上面内容中已经介绍了两个:

1. `Content-Type: value`, 用来设置本次请求或响应资源的类型
2. `Content-Length: value`, `HTTP`协议是字符串协议. 这个报头属性用来设置, 报文的正文长度

除此之外, 还有:

1. `Host: value`, 用于客户端, 告知服务器, 所请求的资源是在哪个主机的哪个端口上

    ![|wide](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/202307312120415.webp)

2. `User-Agent: value`, 声明用户的操作系统和浏览器版本信息等

    这个属性有什么用呢?

    使用不同的设备, 访问同一个网页时:

    ![PC访问 QQ音乐下载页 |wide](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/202308010038320.webp)

    ![Android访问 QQ音乐下载页 |wide](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/202308010042663.webp)

    某些网页, 会根据设备的不同展示不同的内容. 而设备信息, 就是通过`User-Agent`获取的. 

3. `referer: value`, 用来说明 当前页面是从哪个页面跳转过来的

    什么意思呢?

    ![|wide](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/202308010056816.webp)

### `Location: value` 重定向

`HTTP`状态码中, `3xx`是重定向状态码 

而响应报头中, `Location: value`则是需要与重定向状态码一起使用的一个属性字段

上面对`3xx`状态码的说明是: **需要进行附加操作以完成请求**. 这里的附加操作其实就是`Location`的作用, 此字段的作用是, 告诉客户端接下来要去哪里访问.

重定向状态码常见的有: `301`永久重定向, `302`临时重定向, `307`临时重定向, `308`永久重定向

这里结合`301`和`302`介绍一下`Location`以及重定向

`Location`是响应报头中的属性字段, 是用来告诉客户端接下来要去哪里访问的

并且使用时, 状态码需要设置为重定向

简单的修改一下`handlerHttpRequest()`函数:

```cpp
void handlerHttpRequest(int sock) {
    char buffer[1024];
    ssize_t s = read(sock, buffer, sizeof buffer - 1);
    if (s > 0) {
        std::cout << buffer << std::endl;
    }

    // 获取文件路径
    std::string path = getPath(buffer);
    std::string recource;
    recource += ROOT_PATH;
    recource += path;

    // 获取文件内容
    std::string fileContent = readFile(recource);

    std::string response;
    // 响应行
    //  response += "HTTP/1.1 200 OK\r\n";
    response += "HTTP/1.1 302 Moved Temporarily\r\n";
    response += "Location: www.baidu.com\r\n";
    response += ("Content-Length: " + std::to_string(fileContent.size()) + "\r\n");
    response += "\r\n";

    response += fileContent;

    send(sock, response.c_str(), response.size(), 0);
}
```

设置响应状态码为`302`表示临时重定向, 并添加`Location: www.baidu.com\r\n`, 让客户端接下来访问`www.baidu.com`资源

运行服务器之后, 再访问服务器:

![](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/202308211600182.gif)

可以看到, 访问服务器时 会自动去跳转到`url/www.baidu.com`, 这是因为我们设置了重定向状态码和`Location: www.baidu.com\r\n`.

不过因为没有资源, 并且是从根目录就开始重定向的, 所以会一直尝试获取资源, 就会发生错误

不过, 当我们把`Location`设置成一个携带协议的`url`: `Location: https://www.baidu.com\r\n`

再次访问服务器会出现什么呢?

![](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/202308211600534.gif)

直接跳转到了`https://www.baidu.com`

这就是重定向的作用

重定向究竟是什么呢?

![](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/202308011015487.webp)

结合上图不难得出结论: 重定向是 **将一个URL地址重定向到另一个URL地址的过程**

当浏览器请求一个URL时, 服务器可以将请求重定向到另一个URL, 浏览器会自动跳转到新的URL

接收重定向信息 和 跳转的动作, 一般都是浏览器自动完成的

> 如果`Location`不是一个完整的携带协议的`url`, `Location`就会被看做是一个路径, 此时重定向 是获取原服务器的本地资源

那么, 不同的重定向状态码又有什么区别呢?

从用户体验到的效果来看, 没有明显的区别: 都是将一个`url`自动设置成了另外一个`url`并访问获取资源

但, 对客户端是不同的

重定向的状态码, 可分为**临时重定向**和**永久重定向**两类, 这两类客户端是会做区分的:

1. **临时重定向**

    表示请求的资源已经暂时移动到了另一个`url`

    这时, 浏览器会跳转到新的`url`

    但是, 并不代表旧的`url`以后就无法使用了

    浏览器会继续为原始`url`进行排名, 同时将重定向的`url`视为一个临时的副本

    浏览器会自动跳转到新的`url`, 但会保留原始`url`

    一般用于, 原服务器维护 需要使用另外的临时服务器的情况

2. **永久重定向**

    表示请求的资源已经永久移动到了另一个`url`

    这时, 浏览器同样会跳转到新的`url`
    
    不过, 此时浏览器会将重定向的`url`视为原始`url`的替代品, 并将其用于排名目的
    
    浏览器会自动跳转到新的`url`, 并且不会保留原始`url`

**临时重定向**和**永久重定向**两类中, 又有细分的状态码

不同的状态码, 给浏览器传递的信息也有细微的差别, 不再一一列举, 有兴趣可以搜索一下

### `Cookie` **

`HTTP`协议的特点之一是: **无状态**(同样也是`HTTPS`的特点)

什么是无状态呢? 

简单点来说就是, 使用`HTTP`协议的客户端和服务器, 服务器是**不会维护每个客户端的会话信息**的

每个`HTTP`请求都是独立的, 服务器无法根据前面的请求状态来进行后续处理

服务器只会简单地根据请求发送的信息 响应请求, 而不会跟踪用户的上下文或状态

按这样的特点, 使用`HTTP`或`HTTPS`协议会出现一个非常明显且影响体验的情况: **每次访问需要登录的网页都需要重新登录**

因为, 每个`HTTP`请求都是独立的, 服务器无法根据前面的请求状态来进行后续处理

即, 网页的登录状态是不会被客户端和服务器维护的

但是, 在日常的使用中 并没有出现**每次访问需要登录的网页都需要重新登录**的情况, 大多数网页都"记录"了登录状态

这是因为, 现在已经有很多保持会话状态的策略, 一旦登陆的网页, 就会使用一些策略来实现对会话状态的保持

这里要介绍的就是**`Cookie`策略**

虽然, `HTTP`和`HTTPS`协议原本每次的请求都是独立的

但是, 我们可以**将当前网页的各种状态存储起来**, 等下一次发送请求时, **将状态信息一起发送给服务器**, 让 **服务器直接获取到网页状态并进行验证和响应**, 不就可以实现"记录"登录状态了吗?

这就是**`Cookie`, 它是 浏览器维护的存储信息的小文件, 通常用于在服务器和客户端之间传递数据**

在网页中, 登陆用户时 此次的请求需要携带用户的账号密码发送给服务器, 让服务器可以验证用户信息

服务器响应时, 会将用户信息设置在`Cookie`中, 如果浏览器允许网页存储`Cookie`信息, 浏览器就会将服务器发送过来的`Cookie`存储下来

在之后的客户端请求中, 都会携带已经记录的`Cookie`内容一同发送给服务器

![|inline](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/202308011114650.webp)

我们也可以尝试在服务器的响应中, 使用`Set-Cookie: value`报头字段设置`Cookie`:

```cpp
void handlerHttpRequest(int sock) {
    char buffer[1024];
    ssize_t s = read(sock, buffer, sizeof buffer - 1);
    if (s > 0) {
        std::cout << buffer << std::endl;
    }

    // 获取文件路径
    std::string path = getPath(buffer);
    std::string recource;
    recource += ROOT_PATH;
    recource += path;

    // 获取文件内容
    std::string fileContent = readFile(recource);

    std::string response;
    // 响应行
    response += "HTTP/1.1 200 OK\r\n";
    // 设置Cookie
    response += "Set-Cookie: This is a cookie\r\n";
    response += ("Content-Length: " + std::to_string(fileContent.size()) + "\r\n");
    response += "\r\n";

    response += fileContent;

    send(sock, response.c_str(), response.size(), 0);
}
```

然后, 运行并访问服务器:

首先是没有设置`Cookie`的时候:

![No Cookie](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/202308011121103.webp)

这是服务器设置了`Cookie`的之后:

![Cookie](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/202308011123366.webp)

可以看到, 浏览器已经获取并记录了本网站的`Cookie`.

![](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/202308011125710.webp)

> 现在`Chrome115之后`好像没有办法查看`Cookie`的具体内容了
>
> 只能在请求中看到

#### `Cookie + Session`

`Cookie`可以用来保持会话的状态, 但是它不安全

`Cookie`一般 以文本文件的形式存储在浏览器的内存中 或 系统的磁盘上的, 磁盘上的文本文件是非常容易就被盗取的

并且 `Cookie`因为在请求中以报头字段的形式携带, 也非常容易被截获而获取到`Cookie`内容

> 磁盘上的`Cookie`可以长时间的保存, 浏览器内存中的`Cookie`会在浏览器关闭时被释放而清除

这都是`Cookie`不安全的原因

所以, 现在的浏览器 都是使用`Cookie + Session`的策略来维护网页的会话状态的

`Session`又是什么呢?

`Session`是服务器存储状态信息的一种机制

当用户第一次登录页面时, 请求发送到服务器, 服务器验证之后 会创建一个`Session`来维护用户在此页面的状态信息, `Session`是加密的文件

每一个`Session`的文件名是`Session ID`, 这个`Session ID`在服务器中是唯一的, 是`Session`的唯一标识符

服务器创建了`Session`之后, 会将`Session ID`设置为`Cookie`响应回客户端

客户端收到响应之后, 将存储着`Session ID`的`Cookie`存储起来

在之后的请求中, 携带`Cookie`以便于让服务器正确处理网页状态

![](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/202308011357892.webp)

使用加密的`Session`来维护页面的会话状态 就安全了吗?

如果只是使用加密的`Session`还是不安全的

因为还是可以通过`Cookie`获取`Session ID`, 只要知道了`Session ID`就可以向服务器发送请求 然后盗用状态信息了.

所以, `Session`内还会设置一些安全性的参数, 比如过期时间等

还有就是 服务器不是吃素的, 服务器一般都有防盗系统

如果信息被频繁的异常访问 或 账号在频繁的异常向服务器提交信息

那么用户的账号可能就会被限制或直接冻结, 就像 QQ号被盗了之后, 很可能就会被冻结

**数据在传输时 安全的问题非常重要, 但是 服务器自身的防盗系统也是非常的重要的**

## `HTTP`特性 - 无连接

`HTTP`协议有无状态的特性, 所以要维护会话状态需要使用一些策略

而`HTTP`协议另外的特性之一是, **无连接**

本文的所有实验代码都是基于`TCP`协议的, 而 **`TCP`协议是面向连接的**

那么, **为什么说`HTTP`协议是无连接的?**

**`HTTP`协议只是借用了`TCP`的连接渠道, `HTTP`协议本身是不建立连接的**

一个`TCP`连接中, 可能会存在许多的`HTTP`请求, 它们都是使用了`TCP`的连接, 而不是建立了连接

如果每个请求都会与服务器建立连接, 那该多浪费资源

---

而提到了 一个`TCP`连接中, 可能会存在许多的`HTTP`请求

就要提`HTTP`协议的**长连接**

`HTTP`协议的长连接, 并不是指`HTTP`协议会建立连接, 而是指`TCP`连接

`HTTP`协议主流采用的是`TCP`协议

在我们访问某些网站时, 比如像这样的资讯网站:

![](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/202308011423752.webp)

一个页面是存在非常多的资源的: 各种文字、视频、图片等

这些资源都是需要使用`HTTP`协议向服务器请求的

如果一个页面每个资源的申请都需要重新建立一次`TCP`连接, 需要三次握手四次挥手, 这是非常消耗资源的 

`http1.0`版本就是这样的, 每次发送请求和响应都会先创建一个新的`TCP`连接 并关闭连接

这样的操作被称为`HTTP`短连接

而`http1.1`之后, 则支持长连接了

长连接允许在一次`TCP`连接内, 多次发送请求并响应, 避免了多次创建连接的消耗

> 长连接时, 服务器一般按照发送到请求的顺序进行处理并响应

`http1.1`之前时没有长连接的, 但是`http1.1`又要兼容之前的版本的功能

`HTTP`协议如何区分此次是否支持长连接呢?

答案就是: `Connection: keep-alive`报头字段

如果客户端和服务器双方使用的**都是`http1.1`版本协议**, 并且 请求和响应的 **报头中都存在`Connection: keep-alive`** 字段, 就说明此次连接 **支持长连接**

而如果有一方为 **`http1.0`版本协议**, 或有一方的 **报头中存在`Connection: closed`**, 那就说明此次连接 **不支持长连接**

> 一次`TCP`连接可以发送多个 请求和响应. 就会存在接收到的报文是否完整的问题
>
> 这时候就需要根据`Content-Length: value`字段, 来判断此次接收到的报文是否完整了

---

有关`HTTP`协议的介绍到这里就结束了

感谢阅读~
