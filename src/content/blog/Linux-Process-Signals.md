---
draft: true
title: "[Linux] 一篇文章, 掌握Linux进程信号: 信号的产生、深入理解信号的处理与捕捉、信号在内核中的表示、进程的内核态与用户态转换分析、volatile关键字..."
pubDate: "2023-04-08"
description: "进程信号, 在Linux系统的学习中, 是一个非常重要的概念. 我们可以通过向进程发送信号来让进程执行某些指定的动作."
image: https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/202306251800986.webp
categories:
    - Blogs
tags:
    - Linux系统
    - 进程
theme: 'light'
featured: true
---

# 进程信号

**进程信号**, 在Linux系统的学习中, 是一个非常重要的概念

我们可以通过向进程发送信号来让进程执行某些指定的动作

以一个简单的例子来说:

一个简单的进程在运行着, 我们给此进程发送信号让子进程终止运行

![|big](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722175526465.gif)

这就是信号的作用, 可以影响进程的运行

> 可以通过`kill`命令, 给进程发送信号, 终止进程

## 介绍进程信号

在日常的生活中, 存在着许多信号的形式: 红绿灯、闹钟、上下课铃声……

我们可以正常的识别每种信号的功能. 比如: 红灯停, 绿灯行. 铃声响后是上课或者下课. 闹钟在提醒我们需要做什么事情了……

这些信号在生活中的某些场景下表示不同的含义, 我们也可以在特定的场所下明白这些信号的含义

在信号出现的时候 能够正确的判断出信号的含义, 并做出相应的动作, 是 **因为我们在信号还未发出的时候, 就已经知道了某些信号的含义. 所以我们在接收到信号之后, 才会做出相应的动作**

而对应的, **Linux操作系统中的 进程信号 是一样的**

Linux的进程信号是 给进程发送 给进程用的, 且信号一定具有一定的含义, *进程接收到信号之后需要 能够正确的处理 接收到的信号*

这意味着, **在接收到信号之前, 进程就应该具备处理信号的能力**, 即:

1. 进程需要有识别进程信号的能力, 可以接收, 也可以分辨出是什么信号
2. 进程需要有处理信号的能力, 即 需要执行信号表示的含义或功能
3. 进程默认拥有1、2的能力, 无论是否接收到信号

**进程的这些能力是 操作系统 赋予的, 每个进程都具有处理信号的能力**

---

生活中的信号是如何处理的？

如果在生活中, 有外卖到了, 外卖小哥打电话, 一般会有一种处理方式？

1. 不管外卖(一般不会吧)
2. 马上放下手头的事情, 去门口取外卖
3. 告诉小哥等一会, 先忙完手头的一点事情再去拿外卖
4. 告诉小哥把外卖放下就行, 然后再决定什么时候去拿

在外卖到的时候, 其实有大概率 手头有其他事情在做. 此时, **外卖到了这件事, 就是异步发生的**

并且, 有时候为了先处理手头的事情, 会暂时将外卖小哥搁置一边, 或者跟外卖小哥说一下把外卖放好. 之后我们再去处理外卖

在告诉外卖小哥把外卖放下之后, 原则上外卖小哥就不该对外卖负责了, 我们就可以随时、 随意处理外卖

而 进程信号 也是相同的道理

**进程信号 是进程间事件异步通知的一种方式**, 也就是说进程在收到信号的时候其实有极大的可能正在处理自己的事情

进程就可以选择是否立即处理接收到的信号.

进程可以直接去处理信号, 也可以暂时将信号搁置到一边, 不立即处理. 

不过, **进程不对信号立即处理, 不代表没有处理信号. 进程接收到信号之后, 一定会先记住这个信号被接收了**

只有进程记住了接收到的信号, 进程才能在之后处理信号

并且, 进程处理信号也会像 生活中处理外卖一样, 存在几种不同的情况:

1. 默认情况, 默认处理. 即, 按照信号的含义进行处理
2. 忽略信号, 不做处理. 即, 不管信号
3. 接收到信号, 自定义处理. 即, 由用户接收信号, 并自定义处理动作

---

在 Linux系统的命令行中, 我们可以使用`kill`命令来给指定进程传递信号

在文章的开始, 我们已经使用了`kill -9`终止了一个进程, `9`其实就是一个进程信号

Linux中, 在`bash(shell环境)`下, 可以使用`kill -l`, 查看进程信号列表:

![|huger](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722175529663.webp)

> 如果是`zsh(shell环境)`, 可能只会输出一小部分:
>
> ![|huger](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722175531264.webp)

`kill -l`显示出的Linux进程信号的列表

进程信号中,  **1~31 号都是普通的进程信号**, 而 **34~64 都是属于实时信号**

**实时信号 是需要 立即处理 的**, 而普通信号 不需要 立即处理

这些信号在使用的时候, 可以直接使用各信号前面的数字, 也可以使用信号字母

**数字是 信号的编号, 而大写字母则是信号的名称**

并且, 看到这些都是大写字母组成的信号, 第一时间可以与C语言的宏联想起来

其实这些信号都是 **宏**, 这些宏定义在**`signum.h`**相关头文件中, 一般都在`/usr/include/bits/.`路径下:

![ |huge](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722175533555.webp)

除了直接查看头文件里定义的内容, 还可以通过`man 7 signal`来查看man手册中记录的有关信号的内容: 

![](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722175535787.webp)

`man`手册中, 不仅记录了信号的宏定义, 还记录了 **信号的类型 和 含义, 即 默认处理方法**

## 进程信号的处理

在介绍进程信号的产生流程之前, 先来猜测一下 *进程信号是如何发送给进程的？*

进程是由 PCB 控制的, 而 PCB 实际上是由操作系统管理控制的

大胆猜测一下, 进程信号 其实就是操作系统通过 **修改进程PCB中的数据 来达到 向进程发送信号的目的**？

是的, **进程PCB中描述着 一个记录进程信号的 `位图`, 当使用指令或其他方式 向进程发送信号时, 操作系统就会将进程信号位图的指定位置 写入1**

位图中指定位置的数据变为了1, 就说明写入了相应的信号. **进程就根据位图信息 来判断接收到了什么信号**

这就是 信号发送给进程的原理, 并且也解释了 进程是如何接收信号的

因此, **向进程发送信号 也可以说 向进程写入信号**

---

上面在介绍进程信号的时候, 我们提到, 进程对接收到的信号的处理一般分为三种: 

1. 默认情况, 默认处理. 即, 按照信号的含义进行处理
2. 忽略信号, 不做处理. 即, 不管信号
3. 接收到信号, 自定义处理. 即, 由用户接收信号, 并自定义处理动作

默认情况, 即表示 此信号的默认处理方法, 大多都是中断进程

忽略信号, 即表示 不管信号

但是 进程接收到信号 自定义处理, 则是一种特殊情况

自定义处理方法 是由程序的编写者定义的

当用户编写了指定信号的自定义处理方法时, 进程在接收到信号之后, **本该由系统内核处理的信号 会转换为用户态的指定处理方法 来处理信号**, 这种情况被称为 **信号的捕捉**

### `signal()`捕捉信号

`signal()`是一个系统调用接口, 用于捕捉进程信号, 并由用户处理:

![|lwide](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722175538998.webp)

此函数的声明为: `sighandler_t signal(int signum, sighandler_t handler);`

看起来非常的麻烦, 但其实 `sighandler_t` 只是一个 返回值为空 参数为一个int类型 的函数指针: `void (*)(int)`

也就是说, `signal()`函数的返回值是一个函数指针, 其第二个参数也需要传入一个函数指针

`signal()`的参数: 

1. `int signum`, 为`signal()`的第一个参数, 需要传入指定的信号编号, 表示 **捕捉此信号 自定义处理**

2. `sighandler_t handler`, 为`signal()`的第二个参数, 需要传入一个 返回值为空 参数为一个`int`类型 的函数指针, 其实可直接传入一个函数名

  传入的函数, 即为  **`指定信号的自定义处理函数`**.

  即, 当捕捉到指定信号之后, 不会按照默认情况去处理此信号, 而是通过我们传入的自定义函数来处理

  > 一般在函数的参数中传入一个函数指针, 此函数指针一般可能用于回调
  >
  > 此函数可被称为回调函数、回调方法

那么, `signal()`究竟是怎么使用的呢？有什么效果呢？

可以通过这段代码一探究竟: 

```cpp
#include <iostream>
#include <unistd.h>
#include <signal.h>
using std::cout;
using std::endl;

int cnt = 1;

void handler(int signo) {
    cout << "我是进程, 我捕捉到一个信号: " << signo << ", 这是第 " << cnt << " 次" << endl;
    cnt++;
}

int main() {
    signal(2, handler);
    sleep(1);
    cout << "进程已经设置完了" << endl;

    while (true)
    {
        cout << "我是一个正在运行中的进程: " << getpid() << endl;
        sleep(1);
    }

    return 0;
}
```

`Ctrl+C`快捷键会给当前会话的所有前台进程发送`2信号(SIGINT)`, 此信号的默认处理方式是: **从键盘中断进程**

![no_signal_SIGINT |big](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722175541738.gif)

而上面的代码中, 我们通过使用 `signal()` 将2信号的处理方式设置为一个自定义的回调函数

再使用 `Ctrl+C` 会发生什么呢？

![signal_SIGINT |big](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722175543612.gif)

可以看到, 尽管使用`Ctrl+C`快捷键 却不能中断进程了, 而是不断回调我们传入的函数 以自定义处理信号

因为捕捉了`Ctrl+C`发送的`SIGINT(2)`信号, 

这就是`signal()`的作用, **捕捉指定信号, 并自定义处理**

> 按理论来说, `signal()`是可以针对所有的普通信号进行捕捉的, 但实际上存在例外: 
>
> `signal()`无法捕捉`9信号(SIGKILL)`
>
> 也就是说, 即使使用了`signal(9, handler);`, 给进程发送9信号, 进程依旧会默认处理: 
>
> ```cpp
> #include <iostream>
> #include <unistd.h>
> #include <signal.h>
> using std::cout;
> using std::endl;
> 
> int cnt = 1;
> 
> void handler(int signo) {
>  cout << "我是进程, 我捕捉到一个信号: " << signo << ", 这是第 " << cnt << " 次" << endl;
>  cnt++;
> }
> 
> int main() {
>  signal(9, handler);
>  sleep(1);
>  cout << "进程已经设置完了" << endl;
> 
>  while (true) {
>      cout << "我是一个正在运行中的进程: " << getpid() << endl;
>      sleep(1);
>  }
> 
>  return 0;
> }
> ```
>
> ![signal_SIGKILL |wide](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722175546058.gif)

这是处理进程信号的一种方式, 即 用户自定义处理方法来处理信号

那么进程信号究竟可以怎么样产生呢？

## 用户层产生进程信号的方式

### 键盘产生进程信号

上面我们介绍自定义处理进程信号时, 提到了 **`进程信号可以由键盘产生`** 

比如: `Ctrl+C` 产生 `2)SIGINT` 信号

除此之外, 进程信号还可以通过什么方式产生呢？

### 系统调用产生进程信号

除了键盘产生进程信号之外, Linux系统还提供了一些 系统调用接口来产生进程信号

#### `kill()`

`kill`除了是一个命令之外, 还存在一个同名系统调用`kill()`:

![|lwide](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722175548091.webp)

`kill()`系统调用的用法其实 与 `kill`命令相同

只不过`kill`命令行命令是`kill sig pid`, 而`kill()`系统调用则是 `kill(pid, sig)`

也就是说, `kill()`系统调用的两个参数应该传入:

1. `pid_t pid`, 此参数传入需要发送进程的pid
2. `int sig`, 此参数传入需要发送的进程信号, 可以使用 **信号编号** 也可以使用 **信号宏名**

且, `man`手册中提到, `kill()`执行成功则返回0, 否则返回-1

可以使用`kill()`系统调用, 可以模仿实现一下 命令行的`kill`命令: 

`mykill.cc:`

```cpp
#include <iostream>
#include <cstdlib>
#include <string>
#include <cstring>
#include <cerrno>
#include <sys/types.h>
#include <unistd.h>
#include <signal.h>
using std::cout;
using std::cerr;
using std::endl;
using std::string;

void usage(const string& proc) {
    cout << "Usage:\n\t" << proc << " sig pid" << endl;
}

// 模拟实现 kill命令
// ./mykill sig pid
int main(int argc, char* argv[]) {
    if (argc != 3) {
        usage(argv[0]);             // argv[0] 即为命令行的第一个字符串
        exit(1);
    }

    if (kill( (pid_t)atoi(argv[2]), atoi(argv[1]) ) == -1) {
        cerr << "kill error, " << strerror(errno) << endl;
        exit(2); 
    }
    
    return 0;
    
}
```

执行这段代码的结果是: 

![](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722175550391.gif)

如果不按照要求执行`./mykill`时, 会提示使用方式: `./mykill sig pid`

#### `raise()`

`raise()`也是一个系统调用接口: 

![|lwide](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722175552601.webp)

如果说`kill()`的功能是给指定的进程发送信号, 那么`raise()`就是 **给调用者发送信号**, 即 **给自己发送信号**

那么, `raise()`的调用结果是什么呢？

```cpp
#include <iostream>
#include <unistd.h>
#include <signal.h>
using std::cout;
using std::endl;

int cnt = 1;

void handler(int signo) {
    cout << "我是进程, pid: " << getpid() << ", 我捕捉到一个信号: " << signo << ", 这是第 " << cnt << " 次" << endl;
    cnt++;
}

int main(int argc, char* argv[]) {
    signal(2, handler);

    while (true) {      // 循环给自己发送 信号2
        raise(2);
        sleep(1);
    }
    
    return 0;
}
```

在上面这段代码中, 我们先使用 `signal()` 来捕捉2信号, 然后再循环使用 raise(2) 测试raise()发送信号的结果.

最终的执行结果为: 

![](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722175554812.gif)

从结果可以看出, `raise()`的功能是 **向自己发送信号**

#### `abort()`

`abort()` 是一个使用和作用更加简单的系统调用: 

![|lwide](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722175557344.webp)

此系统调用的作用就是,  **使调用它的进程异常终止**

> `man`手册中关于`abort()`系统调用的描述的大致意思是: 
>
> 首先, 解除对 **`SIGABRT`** 信号的阻塞, 再向调用的进程发送 **`SIGARBT`** 信号
>
> 这会导致进程异常终止, 除非 **`SIGABRT`** 信号被捕捉, 且自定义的处理信号的函数返回
>
> 并且, `abort()` 函数导致进程终止, 会 **关闭并刷新 进程打开的所有流**
>
> 如果, **`SIGABRT` 信号被忽略 或 被捕捉且处理信号的函数会返回, 则 `abort()`函数仍然会将进程终止**
>
> 是如何实现的呢?
>
> 操作系统, 会恢复进程对 **`SIGABRT`** 信号的默认配置, 并通过二次发送信号, 达到终止进程的目的

也就是说,  **调用`abort()`一般情况下一定会使进程异常退出, 无论`SIGABRT`信号是被忽略还是被捕捉**

`abort()`会向自己发送 **`SIGABRT`** 信号, **`SIGABRT`** 信号的编号是什么呢？

![|huger](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722175559305.webp)

那么, 我们可以在代码中使用 `abort()` 函数: 

```cpp
#include <iostream>
#include <cstdlib>
#include <unistd.h>
#include <signal.h>
using std::cout;
using std::endl;

int cnt = 1;

void handler(int signo) {
    cout << "我是进程, pid: " << getpid() << ", 我捕捉到一个信号: " << signo << ", 这是第 " << cnt << " 次" << endl;
    cnt++;
}

int main(int argc, char* argv[]) {
    signal(2, handler);

    while (true) {      // 循环给自己发送 信号2
        raise(2);
        sleep(1);
        if (cnt > 5)
            abort();
    }
    
    return 0;
}
```

![](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722175601597.gif)

正常情况下, `abort()`使进程异常退出

如果, 我们在调用 `abort()`之前, 捕捉了 **`SIGABRT`** 信号, 会如何呢？

```cpp
#include <iostream>
#include <cstdlib>
#include <unistd.h>
#include <signal.h>
using std::cout;
using std::endl;

int cnt = 1;

void handler(int signo) {
    cout << "我是进程, pid: " << getpid() << ", 我捕捉到一个信号: " << signo << ", 这是第 " << cnt << " 次" << endl;
    cnt++;
}

int main(int argc, char* argv[]) {
    signal(2, handler);
    signal(SIGABRT, handler);	// 捕捉 SIGABRT 信号

    while (true) {      // 循环给自己发送 信号2
        raise(2);
        sleep(1);
        if (cnt > 5)
            abort();
    }
    
    return 0;
}
```

![](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722175603892.gif)

可以看到, 进程最终还是调用`abort()`终止了

但, 与不捕捉 **`SIGABRT`** 信号时不同的是, 可以明显看出来 **`abort()`实际上是调用了两次才成功终止了进程**

因为, 可以看到 第一次调用`abort()`, 给进程发送的 **`SIGABRT`** 信号被捕捉了

第二次 才使进程终止了

### 软件条件产生进程信号

**`SIGALRM`** 是一个软件条件产生的信号. 我们可以在程序内 `调用 alarm() 系统调用来设置闹钟`. 

等到闹钟"响" 的时候, 操作系统就会向进程发送 **SIGALRM** 信号. 此信号的默认处理是  **`终止进程`**

**SIGALRM** 信号的编号是14: 

![ |huger](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722175607891.webp)

```cpp
#include <iostream>
#include <cerrno>
#include <unistd.h>
using std::cout;
using std::endl;

int cnt = 0;

int main(int argc, char* argv[]) {
    alarm(1);           // 设置 1s 的闹钟

    while (true) {
        cout << "count: " << cnt++ << endl;
    }

    return 0;
}
```

![alarm  |inline](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722175610419.gif)

这段代码的作用, 其实是计算了 1s 内操作系统的I/O次数.

> 1s 内的 I/O 次数, 不等于1s内硬件计算的次数, 如果将代码改为下面这样: 
>
> ```cpp
> #include <iostream>
> #include <unistd.h>
> #include <signal.h>
> using std::cout;
> using std::endl;
> 
> int cnt = 0;
> 
> void handler(int signo) {
>     cout << "我是进程, pid: " << getpid() << ", 我捕捉到一个信号: " << signo << endl;
>     cout << "count: " << cnt << endl;
>     exit(1);
> }
> 
> int main(int argc, char* argv[]) {
>     signal(SIGALRM, handler);
>     alarm(1);           // 设置 1s 的闹钟
> 
>     while (true) {
>         cnt++;
>     }
>     
>     return 0;
> }
> ```
>
> ![cnt_alarm |wide](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722175612837.gif)
>
> 可以看到, 最终的执行结果就是 亿级的, 而不是万级
>
> 这才是, 计算的速度. 
>
> 所以说,  **`I/O速度 相比较于硬件的运行速度 是非常的慢的`**

alarm() 是一个系统调用, 但是 **SIGALRM** 信号 并 **`不是这个系统调用本身产生的`**.

alarm() 的作用只是设置一个闹钟,  **`只是设置了一个条件`**.

### 硬件异常产生进程信号

我们在使用语言的时候, 一定会遇到一种情况: 程序崩溃了.

比如, 我们在代码中写入 `除0`、`解引用空指针` 或 `越界访问` 操作: 

```cpp
#include <iostream>

int main() {
    // 越界访问
    int arr[10];
    arr[100000] = 0;
    
    // 解引用空指针
    //int* pi = nullptr;
    //*pi = 10;
    
    // 除0
    //int i = 10;
    //i /= 0;

    return 0;
}
```

除0, 执行结果:

![ |inline](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722175615617.webp)

报出 `浮点异常` 的错误

解引用空指针, 执行结果: 

![ |inline](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722175617228.webp)

报出 `段错误`

越界访问, 执行结果: 

![ |inline](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722175619119.webp)

也是报出 `段错误`

这两个错误的结果都是导致进程崩溃退出. 我们现在只能说它是发生了某种错误导致进程崩溃退出了. 

而  **`进程崩溃的本质是什么呢？`**

其实 进程崩溃的本质是  **`进程收到了异常信号`**

我们可以测试一下, 当我们把信号都捕捉并自定义处理之后, 再发生 段错误 或 浮点异常 时: 

```cpp
#include <iostream>
#include <sys/types.h>
#include <unistd.h>
#include <signal.h>
using std::cout;
using std::endl;

void handler(int signo) {
    cout << "我是进程, pid: " << getpid() << ", 我捕捉到一个信号: " << signo << endl;
    exit(1);
}

int main() {
    // 捕捉进程, 自定义处理
    for(int sig = 1; sig <= 31; sig++) {
        signal(sig, handler);
    }
    // 越界访问
    int arr[10];
    arr[100000] = 0;
    
    // 解引用空指针
    //int* pi = nullptr;
    //*pi = 10;

    // 除0	
    //int i = 10;
    //i /= 0;

    return 0;
}
```

此时代码的执行结果是:

1. 越界访问:

	![|wide](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722175622291.webp)

2. 解引用空指针:

	![|wide](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722175623963.webp)

3. 除0: 

	![|wide](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722175625827.webp)

可以看到, 当我们将1~31信号自定义处理时, 从代码的执行结果就可以看出来, 其实 进程代码发生异常错误导致进程崩溃退出,  **`本质上是 异常错误产生了相应的信号 并发送给了进程, 进而才导致了进程的退出`**

我们看到, `越界访问和解引用空指针` 会产生信号11, 而 `除0` 会产生信号8. 这两个信号在Linux系统中, 可以看到: 

![ |huger](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722175627419.webp)

这两个信号的默认处理方案都是 使进程终止.

#### 除0 和 越界访问、野指针 如何产生相应信号

通过上面的介绍, 我们知道了 除0错误 和 越界访问或野指针问题 导致进程崩溃退出, 本质上是因为这两个错误产生了信号 并发送给了进程, 才导致进程退出的.

那么, 自然而然就有一个问题: 这些错误是如何产生进程信号的？操作系统是如何知道的？

##### 除0

有关 除0错误 产生信号, 过程其实是这样的.

再分析之前, 我们要先明白一点:  **`进程的所有非图形计算操作实际上都是由CPU执行的`**.

也就是说, 进程执行的 除0 操作, 其实也是在CPU内部执行的. 而 CPU 内部有一个寄存器, 叫状态寄存器. 当 CPU执行到除0操作时, 很明显CPU是不能正确计算的, 此时CPU就会  **`将状态寄存器设置为有错误`** 的状态: 浮点数异常.

即, CPU内部的寄存器设置了错误状态, 操作系统就可以识别到CPU内有报错. 然后 操作系统就会做两件事

1. 操作系统需要识别是谁报的错, 即 操作系统需要知道是哪个进程报的错
2. 操作系统需要识别是什么错误, 即 操作系统需要知道进程因为什么出现了错误

然后, 操作系统就会 构建相应的信号 –> 向目标进程发送信号 –> 进程在合适的时候处理信号 –> 进程终止

##### 越界访问、野指针

除0操作实际上是因为 CPU这个硬件计算时出错, 而产生的信号

那么 越界访问和野指针又是因为什么呢？

首先, 我们知道 我们使用的语言层面的地址, 其实都是虚拟地址. 进程在访问虚拟地址时, 会  **`通过虚拟地址转化为物理地址, 再找到物理内存, 在读取访问对应的数据或代码`**. 

而 地址的转化工作 实际上是由 MMU(内存管理单元——硬件) 和 页表(软件) 结合实现的. 如果 访问的虚拟地址存在问题, 那么 转化过程就会出现错误, 此时的错误会在 MMU硬件上体现出来, 操作系统也就可以发现硬件出现了问题.

然后 操作系统就还会做那两件事: 

1. 操作系统需要识别是谁报的错, 即 操作系统需要知道是哪个进程报的错
2. 操作系统需要识别是什么错误, 即 操作系统需要知道进程因为什么出现了错误

然后, 操作系统就会 构建相应的信号 –> 向目标进程发送信号 –> 进程在合适的时候处理信号 –> 进程终止

---

也就是说, 实际上 进程在执行内部代码时出现的这两个错误, 实际上 **`都会在硬件上体现出来, 然后产生相应的信号`**, 再通过操作系统发送给进程.

这也就是进程信号产生的第四种方式, 硬件异常产生

我们已经理解了 进程崩溃退出的本质其实是硬件异常产生了会让进程退出的信号. 

那么,  **`进程崩溃一定会使进程退出吗？`**

答案是否定的,  **`进程崩溃的本质是进程收到了信号, 不能再正常运行了`**. 而信号的处理 处理默认情况, 还是有其他情况的. 比如, 当我们把指定的信号捕捉并自定义处理方法时, 进程就不会退出了

下面这段代码的例子, 就很好的展示进程崩溃不退出的情况: 

```cpp
#include <iostream>
#include <sys/types.h>
#include <unistd.h>
#include <signal.h>
using std::cout;
using std::endl;

int cnt = 0;

void handler(int signo) {
    cout << "我是进程, pid: " << getpid() << ", 我捕捉到一个信号: " << signo << ", count: " << cnt++ << endl;
}

int main() {
    // 捕捉进程, 自定义处理
    signal(8, handler);
    
    // 除0	
    int i = 10;
    i /= 0;

    return 0;
}
```

![code_err_noexit  |inline](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722175631015.gif)

这段代码的执行结果是, 无限的输出 捕捉到了8信号.

这是因为, 我们使用 `signal(8, handler);` 捕捉并自定义处理了 8信号, 并且处理方法不会使进程退出. 在此基础上, 操作系统因为检测到了浮点异常错误, 就会不停的向进程发送 8信号, 进程也会不停的接收并处理此信号. 但是由于处理方法并不涉及进程的退出, 所以进程不会退出.

即, 进程崩溃 实际并不一定会退出

## core dump

core dump 是什么？

再我介绍进程等待的时候, 为了获取进程的退出码. 我介绍了获取 进程退出码以及信号码时 的方法和结构.

在那时, 简单的提了一句话: 

status指针指向的是一个整型, 而这个整型只需要关注 `低16位`就可以了, `此低16位中的高8位 用来表示退出码, 低8位 用来表示退出信号`

![ |big](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722175633437.webp)

并且, 还提到表示退出信号的8位,  **`暂时只需要关注低7位, 其中最高位是一个单独的 core_dump 标志, 暂时忽略`**

> 博主有关进程控制的文章的相关链接: 
>
> [[Linux\] 详析进程控制: fork子进程运行规则？怎么回收子进程？什么是进程替换？进程替换怎么操作？](http://humid1ch.cn/posts/Linux-Process-Control)

那么, core dump 究竟是什么？

core dump *`可以是一个动作 叫做 内存快照`*. 

也*`可以是 stutas 整型中的一个标记位`*, 此标记位 表示进程是否执行了 core dump 操作, 如果 **`执行了 core dump标记位就会被置为1`**,  **`否则会被置为0`**. 

而 进程只有在接收到特定的信号时, 才可能会执行 core dump 操作:

![ |huger](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722175635306.webp)

我们可以通过在命令行使用 `man 7 signal` 命令, 来查看man手册中记载的有关进程信号的部分详细信息. 其中记录着各信号以及其编号.

并且, 在信号表中 有着 *`Action一栏`*. 此栏中 *`记录着 Core 的信号被进程接收到之后, 进程就有可能会发生 core dump操作`*, 如果执行了, 对应的 进程退出信息中的 core dump 标志位就会被设置为1.

但是, 我们在测试进程崩溃的原因时, 并没有发现进程有任何 core dump操作的迹象:

```cpp
#include <iostream>
#include <sys/types.h>
#include <sys/wait.h>
#include <unistd.h>
using std::cout;
using std::endl;

int main() {
    pid_t id = fork();
    if(id == 0) {
        // 子进程 除0错误, 应该接收到 8信号
        int i = 10;
        i /= 0;
        exit(1);
    }

    // 父进程等待子进程
    int status = 0;
    waitpid(id, &status, 0);
    printf("exitcode: %d, signo: %d, core dump flag: %d\n", (status>>8) & 0xFF, status & 0x7F, (status>>7)&0x1);

    return 0;
}
```

我们已经知道了, 除0 错误时 进程其实会接收到 8信号, 而 8信号应该是会执行 core dump操作的, 那么对应进程的推出信息中的core dump 标志位也应该被置为1. 

但实际上, 我们执行上面的代码的结果是: 

![ |inline](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722175638183.webp)

我们在子进程中执行了除0操作, 并且父进程等待子进程接收退出信息. 但是最终 core dump标志位的值并不是1.

这是为什么呢？

其实这与系统的设置有关, 我们在命令行使用 `ulimit -a` 可以查看系统的一部分相关设置: 

![ |large](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722175639473.webp)

其中, 有一个 core file size 的设置, 如果你使用的是云服务器的话, 这个设置应该不是0 就是 unlimited.

如果  **`使用的是虚拟机的话, 这个设置应该是有数值的, 也不会出现进程不执行 core cump的情况`**

当, 我们使用 `ulimit -c 20` 将 core file size 设置为 20 之后, 再执行上面的代码程序: 

![ |inline](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722175641348.webp)

![ |inline](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722175643391.webp)

其实, `core file size` 设置就是 设置系统可生成的 core文件的数量, 服务器默认会设置为0

所以, 在没有更改 `core file size` 时, 即使接收到了某些会执行 core dump操作的信号, 也不会执行 core dump

因为, `core dump 操作其实就是将进程的内存信息和当时的部分运行状态 "快照" 下来, 存储到 core 文件中`

core 文件的命名, 其实就是  **`core.进程pid`**

### core 文件有什么用？

那么 core 文件有什么用?

我们查看core文件的内容: 

![ ](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722175645096.webp)

可以看到, 都是乱码.

那么 core 文件是怎么用的呢？

其实是这样用的: 

1. 首先, 我们将上面的代码重新 以调试模式 编译链接一下: 

	`g++ -g mykill.cc -o mykillg`
	
	![|wide](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722175647315.webp)

2. 然后再执行 `./mykillg`, 会生成一个新的 core文件

	![|wide](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722175648913.webp)

3. 然后我们使用 gdb 调试进程: 

	`gdb mykillg`
	
	![|wide](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722175650794.webp)

4. 在 gdb 调试界面, 直接输入 `core-file core.2127`

	![|wide](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722175652649.webp)
	
	可以发现, 我们通过gdb调试进程时使用core文件, 可以  **`直接定位出 进程上次运行的错误位置、信息`**

也就是说 core 文件, 其实是为 事后使用gdb调试程序时 快速定位错误信息 所生成的文件.

---

不过, 在服务器中 core文件的生成 默认是关闭的. 

这是为什么呢？

在我的服务器中, 我们一段这么简单的代码 生成的core文件有多大？

![ |inline](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722175654270.webp)

一个 core文件就是16KB.

那如果是企业中的某个服务项目呢？如果某个服务项目代码内部发生了错误, 导致服务崩溃了. 又会生成多么大的 core文件？

并且, 企业中的服务项目发生错的导致关闭之后, 企业首先要做的是什么？ 尝试重启服务, 不停的尝试. 并尝试修复错误.

如果在不停尝试重启服务的过程中, 服务也在不停发生错误, 从而不停的生成 core文件, 那么将会占用服务器的多少资源？这个资源占用是非常庞大的.

所以说, 为了防止 因为core文件占用服务器资源过大, 服务器上的 core file size 一般都是设置为0的

## 进程信号在内核中的表示

文章上面的内容, 着重谈论的是 进程信号的产生 和 简单的处理. 

并没有着重谈论 进程信号产生之后, 进程处理信号的详细操作 以及 进程信号产生 到 进程接收 之间的内核表现.

下面就来着重谈论一下, 进程信号在内核中的表示 以及 进程内部处理进程信号的详细操作

### 进程信号相关概念

为了方便介绍进程信号在进程内核中的表示, 这里还需要介绍几个概念: 

1. 进程 执行对进程信号的实际处理 动作, 称为  **`信号递达`**, 传递的递
2. 进程信号 从产生到递达之间的状态, 称为  **`信号未决`**. 即 信号接收到了, 但是没处理的状态
3. 进程 可以选择  **`阻塞某种进程信号`**. 即 接收到了, 但是阻塞信号递达, 就是不做处理
4. 被阻塞信号产生时, 将保持未决状态, 直到进程解除对此信号的阻塞, 信号才会递达
5. 信号阻塞 和 忽略不同,  **`忽略是处理的行为, 即信号已经递达`**. 而 **`阻塞是递达之前的状态`**

### 在内核中表示

在文章的开头简单介绍进程信号时, 提到过, 进程信号是以位图的形式存储在进程PCB中的.

而实际上, 进程PCB中描述的有关进程信号的位图, 其实有三个: 

![](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722175656739.webp)

task_strcut 结构体中描述则两个位图和一个指针数组.

先介绍 `pending 位图`: 

pending 是未决位图, 用来`表示进程收到的信号, 对应位置即为对应编号的信号`. 当`pending位图中的某位为1, 即表示此位的信号在进程中处于未决状态`. 即 接收了但是还未处理

在上图中, pending 位图中表示 SIGINT(2) 的位置为1, 则表示 进程接收到了 SIGINT(2) 信号, 但还未处理.

然后是, `handler 指针数组`:

handler 是`存储进程信号处理方法的数组, 每位对应一个处理方法`. 上图中, 即表示 SIGHUP(1) 信号的处理方法是 SIG_DFL, SIGINT(2) 的处理方法是 SIG_IGN, SIGQUIT(3) 的处理方法是 用户处理方法(sighandler)……一次类推

最后是, `block 位图`:

block 是阻塞位图, 用来表示对应位置的信号是否阻塞. 当`指定位置为1时, 即表示此位置信号会被阻塞`. 上图中 则表示 SIGINT(2) 和 SIGQUIT(3) 被阻塞.

即, 这两个位图和一个指针数组, 需要横着对比观察, 可以更好的分析 进程内核有关信号的描述信息.

总的来说  **`pending 位图表示的是进程接收信号的情况, block 位图表示的是进程阻塞信号的情况, 而 handler 数组表示的是指定信号的对应处理方法`**

那么, 按照对三个结构的分析. 上图展示的例子中:

1. SIGHUP(1) 信号, 进程对此信号的处理方法是 SIG_DFL, 进程并没有收到此信号(pending为0), 也没有阻塞此信号递达(block为0).
2. SIGINT(2) 信号, 进程对此信号的处理方法是 SIG_IGN, 进程收到了此信号(pending为1), 但是进程会阻塞此信号递达(block为1), 即 进程收到的信号会一直处于未决状态(pending一直为1). 除非阻塞解除
3. SIGQUIT(3) 信号, 此进程对此信号的处理方法是自定义的 sighandler(), 进程没有收到此信号(pending为0), 但是进程会阻塞此信号递达(block为1), 也就是说 即使进程收到了此信号, 此信号也会一直处于未决状态, 除非阻塞解除

#### sigset_t

从上图以及分析来看, 实际上 pending位图 和 block位图 的每一位都只能用 0 or 1 表示, 即只能表示信号或阻塞的存在状态, 并不能表示 有多少信号产生并发送给了进程. 

所以, 对普通信号来说, 如果 `进程阻塞了此信号`, 且此信号已经处于未决状态了, 即使 `再多次的向进程发送此信号`, 当`阻塞解除时 进程最终也只会处理一次此信号`(当然 如果不存在阻塞, 且一直向进程发送信号, 那么进程就会一直处理)

不过, 在Linux操作系统中, pending 和 block 并不是以整型来表示位图的. 而是以一个结构体的形式: `sigset_t`

![ |huge](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722175659215.webp)

`sigset_t` 是一个 typedef 出来的类型, 实际上是一个结构体`__sigset_t`, 不过这个结构体内部只有一个 `unsigned long int`类型的数组

也就是说, 实际上 pending 和 block 位图的表现形式其实是以  **`数组`** 表现出来的

而其中, 实际以 `sigset_t` 形式表现的 pending位图, 被称为 `未决信号集`; 同样以 `sigset_t` 形式表现的 block位图, 被称为 `阻塞信号集`, 也叫 `信号屏蔽字`

### 信号集操作

由于 信号集 实际是以数组来表示位图的, 而且此数组的大小是不固定的.

> 为什么 sigset_t 结构体中的数组大小不固定？
>
> ![|huge](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722175701620.webp)
>
> 这是 此结构体的实际内容.
>
> 其中 __val数组的大小是  `_SIGSET_NWORDS`, 这是一个宏定义. 而 宏的内容是 `(1024 / (8 * sizeof (unsigned long int)))` 
>
> 而不同配置平台的 unsigned long int 类型的大小可能是不同的, 所以 数组的大小也可能不同.

由于数组的大小可能不固定, 所以 我们并  **`不能直接访问此数组来对信号集进行操作`**. 所以 操作系统为我们提供了一些系统调用

```cpp
int sigpending(sigset_t *set);
int sigemptyset(sigset_t *set);
int sigfillset(sigset_t *set);
int sigaddset (sigset_t *set, int signo);
int sigdelset(sigset_t *set, int signo);
int sigismember(const sigset_t *set, int signo);
```

这几个系统调用的使用方法都不困难, 下面来介绍一下: 

1. `int sigpending()`:

    ![|wide](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722175703913.webp)

    使用此接口, 可以获取进程的未决信号集内容, 传入的 sigset_t 指针是一个输出性参数, 获取的未决信号集内容会存储在传入的变量中

    但是, 并不能通过 修改获取到的未决信号集内容 想要一次来修改进程当前的未决信号集.

    成功返回0, 错误返回-1

2. `int sigemptyset()`:

	![|wide](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722175705578.webp)
	
	调用此函数, 会将传入的信号集初始化为空, 即所有信号、阻塞会被消除, 信号集的所有位设置为0
	
	成功返回0, 错误返回-1

3. `int sigfillset()`:

	![|large](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722175707381.webp)
	
	调用此函数, 会将传入的信号集所有位设置为1.
	
	成功返回0, 错误返回-1

4. `int sigaddset()` 和 `int sigdelset()`:

	![|wide](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722175708900.webp)
	
	`sigaddset()` 的作用是, 给指定信号集中添加指定信号, 即 将指定信号集中的指定位置设置为1
	
	`sigdelset()` 的作用是, 删除指定信号集中的指定信号, 即 将指定信号集中的指定位置设置为0
	
	着两个函数, 都是成功返回0, 失败返回-1.

5. `int sigismember()`:

	![|large](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722175710510.webp)
	
	调用此函数, 可以判断 信号集中是否有某信号. 即 判断信号集的某位是否为1
	
	如果 信号在信号集中 返回1, 如果不在 返回0, 如果出现错误 则返回-1

#### sigprocmask()

上面介绍的5个信号集操作接口的功能和使用都很简单.

而 `sigprocmask()` 的使用稍微复杂一些: 

![ ](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722175712487.webp)

`int sigprocmask(int how, const sigset_t *set, sigset_t *oldset)`, 从参数来看就比上面的接口要复杂的多.

而这个接口的作用是:  **`获取 和 修改 信号屏蔽字`**. 这个接口的使用相对来说比较复杂

我们来分析一下, 这个接口的参数都有什么意义: 

> 假设,   **`当前进程的 信号屏蔽字(阻塞信号集) 为 mask`**

1. 首先介绍 `const sigset_t *set` 也就是第二个参数

	第二个参数需要传入一个信号集, 此信号集是  **`修改进程的信号屏蔽字(mask)用的`**.
	
	此参数`需要根据 how(第一个参数) 的不同, 来传入不同意义的信号集`

2. 然后是 `sigset_t *oldset` 第三个参数

	第三个参数也是需要传入一个信号集, 不过一般传入被全部置0的信号集.
	
	此参数是一个输出型参数, 用于获取没做修改的 mask, 即函数执行结束后,  **`此参数会获取没有执行此函数时的mask`**.

3. 最后介绍 `int how` 第一个参数

	how 是一个整型参数, 需要传入系统提供的宏. 不同宏的选择此函数会有不同的功能, 就需要传入不同意义的 set(第二个参数)
	
	| how             | set的意义                               | 函数功能                                                     |
	| --------------- | --------------------------------------- | ------------------------------------------------------------ |
	| **SIG_BLOCK**   | set的内容为 需要添加阻塞的信号的位置为1 | 在mask中 为set指定的信号 添加阻塞. 以位图的角度可以看作 mask \|= set |
	| **SIG_UNBLOCK** | set的内容为 需要解除阻塞的信号的位置为1 | 在mask中 为set指定的信号 解除阻塞. 以位图的角度可以看作 mask &= ~set |
	| **SIG_SETMASK** | set的内容为 需要指定设置的mask          | 将set设置为mask. 以位图的角度可以看作 mask = set             |

只用文字的话, 这个函数的使用方法及功能很抽象. 下面我用图片的形式 解释一下.

1. 如果需要为指定位置添加阻塞: 

	![|wide](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722175714782.webp)
	
	其实就是 将传入的 set 与进程原来的信号屏蔽字 做  **`按位或操作`**, 最终结果 作为进程最新的信号屏蔽字

2. 如果需要为指定信号解除阻塞: 

	![|wide](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722175716771.webp)
	
	其实就是 将传入的 `set先按位取反`, 再与进程原来的信号屏蔽字 做 `按位与操作`. 最终结果 作为进程的新的信号屏蔽字

3. 如果需要直接设置信号屏蔽字: 

	![|wide](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722175718971.webp)
	
	其实就是, 直接将传入的 `set 覆盖进程原来的信号屏蔽字`, 即  **`将传入的set 作为进程新的信号屏蔽字`**

### 信号集操作相关代码演示

经过上面进程信号集相关操作的介绍, 相信大家一定对进程的未决信号集和信号屏蔽字 都已经有了一定程度的了解

我们可以通过 sigpending() 接口来获取进程的未决信号集内容, 但是并不能修改进程当前的未决信号集

我们可以使用 sigmeptyset()、sigfillset()、sigaddset()、sigdelset() 接口对一个信号集的内容做修改

还可以使用 sigismember() 接口 判断某信号是否在此信号集中

还可以使用 sigprocmask() 接口, 来对进程的信号屏蔽字做修改. 

那么 我们就演示一下,  **`对信号屏蔽字做修改, 并向进程发送信号 将进程的未决信号集打印出来查看`**: 

```cpp
#include <iostream>
#include <sys/types.h>
#include <unistd.h>
#include <signal.h>
using std::cout;
using std::cerr;
using std::endl;

int cnt = 0;
void handler(int signo) {
    cout << "我是进程, pid: " << getpid() << ", 我捕捉到一个信号: " << signo << ", count: " << cnt++ << endl;
}

// 打印信号集的函数
void showSignals(sigset_t *signals) {
    // 使用 sigismember() 接口判断 31个普通信号是否在信号集中存在
    // 存在的信号输出1, 否则输出0
    for(int sig = 1; sig <= 31; sig++) {
        if(sigismember(signals, sig)) {
            cout << "1";
        }
        else {
            cout << "0";
        }
    }
    cout << endl;
}

int main() {
    // 先输出进程的 pid
    cout << "pid: " << getpid() << endl;

    // 定义sigsetmask()需要使用的 set 和 oldset, 并初始化
    sigset_t sigset, osigset;
    sigemptyset(&sigset);
    sigemptyset(&osigset);

    // 将进程的 所有普通信号屏蔽
    for(int sig = 1; sig <= 31; sig++) {
        sigaddset(&sigset, sig);
        signal(sig, handler);
    }
    sigprocmask(SIG_BLOCK, &sigset, &osigset);

    // 获取并打印进程的未决信号集
    sigset_t pendings;
    while(true) {
        sigemptyset(&pendings);
        sigpending(&pendings);
        showSignals(&pendings);
        sleep(1);
    }

    return 0;
}
```

这段代码的主要功能部分, 我们 *`先将进程的所有普通信号阻塞`*, 然后 *`再循环获取进程当前的未决信号集并打印出来`*

这段代码的演示结果为: 

![blockshow_noUNBLOCK](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722175723422.gif)

可以看到, 屏幕左侧一直打印进程当前的未决信号集, 而屏幕右侧则不停向进程发送不同的信号

由于 进程阻塞(屏蔽)了所有普通信号, 所以向进程发送的所有普通信号都应该处于未决状态. 事实也确实如此

但是最后我们向进程发送 9信号, 依旧可以终止进程的运行. 9信号是真的无敌

我们还可以设置 30s 后解除某些信号的屏蔽, 然后再查看结果.

我们将循环打印未决信号集的部分代码改为: 

![ |inline](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722175725576.webp)

然后 代码的演示结果为: 

![blockshow_UNBLOCK](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722175727804.gif)

可以看到, 在解除指定信号阻塞之后, 进程处理了对应的未决信号, 即  **`解除信号阻塞之后, 对应信号递达了`**

## 深入理解进程处理信号 **

我们知道, 进程信号抵达 即为 进程处理信号了.

而在信号抵达之前, 信号还存在一个状态: 信号未决.

而且, 我们说 信号处于未决状态之后, 如果信号没有阻塞, 进程会在合适的时候处理信号. 即 `进程会在合适的时候将信号递达`

那么 问题来了, **`什么时候才是合适的时候？`**  **`进程究竟会在什么时候处理信号？`**

这个答案就是: **`当 进程从内核态, 转换为用户态的时候, 进程会进行信号的检测与处理`**

那么就又有问题出现了,  **`什么是内核态？ 什么又是用户态？ 什么是内核态和用户态的转换？`**

### 进程的内核态 和 用户态

我们知道, 操作系统中 每个进程都有一个进程地址空间, 以32位环境举例大概长这样: 

![|large](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722175730986.webp)

并且, 进程地址空间 与 物理内存之间是由 页表相互映射的.

但是我们之间只介绍了一个页表, 即 *`用户空间部分 与 物理内存`* 之间的相互页表映射

而实际上, 进程地址空间 与 物理内存之间并不只有一张页表,  **`还存在一张页表 用于 内核空间 与 物理内存 之间相互映射, 被称为内核级页表`**

并且,  ****`与用户级的页表不同, 进程地址空间的内核空间 与 物理内存之间的映射页表, 整个操作系统只有一张`****, 也就是说操作系统中  **`所有进程共用一张 内核级页表`**. 即: 

![|big](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722175733559.webp)

整个操作系统只有一张内核级页表, 也就意味着 每个进程的 内核空间的内容是相同的, 同样意味着  **`物理内存中 只加载着一份有关进程内核空间内容的数据和代码`**

 **`如果`** 每个进程都可以随便访问内核空间, 那其实就是说 每个进程都可以随便修改 物理内存中只有着一份的、所有进程共享的数据和代码.

但是这样做就太危险了. 物理内存中只有一份的、每个进程共享的数据和代码, 其实就可以看作是系统级数据和代码

而为了保护这部分 数据和代码,  **`进程会分为两种状态`**:  **`内核态`** 和  **`用户态`**

当进程 *`需要访问、调用、执行 内核数据 或 代码(中断、陷阱、系统调用等)时`*, 就会  **`陷入内核, 转化为内核态`**, 因为只有 `进程处于内核态时, 才有权限访问内核级页表, 即有权限访问内核数据与代码`

当进程 *`不需要访问、调用、执行 内核数据 或 代码, 或进程时间片结束时`*, 就会  **`返回用户, 转化为用户态`**, 此时 进程将不具备访问内核级页表的权限, `只能访问用户级页表`

如果用图片表示, 可能就是这样的: 

![|big](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722175735758.webp)

这样有利于 **`保护 内核级数据和代码`**. 也就是  **`进程在发生从内核态转换为用户态的过程时, 会检测进程的信号并处理`**

> 那么,  **`操作系统如何判断进程当前的状态呢？`**
>
> CPU内部存在一个 状态寄存器CR3, 此寄存器内有比特标识位表示当前进程的状态:
>
> 1. 若标识位 表示0, 则表明进程此时处于内核态
> 2. 若标识位 表示3, 则表明进程此时处于用户态

### 深入理解信号处理 *

进程在运行时, 会存在两个状态: 内核态和用户态.

并且, 在进程整个的运行过程中,  **`进程会有无数次的状态转换`**. 为什么呢？

首先我们知道, 我们使用的语言提供的大部分操作, 实际上是  **`没有资格直接访问系统级的软硬件资源`** 的 本质上都会直接或间接地去调用系统接口(printf、scanf……), 然后通过操作系统 `直接或间接地访问一些系统级的软硬件资源`.  操作系统作为所有硬件和软件的管理者肯定是要提供这样的功能的.

只要进程可以正常地运行, 那么进程就总是需要通过操作系统去访问软硬件资源, 然后就会 `无数次地陷入内核(切换状态, 切换页表)`, 再访问内核代码数据, 然后完成访问, `再将结果返回给用户(切换状态, 切换页表)`, 最终用户得到结果.

那么可能有人会问, `如果编写的程序不调用任何函数呢？`

比如, 我`只在 main函数内部使用一个 while(1);` 使进程死循环的运行. 那么, 此`进程还会无数次的发生状态转换吗？`

答案是, `会的`

因为, 只要是进程, 那么他就有一定的时间片. 即使是一个什么都不执行的死循环,  **`只要时间片用完了, 那么就需要将此进程从CPU上剥离下来`**,  而剥离操作一定是操作系统做的, 那么也就是说将  **`进程从CPU上剥离下来也是需要陷入内核执行内核代码的`**. 将进程从CPU上剥离下来的时候, 需要维护一下进程的上下文, 以便下次接着执行进程的代码. 

剥离下来之后, 操作系统执行调度算法, 将下一个需要运行的进程的上下文加载到CPU中, 然后新进程从内核态转换为用户态, CPU再执行新进程的代码.

> 进程被剥离下来, 进程会进入内核态维护起来. 等待下次运行时, 又会回到用户态执行代码.

那么现在我们知道了,  **`即使一个进程什么实际作用都没有, 这个进程的运行过程中, 也会发生无数次的内核态与用户态的转换`**

那么这与信号的处理有什么关系呢？

信号的处理是在 进程从内核态转换为用户态 的时候执行的. 进程从内核态转换到用户态的时候, 会检查进程信号集的状态并对信号进行处理.

我们以简单的一个进程执行了open系统接口举个例子, 那么大概的流程就是: 

![|big](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722175738718.webp)

文字分析:

1. 进程代码运行到open()需要`陷入内核`执行open()代码.
2. 陷入内核并执行完open()代码后, 需要将open()结果返回给用户, 需要转换回用户态
3. 在转换回用户态之前, 需要先在进程PCB中检测进程的未决信号集
4. 在未决信号集中, 检测到1和2信号未决, 并且均为被屏蔽(阻塞). 就需要在handler数组中寻找指定的处理方法
5. 1信号默认处理, 需要执行内核中的默认处理方法(一般为进程终止); 2信号忽略处理, 直接将未决信号集中2信号改为0
6. 处理完信号, 再将open()结果返回给用户, 这个过程需要`转换为用户态`

这个例子中, 未决信号的处理方法都是内核提供的处理方法. 所以在执行信号的处理方法的时候, 都是在内核中执行的.

---

而  **`如果进程的未决信号中存在着用户自定义的处理方法, 又该是怎样的处理方式呢？`**

实际上, 如果处理信号的方法使用户自定义的, 即 用户捕捉了进程信号. 

那么进程就会 **`先去执行用户代码将信号处理了`**, 然后再将open()的结果返回给用户.



不过, 这里会有一个问题:  **`进程执行用户自定义的信号处理函数时, 进程应该以内核态执行还是以用户态执行呢？`**

我们知道, 进程处于内核态的时候是可以访问用户代码的. 那么 此时  **`进程 需不需要切换回用户态`**之后, 再执行用户自定义函数呢？

答案是 **`肯定需要`** 的. 

进程处于用户态时, 是无法访问内核代码的. 这是保护系统的一种方式. 而如果进程此时 以内核态的身份 执行用户代码, 会不会出现什么问题呢？

`假如用户代码存在一些 损坏系统的恶意代码`. 这些恶意代码在`用户态是没有权限执行`的, 而`内核态肯定有权限`.

那么如果此时进程是`以内核态的身份执行用户代码`, 也就意味着`进程有权限执行恶意代码, 那么系统就会被损坏`.

所以, 为了保护系统内核: 

****`当进程需要执行用户方法去处理进程信号时, 进程还会先转换回用户态去执行.`****



既然进程会先转换为用户态, 那么就又有一个问题:  **`执行完用户处理方法之后, 进程还需不需要再陷入内核, 然后再返回用户？`**

这个答案, 也是肯定的: `需要再陷入内核`

因为, 进程原本是因为需要执行内核代码才陷入内核的, 只是在执行完毕之后需要先处理一下信号才暂时回到了用户态. `此时是无法返回到进程原本代码的执行位置的.` 因为  **`进程执行内核代码之后的返回信息 还在内核中`**, 以用户态的身份是无法访问并返回给用户的. 所以, 进程在以用户态的身份执行过信号的用户处理方法之后, 还需要再次陷入内核, 然后根据内核中的返回信息使用特定的返回调用 返回到用户. 

所以, 用图片展示大致的流程就是: 

![|big](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722175741997.webp)

这个流程有些复杂, 可以认真捋一下: 

1. 进程代码运行到open()需要`陷入内核`执行open()代码.
2. 陷入内核并执行完open()代码后, 需要将open()结果返回给用户, 需要转换回用户态
3. 在转换回用户态之前, 需要先在进程PCB中检测进程的未决信号集
4. 在未决信号集中, 检测到3信号未决, 并且均为被屏蔽(阻塞). 就需要在handler数组中寻找指定的处理方法
5. handler数组中, 3信号的处理方法是用户自定义的, 所以需要`换回用户态`去执行用户级代码
6. 以用户态执行完自定义信号处理方法之后, 不能直接返回到用户, 需要`再次陷入到内核`
7. 再次陷入内核之后, 获取返回信息 再调用特定的返回调用, 返回到用户. 这个过程需要`转换回用户态`

可以看到, 如果处理信号`需要执行用户自定义的处理方法`时, 那么 从调用内核代码到返回用户 的整个过程一共需要  **`经历4次状态转换`**

而, 如果处理信号`不需要执行用户自定义处理方法`时, 那么 从调用内核代码到返回用户 的整个过程 就只需要  **`经历2次状态转换`**

---

针对 从调用内核代码到返回用户的整个过程, 可以由一个简化图来解释: 

![|big](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722175745889.webp)

上面的这个简略图, 可以看作是一个  **`无穷∞画法`**

> 这里, 进程执行完用户自定义信号处理方法 返回内核之后, 之后的执行流程与PCB信号集有一个交点.
>
> 此交点表示, 此时 `还会进行 信号集的检测`.
>
> 如果此时又有信号未决, 并且时间片充足, 那么就会再次处理.
>
> 在进程处理信号时, 如果操作系统还向进程发送相同的信号, 进程时不会处理的. 因为pending信号集中 只能表示信号是否存在, 而不能记录信号被发送过来的次数. 也就是说, 信号未决时, 依旧有相同的信号发送过来, 进程不会处理后续的信号. 

### 深入理解信号捕捉

在本篇文章的第二部分内容(进程信号的处理)中, 我们已经介绍了一个系统调用`signal()`用来捕捉信号, 并自定义处理.

除了`signal()`之外, Linux操作系统还为我们提供了另一个系统调用, 来对信号进行捕捉.

#### sigaction()

不过, 这个接口的使用要`更复杂`一些, 但最终要实现的功能与`signal()`是一样的: 

`sigaction():`

![ ](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722175748769.webp)

从man手册中对sigaction()的描述以及参数可以看出, 此函数的使用比 `signal()` 要复杂的多: 

1. 第一个参数 `int signum`, 很明显 这个参数就需要传入指定的进程信号, 表示 **`要捕捉的信号`**

2. 第二个参数 `const struct sigaction *act`, 这个参数很奇怪, 它与此函数同名, 并且是一个结构体指针

	这个结构体的内容是什么？
	
	![|large](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722175750664.webp)
	
	在man手册中, 可以看到 `struct sigaction` 的内容一共有5个: 
	
	1. `void (*sa_handler)(int);`, 此成员的含义其实就是 `自定义处理信号的函数指针`;
	2. `void (*sa_sigcation)(int, siginfo_t *, void *);`, 此成员也是一个函数指针. 但是这个函数的意义是用来 处理实时信号的, 不考虑分析. (siginfo_t 是表示实时信号的结构体)
	3. `sigset_t sa_mask;`, 此成员是一个信号集, 这个信号集有什么用呢？我们在使用时解释
	4. `int sa_flags;`, 此成员包含着系统提供的一些选项, 本篇文章使用中都设置为0
	5. `void (*sa_restorer)(void);`, 很明显 此成员也是一个函数指针. 但我们暂时不考虑他的意义.
	
	也就是说, 我们暂时可以知道, `sigaction()`的第二个参数是一个结构体指针, 并且指向的结构体里 **`有一个成员是用来自定义处理信号`** 的
	
	此参数的作用就是, 将指定信号的处理动作改为传入的`struct sigaction` 的内容

3. `struct sigaction *oldact`, 第三个参数看起来似曾相识, 好像我们在介绍 `sigprocmask()` 接口时的第三个参数

	其实这两个函数的第三个参数的作用是相似的, 都是一个输出型参数.
	
	在 `sigaction()` 这个函数中, 第三个参数的作用是获取 此次修改信号`struct sigaction`之前的原本的`struct sigaction`
	
	如果传入为空指针, 则不获取

那么, 我们就来简单的使用一下这个函数:

```cpp
#include <iostream>
#include <unistd.h>
#include <signal.h>
using std::cout;
using std::endl;

void handler(int signo) {
    cout << "获取到一个信号,信号的编号是: " << signo << endl;
    sigset_t pending;
    // 增加handler信号的时间,永远都会正在处理2号信号！
    while (true) {
        sigpending(&pending);
        for (int i = 1; i <= 31; i++) {
            if (sigismember(&pending, i))
                cout << '1';
            else
                cout << '0';
        }
        cout << endl;
        sleep(1);
    }
}

int main() {
    // 先定义两个 struct sigaction 用于传参
    struct sigaction act, oact;
    
    // 初始化 act
    act.sa_handler = handler;
    act.sa_flags = 0;
    sigemptyset(&act.sa_mask);
    
    // sigaction 捕捉 2信号
    sigaction(2, &act, &oact);
    
    while (true) {
        cout << "I am a process, pid: " << getpid() << endl;
        sleep(1);
    }

    return 0;
}
```

我们设置捕捉2信号, 并在处理时进入死循环打印pending信号集, 即 只要捕捉到2信号就不会再返回到main函数内了.

这段代码的执行结果, 与 使用`signal()`捕捉信号相同, 但是使用要麻烦一些: 

![while_sigaction |inline](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722175753781.gif)

可以看到, 当进程受到 2信号时, 会执行我们自定义的处理方法. 表示我们使用 `sigaction()` 捕捉2信号成功

不过 我们自定义的处理2信号的方法是不会结束的, 所以我们还可以看到, 处理2信号时 我们再次发送2信号给进程, 后面2信号会被拦下来 导致后边的2信号一直处于未决状态 

但是, 我们当给进程发送 `3信号(Ctrl+\)` 时, 进程依旧会去处理3信号.

如果我们想要在处理2信号的同时, 将其他信号也拦住呢？

那么 就要用到 `sa_mask` 了: 

```cpp
#include <iostream>
#include <signal.h>
#include <unistd.h>
using std::cout;
using std::endl;

void handler(int signo) {
    cout << "获取到一个信号,信号的编号是: " << signo << endl;
    sigset_t pending;
    // 增加handler信号的时间,永远都会正在处理2号信号！
    while (true) {
        sigpending(&pending);
        for (int i = 1; i <= 31; i++) {
            if (sigismember(&pending, i))
                cout << '1';
            else
                cout << '0';
        }
        cout << endl;
        sleep(1);
    }
}

int main() {
    // 先定义两个 struct sigaction 用于传参
    struct sigaction act, oact;

    // 初始化 act
    act.sa_handler = handler;
    act.sa_flags = 0;
    sigemptyset(&act.sa_mask);
    sigaddset(&act.sa_mask, 3);         // 在 act.sa_mask 中设置 3信号

    // sigaction 捕捉 2信号
    sigaction(2, &act, &oact);

    while (true) {
        cout << "I am a process, pid: " << getpid() << endl;
        sleep(1);
    }

    return 0;
}
```

我们在需要传入`sigaction()` 的第二个参数中的`sa_mask`信号集中, 添加 3信号.

就可以做到  **`进程捕捉到指定信号并自定义处理的同时, 阻拦3信号的递达`**

执行结果如下:

![while_sigaction(2)_mask3](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722175756808.gif)

即, `struct sigaction`结构体的`sa_mask` 成员的意义是,  **`添加进程在处理捕捉到的信号时对其他信号的阻塞`**. 如果需要添加对其他信号的阻塞, 那么就可以继续在 `sa_mask` 中添加其他信号.

不过, 这样做有什么意义呢？

这样做可以 ** **`防止用户自定义处理信号时, 嵌套式的发送其他信号并捕捉处理`****. 

如果 用户的自定义处理信号方法内部, 还会发送其他信号, 并且用户还对其进行了捕捉. 那么 信号的处理就无止尽了. 这种情况是不允许发生的.

所以 可以通过使用 `sa_mask` 来进行对其他信号的拦截阻塞.

#### 信号捕捉技巧

一般情况下, 我们如果要捕捉指定的信号, 并对信号进行不同的处理, 首先就是需要编写不同的处理函数.

然后再通过 `signal()` 或 `sigaction()` 传入不同的信号以及对应的不同的处理方法进行对信号的捕捉.

不过, 我们还可以通过一种方式使 调用`signal()`或`sigaction()`捕捉信号时, 只传入相同的函数指针就可以实现 对不同信号不同处理: 

![ |inline](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722175759062.webp)

当我们定义完指定信号的处理函数之后, 我们可以再定义一个 `handlerAll(int signo)` 函数, 并使用 switch 语句, 将不同的 signo 分别处理.

> 如果需要捕捉的信号过多, 也可以使用 一定的数据结构 将所有的信号自定义处理函数存到数组结构中, 然后再通过指定方法进行对信号的分别处理.

此时, 我们在使用`signal()`或者 `sigaction()` 捕捉信号时, 就只需要统一传入 `handlerAll` 的函数指针就可以了.  

这是一种 解耦技巧

## 可重入函数

关于可重入函数的解释, 可以从一个具体的例子进行分析: 

一个进程中, 存在一个 **`全局的单链表`** 结构. 并且此时需要执行一个节点的头插操作: 

![|inline](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722175801466.webp)

那么此时, 头插的操作就是: 

```cpp
node1->next = head;
head = node1;
```

如果 `刚执行完第一步` 之后, 进程因为硬件中断或者其他原因 `陷入内核了`.

陷入内核之后需要回到用户态继续执行, 切换回用户态时 进程会检测未决信号, 如果此时刚好存在一个信号未决, 且此信号自定义处理.

并且, 自定义处理函数中 也存在一个新节点头插操作:

![](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722175803337.webp)

那么此时, 就会执行 `node2` 的头插操作, 执行完毕的结果就是: 

![](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722175805407.webp)

即, `node2 成为了链表的第一个节点 head`

信号处理完毕之后, 需要返回用户继续执行代码, 用户刚执行完 `node1->next = head;`

所以下面应该执行 `head = node1;`, 结果就成了这样:

![](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722175807673.webp)

结果就是, `node2` 无法被找到了.

这个结果是: main函数和信号自定义处理函数, 先后向单链表中头插两个节点, 而最后只有一个节点真正插入链表中了  

这个结果造成了什么问题？  **`内存泄漏`**, 这是一个很严重的问题

那么造成这个结果的原因是什么？

是因为 单链表的头插函数, 被不同的控制流程调用了, 并且是在第一次调用还没返回时就再次进入该函数, 这个行为称为  **`重入`**

而 像例子中这个单链表头插函数, 访问的是一个全局链表, 所以`可能因为重入而造成数据错乱`, 这样的函数 被称为 `不可重入函数`, 即此函数不能重入, 重入可能会发生错误

反之, 如果`一个函数即使重入`, 也`不会发生任何错误`(一般之访问函数自己的局部变量、参数), 这样的函数就可以被称为 `可重入函数`. 因为每个函数自己的局部变量是独立于此次函数调用的, 再多少次调用相同的函数, 也不会对之前调用函数的局部变量有什么影响.

> 如果一个函数符合以下条件之一则是`不可重入`的:
>
> 1. 调用了`malloc`或`free`, 因为 `malloc` 也是用全局链表来管理堆的
> 2. 调用了标准I/O库函数, 标准I/O库的很多实现都以不可重入的方式使用全局数据结构

## volatile 关键字

C语言有许多的关键字, `volatile` 也是其中之一. 下面分析一下这个关键字的作用

要分析 volatile 的作用, 需要使用下面这个例子: 

`myproc.c(注意是C语言文件):`

```cpp
#include <stdio.h>
#include <signal.h>

int flags = 0;

void handler(int signo) {
    printf("获取到一个信号,信号的编号是: %d\n", signo);
    flags = 1;
    printf("我修改了flags: 0->1\n");
}

int main() {
    signal(2, handler);

    while (!flags)
        ;
    // 未接收到信号时, flags 为 0, !flags 恒为真, 所以会死循环
    printf("此进程正常退出\n");

    return 0;
}
```

此代码, 通过处理2信号, 将全局变量 flags 从0改为1, 使进程正常退出. `正常编译` 运行的结果是:

![novolatile |inline](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722175811975.gif)

此代码的main函数中, 不会对 flags 做出修改. 

虽然 2信号的自定义处理函数 会对flags作出修改, 但是这个函数的执行是未知的. 即 不确定进程是否会收到2信号 进而执行此函数.

那么对编译器来说, 就有`可能对 flags 做出优化`.

我们知道, 进程再判断数据时, 是CPU在访问数据, 而CPU访问数据时 会将数据从内存中拿到寄存器中. 然后再根据寄存器中的数据进行处理.

在此例中, 就是 `while(!flags);` 判断时, CPU会从内存中拿出数据进行判断. 当flags从0变为1时, 是`内存中的数据发生了变化, CPU也会从内存中拿到新的数据进行判断`  

而 此例中编译器可以确定一定会执行的代码中, flags是不会被修改的. 那么 编译器就可能针对flags做出优化: 

**由于编译器认为进程不会修改 flags, 那么在 `while(!flags);` 判断时, CPU读取到flags为0 并存放在寄存器中之后, 为了节省资源 在之后的判断中 CPU 不会再从内存中读取数据, 而是直接根据寄存器中存储的数据进行判断. **

**这就会造成 即使处理信号时将 flags 改为了1, 在进行 `while(!flags);`判断时, CPU依旧会只根据寄存器中存储的0 来进程判断, 这就会造成 进程不会正常退出**

还是相同的代码, 我们可以在`gcc` 编译时, 使用 `-O2` 选项 让编译器做出这样的优化: 

![novolatile_O2 |inline](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722175814592.gif)

优化之后, 在运行可执行程序. 可以看到 我们发送 2信号 即使将flags改为了1, 也已经不能让进程正常退出了.

这就是编译器 对不一定做修改的数据的优化.

而, 如果我们在 flags定义时 使用volatile关键字, 那么就会有不同的结果: 

```cpp
volatile int flags = 0; 		// 全局变量
```

![volatile_O2  |inline](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722175819101.gif)

这就是 `volatile` 关键词的作用, 即  **`保持内存的可见性`**. 告知编译器, 被该关键字修饰的变量, 不允许被优化, 对该变量的任何操作, 都`必须在真实的内存中进行操作` 

## SIGCHLD 信号

在介绍进程等待的时候, 文章中提到过: 子进程不是默默的退出, 而是需要让父进程接收退出信息之后, 才退出的. 否则 子进程会进入僵尸状态.

所以我们介绍了进程等待的函数, `让父进程主动去询问子进程是否退出是否需要接收退出信息`

而, 实际上 子进程退出是会通知父进程的, 只不过父进程会忽略而已. 

这个通知的方式是: ** **`子进程退出时, 会向父进程发送一个信号, 即 SIGCHLD 信号`****

怎么证明呢？

很简答, 我们只需要在父进程中捕捉 `SIGCHLD信号` 就可以了:

```cpp
#include <cstdlib>
#include <iostream>
#include <signal.h>
#include <unistd.h>
using std::cout;
using std::endl;

int flags = 0;

void handler(int signo) {
    cout << "子进程退出, 我收到了信号: " << signo << "我是: " << getpid() << endl;
}

int main() {
    signal(SIGCHLD, handler);
    pid_t id = fork();
    if (id == 0) {
        // 子进程
        while (true) {
            cout << "我是子进程, pid: " << getpid() << endl;
            sleep(1);
        }
        exit(0);
    }

    // 父进程
    while (true) {
        cout << "我是父进程, pid: " << getpid() << endl;
    }

    return 0;
}
```

这段代码的执行结果是:

![SIGCHLD](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722175822821.gif)

可以看到, 子进程退出时 父进程确实收到了一个信号, 这个信号是 17.

17 是 **SIGCHLD** 吗？可以在man手册中查看: 

![ |huger](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722175824881.webp)

可以看到, **SIGCHLD** 的值确实是17. 而 默认的处理是 `ignore` 忽略

那么, 也就是说 子进程退出时子进程其实会给父进程发送一个 **SIGCHLD** 信号. 还有其他情况吗？

man手册中写了, 子进程暂停或终止时会发送 **SIGCHLD** 信号, 我们来测试一下: 

> ![|huger](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722175827352.webp)
>
> 暂停信号是 19, 继续信号是 18

![STOP_SIGCHLD](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722175829458.gif)

可以看到, 其实子进程不仅退出时会向父进程发送 **SIGCHLD== 信号, 暂停时 和 恢复时 都会向父进程发送 ==SIGCHLD** 信号

子进程在退出时向父进程发送 **SIGCHLD** 信号, 这个动作有什么作用呢？

在介绍进程等待时 提到过, `waitpid()` 会等待子进程退出, 而等待的动作是主动去询问子进程是否退出.

现在我们知道了, 子进程退出时会向父进程发送 **SIGCHLD** 信号, 那么父进程是不是可以通过捕捉此信号 然后等待子进程呢？

```cpp
#include <cassert>
#include <cstdlib>
#include <iostream>
#include <signal.h>
#include <sys/types.h>
#include <sys/wait.h>
#include <unistd.h>
using std::cout;
using std::endl;

void freeChild(int signo) {
    assert(signo == SIGCHLD);

    pid_t id = waitpid(-1, nullptr, 0);
    if(id > 0) {
        cout << "父进程等待子进程成功, child pid: " << id << endl;
    }
}

int main() {
    signal(SIGCHLD, freeChild);
    pid_t id = fork();
    if (id == 0) {
        // 子进程
        while (true) {
            cout << "我是子进程, pid: " << getpid() << endl;
            sleep(1);
        }
        exit(0);
    }

    // 父进程
    while (true) {
        cout << "我是父进程, pid: " << getpid() << endl;
        sleep(1);
    }

    return 0;
}
```

这段代码 捕捉 **SIGCHLD** 信号 处理此信号为调用`waitpid()`回收子进程.

> `waitpid()`, 第一个参数应该传入回收子进程的pid, 不过  **`-1 表示回收任意子进程`**
>
> 第三个参数传入 0 表示  **`阻塞等待`**.

运行结果是: 

![signal_SIGCHLD](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722175833171.gif)

可以看到, 即使waitpid()设置为阻塞等待, 也还是可以随时回收一个子进程.

但是目前这个回收子进程的方式, 还存在很大的BUG.

如果我们  **`同时创建多个子进程, 并将这些子进程同时退出`**, 会出现什么状况:

```cpp
#include <cassert>
#include <cstdlib>
#include <iostream>
#include <signal.h>
#include <sys/types.h>
#include <sys/wait.h>
#include <unistd.h>
using std::cout;
using std::endl;

void freeChild(int signo) {
    assert(signo == SIGCHLD);

    pid_t id = waitpid(-1, nullptr, 0);
    if (id > 0) {
        cout << "父进程等待子进程成功, child pid: " << id << endl;
    }
}

int main() {
    signal(SIGCHLD, freeChild);
    for (int i = 0; i < 10; i++) {
        pid_t id = fork();
        if (id == 0) {
            // 子进程
            int cnt = 10;
            while (cnt) {
                cout << "我是子进程, pid: " << getpid() << ", cnt: " << cnt-- << endl;
                sleep(1);
            }
            cout << "子进程退出, 进入僵尸状态" << endl;
            exit(0);
        }
    }

    // 父进程
    while (true) {
        cout << "我是父进程, pid: " << getpid() << endl;
        sleep(1);
    }

    return 0;
}    
```

![signal_SIGCHLD_BUG1](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722175836122.gif)

在代码运行起来之后, 监控脚本可以非常清除的看到 `子进程从创建到退出的整个过程`.

最终的结果是什么？子进程按理来说应该全部退出并被回收掉, 但实际上 会`有几个子进程以僵尸状态 残留下来`, 并没有被父进程回收掉. 

造成这个结果的原因其实是, `太多子进程在同一时间退出了, 即太多相同的信号在同一时间被发送给父进程了`, 而进程处理信号是需要时间的, 当前信号没有被处理完毕时, 是不会记录后面有多少信号发送过来的. 

也就是说, `有一部分子进程发送信号的时候 父进程还在处理其他子进程的信号, 父进程并没有接收到这一部分子进程的信号`. 所以没有回收这一部分子进程.

那么, 改怎么修改处理信号的方式呢？

```cpp
void freeChild(int signo) {
    assert(signo == SIGCHLD);

    while(true) {
        pid_t id = waitpid(-1, nullptr, 0);
        if (id > 0) {
            cout << "父进程等待子进程成功, child pid: " << id << endl;
        }
        else {
            cout << "等待结束" << endl;
            break;
        }
    }
}
```

将信号处理方法内, 回收子进程的部分设置为 `死循环回收`, 没有子进程需要回收的时候跳出循环, 应该就可以把所有子进程都回收掉: 

![signal_SIGCHLD_BUG3](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722175839180.gif)

这样确实可以将所有的子进程都回收掉, 但是又出现了新的问题: 

 **`捕捉到信号之后, 如果有子进程一直不退出, 父进程代码不会再运行了. 因为调用的函数 会一直在死循环内, 回不到main函数中了`**

```cpp
#include <cassert>
#include <cstdlib>
#include <iostream>
#include <signal.h>
#include <sys/types.h>
#include <sys/wait.h>
#include <unistd.h>
using std::cout;
using std::endl;

void freeChild(int signo) {
    assert(signo == SIGCHLD);

    while (true) {
        pid_t id = waitpid(-1, nullptr, 0);
        if (id > 0) {
            cout << "父进程等待子进程成功, child pid: " << id << endl;
        }
        else {
            cout << "等待结束" << endl;
            break;
        }
    }
}

int main() {
    signal(SIGCHLD, freeChild);
    for (int i = 0; i < 10; i++) {
        pid_t id = fork();
        if (id == 0) {
            // 子进程
            int cnt = 0;
            if(i < 6)
                cnt = 5;        // 前6个子进程 5s就退出
            else
                cnt = 30;       // 后4个子进程 30s 退出
            while (cnt) {
                cout << "我是子进程, pid: " << getpid() << ", cnt: " << cnt-- << endl;
                sleep(1);
            }
            cout << "子进程退出, 进入僵尸状态" << endl;
            exit(0);
        }
    }

    // 父进程
    while (true) {
        cout << "我是父进程, pid: " << getpid() << endl;
        sleep(1);
    }

    return 0;
}
```

我们将子进程设置为不同时间退出, 观察两个时间差内 进程的运行: 

![signal_SIGCHLD_BUG4](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722175843423.gif)

可以看到, 5s后退出的子进程被回收之后, 30s后退出的进程退出之前, 父进程的代码一直没有运行.

那么也就是说, `只要子进程一直在运行, 父进程就无法正常工作` 进程就不会从信号处理函数中跳出来.

这个问题如何解决呢？

我们只需要将 waitpid() 的第三个参数, 由 0改为 WNOHANG 就可以了.

> waitpid()的第三个参数传入 `WNOHANG`, 表示非阻塞等待

因为我们之前是阻塞式等待, 只要还有子进程存在 就会阻塞住. 

而`非阻塞等待, 在子进程没有退出时, 会返回0`. 这样就可以退出死循环, 结束信号处理函数的运行. 从而回到main函数中.

```cpp
#include <cassert>
#include <cstdlib>
#include <iostream>
#include <signal.h>
#include <sys/types.h>
#include <sys/wait.h>
#include <unistd.h>
using std::cout;
using std::endl;

void freeChild(int signo) {
    assert(signo == SIGCHLD);

    while (true) {
        pid_t id = waitpid(-1, nullptr, WNOHANG);
        if (id > 0) {
            cout << "父进程等待子进程成功, child pid: " << id << endl;
        }
        else if(id == 0){
            cout << "还有子进程在运行, 但是没有子进程退出, 父进程要去做自己的事了 " << endl;
            break;
        }
        else {
            cout << "父进程等待所有子进程结束" << endl;
            break;
        }
    }
}

int main() {
    signal(SIGCHLD, freeChild);
    // 为方便演示, 我们只创建5个子进程
    for (int i = 0; i < 5; i++) {
        pid_t id = fork();
        if (id == 0) {
            // 子进程
            int cnt = 0;
            if(i < 2)
                cnt = 5;        // 前2个子进程 5s 就退出
            else
                cnt = 30;       // 后3个子进程 30s 退出
            while (cnt) {
                cout << "我是子进程, pid: " << getpid() << ", cnt: " << cnt-- << endl;
                sleep(1);
            }
            cout << "子进程退出, 进入僵尸状态" << endl;
            exit(0);
        }
    }

    // 父进程
    while (true) {
        cout << "我是父进程, pid: " << getpid() << endl;
        sleep(1);
    }

    return 0;
}
```

此时, 代码运行的结果就是: 

![signal_SIGCHLD_NOBUG](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722175847436.gif)

这才是父进程回收子进程的最终版本~

### 回收子进程的其他方式

经过演示, 了解到 SIGCHLD 信号实际上是子进程退出时向父进程发送的信号. 不过父进程对此信号的处理 默认是忽略的.

我们可以通过捕捉此信号来让父进程回收子进程. 不过如果我们捕捉此信号并设置忽略处理呢？

```cpp
#include <cassert>
#include <cstdlib>
#include <iostream>
#include <signal.h>
#include <sys/types.h>
#include <sys/wait.h>
#include <unistd.h>
using std::cout;
using std::endl;

int main() {
    signal(SIGCHLD, SIG_IGN);
    // 为方便演示, 我们只创建5个子进程
    for (int i = 0; i < 5; i++) {
        pid_t id = fork();
        if (id == 0) {
            // 子进程
            int cnt = 0;
            if(i < 2)
                cnt = 5;        // 前2个子进程 5s 就退出
            else
                cnt = 30;       // 后3个子进程 30s 退出
            while (cnt) {
                cout << "我是子进程, pid: " << getpid() << ", cnt: " << cnt-- << endl;
                sleep(1);
            }
            cout << "子进程退出, 进入僵尸状态" << endl;
            exit(0);
        }
    }

    // 父进程
    while (true) {
        cout << "我是父进程, pid: " << getpid() << endl;
        sleep(1);
    }

    return 0;
}
```

这段代码的执行结果是: 

![SIGCHLD_SETIGN](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722175851779.gif)

可以看到, 我们没有自定义处理子进程, 知识通过`signal()`手动对 SIGCHLD 信号设置了 SIG_IGN 忽略处理, 但是最终子进程却自动被回收了.

不捕捉此信号时, 父进程对此信号的默认处理方式也是 忽略, 但最终子进程退出会进入僵尸状态.

而我们捕捉此信号, 只是又手动设置了一遍忽略处理, 子进程却被自动回收了.

所以, 如果 `只是为了更加方便的回收子进程, 可以直接捕捉并设置忽略.`

那么 同样是忽略, 最终的结果却不同的原因是什么呢？

我们设置的处理方式, 都是忽略. 与默认不同的是, 我们是通过了系统调用来设置的, 即 玄机实际在这个系统调用中.

系统调用是一个函数, 一定会做一些有关信号的其他处理, 所以可能会造成同样的处理方法 结果却不同的情况. 不过不需要太过关心

---

本篇文章到此结束, 感谢阅读~
