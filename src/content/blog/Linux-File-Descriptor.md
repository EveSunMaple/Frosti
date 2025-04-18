---
draft: true
title: "[Linux] Linux下的文件操作 及 Linux文件描述符fd 详解: open()、close()、write()、read()、文件描述符底层..."
pubDate: "2023-03-27"
description: "理解了文件描述符, 其实就可以相当于理解了 Linux系统的关于内存文件系统的整个大致框架和逻辑"
image: https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/202306251757935.webp
categories: ['tech']
tags: ["Linux系统", "文件"]
---

在Linux操作系统中, `文件描述符`是一个至关重要的概念.

理解了文件描述符, 其实就可以相当于理解了`Linux系统的关于内存文件系统的整个大致框架和逻辑`

但是在介绍文件描述符之前, Linux关于文件还存在许多 概念和文件操作 的知识需要介绍一下, 就当作是为解释文件描述符所做的准备吧

---

# 文件的相关概念

## 文件

在介绍Linux操作系统的文件权限时, 提到过这个概念: `文件=文件内容+文件属性`

并且问了一个问题也做出了解答: `当一个文件的文件内容为空时, 此文件是否占用磁盘空间？`

这个答案是肯定的, 即使`文件的内容为空, 其实此文件也是占用磁盘空间的`, 因为文件并不只有内容, 文件还有属性

就像下面这个文件:

![ |large](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/image-20230315171754060.webp)

即使此文件没有所谓的文件内容, 但还存在文件属性: 

![ |huge](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/image-20230315172458395.webp)

使用 stat 命令可以直接查看文件的部分属性, 既然文件在磁盘中存在属性, 那么其在磁盘中就不会不占用空间

## 文件操作

既然 `文件=文件内容+文件属性`

那么文件操作实际上就是什么呢？

没错, `文件操作 = 文件内容操作 + 文件属性操作`

并且, 在进行文件内容的操作时, 往往会同时对文件的属性进行操作. 因为操作文件的内容势必需要打开文件、访问文件, 此时文件的访问时间也会被修改, 也就对文件的属性进行了操作. 

对文件属性的操作并不总是需要打开文件的. 在介绍Linux文件权限的时候, 我们可以直接使用 chmod命令 来修改不同用户对文件的权限

但是对于文件内容的操作, 其实`总是需要先打开文件`的.

那么我们常说的打开文件, 究竟是什么意思？

其实`打开文件的实际操作, 就是将文件的内容、文件的属性加载到内存中`, 当文件的内容、文件的属性被加载到内存中, 我们就称此文件被打开, 被打开的文件也被称为`内存文件`, 与之对应的, 没有被打开的文件, 可以被称之为磁盘文件

## 如何文件操作

在没有了解过操作系统的进程之前, 或许可以说文件操作是操作系统进行的

但是在了解过进程之后, 我们应该理解到 `文件的操作其实是由进程进行`的

为什么？

就拿c语言的文件操作来说, C语言提供了一些文件操作的接口: `fopen() fclose() fread() fwrite()……`

这些接口可以在我们编写C语言代码程序的时候使用, 当使用这些接口的代码被编译为可执行程序之后, 运行此程序就可以针对文件进行操作

而运行起来的程序实际上是什么？程序被加载到内存中之后, 进程就被创建了, 所以实际上 对文件进行一系列操作的执行者, 其实是进程

## 简单C语言文件读写操作

博主其实已经写了一篇有关C语言文件操作的文章. 但还是需要在此文章中再简单复习一下

C语言想要操作文件, 首先就需要使用fopen() 打开文件, 

```cpp
FILE *fopen(const char *path, const char *mode)
```

fopen的第一个参数传入的是需要打开文件的路径, 第二个参数则是打开文件的权限和方式: 

> 有表示读写权限的: 
>
> | 字符串 |  权限  |                             说明                             |
> | :----: | :----: | :----------------------------------------------------------: |
> | `"r"`  | `只读` |     只允许读取, 不允许写入。文件必须存在, 否则打开失败。     |
> | `"w"`  | `写入` |  若文件不存在, 则创建一个新文件；若文件存在, 则清空文件内容  |
> | `"a"`  | `追加` | 若文件不存在, 则创建一个新文件；若文件存在, 则将写入的数据追加到文件的末尾 |
> | `"r+"` | `读写` |       既可以读取也可以写入。文件必须存在, 否则打开失败       |
> | `"w+"` | `写入` | 既可以读取也可以写入。若文件不存在, 则创建一个新文件；若文件存在, 则清空文件内容 |
> | `"a+"` | `追加` | 既可以读取也可以写入。若文件不存在, 则创建一个新文件；若文件存在, 则将写入的数据追加到文件的末尾 |
>
> 还有表示读写方式的: 
>
> | 字符串 |          说明          |
> | :----: | :--------------------: |
> | `"t"`  |  以文本文件方式读写。  |
> | `"b"`  | 以二进制文件方式读写。 |
>
> 但是我们简单的复习, 就只考虑以文本文件方式读写, 不考虑二进制的方式

若是打开文件并向文件中写入内容, 执行下面这段代码: 

```cpp
#include <stdio.h>

int main() {
	FILE *pf = fopen("new_log.txt", "w+");

	fprintf(pf, "88888888888\n");

	fclose(pf);

	return 0;
}
```

### 文件创建位置

在编译执行之前, 先思考一个问题: 上面这段代码使用fopen打开文件时, 并没有指定打开文件的具体路径, `在保证之前没有此文件的时候, 打开的文件会在那里创建？`

会是在程序文件所在路径吗？

当我们执行之后, 可以发现: 

![|inline](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/image-20230315200421031.webp)

但是事实是这样的吗？

我们把生成的文件删除, 进入其他路径下执行~/myBlog/FileDescrip/newFile 可执行文件(即上述代码编译生成的可执行程序): 

![](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/image-20230315201218411.webp)

由此可见, 在`使用fopen()打开没有指定路径的文件时, 进程会在其运行的当前路径创建文件, 而不是在可执行程序文件的所在路径`

这是在了解了Linux进程之后回过头来再看C语言的文件操作, 可以发现的新的细节

### w写入规则

然后关于读写权限: 

当我们使用w相关权限来向文件中写入内容时: 

我们第一此插入 5 行数据: 

```cpp
#include <stdio.h>

int main() {
	FILE *pf = fopen("new_log.txt", "w+");
	
	int cnt = 5;
	while(cnt--) {
		fprintf(pf, "88888888888\n");
	}

	fclose(pf);

	return 0;
}
```

![ |large](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/image-20230315201827732.webp)

第二次只写入一行数据: 

```cpp
#include <stdio.h>

int main() {
	FILE *pf = fopen("new_log.txt", "w+");
	
	fprintf(pf, "88888888888\n");

	fclose(pf);

	return 0;
}
```

执行第二次的程序之后, 可以发现, 第一次写入的 5 行数据没有了: 

![ |large](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/image-20230315202014885.webp)

这说明, `使用w向文件中写入数据会先将文件中的原内容清除`

### a写入规则

在读写权限中, 除了`r+` `w` `w+` 之外, 还存在另两种写入权限 `a` `a+`

`a` `a+` 打开文件时的规则与 `w` `w+` 相同, 即 没有文件时创建文件. 

但是写入数据的规则有所不同

`w` 和 `w+` 写入的规则是, 先清空文件中原有的数据, 而 `a` `a+` 则是在文件的末尾除追加数据: 

再不删除上面的 new_log.txt 文件时, 执行下面这段代码: 

```cpp
#include <stdio.h>

int main() {
	FILE *pf = fopen("new_log.txt", "a+");
	
	fprintf(pf, "222\n");

	fclose(pf);

	return 0;
}
```

![ |huge](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/image-20230315202646301.webp)

可以看到, 在文件的原数据中, 又追加了指定数据.

而提到追加数据, linux操作系统中存在一个命令行符号操作: `追加重定向 >>`, 是否与`a+` 有相同的作用？

![ |inline](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/image-20230315203333678.webp)

好像是相同的作用

![](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/image-20230315204242618.webp)

### 模拟实现cat命令

简单的复习了C语言文件读写的操作之后, 在结合在Linux中的C语言的相关的知识

我们其实可以模拟实现一个 cat 的命令: 

```cpp
#include <stdio.h>

#define SIZE 1024

int main(int argc, char *argv[]) {
	if(argc != 2) {						// 执行程序时 之后没有跟随一个文件时
		printf("using: ./%s filename", argv[0]);
	}

	FILE *pf = fopen(argv[1], "r");		// 只读方式打开传入的文件
	
	char buffer[SIZE];
	while (fgets(buffer, sizeof(buffer), pf) != NULL) {			// 从打开的文件中读取文本写入到buffer数组中
		printf("%s", buffer);
	}

	return 0;
}
```

![ |huge](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/image-20230315205847970.webp)

## 系统级文件接口有关问题

1. 在Linux系统中, 我们向文件内写入数据, 本质上是否是向什么中写入数据？

	向文件写入数据, 本质上其实是`向磁盘中写入数据`, 因为文件没有打开时, 本质上还是在磁盘中存储的

2. 磁盘是硬件, 谁有资格向硬件中写入数据？

	只有作为软硬件的管理者`操作系统, 有资格向硬件中写入数据`

3. 那么我们在上层访问文件的操作, 是否可以绕开操作系统？

	上层访问文件的操作, `不可能绕开操作系统`, 访问文件本质上都是由操作系统操作的

4. 操作系统如何给上层用户提供访问文件的操作？

	操作系统可以给上层`提供系统调用`

5. 为什么C语言中没有见过也没有使用过系统调用？

	因为, C语言中的不管是文件操作, 还是某些流的操作, 都对系统调用进行了封装


​	

6. 为什么语言要对系统调用进行封装？

	首先, 原生的系统调用接口的使用并不是很简单的, 使用成本有点高(与封装后的接口相比)
	
	其次, 原生的系统调用接口并不具备跨平台的功能, `不同平台相同的功能的系统调用接口是不同的`, Windows、Linux、MacOS等都是不同的, 所以语言需要`对不同的平台的系统调用接口进行封装, 进而使语言具备跨平台的功能`

7. 封装如何解决不能跨平台的问题？

	以C语言为例, C语言的fopen()操作 实际上可能是将所有支持的平台的关于打卡文件的系统调用接口穷举了一遍, 并结合条件编译 使fopen()实现了跨平台的功能

8. 为什么要学习系统级的文件相关接口？

	首先, 系统级的相关接口比起每种语言的接口来说, 一定更接近系统底层, 可以更加了解底层
	
	其次, 学习系统调用之后, 对于各种语言的相关封装接口也可以有更加透彻的理解

# Linux系统文件接口

像C语言这样可跨平台的语言, 会对不同平台的系统接口进行封装, 下面我们就来介绍一下Linux系统中的文件系统接口

## Linux文件系统基本的接口

C语言中文件操作的函数都已`f`开头: `fopen()` `fclose()` `fread()` `fwrite()……`

而Linux中文件系统的基本接口名字, 其实就是C语言的文件操作接口去掉`f`: 

`open`

![Linux文件系统接口open()](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/image-20230316092323421.webp)

`close`

![Linux系统接口close()](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/image-20230316092524622.webp)

### open()

Linux操作系统提供的打开文件的系统接口是open, 并且有两个: 

```cpp
int open(const char* pathname, int flags);
int open(const char* pathname, int flags, mode_t mode);
```

> 许多人的第一个疑问就是, Linux的底层是C语言写的, C语言不是没有函数重载吗？
>
> 为什么Linux可以提供两个同名不同参数的系统调用？

这两个接口的第一个参数就不用多介绍了, `pathname 所需打开文件的所在路径`

第二个参数`flags` 需要传入的是什么呢？ `flags`需要传入的就是`打开文件的选项`, 就像`fopen()`中`w` `r` `a` 等

第三个参数`mode` 则是有关文件权限的参数. 在之前介绍Linux文件权限的文章中, 介绍过 Linux下创建文件, 系统会根据umask值来赋予新创建的文件一个默认的文件权限. 这个`mode`参数就是用来传入`打开文件需要修改成什么权限的数值`的

而`open()接口的返回值, 被称为文件描述符fd`, 可以看作表示一个打开的文件

`pathname文件及路径` 和 `mode权限` 没有太多需要注意的地方

我们先来重点介绍一下`flags`

#### flags参数

关于open()的flags的参数, Linux系统提供了很多: 

![](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/image-20230316095016678.webp)

这只是截出了一部分而已, 而我们需要重点介绍的只有几个: `O_RDONLY(只读)  O_WRONLY(只写)  O_RDWR(读写)  O_CREAT(创建)` 这几个一眼就可以看出用法

![](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/image-20230316095406553.webp)

这4个选项提供了不同的功能. 但是有一个问题, C语言的文件操作可以通过传入不同的字符串实现不同的功能`w 只写并可创建文件` `r 只读` `w+ 读写并可创建文件` `r+ 读写不创建文件` `……`, 并且C语言的fopen()也是对Linux系统中的open()做了封装的

但是Linux的系统调用open()的flags参数只能传入一个参数, 也没有可变参数的存在, Linux系统提供的选项也只有单独的功能, 要如何实现传入一个参数实现多重功能呢？

答案是, `位图`. flags参数其实需要采用位图的方式传参

也就是说, Linux操作系统为flags参数提供的各种选项其实是表示一个整数二进制不同的位. `一个整数的比特位表示flags参数中某个选项是否被选中`

举个例子吧, 就以这4个选项为例, `假设`这四个选项分别表示用一个整数的二进制的最低四位表示: 

00000000 00000000 00000000 `00000000`(高-低) int一共32位, 但4个选项一共占用4位, 所以下面只写最低8位

假设`O_RDONLY(只读)用最低位 第0位表示: 00000001, 十进制就是1`

`O_WRONLY(只写)则用第1位表示: 00000010, 十进制为2`

`O_RDWR(读写)用第2位表示: 00000100, 十进制为4`

`O_CREAT(创建)用第3位: 00001000, 十进制为8`

那么`当传入flags的整数的二进制位中, 其低四位中哪一位是1, 就表示对应的选项被选中`

不过在实际的使用过程中, 整数的二进制位中表示这4个选项的 `可能并不是最低的四位`: 

![ |inline](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/image-20230316132519502.webp)

此图是在Linux源码中截出来的, 在源码中 `这些选项其实就是2的次方倍的十进制数的宏定义`

在编写程序时, 包含完头文件之后, 可以直接使用这些宏定义

以下面代码为例: 

```cpp
#include <stdio.h>
#include <sys/types.h>
#include <sys/stat.h>
#include <fcntl.h>
#include <unistd.h>

int main() {
	int fd = open("newlog.txt", O_CREAT | O_WRONLY);			// 以只读方式打开newlog.txt 文件, 且若文件不存在, 则创建文件
	
	if(fd < 0) {
		perror("open");
	}

	return 0;
}
```

执行之后, 就可以看到 用户执行程序时所在的路径下会生成一个newlog.txt文件, 但是`此文件的权限非常的混乱`: 

![ |large](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/image-20230316153137899.webp)

我们此时使用的是只需要两个参数的open()接口, 打开的文件并不存在, 所以创建了一个新的文件

但是, 创建文件需要按照Linux文件的权限规则指定, 我们`没有指定创建的文件的权限, 所以创建出的文件的权限是混乱的`

其实, `open(const char* pathname, int flags)`, 这个只有两个参数的系统接口, 是打开已经存在的文件用的, 创建新文件需要使用另一个系统接口: 

```cpp
#include <stdio.h>
#include <sys/types.h>
#include <sys/stat.h>
#include <fcntl.h>
#include <unistd.h>

int main() {
	int fd = open("newlog.txt", O_CREAT | O_WRONLY, 0666);			// 以只读方式打开newlog.txt 文件, 且若文件不存在, 则创建文件
	
	if(fd < 0) {
		perror("open");
	}

	return 0;
}
```

![ ](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/image-20230316153809839.webp)

但是, 此时发现**`另外一个问题`**: 

我们创建文件传入的权限是: `0666`, 文件的权限应该是 `-rw-rw-rw-`, 为什么实际却是`-rw-rw-r--`?

其实是因为 `umask`

早在介绍Linux文件权限时就介绍过`umask`, 创建文件时, 操作系统会将`指定的权限 - umask`, 作为文件的实际权限

此时我们查看 umask, 可以发现: 

![ |medium](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/image-20230316154129597.webp)

我们传入的0666, 减去 002, 是 0664, 此数表示的文件权限也就是`-rw-rw-r--`

那么如何解决这个问题呢？

可以在程序创建文件之前, 使用umask()来创建一个属于此程序的umask(), 这时候进程再创建文件, 就会遵循进程内设置的`umask`创建文件

```cpp
#include <stdio.h>
#include <sys/types.h>
#include <sys/stat.h>
#include <fcntl.h>
#include <unistd.h>

int main() {
	umask(0);		// 设置进程umask为0
	int fd = open("newlog.txt", O_CREAT | O_WRONLY, 0666);			// 以只读方式打开newlog.txt 文件, 且若文件不存在, 则创建文件
	
	if(fd < 0) {
		perror("open");
	}

	return 0;
}
```
![ ](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/image-20230316154536719.webp)

> 进程创建文件时, 是否有必要重新设置umask值？
>
> 这个行为是有必要的, 重新给进程设置umask值可以`更加方便地指定创建文件时的文件权限`
>
> 其次, 还有可能此操作系统设置的默认umask值非常的离谱: 比如 `umask 666`
>
> 那么, 此时创建文件可能就会有无法想象的阻碍.

### close()

```cpp
int close(int fd);
```

C语言中, 关闭文件的接口叫做: `fclose()`, Linux系统提供的系统接口则叫做: `close()`

![](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/image-20230316160304610.webp)

`其用法与fclose()几乎一致, 只不过close()传入的是文件描述符, 即调用open()是接收的返回值`

### write()

```cpp
ssize_t write(int fd, const void* buf, size_t count);
```

![](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/image-20230316160822822.webp)

我们可以使用write()接口向文件中写入一些内容: 

```cpp
#include <stdio.h>
#include <sys/types.h>
#include <sys/stat.h>
#include <fcntl.h>
#include <unistd.h>
#include <string.h>

int main() {
	umask(0);
	int fd = open("newFile.txt", O_CREAT | O_RDWR, 0666);		// 以读写方式打开newFile.txt, 文件不存在则创建新文件
	if(fd < 0) {
		perror("open");
	}

	const char* buffer = "hello world, hello July\n";
	int cnt = 5;
	while (cnt--) {
		write(fd, buffer, strlen(buffer));
	}

	close(fd);

	return 0;
}
```

![ ](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/image-20230316162238611.webp)

### read()

Linux系统提供的读取文件的系统接口叫: `read()`

```cpp
ssize_t read(int fd, void *buf, size_t count);
```

![](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/image-20230317005642954.webp)

read()接口的使用并不难: 

```cpp
#include <stdio.h>
#include <sys/types.h>
#include <sys/stat.h>
#include <fcntl.h>
#include <unistd.h>
#include <string.h>

int main() {
	umask(0);
	int fd = open("newFile.txt", O_RDONLY);		// 以只读方式打开文件
	if(fd < 0) {
		perror("open");
	}

	// 从文件中读取内容写入buffer, 并输出
	char buffer[128];
	read(fd, buffer, sizeof(buffer)-1);
	printf("buffer: %s\n", buffer);

	close(fd);

	return 0;
}
```

执行上面这段代码的结果: 

![ |inline](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/image-20230317011650571.webp)

> `首先文件中要有内容`

### open()的flags参数——O_TRUNC

open()打开文件时, 并不只有`创建(O_CREAT)`和`读写(O_RDONLY、O_WRONLY、O_RDWR)`方式打开, `O_TRUNC`也是一个非常常用的选项

我们调用`open()`使用`O_WRONLY`打开文件并写入内容时, 文件的内容是如何写入的？

当前, 文件的内容是这样的

![ |large](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/image-20230316163648077.webp)

当编译运行下面这段代码: 

```cpp
#include <stdio.h>
#include <sys/types.h>
#include <sys/stat.h>
#include <fcntl.h>
#include <unistd.h>
#include <string.h>

int main() {
	umask(0);
	int fd = open("newFile.txt", O_CREAT | O_RDWR, 0666);		// 以读写方式打开newFile.txt, 文件不存在则创建新文件
	if(fd < 0) {
		perror("open");
	}

	const char* buffer = "66666666666";
	write(fd, buffer, strlen(buffer));

	close(fd);

	return 0;
}
```

此时进程再次在文件中写入数据, 结果是从文件开头开始一一覆盖之前的内容

![ |large](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/image-20230316163909761.webp)

而我们在使用 `fopen(), 并以w方式打开文件时, 会将文件原本的内容清空, 然后再在文件中写入数据`

`open()只用O_WRONLY`, 实现不了先清空文件内容, 而是需要在使用另一个选项 `O_TRUNC`

![ ](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/image-20230316164536999.webp)

```cpp
#include <stdio.h>
#include <sys/types.h>
#include <sys/stat.h>
#include <fcntl.h>
#include <unistd.h>
#include <string.h>

int main() {
	umask(0);
	int fd = open("newFile.txt", O_CREAT | O_RDWR | O_TRUNC, 0666);		// 以读写并清空原内容的方式打开newFile.txt, 文件不存在则创建新文件
	if(fd < 0) {
		perror("open");
	}

	const char* buffer = "66666666666\n";
	write(fd, buffer, strlen(buffer));

	close(fd);

	return 0;
}
```

![ |inline](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/image-20230316164908427.webp)

`O_TRUNC`的作用就是, `打开文件时, 先清空文件内容`.

### open()的flags参数——O_APPEND

C语言的打开文件的方式还有一种是追加写入`a` 和 `a+`

open()同样可以, 当open()的flags参数中传入`O_WRONLY | O_APPEND`时, 就可以使打开文件的方式变为追加写入: 

```cpp
#include <stdio.h>
#include <sys/types.h>
#include <sys/stat.h>
#include <fcntl.h>
#include <unistd.h>
#include <string.h>

int main() {
	umask(0);
	int fd = open("newFile.txt", O_CREAT | O_WRONLY | O_APPEND, 0666);		// 以只写并追加方式打开newFile.txt, 文件不存在则创建新文件
	if(fd < 0) {
		perror("open");
	}

	const char *buffer = "Hello world, hello July\n";
	write(fd, buffer, strlen(buffer));

	close(fd);

	return 0;
}
```

![ |inline](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/image-20230316170049613.webp)

> 只传入 `O_APPEND` 选项, 不传入 `O_WRONLY 或 O_RDWR` 是无法追加写入的, 因为没有写入打开

## fd文件描述符 *

上面介绍了Linux文件系统的最基础的系统接口: `open()` `close()` `write()` `read()`

并且, 在实例的代码中, 并没有解释open()的返回值是什么.

其实, open()的返回值就是`fd(file descriptor)文件描述符`, 以下简称fd

### 什么是文件描述符

open()接口所返回的fd, 其实就是`一个可以代表打开的文件的变量`

fd与C语言中fopen()返回的文件指针在功能上看起来十分相似, 但实际存在非常大的差别

要了解文件描述符, 需要**先看到文件描述符**: 

我们在打开文件时, 可以接收open()的返回值 来查看打开文件的fd是多少: 

```cpp
#include <stdio.h>
#include <sys/types.h>
#include <sys/stat.h>
#include <fcntl.h>
#include <unistd.h>

int main() {
	umask(0);
	int fda = open("newFile.txt", O_RDWR | O_CREAT, 0666);		// 以读写方式打开文件, 若文件不存在则创建文件
	int fdb = open("newFile.txt", O_RDWR | O_CREAT, 0666);		// 以读写方式打开文件, 若文件不存在则创建文件
	int fdc = open("newFile.txt", O_RDWR | O_CREAT, 0666);		// 以读写方式打开文件, 若文件不存在则创建文件
	int fdd = open("newFile.txt", O_RDWR | O_CREAT, 0666);		// 以读写方式打开文件, 若文件不存在则创建文件
	int fde = open("newFile.txt", O_RDWR | O_CREAT, 0666);		// 以读写方式打开文件, 若文件不存在则创建文件
	
	printf("fda: %d\n", fda);		// 输出打开文件的fd
	printf("fdb: %d\n", fdb);		// 输出打开文件的fd
	printf("fdc: %d\n", fdc);		// 输出打开文件的fd
	printf("fdd: %d\n", fdd);		// 输出打开文件的fd
	printf("fde: %d\n", fde);		// 输出打开文件的fd

	close(fda);
	close(fdb);
	close(fdc);
	close(fdd);
	close(fde);

	return 0;
}

```

多打开几个文件, 输出打开的文件的fd, 上述代码的执行结果是: 

![ |large](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/image-20230317014057011.webp)

可以看到, 当进程打开文件时, `打开文件的fd按照顺序从3~7递增`

看到结果, 可以得到关于进程打开文件的一部分规则: `打开文件时, 打开文件的fd按照打开文件的顺序递增`

但是这时, 就有一个问题了: **进程打开文件, 文件的fd为什么是从3开始的？有没有 2、1 或者 0？**

有0、1、2吗？实际上是有的.

Linux进程运行时会先打开三个文件: 

**`fd 0, 标准输入 –> 键盘`**

**`fd 1, 标准输出 –> 显示器`**

**`fd 2, 标准错误 –> 显示器`**

这三个文件并不难验证, 使用这段代码就可以验证进程是否会先打开0、1、2文件, 且0、1、2文件是否对应标准输入、标准输出、标准错误: 

```cpp
#include <stdio.h>
#include <sys/types.h>
#include <sys/stat.h>
#include <fcntl.h>
#include <unistd.h>
#include <string.h>

int main() {
	// 不手动打开任何文件
	
	// 从 fd=0 中, 读取数据并存储到buffer中
	char buffer[1024];
	read(0, buffer, sizeof(buffer)-1);

	// 分别向fd=1 和 fd=2 中写入数据
	write(1, buffer, strlen(buffer));
	write(2, buffer, strlen(buffer));

	return 0;
}
```

当你执行这段代码时, 此进程会从命令行接收输入的数据, 并输出两次: 

![fd012  |large](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/fd012.gif)

代码所编写的功能是: 从fd=0的文件中读取数据, 并将读取到的数据写入到fd=1和fd=2的文件中

那么一次输入, 两次输出就恰好可以说明, `0、1、2文件描述符, 分别属于标准输入、标准输出、标准错误`

> 而C语言的文件操作中, 同样存在三个文件指针变量: `stdin` `stdout` `stderr`, 同样可以通过这三个文件指针变量, 从命令行中读取数据, 并将数据输出到屏幕上
>
> 那么这两者之间是否存在一定的关系呢？
>
> 实际上, C语言中 `stdin` `stdout` `stderr` 三个文件指针变量, 就对应着操作系统层级的`标准输入、标准输出、标准错误`
>
> 只不过`C语言的文件操作接口认的是这三个文件指针变量`, 而`操作系统的文件操作接口则只认fd文件描述符`
>
> 而C语言的文件操作接口其实是封装了操作系统层级的文件操作接口. 那么C语言想要进行文件操作 也是必须要知道文件的fd的
>
> C语言中进行文件操作时, 都是使用`文件指针 FILE*`
>
> 而FILE在C语言中其实是一个结构体类型, 此结构体包含许多的成员, 其中`也包含着打开文件的fd`！
>
> ![|huge](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/image-20230317173724589.webp)
>
> 我们分别输出 stdin、stdout、stderr这三个FILE指针的_fileno: 
>
> ```cpp
> #include <stdio.h>
> 
> int main() {
> 	// C语言会默认打开 stdin, stdout, stderr
> 	printf("stdin-fd: %d\n", stdin->_fileno);
> 	printf("stdout-fd: %d\n", stdout->_fileno);
> 	printf("stderr-fd: %d\n", stderr->_fileno);
> 
> 	return 0;
> }
> ```
>
> ![|large](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/image-20230317173921857.webp)
>
> 可以看到, `stdin、stdout、stderr这三个FILE指针的_fileno分别是0、1、2, 对应着系统的进程默认打开的标准输入、标准输出、标准错误三个fd`
>
> > stdin、stdout、stderr这三个FILE指针指向的结构体变量的内容是不会改变的
>
> 所以C语言的文件操作接口, 其实是`从FILE*变量中获取打开文件的fd, 再调用系统接口`来完成的
>
> 即: 
>
> | 函数接口                         | 所需数据类型 |                    |
> | -------------------------------- | ------------ | ------------------ |
> | `fopen、fclose、fwrite、fread……` | `FILE*`      | FILE结构体中包含fd |
> | `open、close、write、read……`     | `fd`         |                    |

介绍了这么多内容, **`文件描述符究竟是什么？代表什么意思？`**

现在我们知道了, `进程打开文件的fd, 是从0开始按照打开文件的顺序依次递增的`

即: `0 1 2 3 4 5 6 7 8……` `从零开始的连续的递增整数`, 除此之外还在哪个地方出现过？

**`数组`**, 数组的下标就是从零开始的连续的递增整数

那么文件描述符表示的是数组的下标吗？

是的, **`文件描述符实际上就是某个数组的下标`**

---

上面的分析进程打开文件的规则时, 默认了`一个进程是可以打开多个文件的`. 而操作系统中又存在着许多的进程, 其实也就意味着 `操作系统中存在的大量的被打开的文件`

操作系统会对这些大量的被打开的文件进行统一的管理, 会将文件的所有属性描述在一个结构体中, 并将所有的描述着打开文件属性的结构体组织在一起进行管理. `就像管理进程实际上实在管理进程PCB一样, 操作系统管理文件其实实际上是在管理描述着文件属性的结构体`

在Linux系统中, 描述的打开文件 属性的结构体叫做: `struct file{};`, 每一个打开的文件都由这样一个结构体维护着, 且结构体之间会构成一个数据结构, 方便操作系统进行管理

即`打开的文件在操作系统中, 实际上都在一个数据结构中维护着`

若操作系统将这些数据结构以链表的形式连接起来维护, 那么就会存在这样一个维护打开文件的数据结构: 

![|medium](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/image-20230317100951611.webp)

当然操作系统维护文件结构体的数据结构可能并不是链表, 但是`操作系统一定会为文件结构体维护一个数据结构`

---

一个进程是可以打开多个文件的. 而进程的PCB描述着进程的所有属性, 其中必然描述着此进程打开的所有文件

Linux操作系统中, `进程PCB(struct task_struct)`中, 存储着一个 `struct file_struct* file` 成员, 是一个结构体指针

file指针指向一个 struct file_struct 结构体变量, 而此结构体变量中存储着一个 struct file* fd_array[] 指针数组

fd_array[] 指针数组中的每一个空间都存储着一个 struct file* 结构体指针, 指向一个打开的文件

总的来说 进程的PCB中有一个结构体指针变量 指向了一个结构体变量, 此结构体变量中存储着fd_array[]数组, fd_array[]中存储着 描述了打开文件属性的结构体的指针, 其实也就是指向了打开的文件

而 `fd_array[]数组的下标, 就是open()、close()等系统接口使用的fd文件描述符`. 文件操作的系统接口可以通过fd, 在fd_array[]数组中找到指定下标存储的指针 再找到指针指向的文件

图例说明: 

![](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/image-20230317104136819.webp)

**`即文件描述符fd本质上就是, fd_array[]数组中的下标, 此fd表示fd_array[fd]存储着打开文件的指针`**

#### 文件描述符相关源码

![ |inline](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/image-20230317113225739.webp)

## Linux下一切皆文件

我们上面详析分析介绍了, Linux操作系统文件接口的最重要的内容: `文件描述符`

但是还有其他疑问: 

进程打开文件, `操作系统会将打开的文件以结构体的形式维护起来`. 但是进程中默认的0、1、2文件分别对应着标准输入、标准输出、标准错误, 而`标准输入实际上一般指的就是键盘, 标准输出和标准错误一般指的就是显示器`

那么问题就是, **`键盘、显示器等这些都是硬件, 文件操作的系统接口都是根据fd来操作的, 难道这写硬件也被操作系统用struct file{}结构体维护吗？`**

这里就要提到一个抽象的说法: `Linux操作系统下, 一切皆文件`

什么叫Linux下一切皆文件？

Linux操作系统中, 不只磁盘中存储的传统意义上的文件被看作是文件, 其实`各种外设、I/O设备也被看作是文件`

> 不过在尝试理解I/O设备被看作是文件之前, 来思考一个问题: `C语言能否实现像C++中类一样的功能？`
>
> C++类与C语言中的结构体, 不考虑细节, 其实就只是**C++可以在类内定义函数, 而C语言只能定义变量**, 这样的区别
>
> C++的类可以通过对象调用属于此类的函数. 那么C语言有没有办法实现, 通过结构体变量调用指定功能的函数呢？有办法
>
> **`C语言可以在结构体内部定义函数指针变量, 使变量指向指定功能的函数, 从而可以看作实现了通过结构体变量调用结构体内部的函数`**
>
> Linux中, 操作系统会将文件以 struct file{} 结构体的形式维护起来, 而一个文件最常做的事情就是读写
>
> 那么file结构体中, 除了文件属性之外, 至少还需要描述文件的读写方法, 而C语言结构体内部不能定义函数
>
> 所以 file结构体中, 会用函数指针变量的形式将文件的读写方法描述起来: 
>
> ```cpp
> struct file{
>     // 文件属性
>     void (*read)(参数);
>     void (*write)(参数);
> }
> ```
>
> 当然, 这只是一个简单的例子, 只是介绍file结构体中可以描述文件的各种方法

我们的计算机中, 有着非常多的I/O硬件设备: 磁盘、键盘、显示器、网卡……

这些I/O设备想要与操作系统交换数据, 一定有它们自己的读写方式, 并且每种硬件的读写方式是独属于此硬件的

各硬件之间的结构不同, 读写方式当然不可能完全相同: 

![](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/image-20230317120605960.webp)

每种硬件都有其自己的读写方式, 那么当操作系统需要向这些I/O设备写入数据或需要从这些I/O设备中读取数据时, 操作系统会怎么做呢？

这些打开的I/O设备, 在操作系统中也会以struct file{} 结构体的形式维护着, 并且不同硬件的结构体中还会存在函数指针指向此硬件的各种方法: 

![](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/image-20230317122742943.webp)

所以, 其实`在Linux操作系统中, 不论是硬件还是程序或是普通的文本文件, 打开之后都会被操作系统以struct file{}结构体的形式 在某种数据结构中维护着`

即, **`Linux操作系统的内存文件系统会对 所有设备和打开的文件 以一个统一的视角进行组织和管理, 这就是 Linux下一切皆文件`**

Linux这种将一切设备和文件 都以一个统一的视角(file结构体) 进行组织和管理的做法, 被称为 `虚拟文件系统(VFS)`

---

当I/O设备也被当作文件维护, 那么进程在想要向设备中写入数据, 就可以在PCB中一层层找到fd, 然后再调用系统接口进行写入

### file结构体相关内容源码

![](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/image-20230317121809344.webp)



