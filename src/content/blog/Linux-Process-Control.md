---
draft: true
title: "[Linux] 详析进程控制: fork子进程运行规则？怎么回收子进程？什么是进程替换？进程替换怎么操作？"
pubDate: "2023-03-07"
description: "这次, 是第三次正式的对fork()系统调用进行介绍、补充"
image: https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/202306251759370.webp
categories:
    - Blogs
tags:
    - Linux系统
    - 进程
---

# 再识fork()

博主的文章中第一次使用fork(), 是在介绍进程状态和Linux系统中进程具体状态的时候.

而第一次介绍fork(), 则是在介绍Linux下有关进程的某些概念的时候.

第一次针对fork()创建子进程与父进程共享代码和数据的补充, 则是在介绍Linux下进程地址空间的时候.

而这次, 则是第三次正式的对fork()系统调用进行介绍、补充了.

---

在介绍进程地址空间时, 介绍说过: `fork()创建出子进程之后, 一般情况下父子进程的虚拟地址其实指向的是同一块内存物理地址`. 这样就实现了父子进程共享代码和数据, 并且在父子进程写入数据的时候, 操作系统采用的是`写时拷贝`的做法

如果父子进程的虚拟地址指向的是同一块内存物理地址的话, 就又跳出来一个问题: `既然父子进程共用同一块代码, 按理来说子进程应该从头开始运行, 那为什么子进程只运行fork()之后的代码？`

## 为什么子进程只运行fork()之后代码

我们都知道, 在CPU中存在许多的寄存器, 其中有一种特殊的寄存器叫 `程序计数器, 有时也叫PC指针`, 此寄存器中存储的内容是: `当前指令的下一条指令的地址`. 

没错, 当子进程刚开始运行的时候, 就读取了 程序计数器中的地址, 而此时程序计数器中存储的就是fork()的下一条指令的地址, 所以子进程可以直接从fork()的下一条语句开始执行.

这就是子进程只运行fork()之后的代码的原因

## 写时拷贝

写时拷贝可以从它的字面理解意思, 即 `当进程需要写入数据的时候, 操作系统才会将需要写入的数据另外拷贝一份供进程写入`

> 写时拷贝当然只针对数据, 而不针对代码. 因为正常情况下程序运行起来之后, 代码不可更改 属于只读的数据. 
>

就像这样: 

子进程不修改数据时: 

![ |inline](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722162756267.webp)

子进程修改数据时: 

![](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722162802203.webp)



这就是写时拷贝的流程. 

但是许多人一定会有疑问, 那就是`为什么需要用写时拷贝的做法？`

### 为什么要用写时拷贝？

在第一次接触到写时拷贝的时候, 一定会有人存在这种疑问, `为什么要写时拷贝？直接拷贝不可以吗？`

并且, 在fork()创建子进程的这个例子中, `在子进程被创建出来的时候, 为什么不直接将父进程所有的代码和数据都另外拷贝一份放入内存中供子进程使用？`

使用写时拷贝的做法, 一定是有原因的: 

1. 在子进程被创建出来的时候, 就将父进程的所有代码和数据拷贝一份, 当然可行.

	但是, 如果父子进程所执行的代码从头到尾都没有对数据进行修改的操作, 或者只修改了非常小的一部分数据, 那为什么要全部拷贝一份呢？`在这种情况下是否存在空间浪费的嫌疑？`

2. 创建子进程的时候, 关于数据的拷贝最理想的情况是什么？ 一定是在创建子进程的时候, `就只将` 父子进程需要修改的数据拷贝一份.

	但是, 这样的做法从技术的角度来讲, 是很复杂的, 至少相对于写时拷贝来讲, 是非常复杂的

3. 如果在创建子进程的时候, 就执行数据和代码的拷贝工作, 那`是否给fork()这个原本只是为了创建子进程而诞生的系统调用增加了一定的成本？`无论是从内存还是从时间的成本上. 毕竟fork()在执行结束的时候子进程已经创建完成了, 也就是说在创建子进程的时候执行拷贝工作, 其实一定是交给fork()来做的.

基于至少这三个方面, 操作系统才会采用写时拷贝的做法针对父子进程进行管理.

> 写时拷贝就是由操作系统的内存管理模块完成的

## fork()也可能创建子进程失败

fork()子进程创建失败的场景, 其实与操作系统中进程的数量和进程所占用的资源量有关.

其实很好理解, 当进程数量过多 已经达到了操作系统的限制时, 操作系统肯定是不会再允许用户再创建新的进程了. 除非操作系统不想正常运行了

还有就是进程所占用的资源量, 如果现在 操作系统内的资源已经所剩无几, 而用户又想打开一个非常占用资源的程序创建一个非常占用资源的进程, 别说操作系统不允许, 就算是操作系统允许 可能也创建不出来

# 再识进程终止

在介绍进程状态的概念和Linux下进程的具体状态时, 都有介绍过进程的终止态. 在 Linux中是`X(dead)状态`

但是由于其概念很好理解, 并没有做太多的介绍. 但其实关于进程的终止, 还是存在一些细节需要介绍、分析的

## 正确认识进程终止

在我们使用C/C++编写代码时, 不管怎样一定都会写一个main()函数, `main()函数是进程的入口函数`

而且, main()函数也会像一些普通函数一样 在最后使用`return 值;` 语句返回一个值. 普通函数的返回值 可以由我们来主动接收, 也就是说普通函数的返回值其实可以看作是返回给程序中的变量的.

而 `main()函数的返回值是返回给谁的呢？而且, 在学习C/C++过程中, 好像main()函数的返回值一直是0, 可以是其它值吗？`

回答这个问题之前, 先讨论另外一个问题: 关于一个进程的退出, 一般会有几种情况？

1. 代码正常跑完, 进程结果正确
2. 代码正常跑完, 进程结果错误
3. 代码没有跑完, 进程异常退出

应该就只有这三种情况. 

知道了进程退出一般只有这三种情况之后, 那么 C/C++代码中 main()函数正常的执行完了, 也执行过return了, 属于上面三种情况的哪种情况呢？

一定是 1 和 2, 因为main()函数既然已经执行了return语句, 那也就意味着进程的代码已经跑完了, 但是进程的结果是否正确还未知.

而`main()函数的返回值, 就是用来判断进程的结果的`. 

一般情况下, main()函数执行return 0, 表示执行结果正确; 若非0, 则表示执行结果错误. 也就是说, `main()函数的返回值其实说明了进程的执行结果`.

而在介绍进程状态的文章中, 提到过Linux的进程在进入X(dead)之前, 还存在一个`Z状态被称为僵尸状态, 此状态是为了维护进程的退出信息而存在的`. 并且也在文章中说过, `进程的退出信息其实就是进程执行任务的结果, 并且进程的退出信息是为了让此进程的父进程接收的`. 

而main()函数的返回值说明了进程的执行结果, 其实也就是说**`进程的main()函数的返回值 其实是为了返回给父进程的`**, 而 main() 函数的返回值, 我们也称之为 **`进程的退出码`**, 此退出码被描述在进程的PCB中, 也就是Linux中的task_struct中: 

![ |huge](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722175349991.webp)

但是, 即使将退出码给父进程接收, 父进程怎么根据退出码来对进程任务的执行结果进行判断呢？

退出码为0时自不必多说, 0一般默认为进程正确的完成了任务. 那如果是非0的退出码呢？

其实`就像普通函数的返回值在main()函数中被接收一样, 在main()函数中可以编写指定的代码对函数返回值进行对比, 进而判断出普通函数的执行结果`

父进程也可以如此, `父进程接收子进程的退出码, 父进程代码中或许就存在关于子进程退出码的判断`. 

所以, `main()函数的非0返回值 以及其意义、原因, 可以由用户自定义`

> 在Linux中针对进程的不同退出码有不同的解释: 
>
> ![|medium](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722175347324.webp)
>
> 在程序中打印 字符串函数strerror(i) 的值, 就可以将Linux系统认为的退出码的意义打印出来

### 查看进程的退出码

Linux系统中, 任何进程退出时都会存在退出码. 但是进程的退出码如何查看呢？

`echo $?`, 这个指令可以在命令行中输出上一个推出的进程的退出码:

![ |small](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722175354179.webp)

编译运行此代码程序, 然后在命令行执行`echo $?` 就可以查看到退出码: 

![ |medium](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722175356816.webp)

可以看到, `echo $?` 显示了上一个退出进程的退出码`66`

但是还可以看到, 为什么第二次执行`echo $?` 现实的退出码就是`0`了呢？

是因为第二次执行 `echo $?` 时, 上一个退出的进程其实是 第一个`echo $?`, 而第一个`echo $?`正常执行成功了, 所以其退出码是`0`

## exit() 和 _exit() 退出进程

上面我们已经说明了, 进程的代码中main()函数内执行return语句时, 进程就会退出.

`在mian()函数中执行return语句才能进程退出, 是因为非main()函数执行return就只是函数的返回值, 是被其他变量等接收的`

除此之外, 还可以`在代码中的任何位置调用exit()或_exit()函数来退出进程`

exit() 与 _exit()有一定的差别, 但是最终的作用都是相同的: 

> exit()的头文件是 `stdlib.h`, 而 _exit()的头文件则是 `unistd.h`

`exit()`: 

此函数`可以在代码的任意位置使用, 使进程退出, 且exit()的参数即为进程的退出码`: 

![ |medium](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722175358922.webp)

调用exit()函数, 但是不在main()函数中调用, 看一看进程是否执行exit()退出: 

![ |huge](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722175400732.webp)

`_exit()`:

如果用上面相同的代码, 只将exit()改为_exit(), 结果会不会有变化呢？

![ |medium](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722175402309.webp)

![ |huge](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722175404162.webp)

而 相同的代码, 调用exit()和_exit()在结果上是否有什么区别？

可以发现, 我在代码中使用了一句printf()函数, 并且没有使用`'\n'`直接刷新缓冲区. 而调用exit()时, printf()函数正常打印出来了, 调用_exit()时却什么都没有打印.

其实也就是说, exit() 与 _exit()还是存在一定的区别的: `exit()在执行时会先刷新进程的缓冲区, 而_exit()并不会`

> 其实, exit()函数内部, 调用了_exit()函数

# 进程等待

在之前的文章中介绍过Linux系统中存在僵尸进程, 即 当子进程退出需要进入终止态等待系统释放之前, 存在一个僵尸状态, 此状态是维护进程的退出信息供父进程接收的, 而此时的子进程已经不接受操作系统的调度了.

僵尸进程是无法被 kill -9 掉的, 因为你不能杀死一个已经死了的进程, 它只是在等待父进程回收信息. 然而如果父进程一直不回收子进程的退出信息, 那么子进程就会一直处于僵尸状态. 

而我们将`父进程回收子进程退出信息的动作叫做等待`, 即 如果父进程不等待子进程, 那么子进程将一直是僵尸进程

而, 如果僵尸进程一直存在, 就会造成很严重的`内存泄漏`问题

## 等待方法

我们称父进程回收子进程的动作叫做等待, 那么等待的方法是什么呢？

![](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722175406908.webp)

进程存在两种等待方法: 

1. wait()

    wait()系统调用`会等待任意一个退出的子进程`~~(暂时不考虑wait()的参数, 在介绍waitpid()时再介绍这个指针参数)~~: 

    ```cpp
    #include <stdio.h>
    #include <stdlib.h>
    #include <unistd.h>
    #include <sys/types.h>
    #include <sys/wait.h>
    
    int main() {
        pid_t id = fork();
    
        if (id == 0) {
            int cnt = 5;
            while (cnt) {
                printf("我是子进程, %ds后进入Z状态, 变为僵尸进程\n", cnt);
                sleep(1);
                cnt--;
            }
            printf("我是子进程, 已进入僵尸状态\n");
            exit(123);
        }
        else {
            sleep(6);
            printf("我是父进程, 还未等待子进程\n");
            sleep(19);
            int cnt = 5;
            while (cnt) {
                printf("%ds后, 等待子进程\n", cnt);
                cnt--;
                sleep(1);
            }
            pid_t waitPid = wait(NULL);
            printf("我是父进程, 已等待子进程, 等待的进程的PID= %d\n", waitPid);
            sleep(10); // 父进程等待子进程之后, 先不要结束, 便于观察现象
        }
    
        return 0;
    }
    ```

    > - `while :; do ps ajx | head -1 && ps ajx |grep wait_Test |grep -v grep; sleep 1; echo "----------------------------------------------------------------"; done #BR/#`
    >
    > 此命令行指令, 是`一个简单的指定进程的观测指令, 每1s打印一次所查找进程的相关信息`

    此代码执行之后, 配合进程观测指令, 可以看到的结果是: 

    ![1 |wide](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722175410524.webp)

    ![2 |wide](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722175412407.webp)

    ![3 |wide](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722175414212.webp)

    ![4 |wide](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722175415898.webp)

    此代码, 可以看到子进程被创建, 子进程进入僵尸状态, 父进程等待子进程, 父进程退出的整个流程

    可以看到, 我们使用waitPid变量接收了wait()的返回值, 然后输出. 可以发现 `wait()系统调用的返回值, 即为其等待的子进程的PID.`

2. waitpid()

	与 `wait(int *status)`不同, `waitpid(pid_t pid, int *status, int options)`有三个参数, 其返回值与wait()相同, `若返回值 > 0 返回值即为等待的子进程的PID; 若返回值 = -1, 即为调用失败, errorno会被设置为错误提示码; 若返回值 = 0, 则表示没有已退出的子进程可回收(此种情况的出现, 需要设置)`
	
	首先, 先介绍waitpid()三个参数的含义: 
	
	1. ### `pid_t pid`
	
	    其实看到pid这个变量 就应该可以猜到此参数的意义.
	
	    `此参数可以传入的是子进程的pid, 意为指定pid让父进程等待, 即 父进程等待指定的子进程`
	
	    当此参数传入 `-1`时, waitpid()的作用 <=> wait(), 也是等待任意的子进程
	
	    当此参数传入其他值时, 那么此值就表示某个pid, waitpid()的作用就是等待传入的此pid的子进程
	
	2. ### `int *status`
	
	    wait()仅有的一个参数也是这个参数, 那么这个参数的意义是什么？
	
	    status这个参数是一个指针参数, 也是一个`输出型参数`. 
	
	    输出型参数是什么意思？输出型参数意味着, 此参数其实`是向外部传递信息的`, 当 waitpid()此函数等待到一个退出的子进程的时候, **`子进程的退出信息会被存储到 status指针指向的内容中`**
	
	    子进程的退出信息不就是退出码吗？并不全是, 之前提到过进程的退出信息也是在 task_struct中存储着呢: 
	
	    ![|huge](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722175418612.webp)
	
	    也就是说, `status指向的内容中不仅存储了退出码, 还存储了退出信号`. 退出码我们知道是什么, 而退出信号又是什么？
	
	    在上面我们提到过, 一个进程退出时应该有三种情况: 
	
	    1. 代码正常跑完, 结果正确
	    2. 代码正常跑完, 结果不正确
	    3. 代码没有跑完, 进程异常退出
	
	    前两种情况我们已经分析过了, 那么第三种情况 进程异常退出, 进程为什么会异常退出呢？
	
	    其实, `进程异常退出的原因是进程收到了某种信号`, 就类似 kill -9 这样的命令 其实就是一种信号
	
	    进程信号这里不做介绍, 只需要知道进程异常退出是收到了某种信号即可
	
	    那么, 也就是说 status指向的空间, 不仅接收退出码, 还接收退出信号. 一个整型是怎么接收两个整型内容的呢？
	
	    其实 status指针指向的是一个整型, 而这个整型只需要关注 `低16位`就可以了, `此低16位中的高8位 用来表示退出码, 低8位 用来表示退出信号`: 
	
	    ![|wide](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722175420789.webp)
	
	    也就是说, `waitpid()使用时第二个参数需传入一个int类型变量的地址, 当waitpid()等待到一个子进程之后, 传入的地址所指向的变量的低16位中, 低八位表示子进程的退出信号, 高八位表示子进程退出码`
	
	    并且, `当子进程是正常退出时, 表示退出信号的八位为0; 当子进程被某种进程信号所杀时, 表示退出码的八位为0.`
	
	    举个例子: 
	
	    就以这段代码作为展示: 
	
	    ```cpp
	    #include <stdio.h>
	    #include <unistd.h>
	    #include <sys/types.h>
	    #include <sys/wait.h>
	    
	    int main() {
	        pid_t id = fork();
	    
	        if (id == 0) {
	            printf("我是子进程, 我的pid: %d\n", getpid());
	            sleep(10);
	        }
	        else {
	            printf("我是父进程, 我正在准备等待子进程\n");
	            int status = 0;
	            pid_t pidGet = waitpid(id, &status, 0);
	            if (pidGet > 0)
	                printf("等待成功, 子进程的退出码是 %d, 退出信号是 %d\n",
	                       (status >> 8) & 0xFF, status & 0x7F);
	        }
	    
	        return 0;
	    }
	    ```
	
	    这段代码的程序运行的时候, 子进程会被创建, 并且15s之后会return 0. 父进程会调用waitpid()阻塞等待刚刚被创建的子进程. 当父进程等待子进程成功了, 父进程会获取子进程的退出码和退出信号并打印出来.
	
	    > 关于`退出信号的计算, 需要status&0x7F, 是因为表示退出信号的八位, 其中最高位是一个单独的core_dump标志, 暂时忽略`
	
	    若此时子进程是15s后返回的return 0退出的, 那么会有什么结果呢？
	
	    ![|medium](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722175423327.webp)
	
	    而若子进程在创建之后的15s内, 被某种进程信号强制退出的话, 又会有什么结果呢？
	
	    ![|wide](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722175425895.webp)
	
	    可以看到, 父进程中的整型变量status成功接收到了子进程的退出码和退出信号.
	
	    > 父进程中的status变量接收到数据之后, 其实不需要通过手动位运算来计算出子进程的退出码和退出信号.
	    >
	    > 其实而可以通过两个`宏`: 
	    >
	    > 1. `WEXITSTATUS(status): 提取子进程退出码`
	    > 2. `WERMSIG(status): 提取子进程退出信号`
	    >
	    > 还有一个`宏`, 可以直接用来判断子进程是否正常退出: 
	    >
	    > `WIFEXITED(status): 若子进程正常退出, 则为真`
	
	    > 在上面提到过一个问题, 当进程退出码为0时, 往往意味着进程正常退出. 
	    >
	    > 而此时子进程接收到信号而退出, 肯定是不属于正常退出的范围的. 为什么子进程的退出码依旧是0？是否与 退出信号的9, 冲突了？
	    >
	    > 当然没有, `当退出信号不为0时, 退出码就没有意义了, 可以忽略不看`
	
	3. ### `int options`
	
	    这个参数其实像是waitpid()的一个配置参数, `通过不同的传参, 可以让waitpid()有不同的工作模式`
	
	    #### 当`options传入的参数为0`时, waitpid()采用`阻塞等待`的工作模式.
	
	    什么是阻塞等待？
	
	    之前我们介绍过阻塞是什么样的, 当进程在等待非CPU资源时, 我们称这种情况为进程阻塞
	
	    而当options传入0时, waitpid()的工作模式就像是阻塞一样, 如果其等待的子进程还未退出, 那么父进程就会一直阻塞等着子进程退出, 在子进程退出之前, 父进程一直处于阻塞状态, 不会做其他事情, 就只是等着子进程退出. 
	
	    `这个一直等着子进程退出的行为, 其实是一种等待软件资源的情况, 所以当options参数传入0时, waitpid()的工作模式可以被称为阻塞等待`
	
	    #### 当`options传入的参数为WNOHANG`时, waitpid()采用`基于非阻塞的轮询等待方案`
	
	    与阻塞等待不同, 非阻塞的轮询等待方案, `不会让父进程一直处于阻塞状态`
	
	    当`options传入WNOHANG时, waitpid()只会当前等待一次, 如果等待时没有子进程退出需要回收, 那么waitpid()就会返回0`
	
	    也就是说, `options传入WNOHANG时, waitpid()只会回收当前已经退出的子进程, 如果没有子进程处于此状态, 那么waitpid()就会返回0. 在返回之后, 即使又有子进程退出了, waitpid()也不再回收`
	
	    所以, `在options传入WNOHANG时, waitpid()的使用一般伴随着循环`. 即让waitpid()循环判断是否存在需要回收的子进程, 这样也不影响父进程做其他工作
	

# 进程替换

## 什么是进程替换？

我们都知道, 用fork()创建出来的子进程是与父进程共享代码和数据的. 子进程执行的也只是父进程的代码片段.

那么当我们需要让创建出来的子进程执行其他程序的代码, 需要怎么做呢？

`让一个进程执行其他程序的代码, 即进程替换`, 不单是子进程, 当前进程也可以发生进程替换.

### 进程替换的原理

fork()创建子进程之后, 子进程是与父进程共享代码和数据的: 

![ |inline](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722175429175.webp)

当需要子进程发生进程替换的时候, 操作系统会`调用系统调用接口`, 首先操作系统会将内存中父进程的代码和数据都拷贝一份, 然后将磁盘中的程序加载到此内存结构中.

然后再将子进程的页表重新建立, 将子进程的虚拟内存空间与新的代码与数据建立联系, 以此完成进程替换: 

![ |inline](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722175432457.webp)

在此过程中, 从头到尾都是`没有新的进程被创建`的, 新进程被创建的标志是操作系统创建了进程的PCB和进程地址空间, 而这个过程中始终都是两个PCB和两个进程地址空间

## 为什么要进程替换？

在Linux系统编程的时候, 我们一般需要子进程干两件事: 

1. 执行父进程的代码片段
2. 让子进程执行磁盘种的其他程序, 其他程序可能涉及: C/C++、Java、Python、Shell等不同语言的程序

想要让子进程干第二件事的时候, 就需要使用进程替换的手段

就像我们使用的bash、zsh等shell, 其实都是用进程替换的方式才调用了非常多的命令, 在命`令行中执行的命令大多数都是由shell创建子进程然后再进程替换实现的`

## 如何进行进程替换？

进程替换是由操作系统调用系统调用来实现的, 而系统调用时操作系同提供的接口, 所以进程替换要使用系统调用来实现: 

![ ](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722175435958.webp)

使用这六个系统调用接口, 可以实现进程替换的功能

### execl()

首先是 

```cpp
int execl(const char *path, const char *arg, ...);
```

分析一个函数一定要从其参数开始, execl的参数 一个是path, 另一个是arg, 且之后还有`...`

> - `...`
>
> 在参数中出现`...`, 表示`可变参数`, 即此函数的参数数量其实是不定的, 是可以动态变化的

看到path这个词, 第一个想到的应该就是路径, 且应该是需要执行的程序的路径

而arg, 则与main()函数的第二个参数argv数组有一定的相似, 那有没有可能arg像main()函数的argv数组的内容一样, 是用来传入程序名和运行程序所需要的选项的？之后的可变参数, 是否是可以传入多个选项的意思？

毕竟, 运行一个磁盘中的程序最重要的、最需要的两个条件就是: 

1. 程序在磁盘中的所在路径
2. 程序运行所需要的携带的选项, 当然也可以选择不携带

execl的参数是否是程序的路径和程序的选项, 试一试就知道了: 

就以调用ls命令为例: 

```cpp
#include <stdio.h>
#include <sys/wait.h>
#include <sys/types.h>
#include <unistd.h>

int main() {
    pid_t id = fork();
    if(id == 0) {
        printf("我是子进程, pid :%d\n", getpid());
        execl("/usr/bin/ls", "ls", "-l", "-a", NULL);
        printf("我是子进程, pid :%d\n", getpid());
    }
    else {
        pid_t ret = wait(NULL);
        if(ret > 0) {
            printf("我是父进程, 等待子进程成功\n");
        }
        else {
            printf("等待子进程失败\n");
        }
    }

    return 0;
}
```

执行此代码之后, 可以发现子进程确实执行了 `ls -l -a` 的命令: 

![ |large](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722175438881.webp)

这也就意味着, execl的参数正如我们猜测的那样: 

1. `const char *path`, 需传入需要替换成的程序的路径
2. `const char *arg, ...`, 则表示执行程序需要携带的选项, 且传入的表示选项的参数需要以NULL结尾, 告诉函数传参结束(main()函数argv数组中便是如此)

但是对比程序的执行结果和代码, 可以发现一个现象: `在execl函数之后的printf并没有打印出来, 即 printf()函数并未执行`: 

![](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722175441058.webp)

这其实是因为, `当进程替换成功之后, 进程的所有代码和数据都已经被替换掉了, 也就意味着execl()函数之后的代码全部失效`

> 需不需要接收execl()函数的返回值, 然后判断是否替换成功？
>
> 不需要, 因为替换成功的话, execl()函数之后的代码根本不会执行, 代码和数据都已经被替换掉了. 只有替换失败的时候, 才会执行execl()之后的代码
>
> 可以直接根据进程的执行结果判断进程替换是否成功

#### 子进程替换, 是否影响父进程？

子进程进行进程替换是`不会影响到父进程`的, 因为进程间具有`独立性`

子进程与父进程共享同一份代码和数据, 即使代码是属于只读的内容, 操作系统也会在子进程进行进程替换时, 将代码和数据重新拷贝一份, 然后再与新程序的代码和数据交换.

### execv()

```cpp
int execv(const char *path, char *const argv[]);
```

经过上面的分析, 第一个参数 `path` 就不用在分析了, 而第二个参数 `argv` 也有些熟悉

在main()函数中, 也存在一个argv参数, 其存储的是程序执行时携带的所有选项, 是一个指针数组, 每个元素的内容就是一个选项

那么execv()函数的第二个参数argv是否也是如此呢？

还可以用 ls 命令为例: 

```cpp
#include <stdio.h>
#include <sys/wait.h>
#include <sys/types.h>
#include <unistd.h>

#define SIZE 128

int main() {
    pid_t id = fork();
    if(id == 0) {
        char *const execv_argv[SIZE] = {
            (char*)"ls",
            (char*)"-l",
            (char*)"-a",
            NULL
        };
        printf("我是子进程, pid :%d\n", getpid());
        execv("/usr/bin/ls", execv_argv);
        printf("我是子进程, pid :%d\n", getpid());
    }
    else {
        pid_t ret = wait(NULL);
        if(ret > 0) {
            printf("我是父进程, 等待子进程成功\n");
        }
        else {
            printf("等待子进程失败\n");
        }
    }

    return 0;
}
```

运行此代码的结果, 子进程的运行结果同样与`ls -l -a`相同

![ |large](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722175444434.webp)

### execlp()

```cpp
int execlp(const char *file, cosnt char *arg, ...);
```

此函数的函数名和第一个参数与`execl()`函数有些许不同

execlp()函数的第一个参数file 与 execl()函数的第一个参数path 不同的地方在于: `参数file, 不用添加路径, 只需要传入程序名`

为什么？

我们知道, 命令行中的所有命令都是在环境变量PATH的路径下搜索的, 而`execlp()的函数名中的p, 其实就是表示此函数可以在环境变量PATH路径下搜索命令`

即, `execlp()函数传参时, 只要替换的程序在PATH的路径下, 就可以直接传程序名, 而不用传路径`

```cpp
#include <stdio.h>
#include <sys/wait.h>
#include <sys/types.h>
#include <unistd.h>

int main() {
    pid_t id = fork();
    if(id == 0) {
        printf("我是子进程, pid :%d\n", getpid());
        execlp("ls", "ls", "-l", "-a", NULL);
        printf("我是子进程, pid :%d\n", getpid());
    }
    else {
        pid_t ret = wait(NULL);
        if(ret > 0) {
            printf("我是父进程, 等待子进程成功\n");
        }
        else {
            printf("等待子进程失败\n");
        }
    }

    return 0;
}
```

![ |large](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722175447735.webp)

### execvp()

```cpp
int execvp(const char* file, char *const argv[]);
```

分析过上面三个函数之后, 此函数的参数已经不需要在分析了

1. `file`, 直接传入程序名, 此函数会在环境变量PATH的路径下搜索
2. `argv`, 则是执行程序携带的选项的数组, 每个元素存储一个选项

```cpp
#include <stdio.h>
#include <sys/wait.h>
#include <sys/types.h>
#include <unistd.h>

#define SIZE 128

int main() {
    pid_t id = fork();
    if(id == 0) {
        char *const execv_argv[SIZE] = {
            (char*)"ls",
            (char*)"-l",
            (char*)"-a",
            NULL
        };
        printf("我是子进程, pid :%d\n", getpid());
        execvp("ls", execv_argv);
        printf("我是子进程, pid :%d\n", getpid());
    }
    else {
        pid_t ret = wait(NULL);
        if(ret > 0) {
            printf("我是父进程, 等待子进程成功\n");
        }
        else {
            printf("等待子进程失败\n");
        }
    }

    return 0;
}
```

![ |large](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722175450581.webp)

### execle()

```cpp
int execle(const char *path, const char* arg, ..., char *const envp[]);
```

execle()函数只比execl()函数多一个参数`envp`, 此参数需要传入的是`环境变量列表`

与 main()函数的第三个参数和 `extern char **environ` 是类似的, 甚至可以说是相同的

> 博主的Linux环境变量的相关文章: 

那么这个函数应该怎么用呢？

```cpp
/* 父进程代码 */
#include <stdio.h>
#include <unistd.h>
#include <sys/types.h>
#include <sys/wait.h>

int main() {
    extern char **environ;
    pid_t id = fork();
    if(id == 0) {
        printf("我是子进程, pid: %d\n", getpid());
        execle("./env_Test", "./env_Test", NULL, environ);		// 替换为字节写的程序 env_Test
        printf("我自己进程, pid: %d\n", getpid());
    }
    else {
        pid_t ret = wait(NULL);
        if(ret > 0) {
            printf("我是父进程, 等待子进程成功\n");
        }
    }

    return 0;
}
/* env_Test 代码 */
// 要将下面代码 编译为 env_Test 文件
#include <stdio.h>

int main() {
    extern char **environ;
    for(int i = 0; environ[i]; i++) {
        printf("[%d]: %s\n", i, environ[i]);
    }

    return 0;
}
```

此时, 父进程执行结果为: 

![ ](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722175453439.webp)

但是, 好像并不能验证将`environ环境变量列表`传入了`env_Test`子进程中

因为, 即使直接运行`env_Test` 也会打印这些内容的: 

![ ](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722175455383.webp)

> 这其实是因为, 使用execle()函数将子进程替换为`env_Test`进程, 传入的环境变量其实是`父进程的环境变量列表environ`, 那么execle执行的`env_Test`也就打印了父进程的环境变量

既然execle()传入父进程的环境变量列表无法验证 此参数的作用, 那么就传入其他环境变量: 

```cpp
#include <stdio.h>
#include <unistd.h>
#include <sys/types.h>
#include <sys/wait.h>

int main() {
    // 自定义一个char* 数组, 作为一个自定义环境变量列表
    char *const envp[] = { 
        (char*)"MYENV1=DIY_ENV1",
        (char*)"MYENV2=DIY_ENV2",
        NULL 
    };

    pid_t id = fork();
    if(id == 0) {
        printf("我是子进程, pid: %d\n", getpid());
        execle("./env_Test", "./env_Test", NULL, envp);		// 传入envp
        printf("我自己进程, pid: %d\n", getpid());
    }
    else {
        pid_t ret = wait(NULL);
        if(ret > 0) {
            printf("我是父进程, 等待子进程成功\n");
        }
    }

    return 0;
}
```

此时, 不修改 `env_Test` 的代码, 再执行上面这个代码时: 

![](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722175458081.webp)

由此可见, 这个`envp`参数的作用是, `接收从父进程传来的环境变量列表`

由此现象可以推测出什么？

我们说子进程会会继承父进程的环境变量, `是否就是在创建子进程时, 父进程的环境变量列表传入了子进程, 从而说子进程的环境变量继承于父进程？`

而且可以发现 `使用execle()函数进程替换时, 子进程的环境变量, 其实完全取决于父进程传什么环境变量列表`

> 其他不带envp参数的进程替换接口, `默认给替换的进程传入此进程的环境变量列表`的
>
> 即在调用 `execl()` `execv()` `execlp()` `execvp()` 这些接口进程替换时, `被替换到内存中的进程 默认接受的是被替换掉的进程的环境变量列表`

#### 如何在父进程的环境变量的基础上添加新的环境变量并传给子进程

##### putenv()

在介绍环境变量的文章中, 介绍main()函数内获取环境变量的方法时, 其中有一个方法叫: `getenv()`系统调用

而这个putenv()功能则与其相反: 

![ ](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722175501196.webp)

此系统调用的用法非常的简单, 只需要`在参数中传入需要在环境变量中添加的环境变量`就可以了: 

```cpp
#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>
#include <sys/types.h>
#include <sys/wait.h>

int main() {
    extern char **environ;

    putenv((char*)"MYENV=DIY_ENV111111111111111111111111111111111111111111111");
    pid_t id = fork();
    if(id == 0) {
        printf("我是子进程, pid: %d\n", getpid());
        execle("./env_Test", "./env_Test", NULL, environ);
        printf("我自己进程, pid: %d\n", getpid());
    }
    else {
        pid_t ret = wait(NULL);
        if(ret > 0) {
            printf("我是父进程, 等待子进程成功\n");
        }
    }

    return 0;
}
```

此时执行此代码的结果是: 

只要使用putenv()系统调用时, `传入需要添加的环境变量, 就可以在进程原环境变量列表中添加一个环境变量`

---

当子进程的环境变量中多了一个环境变量之后, 父进程的环境变量中会不会也多出一个环境变量呢？

答案是, 不会. 子进程的环境变量继承自父进程, 但是修改子进程的环境变量是不会影响到父进程的: 

![ ](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722175503875.webp)

### execvpe()

```cpp
int execvpe(const char *file, char *const argv[], char *const envp[]);
```

此系统调用的参数及作用亦不必多说: 

1. `file`, 传入文件名, 不需要带路径, 只需要确保文件处于环境变量PATH的路径下
2. `argv`, 传入命令及携带选项的数组, 每个元素为一个命令或一个选项
3. `envp`, 传入环境变量列表, 表示将此环境变量列表继承给替换的进程

```cpp
#include <stdio.h>
#include <unistd.h>
#include <stdlib.h>
#include <sys/types.h>
#include <sys/wait.h>

#define SIZE 128

int main() {
    extern char **environ;
    printf("\n为环境变量列表添加自定义环境变量: MYENV=DIY_ENVXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX\n");
    putenv((char*)"MYENV=DIY_ENVXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"); 

    pid_t id = fork();
    if(id == 0) {
        char *const execvpe_argv[SIZE] = { (char*)"./env_Test", NULL }; 

        printf("我是子进程, pid: %d, 即将调用execvpe()进程替换\n", getpid());
        execvpe("./env_Test", execvpe_argv, environ);
        printf("我是子进程, pid: %d, 进程替换失败\n", getpid());
    }
    else {
        pid_t ret = wait(NULL);
        if(ret > 0) {
            printf("我是父进程, 等待子进程成功\n\n");
        }
    }

    return 0;
}
```

执行上述代码, 可得到的结果是: 

![](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722175507301.webp)

> 经过介绍这6个接口, 为方便记忆其实可以将接口名中的字母赋予一定的意义: 
>
> 1. `l`, list, 表示参数采用列表的方式传参
> 2. `v`, vector, 表示参数采用数组的方式传参
> 3. `p`, path, 表示会自动在PATH环境变量的路径下搜索命令
> 4. `e`, env, 表示需要传入环境变量列表进而手动维护替换进程的环境变量

### execve() *

除上面的6个接口之外, 还存在一个接口在man手册中是`单独`列出来的:

![](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722175509224.webp)

```cpp
int execve(const char *filename, char *const argv[], char *const envp[]);
```

 此接口名中没有 `p`, 说明传入程序名时, 需要传入完整的路径

为什么此接口需要单独列出来呢？

其实是因为, 其他6个接口都是此接口的封装, 即`其他六个接口内部都会调用此接口`, 此接口才是真正的系统调用接口

此接口的参数需要传入: 

1. `filename`, 带路径的文件名
2. `argv`, 命令及携带选项的数组, 每个元素为一个命令或一个选项
3. `envp`, 环境变量列表, 表示将此环境变量列表继承给替换的进程

>  看到这三个参数之后, 其实就可以发现为什么之前的6个之中没有`execlpe()`接口

## *扩展: 如何使用makefile编译生成多个不同的可执行文件

在使用makefle时, 执行make命令 `默认只会执行第一行的所描述的目标文件的依赖方法`: 

![ |inline](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722175511389.webp)

![](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722175513492.webp)

那么, 有没有什么办法让make生成多个不同的可执行程序, 即 `让make执行多个不同目标文件的依赖方法`

有, 既然make只能执行makefile文件中的第一个目标文件的依赖方法, 那就这样: 

![](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722175515870.webp)

<div id="pcMode" class="hidden"></div>
