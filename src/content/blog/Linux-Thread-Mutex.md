---
draft: true
title: "[Linux] 线程互斥分析: 多线程的问题、互斥锁、C++封装使用互斥锁、线程安全分析、死锁分析..."
pubDate: "2023-04-16"
description: '多线程可以提高程序的并发性和运行效率, 充分利用计算机的多核资源. 
但是, 多线程也可能会导致输出混乱、访问共享资源混乱、竞争等问题. 接下来我们就尝试解决这些问题'
image: https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/202306251802036.webp
categories: ['tech']
tags: ["Linux系统", "多线程", "锁"]
---

多线程可以提高程序的并发性和运行效率, 充分利用计算机的多核资源. 前面的几篇文章已经介绍了, Linux线程的基本概念、基本控制等内容

我们已经看到了多线程可以提升运行效率等. 但是, 也发现了问题, 多线程可能会导致输出混乱、访问共享资源混乱、竞争等问题

输出混乱只是小问题, 而像访问资源混乱、错误的问题 就比较大了

---

# 线程互斥

在正式分析线程互斥之前. 以线程的角度再介绍三个概念, 这三个概念在介绍共享内存时就已经简单的提过

## 临界资源和临界区

1. 临界资源: 不同执行流都可以看到的同一资源, 就叫做临界资源
2. 临界区: 访问临界资源的代码, 就叫就临界区
3. 原子性: 一个操作, 如果只存在两种状态: 未完成、已完成, 而没有中间状态, 就称这个操作是具有原子性的.

那么, 一下面这段代码为例:

```cpp
#include <iostream>
#include <unistd.h>
#include <pthread.h>
using std::cout;
using std::endl;

int tickets = 10000;

// 查票
void* inqureTicket(void* args) {
    const char* name = static_cast<const char*>(args);

    int cnt = 10;
    while (cnt--) {
        if (tickets > 0) {
            usleep(100000);
            printf("%s: %lu 查到剩余票了, 还有: %d\n",name, pthread_self(), tickets);
            usleep(100000);
        }
        else {
            printf("没有票了\n", name);
            break;
        }
    }

    return nullptr;
}

int main() {
    pthread_t tid1, tid2, tid3, tid4;

    pthread_create(&tid1, nullptr, inqureTicket, (void*)"thread_1");
    pthread_create(&tid2, nullptr, inqureTicket, (void*)"thread_2");
    pthread_create(&tid3, nullptr, inqureTicket, (void*)"thread_3");
    pthread_create(&tid4, nullptr, inqureTicket, (void*)"thread_4");

    pthread_join(tid1, nullptr);
    pthread_join(tid2, nullptr);
    pthread_join(tid3, nullptr);
    pthread_join(tid4, nullptr);

    return 0;
}
```

![cri_res_cri_sec |inline](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/cri_res_cri_sec.gif)

这段代码中, 临界资源和临界区都是什么？

首先, 票(`tickets`) 可以被所有线程看到, 并访问. 所以 **`票即为临界资源`**.

而 不同线程所执行的回调函数`inquireTicket()`对临界资源进行了访问, 那么 整个回调函数就都是临界区吗？

并不是, 只有访问了临界资源的那一部分代码被称作临界区, 即: 

![|inline](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/image-20230416153122980.webp)

首先是, `if (tickets > 0)` 访问临界资源, 对临界资源进行了判断.

然后就是 输出了 `tickets` 也对临界资源进行了访问. 

所以, **`这一部分才叫 临界区`**.

## 多线程访问临界资源的问题

多线程访问临界资源时有可能造成错误的.

上面的代码执行之后, 没有发生错误. 是因为我们只是读取了临界资源, 并没有修改临界资源. 

如果我们将代码改为对临界资源的修改, 我们设置回调函数内循环抢票, 知道抢到0张票:

```cpp
#include <iostream>
#include <unistd.h>
#include <pthread.h>
using std::cout;
using std::endl;

int tickets = 10000;

void* grabTicket(void* args) {
    const char* name = static_cast<const char*>(args);

    while (true) {
        if (tickets > 0) {
            usleep(100);
            printf("%s: %lu 抢到票了, 编号为: %d\n", name, pthread_self(), tickets--);
            usleep(100);
        }
        else {
            printf("没有票了, %s: %lu 放弃抢票\n", name, pthread_self());
            break;
        }
    }

    return nullptr;
}

int main() {
    pthread_t tid1, tid2, tid3, tid4;

    pthread_create(&tid1, nullptr, grabTicket, (void*)"thread_1");
    pthread_create(&tid2, nullptr, grabTicket, (void*)"thread_2");
    pthread_create(&tid3, nullptr, grabTicket, (void*)"thread_3");
    pthread_create(&tid4, nullptr, grabTicket, (void*)"thread_4");

    pthread_join(tid1, nullptr);
    cout << "main thread join thread_1" << endl;
    pthread_join(tid2, nullptr);
    cout << "main thread join thread_2" << endl;
    pthread_join(tid3, nullptr);
    cout << "main thread join thread_3" << endl;
    pthread_join(tid4, nullptr);
    cout << "main thread join thread_4" << endl;

    return 0;
}
```

执行这段代码, 你就会发现有可能会出错误:

![抢票出错 |inline](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/grabTickets_error.gif)

可以看到, 线程3抢到了 编号为0的票, 线程4抢到了编号为-1的票. 这两张票 很明显是不应改存在的. 因为, 我们设置的 只有 `tickets > 0` 才会输出 抢到票了, 这句话.

那么为什么会出现这种情况呢？

根据代码, 临界区是: 

![|inline](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/image-20230416160134239.webp)

这部分代码存在两个计算:  `tickets > 0` 和 `tickets--`

造成 线程抢到负票, 其实就是因为 `tickets > 0` 计算时发生了一些错误.

> 代码中有关算数计算的问题, 都是交给CPU执行的.
>
> 无论是 `+ - * /` 还是 `逻辑运算` 还是 `逻辑判断`. 最终, `CPU 都会通过 ` **`位移运算`**  和 **` 加法运算 `** `来解决`

这个判断的过程时如何发生错误的呢？

当 需要进行判断的时候, CPU 会将判断这个操作分成至少3步来进行: 

1. CPU读取判断并放入寄存器中
2. CPU执行数据判断
3. CPU将判断结果返回到代码中

那么, 当 `tickets 为 1`, 且 `线程1` 进行判断时, 正常的情况是这样的:

![|big](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/image-20230416163216043.webp)

> CPU 进行逻辑判断, 其实是通过 判断式子, 计算出一个真值或假值, 进而返回到 判断语句中.
>
> 例如, 此例中 tickets = 1, 判断 `tickets > 0`, CPU 就可能 计算 `1 + -0` 的结果, 然后将结果返回到 判断语句中

此时, 判断的结果肯定是真, 所以会执行抢票语句, 然后 `tickets--`.

这是正常的情况, 那么 如果出现其他情况呢？

还是在 `tickets = 1` 时, 线程 1 需要进行判断, 但是 CPU计算完成之后, 还没有将结果返回给线程1的代码中, 却需要调度线程2了.

然后 操作系统将CPU计算的结果保存到线程1的上下文数据中, 线程1 暂停运行:

![|big](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/image-20230416165843159.webp)

然后 线程2被调度 运行需要进行判断, 现在 `tickets 依旧为1`, 然后 CPU 根据 tickets 为1进行计算, 计算完成之后, 还没有将结果返回给线程2代码中, 又需要调度线程3了.

然后 操作系统又将 CPU计算的结果保存到线程2的上下文数据中, 线程2 暂停运行:

![|big](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/image-20230416170346077.webp)

然后 线程3被调度 运行需要进行判断, 现在的 `tickets 还是1`, 然后CPU 根据tickets为1进行计算, 计算完成之后, 正常将结果返回给了线程3的代码中, 此时 tickets为1, 所以 判断结果肯定为真, 所以线程3 执行抢票操作 `tickets--`, `tickets 变为 0`. 线程3抢到 `编号为1` 的票:

![|big](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/image-20230416171227547.webp)

然后 线程1又被调度, 操作系统恢复线程1的上下文数据, 上次已经计算出了结果, 所以该将线程1上下文数据中保存的上次CPU计算逻辑判断结果返回到代码中, 由于是根据 tickets为1 计算的, 所以结果为真, 此时 线程1 也会执行抢票操作 `tickets--`, `tickets 变为 -1`. 线程1抢到 `编号为0`的票:

![|big](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/image-20230416172150514.webp)

然后 线程2又被调度, 操作系统恢复线程2的上下文数据, 将结果返回到代码中, 结果也是由 tickets 为1 计算的, 所以结果为真. 线程2也会执行抢票操作 `tickets--`, `tickets 变为 -2`. 线程2 抢到 `编号为-1` 的票.

> 线程2的再次调度, 与线程1再次调度的步骤相似, 不再画图演示

由于CPU在执行线程的判断计算时, 突然因为某种情况需要调度其他线程, 就可能会造成最终判断错误的情况.

> 而 如果是执行 `tickets--` 时发生这种情况, 就有可能对票的数量修改混乱
>
> 很可能出现这样的情况: 
>
> 线程1 执行完 `tickets--` 结果是 9999, 但是需要调度其他线程, 所以需要将 9999 存储到线程1的上下文数据中.
>
> 结果, CPU一直在调度其他线程, 票数实际已经被抢到了 5622. 但此时, 如果继续回去调度线程1, CPU就不会再计算, 而是恢复线程1的上下文数据, 然后发现已经计算过了, 就会直接将 9999 返回到线程1的代码中, 就会对全局变量作出修改. 将 5622 改为 9999.
>
> 此时 票的数量就会发生混乱.

然而会造成这种结果的原因是什么？ 

1. 无论 `tickets > 0` 还是 `tickets--` 这 **`两个计算操作都不是原子的`**

	这两个操作都具有中间状态, 即 CPU计算的过程需要读取、计算、返回多个操作. 存在中间状态, 就有可能在处于中间状态的时候 暂停 然后其他线程访问同一个数据.
	
	如果, 这两个操作都是原子性的, 根本不存在什么中间状态, 就不会再造成这种情况

2. 在已经有一个线程访问临界资源的时候, 其他线程依旧可以访问临界资源.

有关操作的原子性, 本篇文章暂不涉及.

本片文章会从第二个原因入手, 解决上面的线程数据不安全的问题.

## mutex互斥量

第二个原因是: 在已经有一个线程访问临界资源的时候, 其他线程依旧可以访问临界资源

那么要解决这个问题, 其实就是需要达成这三点:

1. 代码必须要有互斥行为: 当代码 `进入临界区` 执行时, `不允许其他线程进入该临界区`
2. 如果多个线程同时要执行临界区的代码, 并且临界区没有线程在执行, 那么`只能允许一个线程进入该临界区`
3. 如果线程 `不在临界区中` 执行, 那么该线程 `不能阻止其他线程进入临界区`

这三个要求其实`核心宗旨`只有一个, 即 **`给临界区加一把锁`**！  

当有线程进入临界区的时候, 就给临界区上一把锁, 阻止其他线程进入临界区. 这种锁, 被称为 `互斥锁`. 给代码实现互斥效果

那么, 如何给代码上锁和解锁呢？

### 锁的接口及使用 *

pthread 库为我们提供了 "造锁/买锁"、"改锁"、"上锁"、"解锁"、"毁锁/卖锁" 的接口:

`定义一个锁(造锁):`

![ ](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/image-20230416181735071.webp)

我们可以像定义变量一样, 使用 `pthread_mutex_t mutex;` 来定义一个互斥锁. 当然, 锁名可以随便设置.

此锁, 即为 **`互斥量`**

> 互斥锁的类型 `pthread_mutex_t` 是一个联合体.

`初始化锁(改锁):`

![ ](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/image-20230416182201905.webp)

`pthread_mutex_init()` 是 pthread 库提供的初始化锁的接口, 第一个参数传入的就是需要初始化的锁的地址.

第二个参数需要传入锁初始化的属性, 在接下来的使用中暂时不考虑.

成功返回0, 否则返回错误码.

`摧毁锁:`

![ ](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/image-20230416182556253.webp)

`pthread_mutex_destroy()` 用来摧毁定义的锁, 传入锁的指针.

成功返回0, 否则返回错误码.

`上锁:`

`pthread` 库为用户提供了, 两种不同的上锁方式: 

![ ](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/image-20230416183336540.webp)

`pthread_mutex_lock()`, 阻塞式上锁. 即 线程执行此接口时, 指定的锁已经被锁上了, 那么线程就进入阻塞状态, 知道解锁之后 此线程再上锁.

`pthread_mutex_trylock()`, 非阻塞式上锁. 即 线程执行此接口时, 尝试上锁, 如果指定的锁已经被锁上, 那么线程就先不上锁, 先去执行其他代码.  

上锁接口即为抢锁的接口, 哪个线程可以抢到, 哪个线程就能进入被锁上的区域.

这两个接口, `一般用于 进入临界区之前`

当上锁成功, 则返回0, 否则返回一个错误码.

`解锁:`

![ ](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/image-20230416184136095.webp)

`pthread_mutex_unlock()` 解锁接口, `一般用于出临界区的时候`

当解锁成功, 返回0, 否则返回一个错误码.

---

上面介绍了 `pthread` 库提供的互斥锁, 以及锁的一些接口.

现在我们来使用以下锁.

首先, 锁是需要定义的, 而且需要被可以抢占锁的线程看到.

所以, 我们可以定义一个全局的锁, 然后在主线程内初始化:

```cpp
#include <iostream>
#include <unistd.h>
#include <pthread.h>
using std::cout;
using std::endl;

int tickets = 10000;
pthread_mutex_t mutex;		// 定义锁

void* grabTicket(void* args) {
    const char* name = static_cast<const char*>(args);

    while (true) {
        pthread_mutex_lock(&mutex);     // 在即将进入临界区时加锁
        if (tickets > 0) {
            usleep(100);
            printf("%s: %lu 抢到票了, 编号为: %d\n", name, pthread_self(), tickets--);
            usleep(100);
            pthread_mutex_unlock(&mutex);   // 在即将离开临界区时解锁
        }
        else {
            printf("没有票了, %s: %lu 放弃抢票\n", name, pthread_self());
            break;
        }
    }

    return nullptr;
}

int main() {
    pthread_mutex_init(&mutex, nullptr); 		// 初始化锁

    pthread_t tid1, tid2, tid3, tid4;

    pthread_create(&tid1, nullptr, grabTicket, (void*)"thread_1");
    pthread_create(&tid2, nullptr, grabTicket, (void*)"thread_2");
    pthread_create(&tid3, nullptr, grabTicket, (void*)"thread_3");
    pthread_create(&tid4, nullptr, grabTicket, (void*)"thread_4");

    pthread_join(tid1, nullptr);
    cout << "main thread join thread_1" << endl;
    pthread_join(tid2, nullptr);
    cout << "main thread join thread_2" << endl;
    pthread_join(tid3, nullptr);
    cout << "main thread join thread_3" << endl;
    pthread_join(tid4, nullptr);
    cout << "main thread join thread_4" << endl;

    return 0;
}
```

我们定义了一个全局锁, 以保证所有线程都可以使用. 

我们在回调函数即将进入临界区的时候上锁, 在即将出临界区的时候解锁. 

> 上锁和解锁, 一定要合理!

然后查看代码的执行结果: 

![|inline](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/mutex_use_show.gif)

可以看到, 抢票的过程是非常和谐的. `没有发生数据错误`的问题. 

但是, 票被抢完之后, 你会发现, `整个进程卡住了`. 这是为什么？

在`没有上锁`的时候, 整个代码是可以`正常运行`的. 所以 `一定是锁的问题`.

我们在即将进入临界区的时候, 上锁了. 也在即将出临界区的时候解锁的. 应该是没问题的.

不过真的是这样吗？

如果票被抢完了, `最后一次执行判断`语句, `会进到 哪个控制块中呢？` 是 if后 还是else后？

我们`在if后的控制块中解锁`了, 但是并 **`没有在else后的控制块中解锁`**. 那么 `最后一次票数判断之后, 就会直接退出线程`.

那么此时在推出线程的时候, 并 **`没有对已经上了的锁进行解锁`**. 

而我们知道, 我们使用的 `pthread_mutex_lock()` 是阻塞式上锁的. 如果执行的时候, 指定的锁已经被锁上了, 那就会阻塞式等待, 线程就会暂停运行.

而 对指定锁上锁的线程已经退出了, 并且没有解锁. 所以其他线程会因为阻塞时等待而一直暂停运行.

> 上述现象是一种 `死锁` 现象.
>
> **`死锁是指在多线程的运行时, 每个线程都在等待其他线程释放资源, 导致所有线程都无法继续执行的一种状态`**
>
> (对进程也适用)

所以, 是将我们还需要在else后的控制块中进行解锁: 

![|inline](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/image-20230416233736687.webp)

此时, 我们再执行代码: 

![|inline](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/mutex_use_success.gif)

可以看到, 票抢到很和谐, 而且线程退出的也很正常.

但是, 也可以发现, 加了锁之后 整个进程的运行速度要满了许多. 因为要不停的上锁加解锁. 再加上 我们为了方便观察 在 if后 的控制块中使用了 两个usleep(100). 所以会很慢. 可以删除掉这两个语句.

并且, 我们还发现, 为什么代码执行起来 好像并不是多线程一起执行的呢？而是排着队执行的？

其实是因为, **`一个线程进入临界区加上锁之后, 其他进程就会进入阻塞状态. 在此线程的时间片内, 此线程就会一直进出临界区. 虽然此线程会在出临界区时解锁, 但是它又会马上进入下一个循环, 再次上锁. `**

而 **`其他线程想要申请到锁, 是需要先被CPU调度的, 线程的调度的消耗 对比 上锁和解锁消耗, 其实是很大的. 所以 线程调度并没有 上锁和解锁快`**. 所以, 我们实现的代码 **`在申请到锁的线程的时间片内, 其他线程是很难抢到锁的`**.

所以, 我们可以在`线程解锁之后, 让线程等一会` 不让他马上进入下一个循环. `让CPU有充足的时间调度其他线程`. 然后就可以看到 `"百线争鸣"` 啦

![|inline](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/image-20230417003951566.webp)

修改之后, 再看运行结果:

![|inline](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/mutex_success_opt.gif)

可以看到, 抢票过程非常的均匀, 也没有发生错错误

#### 锁的宏初始化

`pthread` 库 为 锁的初始化提供了相应的接口`pthread_mutex_init()`.

不过, 在man手册中还提到另一种初始化锁的方法. 不过此种方法只针对全局锁进行初始化.

即 用宏初始化锁: `PTHREAD_MUTEX_INITIALIZER`.

```cpp
pthread_mutex_t mutex = PTHREAD_MUTEX_INITIALIZER;
或
static pthread_mutex_t mutex = PTHREAD_MUTEX_INITIALIZER;
```

并且, 使用此宏初始化的锁, 不需要销毁. 即 不需要调用 `pthread_mutex_destroy()` 接口.

这段代码可以演示一下: 

```cpp
#include <iostream>
#include <unistd.h>
#include <pthread.h>
using std::cout;
using std::endl;

int tickets = 10000;
pthread_mutex_t mutex = PTHREAD_MUTEX_INITIALIZER;		// 定义全局锁, 并用宏来初始化

void* grabTicket(void* args) {
    const char* name = static_cast<const char*>(args);

    while (true) {
        pthread_mutex_lock(&mutex); // 在即将进入临界区时加锁
        if (tickets > 0) {
            printf("%s: %lu 抢到票了, 编号为: %d\n", name, pthread_self(), tickets--);
            pthread_mutex_unlock(&mutex); // 在即将离开临界区时解锁
            usleep(10);
        }
        else {
            printf("没有票了, %s: %lu 放弃抢票\n", name, pthread_self());
            pthread_mutex_unlock(&mutex); // 在线程即将退出时解锁
            break;
        }
    }

    return nullptr;
}

int main() {
    pthread_t tid1, tid2, tid3, tid4;

    pthread_create(&tid1, nullptr, grabTicket, (void*)"thread_1");
    pthread_create(&tid2, nullptr, grabTicket, (void*)"thread_2");
    pthread_create(&tid3, nullptr, grabTicket, (void*)"thread_3");
    pthread_create(&tid4, nullptr, grabTicket, (void*)"thread_4");

    pthread_join(tid1, nullptr);
    cout << "main thread join thread_1" << endl;
    pthread_join(tid2, nullptr);
    cout << "main thread join thread_2" << endl;
    pthread_join(tid3, nullptr);
    cout << "main thread join thread_3" << endl;
    pthread_join(tid4, nullptr);
    cout << "main thread join thread_4" << endl;

    return 0;
}
```

这段代码的执行结果为: 

![define_init_mutex |inline](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/define_init_mutex.gif)

多线程可以和谐的抢票.

我们定义全局锁, 可以使用宏初始化.

而如果我们在主线程中定义一个 `static` 修饰的锁, 其实 线程执行的函数是看不到的.

![|inline](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/image-20230417145745192.webp)

那么, 如何使其他线程看到呢？

其实, 可以将主线程中定义的锁, 通过 `pthread_create()` 的第四个参数 传入线程执行的函数中.

这样, 就可以让线程的函数看到锁.

```cpp
#include <iostream>
#include <unistd.h>
#include <pthread.h>
using std::cout;
using std::endl;

int tickets = 10000;

void* grabTicket(void* args) {
    pthread_mutex_t* pMutex = (pthread_mutex_t*)args;    // 将传入的参数强转为 锁类型

    while (true) {
        pthread_mutex_lock(pMutex); // 在即将进入临界区时加锁
        if (tickets > 0) {
            printf("thread: %lu 抢到票了, 编号为: %d\n", pthread_self(), tickets--);
            pthread_mutex_unlock(pMutex); // 在即将离开临界区时解锁
            usleep(10);
        }
        else {
            printf("没有票了, thread: %lu 放弃抢票\n", pthread_self());
            pthread_mutex_unlock(pMutex); // 在线程即将退出时解锁
            break;
        }
    }

    return nullptr;
}

int main() {
    static pthread_mutex_t mutex = PTHREAD_MUTEX_INITIALIZER;

    pthread_t tid1, tid2, tid3, tid4;

    pthread_create(&tid1, nullptr, grabTicket, (void*)&mutex); 			// 将锁地址当参数传入
    pthread_create(&tid2, nullptr, grabTicket, (void*)&mutex);
    pthread_create(&tid3, nullptr, grabTicket, (void*)&mutex);
    pthread_create(&tid4, nullptr, grabTicket, (void*)&mutex);

    pthread_join(tid1, nullptr);
    cout << "main thread join thread_1" << endl;
    pthread_join(tid2, nullptr);
    cout << "main thread join thread_2" << endl;
    pthread_join(tid3, nullptr);
    cout << "main thread join thread_3" << endl;
    pthread_join(tid4, nullptr);
    cout << "main thread join thread_4" << endl;

    return 0;
}
```

![|inline](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/define_init_mutex.gif)

多线程也是可以很和谐的运行的.

不过, 还有一个问题需要解决. 在之前, 我们是通过传入线程的序号来分辨线程的. 现在我们传入的是 锁的地址, 就不能确定线程的序号了.

那么有没有一个方法, 既可以传入锁, 又可以传入线程的序号呢？

当然, C语言可以使用结构体, C++ 可以使用类.

下面我们使用结构体, 演示一下: 

```cpp
#include <iostream>
#include <cstring>
#include <unistd.h>
#include <pthread.h>
using std::cout;
using std::endl;

int tickets = 10000;

typedef struct threadData {
    char _name[64];
    pthread_mutex_t* _mutex; 
}threadData;							// 定义struct 成员包括 name 和 锁

void* grabTicket(void* args) {
    threadData* tD = (threadData*)args;

    while (true) {
        pthread_mutex_lock(tD->_mutex); // 在即将进入临界区时加锁
        if (tickets > 0) {
            printf("%s: %lu 抢到票了, 编号为: %d\n", tD->_name, pthread_self(), tickets--);
            pthread_mutex_unlock(tD->_mutex); // 在即将离开临界区时解锁
            usleep(10);
        }
        else {
            printf("没有票了, %s: %lu 放弃抢票\n", tD->_name, pthread_self());
            pthread_mutex_unlock(tD->_mutex); // 在线程即将退出时解锁
            break;
        }
    }

    return nullptr;
}

int main() {
    static pthread_mutex_t mutex = PTHREAD_MUTEX_INITIALIZER;

    pthread_t tid1, tid2, tid3, tid4;

    threadData* tD1 = new threadData();
    threadData* tD2 = new threadData();
    threadData* tD3 = new threadData();
    threadData* tD4 = new threadData();
    tD1->_mutex = &mutex;
    tD2->_mutex = &mutex;
    tD3->_mutex = &mutex;
    tD4->_mutex = &mutex;
    strcpy(tD1->_name, "thread_1");
    strcpy(tD2->_name, "thread_2");
    strcpy(tD3->_name, "thread_3");
    strcpy(tD4->_name, "thread_4");

    pthread_create(&tid1, nullptr, grabTicket, (void*)tD1);
    pthread_create(&tid2, nullptr, grabTicket, (void*)tD2);
    pthread_create(&tid3, nullptr, grabTicket, (void*)tD3);
    pthread_create(&tid4, nullptr, grabTicket, (void*)tD4);

    pthread_join(tid1, nullptr);
    cout << "main thread join thread_1" << endl;
    pthread_join(tid2, nullptr);
    cout << "main thread join thread_2" << endl;
    pthread_join(tid3, nullptr);
    cout << "main thread join thread_3" << endl;
    pthread_join(tid4, nullptr);
    cout << "main thread join thread_4" << endl;

    return 0;
}
```

也可以正常的执行:

![|inline](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/define_init_static_mutex_struct.gif)

### 锁的作用

上面我们介绍了锁, 使用了锁. 但锁到底有什么作用呢？

我们使用锁对临界区上了锁, 好像是让线程的执行得更加规范, 在一个线程进入临界区之后, 就不让其他线程进入临界区了.

但是, 为什么上了锁其他线程就进不去临界区呢？如果线程对临界区上了锁, 还没有出临界区的时候, 需要调度其他线程了. 线程会被切走吗？如果被切走了, 还会出现 线程数据安全的问题吗？

我们先来回答第二个问题: **`如果线程对临界区上了锁, 还没有出临界区, 但是此时需要调用其他线程了, 当前线程会被切走吗？ 其他线程可以进入临界区吗？还会不会对临界资源有一定的影响？`**

答案是, 当前线程`会被切走`, 但是 其他线程`不可能再进入临界区`, 就`不可能再访问临界资源`.

首先, 因为我们例子中的锁, 是一个 **`可以被其他所有线程看到的、只有一个的`**变量.

并且, 我们让线程执行的代码中, 如果线程想要进入临界区, 就一定需要先申请锁. 而我们的锁只有一个, 如果锁已经被其他线程申请到了. 那么此时就不可能申请到锁, 只会进入阻塞状态.

也就是说, 即使**`申请到锁、并且还没有解锁的线程当前并没有被调度, 其他线程也无法申请锁.`**

可以理解为, 线程`申请到锁, 就是把锁拿走了`. `没有解锁`的时候, 就`一直拿着锁`. 即使没有被调度, 此线程也一直拿着锁. `其他线程就无法申请到锁`. 无法申请到锁, 就`无法继续执行代码`.

> 所以, 尽量不要在加了锁的临界区内做非常耗时的事情. 

这就是锁的作用. 

而 锁是可以被多个线程看到的资源, 那 `锁` 不就`是一个临界资源`吗？

多线程访问未被保护的临界资源, 不是可能会发生一定的错乱吗？那么上锁和解锁的过程, 有没有可能发生错乱, 导致多个线程一起申请到锁呢？

互斥锁是临界资源没错, 但 **`互斥锁的上锁和解锁过程, 已经被设计为了原子的`**

### 锁的大概原理

互斥锁本身, 是一个结构体类型数据. 除了成员, 其他没有什么值得详析说的.

但, 上锁(`pthread_mutex_lock()`) 和 解锁(`pthread_mutex_unlock()`) 这两个过程, 是值得介绍以下的.

这两个操作, 是如何设置为原子的的？

首先, 介绍一个操作: 为了实现互斥性, 大多数的体系结构都提供有 `swap` 或 `exchange` 等指令. 此指令的作用是, 直接将寄存器中的数据与内存中的数据做交换. 只有一条指令, 此指令是原子的.

那么, 以 lock 和 unlock 的伪代码, 分析以下 这两个操作的原子性是怎么实现的: 

![|medium](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/image-20230417113128941.webp)

![|medium](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/image-20230417113310347.webp)

我们针对 lock 修改过的伪代码分析.

```cpp++
// lock 伪代码
movb $0, %al
xchgb %al, mutex
if(al > 0) {
	return 0;
}
else 
	阻塞等待;
goto lock;
```

首先, `al` 表示寄存器, `mutex` 则表示在内存中的锁

`movb $0, %al`, 把 0 存入 al 寄存器中

`xchgb %al, mutex`, 交换 al寄存器 和 内存中mutex 的数据

`if(al > 0) { return 0; }`, 如果 al 寄存器中的数据 大于 0, 则 申请锁成功, 返回 0.

否则, 就阻塞等待.

整个上锁函数执行的语句可以看作这几个过程.

其中, `xchgb %al, mutex ` 操作 是实际上锁的操作.

我们用图来描述, 如果线程1 在执行上锁的操作:

![ ](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/image-20230417115715808.webp)

如果 没有上锁时, 锁的值是1. 

那么 执行 `xchgb %al, mutex` 将 al 中的0 与 mutex 的值交换, 其实就是 **`将 锁给了执行此语句的线程`**

为什么这样说呢.

首先, **`线程的属性中是有维护寄存器的数据的, 即 线程的上下文数据`**.

也就是说 `al寄存器中的数据`, 其实`就是 线程的上下文数据`. 如果`没有解锁`, 那么 此`线程从CPU 切走`时, `会将 寄存器数据(上下文数据)维护好, 一起切走`. 而此时`寄存器中的数据可能没有被清除`, 因为可能只是将寄存器数据存储到线程上下文数据中

那么可能就有人觉得会有问题: `既然寄存器中数据还有`, 那么`下一个线程被调度`的时候, `不会直接读取寄存器中的数据吗？`

`不会`, 新的线程被调度的时候, `首先`要做的就是`将线程自己的有关寄存器上下文数据恢复到寄存器中`. 也就是说, 当新线程被调度之后, CPU寄存器中会变为此线程的上下文数据.

所以, 寄存器只是一个工具, 每个线程被调度时, 都会将自己上次维护的上下文数据恢复到寄存器中. 

那么, 就可以说如果在mutrex为1时(即锁没有被申请), 执行 `xchgb %al, mutex` 就是将锁给了执行此语句的线程.

如果锁被带走了, 就意味着内存中 mutex 的值为0. 那么, 如果其他线程被调度, 再次执行上面的伪代码的类似逻辑, 那么 此线程的al上下文数据就会是0. 就代表着申请锁失败.

那么也就是说, **`将内存中的数据换入寄存器中, 本质上就是 将内存中的数据 从共享状态 变为了线程私有`**. 因为 换入寄存器的数据, 基本当前线程的上下文数据.

## C++封装互斥锁及相关使用 *

`threadLock.hpp:`

```cpp
#pragma once
#include <iostream>
#include <pthread.h>
using std::cout;
using std::endl;

class myMutex {
public:
    myMutex() {
        pthread_mutex_init(&_lock, nullptr);
    }
    void lock() {
        pthread_mutex_lock(&_lock);
    }
    void unlock() {
        pthread_mutex_unlock(&_lock);
    }
    ~myMutex() {
        pthread_mutex_destroy(&_lock);
    }

private:
    pthread_mutex_t _lock;
};

// 锁—警卫
class lockGuard {
public:
    lockGuard(myMutex* myMutex)
        : _myMutex(myMutex) {
        _myMutex->lock();
        printf("上锁成功……\n");
    }
    ~lockGuard() {
        _myMutex->unlock();
        printf("解锁成功……\n");
    }

private:
    myMutex* _myMutex;
};
```

`myThread.cpp:`

```cpp
#include <iostream>
#include <unistd.h>
#include <pthread.h>
#include "threadLock.hpp"

int tickets = 10000;
myMutex mymutex; // 定义一个锁类

// 将抢票操作, 独立为一个函数实现
// 抢票函数内有临界区, 所以需要上锁
bool grabTickets() {
    bool ret = false; // 定义一个变量用于返回, 默认为false, 抢票成功改为 true

    lockGuard guard(&mymutex); // 上锁！
    if (tickets > 0) {
        printf("thread: %lu 抢到票了, 编号为: %d\n", pthread_self(), tickets--);
        ret = true;
        usleep(100);
    }

    return ret;
}

// 这个才是线程需要执行的函数
void* startRoutine(void* args) {
    const char* name = static_cast<const char*>(args); // 强转

    while (true) {
        if (!grabTickets()) {
            // 如果抢票失败, 就 退出循环
            break;
        }
        printf("%s, grab tickets success\n", name);
        sleep(1);			// 为了方便观察, 设置为1s
    }

    return nullptr;
}

int main() {
    pthread_t tid1, tid2, tid3, tid4;

    pthread_create(&tid1, nullptr, startRoutine, (void*)"thread_1");
    pthread_create(&tid2, nullptr, startRoutine, (void*)"thread_2");
    pthread_create(&tid3, nullptr, startRoutine, (void*)"thread_3");
    pthread_create(&tid4, nullptr, startRoutine, (void*)"thread_4");

    pthread_join(tid1, nullptr);
    printf("main thread join thread_1\n");
    pthread_join(tid2, nullptr);
    printf("main thread join thread_2\n");
    pthread_join(tid3, nullptr);
    printf("main thread join thread_3\n");
    pthread_join(tid4, nullptr);
    printf("main thread join thread_4\n");

    return 0;
}
```

这两个代码文件编译运行的执行结果是: 

![|inline](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/class_package_mutex.gif)

在 `threadLock.hpp` 的这段代码中, 我们封装了两个类:

1. `myMutex互斥量类`, 即 `锁类`.

	构造函数的内容就是 锁的初始化. 析构函数的内容就是 锁的摧毁.
	
	还有两个成员函数就是 上锁和解锁.

2. `lockGuard类`, 此类其实是为了更加简单的使用上锁和解锁而封装的.

	此类中, 定义了一个成员变量 是我们封装的 myMutex类.
	
	而 此类的构造函数, 首先通过初始化列表初始化成员变量. 然后通过成员变量来调用我们封装过的上锁函数. 就可以达到一个 实例化 `lockGuard` 对象自动上锁的功能
	
	然后是 此类的析构函数, 析构函数的内容就是通过成员变量调用我们封装过的解锁函数. 就可以达到 在 `lockGuard`对象析构的时候, 自动解锁的功能

那么, 在 `myThread.cpp` 的这段使用我们封装的类的代码中, 我们是怎么上锁和解锁的？

我们先实例化了一个 全局的 `myMutex 对象`, 以便于线程可以看到.

然后, 将抢票的操作单独实现了一个函数, 抢票成功返回true, 失败返回 flase:

![|inline](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/image-20230417172111322.webp)

并在此函数中, 即将进入临界区时, 使用我们实例化的 `myMutex 对象 ` 实例化了一个 `lockGuard 对象`. 因为, 实例化 对象会自动执行构造函数, 而 lockGuard 类的构造函数内容就是 `上锁`. 所以 实例化 `lockGuard 对象` 就是自动上锁了.

并没有手动去解锁, 因为此函数执行结束的时候, 临时对象的生命周期就要到了, 就会自动调用析构函数来释放自己. 而 `lockGuard` 类的析构函数内容就是 `解锁`. 所以 `lockGuard 对象` 生命结束, 就是自动解锁了.

而我们 将 抢票逻辑的代码 单独实现了一个函数, 所以开始抢票就会自动上锁, 抢票失败或成功就会自动解锁

> 我们实现的上锁和解锁功能, 是基于C++类的特性来实现的.
>
> 并且, 一个类的生命周期是在其所在的控制块内. 所以还可以这样使用:
>
> ```cpp
> #include <iostream>
> #include "threadLock.hpp"
> 
> int cnt = 0;
> myMutex mymutex;
> 
> void* startRoutine(void* args) {
>     // 如果我们需要统计线程执行此函数了多少次, 我们只需要使用下面这段代码块
>     {
>         lockGuard myLock(&mymutex);
>         cnt++;
>     }
>     // 这也是一个控制块, myLock对象 出此控制块会自动调用析构函数, 即出此控制块会自动解锁.
>     
>     // …… 其他代码
> }
> ```

## 可重入 VS 线程安全

要对比可重入和线程安全. 就需要先了解这两个名词的概念

### 概念

1. **`线程安全: `** **`多线程并发运行同一段代码时, 单一线程不会影响到其他线程或整个进程的运行结果, 就叫做线程安全`**

    如果会影响线程或进程, 就被称为 `线程不安全`

2. **`可重入: `** 同一个函数被不同执行流调用, 在一个执行流执行没结束时, 有其他执行流再次执行此函数, 这个现象叫 `重入`.

    如果, **`函数被重入执行结果等不会发生错误, 则成此函数为可重入的函数`**. 否则 为不可重入的函数

    > 函数被重入会出现错误, 其实是因为代码编写错误出现了BUG. 其实是编写者的问题, 而不是函数的问题.
    >
    > 重入是一种特性, 而不是一种错误.


![](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/image-20230417174216154.webp)

### 常见的线程不安全的情况
1. 不保护共享变量的函数

2. 函数状态随着被调用 会发生变化的函数

    比如, 我们在函数内部定义了一个静态变量, 然后不加锁的++, 用来统计线程调用此函数的次数

3. 返回指向静态变量指针的函数

4. 调用线程不安全函数的函数

### 常见的线程安全的情况

1. 每个线程对全局变量或者静态变量 **`只有读取权限, 没有写入权限`**, 一般来说这些线程是 `安全` 的
2. 类或接口对于线程来说都是 `原子操作`
3. 多个线程之间的切换`不会导致`该接口的`执行结果存在二义性`

### 常见不可重入的情况 **

1. `调用了malloc/free`函数, 因为 `malloc函数是用全局链表来管理堆的`

    如何理解 `malloc` 使用全局链表管理堆的呢？

    其实, malloc 在堆区动态开辟空间, 实际是调用了 系统调用brk. 并且 并不只是简单的开辟一块空间. 还需要将开辟出的空间以 全局链表的形式管理起来.

    进程地址空间是由PCB维护的, 在源码中即 task_struct 的成员 mm_struct 类型的变量.

    而在mm_struct 结构体中, 存在着一个成员是用来描述 虚拟内存列表: 

    ![|wide](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/image-20230417182249763.webp)

    此变量就是用来维护开辟出来的堆的:

    ![|wide](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/image-20230417182435387.webp)

    我们使用 malloc 开辟出10块空间, 就会以 vm 的形式组成一个 10个节点的链表. 释放一块空间, 就会删除一个节点.

    这就是管理堆的形式. 此链表是全局的. 

2. 调用了标准I/O库函数, 标准I/O库的很多实现都以不可重入的方式使用全局数据结构

3. 可重入函数体内使用了静态的数据结构

### 常见可重入的情况

1. 不使用全局变量或静态变量
2. 不使用用malloc或者new开辟出的空间
3. 不调用不可重入函数
4. 不返回静态或全局数据, 所有数据都有函数的调用者提供
5. 使用本地数据, 或者通过制作全局数据的本地拷贝来保护全局数据

### 可重入与线程安全联系

1. 函数是可重入的, 那就是线程安全的
2. 函数是不可重入的, 那就不能由多个线程使用, 有可能引发线程安全问题
3. 如果一个函数中有全局变量, 那么这个函数既不是线程安全也不是可重入的

### 可重入与线程安全区别

1. 重入函数是线程安全函数的一种
2. 线程安全不一定是可重入的, 而可重入函数则一定是线程安全的。
3. 如果将对临界资源的访问加上锁, 则这个函数是线程安全的. 但如果这个重入函数 若锁还未释放则可能会产生死锁, 因此是不可重入的

这里提到一个名称, `死锁`. 那什么是死锁？

## 死锁

`死锁`是什么？

**`死锁`**: 在一组进程、线程中的各个进程、线程 `均占有不会释放的资源`, 但 **`因互相申请被其他进程、线程所占用不会释放的资源而处于的一种永久等待状态`**.

这是死锁的概念. 我们可以使用下面这段代码实现死锁: 

```cpp
#include <iostream>
#include <unistd.h>
#include <pthread.h>

int cnt = 0;
pthread_mutex_t mutexA = PTHREAD_MUTEX_INITIALIZER;
pthread_mutex_t mutexB = PTHREAD_MUTEX_INITIALIZER;

void* startRoutineA(void* args) {
    while (true) {
        pthread_mutex_lock(&mutexA);
        sleep(1);
        pthread_mutex_lock(&mutexB);
        cnt++;
        printf("cnt: %d", cnt);
        pthread_mutex_unlock(&mutexA);
        pthread_mutex_unlock(&mutexB);
    }

    return nullptr;
}

void* startRoutineB(void* args) {
    while (true) {
        pthread_mutex_lock(&mutexB);
        sleep(1);
        pthread_mutex_lock(&mutexA);
        cnt++;
        printf("cnt: %d", cnt);
        pthread_mutex_unlock(&mutexB);
        pthread_mutex_unlock(&mutexA);
    }

    return nullptr;
}

int main() {
    pthread_mutex_init(&mutexA, nullptr);
    pthread_mutex_init(&mutexB, nullptr);

    pthread_t tidA, tidB;

    pthread_create(&tidA, nullptr, startRoutineA, (void*)"threadA");
    pthread_create(&tidB, nullptr, startRoutineB, (void*)"threadB");

    pthread_join(tidA, nullptr);
    pthread_join(tidB, nullptr);

    return 0;
}
```

执行这段代码: 

![|inline](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/thread_deadlock.gif)

这段代码的执行结果就是, 卡住. 没有代码在真正运行.

这是为什么呢？

首先我们定义了两个锁, 使用了两个线程.

线程A, 先申请 锁A, 等1s, 再申请 锁B.

线程B, 先申请 锁B, 等1s, 再申请 锁A.

而 线程A和B 几乎是同时运行代码的. 也就是说 线程A 申请到锁A 和 线程B 申请到 锁B, `几乎`是同时的. 

再加上让他俩等了1s, 就导致, `线程A 拿着锁A, 在申请锁B`, `线程B 拿着锁B, 在申请锁A`. 他俩`都申请不到`, `直接造成死锁`.

### 死锁产生的必要条件

1. 互斥条件: : 一个资源每次只能被一个执行流使用
2. 请求与保持条件: 一个执行流因请求资源而阻塞时, 对已获得的资源保持不放
3. 不剥夺条件: 一个执行流已获得的资源, 在末使用完之前, 不能强行剥夺
4. 循环等待条件: 若干执行流之间形成一种头尾相接的循环等待资源的关系

这是死锁产生的四个必要条件 

有产生条件, 就有避免方法

### 死锁的避免方法

最直接有效的避免方法是 **`不使用锁`**. 虽然锁可以解决一些多线程的问题, 但是可能会造成死锁, 而且 上锁和解锁的过程是需要消耗资源的. 如果不停的上锁和解锁, 一定会托慢进程的运行速度.

所以, 在需要使用锁的场景, **`最好先不要考虑如何设置锁, 可以先考虑一下是否可以不用锁`**

如果非要使用锁, 那就得考虑避免死锁: 

1. 破坏死锁的四个必要条件
2. 加锁顺序一致
3. 避免锁未释放的场景
4. 资源一次性分配

可以通过这四种手段, 来尽量避免死锁.

---

文章介绍到这里, 就要结束啦~

感谢阅读~
