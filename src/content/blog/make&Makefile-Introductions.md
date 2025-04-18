---
draft: true
title: "[Linux] make与makefile用法简单介绍"
pubDate: "2023-02-27"
description: "make其实只是一个指令, 需要在当前目录下存在makefile文件时才可以正确执行"
image: https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/202306251803222.webp
categories: ['tech']
tags: ["Linux使用问题"]
---

在Windows平台上编写C/C++代码, 一般使用的都是配置完成的集成的开发环境, 比如Dev-C++、VS或VS Code等。

一般是不需要指令编译运行等操作的, 只需要点一点。

而Linux则不同, 每一个源文件都需要进行手动指令编译生成可执行文件之后才能运行。

以一个简单的 C++ 文件为例: 

![|medium](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/image-20230227112324266.webp)

在Linux平台下 需要使用g++指令来进行编译: 

![|medium](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/image-20230227112451565.webp)

可以生成可执行文件`helloworld`

> 有关Linux平台下代码的编译的分析, 推荐博主文章: 
>
> [[程序员的自我修养\] 理解编译到链接的过程](http://humid1ch.cn/posts/Compile&Link)
>
> 本篇文章不多赘述

而除了每次使用gcc/g++指令来编译代码文件的方式之外, 还有另一种方式, 即本篇文章的主要内容: `make 和 makefile`

---



# make 与 makefile

## make 是什么？

make其实只是一个指令, 需要在当前目录下存在makefile文件时才可以正确执行, 否则就会出现: 

![|large](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/image-20230227114212877.webp)

当makefile文件存在, 且内容正确的时候, 再执行make则会出现: 

![|large](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/image-20230227115214759.webp)

执行make之后, 执行了g++操作, 生成了helloworld可执行文件

所以, `make 其实就是一个指令`, 但是 其依靠的makefile文件又是什么呢？

## makefile 是什么？

makefile 是一个文件, 为 make指令提供依靠的文件

以上面为例, 其中makefile文件的内容是: 

![|large](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/image-20230228211500117.webp)

此文件的内容, 其实大致包括两个东西: 

1. 依赖关系

	就像 文件中第一行 `helloworld:helloworld.cpp` 这个语句, 就可以表示 `需要生成的可执行程序helloworld 依赖于 helloworld.cpp 文件`
	
	而这个格式也是makefile文件内容中 表示文件之间依赖关系的格式, 即 `xxxxx:xxxxx`
	
	`:`之前是目标文件, `:`之后是目标文件所依赖的文件, 目标文件可以存在多个依赖文件, 此时需要在`:`后表明多个依赖文件

2. 依赖方法

	除依赖关系之外, 目标文件与依赖文件之间还存在依赖方法, 即 表示依赖关系语句的下一行语句, 在上例中为 `g++ helloworld.cpp -o helloworld`
	
	此依赖方法, 其实就是 `由依赖文件生成目标文件所需要的执行的指令`
	
	表示依赖关系语句的下一行就是依赖方法。需要注意的是, 依赖方法前必须存在一个`Tab长度(不能为4个空格)`

makefile内容写入完毕之后, 只需要在当前目录下执行make指令, 就可以`直接根据makefile中提供的依赖关系和依赖方法自动执行指令`

> 对于简单、少量的文件编译使用make和makefile 会显得多此一举
>
> 但是对于复杂的、大量的文件或程序进行编译等处理时, 如果已经事先编写好了makefile文件, 那么无论之后需要重复处理多少次都只需要输入一个make指令, 就可以自动完成

## make clean

一般, make存在一个对应的指令叫 `make clean`, 此指令用于`清除make指令执行之后生成的文件`

此指令 只有在makefile文件中表明clean的依赖方法时才能使用, 在上例中即为: 

![|large](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/image-20230228215630769.webp)

执行的结果为: 

![|huge](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/image-20230228220043504.webp)

> makefile文件中
>
> ```makefile
> clean:
> 	rm -f helloworld
> ```
>
> 此格式与 依赖关系和依赖方法的格式相同, 但是 clean并没有依赖文件, 执行依赖方法也不会生成clean文件
>
> 输入 make clean 指令也可以执行依赖方法
>
> 那么有没有可能, makefile文件的每个依赖关系语句的目标文件, 都可以作为make指令的后缀 与 make结合作为一个指令。此指令的作用是执行依赖关系的依赖方法
>
> 测试一下: 
>
> ![|huge](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/image-20230228222513199.webp)
>
> 然后先执行 make: 
>
> ![|large](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/image-20230228222633669.webp)
>
> 生成了helloworld可执行文件和helloworld.o文件
>
> 再make clean清除: 
>
> ![|large](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/image-20230228222754184.webp)
>
> 那么可不可以 输入 make helloworld.o 只执行相应的依赖方法呢？
>
> ![|huge](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/image-20230228223021219.webp)
>
> 答案是可以的, 所以 其实makefile依赖关系中的目标文件是可以作为make指令的后缀 当成一个单独的指令的

## .PHONY

在上述例子中, clean前还存在一个语句: `.PHONY:clean`

.PHONY可以看作是makefile文件的关键词, 其后修饰目标文件名, 可表示 `无论此目标文件名是否存在是否为最新, 此目标文件的依赖方法恒可以执行`

依旧以上为例: 

![|medium](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/image-20230228230610372.webp)

当多次执行make指令时: 

![|huge](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/image-20230228230837691.webp)

当在makefile文件中添加, `.PHONY:helloworld` 时, 再多次执行 make: 

![|huger](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/image-20230228231503651.webp)

所以, 被.PHONY修饰的目标文件名, 即表示 `此目标文件的依赖方法恒可执行, 无论目标文件是否存在、是否最新`

### *扩展: make时, 指令如何判断目标文件是否最新？

在系统中, 存在一个指令叫 stat, 这个指令的作用是显示文件的状态属性: 

![|huge](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/image-20230301165423095.webp)

对文件使用 stat指令可以看到, 文件具有三个有关时间的属性: `最近访问时间` `最近更改时间` `最近改动时间`

对于可执行程序, 其最近访问时间即为 此程序最后一次运行的时间, 最近更改时间即为 此程序的内容最后一次改变的时间, 而最近改动时间, 则为此程序最后一次更改、变动或移动的时间

而 make 判断目标文件是否最新的依据, 就是 将当前目标文件的最近更改时间与其依赖文件的最近更改时间做对比, 若发现依赖文件的最近更改时间比较新, 则执行make生成新的目标文件: 

![例1 |inline](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/image-20230301170213210.webp)

![例2 |inline](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/image-20230301171323048.webp)

---

感谢阅读~

![|tiny](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/image-20230410181909816.webp)
