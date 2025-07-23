---
draft: true
title: "[Linux] 详析动、静态库原理、创建与使用"
pubDate: "2023-04-01"
description: "在Linux环境下, 我们使用gcc编译链接代码文件时, 可以统分为 静态链接和动态链接"
image: https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/202306251756107.webp
categories:
    - Blogs
tags:
    - Linux系统
---

在Linux环境下, 我们使用gcc编译链接代码文件时, 可以统分为`静态链接和动态链接`

静态链接: 在编译链接时, 将代码所使用到的静态库文件的代码全部加入到可执行文件中, 此时的可执行文件会生成的比较大. 不过, 此时可执行文件再运行时, 就不需要再查找库了. 静态库文件一般以 `.a` 结尾

动态链接: 不会在编译链接时将动态库文件的代码加入到可执行文件中, 而是在可执行文件运行时, 去查找所需动态库, 并将其加载到相应的进程中.  并且不同进程可以共享这些动态库. 动态库文件一般以 `.so` 结尾

---

# 动静态库

在介绍理解动静态库之前, 一定要先知道什么是库？

其实简单一点理解, **`别人所写的一些函数、方法等相关的代码文件经过归档、整合然后发布出来的供其他人使用`** 就是库

也就是说, 每个人都可以生成库吗？是的. 这也是本篇文章的主要内容之一

## 创建静态库和动态库

我们在使用gcc来编译代码的时候, 不加选项直接生成可执行程序: 

> 额外使用两个.c文件: 
>
> ```cpp
> // myMath.h:
> #pragma once
> 
> #include <stdio.h>
> #include <assert.h>
> 
> // 从from累加到to
> extern int addToVal(int from, int to);
> // myMath.c:
> #include "myMath.h"
> 
> int addToVal(int from, int to) {
>     assert(from <= to);
> 
>     int result = 0;
>     for(int i = from; i <= to; i++) {
>         result += i;
>     }
> 
>     return result;
> }
> ```
>
> ```cpp
> // myPrint.h:
> #pragma once
> 
> #include <stdio.h>
> 
> extern void myPrint(const char* msg);
> // myPrint.c
> #include "myPrint.h"
> 
> void myPrint(const char* msg){
>     printf("%s:: %d\n", msg, __TIME__);
> }
> ```

![ ](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722160403661.webp)

### 介绍静态链接

除了上面可以直接编译链接一步生成可执行文件之外, 还可以通过添加选项将编译链接的过程分离开, 可以使用 `-c` 选项将代码文件先编译成目标文件而先不做链接: 

![ ](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722160406087.webp)

生成`.o` 的下一步就是链接了, 那么而我们知道, 我们所谓的链接, 其实就是把这些生成的`.o`目标文件连接起来生成可执行程序

我们已经生成了`.o`, 如果此时我把这些 `.o` 文件给别人, 别人可以直接使用这些`.o`文件链接生成可执行文件吗？

答案是肯定的.

我们创建另一个目录, 并只将两个`.o`文件移动过去 而不移动`.c`文件, 并再main函数中使用两个函数: 

![ ](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722160408075.webp)

可以发现, 即使没有指定编译`.c`文件, 只将`.o`文件链接起来, 就可以成功生成一个可执行文件

**`这个过程, 其实就是静态链接的过程.`** 但`.o`文件, 并不是静态库, 而**`静态库, 则是由这些.o文件生成的`**

### 创建静态库

上面我们演示了什么是静态链接, 也知道了 静态库其实就是由 源文件编译生成的`.o`目标文件 生成的, 那么该如何具体操作呢？

库的生成其实就是一个指令, 可以使用指令将需要做成库的`.o`文件 归档生成一个库

创建静态库的命令是: `ar -rc 库名 .o文件 .o文件 ……`

> **ar可以看作是归档的意思: archive, -rc则是 replace 和 creat 覆盖或创建**

其中, **`库名有严格的命名规则, 对于静态库, 必须以lib开头, 以.a为结尾后缀`**, 即 **`libxxxx.a`**

**xxxx的部分, 一般以库内容决定**

那么对于我们实现的两个简单的累加和print时间的函数来说, 我们就可以这样创建静态库: 

![ ](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722160410611.webp)

并且可以通过 `ar -tv` 查看静态库的信息: 

![ ](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722160412800.webp)

#### 打包静态库

生成了静态库之后, 还并不能只将静态库打包发布出去. 因为静态库内提供的一般只是方法实现的代码, 而没有方法的声明, 也就是还需要头文件

也就是说, 发布静态库其实需要将静态库和头文件整合到一个目录中进行打包, 一般的操作是: 

```shell
mkdir -p lib-static/include
mkdir -p lib-static/lib
cp *.a lib-static/lib
cp *.h lib-static/include
```

![ ](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722160414799.webp)

### 创建动态库

动静态库都是由源码编译出的`.o` 目标文件生成的

但是, **生成动态库和静态库的`.o`目标文件是不同的！**

`gcc -c` 生成的目标文件, 只能用于静态库的创建, 不能用于动态库的创建

创建动态库所用的`.o`文件, 是通过 `gcc -fPIC -c` 编译生成的

![ ](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722160417357.webp)

这样生成的目标文件也是可以直接链接生成可执行文件的.

创建动态库不仅是`.o`目标文件的生成方式不同, 将目标文件生成为动态库文件的命令也不同

生成静态库使用的是系统提供的`ar`归档工具, 而**生成动态库则需要使用`gcc`**

`gcc -shared -o`, shared表示生成共享库格式

而动态库的命名也有严格的格式: `libxxxx.so`, 以`lib为开头, 以.so后缀结尾`

![ ](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722160419407.webp)

> 与创建静态库不同的是, 创建动态库使用的工具只有`gcc`
>
> 因此, **动态库的创建实际上 可以不用先编译出`.o`文件**
>
> 创建动态库可以直接使用这条指令实现:
>
> **`gcc -shared -fPIC srcFile -o libxxx.so`**
>
> 可以直接将指定的源文件编译生成为动态库

####  什么是fPIC选项

PIC(Position Independent Code), 位置无关代码

我们知道, 目标文件链接为可执行程序的过程, 其实是将目标文件的代码加载到程序中, 并对代码分配地址的过程.

使用 `gcc -c不加-fPIC` 编译生成的目标文件是与位置有关的代码. 在链接时, 会将代码加载到程序中并且分配在进程中的绝对地址. 即 在调用静态库函数时, 会调用这个本来就表示函数的绝对地址. 既然是绝对地址, 那么程序加载到内存中时, 这部分代码是不能加载到随意的位置的, 只能加载到进程的固定位置, 供操作系统实际调用

而我们使用 `gcc -fPIC -c` 编译生成的目标文件是与位置无关的代码. 在链接时, 会将代码以一个相对地址的形式加载到程序中, 即 在调用动态库函数时, 会通过调用程序中的的一个表示函数位置的相对地址, 这个地址并不直接表示函数, 而是通过这个地址可以找到内存中加载的代码. 既然是相对的地址, 也就意味着其实动态库代码可以加载到内存的任意位置. 

#### 打包动态库

动态库的打包与静态库的打包可以用一样的方式

```shell
mkdir -p lib-dynamic/include
mkdir -p lib-dynamic/lib
cp *.so lib-dynamic/lib
cp *.h lib-dynamic/include
```

![ ](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722160422302.webp)

## 动、静态库的使用

上面介绍了创建动、静态库的方法过程

那么创建了动态库或静态库之后该如何使用这些库呢？

### 静态库的使用

> 当前所在路径: 
>
> ```shell
> $ pwd
> /home/July/gitCode/github/problem-of-learning/Linux/Code/CPP/libStaticDynamic/lib-static
> ```
>
> 当前在静态库打包的路径

在编写c语言时使用静态库: 

![ ](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722160424808.webp)

>  **在包含头文件时, 直接指定了头文件的相对位置**

编译链接时出错. 报错的信息是: main函数中引用了未定义的addToVal和myPrint, 这是为什么？

我们包含了头文件, 但是在使用后在编译链接时却报错, 这是为什么？

我们在包含头文件的时候, 使用不同的符号 `""` `<>` 编译器会在不同的路径下查询头文件.

`""`包含头文件, 编译器会在当前路径下查询头文件

`<>`包含头文件, 编译器会在系统的头文件目录下查询

> Linux系统中, 系统头文件路径一般会在: /usr/include
>
> 用户安装的某些软件的头文件应该会在: /usr/local/include

使用库也是同理, 但是由于代码内不会去包含库文件路径, 所以 **`编译器默认会在系统的库文件路径下找需要的库文件`**

而我们的静态库文件在哪里？在我们指定的目录下, 但肯定没有在系统的库文件路径下.

那么怎么解决这个问题呢？

1. #### 将我们的库文件添加到系统的库文件路径下

	Linux操作系统的库文件路径一般在: /lib64
	
	我们需要将静态库文件添加到此路径下: 
	
	![|wide](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722160427990.webp)
	
	然后再编译链接: 
	
	![|wide](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722160429911.webp)
	
	会发现, 还是错误.
	
	这是又是为什么呢？
	
	以往我们使用C语言时, 我们使用的都是c语言提供的库. 而`gcc默认是认识c语言的库的, 但是它并不认识其他的第三方库`, 比如我们的库. 它不认识我们的库, 那么`即使我们的库就在系统库目录下、就在他眼前, 它也认不出来`
	
	![|wide](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722160432140.webp)
	
	系统的库文件目录下, 已经存在了我们的库文件, 但是gcc不认识
	
	所以, `除了让gcc可以找到库文件, 还要让gcc认识库文件`
	
	这是, 就需要使用 `-l` 选项, 来指定我们需要的库: 
	
	![|wide](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722160434509.webp)
	
	> gcc使用-l, 可以告诉gcc需要使用哪个库. 就是让gcc认识我们使用的库
	>
	> -l后需要跟库名, 但是并不需要跟完整的库名, 比如`libxxxx.a`, 只需要跟`xxxx`的部分
	>
	> -l后可以跟空格, 也可以不跟
	
	这样的方式, `其实就是将第三方库安装到了系统中`.
	
	但是, 并不推荐直接将第三方库安装到系统的库文件目录下
	
	这样的操作其实是, **`污染了系统库`**. 所以我们最好将刚刚添加的库文件删除了.
	
	删除之后, 再执行gcc语句: 
	
	![|wide](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722160436813.webp)

2. #### 指定头文件路径和库文件路径

	我们修改一下test.c的内容: 
	
	```cpp
	#include "myPrint.h"
	#include "myMath.h"
	#include <stdio.h>
	
	int main() {
		int ret = addToVal(20, 30);
		printf("addToVal(20, 30): %d\n", ret);
	
		myPrint("Hello world, hello July");
	
		return 0;
	}
	```
	
	再直接进行编译链接: 
	
	![|wide](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722160439464.webp)
	
	头文件也找不到了, 而且库文件也肯定找不到, 使用的第三方库函数肯定也无法找到
	
	那么在不污染系统查找路径的前提下, 如何正确的编译链接呢？
	
	gcc 有两个选项: 
	
	1. `-I`: 可以用来指定包含的头文件的路径
	2. `-L`: 可以用来指定所使用库文件的路径
	
	那么使用这两个选项: 
	
	`gcc test.c -I ./include -L ./lib -lMyfunc`
	
	![|wide](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722160441361.webp)

### 动态库的使用

按照上面使用静态库的经验, 我们可以直接使用`gcc -I -L -l` 来对使用动态库的代码, 进行编译链接: 

![ ](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722160443472.webp)

执行命令不会报错, 但是当我们运行生成的可执行程序的时候: 

![ ](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722160445423.webp)

我们会发现, 进程无法找到相对应的动态库.

发生这种找不到库的错误的时候, 可以使用ldd命令来查看程序依赖的库: 

![ ](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722160447086.webp)

系统表示, 程序依赖的一个 libMyfun.so 库找不到.

这是为什么？我们在编译的时候 明明已经指定了库的路径以及库名, 为什么还是找不到？

只用一句话回答这个问题, **给编译器说了库路径和库名, 跟生成的可执行程序有什么关系？又没有给可执行程序说！**

也就是说, 

**`gcc编译的时候找到并使用了动态库 生成了可执行文件, 但是生成的可执行文件并不知道动态库在哪`**

那么如何解决这个问题呢？

1. 在系统库目录下添加使用的动态库

    在/lib64目录下添加动态库, 就是将动态库安装到系统中

    **`系统的库目录, 不仅仅只是给gcc提供库的查找路径的, 而是给系统中的所有进程`**, 所以 在系统库目录下添加动态库, 所有进程就可以找到

    这个就不演示了

2. 添加相应的环境变量

    Linux操作系统中, `有一个环境变量是用来 指定 进程动态运行时 查询库文件的路径的`: `LD_LIBRARY_PATH`

    所以, 我们只要添加环境变量, 进程就会向环境变量下的目录中查找动态库

    举个例子:

    ```shell
    # 永久添加环境变量
    # 首先 先增加用户的写权限
    sudo chmod a+w /etc/profile
    vim /etc/profile
    # 在打开文件的最后一行输入
    export LD_LIBRARY_PATH=$LD_LIBRARY_PATH:/home/July/gitCode/github/problem-of-learning/Linux/Code/CPP/libStaticDynamic/lib-dynamic/lib
    # 保存退出之后, 关闭用户的写权限 再执行命令使修改生效
    sudo chmod a-w /etc/profile
    # 必须关闭用户写权限
    source /etc/profile
    ```

    然后再执行可执行程序:

    ![|wide](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722160450945.webp)

    可以看到, 程序已经可以正常执行

    > 测试完之后, 可以取消设置

3. 添加系统配置文件

    除了上面的添加环境变量来让进程可以找到动态库之外, 还有另外一种方法: 添加系统配置文件

    Linux操作系统中 `/etc/ld.so.conf.d` 路径下, 保存的是搜索动态库的配置文件:

    ![|wide](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722160452991.webp)

    我们可以添加一个类似的文件, 来让进程知道向哪里查询动态库

    但是文件内容是什么呢?

    可以先查看一下已经存在的文件:

    ![|wide](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722160454848.webp)

    可以看到, 其实这些配置文件的内容, 就是一个动态库所在的路径

    那么我们也可以比葫芦画瓢, 添加一个指定动态库路径的配置文件, 文件名可以随便写:

    ![|wide](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722160457887.webp)

    添加了配置文件之后, 可执行程序还是不能正常运行.

    因为我们添加的配置文件还没有被加载到系统内存中, 所需需要使用命令: `ldconfig 配置文件`

    ![|wide](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722160459631.webp)

    > 可以删除配置文件后, 执行`ldconfig` 来取消配置文件的加载

4. 添加软连接

    这个方法与第一种方法类似, 也是向系统的库文件目录下添加文件

    不过此时添加的是动态库的软连接, 而不是原本的动态库文件:

    ![|wide](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722160502723.webp)

    添加之后, 可以正常执行程序

    并且, 此时再编译, 也不需要指定库的目录了!

    ![|wide](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722160504463.webp)

#### 为什么使用静态库的可执行程序没有查找不到库的情况？

为什么使用静态库链接成的可执行文件, 在执行的时候就没有找不到静态库呢？

是因为, 使用静态库链接时, `静态库的相关代码已经被加入到了可执行文件中`, 即 **`使用静态库生成的可执行文件, 在执行时并不依赖任何静态库`**

也就不需要运行时查找

#### 为什么使用第三方动态库的可执行程序需要知道动态库的路径？

首先我们的可执行程序运行之后, 会被加载到内存中变成一个进程

操作系统会为其创建: PCB、进程地址空间、页表

![ ](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722160506695.webp)

我们知道, 动态库在链接时是不会将代码加载到程序中的, 只会将代码以一个相对地址的形式加载到程序中

而我们的程序在运行到动态库代码时, 是需要跳转到动态库代码继续执行的

而动态库是一个可执行文件, 它拥有`x执行权限`: 

![ ](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722160510967.webp)

**`如果程序不知道其所使用的动态库的路径, 那么进程在运行时, 操作系统就不能根据程序把动态库加载到内存中`**

**`如果动态库不能被加载到内存中, 进程的虚拟地址空间的共享区就不能指向动态库的代码`**

**`如果共享区不能指向动态库的代码, 那么进程肯定就不能执行代码, 进程就会执行错误`**
