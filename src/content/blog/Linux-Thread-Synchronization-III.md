---
draft: true
title: "[Linux] 线程同步分析III: 什么是信号量? POSIX信号量如何使用? 借助信号量实现环形队列的生产者消费者模型"
pubDate: "2023-04-25"
description: "信号量怎么实现线程同步?"
image: https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/202412191906792.webp
categories:
    - Blogs
tags: 
    - Linux系统
    - 多线程
    - 同步
    - 生产者消费者模型
---

# POSIX信号量

**信号量 也是同步的一种机制**

## 什么是信号量？

那么什么是信号量呢？信号量可以看作是一个计数器

以生活中的一个例子 来简单的解释一下信号量: 看电影

如果我们已经有了想要看的电影, 我们去电影院首先要做的事是什么？选放映厅, 然后选座

电影院的每一个放映厅的座位都是**有限**的, 不过**每一个空座位都可以被任何人选择**

要看电影, 就需要选座位买票, 每买一张票选一个座位, 放映厅内的空座位就会少一个

买到了电影票, 实际上就是选了放映厅内指定的座位, 让空座位`-1`

那么, 以编程的角度:

放映厅就可以看作为一个 **临界资源**, 每一个座位都是临界资源的一小部分资源

**所有的座位就可以看作是信号量**

当有人买票时选中了座位, 接下来可选择的座位就少了一个, 可以看作**信号量`--`**

如果有人退票, 就可以看作是**信号量`++`**

当放映厅里没有了空座位, 就表示**信号量减到了`0`**, 其他人再想要买票, 就需要等有人退票

也就是说, 信号量`-1`表示着临界资源中的一部分被选中了, 也就表示着之后只能选择临界资源的其他部分

这样一个看电影选票的例子, 其实就可以很好的解释信号量

那么, 提问: 如果一个放映厅只有一个座位, 也就是说**信号量最大为`1`**, 那么 信号量可以表示什么？

**互斥锁!** 

如果信号量只有1, 那么此信号量就可以当互斥锁用

此时, 信号量`1 –> 0`就是上锁的过程

信号量`0 –> 1`就是解锁的过程.

信号量最大为`1`时, 此信号量被称为**二元信号量**

---

上面例子, 是将放映厅当作了一个临界资源, 每个座位都是临界资源得一部分

编程中的 **临界资源也是可以分为一小部分一小部分的**

临界资源分为一小部分一小部分的, 通过**信号量操作**来让线程选中

申请信号量, 实际就是对一部分临界资源的申请

那么 **如果申请到了信号量, 就表示一定获得了一部分临界资源吗？**

这个问题的答案是肯定的

**只要申请到了信号量, 就一定获得了一部分临界资源**

因为, 申请到只要不释放, 别人就无法申请, 从原则上来说, 已经获得了这部分资源

信号量可以被所有线程申请和释放, 即`--` 和 `++`

即 信号量也是一个临界资源. 即 信号量的申请和释放需要时原子性的

而实际代码上的实现也确实如此: **信号量的申请`--` 和 信号量的释放`++` 都是 原子性的**

## 信号量的接口

介绍过互斥锁和条件变量之后, 信号量的接口和使用其实就显得很简单了

首先, 信号量的类型为`sem_t`

其常用的基本接口有: 

### 1. `sem_init()`初始化

![ ](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/image-20230421141600499.webp)

### 2. `sem_destroy()`销毁

![ ](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/image-20230421141642143.webp)

### 3. `sem_wait()`等待, 即申请信号量

![ ](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/image-20230421141814088.webp)

### 4. `sem_post()`释放信号量

![ ](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/image-20230421141900366.webp)

这些接口, 也都是`pthread`库提供的, 需要使用的是`semphore.h`头文件

# 以环形队列模拟生产者消费者模型 **

之前的文章中使用条件变量 以阻塞队列模拟了生产者消费者模型

现在, 我们通过信号量 以环形队列模拟生产者消费者模型

不过首先要介绍一下什么是环形队列以及环形队列的特点:

## 环形队列

环形队列的物理实现肯定不是环形的, 只不过可以使用普通的数组模拟出环形队列的感觉

比如: 一个有限的数组`[0, 7]`一共8个空间 就能够模拟出一个环形的队列

队列的特点是 **先进先出**

而环形队列实现先进先出的方法是: **可变的队头**

用数组实现的普通队列的先进先出一般是固定的队头, 如果以`[0, 7]`来实现, 那么队头恒为`0`

![|inline](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/image-20230421153132693.webp)

先进先出总是 从`0`位置出, 然后将后面的元素向前移动一位

而环形队列不同

环形队列可以看作将数组卷了起来: 

![|medium](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/image-20230421144734700.webp)

环形队列 使用两个"指针"来表示队头和队尾

并且, 不同于普通的队列, **环形队列的队头是可以变化的**

举个例子: 

如果, 环形队列中, `0` `1` `2` `3`位置存储有数据

那么, 队头指针指向`0`, 队尾指针指向`3`或`4`

**出队列时**, 需要获取`0`位置的数据, 然后 **队头指针++, 移动到`1`, 新的队头就是`1`位置**

**入队列时**, 就是 **队尾指针++在存放数据, 或者存放数据后再++**

这就是环形队列的特点

**出队列时, 队头`++`改变, 即, 环形队列的任意位置都可能是队头**

队头移动了一位, 也就表示 **队尾可以多向后走一位**, 就像是在转圈一样

数组实现环形队列可以使出队列的操作更快, 因为不用移动数据

但是, 环形队列有一个缺点, 就是**不容易直接判断队列是否为满或为空 **

环形队列: 

队列为空, 队头和队尾指针指向同一位置

队列为满, 队头和队尾指针也指向同一位置

所以, 环形队列判断为空或未满, 一般通过入队列出队列计数器, 或者恒在队头的前一个位置留空来实现

---

那么, **总结一下**

什么是环形队列？

首先, **环形队列的长度是一定的**

其次, 队头和队尾用两个"指针"表示

数据入队列, 数据存储在队尾指针位置, 队尾指针向后`++`

数据出队列, 从队头指针位置获取数据, 队头指针向后`++`

当指针移动到数组的最后一个元素时, 再`++`就会回到`0`位置

两指针在同一个位置时, 队列可能为空, 也可能为满: 

1. 如果刚创建的队列, 那就为空
2. 如果队尾指针刚追上队头指针, 那就为满
3. 如果队头指针刚追上队尾指针, 那就为空

那么, 环形队列如何模拟生产者消费者模型呢？

## 模拟模型

### 思路

其实, 模拟的思路也很简单

还是将线程分为生产者和消费者

生产者**生产数据**的动作, 即为 **将数据入队列**

消费者**消费数据**的动作, 即为 **将数据出队列**

当队列为空时, 生产者可以生产, 消费者不能消费

当队列为满时, 生产者不能生产, 消费者可以消费

此时的**生产线程和消费线程需要访问同一个位置**,  是**互斥与同步**的关系

当队列为其他情况时, 生产者和消费者可以并发的生产和消费

因为, 此时生产线程和消费线程访问的不是同一个位置

并且, 在队列中 **生产者不能超越消费者, 消费者也不能超越生产者**

**即, 队列满时, 不能再生产, 队列空时, 不能再消费**

这些在实现时, **都是由信号量来保证的**

首先要知道, 在队列中: 

1. 生产者需要的是什么资源？

	需要**空间资源**, 因为需要向队列中, 入数据

2. 消费者需要的是什么资源？

	需要**数据资源**, 因为需要从队列中, 出数据

那么, 就可以针对不同的资源, 创建两个信号量

一个信号量 表示空间资源量`roomSem`, 另一个信号量 表示数据资源量`dataSem`

**生产者**, 需要等待 `roomSem`, 即申请 空间资源信号量, 申请成功 则**空间资源信号量`--`**

并且, 申请成功就表示获得了一块空间资源, 别人就无法获取

然后, 等到生产数据入队列之后, **数据资源信号量还需要`++`**, 因为 有数据入队列了

**消费者**, 需要等待`dataSem`, 申请 数据资源信号量, 申请成功 则**数据资源信号量`--`**

等到数据出队列之后, **空间资源信号量是需要`++`**的

那么, 初始情况下`roomSem`应该为多少？ `dataSem` 应该为多少？

初始情况, **队列中没有数据, 所以`roomSem`应该为`N`, `dataSem`应该为`0`**

只要控制好, `roomSem++`时, 对应的`dataSem`需要`--`;  `dataSem++`时, 对应的`roomSem`需要`--`

就可以保证生产者、消费者不会互相超越

队列中没有数据时, `roomSem`为`N`, `dataSem`为`0`, 需要生产者先生产

队列中满数据时, `roomSem`为`0`, `dataSem`为`N`, 需要消费者先消费

这两种情况,  **生产者和消费者访问的是同一块空间, 所以是需要互斥、同步的**

而在其他情况时, 生产者和消费者不是指向同一空间, 那么**生产和消费的动作就可以并发**的执行

---

上面说了这么多模拟生产者消费者模型的思路

其实都是在一个前提下: **不同的线程访问的是临界资源的不同部分**

### 借助信号量 模拟 生产者消费者模型

下面, 就来正式以环形队列模拟一下, 生产者消费者模型: 

`ringQueue.hpp:`

```cpp
#pragma once
#include <iostream>
#include <vector>
#include <semaphore.h>
using std::cout;
using std::endl;
using std::vector;

const int gDefultCap = 10; 

template <class T>
class ringQueue {
public:
    // 构造函数
    ringQueue(const int cap = gDefultCap) 
        : _ringQueue(cap) 
        , _pIndex(0)
        , _cIndex(0) {
        sem_init(&_roomSem, 0, _ringQueue.size());
        sem_init(&_dataSem, 0, 0);
        // sem_init() 接口的 
        // 第一个参数是 需要初始化的信号量, 
        // 第二个参数是 线程共享(0)还是进程共享
        // 第三个参数是 需要初始化为多少
    }
    
    // 析构函数
    ~ringQueue() {
        sem_destroy(&_roomSem);
        sem_destroy(&_dataSem);
    }
    
    // 生产接口
    void push(const T &in) {
        // 生产数据
        // 先申请空间信号量
        sem_wait(&_roomSem);            // 申请成功则 _roomSem--, 否则等待
        _ringQueue[_pIndex] = in;       // 将数据放入 数组
        sem_post(&_dataSem);            // 数组中数据+1, 那么 dataSem 需要++
        _pIndex++;                      // 生产者下一次生产数据的位置 ++
        _pIndex %= _ringQueue.size();   // 跟新下标, 保证环形特性
    }
    
    // 消费接口
    T pop() {
        // 消费数据
        // 先申请数据信号量
        sem_wait(&_dataSem);            // 申请成功则 _dataSem--, 否则等待
        T tmp = _ringQueue[_cIndex];    // 存储应拿到的数据
        sem_post(&_roomSem);            // 拿出了数据, 空间+1, 那么 _roomSem ++
        _cIndex++;
        _cIndex %= _ringQueue.size();

        return tmp;
    }


private:
    vector<T> _ringQueue;   // 模拟循环队列的数组
    sem_t _roomSem;         // 空间资源信号量, 生产者申请
    sem_t _dataSem;         // 数据资源信号量, 消费者申请
    uint32_t _pIndex;       // 生产者生产数据的索引下标, 即插入数据的下标
    uint32_t _cIndex;       // 消费者消费数据的索引下标, 即获取数据的下标
};
```

环形队列模拟生产者消费者模型的封装实现, 没有什么需要特别注意的点

首先成员是: 
1. 一个数组, 用来模拟环形队列
2. 一个空间信号量、一个数据信号量. 分别用来控制生产者对空间的申请, 消费者对数据的申请
3. 一个生产数据的索引下标, 一个消费数据的索引下标, 分别用来表示插入数据的下标, 和拿出数据的下标

其次, 就是初始化信号量的操作. `sem_init()`的使用: 

```cpp
int sem_init(sem_t *sem, int pshared, unsigned int value);
```

此接口需要传入三个参数:
1. `sem_t* sem`, 需要初始化的信号量
2. `int pshared`, 信号量的类型. 暂不考虑, 传入`0`
3. `unsigned int value`, 信号量的初始值

注意:  此接口不能对一个信号量重复使用

最后, 需要注意的就是: 

需要使用`_cIndex %= _ringQueue.size()`和`_pIndex %= _ringQueue.size()`来控制环形特性

因为, 在生产数据和消费数据后, `_pIndex`和`_cIndex`需要`++`

如果不控制, 迟早超出数组, 所以需要 取模控制一下, 并控制环形特性

`ringQueue.cc:`

```cpp
#include "ringQueue.hpp"
#include <iostream>
#include <ctime>
#include <unistd.h>
using std::cout;

// 消费线程调用函数
void* consumer(void* args) {
    ringQueue<int>* ringQp = static_cast<ringQueue<int>*>(args);
    while (true) {
        sleep(3);
        int data = ringQp->pop();
        cout << "consumer_pthread[" << pthread_self() << "]"
             << " 消费了一个数据: " << data << endl;
    }
}

// 生产线程调用函数
void* productor(void* args) {
    ringQueue<int>* ringQp = static_cast<ringQueue<int>*>(args);
    while (true) {
        int data = rand() % 20;
        ringQp->push(data);
        cout << "productor_pthread[" << pthread_self() << "]"
             << " 生产了一个数据: " << data << endl;
        sleep(1);
    }
}

int main() {
    srand((unsigned long)time(nullptr) ^ getpid());

    ringQueue<int> ringQ;

    pthread_t con, pro;
    pthread_create(&con, nullptr, consumer, &ringQ);
    pthread_create(&pro, nullptr, productor, &ringQ);

    pthread_join(con, nullptr);
    pthread_join(pro, nullptr);

    return 0;
}
```

主函数相关的代码, 就没有需要注意的地方了.

实现之后, 编译执行这段代码: 

![|inline](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/ringQueue_c1_p1.gif)

在代码中设置, `1s`生产一次数据, `3s`消费一次数据

所以, 从代码的执行结果中可以看到: 

刚开始, 生产3个数据, 消费1个数据, 并且**按照生产的顺序消费**

到后面, 由于消费速度不快, 所以队列很快被占满, 但是**生产者也并没有超越消费者去生产数据, 而是等着消费者消费之后, 再生产**

这是因为信号量在控制着

队列被占满时, `sem_wait(_roomSem)`是无法申请成功空间信号量的, 因为此时`_roomSem`为0

队列为空时, 则相反

不过, 此时实现的代码是 单生产线程和单消费线程的

如果是, 多生产线程和多消费线程, 当前模拟的生产者消费者模型的代码会出现错误吗？

毫无疑问, 会出现错误

因为, 如果是多线程生产和消费, 那么**对索引下标的保护就不合格**

在多线程生产时, 只要队列中存在足够的空间, 多线程就会并发的去访问 索引下标

而一个对象内只有一个索引下标, 如果不对索引下标添加保护, 就一定会造成错误

所以, **需要用锁来对索引下标进行保护**

那么, `ringQueue`封装的成员就需要改进一下: 

```cpp
#pragma once
#include <iostream>
#include <vector>
#include <semaphore.h>
using std::cout;
using std::endl;
using std::vector;

const int gDefultCap = 30; 				// 实现了多线程, 适当的将队列放大 

template <class T>
class ringQueue {
public:
    // 构造函数
    ringQueue(const int cap = gDefultCap) 
        : _ringQueue(cap) 
        , _pIndex(0)
        , _cIndex(0) {
        sem_init(&_roomSem, 0, _ringQueue.size());
        sem_init(&_dataSem, 0, 0);
        // sem_init() 接口的 
        // 第一个参数是 需要初始化的信号量, 
        // 第二个参数是 
        // 第三个参数是 需要初始化为多少

        // 初始化锁
        pthread_mutex_init(&_pMutex, nullptr);
        pthread_mutex_init(&_cMutex, nullptr);
    }
    // 析构函数
    ~ringQueue() {
        sem_destroy(&_roomSem);
        sem_destroy(&_dataSem);

        pthread_mutex_destroy(&_pMutex);
        pthread_mutex_destroy(&_cMutex);
    }
    // 生产接口
    void push(const T &in) {
        // 生产数据
        // 先申请空间信号量
        sem_wait(&_roomSem);                // 申请成功则 _roomSem--, 否则等待
        pthread_mutex_lock(&_pMutex);       // 申请信号量成功后, 加锁
        _ringQueue[_pIndex] = in;           // 将数据放入 数组
        _pIndex++;                          // 生产者下一次生产数据的位置 ++
        _pIndex %= _ringQueue.size();       // 跟新下标, 保证环形特性
        pthread_mutex_unlock(&_pMutex);     // 访问完临界资源, 解锁
        sem_post(&_dataSem);                // 数组中数据+1, 那么 dataSem 需要++
    }
    // 消费接口
    T pop() {
        // 消费数据
        // 先申请数据信号量
        sem_wait(&_dataSem);            // 申请成功则 _dataSem--, 否则等待
        pthread_mutex_lock(&_cMutex);
        T tmp = _ringQueue[_cIndex];    // 存储应拿到的数据
        _cIndex++;
        _cIndex %= _ringQueue.size();
        pthread_mutex_unlock(&_cMutex);
        sem_post(&_roomSem); // 拿出了数据, 空间+1, 那么 _roomSem ++
        return tmp;
    }


private:
    vector<T> _ringQueue;   // 模拟循环队列的数组
    sem_t _roomSem;         // 空间资源信号量, 生产者申请
    sem_t _dataSem;         // 数据资源信号量, 消费者申请
    uint32_t _pIndex;       // 生产者生产数据的索引下标, 即插入数据的下标
    uint32_t _cIndex;       // 消费者消费数据的索引下标, 即获取数据的下标

    // 保护索引下标的锁
    pthread_mutex_t _cMutex;    // 消费数据索引下标的锁
    pthread_mutex_t _pMutex;    // 生产数据索引下标的锁
};
```

在类内, 添加**两个锁来分别保护 生产和消费数据的索引下标**

**为什么要用两个锁？** 

因为需要保证 生产和消费在不同位置的并发, 所以不能只用一把锁

并且, 在生产接口和消费接口中, 都是在 **申请到信号量之后上的锁, 这是为什么？**

因为, **申请到信号量 就表示其实可以看作已经获取到资源了**

所以, 申请到信号量之后再上锁, 可以实现让线程先预定资源再等待的功能

防止出现, 线程先因为锁 阻塞了一会, 终于抢到锁了, 却申请不到资源的情况

改进封装之后, 多线程试验一下

为了测试多线程是否做好了保护, 可以先让多个生产线程一直生产, 看一看会不会出错. 然后再消费线程: 

```cpp
#include "ringQueue.hpp"
#include <iostream>
#include <ctime>
#include <unistd.h>
using std::cout;

// 消费线程调用函数
void* consumer(void* args) {
    sleep(10);
    ringQueue<int>* ringQp = static_cast<ringQueue<int>*>(args);
    while (true) {
        sleep(1);
        int data = ringQp->pop();
        cout << "consumer_pthread[" << pthread_self() << "]"
             << " 消费了一个数据: " << data << endl;
    }
}

// 生产线程调用函数
void* productor(void* args) {
    ringQueue<int>* ringQp = static_cast<ringQueue<int>*>(args);
    while (true) {
        int data = rand() % 20;
        ringQp->push(data);
        cout << "productor_pthread[" << pthread_self() << "]"
             << " 生产了一个数据: " << data << endl;
        usleep(500000);
    }
}

int main() {
    srand((unsigned long)time(nullptr) ^ getpid());

    ringQueue<int> ringQ;

    pthread_t con1, con2, con3, pro1, pro2, pro3;
    pthread_create(&con1, nullptr, consumer, &ringQ);
    pthread_create(&con2, nullptr, consumer, &ringQ);
    pthread_create(&con3, nullptr, consumer, &ringQ);
    pthread_create(&pro1, nullptr, productor, &ringQ);
    pthread_create(&pro2, nullptr, productor, &ringQ);
    pthread_create(&pro3, nullptr, productor, &ringQ);

    pthread_join(con1, nullptr);
    pthread_join(con2, nullptr);
    pthread_join(con3, nullptr);
    pthread_join(pro1, nullptr);
    pthread_join(pro2, nullptr);
    pthread_join(pro3, nullptr);

    return 0;
}
```

我们让单线程每 0.5s 生产一个数据, 让10s后, 单消费线程再以 1s 消费一个数据的速度消费.

代码的执行结果为: 

![|inline](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/ringQueue_c3_p3.gif)

虽然打印的结果很混乱, 但是还是可以看出**没有出现生产或消费出错**的

这就是 以环形队列模拟生产者消费者模型

---

本片文章到这里就结束啦~

感谢阅读