---
draft: true
title: "[Linux] 环境变量介绍: 什么是环境变量？C/C++如何获取环境变量？环境变量有什么特性？有什么用？"
pubDate: "2023-03-04"
description: "什么是环境变量？认识 环境 这两个字, 也知道 变量 是什么, 把这两个词结合起来的环境变量是什么东西？"
image: https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/202306251757454.webp
categories:
    - Blogs
tags:
    - Linux系统
---

# 环境变量

## 环境变量的概念

什么是环境变量？认识 环境 这两个字, 也知道 变量 是什么, 把这两个词结合起来的环境变量是什么东西？

环境变量, 稍微正式一点来讲, 其实是 **`在操作系统中用来指定操作系统运行环境的一些参数`**

这些运行环境具体指的是什么呢？这个不太容易解释, 但是可以举个例子: 

在使用Linux系统且没有图形化界面的情况下, 所有的操作都要用命令行的形式执行, 操作系统会提供许多的相关指令, 像这样: 

![|huge](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722160515544.webp)

并且可以使用 cd 指令, 再进入这个目录, 并使用 pwd 显示当前路径: 

![|large](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722160517903.webp)

而这些指令, 其实都是一个个程序 指令名即为程序名: 

![|inline](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722160519728.webp)

这些指令 在用户使用的时候运行 成为进程, 完成任务之后再从内存中被释放。运行流程与我们个人编写的程序并没有什么区别。

但是为什么 我们自己编写的程序不能直接用程序名运行, 而必须指定路径: 

![|huge](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722160521944.webp)

这就与操作系统的环境变量有关系了！

实际上, 操作系统中可以直接在命令行使用、不需要指定路径的这些指令(程序), 他们的路径已经被添加到了操作系统的环境变量中

当在操作系统的命令行不指定路径输入指令的时候, 操作系统会自动地在`PATH环境变量` 设置的路径中搜索是否存在与指令相匹配的程序。如果可以找到 那就执行, 如果找不到, 那就会提示 `command not found`

操作系统中有很多的环境变量, 这些环境变量中设置的内容都是与操作系统运行环境有关的参数, 使用 env 指令可以查看: 

![](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722160524180.webp)

> 博主使用的这台服务器上, 环境变量其实算很少了

上图中可以看到的环境变量有: `USER` `LOGNAME` `HOME` `PAHT` `MAIL` `SHELL` …… 很多

本篇文章对于这些环境变量的介绍, 只会重点涉及到 `PATH`, 其他的不做重点说明

## PATH

`PATH` 是一个环境变量, 此环境变量用于 `指定 命令的搜索路径`. 就像上面介绍的那样, 当一个程序 在此环境变量中的路径下时, 那么此命令就可以不指定路径直接使用.

使用 `echo $PATH` 可以查看 环境变量PATH的内容: 

![](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722160527257.webp)

> `echo $环境变量名` 即可查看环境变量的内容

可以看到, PATH中设置的路径有很多: `/usr/local/bin` `/usr/bin` `/home/July/bin` `/usr/local/sbin` …… 并且, 每个路径之间用 `:` 分隔

这些路径下都有什么呢？就以 `/usr/bin` 路径为例: 

当你进入这个路径, 并执行 ls指令的时候, 你会发现 这个路径下有非常多的可执行程序: 

![bin路径下的程序](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722160529023.webp)

多到数不过来, 这些全部都是可以不指定路径, 在命令行直接执行的程序

那么如果我将我自己的程序, 也添加到PATH中的某个路径下, 是不是就也可以直接执行了呢？测试一下就能得到答案

### 使程序可在命令行中直接运行

1. 直接在PATH指定的路径下 添加程序(不推荐)

我们随便编写一个程序, 将它添加到 PATH环境变量中的某个路径下, 试验一下能否直接运行: 

![](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722160533416.webp)

也就是说, `我们自己的程序只要在PATH指定的路径下可以找到, 就能直接在命令行中运行`

但是, 这样直接将程序移动到某个路径下的操作有一定的风险, 毕竟不能保证我们自己的程序不会与某个路径下的程序重名

所以, 是不建议直接将成语移动到PATH指定的某个路径下的. 这只是方法一, 还有另一种方法.

> 测试完, 使用 `sudo rm -f /usr/bin/程序` 的指令, 将添加的程序删除

2. 将程序所在路径添加到PATH环境变量中

既然直接将程序添加到PATH环境变量中的某路径下存在风险, 那可以采用另一种方法。

直接将程序当前所在路径添加到PATH环境变量中不就可以了吗？

那么就直接操作: 

1. 使用pwd命令查看当前路径
2. export PATH=当前路径
3. 直接运行一下程序

![|large](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722160536249.webp)

三个操作执行下来, 可以发现 我们自己的程序已经可以直接运行了

但是, 当我们需要执行部分其他命令的时候, 你会发现: 

![|large](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722160538842.webp)

在Linux操作系统中经常使用的命令用不了了, 命令行会提示:`command not found`, 这是为什么?

当再次执行`echo $PATH`查看PATH的内容时: 

![|large](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722160541234.webp)

发现 PATH内容 只剩下了你设置的那一个路径. 其他命令的路径都没有了, 命令也就用不了了

> 不用担心, `export 设置的环境变量只是临时的`, 重启一下, 或者关闭XShell端口再开一个, 就可以恢复了

知道了问题出在哪, 但是原因是什么？

原来是因为在添加PATH内容的时候, 直接 `PATH=新路径, 不是添加的操作 而是覆盖`

想要在PATH环境变量中添加路径, 需要这样 `PATH=$PATH:新路径`, `$PATH`可以直接表示PATH原来的内容, `:`是分隔符, 再加上新路径, 就可以完成在PATH环境变量中添加新路径的操作: 

![|huge](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722160543634.webp)

---

给PATH环境变量 添加新路径, 其实就是把新路径下的程序、软件安装到了操作系统中, 让操作系统可以直接搜索到软件及指令

## 环境变量 与 本地变量

操作系统中的变量, 分环境变量 和 本地变量

在命令行中, 直接用 类似在C语言中定义变量的方式, 就可以在操作系统中定义一个本地变量: 

![|large](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722160545983.webp)

而 环境变量的创建, 就需要用到指令了

### export

上面介绍PATH时, 使用过export命令, 修改过PATH环境变量的内容

export其实也可以创建一个环境变量: 

![|medium](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722160548400.webp)

> unset可以将创建的环境变量删除

## 其他环境变量

上面介绍环境变量的概念时, 使用env命令将当前系统中的环境变量全都列了出来, 可以看到系统中存在许多的环境变量, 下面就简单的介绍一下其中部分的环境变量都是什么: 

![ ](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722160550674.webp)

1. `USER` 从字面意思就可以看出, 此环境变量是指 当前系统环境的使用用户

2. `LOGNAME` 全称应该是`LOGINNAME`, 指 当前登录主机的用户名

3. `HOME` 指 当前用户的主工作目录

	关于 `环境变量HOME`, 可以切换用户 观察其变化
	
	在非root用户使用su命令, 并输入root密码之后, 在查看 `环境变量HOME`, 可以发现其值改变了: 
	
	![|medium](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722160553505.webp)

4. `MAIL` 邮箱全局变量

5. `SHELL` 指 所使用的SHELL目录

6. `PWD` 当前所在目录

7. `OLDPWD` 上一次所在目录

8. `HOSTNAME` 主机名

9. `LS_COLOR` 指, ls 列出的文件的配色

10. `LANG` 当前系统语言

11. ……

# C/C++ 获取环境变量的方式

在前期使用C/C++写代码的时候, 一般情况下 main()函数是不写参数的. 但这并不意味着, main()函数不能存在参数. 

C/C++中, `main()函数也是可以存在参数的, main()函数可以存在三个参数`

## main函数的前两个参数: argc 和 argv

main()函数如果使用参数的话, 那么定义main()函数应该是: `int main(int argc, char *argv[])`

这两个参数, 一个是整型 argc, 另一个是 指针数组 argv. 这两个变量都是用来存储什么内容的呢？又是谁给main()函数传参的呢？

既然一个是整型, 一个是数组, 那么不用猜 argc 这个整型是什么了, `argc其实是 argv这个数组的元素个数`

那 argv这个数组的内容是什么呢？

数组内容其实可以查看, 只需要遍历输出就能看到数组内容: 

```cpp
#include <iostream>
#include <unistd.h>
using std::cout;
using std::endl;

int main(int argc, char *argv[]) {
	for(int i = 0; i < argc; i++) {
		cout << "argv[" << i << "] : " << argv[i] << endl;
	}
	
	return 0;
}
```

![|large](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722160557511.webp)

直接执行`./mainTest`, 此时 argv数组中只有一个元素, 存储的是 `./mainTest` 这句指令.

但是, 在 `./mainTest`之后添加任意选项时: 

![|large](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722160559431.webp)

可以非常直观的看到, 程序打印的内容变多了, 也就意味着 argv数组中存储的元素变多了. 再一分析, 可以发现, `argv数组中多出来的元素 其实就是在执行程序时后面任意添加的选项`

也就是说, 我们给main()函数添加的 argc 和 argv参数, 其中 argc表示argv数组中元素的个数, 而argv数组中的元素 是由命令行参数提供的, 传入的元素是 程序名以及选项 

这有什么用呢？argv接收了执行程序时后面添加的选项, 又有什么用呢？

请好好思考一下, 既然argv接收了运行程序时后面添加的选项, 那也就意味着在程序中其实是可以获取argv数组中的内容的, 即`程序中是可以获取选项的内容的`既然能获取选项的内容, 那么也`就可以在程序中实现一些的功能对应特定的选项, 在用户选择特定的选项时, 程序可以做出不同的应答, 从而实现选择不同的选项 实现不同的功能！`

这不就是 Linux操作系统中各种命令 以及 命令选项的实现方式吗？就像: `ls -l -a` 或 `rm -r -f` 等一样

有了 argc 和 argv, 我们也可以实现类似的命令行选项功能

比如, 下面这段代码: 

```cpp
#include <iostream>
#include <unistd.h>
#include <string.h>
using std::cout;
using std::endl;

int main(int argc, char *argv[]) {
	if(argc != 4) {         // 数组将会接收4个元素
         cout << "./myCalc [-a|-s|-m|-d] one_data two_data" << endl;     // a=add, s=sub, m=mul, d=div
         return -1;
     }
 
     int one_data = atoi(argv[2]);       // 后两个元素为计算数据
     int two_data = atoi(argv[3]);
 
     if(strcmp("-a", argv[1]) == 0) {
         cout << one_data << " + " << two_data << " = " << one_data + two_data << endl;
     }
     else if(strcmp("-s", argv[1]) == 0) {
         cout << one_data << " - " << two_data << " = " << one_data - two_data << endl;
     }
     else if(strcmp("-m", argv[1]) == 0) {
         cout << one_data << " * " << two_data << " = " << one_data * two_data << endl;
     }
     else if(strcmp("-d", argv[1]) == 0) {
         if(two_data != 0) {
             cout << one_data << " / " << two_data << " = " << one_data / two_data << endl;
         }
         else {
             cout << "two_data is wrong" << endl;
         }
     }
     else {
         cout << "./myCalc [-a|-s|-m|-d] one_data two_data" << endl;
         return -1;
     }

	return 0;
}
```

此代码编译链接出来的程序, 是一个简单的命令行版的整数加减乘除计算器: 

可以做到以下功能: 

1. 使用 : `./程序 [-a|-s|-m|-d](加减乘除) 数据1 数据2`
2. 当输入出错时, 会提醒使用方法:  `./myCalc [-a|-s|-m|-d] one_data two_data`
3. 简单的整数加减乘除

## main()函数第三个参数 env 

main()函数的第三个参数为: `char *env[]`, 也是一个指针数组

所以, 把 main()函数的三个参数都明示出来, main()函数就是这样定义的: `int main(int argc, char *argv[], char *env[])`

看到第三个参数的参数名, 一定就能想到 `此参数与环境变量有关`, 因为 Linux中env的作用就是将当前系统的环境变量列出来

事实也确实如此, 这 `env数组, 其实就是接收环境变量用的, 即env就是一张环境变量表`, 数组中每个元素存储的都是环境变量, 且存储顺序与使用env命令时列出的顺序相同, 类似这样: 

![|inline](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722160602833.webp)

即env数组中的最后一个元素为NULL, 所以可以直接for循环 以遇到到NULL为结束条件 进行数组遍历: 

![](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722160605977.webp)

### C/C++ 获取环境变量

上面使用main()函数的第三个参数, 来获取系统的环境变量是 `C/C++ 获取环境变量的第一种方法`

C/C++ 获取环境变量一共有三种方法: 

#### environ变量获取环境变量

environ是一个全局变量, 并且此全局变量没有在任何头文件中包含, 所以在使用此全局变量时 需要用 extern声明

`environ可以看作一个数组指针, 它指向了环境变量表, 即 environ指向了env这个指针数组`

使用它的方法, 与使用env数组的方法一致: 

```cpp
#include <iostream>
using std::cout;
using std::endl;

int main() {
	extern char **environ;
	for(int i = 0; environ[i]; i++) {
		cout << environ[i] << endl;
	}
	
	return 0;
}
```

#### 系统调用getenv()获取环境变量

getenv()是Liunx系统提供的系统调用: 

![](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722160608887.webp)

此函数调用的参数传入的是需要查找的函数变量的变量名, 即这部分等号左边的全大写字母的内容: 

![](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722160610624.webp)

将变量名字符串传入 getenv系统调用, 就可以获得对应环境变量的内容: 

```cpp
#include <iostream>
#include <stdlib.h>
using std::cout;
using std::endl;

int main() {
	char *Var = getenv("SHELL");
	cout << Var << endl;
	
	return 0;
}
```

![|large](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722160613105.webp)

## 获取环境变量的作用

介绍了三种C/C++获取环境变量的方法, 但是好像并没有什么意义. 好像用不太到.

其实 获取环境变量还是很有作用的, 其作用之一就是, `可以限制程序功能的使用对象`: 

```cpp
#include <iostream>
#include <stdlib.h>
#include <string.h>
using std::cout;
using std::endl;

int main() {
	char *User = getenv("USER");
	if(strcmp("July", User) == 0) {
		// 程序功能代码: ……
		cout << "可以执行" << endl;
	}
	else {
		cout << "用户错误" << endl;
	}
	
	return 0;
}
```

![|large](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722160615349.webp)

![|small](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722160617231.webp)

像这样, 在程序内部设置用户限制, 即使是root用户也无法突破限制

# * 为什么环境变量具有全局性

在回答这个问题之前, 先思考另外一个问题, `环境变量是谁给进程的？`

当我们运行自己的程序的时候, 我们可以发现此进程的父进程是zsh(bash)这类SHELL进程, 无论怎么运行、重新运行多少次, 进程的父进程永远都是SHELL进程: 

![|large](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722160619328.webp)

无论进程重新运行多少次, 变得永远都是PID, 而不是PPID, 除非SHELL进程也重新运行

其实还有一个细节: 当从命令行运行top时: 

![ ](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722160621745.webp)

运行 gdb时: 

![ ](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722160623594.webp)

或者运行其他程序时: 

![ ](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722160625657.webp)

![ ](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722160627376.webp)

可以发现, 只要是用命令行运行的进程, 其父进程一定是zsh(bash)这样的SHELL进程

而这些子进程都可以读取环境变量, 所以其实, `环境变量可以被子进程继承下去`, 也就是说 `子进程的环境变量来源于父进程`

就我们从命令行运行的进程来说, 这些进程的环境变量的来源都是SHELL进程

---

而SHELL进程的环境变量也来源于它的父进程, 这样一直往上推, 可以推到 1号进程: 

![|inline](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722160630095.webp)

但是暂且不论, 是否来源于1号进程

---

既然 `所有从命令行运行的进程的父进程都是SHELL进程, 而子进程可以从父进程继承环境变量, 意思就是环境变量可以从SHELL进程一直继承下去, 那么是不是就可以说环境变量拥有全局性呢？`

环境变量可以被子进程继承下去, 那么对应的`本地变量其实就是SHELL进程内部创建的变量, 也就不会被子进程继承下去.`

而不会被子进程继承下去, 是否就是env等命令无法查找到本地变量的原因呢？

答案是肯定的。

但如果是这样, 就又出现了另外一个问题: `既然本地变量不能被子进程继承, 那么为什么echo、set等命令, 又可以查找到本地变量？`

**`其实, Linux系统中的绝大部分命令都是以SHELL进程的子进程的形式运行的, 但是 就是存在那一小部分命令并不通过子进程的方式执行, 而是SHELL自己执行.`**

**`SHELL也是会调用自己的相应的函数来完成部分功能的, 我们把这种不通过子进程的形式执行的命令, 称为自建命令`**
