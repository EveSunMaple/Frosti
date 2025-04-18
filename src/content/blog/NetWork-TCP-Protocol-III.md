---
draft: true
title: "[TCP/IP] 传输层代表协议--TCP协议介绍(3): TCP协议的'四次挥手'过程、状态分析..."
pubDate: "2024-01-15"
description: "TCP协议是面向连接的, 面向字节流的, 可靠的 传输层协议..."
image: https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/202403200105048.webp
categories: ['tech']
tags: ["Linux网络", "TCP-IP", "传输层", "协议", "TCP"]
---

`TCP`协议是面向连接的

上一篇文章简单分析了`TCP`通信非常重要的建立连接的"三次握手"的过程

本篇文章来分析`TCP`通信中同样非常重要的断开连接的"四次挥手"的过程

# `TCP`的"四次挥手"

`TCP`协议建立连接 需要"三次握手". "三次挥手"完成之后, 连接双方就可以正常通信了

而在通信的最后, `TCP`协议断开连接 需要"四次挥手":

![|huger](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/202401271707265.webp)

从图中看, `TCP`的"四次挥手", 是由 **两端分别发送`FIN`报文, 对端再应答`ACK`报文** 形成的

整个过程是这样的:

1. 先发送`FIN`的一端(主动端A) 在接收到对端(被动端B)的`ACK`之后, 会进入`FIN_WAIT_2`状态, 而不是直接`CLOSED`

2. 并且, B端接收到`FIN`之后, 也没有直接应答`FIN`关闭连接. 而是, 进入了`CLOSE_WAIT`状态

3. 然后, B端才发送了`FIN`报文, 并进入`LAST_ACK`状态, 直到收到A端的`ACK`应答报文

4. A端收到B端发送的`FIN`报文, 并发送`ACK`应答报文之后, 并没有直接进入`CLOSED`状态, 而是先进入了`TIME_WAIT`状态

5. > "四次挥手"的主动发起者, 可以是客户端, 也可以是服务端
    >
    > 所以, "四次挥手"用主动端和被动端来区分状态

可以看到, `TCP`"四次挥手"的过程中, 双方会进入许多的状态:

1. 先发送`FIN`的一端, 会依次进入`FIN_WAIT_1` `FIN_WAIT_2` `TIME_WAIT`, 最后才`CLOSED`
2. 后发送的一端, 则会在接收到`FIN`之后, 依次进入`CLOSE_WAIT` `LAST_WAIT`, 然后才`COLSED`

> 哪一方发送了`FIN`报文, 就表示这一方想要断开连接了, 此端应用层不会再向对端发送数据了

---

那么了解了"四次挥手"的整个过程, 一定会有一个疑问: **A端发送`FIN`报文之后, 为什么B端没有直接应答`FIN`, 而是进入了`CLOSE_WAIT`状态?**

答案是, **为了维护数据传输的可靠性**

A端向B端发送`FIN`报文, 表示A端不准备通信了, 实际也就表示A端应用层不会再向B端发送数据了

但是, A端没有数据发送了, B端却不一定. 毕竟, `TCP`协议是存在发送缓冲区的, 也就是说 B端可能还有数据没有向A端发送呢, 如果直接和A端一起断开连接, 那么还没有发送的数据怎么办?

所以, 虽然A端发送了`FIN`报文, 想要断开连接, 但是B端可能并不想现在据断开连接, 所以就可能不会直接应答`FIN`

即, 当被动端不想直接断开连接时, 就只应答`ACK`报文, 并进入`CLOSE_WAIT`状态

直到, 被动端也没有要发送的数据了, 被动端才会发送`FIN`报文, 并进入`LAST_ACK`状态

> 如果, 主动端发送`FIN`报文时, 被动端也想要断开连接了
>
> 那么, B端就可能会应答`ACK+FIN`的报文
>
> 不过, 这并不是一般情况, 我们还是要讨论一般情况滴

主动端接收到被动端的`FIN`报文之后, 向被动端应答最后一个`ACK`报文, 并进入`TIME_WAIT`状态 持续一段时间后, 正式关闭连接

被动端在收到主动端的`ACK`应答报文之后, 正式关闭连接

## "四次挥手"状态分析

了解了"四次挥手"的大致过程, "四次挥手"过程中 挥手双方 会进入这么多的状态

那么, **双方为什么要进入这么多状态? 这些状态都有什么存在意义?**

下面, 就来解释一下:

**针对主动端:**

1. 主动端(我)发送`FIN`报文之后, 会进入 **`FIN_WAIT_1`** 状态

    **`FIN_WAIT_1`** 状态 的作用

    1. 表示我已经主动发送`FIN`报文, 告诉对端 自己想要断开连接
    2. 防止因网络延迟或其他原因, 我没有收到对端的`ACK`应答报文. 出现此情况, 还需要超时重传`FIN`报文
    3. 进入`FIN_WAIT_1`状态开始, 我就关闭了`TCP`发送缓冲区, 应用层不会再向对端发送数据, 同时让对端也了解到这一点

    此状态持续时间, 取决于什么时候收到对端的`ACK`应答报文

2. 主动端接收到对端的`ACK`报文之后, 会进入 **`FIN_WAIT_2`** 状态

    **`FIN_WAIT_2`** 状态 的作用

    1. 表示我已经收到了对端的`ACK`应答报文
    2. 并了解到 对端还不想关闭连接, 所以 我需要保持`TCP`接收缓冲区不关闭, 保持此端接收数据的功能

    此状态持续时间, 取决于对端什么时候想要关闭连接, 即 什么时候收到对端发送的`FIN`报文

3. 主动端接收到对端的`FIN`报文, 并作出应答之后, 会进入 **`TIME_WAIT`** 状态

    **`TIME_WAIT`** 状态 的作用

    1. 表示我已经收到了对端发送的`FIN`报文, 了解到对端数据也发完了, 对端也想要关闭连接了

    2. 此端也已经发送了`ACK`应答报文, 告诉对端收到了`FIN`报文

    3. 但是, 此状态并不会直接结束, 而是会持续一段时间

        原因一: 对端发送的数据可能还在传输中, 所以并不能马上关闭连接

        原因而: 对端可能没有收到我发送的`ACK`应答, 对端可能还会发送`FIN`报文, 我还得再次`ACK`应答, 保证对端收到了`ACK`之后 正确关闭连接

    此状态持续时间, 不能过长 不能过短, `TCP`协议推荐值为`2*MSL` (后面分析解释)

那么

**针对被动端:**

1. 被动端收到对端的`FIN`报文, 并作出应答之后, 会进入 **`CLOSE_WAIT`** 状态

    **`CLOSE_WAIT`** 状态 的作用

    1. 表示被动端已经收到了对端的`FIN`报文, 知道了对端要关闭连接 并且已经关闭了发送缓冲区 不再给被动端发送数据了

    2. 不过, 被动端暂时还不想关闭连接, `TCP`发送缓冲区内还有数据没有发送完, 所以需要维持`CLOSE_WAIT`状态

    3. 并且, 需要在 对端没有收到`ACK`应答, 再次发送`FIN`报文时, 重新应答`ACK`报文

    4. 还有, 被动端收到了`FIN`报文, 也会向应用层关闭发送缓冲区

        提醒应用层, 将`write()`或`send()`缓冲区里已经存在的数据发走之后, 就不要在发送数据了, 发送缓冲区要关闭了

        不然, 还一直有数据要发送, 还要一直消耗双方资源

    此状态持续时间, 取决于什么时候`TCP`发送缓冲区的数据发完, 并且与`close()`调用有关 (后面分析解释)

2. 被动端数据发送完, 调用`close()` 发送`FIN`报文之后, 会进入 **`LAST_ACK`** 状态

    **`LAST_ACK`** 状态 的作用

    1. 表示被动端已经发送了`FIN`报文, 也要关闭连接了

    2. 等待对端的`ACK`应答报文, 即 需要知道 对端已经收到了被动端的`FIN`报文

        如果长时间没有收到对端的`ACK`应答报文, 被动端需要重新发送`FIN`报文

        所以, 需要维护`LAST_ACK`状态

    直到收到对端的`ACK`应答, 才会关闭连接

在上面这5个状态中, 有2个状态很重要: **被动端的`COLSE_WAIT`** 和 **主动端的`TIME_WAIT`**

并且, 这两种状态也是"四次挥手"过程中, 最容易观察到的

## 观察、分析`CLOSE_WAIT`和`TIME_WAIT`

我们可以实现一个最简单的`TCP`服务器, 并使用`telnet`建立连接查看端口的状态

`tcpServer.cpp`

```cpp
#pragma once

#include <iostream>
#include <string>
#include <cstdio>
#include <cstdlib>
#include <cstring>
#include <unistd.h>
#include <sys/wait.h>
#include <sys/types.h>
#include <sys/socket.h>
#include <netinet/in.h>
#include <arpa/inet.h>

#define SOCKET_ERR  1
#define BIND_ERR    2
#define LISTEN_ERR  3
#define USE_ERR     4
#define CONNECT_ERR 5
#define FORK_ERR    6
#define WAIT_ERR    7

#define BUFFER_SIZE 1024

class tcpServer {
public:
    tcpServer(uint16_t port, const std::string& ip = "")
        : _port(port)
        , _ip(ip)
        , _listenSock(-1) {}

    void init() {
        _listenSock = socket(AF_INET, SOCK_STREAM, 0);

        if (_listenSock < 0) {
            // 套接字文件描述符创建失败
            printf("socket() faild:: %s : %d\n", strerror(errno), _listenSock);
            exit(SOCKET_ERR); // 创建套接字失败 以 SOCKET_ERR 退出
        }
        printf("socket create success: %d\n", _listenSock);

        // 套接字创建成功, 就需要将向 sockaddr_in 里填充网络信息
        struct sockaddr_in local;
        std::memset(&local, 0, sizeof(local));

        // 填充网络信息
        local.sin_family = AF_INET;
        local.sin_port = htons(_port);
        _ip.empty() ? (local.sin_addr.s_addr = htonl(INADDR_ANY)) : (inet_aton(_ip.c_str(), &local.sin_addr));

        // 绑定网络信息到主机
        if (bind(_listenSock, (const struct sockaddr*)&local, sizeof(local)) == -1) {
            printf("bind() faild:: %s : %d\n", strerror(errno), _listenSock);
            exit(BIND_ERR);
        }
        printf("socket bind success : %d\n", _listenSock);

        if (listen(_listenSock, 2) == -1) {
            printf("listen() faild:: %s : %d\n", strerror(errno), _listenSock);
            exit(LISTEN_ERR);
        }
        printf("listen success : %d\n", _listenSock);
        // 开始监听之后, 别的主机就可以发送连接请求了.
    }

    // 服务器初始化完成之后, 就可以启动了
    void loop() {
        while (true) {
            sleep(1);
            struct sockaddr_in peer;          // 输出型参数 接受所连接主机客户端网络信息
            socklen_t peerLen = sizeof(peer); // 输入输出型参数
            
            int serviceSock = accept(_listenSock, (struct sockaddr*)&peer, &peerLen);
            if (serviceSock == -1) {
                printf("accept() faild:: %s : %d\n", strerror(errno), serviceSock);
                continue;
            }
            sleep(120);
	  		close(serviceSock);
        }
    }

private:
    uint16_t _port; // 端口号
    std::string _ip;
    int _listenSock; // 服务器套接字文件描述符
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

这是一个非常简单的`tcpServer`, 编译、运行起来后 就可以对其发起连接了

这个服务器需要注意的是:

1. **`listen(_listenSock, 2)`, `listen()`第二个参数设置为`2`**

2. **`accept()`接口没有被调用, `close()`同样没有被调用**

    如要测试, 请手动注释

### `CLOSE_WAIT`

**`CLOSE_WAIT`是被动端会进入的状态**

将程序编译、运行起来, 使用`telnet`进行连接, 使用`netstat`命令查看状态:

1. 服务器运行起来, 暂时没有建立连接时

    使用`netstat -nlpt`查看, 系统中处于`LISTEN`状态的`TCP`服务

    ![|huger](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/202401282054317.webp)

2. 当使用`telnet`向服务器发起连接之后

    使用`netstat -npt`查看`TCP`服务的连接状态

    ![|wide](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/202401282059635.webp)

    可以看到, 系统维护有 **从客户端到服务端的连接** 和 **从服务端到客户端的连接**, 并且状态都处于`ESTABLISHED`

    这可以说明什么?

    要知道, 上面的服务代码是没有调用`accept()`的 

    **可能很多人认为`accept()`接口是用来同意连接请求的, 但实际并不是的, 因为即使没有调用`accept()`, "三次握手"依然是正常完成了, 双端正常进入了`ESTABLISHED`状态**

    所以, 这个现象说明 **"三次握手"完成与否, 是与应用层是否调用`accept()`无关的**

    并且说明了, **`accept()`接口的功能 只是将内核中已经与客户端建立好的`TCP`连接数据、信息, "拿"到进程中使用**

3. 如果使用`telnet`向服务器发起更多连接(一共4次)

    再次使用`netstat -npt`查看`TCP`服务的连接状态

    ![|wide](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/202401282115992.webp)

    可以看到, `telnet`4次尝试向服务端建立连接, 系统成功建立了3条`TCP`连接

    有1条没有成功建立, 而是 **客户端进入了`SYN_SENT`状态**, 也就表示服务端好像没有应答

    出现这种现象的原因是: **`listen()`的第二个参数设置为了`2`, 并且没有调用`accept()`将建立好的连接拿走**

    > 如果`listen()`的第二个参数设置为1, 那么 就只能成功连接2条
    >
    > 如果`listen()`的第二个参数设置为0, 那么 就只能成功连接1条
    >
    > **前提是不调用`accept()`**
    >
    > 很容易测试, 可以试一下
    >
    > `listen()`第二个参数的具体作用, 就是设置系统中没有被`accept()`的连接数, 此参数不能设置过大, 否则过于占用系统资源
    >
    > 可以看作等待服务器`accept()`的连接的队列

4. 重新使用`telnet`向服务器发起连接, 并且记录从建立连接, 到断开连接, 服务端连接状态的变化

    ![|wide](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/202401282247759.webp)

    可以看到:

    1. 客户端发起连接之后, 服务端和客户端相互维护连接, 均进入`ESTABLISHED`状态

    2. 客户端主动关闭连接之后, 服务端进入`CLOSE_WAIT`状态

    3. 之后, 如果服务端没有停止运行, 服务端会一直处于`CLOSE_WAIT`状态

    4. 服务端停止运行了, 相应的连接状态才关闭

    5. > 客户端(主动端)主动关闭连接之后, 可以看到 先进入了`FIN_WAIT_2`状态
        >
        > 并且, 在之后的观察中 可以发现, 主动端完整的关闭了连接
        >
        > 但是, `TCP`"四次挥手"规定, 只要主动端没有收到被动端发送的`FIN`报文, 就会一直处于`FIN_WAIT_2`状态吗?
        >
        > 理论上是这样的, 但是 Linux在实现上并没有这样实现:
        >
        > 执行`man tcp`的命令, 并搜索`tcp_fin_timeout`:
        >
        > ![|wide](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/202401282259457.webp)
        >
        > **tcp_fin_timeout（整数; 默认值: 60; 自 Linux2.2 起）**
        >
        > **它指定了在强制关闭套接字之前, 等待最终`FIN`数据包的秒数. 这违反了`TCP`规范, 但却是防止服务攻击所必需的. 在 Linux2.2 中, 默认值为 180**
        >
        > 也就是, 说Linux针对 主动端 等待 被动端的`FIN`报文 设定了一个时间限制. 只要 主动端等待的时间 超出了这个时间限制, 主动端就会强制关闭连接
        >
        > 这也就是为什么, 上面 客户端进入`FIN_WAIT_2`一段时间之后, 突然不见了

    可以发现, 客户端(主动端)关闭连接, 服务端(被动端)好像会一直处于`CLOSE_WAIT`状态

    服务端处于`CLOSE_WAIT`状态, 但是客户端已经关闭了连接, 就会导致服务端一直无效占用系统资源

    至于服务端为什么会一直处于`CLOSE_WAIT`状态, 实际是因为服务端没有调用`close()`关闭`socket`

5. 如果我们将服务端代码中被注释掉的部分解开, 然后再编译运行, 并且使用`telnet`连接

    可以先预测一下结果: 

    代码在`accept()`之后`sleep(120)`, 然后再调用`close()`

    也就是说`accept()`将连接拿到进程中的`120s`之后, 服务端会`close()`掉`socket`

    那么, 如果由客户端在这`120s`内 主动断开连接, 那么此次服务端不会一直处于`CLOSE_WAIT`状态

    实际的结果:

    ![|wide](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/202401291554118.webp)

    实际的结果, 也正如预测的那样, 服务端基本是在连接建立成功`120s`之后, 调用了`close()`关闭了连接, 从而解决了一直处于`CLOSE_WAIT`的情况

    整个过程中, 服务端是没有停止运行的, 只是在最后调用了`close()`关闭了`socket`

    > 客户端的`FIN_WAIT_2`状态也确实只维持了`60s`

从观察、分析的结果来看, **如果被动端 不调用`close()` 关闭此次连接创建的`socket`, 那么被动端就会一直处于`CLOSE_WAIT`状态, 即使 已经不会再有任何通信**

这就会导致, **被动端的系统资源得不到释放, 一直被无效占用**, 所以, **无论是客户端还是服务端, 双端在通信完成之后, 一定要调用`close()`关闭`socket`释放资源**

### `TIME_WAIT`

**`TIME_WAIT`是主动端会进入的状态**

要观察`TIME_WAIT`状态, 需要让客户端收到服务端发送的`FIN`报文, 所以 我们需要将服务端代码中`sleep(120)`, 调整到 `sleep(50)` 或 更低, 主要是为了保证客户端在`FIN_WAIT_2`状态维持时间内 收到 服务端的`FIN`报文

我设置为`sleep(40)`

依旧将程序编译、运行起来, 使用`telnet`进行连接, 使用`netstat`命令查看状态:

`telnet`发起连接之后, 主动关闭连接, 并查看客户端状态变化:

![|lwide](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/202401291631389.webp)

可以看到, 在连接成功建立(24:01) 的`40s`左右之后(24:40), 被动端(服务端)调用`close()` 发送`FIN`报文

主动端(客户端)收到`FIN`报文并应答, 进入`TIME_WAIT`状态(24:40), 被动端收到应答关闭连接

主动端进入`TIME_WAIT`约`60s`后(25:41), 关闭连接. 因为`25:34`时 主动端依旧处于`TIME_WAIT`, `25:41`就关闭了连接

从观察的结果来看`TIME_WAIT`大致维持了`60s`

---

**那么**

**1. 为什么主动端要维护一个`TIME_WAIT`状态?**

**2. 为什么`TIME_WAIT`状态维持的时间是多少? 为什么?**

> 首先关于第一个问题:
>
> `TIME_WAIT`是"四次挥手"的主动发起方需要维持的一个状态
>
> 我们知道, 主动端想要关闭连接, 被动端可能还存在数据未发送完毕 并不想要关闭连接
>
> 主动端是如何进入`TIME_WAIT`状态的呢? 是被动端将数据发送完毕之后, 向主动端发送`FIN`报文, 主动端收到此报文并应答之后, 进入`TIME_WAIT`状态
>
> 也就是说, 主动端向被动端 发送`ACK`应答报文之后, 才进入了`TIME_WAIT`
>
> 被动端是需要收到主动端的`ACK`应答报文才能正常关闭连接的, 所以主动端是需要保证 被动端确实收到了`ACK`应答报文的
>
> 如果, 被动端没有收到主动端的`ACK`报文, 那么被动端是会重传`FIN`报文的
>
> 因为, 被动端可能重传`FIN`报文, 所以 **主动端需要维持一段时间的`TIME_WAIT`状态, 保证可能重传的`FIN`报文不被漏掉**
>
> 这是`TIME_WAIT`状态存在的第一个作用
>
> ---
>
> 其次, 如果在主动端应答了`ACK`报文之后, 不维护`TIME_WAIT`状态 直接关闭连接, 被动端也收到了`ACK`报文正常的关闭了连接. 但是, 实际上网络中还有报文在有效传输
>
> 如果, 此时 恰好 双端使用了相同的四元组(源IP/目的IP:源Port/目的Port)建立了新的连接
>
> 那么 新的连接有没有可能会收到 旧的有效报文呢? 旧报文会不会影响此次的连接呢?
>
> 答案当然是有可能的. 虽然因为序号和确认序号等标识 被影响的概率很低
>
> 所以, 需要维护一段时间的`TIME_WAIT`状态, 保证旧报文传输完毕或失效, 这是第二个作用

> 关于第二个问题:
>
> 在简单分析"四次挥手"双端状态时, 提到过 `TIME_WAIT`的持续时间不能太长, 不能太短, `TCP`协议标准 推荐值为`2*MSL`
>
> **`MSL(Maximum Segment Lifetime)`, 表示 `TCP`报文在网络中的最大生存时间**. 不同系统 可能设置不同的`MSL`, 如果一个`TCP`报文在网络中传输的时间超过了系统的`MSL`, 那么此报文到达目的地时会被丢弃
>
> **`TCP`协议标准 推荐`TIME_WAIT`的持续时长为`2倍MSL`, 为什么呢?**
>
> 因为 如果`TIME_WAIT`持续`2*MSL`的时长, 那么基本可以保证此次连接 双方发送的报文 都已经传输完毕或已经失效
>
> 如果, 主动端在`TIME_WAIT`期间 再次收到了被动端的`FIN`报文, 主动端会重新发送`ACK`报文并进入新的`TIME_WAIT`
>
> 那么, 主动端发送`ACK`应答报文之后, 此报文会有两种结果:
>
> 1. 丢失, 即被动端一直没收到`ACK`报文
>
>     此时, 被动端会一直重传`FIN`, 直到达到重传的上限
>
>     否则, 双端的状态一般是不会变化的
>
>     > 你可能会想, 如果被动端一直在重传`FIN`, 但是每一个都没有被主动端收到
>     >
>     > 然后重传时间超出了`2*MSL`, 主动端都关闭连接了, 被动端还在重传`FIN`
>     >
>     > 如果出现了这种情况, 那么在被动端达到重传上限之前, 网络中会一直存在有效的`FIN`报文
>     >
>     > 这怎么解决?
>     >
>     > 只能说出现这种情况的概率, 非常非常低. 不过 在此种情况中, 由于被动端在达到重传上线之前一直没有关闭连接, 也就没有释放资源, 系统一直占用着四元组资源
>     >
>     > 所以, 也不会出现 双端使用相同四元组建立新连接的情况
>     >
>     > ---
>     >
>     > 当然, 还有最极限的一种情况: 被动端刚好达到重传上限, 重传了最后一个`FIN`报文, 刚好关闭连接释放资源, 双端就使用了相同的四元组建立了新的连接
>     >
>     > 此时, 网络中还传输有有效的`FIN`报文, 新连接就又可能被影响
>     >
>     > 但是, 好像还是无法解决, 只能说出现这种情况的概率 更更更更低了
>     >
>     > ---
>     >
>     > 这都是非常非常非常极端的情况, 基本不需要考虑
>
> 2. 被动端收到了`ACK`报文
>
>     那么, 以此报文可以被接收为前提, 最长的传输时长就是不超过`MSL`
>
>     并且, 被动端有可能在收到`ACK`的前一瞬 刚好重传了一份`FIN`报文, 那么 这一份`FIN`在网络中传输失效需要的时间就是`MSL`
>
>     **`ACK`最长的传输时间+`FIN`传输失效需要的时间<=`2*MSL`**
>
>     所以, `TCP`协议标准 推荐`TIME_WAIT`持续时长为`2*MSL`
>
> ---
>
> 那么, Linux系统中的`MSL`实现的是多少呢?
>
> 按照`TCP`标准的建议, `TIME_WAIT`持续`2*MSL`. 而 我们实测`TIME_WAIT`会持续约`60s`
>
> 那么, Linux的`MSL`就应该是`30`
>
> 但实际不是的. 查看Linux源码可以看到, `MSL=60`:
>
> ![|wide](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/202401300028550.webp)
>
> 同样 可以看到`TIME_WAIT`的持续时间, 也可以看作默认`60s`:
>
> ![|wide](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/202401300037389.webp)
>
> > Linux系统实现的`TIME_WAIT`的持续时间, 并不只是简单的`60s`, 但是一般可以看作是`60s`
>
> 并且, 可以在源码中看到有关`FIN_WAIT_2`状态的定义`TCP_FIN_TIMEOUT`, 实际就是`TCP_TIMEWAIT_LEN`
>
> 所以, 在Linux系统中查看`TCP_FIN_TIMEOUT`就是查看`TCP_TIMEWAIT_LEN`, 也可以看作是查看Linux系统的`MSL`:
>
> `cat /proc/sys/net/ipv4/tcp_fin_timeout`
>
> ![|wide](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/202401300039718.webp)
>
> ---
>
> 查看源码我们发现, Linux针对`TIME_WAIT`状态持续时间的实现, 并没有按照`TCP`协议标准的建议走
>
> 而是将`TCP_TIMEWAIT_LEN`设置为了与`TCP_PAWS_MSL`相同的值`60`
>
> 因为Linux针对`TIME_WAIT`有其他方面的优化

---

#### 可能造成的问题 和 解决

`TIME_WAIT`持续太久, 也会无效占用系统资源, 除了占用系统资源之外, 可能会造成一些其他:

如果是服务端`TIME_WAIT`持续太久, 会出现这种情况:

![](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/202401301633910.webp)

由于服务端主动关闭连接, 维持在`TIME_WAIT`状态, 导致端口资源无法释放, 耽误服务重启

Linux系统`TIME_WAIT`维持时间在`60s`左右

服务器在实际运行中, 如果整个服务挂掉了, 服务器建立的每一个连接都会进入`TIME_WAIT`, 只要有一个连接没有正式关闭, 服务就无法使用相同的端口重启, 难道服务要等待`60s`再重启吗?

要解决这个问题, 除了直接从系统层面做优化之外. Linux还提供了一个系统调用`setsockopt()`

```cpp
#include <sys/socket.h>

int setsockopt(int sockfd, int level, int optname,
               const void *optval, socklen_t optlen);
/*
 * sockfd, 创建的套接字
 * level, 协议层 可以指定协议, 这里使用 SOL_SOCKET
 * optname, 选项名
 * optval, 要设置的值/内容, 需要根据选项的实际类型进行定义和填充, 是一个输入性参数
 * optlen, optval的长度/大小
 */
```

这个系统调用可以 对进程中的指定`socket`的行为 做出一些调整, 即 设置套接字的一些选项, 需要调用在创建套接字之后

有两个选项, 可以使相同的服务直接使用相同的端口/IP创建套接字, 即使之前的连接还未正式关闭

这两个选项看作布尔值, 可以直接以`0/1`设置

1. `SO_REUSEADDR`

    可以在服务进入`TIME_WAIT`之后, 即使 没有正式关闭连接, 让服务使用相同的`Port`和`IP`创建`socket`并`bind`. 不过前提是, 需要是同一个服务

    ```cpp
    // 创建套接字之后
    int opt = 1;
    setsockopt(_listenSock, SOL_SOCKET, SO_REUSEADDR, &opt, sizeof(opt));
    ```

    ![在TIME_WAIT状态 |wide](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/202401301714483.webp)

2. `SO_REUSEPORT`

    允许不同服务在任何状态下, 使用相同的`Port`和`IP`创建`socket`并`bind`, 之前的服务的连接不用在`TIME_WAIT`状态

    ```cpp
    // 创建套接字之后
    int opt = 1;
    setsockopt(_listenSock, SOL_SOCKET, SO_REUSEPORT, &opt, sizeof(opt));
    ```

    ![|wide](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/202401301721903.webp)

---

至此, `TCP`协议"四次挥手"的过程以及相关状态分析, 简单介绍完毕

感谢阅读~