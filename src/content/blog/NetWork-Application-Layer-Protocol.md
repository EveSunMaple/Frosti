---
draft: true
title: "[TCP/IP] 初识应用层协议: 序列化与反序列化、编码与解码、jsoncpp简单食用..."
pubDate: "2023-07-18"
description: "真正的应用层开发中, 需要传输的网络数据并不只有语言原生类型, 更多的是自定义并且结构化的数据"
image: https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/202307261508349.webp
categories:
    - Blogs
tags: 
    - Linux网络
    - TCP-IP
    - 应用层
    - 协议
---

# 写在应用层之前

有关Linux网络, 之前的文章已经简单演示介绍了`UDP`、`TCP`套接字编程

> 相关文章:
>
> [[Linux] 网络编程 - 初见UDP套接字编程: 网络编程部分相关概念、TCP、UDP协议基本特点、网络字节序、socket接口使用、简单的UDP网络及聊天室实现...](https://www.humid1ch.cn/posts/Linux-Network-UDPSocket_I)
>
> [[Linux] 网络编程 - 初见TCP套接字编程: 实现简单的单进程、多进程、多线程、线程池tcp服务器...](https://www.humid1ch.cn/posts/Linux-Network-TCPSocket_I)

之前用的所有接口: `soket()`、`bind()`、`listen()`、`connect()`、`accept()`...

实际上都是系统调用, 都属于应用层的一部分, 是传输层提供给应用层接口

而之前文章中实现的服务器客户端进行字符串通信, 实际上就是实现了应用层的内容

虽然在二十一世纪的今天, 已经指定有了有非常多的应用层协议: `HTTP`、`HTTPS`、`DNS`、`FTP`...

但在编写的过程中, 并没有使用 制定应用层协议, 只是自己默认了使用字符串进行通信, 而在实际的应用层开发中, 是必须要使用或制定协议的

因为, 真正的应用层开发中, 需要传输的网络数据并不只有语言原生类型, 更多的是自定义并且结构化的数据

# 应用层协议

之前介绍的各种套接字接口, 读取数据时 其实都是以字节流的形式传输的

传输字符串, 直接使用原生类型存储并发送就可以了. 因为这些类型的数据的读写都是二进制按位读写的

但如果传输结构化的数据呢? 比如C语言中的结构体, 或C++中的类

## 序列化 与 反序列化

应用层传输结构化的数据, 可不可以直接在应用层之间传输呢?

比如, 直接用一个类传输:

![|inline](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722181134277.webp)

可不可以把`msg1`原封不动的从平台1传输到平台2?

答案是不可以. 为什么呢?

C/C++原生数据类型, 在内存中的读写就直接是以二进制的形式读写的, 并且不会受到平台规格的影响

但是**结构化的数据不同**, 虽然结构化的数据同样是以二进制的形式进行读写的, 但是**结构化的数据通常包括各种类型的数据, 不能以一种固定的格式读写, 而且结构化数据的读写 会受到平台规格的影响**

不仅仅是平台的**大小端字节序**可能会影响, 还有**平台的结构体对齐、平台相关软件版本**, 都可能会影响到数据的读写

1. 如果平台的结构体对齐大小不同, 直接传输结构体很可能接收到的数据大小就与原数据大小不同
2. 如果平台相关编程软件的的版本不同, 比如服务器的编译器是最新版的, 而用户一直不更新客户端 就可能使用的很老旧的版本, 此时直接传输结构体就可能造成数据无法成功读取的情况
3. ...

无论怎么说, 结构化的数据在传输时, 不能原封不动的直接传输

传输不会受到影响, 但是读写会受到影响, 很可能造成无法通信的情况

那么结构化的数据究竟该怎么传输呢?

常用的方法就是, **在传输之前将结构化的数据转化成 "字符串"(只是一个形容, 也可以转换成二进制数据等), 然后再进行传输**

比如, 将`msg1 = {"July.cc", "xxxxxxx", "Hello world"}`转换成`"July.cc\1xxxxxxx\1Hello world"`字符串

即 将数据以`'\1'`分割, 然后从平台1 发送到 平台2, 平台2 收到`"July.cc\1xxxxxxx\1Hello world"`字符串之后, 再以`'\1'`将其还原成原本的数据

即, 平台1和平台2约定好 发送的数据分三个区域, 以`'\1'`分割

![](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722181136976.webp)

在这个过程中:

1. 步骤`①`, 将结构化数据 按照协议 转化成 可以直接传输的字符串或二进制码流等形式的操作, 被称为**序列化**
2. 步骤`②`, 将接收到的经过序列化的数据, 按照协议 还原成原本的结构化数据的操作, 被称为**反序列化**

并且, 传输数据的结构是约定好的, 比如分几个区域, 用什么分割, 每个区域表示什么含义等

不过, 至此应用层传输数据要做的工作还并没有结束

接收数据方**如何知道接收到的字符串的长度呢?**

在提供方法之前, 再来思考一个问题: **为什么要知道字符串长度呢?**

接收方接收到字符串数据之后, 如果不知道接收到的字符串的长度, 该如何将字符串还原成原本的结构化数据呢? 没办法的

因为 接收方并不只是一条一条的接收发送过来的数据的

很可能是发送了很多, 然后一次性接收

如果一次性收到了很长的数据, 这数据中有很多条结构化的数据, 如果不知道每条数据的长度, 又怎么能将接收到的每条数据原换成原本的结构化数据呢?

所以, 接收方是需要知道接收的字符串的长度的

那么, **如何知道接收到的字符串的长度呢?** 

其实很简单, 只需要**发送方在序列化之后的字符串数据之前 声明一下此次传输的字符串长度**

比如 在序列化的字符串数据之前 用4字节大小的空间存储字符串的长度

然后接收到数据之后, 先读取一下前4字节的数据, 就可以知道本次的字符串长度了

即:

![|inline](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722181139409.webp)

这样的, 在序列化之后的实际有效内容之前添加有效内容相关属性字段的行为, 叫`encode编码`

但`encode`操作并不简单指添加一些属性字段, 还可以有其他的比如加密等行为

反过来, 将`encode`过的数据, 还原为实际有效内容的动作, 叫`decode解码`

在此例中, 添加的有效字符串的长度字段, 就可以被称为**报头**, 而有效字符串就可以被称为**有效载荷**

了解了简单的应用层协议相关内容, 尝试来自己定制一个协议 来实现一个**网络整型计算器服务**

## 网络整型计算器

> 在之前实现的TCP服务器与客户端通信的基础上实现

如何实现网络计算器呢?

### 数据传输协议制定思路

可以定义一个类, 此类成员变量包含: `int _x` `int _y` `char _op`, 分别表示两个整数和一个运算符

然后实例化对象发送给服务端, 服务端处理完成之后再响应给客户端

不过上面已经介绍了, 应用层通信需要制定协议将结构化的数据序列化, 然后在进行传输

所以, 我们就需要两个类:

1. 一个, 用于请求计算, 成员变量: `int _x` `int _y` `char _op` 分别表示 两个计算数 和 一个运算符

2. 一个, 用于响应请求, 成员变量: `int _exitCode` `int _result` 分别表示 退出码 和 计算结果

    退出码主要用于记录是否出现 除零错误或模零错误

并且, 由于是应用层传输, 所以两个类中还需要各自实现 序列化和反序列化的接口.

![](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722181142030.webp)

> 此处的序列化与反序列化:
>
> 序列化: 序列化函数`serialize()`, 通过将对象的成员变量序列化为一个`string`类型数据并存储到输出型参数`out`中
>
> 反序列化: 反序列化`deserialize()`, 通过参数的序列化字符串 将原数据还原出, 并直接存储到对象自己的成员变量中

除此之外, 我们还需要对经过序列化的数据做`encode`操作, 也需要对接收到的数据做`decode`操作

> 此例中, 统一将`encode`之后的可直接传输的数据 实现为: **`"有效载荷长度字段\r\n有效载荷\r\n"`**
>
> 即, `encode()`实现功能为: 在有效载荷字符串前添加一段表示有效载荷长度的字符串, 此字符串以`\r\n`结尾, 便于读取.
>
> 当然也可以直接使用一个整型 存储有效载荷字符串的长度, 这里为了方便演示, 就是用了字符串
>
> 也就是说, 数据在传输过程中的结构是 **`"有效载荷长度字段\r\n有效载荷\r\n"`**

### 服务端功能函数的实现

传输数据实现的思路已经理清了

服务器中参与 接收请求、计算、响应请求 的函数该怎么写呢?

```cpp
// 指定协议, 传输的数据 单个完整的结构化数据 转换成传输格式为: "strLen\r\n_x _op _y\r\n"
// strLen, 即用字符串表示有效载荷的实际长度;
// _x _op _y, 即为实际的有效载荷, 单个完整的传输数据 这里称为 strPackage
void netCal(int sock, const std::string& clientIp, uint16_t clientPort) {
    assert(sock >= 0);
    assert(!clientIp.empty());
    assert(clientPort >= 1024);

    std::string inBuffer;
    while (true) {
        request req;
        char buffer[128];
        ssize_t s = read(sock, buffer, sizeof(buffer) - 1);
        if (s == 0) {
            logMessage(NOTICE, "client[%s:%d] close socket, service done ...", clientIp.c_str(), clientPort);
            break;
        }
        else if (s < 0) {
            logMessage(WARINING, "read client[%s:%d] error, errorCode: %d, errorMessage: %s ", clientIp.c_str(), clientPort, errno, strerror(errno));
            break;
        }

        // 走到这里 读取成功
        // 但是, 读取到的内容是什么呢?
        // 本次读取, 有没有可能读取到的只是发送过来的一部分呢? 如果发送了一条或者多条完整strPackage, 却没有读取完整呢?
        // 这种情况是有可能发生的, 所以不能直接进行 decode 以及 反序列化, 需要先检查
        buffer[s] = '\0';
        inBuffer += buffer; // 将读取到的内容 += 在inBuffer后
        // 然后 根据inBuffer的内容, 检查是否已经接收到了一个完整的 strPackage
        uint32_t strPackageLen = 0;
        std::string package = decode(inBuffer, &strPackageLen);
        // TODO 这里decode 需要实现一些功能
        // 检验inBuffer中是否存在至少一个完整的strPackage, 如果存在则decode并返回decode之后的string, 并获取strPackage有效载荷长度 存储在strPackageLen中
        if (strPackageLen == 0)
            continue; // 说明 没有一个完整的strPackage

        // 走到这里 就获取了一个完整的strPackage并进行了decode, 获取了有效载荷存储到了 package 中
        // 就可以进行反序列化了
        if (req.deserialize(package)) {
            // 反序列化成功, 则进入
            // 处理计算
            response resp = calculator(req); // TODO

            std::string respPackage;
            resp.serialize(&respPackage); // 对响应resp序列化
            // 对报文 encode
            respPackage = encode(respPackage, respPackage.size());
            // TODO encode需要实现获取报文有效载荷长度, 并以字符串形式添加报头, 并将添加了抱头的字符串返回
            // 最后就可以响应写入
            write(sock, respPackage.c_str(), respPackage.size());
        }
    }
}
```

> 此例中, 为了方便理解, 我们将一个完整的请求字符串称为`strPackage`
>
> 即, `"有效载荷长度字段\r\n有效载荷\r\n"`称为`strPackage`

我们来分析一下此代码的实现:

此代码是 接受请求、计算、响应请求 的功能函数

此函数首先要实现的是 **接收请求**. 所以 进入循环之后需要先`read()`接收请求.

但是此时存在一个问题: 每次`read()`读取到的`strPackage`都能保证是完整的吗?

1. 有没有可能因为单次读取长度过短, 导致 传过来的是`11\r\n123 + 123\r\n`, 而此次读取到的只是`11\r\n123 +`呢?
2. 还有没有可能因为发送速度块, 读取速度慢, 导致 传过来的是`11\r\n123 + 123\r\n12\r\n1234 + 123\r\n13\r\n1234 + 1234\r\n`, 而此次读取到的只是`11\r\n123 + 123\r\n12\r\n1234 + 123\r\n13\r\n12`呢?

这都是有可能发生的, 也就是说读取到的可能不是一个完整的`strPackage`.

我们 可以设置单次读取`char buffer[128]`, 即`128`字节. 每次读取之后, 将读取到的数据添加在`string inBuffer`之后, 这样`inBuffer`的内容就是一个个的`strPackage`. 设置单次的读取字节长度, 可以更好的控制读取的结果.

设置了之后, 单次读取过短的情况 大概率是不会出现了, 但是依然可能出现 完整的`strPackage`被截断的情况

所以, 我们是需要判断此时`inBuffer`中第一个需要处理的`strPackage`是否是完整的. 

如果不完整就进入下次循环继续读取, 如果完整则在进行相应的操作, 对应的代码为:

![ ](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722181145435.webp)

判断以及`decode解码`的操作, 我们都需要在`decode()`函数中实现.

执行过`decode()`之后, 如果`strPackageLen`还为`0`, 那就表示该处理的请求并不完整, 直接进入下一次循环继续读取.

再向下走, 就表示已经获取了完整的请求有效载荷字符串到`package`中, 并且`strPackageLen`也已经设置为有效载荷字符串的长度

此时就可以反序列化并进行计算了.

实例化一个`request`对象并调用`serialize()`成员函数, 对`package`进行反序列化, 并判断是否成功.

如果成功, 进行计算, 并返回一个存储着计算结果的`response`对象.

然后在对此`response`对象进行序列化, 然后`encode`编码.

然后再执行`write()`从而响应请求, 对应的代码为:

![|inline](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722181147441.webp)

至此, 接收请求、计算、响应请求 的主逻辑函数就已经实现了. 但是还需要实现一些功能函数:

1. `request`类的序列化与反序列化函数
2. `response`类的序列化与反序列化函数
3. `encode()`编码函数与`decode()`解码函数
4. `calculator()`实际根据`request`对象执行计算的功能函数

先把最简单的计算功能函数实现:

```cpp
// 保证不会出现除零和摸零的情况
std::map<char, std::function<int(int, int)>> opFunctions{
    {'+', [](int elemOne, int elemTwo) { return elemOne + elemTwo; }},
    {'-', [](int elemOne, int elemTwo) { return elemOne - elemTwo; }},
    {'*', [](int elemOne, int elemTwo) { return elemOne * elemTwo; }},
    {'/', [](int elemOne, int elemTwo) { return elemOne / elemTwo; }},
    {'%', [](int elemOne, int elemTwo) { return elemOne % elemTwo; }}
};

static response calculator(const request& req) {
    response resp;

    int x = req.get_x();
    int y = req.get_y();
    int op = req.get_op();

    if (opFunctions.find(req.get_op()) == opFunctions.end()) {
        resp.set_exitCode(-3); // 非法操作符
    }
    else {
        if (y == 0 && op == '/') {
            resp.set_exitCode(-1); // 除零错误
        }
        else if (y == 0 && op == '%') {
            resp.set_exitCode(-2); // 模零错误
        }
        else {
            resp.set_result(opFunctions[op](x, y));
        }
    }

    return resp;
}
```

如果计算成功, `response`对象的`_exitCode`不会被更改, 默认为`0`

当`_exitCode`被更改时:

1. `-1`, 表示出现除零错误
2. `-2`, 表示出现模零错误
3. `-3`, 表示非法操作符

### 协议定制 - 服务端

服务端的功能函数中使用了一些协议的函数:

1. `decode()` 解码函数
2. `request::deserialize()`, 请求对象的反序列化函数
3. `response::serialize()`, 响应对象的序列化函数
4. `encode()` 编码函数

下面来一一实现.

#### `decode()`

`decode()`需要实现什么功能?

`decode()`需要实现的功能是: 

接收`inBuffer`和`&strPackageLen`, 然后判断`inBuffer`中第一个请求是否完整:

如果不完整则返回空`string`, 并设置`&strPackageLen`值为0

如果完整, 则将`inBuffer`中的第一个请求中 有效载荷作为`string`返回, 有效载荷的长度字段 所存储的长度 设置为`&strPackageLen`的值

> 我们默认`strPackage`的格式为: `"有效载荷长度字段\r\n有效载荷\r\n"`

```cpp
#define CRLF "\r\n"
#define CRLF_LEN strlen(CRLF)

// strPackage: 长度字段\r\n有效载荷\r\n
std::string decode(std::string& inS, uint32_t* len) {
    assert(len);

    *len = 0;
    // 1. 确认inBuffer存在 "\r\n"
    size_t pos = inS.find(CRLF);
    if (pos == std::string::npos) {
        // 没有找到"\r\n" 表示没有一个完整的表示有效载荷长度的字段
        // 即 strPackage 不完整
        return "";
    }

    // 2. 获取长度
    // 已经获取了第一个"\r\n"位置, 前面即为长度字段
    std::string inLen = inS.substr(0, pos);
    int intLen = atoi(inLen.c_str());

    // 3. 确认有效载荷完整
    // 已经获取了有效载荷的长度, 就可以判断有效载荷是否完整了
    int surplus = inS.size() - 2 * CRLF_LEN - pos; // 计算inBuffer中 减去长度字段的长度 再减去两个"\r\n", 得到inBuffer的剩余长度
    if (surplus < intLen) {
        // inBuffer剩余长度小于长度字段所记录的长度, 表示有效载荷不完整
        return "";
    }

    // 4. 获取有效载荷
    // pos 是第一个"\r\n"的位置, 之后就是有效载荷的位置
    std::string package = inS.substr(pos + CRLF_LEN, intLen);
    *len = intLen;

    // 5. 将完整的strPackage从inBuffer中剔除
    int removeLen = inLen.size() + 2 * CRLF_LEN + intLen; // 需要剔除的长度为 长度字段的长度 有效载荷的长度 以及 2个"\r\n"的长度
    inS.erase(0, removeLen);                              // std::string::erase() 第二个参数表示要删除的字符长度

    return package;
}
```

都是一些字符串操作, 没有什么需要特别注意的地方

#### `request::deserialize()`

`request::deserialize()`函数的作用是:

接收有效报文, 将有效报文的内容还原出来并赋值给`request`对象的成员.

> 我们默认`strPackage`的格式为: `"有效载荷长度字段\r\n有效载荷\r\n"`
>
> 并且, 默认有效载荷的格式为: `"_x _op _y"`, 比如`1 + 1`. 即操作数与操作符用一个空格分隔

```cpp
#define SPACE " "
#define SPACE_LEN strlen(SPACE)

// 反序列化 -- 字符串 -> 结构化的数据
bool deserialize(const std::string& in) {
    // in 的格式 1 + 1
    // 先查找两个空格的位置
    size_t posSpaceOne = in.find(SPACE);
    if (posSpaceOne == std::string::npos)
        return false;
    size_t posSpaceTwo = in.rfind(SPACE);
    if (posSpaceTwo == std::string::npos)
        return false;

    // 再获取三段字符串
    std::string dataOne = in.substr(0, posSpaceOne);
    std::string dataTwo = in.substr(posSpaceTwo + SPACE_LEN, std::string::npos);
    std::string oper = in.substr(posSpaceOne + SPACE_LEN, posSpaceTwo - (posSpaceOne + SPACE_LEN));
    if(oper.size() != 1)
        return false;   // 操作符不是一位

    _x = atoi(dataOne.c_str());
    _y = atoi(dataTwo.c_str());
    _op = oper[0];

    return true;
}
```

#### `response::serialize()`

`response::serialize()`函数的作用是:

接收一个输出型参数, 将对象自己的成员变量, 序列化为指定的格式: `_exitCode _result` 并存储到输出型参数中.

```cpp
#define SPACE " "
#define SPACE_LEN strlen(SPACE)

void serialize(std::string* out) {
    std::string exitCode = std::to_string(_exitCode);
    std::string result = std::to_string(_result);

    *out = exitCode;
    *out += SPACE;
    *out += result;
}
```

#### `encode()`

`encode()`解码函数需要实现的功能是:

接收已经序列化的`string`以及其大小, 然后添加长度字段报头以及分隔符`"\r\n"`, 然后返回添加过报头和分隔符的`string`

最终将`"有效载荷"`转换为: `"有效载荷长度字段\r\n有效载荷\r\n"`

```cpp
#define CRLF "\r\n"
#define CRLF_LEN strlen(CRLF)

std::string encode(const std::string& inS, uint32_t len) {
    std::string encodeIn = std::to_string(len); // len
    encodeIn += CRLF; // len\r\n 
    encodeIn += inS; // len\r\ninS
    encodeIn += CRLF; // len\r\n\inS\r\n

    return encodeIn;
}
```

### 客户端功能函数的实现

上面实现了服务端功能函数. 

那么 客户端需要实现什么功能呢?

连接到服务器之后, 需要从命令行接收字符串, 并根据字符串初始化一个`request`对象. (输入格式就按照`_x _op _y`的形式S)

然后将`request`对象序列化, 进行`encode`编码.

然后将完成序列化和编码的`strPackage`发送到服务器:

发送失败, 则直接关闭客户端

发送成功, 则尝试读取服务器的响应, 读取成功之后, 对其`decode`然后在反序列化.

```cpp
#include "util.hpp"
#include "protocol.hpp"

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
        std::cout << "请输入表达式 >> ";
        std::getline(std::cin, message); // 从命令行获取消息 到 message中
        if (strcasecmp(message.c_str(), "quit") == 0) {
            quit = true;
            continue;
        }

        request req;
        if (!makeRequest(message, &req)) {
            continue; // 初始化请求失败
        }

        // 请求创建并初始化成功之后, 就可以序列化 encode 然后发送了
        std::string package;
        req.serialize(&package);

        package = encode(package, package.size());

        ssize_t sW = write(sockFd, package.c_str(), package.size()); // 向客户端套接字文件描述符写入消息
        if (sW > 0) {
            // 写入成功, 就准备接收服务器的回复
            char buff[BUFFER_SIZE]; // 需要与服务器inbuffer大小一致
            ssize_t sR = read(sockFd, buff, sizeof(buff) - 1);
            if (sR > 0) {
                message[sR] = '\0';
            }
            std::string echoPackage = buff;

            // 接收成功服务器的回复, 就需要对接收到的数据 decode 和 反序列化
            response resp;
            uint32_t packageLen = 0;

            echoPackage = decode(echoPackage, &packageLen);

            if (packageLen) {
                // 解码成功, 并获取解码成功的字符串
                resp.deserialize(echoPackage);
                printf("[exitcode: %d] %d\n", resp.get_exitCode(), resp.get_result());
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

其中进入循环后的这一部分, 就是实现 **创建请求、发送请求、接收响应** 的实现:

![ ](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722181153676.webp)

调用`makeRequest()`创建并初始化请求, 然后进行`req.serialize()`序列化, 再`encode()`编码

然后向服务端发送请求. 发送成功, 就需要再接收来自服务端的响应.

接收到响应之后, 使用`echoPackage`接收响应字符串. 

然后`decode`解码, 如果解码成功, 使用`response`对象 对`echoPackage`反序列化

最终的结果会存储在`response`对象中

但是, 有一些接口我们还没有定义: `makeRequest() 创建请求` `request::serialize()` `response::deserialize()`

### 协议定制 - 客户端

客户端负责请求的创建和序列化, 以及响应的反序列化

#### `makeRequest()`

首先就是创建并初始化请求

`makeRequest`需要实现, 接收命令行字符串和请求对象.

然后将命令行字符串中 获取需要计算的两个数据和操作符, 存储到请求对象中:

```cpp
bool makeRequest(const std::string& message, request* req) {
    // 首先消除指令消息中的空格
    std::string tmpMsg;
    std::string opStr = OPS;
    for (auto e : message) {
        if ((e <= '9' && e >= '0') || (opStr.find(e) != std::string::npos)) {
            tmpMsg += e;
        }
        else if(e != ' ') {
            return false;
        }
    }

    char strtmp[BUFFER_SIZE];
    snprintf(strtmp, sizeof strtmp, "%s", tmpMsg.c_str());

    char* left = strtok(strtmp, OPS);
    if (!left)
        return false;
    char* right = strtok(nullptr, OPS);
    if (!right)
        return false;
    char mid = tmpMsg[strlen(left)];

    req->set_x(atoi(left));
    req->set_y(atoi(right));
    req->set_op(mid);

    return true;
}
```

首先我们先格式化从命令行接收到的表达式字符串. 

如何格式化呢? 将表达式字符串的空格消除掉. 如果字符串中存在非数字、非指定操作符且非空格的字符, 直接返回`false`表示非整数运算, 创建请求失败:

![|inline](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722181156969.webp)

然后将`tmpMsg`内容存储到一个字符数组中, 并使用`strtok()`将字符串分割, 获取到表达式内容:

![|inline](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722181158619.webp)

> `strtok()`可以根据指定一些的分割符, 将指定字符串内容分割并返回.
>
> `strtok()`在找到分割符后, 会将分割符位置 置`'\0'`, 然后返回以此`'\0'`结尾的字符串
>
> 之后的使用中`strtok()`首参数传入 **空指针**, `strtok()`会自动在之前的字符串中向后查找分割符.

获得表达式各内容的字符串之后, 就可以将内容存储到请求对象中了:

![|inline](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722181200500.webp)

#### `request::serialize()`

请求的序列化. 需要将请求内容, 序列化为字符串 存储在输出型参数中.

我们规定序列化的格式为 `_x _op _y`

```cpp
void serialize(std::string* out) {
    std::string xStr = std::to_string(get_x());
    std::string yStr = std::to_string(get_y());

    *out += xStr;
    *out += SPACE;
    *out += get_op();
    *out += SPACE;
    *out += yStr;
}
```

很简单, 不需要分析

#### `response::deserialize()`

服务器响应的反序列化. 

要先知道服务器相应的序列化, 是将响应成员, 序列化为`_exitCode _result`的格式

所以, 我们只需要将`_exitCode`和`_result`取出, 并存储在响应对象中就可以了:

```cpp
bool deserialize(const std::string& in) {
    size_t posSpace = in.find(SPACE);
    if (posSpace == std::string::npos) {
        return false;
    }

    std::string exitCodeStr = in.substr(0, posSpace);
    std::string resultStr = in.substr(posSpace + SPACE_LEN, std::string::npos);

    set_exitCode(atoi(exitCodeStr.c_str()));
    set_result(atoi(resultStr.c_str()));

    return true;
}
```

同样是非常的简单, 先找大空格的位置, 然后以空格位置 分割前后两部分, 即为`_exitCode`和`_result`字符串

再存储到响应对象中就可以了.

### 全部代码 及 演示

上面实现完之后, 所有的代码应该长这样:

#### **`util.hpp`:**

```cpp
// 一些头文件以及宏
#pragma once

#include <iostream>
#include <string>
#include <map>
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

#define SOCKET_ERR  1
#define BIND_ERR    2
#define LISTEN_ERR  3
#define USE_ERR     4
#define CONNECT_ERR 5
#define FORK_ERR    6
#define WAIT_ERR    7

#define BUFFER_SIZE 1024
```

#### **`logMessage.hpp`:**

```cpp
// 日志接口
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

#### **`threadPool.hpp`:**

```cpp
// 懒汉单例线程池实现
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

#### **`task.hpp`:**

```cpp
// 线程池调度 所使用任务
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

#### **`lock.hpp`:**

```cpp
// RAII 思想实现的 锁
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
    }

    ~LockGuard() {
        _mutex->unlock();
    }

private:
    Mutex* _mutex;
};
```

#### **`daemonize.hpp`:**

```cpp
// 守护进程接口
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

#### **`protocol.hpp`:**

```cpp
// 应用层协议定制 以及相关接口
#pragma once

#include <iostream>
#include <string>
#include <cassert>
#include <cstring>

#define CRLF "\r\n"
#define CRLF_LEN strlen(CRLF)
#define SPACE " "
#define SPACE_LEN strlen(SPACE)

#define OPS "+-*/%"

#define BUFFER_SIZE 1024

std::string encode(const std::string& inS, uint32_t len) {
    std::string encodeIn = std::to_string(len); // len
    encodeIn += CRLF;                           // len\r\n
    encodeIn += inS;                            // len\r\ninS
    encodeIn += CRLF;                           // len\r\n\inS\r\n

    return encodeIn;
}

// strPackage: 长度字段\r\n有效载荷\r\n
std::string decode(std::string& inS, uint32_t* len) {
    assert(len);

    *len = 0;
    // 1. 确认inBuffer存在 "\r\n"
    size_t pos = inS.find(CRLF);
    if (pos == std::string::npos) {
        // 没有找到"\r\n" 表示没有一个完整的表示有效载荷长度的字段
        // 即 strPackage 不完整
        return "";
    }

    // 2. 获取长度
    // 已经获取了第一个"\r\n"位置, 前面即为长度字段
    std::string inLen = inS.substr(0, pos);
    int intLen = atoi(inLen.c_str());

    // 3. 确认有效载荷完整
    // 已经获取了有效载荷的长度, 就可以判断有效载荷是否完整了
    int surplus = inS.size() - 2 * CRLF_LEN - pos; // 计算inBuffer中 减去长度字段的长度 再减去两个"\r\n", 得到inBuffer的剩余长度
    if (surplus < intLen) {
        // inBuffer剩余长度小于长度字段所记录的长度, 表示有效载荷不完整
        return "";
    }

    // 4. 获取有效载荷
    // pos 是第一个"\r\n"的位置, 之后就是有效载荷的位置
    std::string package = inS.substr(pos + CRLF_LEN, intLen);
    *len = intLen;

    // 5. 将完整的strPackage从inBuffer中剔除
    int removeLen = inLen.size() + 2 * CRLF_LEN + intLen; // 需要剔除的长度为 长度字段的长度 有效载荷的长度 以及 2个"\r\n"的长度
    inS.erase(0, removeLen);                              // std::string::erase() 第二个参数表示要删除的字符长度

    return package;
}

// 定制请求的协议
class request {
public:
    request() {}
    ~request() {}

    // 序列化 -- 结构化的数据 -> 字符串
    // 我们序列化的结构是 : "_x _op _y", 即 空格分割
    void serialize(std::string* out) {
        std::string xStr = std::to_string(get_x());
        std::string yStr = std::to_string(get_y());

        *out += xStr;
        *out += SPACE;
        *out += get_op();
        *out += SPACE;
        *out += yStr;
    }

    // 反序列化 -- 字符串 -> 结构化的数据
    bool deserialize(const std::string& in) {
        // in 的格式 1 + 1
        // 先查找两个空格的位置
        size_t posSpaceOne = in.find(SPACE);
        if (posSpaceOne == std::string::npos)
            return false;
        size_t posSpaceTwo = in.rfind(SPACE);
        if (posSpaceTwo == std::string::npos)
            return false;

        // 再获取三段字符串
        std::string dataOne = in.substr(0, posSpaceOne);
        std::string dataTwo = in.substr(posSpaceTwo + SPACE_LEN, std::string::npos);
        std::string oper = in.substr(posSpaceOne + SPACE_LEN, posSpaceTwo - (posSpaceOne + SPACE_LEN));
        if (oper.size() != 1)
            return false; // 操作符不是一位

        _x = atoi(dataOne.c_str());
        _y = atoi(dataTwo.c_str());
        _op = oper[0];

        return true;
    }

    int get_x() const {
        return _x;
    }
    int get_y() const {
        return _y;
    }
    char get_op() const {
        return _op;
    }
    void set_x(int x) {
        _x = x;
    }
    void set_y(int y) {
        _y = y;
    }
    void set_op(char op) {
        _op = op;
    }

    void debug() {
        std::cout << _x << " " << _op << " " << _y << std::endl;
    }

private:
    int _x;
    int _y;
    char _op;
};

// 定制响应的协议
class response {
public:
    response()
        : _exitCode(0)
        , _result(0) {}
    ~response() {}

    void serialize(std::string* out) {
        std::string exitCode = std::to_string(_exitCode);
        std::string result = std::to_string(_result);

        *out = exitCode;
        *out += SPACE;
        *out += result;
    }

    // 反序列化
    bool deserialize(const std::string& in) {
        size_t posSpace = in.find(SPACE);
        if (posSpace == std::string::npos) {
            return false;
        }

        std::string exitCodeStr = in.substr(0, posSpace);
        std::string resultStr = in.substr(posSpace + SPACE_LEN, std::string::npos);

        _exitCode = atoi(exitCodeStr.c_str());
        _result = atoi(resultStr.c_str());

        return true;
    }
    void set_exitCode(int exitCode) {
        _exitCode = exitCode;
    }
    void set_result(int result) {
        _result = result;
    }
    int get_exitCode() const {
        return _exitCode;
    }
    int get_result() const {
        return _result;
    }

    void debug() {
        std::cout << _exitCode << " " << _result << std::endl;
    }

private:
    int _exitCode;
    int _result;
};

bool makeRequest(const std::string& message, request* req) {
	// 首先消除指令消息中的空格
	std::string tmpMsg;
	std::string opStr = OPS;
	for (auto e : message) {
		if ((e <= '9' && e >= '0') || (std::string::npos != opStr.find(e))) {
			tmpMsg += e;
		}
		else if (e != ' ') {
			return false;
		}
	}
	std::cout << tmpMsg << std::endl;

	// 这里要分两种情况来判断
	// 因为有可能 操作数前有 + 或 - 号
	// 所以要分清 + 或 -是否属于数值 或 运算符
	// 然后找到真正运算符的位置

	int opPos = 0;

	int first_pos = tmpMsg.find_first_of(opStr);
	int last_pos = tmpMsg.find_last_of(opStr);
	if ((tmpMsg[last_pos] != '-' && tmpMsg[last_pos] != '+') && !isdigit(tmpMsg[last_pos - 1])) {
		// 当最后一个操作符不是 - + 也不是真正运算符时, 输入错误
		return false;
	}
	if ((tmpMsg[first_pos] == '-' || tmpMsg[first_pos] == '+')) {
		if (first_pos == 0) {
			opPos = tmpMsg.find_first_of(opStr, first_pos + 1);
		}
		else {
			opPos = first_pos;
		}
	}
	else {
		if (first_pos == 0)
			return false;
		opPos = first_pos;
	}

	std::string left = tmpMsg.substr(0, opPos);
	std::string right = tmpMsg.substr(opPos + 1);

	req->set_x(atoi(left.c_str()));
	req->set_y(atoi(right.c_str()));
	req->set_op(tmpMsg[opPos]);

	req->debug();

	return true;
}

```

#### **`tcpServer.cc`:**

```cpp
// 服务器实现
#include "util.hpp"
#include "threadPool.hpp"
#include "task.hpp"
#include "daemonize.hpp"
#include "protocol.hpp"

// 保证不会出现除零和摸零的情况
std::map<char, std::function<int(int, int)>> opFunctions{
    {'+', [](int elemOne, int elemTwo) { return elemOne + elemTwo; }},
    {'-', [](int elemOne, int elemTwo) { return elemOne - elemTwo; }},
    {'*', [](int elemOne, int elemTwo) { return elemOne * elemTwo; }},
    {'/', [](int elemOne, int elemTwo) { return elemOne / elemTwo; }},
    {'%', [](int elemOne, int elemTwo) { return elemOne % elemTwo; }}};

static response calculator(const request& req) {
    response resp;

    int x = req.get_x();
    int y = req.get_y();
    int op = req.get_op();

    if (opFunctions.find(req.get_op()) == opFunctions.end()) {
        resp.set_exitCode(-3); // 非法操作符
    }
    else {
        if (y == 0 && op == '/') {
            resp.set_exitCode(-1); // 除零错误
        }
        else if (y == 0 && op == '%') {
            resp.set_exitCode(-2); // 模零错误
        }
        else {
            resp.set_result(opFunctions[op](x, y));
        }
    }

    return resp;
}

// 指定协议, 传输的数据 单个完整的结构化数据 转换成传输格式为: "strLen\r\n_x _op _y\r\n"
// strLen, 即用字符串表示有效载荷的实际长度; _x _op _y, 即为实际的有效载荷, 单个完整的传输数据 我们这里成为 strPackage
void netCal(int sock, const std::string& clientIp, uint16_t clientPort) {
    assert(sock >= 0);
    assert(!clientIp.empty());
    assert(clientPort >= 1024);

    std::string inBuffer;
    while (true) {
        request req;
        char buffer[128];
        ssize_t s = read(sock, buffer, sizeof(buffer) - 1);
        if (s == 0) {
            logMessage(NOTICE, "client[%s:%d] close socket, service done ...", clientIp.c_str(), clientPort);
            break;
        }
        else if (s < 0) {
            logMessage(WARINING, "read client[%s:%d] error, errorCode: %d, errorMessage: %s ", clientIp.c_str(), clientPort, errno, strerror(errno));
            break;
        }

        // 走到这里 读取成功
        // 但是, 读取到的内容是什么呢?
        // 本次读取, 有没有可能读取到的只是发送过来的一部分呢? 如果发送了一条或者多条完整strPackage, 却没有读取完整呢?
        // 这种情况是有可能发生的, 所以不能直接进行 decode 以及 反序列化, 需要先检查

        buffer[s] = '\0';
        inBuffer += buffer; // 将读取到的内容 += 在inBuffer后
        // 然后 根据inBuffer的内容, 检查是否已经接收到了一个完整的 strPackage
        uint32_t strPackageLen = 0;
        std::string package = decode(inBuffer, &strPackageLen);
        // TODO 这里decode 需要实现一些功能
        // 检验inBuffer中是否存在至少一个完整的strPackage, 如果存在则decode并返回decode之后的string, 并获取strPackage有效载荷长度 存储在strPackageLen中
        if (strPackageLen == 0)
            continue; // 说明 没有一个完整的strPackage

        // 走到这里 就获取了一个完整的strPackage并进行了decode, 获取了有效载荷存储到了 package 中
        // 就可以进行反序列化了
        if (req.deserialize(package)) {
            // 反序列化成功, 则进入
            // 处理计算
            response resp = calculator(req);

            std::string respPackage;
            resp.serialize(&respPackage); // 对响应resp序列化
            // 对报文 encode
            respPackage = encode(respPackage, respPackage.size());
            // TODO encode需要实现获取报文有效载荷长度, 并以字符串形式添加报头, 并将添加了抱头的字符串返回
            // 最后就可以响应写入
            write(sock, respPackage.c_str(), respPackage.size());
        }
    }
}

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
        // 绑定了网络信息之后, 不同于 UDP, TCP是面向连接的.
        // 所以 在TCP服务器绑定了进程网络信息到内核中之后, 其他主机就有可能向服务器发送连接请求了
        // 然后, 所以 在绑定了网络信息之后, 要做的事就是 监听套接字
        // 监听是否有其他主机发来连接请求, 需要用到接口 listen()
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

            Task t(serviceSock, peerIP, peerPort, netCal);
            _tP->pushTask(t);
        }
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

    log log;
    log.enable();
    tcpServer svr(port, ip);

    svr.init();
    svr.loop();

    return 0;
}
```

#### **`tcpClient.cc`:**

```cpp
// 客户端实现代码
#include "util.hpp"
#include "protocol.hpp"

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
        std::cout << "请输入表达式 >> ";
        std::getline(std::cin, message); // 从命令行获取消息 到 message中
        if (strcasecmp(message.c_str(), "quit") == 0) {
            // 我们实现了 输入 quit 这个单词就向服务器请求退出 的功能
            // 所以, 在输入 quit 这个单词时, 表示 需要退出
            // 就要将 客户端的退出状态设置为 true, 让客户端不进入下一次循环
            quit = true;
            continue;
        }

        request req;
        if (!makeRequest(message, &req)) {
            continue; // 初始化请求失败
        }

        // 请求创建并初始化成功之后, 就可以序列化 encode 然后发送了
        std::string package;
        req.serialize(&package);

        package = encode(package, package.size());

        ssize_t sW = write(sockFd, package.c_str(), package.size()); // 向客户端套接字文件描述符写入消息
        if (sW > 0) {
            // 写入成功, 就准备接收服务器的回复
            char buff[BUFFER_SIZE]; // 需要与服务器inbuffer大小一致
            ssize_t sR = read(sockFd, buff, sizeof(buff) - 1);
            if (sR > 0) {
                message[sR] = '\0';
            }
            std::string echoPackage = buff;

            // 接收成功服务器的回复, 就需要对接收到的数据 decode 和 反序列化
            response resp;
            uint32_t packageLen = 0;

            echoPackage = decode(echoPackage, &packageLen);

            if (packageLen) {
                // 解码成功, 并获取解码成功的字符串
                resp.deserialize(echoPackage);

                printf("[exitcode: %d] %d\n", resp.get_exitCode(), resp.get_result());
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

#### **`makefile`:**

```makefile
.PHONY:all
all:tcpServerd tcpClient

tcpServerd: tcpServer.cc
    g++ -o $@ $^ -lpthread
tcpClient: tcpClient.cc
    g++ -o $@ $^

.PHONY:clean
clean:
    rm -rf tcpServerd tcpClient
```

#### 演示

![](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722181220059.gif)

### `jsoncpp库` 序列化与反序列化

上面协议的实现中, `request` `response`两个类的序列化与反序列化接口内的具体操作, 都是我们自己写的.

而实际上我们有许多第三方库提供了一些比较方便好用的序列化方法. 

下面我们使用`jsoncpp`库来实现序列化与反序列化的具体操作.

首先要安装`jsoncpp`库, 博主的`CentOS7`服务器:

```shell
sudo yum install jsoncpp-devel
```

![|inline](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722181222732.webp)

`yum`安装的第三方库, 都是直接安装在相应的系统路径下了:

![](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722181224712.webp)

我们对`protocol.hpp`做一些修改:

```cpp
// 定制请求的协议
class request {
public:
    request() {}
    ~request() {}

    // 序列化 -- 结构化的数据 -> 字符串
    // 我们序列化的结构是 : "_x _op _y", 即 空格分割
    void serialize(std::string* out) {
#ifdef MY_SELF
        std::string xStr = std::to_string(get_x());
        std::string yStr = std::to_string(get_y());

        *out += xStr;
        *out += SPACE;
        *out += get_op();
        *out += SPACE;
        *out += yStr;
#else
        Json::Value root;
        root["x"] = _x;   // Json::Value 是key:value类型的结构, 这里相当于 在root中添加 key: "x" 对应 value: _x的值
        root["y"] = _y;   // 同上
        root["op"] = _op; // 同上

        Json::FastWriter fw;
        *out = fw.write(root);
        std::cout << "debug json after: " << *out << std::endl;
#endif
    }

    // 反序列化 -- 字符串 -> 结构化的数据
    bool deserialize(const std::string& in) {
#ifdef MY_SELF
        // in 的格式 1 + 1
        // 先查找两个空格的位置
        size_t posSpaceOne = in.find(SPACE);
        if (posSpaceOne == std::string::npos)
            return false;
        size_t posSpaceTwo = in.rfind(SPACE);
        if (posSpaceTwo == std::string::npos)
            return false;

        // 再获取三段字符串
        std::string dataOne = in.substr(0, posSpaceOne);
        std::string dataTwo = in.substr(posSpaceTwo + SPACE_LEN, std::string::npos);
        std::string oper = in.substr(posSpaceOne + SPACE_LEN, posSpaceTwo - (posSpaceOne + SPACE_LEN));
        if (oper.size() != 1)
            return false; // 操作符不是一位

        _x = atoi(dataOne.c_str());
        _y = atoi(dataTwo.c_str());
        _op = oper[0];

        return true;
#else
        Json::Value root;
        Json::Reader rd;
        rd.parse(in, root); // 将使用Json序列化过的字符串, 再转换存储到 Json::Value root 中

        _x = root["x"].asInt();
        _y = root["y"].asInt();
        _op = root["op"].asInt();

        return true;
#endif
    }

    int get_x() const {
        return _x;
    }
    int get_y() const {
        return _y;
    }
    char get_op() const {
        return _op;
    }
    void set_x(int x) {
        _x = x;
    }
    void set_y(int y) {
        _y = y;
    }
    void set_op(char op) {
        _op = op;
    }

    void debug() {
        std::cout << _x << " " << _op << " " << _y << std::endl;
    }

private:
    int _x;
    int _y;
    char _op;
};

// 定制响应的协议
class response {
public:
    response()
        : _exitCode(0)
        , _result(0) {}
    ~response() {}

    void serialize(std::string* out) {
#ifdef MY_SELF
        std::string exitCode = std::to_string(_exitCode);
        std::string result = std::to_string(_result);

        *out = exitCode;
        *out += SPACE;
        *out += result;
#else
        Json::Value root;
        root["exitCode"] = _exitCode;
        root["result"] = _result;

        Json::FastWriter fw;
        *out = fw.write(root);
#endif
    }

    // 反序列化
    bool deserialize(const std::string& in) {
#ifdef MY_SELF
        size_t posSpace = in.find(SPACE);
        if (posSpace == std::string::npos) {
            return false;
        }

        std::string exitCodeStr = in.substr(0, posSpace);
        std::string resultStr =
            in.substr(posSpace + SPACE_LEN, std::string::npos);

        _exitCode = atoi(exitCodeStr.c_str());
        _result = atoi(resultStr.c_str());

        return true;
#else
        Json::Value root;
        Json::Reader rd;
        rd.parse(in, root);

        _exitCode = root["exitCode"].asInt();
        _result = root["result"].asInt();

        return true;
#endif
    }
    void set_exitCode(int exitCode) {
        _exitCode = exitCode;
    }
    void set_result(int result) {
        _result = result;
    }
    int get_exitCode() const {
        return _exitCode;
    }
    int get_result() const {
        return _result;
    }

    void debug() {
        std::cout << _exitCode << " " << _result << std::endl;
    }

private:
    int _exitCode;
    int _result;
};
```

我们通过条件编译, 给请求和响应类的序列化与反序列化接口, 实现了两种方式.

1. 纯手写的方式, 针对数据做一系列的字符串操作
2. 使用`jsoncpp`库, 提供的序列化与反序列化接口, 快速实现

实现之后, 我们使用

`g++ -o tcpServerd tcpServer.cc -ljsoncpp -lpthread`

`g++ -o tcpClient tcpClient.cc -ljsoncpp`

编译代码 生成可执行文件, 然后运行:

![](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722181229501.gif)

这一次, 是通过`jsoncpp`来实现了数据的序列化和反序列化.

---

