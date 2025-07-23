---
draft: true
title: "[Linux] 教你实现一个简单的、属于自己的Shell"
pubDate: "2023-03-11"
description: "我们可以通过shell, 执行各种命令. 而本篇文章的主要内容, 就是实现一个简易的shell"
image: https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/202306251757712.webp
categories:
    - Blogs
tags:
    - Linux系统
    - shell
---

# 简易Shell实现

我们在Linux中使用的shell, 一般有两个 bash 和 zsh.

我们可以通过shell, 执行各种命令. 而本篇文章的主要内容, 就是实现一个简易的shell

## 简易shell功能

在实现shell之前, 肯定要明白简易的shell需要实现什么功能

1. 首先要知道, shell应该是一个死循环的程序.

	为什么？因为shell是可以`循环从命令行接收用户输入的内容`的

2. 其次, shell 需要一个设置一个提示符. 类似这样的东西: 
   
    ![|small](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722161053634.webp)

3. 第三, 我们使用shell是需要执行命令的, 且这些命令需要在环境变量PATH下

	这些命令大多都是需要由我们的shell创建子进程来执行的

4. 第四, shell需要可以 `等待回收` 创建的子进程

5. 第五, 需要实现一些内建命令: 比如 `export` 等

	这些命令 是不需要创建子进程来执行的

上面就是一个shell的最基本的功能

## 实现shell

### 1. 循环接收用户命令

我们实现的简易的shell的本质, 是一个死循环

且在接收用户输入的指令之前, 需要先输出一个用户提示符: 

![ |large](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722161055474.webp)

执行: 

![ |large](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722161057146.gif)

用户提示符是打印出来了, 但是 是无限循环地打印.

解决这个无限循环的打印, 只需要在printf之后设置一个接收输入内容地函数即可, 这里我们使用 `fgets()`:

![](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722161059549.webp)

```cpp
#include <stdio.h>
#include <unistd.h>
#include <string.h>
#include <sys/types.h>
#include <sys/wait.h>
#include <stdlib.h>

#define SIZE 128

int main() {
    while(1) {
        char command_V[SIZE];
        memset(command_V, '\0', SIZE);

        // 首先是用户提示符: 
        printf("[七月July@MyBlog 当前目录]# ");
        fgets(command_V, SIZE, stdin);
        printf("%s", argV);					// 测试进程是否接收了输入内容
    }

    return 0;
}
```

执行上述代码的结果是: 

![myShell_fgets  |huge](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722161102175.gif)

可以实现命令行输入, 并且接收输入内容.

### 2. 创建子进程执行命令

shell 中的大多数命令都是通过创建子进来执行的. 

可以通过fork()创建子进程, 然后进程替换实现命令的执行

实现fork()子进程替换为命令子进程, 最佳的进程替换的接口是: `exevp()`

1. 首先是因为, 我们接收了命令行输入的程序及选项字符串, 将字符串根据空格分割开 就是一个命令和选项的数组
2. 带`p`字的接口, 会默认从环境变量PATH的路径下搜索, 不需要在添加程序的路径

那么, 首先就是对接收的命令字符串的分割: 

C语言中, 关于字符串的函数中, 有一个strtok()函数是用来分割字符串的, `使用strtok()可以将指定字符串按照传入的分割符分开`

> `strtok`:
>
> ![ |wide](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722161104519.webp)
>
> 第一个参数`str`, 传入需要分割的字符串
>
> 第二个参数`delimiters`, 传入分割符
>
> 此函数的返回规则为, 如果分割出了字符串, 则返回此字符串的指针; 否则 返回空指针
>
> 且, 第一次调用此函数之后, 若原字符串中还存在可以分割的字符串, `可以直接在strtok()的第一个参数传入空指针以再次调用此函数从上次分割出的字符串之后继续分割`

但是在分割字符串之前, 需要将接收到的字符串的最后一个有效字符设置为`'\0'`, 因为接收到最后一个字符是`'\n'`

`command_V[strlen(command_V)-1] = '\0'`, 既可以修改`'\n'` 为 `'\0'`

#### 分割字符串

strtok()的使用方法, 如下列代码示意: 

```cpp
// 分割命令行
command_argV[0] = strtok(command_S, " ");
int index = 1;
while(command_argV[index++] = strtok(NULL, " "));
// strtok分割不到字符串时, 会返回空指针, 刚好可以作为数组的最后一个元素 及 循环结束的条件
```

command_argV是一个指针数组, 每个元素存储一个字符串. 此指针数组的作用是, 进程替换时传入execvp()接口

所以应该按照要求存储数组, 即 第0元素存储命令名, 之后每个元素存储一个选项

而我们从命令行接收到正确的命令的字符串的格式应该是: `命令名 选项1 选项2 选项3 ...`

所以 strtok() 传入的分割符应该是 `" "`, 第一次执行 `strtok(command_S, " ")`分割出命令名, 会返回命令名字符串

此后, 可以再次使用`strtok(NULL, " ")` strtok会`自动从命令名之后再次分割`

command_argV[0] 设置为 命令名之后, 从 command_arg[1] 开始 将每一个选项存入其中

分割存储之后的 command_argV 内容可以展示一下: 

![|inline](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722161108011.webp)

![ |large](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722161110048.webp)

将接收到的字符串分割存储到字符指针数组中之后, 就可以创建子进程并进程替换了

创建子进程就非常简单了: 

```cpp
#include <stdio.h>
#include <unistd.h>
#include <string.h>
#include <sys/types.h>
#include <sys/wait.h>
#include <stdlib.h>

#define SIZE 128

char *command_argV[SIZE];

int main() {
    while(1) {
        char command_S[SIZE];
        memset(command_S, '\0', SIZE);

        // 首先是用户提示符: 
        printf("[七月July@MyBlog 当前目录]# ");
        fgets(command_S, SIZE, stdin);
        command_S[strlen(command_S) - 1] = '\0';        // 修改'\n' 为 '\0'
        
        // 分割命令行
        command_argV[0] = strtok(command_S, " ");
        int index = 1;
        while(command_argV[index++] = strtok(NULL, " "));
        // strtok分割不到字符串时, 会返回空指针, 刚好可以作为循环结束的条件
        
        // 创建子进程, 并进程替换
        pid_t id = fork();
        if(id == 0) {
            //进程替换
            execvp(command_argV[0], command_argV);
            exit(-1);       // 替换失败则 退出码-1
        }
    }

    return 0;
}
```

此时的代码, 就可以完成一些命令操作了: 

![ |large](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722161113068.webp)

但是 执行结果好像有些奇怪

### 3. 回收子进程

在介绍过进程等待之后, 回收子进程的操作就显得格外简单了

> 博主的进程等待相关文章: 

我们使用waitpid()来等待子进程. fork()获取的子进程pid, 刚好可以指定回收子进程

```cpp
#include <stdio.h>
#include <unistd.h>
#include <string.h>
#include <sys/types.h>
#include <sys/wait.h>
#include <stdlib.h>

#define SIZE 128

char *command_argV[SIZE];

int main() {
    while(1) {
        char command_S[SIZE];
        memset(command_S, '\0', SIZE);

        // 首先是用户提示符: 
        printf("[七月July@MyBlog 当前目录]# ");
        fgets(command_S, SIZE, stdin);
        command_S[strlen(command_S) - 1] = '\0';        // 修改'\n' 为 '\0'
        
        // 分割命令行
        command_argV[0] = strtok(command_S, " ");
        int index = 1;
        while(command_argV[index++] = strtok(NULL, " "));
        // strtok分割不到字符串时, 会返回空指针, 刚好可以作为循环结束的条件
        
        // 创建子进程, 并进程替换
        pid_t id = fork();
        if(id == 0) {
            //进程替换
            execvp(command_argV[0], command_argV);
            exit(-1);       // 替换失败则 退出码-1
        }
        // 父进程回收子进程
        int status = 0;
        pid_t ret = waitpid(id, &status, 0);
        if(ret > 0) {
            printf("父进程成功回收子进程, exit_code: %d, exit_sig: %d\n", WEXITSTATUS(status), WTERMSIG(status));
        }
    }

    return 0;
}
```

此时, 再执行代码: 

![ |large](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722161116314.webp)

可以看到, 命令就可以正常执行了.

### 4. 优化不足

我们的myShell已经可以正常执行大部分的命令了, 但是还存在一些不足: 

![](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722161118516.webp)

导致这些不足的原因是什么？怎么优化这些不足呢？

当我们使用 bash, 查看这些命令时: 

![ ](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722161121145.webp)

可以发现, 这两个命令真正执行的并不是简单的原命令, 那么我们也可以在myShell中做出优化

```cpp
#include <stdio.h>
#include <unistd.h>
#include <string.h>
#include <sys/types.h>
#include <sys/wait.h>
#include <stdlib.h>

#define SIZE 128

char *command_argV[SIZE];

int main() {
    while(1) {
        char command_S[SIZE];
        memset(command_S, '\0', SIZE);

        // 首先是用户提示符: 
        printf("[七月July@MyBlog 当前目录]# ");
        fgets(command_S, SIZE, stdin);
        command_S[strlen(command_S) - 1] = '\0';        // 修改'\n' 为 '\0'
        
        // 分割命令行
        command_argV[0] = strtok(command_S, " ");
        int index = 1;
        
        // ls 色彩优化
        if(strcmp(command_argV[0], "ls") == 0) {
            command_argV[index++] = "--color=auto";         // 若执行ls命令, 则在ls命令后携带一个--color=auto选项
        } 
        // ll 命令优化
        if(strcmp(command_argV[0], "ll") == 0) {
            command_argV[0] = "ls";
            command_argV[index++] = "-l";
            command_argV[index++] = "--color=auto";
        }
        
        while(command_argV[index++] = strtok(NULL, " "));
        // strtok分割不到字符串时, 会返回空指针, 刚好可以作为循环结束的条件
        
        // 创建子进程, 并进程替换
        pid_t id = fork();
        if(id == 0) {
            //进程替换
            execvp(command_argV[0], command_argV);
            exit(-1);       // 替换失败则 退出码-1
        }
        // 父进程回收子进程
        int status = 0;
        pid_t ret = waitpid(id, &status, 0);
        if(ret > 0) {
            printf("父进程成功回收子进程, exit_code: %d, exit_sig: %d\n", WEXITSTATUS(status), WTERMSIG(status));
        }
    }

    return 0;
}
```

此时, ll 和 ls 就可以更加完善的执行: 

![ |large](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722161123545.webp)

### 5. 自建命令添加

shell最基本的功能已经实现了

我们可以通过自己的实现的简易的EasyShell, 来执行大多数的命令

但是 有一些命令是无法执行的: 

![ |huge](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722161125585.webp)

![ ](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722161127537.webp)

为什么 cd 和 export 明明都可以执行, 但是却没有作用呢？

因为, cd 和 export 命令实际上都是shell的内建命令, PATH环境变量路径下存在的程序其实也没有实际功能的: 

![ |large](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722161129681.webp)

可以看到, 执行 /usr/bin 路径下的cd程序, 也是没有作用的

> 其实并不是没有作用, 而是`cd进程当前运行的路径没有改变`
>
> 在介绍Linux进程时提到过, 进程存在一个当前路径, 表示进程当前运行的路径, 在/proc目录下的进程目录下可以看到
>
> 举个例子:
>
> 当我在/home/July 路径下执行 /home/July/procTest/a.out 程序时, 创建出来的进程运行的当前路径是什么呢？
>
> ![|wide](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722161131449.webp)
>
> 可以看到, 在 /home/July 路径下执行 /home/July/procTest/a.out 程序时, 创建出的进程的当前运行的路径其实时 /home/July
>
> 同样的道理, 我们执行cd总是在用户当前所处的路径下, 那么cd执行之后的当前路径也就是用户执行cd时所在的路径, 并不会发生改变
>
> 所以 要实现cd的功能, 就需要`内建命令实现修改进程当前运行的路径`

这些命令并不是shell通过创建子进程的方式执行的, 而是shell自己在内部执行的, 此类的命令被称为内建命令: 

```cpp
#include <unistd.h>
#include <stdio.h>
#include <string.h>
#include <sys/types.h>
#include <sys/wait.h>
#include <stdlib.h>

#define SIZE 128

int putEnvInmyShell(char *put_Env) {
    putenv(put_Env);

    return 0;
}

int changeDir(const char* new_path) {
    chdir(new_path);					// 系统调用

    return 0;
}
char *command_argV[SIZE];

char copy_env[SIZE];

int main() {
    while(1) {
        char command_S[SIZE];
        memset(command_S, '\0', SIZE);

        // 首先是用户提示符: 
        printf("[七月July@MyBlog 当前目录]# ");
        fgets(command_S, SIZE, stdin);
        command_S[strlen(command_S) - 1] = '\0';        // 修改'\n' 为 '\0'

        // 分割命令行
        command_argV[0] = strtok(command_S, " ");
        int index = 1;
        if(strcmp(command_argV[0], "ls") == 0) {
            command_argV[index++] = "--color=auto";         // 若执行ls命令, 则在ls命令后携带一个--color=auto选项
        } 
        if(strcmp(command_argV[0], "ll") == 0) {
            command_argV[0] = "ls";
            command_argV[index++] = "-l";
            command_argV[index++] = "--color=auto";
        }
        while(command_argV[index++] = strtok(NULL, " "));
        // strtok分割不到字符串时, 会返回空指针, 刚好可以作为循环结束的条件


        // 内建命令
        if(strcmp(command_argV[0], "cd") == 0 && command_argV[1] != NULL) {
            // 使用cd命令时, command_argV[1]位置应该是需要进入的路径
            changeDir(command_argV[1]);
            continue;								// 非子进程命令, 不用执行下面的代码, 所以直接进入下个循环
        }
        if(strcmp(command_argV[0], "export") == 0 && command_argV[1] != NULL) {
            // 我们接收的命令, 都在command_S 字符串中, 此字符串每次循环都会被清除
            // 所以不能直接将 command_argV[1] putenv到环境变量中, 因为指向的同一块地址
            // 所以 需要先拷贝一份
            strcpy(copy_env, command_argV[1]);
            putEnvInmyShell(copy_env);
            continue;
        }

        // 创建子进程, 并进程替换
        pid_t id = fork();
        if(id == 0) {
            //进程替换
            execvp(command_argV[0], command_argV);
            exit(-1);       // 替换失败则 退出码-1
        }
        // 父进程回收子进程
        int status = 0;
        pid_t ret = waitpid(id, &status, 0);
        if(ret < 0) {
            exit(-1);
        }
    }

    return 0;
}
```

![ |huge](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722161135195.webp)

![ ](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722161136949.webp)

## 简易shell代码

完成了两个内建命令的代码之后, 简易shell可以说是基本实现了

实现这个简易的shell, 只是为了加深对进程、环境变量、进程等待、进程替换等进程相关知识的理解

比起真正的一个完善的shell, 差的还有十万八千里.

我们一般使用的bash, 除了执行命令的功能, 至少还有: `backspace删除`、`历史命令`、`Tab补全`等非常方便的功能, 这些功能都没有在本篇文章中实现, 有兴趣的话可以查找资料实现一下

```cpp
#include <unistd.h>
#include <stdio.h>
#include <string.h>
#include <sys/types.h>
#include <sys/wait.h>
#include <stdlib.h>

#define SIZE 128

int putEnvInmyShell(char *put_Env) {
    putenv(put_Env);

    return 0;
}

int changeDir(const char* new_path) {
    chdir(new_path);					// 系统调用

    return 0;
}
char *command_argV[SIZE];

char copy_env[SIZE];

int main() {
    while(1) {
        char command_S[SIZE];
        memset(command_S, '\0', SIZE);

        // 首先是用户提示符: 
        printf("[七月July@MyBlog 当前目录]# ");
        fgets(command_S, SIZE, stdin);
        command_S[strlen(command_S) - 1] = '\0';        // 修改'\n' 为 '\0'

        // 分割命令行
        command_argV[0] = strtok(command_S, " ");
        int index = 1;
        if(strcmp(command_argV[0], "ls") == 0) {
            command_argV[index++] = "--color=auto";         // 若执行ls命令, 则在ls命令后携带一个--color=auto选项
        } 
        if(strcmp(command_argV[0], "ll") == 0) {
            command_argV[0] = "ls";
            command_argV[index++] = "-l";
            command_argV[index++] = "--color=auto";
        }
        while(command_argV[index++] = strtok(NULL, " "));
        // strtok分割不到字符串时, 会返回空指针, 刚好可以作为循环结束的条件

        // 内建命令
        if(strcmp(command_argV[0], "cd") == 0 && command_argV[1] != NULL) {
            // 使用cd命令时, command_argV[1]位置应该是需要进入的路径
            changeDir(command_argV[1]);
            continue;								// 非子进程命令, 不用执行下面的代码, 所以直接进入下个循环
        }
        if(strcmp(command_argV[0], "export") == 0 && command_argV[1] != NULL) {
            // 我们接收的命令, 都在command_S 字符串中, 此字符串每次循环都会被清除
            // 所以不能直接将 command_argV[1] putenv到环境变量中, 因为指向的同一块地址
            // 所以 需要先拷贝一份
            strcpy(copy_env, command_argV[1]);
            putEnvInmyShell(copy_env);
            continue;
        }

        // 创建子进程, 并进程替换
        pid_t id = fork();
        if(id == 0) {
            //进程替换
            execvp(command_argV[0], command_argV);
            exit(-1);       // 替换失败则 退出码-1
        }
        // 父进程回收子进程
        int status = 0;
        pid_t ret = waitpid(id, &status, 0);
        if(ret < 0) {
            exit(-1);
        }
    }

    return 0;
}
```

