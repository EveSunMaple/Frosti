---
draft: true
title: "[Linux] 详解 System V: 共享内存原理、创建及使用、结合管道添加访问限制..."
pubDate: "2023-04-03"
description: "System V 给进程间通信指定的标准有三种 1. System V 消息队列 2. System V 共享内存 3. System V 信号量 本篇文章主要分析介绍 共享内存"
image: https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/202306251801269.webp
categories: ['tech']
tags: ["Linux系统", "进程", "通信"]
---

`System V` 是一种操作系统进程间通信的标准. 

`System V` 给进程间通信指定的标准有三种: 

1. System V 消息队列
2. **System V 共享内存**
3. System V 信号量

本篇文章主要分析介绍 共享内存

---

# 共享内存

我们知道,  **进程间通信的前提是: 先让不同的进程看到同一份资源**

Linux的管道通信给进程间看到的同一份资源是: **管道文件**

而 共享内存 给进程间看到的同一份资源是: **物理内存**

## 共享内存原理

Linux操作系统中, 由于进程地址空间的存在, 进程具有独立性

进程的进程地址空间的大致模型是这样的: 

![|large](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/image-20230328180441494.webp)

在Linux动态库的相关文章中提到过, 动态库在进程运行时是加载到内存中, 再被映射到进程地址空间的共享区的

那么 进程所使用的动态库所加载的一块内存, 其实就可以看作是一块只读共享内存

共享内存进程通信其实就是这个原理

共享内存进程通信, 其实就是 **在物理内存中开辟一块可以让所有进程都看到的内存空间**

然后多进程只需要从这块内存空间内读取或写入数据, 就可以达到进程通信的功能: 

![](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/image-20230328181610751.webp)

也就是说, 使用 **共享内存进程间通信的原理就是**: 

**在物理内存中开辟一块共享内存, 然后通过页表将这块物理内存映射到进程地址空间中**

**这块物理内存可以被多个进程映射, 所以就可以以此实现进程通信**

## 共享内存的创建与删除

进程间要通过共享内存实现通信, 肯定是是需要先创建一块共享内存的

创建共享内存和删除贡献内存, Linux操作系统提供的有系统调用

### 共享内存的创建`shmget()`

![ ](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/image-20230328204726605.webp)

`shmget()`是操作系统提供的 **分配共享内存的系统调用**, 需要三个参数: 

1. `key_t key`
2. `size_t size`
3. `int shmflg`

> `shm`是`share memory`的简写

1. 首先介绍一下 第二个参数: 

	`size_t size`, 此参数传入的是 `需要开辟多大的共享内存`, 单位是 `byte字节`
	
	系统会按照`4KB`为单位开辟空间, 因为系统`I/O`的单位大小就是 `4KB`
	
	也就是说, `size`参数传入`1`、`1024`、`2048`、`4096`时, 系统都会开辟 `4KB`. 当传入`4097`时, 系统就开会开辟 `8KB`
	
	不过, **虽然系统会按照 4KB为单位开辟空间, 但实际上能够使用的大小还是 size字节**

2. 其次是, 第三个参数: 

  `int shmflg`, 此参数传入的是 创建共享内存时的参数, 就像Linux文件操作的`open`系统调用的 `O_WRONLY`、`O_RDONLY`…… 

  此参数, 操作系统提供的最重要的两个宏是: `IPC_CREAT`  `IPC_EXCL`

  `IPC_CREAT`: 传入此宏, 则表示 **创建一个新的共享内存段**

  若共享内存段已存在, 则获取此内存段; 若不存在, 就创建新的内存段

  `IPC_EXCL`: 此宏, 必须要与`IPC_CREAT`一起用. 传入此宏, 则表示 **如果创建的内存段不存在, 则正常创建, 否则返回错误**

  使用这个宏, 可以 **保证此次使用shmget函数成功时, 创建出的共享内存一定是全新的**

3. 最后介绍, 第一个参数:

	`key_t key`, 此参数其实是传入一个整数
	
	因为`key_t`其实就是整型: 
	
	![|large](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/image-20230328221108075.webp)
	
	传入的`key`值, 其实是 **创建的共享内存段, 在操作系统层面的的 唯一标识符**
	
	共享内存是Linux系统的一种进程通信的手段, 而 **操作系统中 共享内存段 是有许多的**, 为了管理这些共享内存段, 操作系统一定会描述共享内存段的各种属性
	
	在Linux操作系统中, 共享内存会被描述为一个结构体, 就像描述进程的`task_struct`、描述文件的`file`等
	
	描述共享内存的结构体内会维护一个 **`key`值, 用于表示共享内存在系统层面的唯一标识符**, 一般由用户传入
	
	也就是`shmget()`系统调用的第一个参数 `key_t key`. 
	
	`key`值需要表示共享内存的唯一标识符, 所以 每块共享内存的`key`值都需要不同, 也就是说 `key`值虽然是用户传入的, 但是 `key`值的获取也是需要一定的方法的
	
	Linux系统也 **为`key`值的获取提供了一个系统调用: `ftok()`**
	
	![|wide](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/image-20230328222807427.webp)
	
	`pathname`是一个文件的路径, `proj_id`则是随意的`8bit`的数值
	
	`ftok()`执行成功会返回一个 key值, 这个 **`key`值是由传入文件的`inode`值 和 传入的`proj_id`值通过一定的算法计算出来的**
	
	文件的`inode`在系统中是唯一的, 所以不同的文件计算出的`key`值, 也会不同

分析完`shmget()`的参数, 要完整的了解`shmget()`的作用, 还需要了解其返回值

`shmget()`的返回值: 

![ ](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/image-20230328223740737.webp)

若创建共享内存成功, 或找到共享内存, 则返回共享内存`id`

此`id`可以让进程找到共享内存, 即可以达成进程通信的前提: **让进程看到同一块资源**

---

下面这段代码是`shmget()`的基本的用法: 

```cpp
#include <iostream>
#include <sys/ipc.h>
#include <sys/shm.h>
using std::cout;
using std::endl;
using std::cerr;

int main() {
    int key = ftok(".ipcShm", 0x14);
    int shmId = shmget(key, 4096, IPC_CREAT | IPC_EXCL);
    if(shmId == -1) {
        cerr << "shmget error" << endl;
        exit(1);
    }
    
    cout << "shmget success, key: " << key << " , shmId: " << shmId << endl;

    return 0;
}
```

当这段代码执行一次时: 

![](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/image-20230328224615468.webp)

成功一次, 然后再多次执行时: 

![](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/image-20230328224647281.webp)

会发现, 在第一次创建之后, 再次创建就会一直创建失败、创建错误.

这是为什么？

第一次创建共享内存的进程早就退出了, 但是我们再次已相同的key值创建共享内存, 却会创建失败

难道, **共享内存不会跟随进程的退出而被释放吗？**

没错, **共享内存 并不会随进程的退出 而被释放**, 也就是说, 创建共享内存的进程退出之后, 共享内存其实时依旧存在在操作系统中的

我们可以在命令行使用**`ipcs -m`**查看操作系统内存在的共享内存: 

![](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/image-20230328225149380.webp)

某`key`值的共享内存已经存在了, 所以不能再次以相同的`key`值创建

所以, 之后再 **创建相同`id`共享内存时, 需要先删除已经创建的共享内存**

### 共享内存的删除`ipcrm -m`和`shmctl()`

以某个`key`值创建过共享内存之后, 就不能在以相同的`key`值再创建共享内存了

所以我们需要删除上次创建的共享内存.

而 删除已创建的共享内存, 有两种方法: 

1. `ipcrm`, 这是一个命令用于删除进程通信相关内容的

    而 `ipcrm -m`, 则是删除共享内存的指令, `-m`就是共享内存的选项.

    我们使用`ipcs -m`可以 以列表的形式列出已经创建的共享内存:

    ![|wide](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/image-20230329093003625.webp)

    此列表中, 存在两个标识符可以表示一块共享内存: `key`和`shmid`

    而我们使用 `ipcrm -m` 删除共享内存使用的是 `shmid`

    所以 在此例中, 我们在命令行使用: `ipcrm -m 1` 就可以删除刚刚创建出的共享内存:

    ![|wide](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/image-20230329093249770.webp)

    不过, 共享内存肯定不会只能从命令行删除.

    在代码中也是可以删除的

2. `shmctl()`, 是一个系统调用接口, 可以用来删除已创建的共享内存

    ![|wide](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/image-20230329093504785.webp)

    此系统调用, 其实是控制共享内存的接口, 其参数:

    1. `int shmid`, 此参数传入需要控制的共享内存的id, 其实就是`shmget`的返回值. 用来选择控制的共享内存块

    2. `int cmd`, 这个参数需要传入操作系统提供的控制共享内存块的选项

        其中有一个选项是 摧毁共享内存块用的`IPC_RMID`

        ![|wide](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/image-20230329094151381.webp)

        传入`IPC_RMID`可以将指定的共享内存块, 标记为被摧毁了

        可以达到删除的目的

    3. `struct shmid_ds *buf`, 需要传入一个指针, 指针应该指向一个`shmid_ds`结构体

        此结构体的内容是:

        ![|wide](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/image-20230329094525917.webp)

        不过我们删除共享内存块, 一般用不上这个参数
    
        所以 **删除共享内存块 只需要传入`nullptr`就可以**
    
    那么, 我们就可以 在代码中使用 `shmctl(shmid, IPC_RMID, nullptr);`, 删除指定的共享内存块
    
    ```cpp
    #include <iostream>
    #include <sys/ipc.h>
    #include <sys/shm.h>
    #include <unistd.h>
    using std::cout;
    using std::endl;
    using std::cerr;
    
    int main() {
        // 0. 创建共享内存块
        int key = ftok(".ipcShm", 0x14);
        int shmId = shmget(key, 4096, IPC_CREAT | IPC_EXCL);
        if(shmId == -1) {
            cerr << "shmget error" << endl;
            exit(1);
        }
        
        cout << "shmget success, key: " << key << " , shmId: " << shmId << endl;
        sleep(10);
    
        // 1. 删除共享内存块
        int res = shmctl(shmId, IPC_RMID, nullptr);
        if(res == -1) {
            cerr << "shmget error" << endl;
            exit(2);
        }
    
        return 0;
    }
    ```

    这段代码的运行效果是:
    
    ![|wide](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/image-20230329095449845.webp)
    
    创建成功 10s 后:
    
    ![|wide](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/202306271519139.webp)

我们介绍了这些内容, 是在介绍什么？

其实就是 **创建一个可以 让不同进程看到的同一个资源, 这个资源就是共享内存块**

## 使用共享内存 进程通信

上面介绍了, 共享内存的创建和删除. 创建和删除一定都不是目的, **使用** 才是目的

**让进程看到已经创建出来的共享内存, 其实就是将 物理内存中的共享内存通过也表映射到进程地址空间的共享区中**

归根结底, 共享内存只是一块内存空间 与 管道通信不同, 管道说到底是一个文件

所以使用管道进行通信需要用到Linux文件操作的系统调用接口: `open()`、`close()`、`read()`、`write()`……

而共享内存是一块内存空间, 实际上是 **可以直接使用** 的. 就像`C/C++`使用`malloc()`或`new`出来的空间一样, 都是可以直接使用的

并且, **共享内存通信**, 其实是 **进程间通信最快的一种通信方式** 

但是, 进程使用这块共享内存, 除了先创建共享内存之外, 还需要让内存看到这块共享内存

让进程看到共享内存的方式, 被称为`attach(连接、挂载)`. 操作系统为我们提供了相应的系统调用接口: `shmat()`

### 让进程看到共享内存`shmat()`

`shmat()`其实就是`share memory attach`的简写

![ ](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/image-20230329101923945.webp)

`shmat()`需要传入三个参数:

1. `int shmid`, 需要传入`shmget()`的返回值. 用来选择挂接的共享内存块

2. `const void *shmaddr`, 传入一个地址. 此参数是 **用来指定连接地址** 的

  通常可以选择传入 `nullptr`. 

  如果传入`nullptr`, 那么就会自动选择连接地址

  如果传入的不是`nullptr`, 那么就需要根据第三个参数中 是否传入了`SHM_RND`, 来决定连接地址:

  1. 如果 没有传入`SHM_RND`, 则就以传入的`shmaddr`作为连接地址

  2. 如果 第三个参数没有传入`SHM_RND`, 则连接的地址会 **自动向下调整为最近的`SHMLBA`的整数倍**

  	`shmaddr - (shmaddr % SHMLBA)`
  	
  	`SHMLBA`是共享内存最小对齐边界, 由操作系统设定

3. `int shmflg`, 此参数需要传入操作系统提供的宏. 一般会使用两个宏

	`SHM_RND`, 此宏是为了与第二个参数结合使用
	
	`SHM_RDONLY`, 使用此宏 表示连接 只读共享内存

`shmat()`连接共享内存成功之后, 会返回一个地址, 此地址与`malloc`和`new`的用法相同

**需要根据接收地址的数据类型 来进行类型强转, 进而控制数据的读取或写入格式**

不同的进程连接到同一个共享内存之后, 就可以进行进程通信了:

`common.hpp:`

```cpp
#include <iostream>
#include <sys/ipc.h>
#include <sys/shm.h>
#include <unistd.h>

#define SHM_SIZE 4096
#define PATH_NAME ".ipcShm"
#define PROJ_ID 0x14
```

`ipcShmServer:`

```cpp
// ipcShmServer 服务端代码, 即 接收端
// 需要创建、删除共享内存块
#include "common.hpp"
using std::cout;
using std::endl;
using std::cerr;

int main() {
    // 0. 创建共享内存块
    int key = ftok(PATH_NAME, PROJ_ID);

    cout << "Create share memory begin. " << endl;
    sleep(2);
    int shmId = shmget(key, SHM_SIZE, IPC_CREAT | IPC_EXCL | 0666);
    if(shmId == -1) {
        cerr << "shmget error" << endl;
        exit(1);
    }
    cout << "Creat share memory success, key: " << key << " , shmId: " << shmId << endl;

    // 1. 连接共享内存块
    sleep(2);
    char* str = (char*)shmat(shmId, nullptr, 0);
    if(str == (void*)-1) {
        cerr << "shmat error" << endl;
        exit(2);
    }
    cout << "Attach share memory success. " << endl;

    // 2. 使用共享内存块
    while(true) {
        cout << str << endl;
        sleep(1);
    }

    // 3. 删除共享内存块
    int res = shmctl(shmId, IPC_RMID, nullptr);
    if(res == -1) {
        cerr << "shmget error" << endl;
        exit(2);
    }

    return 0;
}
```

> 此代码中, 使用`shmget()`创建共享内存块时, 第三个参数使用了`| 0666`
>
> 此操作的作用是, 给创建出的共享内存块设置`0666`权限.
>
> 若不设置权限, 则创建出的 **共享内存块的权限会为`0`, 即任何用户无法使用** :
>
> ![|huge](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/image-20230329105553570.webp)
>
> 当我们通过`| 0666`设置权限之后:
>
> ![|huge](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/image-20230329105706308.webp)

`ipcShmClient:`

```cpp
// ipcShmClient 客户端代码, 即 发送端
// 不参与共享内存块的创建与删除
#include "common.hpp"
using std::cout;
using std::endl;
using std::cerr;

int main() {
    // 0. 获取共享内存块
    int key = ftok(PATH_NAME, PROJ_ID);
    cout << "Get share memory begin. " << endl;
    sleep(1);
    int shmId = shmget(key, SHM_SIZE, IPC_CREAT);
    if(shmId == -1) {
        cerr << "shmget error" << endl;
        exit(1);
    }
    cout << "Creat share memory success, key: " << key << " , shmId: " << shmId << endl;

    // 1. 连接共享内存块
    sleep(2);
    char* str = (char*)shmat(shmId, nullptr, 0);
    if(str == (void*)-1) {
        cerr << "shmat error" << endl;
        exit(2);
    }
    cout << "Attach share memory success. " << endl;

    // 2. 使用共享内存块
    int cnt = 0;
    while (true) {
        str[cnt] = 'A'+cnt;
        cnt++;
        str[cnt] = '\0';
        sleep(1);
    }
    
    return 0;
}
```

`makefile:`

```makefile
.PHONY:all
all:ipcShmClient ipcShmServer

ipcShmClient:ipcShmClient.cpp
	g++ $^ -o $@
ipcShmServer:ipcShmServer.cpp
	g++ $^ -o $@

.PHONY:clean
clean:
	rm -f ipcShmClient ipcShmServer
```

`make`生成可执行程序, 再执行可执行程序的结果是: 

![SHM SHOW ](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/SHM_SHOW.gif)

观察代码的执行结果, 最直观的感受是什么？

最直观的感受就是,  **接收端会一直循环打印共享内存块内的内容, 无论内存块中是否被写入新的数据**

这说明什么? 这说明了, **共享内存块 与 管道 不同, 不存在访问控制机制**

这其实也展现出 共享内存的一个缺点, **共享内存不太安全**

没有访问控制, 随时都可以访问, 终究没有那么安全

而再这两个进程同时运行时, 我们再通过`ipcs -m`查看共享内存块时:

![SHM AT](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/SHM_AT.gif)

在这个动图中, 两个进程运行的过程中, 共享内存块的属性有什么变化？

其实可以很明显的看到: 

![ |huge](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/image-20230329111729949.webp)

然后在进程退出的过程中:

![](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/image-20230329111901986.webp)

![ ](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/image-20230329111950715.webp)

可以看到, 共享内存块的属性中,`nattch`在变化

可以推测, `nattch`这个属性是什么?

这个属性, 是 **共享内存块连接的进程数** 的记录

而连接数的增加, 一定是因为进程通过`shmat()`系统接口成功连接到了共享内存块

既然有连接共享内存块的系统调用, 那么对应的一定也有 取消连接共享内存块的系统调用 

### 取消进程与共享内存块的连接`shmdt()`

`shmdt()`是Linux操作系统提供的系统调用接口, **用来取消进程与共享内存快之间的连接**

![ ](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/image-20230329163901266.webp)

此系统调用接口的参数, 需要传入`shmat()`成功执行的返回值, 即 **进程和共享内存块的连接地址**

![ ](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/image-20230329170843316.webp)

`shmat()`的作用可以说是 让进程看到共享内存块以至于让进程可以使用共享内存块

那么`shmdt()`的作用则可以说是, 让共享内存块再次隐藏起来, 不让进程看到, 进程也就无法继续使用共享内存块

所以, 在进程使用完共享内存快之后, **在进程退出之前**, 最好还要 **将进程与共享内存块分离**

改进后的`Server`和`Client`代码就可以为:

`ipcShmServer:`

```cpp
// ipcShmServer 服务端代码, 即 接收端
// 需要创建、删除共享内存块
#include "common.hpp"
using std::cout;
using std::endl;
using std::cerr;

int main() {
    // 0. 创建共享内存块
    int key = ftok(PATH_NAME, PROJ_ID);

    cout << "Create share memory begin. " << endl;
    sleep(2);
    int shmId = shmget(key, SHM_SIZE, IPC_CREAT | IPC_EXCL | 0666);
    if(shmId == -1) {
        cerr << "shmget error" << endl;
        exit(1);
    }
    cout << "Creat share memory success, key: " << key << " , shmId: " << shmId << endl;

    // 1. 连接共享内存块
    sleep(2);
    char* str = (char*)shmat(shmId, nullptr, 0);
    if(str == (void*)-1) {
        cerr << "shmat error" << endl;
        exit(2);
    }
    cout << "Attach share memory success. " << endl;

    // 2. 使用共享内存块
    int cnt = 0;
    while(cnt++ < 30) {
        cout << str << endl;
        sleep(1);
    }
    cout << "\nThe server has finished using shared memory. " << endl;

    sleep(1);
    // 3. 分离共享内存块
    int resDt = shmdt(str);
    if(resDt == -1) {
        cerr << "shmdt error" << endl;
    }
    cout << "Detach share memory success. \n" << endl;

    sleep(5);

    // 4. 删除共享内存块
    int res = shmctl(shmId, IPC_RMID, nullptr);
    if(res == -1) {
        cerr << "shmget error" << endl;
        exit(2);
    }
    cout << "Delete share memory success. " << endl;

    return 0;
}
```

`ipcShmClient:`

```cpp
// ipcShmClient 客户端代码, 即 发送端
// 不参与共享内存块的创建与删除
#include "common.hpp"
using std::cout;
using std::endl;
using std::cerr;

int main() {
    // 0. 获取共享内存块
    int key = ftok(PATH_NAME, PROJ_ID);
    cout << "Get share memory begin. " << endl;
    sleep(1);
    int shmId = shmget(key, SHM_SIZE, IPC_CREAT);
    if(shmId == -1) {
        cerr << "shmget error" << endl;
        exit(1);
    }
    cout << "Creat share memory success, key: " << key << " , shmId: " << shmId << endl;

    // 1. 连接共享内存块
    sleep(2);
    char* str = (char*)shmat(shmId, nullptr, 0);
    if(str == (void*)-1) {
        cerr << "shmat error" << endl;
        exit(2);
    }
    cout << "Attach share memory success. " << endl;

    // 2. 使用共享内存块
    int cnt = 0;
    while (cnt < 26) {
        str[cnt] = 'A' + cnt;
        cnt++;
        str[cnt] = '\0';
        sleep(1);
    }
    cout << "\nThe client has finished using shared memory. " << endl;

    // 3. 分离共享内存块
    int res = shmdt(str);
    if(res == -1) {
        cerr << "shmdt error" << endl;
    }
    cout << "Detach share memory success. " << endl;

    sleep(5);

    return 0;
}
```

使用这两段代码编译生成的可执行程序, 最终的执行结果可以观测一下: 

![shm_all](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/shm_all.gif)

这两个可执行程序, 可以完整的展示: 共享内存块的创建、共享内存块的连接、共享内存块的使用(使用共享内存块通信)、共享内存块的分离、共享内存块的删除

## 用管道为共享内存提供访问限制

---

使用 **共享内存块进行进程间的通信速度是最快的, 但是 由于共享内存块没有访问控制, 所以 共享内存块相对来说不太安全**

而管道是有访问控制的, 那么就可以 **结合 管道和共享内存块 一起使用**

达到进程通过有访问控制的共享内存 实现通信

只是利用管道的自带访问控制的特点, 来在代码中添加访问控制的功能再来使用共享内存通信

所以, 可以通过这样的操作, 实现使用共享内存时存在一定的访问控制:

1. 在向共享内存写入数据时, 也向管道中写入数据, 相关到中写入的数据不需要存在意义

2. 在需要从共享内存中读取数据时, 先从管道中读取数据. 若管道中没有数据, 就等待

3. 实际上, 相关到中写入数据和从管道中读取数据, 可以将管道中的数据看作信号

    客户端写入信号, 说明共享内存已经写入了数据; 服务端读取到信号, 说明可以从共享内存中读取数据

下面这段代码, 可以实现这样的功能: 

`common.hpp:`

```cpp
#include <iostream>
#include <cstring>
#include <cstdlib>
#include <cerrno>
#include <sys/ipc.h>
#include <sys/shm.h>
#include <sys/types.h>
#include <sys/stat.h>
#include <fcntl.h>
#include <string>
#include <unistd.h>
#include <cassert>

#define SHM_SIZE 4096
#define PATH_NAME ".fifo"
#define PROJ_ID 0x14

#define FIFO_FILE ".fifo"

// 创建命名管道文件
void CreatFifo() {
    umask(0);
    if(mkfifo(FIFO_FILE, 0666) < 0)
    {
        std::cerr << strerror(errno) << std::endl;
        exit(-1);
    }
}

#define READER O_RDONLY
#define WRITER O_WRONLY

// 以一定的方式打开管道文件
int Open(const std::string &filename, int flags)
{
    return open(filename.c_str(), flags);
}

// 用于服务端, 等待读取管道文件数据, 即读取信号
int Wait(int fd) {
    uint32_t value = 0;
    ssize_t res = read(fd, &value, sizeof(value));
    
    return res;
}

// 用于客户端, 向管道中写入数据, 即写入信号
void Signal(int fd) {
    uint32_t cmd = 1;
    write(fd, &cmd, sizeof(cmd));
}

// 关闭管道文件, 删除管道文件
void Close(int fd, const std::string& filename) {
    close(fd);
    unlink(filename.c_str());
}
```

`ipcShmServer.cpp:`

```cpp
// ipcShmServer 服务端代码, 即 接收端
// 需要创建、删除共享内存块
// 需要创建、删除命名管道
#include "common.hpp"
using std::cout;
using std::endl;
using std::cerr;

int main() {
    // 0. 创建命名管道
    CreatFifo();
    int fd = Open(FIFO_FILE, READER);       // 只读打开命名管道
    assert(fd >= 0);

    // 1. 创建共享内存块
    int key = ftok(PATH_NAME, PROJ_ID);
    if(key == -1) {
        cerr << "ftok error. " << strerror(errno) << endl;
        exit(1);
    }

    cout << "Create share memory begin. " << endl;
    int shmId = shmget(key, SHM_SIZE, IPC_CREAT | IPC_EXCL | 0666);
    if(shmId == -1) {
        cerr << "shmget error" << endl;
        exit(2);
    }
    cout << "Creat share memory success, key: " << key << " , shmId: " << shmId << endl;

    // 2. 连接共享内存块
    sleep(2);
    char* str = (char*)shmat(shmId, nullptr, 0);
    if(str == (void*)-1) {
        cerr << "shmat error" << endl;
        exit(3);
    }
    cout << "Attach share memory success. \n" << endl;

    // 3. 使用共享内存块
    while(true) {
        if (Wait(fd) <= 0)
            break;              // 如果从管道读取数据失败, 或管道文件关闭, 则退出循环
        
        cout << str;
        sleep(1);
    }
    cout << "\nThe server has finished using shared memory. " << endl;

    sleep(1);
    // 3. 分离共享内存块
    int resDt = shmdt(str);
    if(resDt == -1) {
        cerr << "shmdt error" << endl;
        exit(4);
    }
    cout << "Detach share memory success. \n" << endl;

    // 4. 删除共享内存块
    int res = shmctl(shmId, IPC_RMID, nullptr);
    if(res == -1) {
        cerr << "shmget error" << endl;
        exit(5);
    }
    cout << "Delete share memory success. " << endl;

    // 5. 删除管道文件
    Close(fd, FIFO_FILE);
    cout << "Delete FIFO success. " << endl;

    return 0;
}
```

`ipcShmClient.cpp:`

```cpp
// ipcShmClient 客户端代码, 即 发送端
// 不参与共享内存块的创建与删除
// 不参与命名管道的创建与删除
#include "common.hpp"
using std::cout;
using std::endl;
using std::cerr;

int main() {
    // 0. 打开命名管道
    int fd = Open(FIFO_FILE, WRITER);

    // 1. 获取共享内存块
    int key = ftok(PATH_NAME, PROJ_ID);
    if(key == -1) {
        cerr << "ftok error. " << strerror(errno) << endl;
        exit(1);
    }
    cout << "Get share memory begin. " << endl;
    sleep(1);
    int shmId = shmget(key, SHM_SIZE, IPC_CREAT);
    if(shmId == -1) {
        cerr << "shmget error" << endl;
        exit(2);
    }
    cout << "Creat share memory success, key: " << key << " , shmId: " << shmId << endl;

    // 2. 连接共享内存块
    sleep(2);
    char* str = (char*)shmat(shmId, nullptr, 0);
    if(str == (void*)-1) {
        cerr << "shmat error" << endl;
        exit(3);
    }
    cout << "Attach share memory success. " << endl;

    // 3. 使用共享内存块
    while (true) {
        printf("Please Enter $ ");
        fflush(stdout);
        ssize_t res = read(0, str, SHM_SIZE);       // 从标准输入读取数据写入到 共享内存(str) 中
        if(res > 0) {
            str[res] = '\0';
        }

        Signal(fd);     // 向命名管道写入信号
    }
    cout << "\nThe client has finished using shared memory. " << endl;

    // 3. 分离共享内存块
    int res = shmdt(str);
    if(res == -1) {
        cerr << "shmdt error" << endl;
        exit(4);
    }
    cout << "Detach share memory success. " << endl;

    return 0;
}
```

`makefile:`

```makefile
.PHONY:all
all:ipcShmClient ipcShmServer

ipcShmClient:ipcShmClient.cpp
	g++ $^ -o $@
ipcShmServer:ipcShmServer.cpp
	g++ $^ -o $@

.PHONY:clean
clean:
	rm -f ipcShmClient ipcShmServer .fifo
```

make之后, 生成的可执行程序的执行结果是: 

![命名管道为共享内存提供访问限制](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/PipeforShareM.gif)

此例中我们添加了几个函数接口: 

![ |inline](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/image-20230402152119892.webp)

并且, 共享内存的创建、连接、删除都与之前例子中没有区别

只有使用有一点点区别:

1. 服务端

	![ |wide](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/image-20230402152334706.webp)
	
	![ |wide](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/image-20230402152539511.webp)

2. 客户端

	![ |wide](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/image-20230402152805743.webp)
	
	![ |wide](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/image-20230402152953351.webp)

只有这两部分不同, 就可以通过管道实现使用共享内存的简单的访问控制

