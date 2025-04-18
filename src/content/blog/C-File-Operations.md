---
draft: true
title: "[C语言] C语言能对文件进行哪些操作？"
pubDate: "2022-03-02"
description: "文件按照功能, 区分为两类: 程序文件、数据文件"
image: https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/202306251812049.webp
categories: ['tech']
tags: ["C语言", "文件"]
---

# 文件操作

## 一. 文件的分类

文件按照功能, 区分为两类: 程序文件、数据文件

两种文件类型的区分是相对的, 并不是绝对的

1. 程序文件

   比如: 
   
   C语言的源程序文件( `.c` 为后缀的文件 )
   
   目标文件( 在Windows环境中 以 `.obj` 为后缀 )
   
   可执行程序文件( 在Windows环境中 以 `.exe` 为后缀 )
   
2. 数据文件

   数据文件的内容, 不一定是程序
   
   可以是程序运行时所需要读取、改变的数据

为什么说两种文件类型的区分是相对的？

> 比如: 
>
> 存在两个源文件`test1.c` `test2.c`
>
> 如果`test1.c`文件可以对`test2.c`文件中的数据进行读取等操作, 那么`test1.c`就是程序文件, `test2.c`就是数据文件

---

`PS: 以下讨论的均为数据文件`

## 二. 文件的操作

### 2.1  文件指针

在学习文件指针之前, 先介绍一个概念: 文件信息区

> 文件信息区:
>
> 在C语言中, 每次打开一个文件, 操作系统都会在内存中开辟一块区域来存放该文件的各种信息(比如文件名、文件的状态、文件的地址、文件的大小等)
>
> 这些信息都存放在一个结构体变量中, 此结构体变量的类型默认被系统声明为 `FILE`
>
> 所以, 被使用文件的文件信息区, 本质上就是一个`FILE` 类型的结构体变量
>
> 每当一个文件打开后, 计算机会自动根据文件的状态、情况自动生成一个`FILE`类型的结构体变量, 并存入该文件的各种信息
>
> `FILE` 类型的具体成员, 内容。在不同的编译器中是不完全相同的, 但是差别不大

我们使用`FILE`类型定义的结构体指针变量, 就是一个文件指针变量

```cpp
FILE* pf;	//pf 文件指针变量
```

定义`pf`是一个指向`FILE`类型数据的指针变量, 可以指向某个文件的文件信息区, 通过文件信息区中存放的信息可以进一步访问该文件

所以, **通过文件指针变量能够找到与其相关联的文件**



### 2.2  文件的打开与关闭

文件的打开操作及关闭操作, 需要使用两个函数 `fopen(文件打开函数)` 及 `fclose(文件关闭函数)`

#### `fopen()`

```cpp
FILE* fopen(const char *filename, const char *mode);
```

1. 第一个参数`filename`

    应该传入 需打开文件的文件名尽量详细需要打开的文件名, 如: `C:\\Program Files\\TEST.c`

    若只传入`TEST.c`, 只会默认打开(创建), 运行可执行程序时, 用户所在路径的 `TEST.c` 文件

2. 第二个参数 `mode`, 应该传入 表示文件打开模式（方式）的字符串

    具体的模式有:

    1. 表示读写权限的

        | 字符串 |  权限  |                             说明                             |
        | :----: | :----: | :----------------------------------------------------------: |
        | `"r"`  | `只读` |      只允许读取, 不允许写入. 文件必须存在, 否则打开失败      |
        | `"w"`  | `写入` |  若文件不存在, 则创建一个新文件; 若文件存在, 则清空文件内容  |
        | `"a"`  | `追加` | 若文件不存在, 则创建一个新文件; 若文件存在, 则将写入的数据追加到文件的末尾 |
        | `"r+"` | `读写` |       既可以读取也可以写入. 文件必须存在, 否则打开失败       |
        | `"w+"` | `写入` | 既可以读取也可以写入. 若文件不存在, 则创建一个新文件；若文件存在, 则清空文件内容 |
        | `"a+"` | `追加` | 既可以读取也可以写入. 若文件不存在, 则创建一个新文件; 若文件存在, 则将写入的数据追加到文件的末尾 |

    2. 表示读写方式的: 

        | 字符串 |         说明         |
        | :----: | :------------------: |
        | `"t"`  |  以文本文件方式读写  |
        | `"b"`  | 以二进制文件方式读写 |

    其实, 文件打开方式由 r、w、a、t、b、+ 六个字符拼成, 各字符的含义是: 

    - `r(read)`: 读取
    - `w(write)`: 写入
    - `a(append)`: 追加
    - `t(text)`: 文本文件
    - `b(binary)`: 二进制文件
    - `+`: 读取和写入

    且`mode`, 传参时, 读写权限和读写方式 是可以结合使用的, 但必须将 **读写方式** 放在 **读写权限** 的 **中间或者尾部**, 不过 **读写方式可以忽略不写**, 忽略的情况下, 默认为 `"t"`, 即默认以文本文件的方式进行读写

    > 读写权限 及 读写方式 的结合使用, 例:
    >
    > 读写方式放在读写权限的尾部 `"rt"`、`"rb"`、`"r+t"`、`"r+b"`、`"wt"`、`"w+b"`、`"at"`等等
    >
    > 读写方式放在读写权限的中间 `"rt+"`、`"rb+"`、`"wt+"`、`"wb+"`等等

`fopen`函数的返回值 是`FILE*`类型的, 返回的是所打开的文件的文件信息区的首地址, 所以需要用 `FILE*` 类型的指针变量接收, 然后可以通过此指针变量操作此文件信息。

#### `fclose()`

```cpp
int fclose(FILE* stream);
```

> 参数的类型是 `FILE*` 的指针变量, 此指针变量 需指向 已打开文件的文件信息区的地址
>
> 例如
>
> ```C
> #include <stdio.h>
> 
> int main () {
>  //打开文件
> 	FILE * pf = fopen ("test.txt","w");
> 	if (pf != NULL) {
> 	//文件操作
>   	//…………
>    	//关闭文件
> 		fclose (pf);
>  		pf = NULL;
>    	}
>     
> 	return 0;
> }
> ```
>

---



### 2.3  文件的顺序读写

#### 2.3.1 文件读写函数

|      功能      |  函数名   |                             函数                             |   适用于   |
| :------------: | :-------: | :----------------------------------------------------------: | :--------: |
|  字符输入函数  |  `fgetc`  |                  `int fgetc(FILE* stream);`                  | 所有输入流 |
|  字符输出函数  |  `fputc`  |              `int fputc(int c, FILE* stream);`               | 所有输出流 |
| 文本行输入函数 |  `fgets`  |      `char *fgets(char* string, int n, FILE* stream);`       | 所有输入流 |
| 文本行输出函数 |  `fputs`  |        `int fputs(const char* string, FILE* stream);`        | 所有输出流 |
| 格式化输入函数 | `fscanf`  | `int fscanf(FILE* stream, const char* format [, argument ]...);` | 所有输入流 |
| 格式化输出函数 | `fprintf` | `int fprintf(FILE* stream, const char* format [, argument ]...);` | 所有输出流 |
|   二进制输入   |  `fread`  | `size_t fread(void* buffer, size_t size, size_t count, FILE* stream );` |    文件    |
|   二进制输出   | `fwrite`  | `size_t fwrite(const void* buffer, size_t size, size_t count, FILE* stream );` |    文件    |

上面是对 打开的文件进行顺序读写时, 可用到的函数。

#### 2.3.2 单个字符读写

使用上边的函数, 尝试向文件中写入字符

##### `fputc()`

```C
#include <stdio.h>

int main() {
	FILE* pf = fopen("test.txt", "w");
	if (pf == NULL) {
		printf("打开文件失败\n");
        
		return 0;
	}
    
	fputc('c', pf);
    fputc('s', pf);
    fputc('b', pf);
    fputc('i', pf);
    fputc('t', pf);

	fclose(pf);
	pf = NULL;

	return 0;
}
```

我们使用`fputc` 函数成功在文件中写入了内容

![fputc_FILE |inline](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/file-fputc_FILE.webp)

不过这时候肯定会有疑惑, 比如: `fputc`不是字符输出函数吗？为什么能往文件中输入字符？ 

需要知道为什么, 就需要学习在文件操作中的以下两个概念:

> - 输入
>
>   在一般的认知中, 用键盘打字, 就算是输入了
>
>   但在文件操作中, 输入, 指 从键盘获取的内容 存入 内存中; 也可以指 文件中的内容 存入 内存中
>
>   输入的终点, 是内存, 而不是文件
>
>   ![input |wide](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/file-input.webp)
>
> - 输出
>
>   与输入相反, 在文件操作中, 把 内存中的数据 输出显示到 屏幕上, 或是 输出到 文件中, 这才是输出操作
>
>   所以, 用`fputc` 字符输出函数, 往文件中输入字符
>
>   ![output |wide](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/file-output.webp)

用`fputc`函数, 成功向文件中写入了字符, 那么如何向屏幕上输出字符呢？需不需要先类似打开文件的操作呢？

很显然不需要先打开屏幕什么的, 为什么呢？

在C语言程序运行时, 会默认打开三个流:

`stdin`: 标准输入流, 默认对应键盘

`stdout`: 标准输出流, 默认对应屏幕

`stderr`: 标准错误流, 默认对应屏幕

三个标准流, 都是`FILE*`类型的

当我们需要用`fputc` 函数, 向屏幕输出字符的时候, 只需要把目标文件地址改为 标准输出流 就可以了: 

```C
#include <stdio.h>

int main() {
	FILE* pf = fopen("test.txt", "w");
	if (pf == NULL) {
		printf("打开文件失败\n");
        
		return 0;
	}
    
	fputc('a', stdout);
    fputc('b', stdout);
    fputc('c', stdout);
    fputc('d', stdout);

	fclose(pf);
	pf = NULL;

	return 0;
}
```

![fputc_STDOUT](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/file-fputc_STDOUT.webp)

上面测试了`fputc` 输出字符函数, 那么怎么样使用输入字符函数将文件内的数据, 输入至内存中呢？

##### `fgetc()`

首先在`.c`源文件的路径下创建`test2.txt`文件, 并输入相应的内容:

```cpp
#include <stdio.h>

int main() {
    //以只读方式打开文件, 需要先创建文件
	FILE* pf = fopen("test2.txt", "r");
	if (pf == NULL) {
		printf("打开文件失败\n");
		return 0;
	}
	int ch;
    //将 fgetc 的返回值存入 ch, 再将 ch 内容输出
	ch = fgetc(pf);
	printf("%c\n", ch);

	ch = fgetc(pf);
	printf("%c\n", ch);

	ch = fgetc(pf);
	printf("%c\n", ch);

	ch = fgetc(pf);
	printf("%c\n", ch);

	fclose(pf);
	pf = NULL;

	return 0;
}
```

以上代码的运行结果如下(`test2.txt` 文件 在程序中被打开前 内容就为: `abcdefg`): 

![fgetc_FILE |inline](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/file-fgetc_FILE.webp)

将`fgetc`的返回值存入 **变量`ch`** 并输出, 屏幕上也输出了 `a` 、`b` 、`c` 、`d`

!!! 这也说明了, 如果读取成功, `fgetc`函数的返回值就是 读取到的字符的 `ASCII` 值

但是`ch`为什么不用`char`类型呢？读取的内容不是字符吗？用`char`类型的变量来接收也可以吗？

答案是不可以, 为什么？

![fgetc_RETURN |inline](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/file-fgetc_RETURN.webp)

在这句话中我们可以看出, `fgetc`将读取到的字符以`int`类型返回 或者 返回`EOF`, 表示读取错误 或 文件结尾

说明`fgetc`的返回值, 并不一定全都是 字符, 也有可能是 `EOF`, 所以我们要用`int`类型的变量接收

>  `fgetc`函数, 传参传入的是 需要被存放到内存中的 文件的数据 的地址
>
>  并且, 在程序执行时 屏幕上输出的内容是不同的, 这意味着 `fgetc` 函数读到的数据是不同的, 但传入的参数均为 **变量`pf`**, 这说明, `fgetc`函数会将传入的地址向后移动一位(移动到下一次需要读取的数据的地址)
>
>  然后, 上边使用`fputc`字符输出函数的时候, 每次传入的参数也是同一个变量, 但是输出的字符却不一样, 所以 `fputc`函数每次传入相同的函数进行调用, 也会将传入的地址向后移动一位, 以便下一次输出不覆盖之前的输出

---



#### 2.3.3 整行字符读写

对文件的内容一行一行的读写, 就需要用到这两个函数

##### `fputs()`

`fputs`函数 与 `fputc`函数的使用方法类似, 只不过本函数是输出一行, 而另一个是输出单个字符

以下示例:

```cpp
#include <stdio.h>

int main() {
	FILE* pf = fopen("test.txt", "w");
	if (pf == NULL) {
		printf("打开文件失败\n");

		return 0;
	}
	fputs("Hello Bit\n", pf);
	fputs("Great\n", pf);

	fclose(pf);
	pf = NULL;

	return 0;
}
```

![fputs_FILE |wide](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/file-fputs_FILE.webp)

同样的, 会改变传入的地址, 会将传入的地址 向后移动输出的字符串位数 位

##### `fgets()`

`fgets`函数的使用方法, 就与`fgetc`函数有很大的不同了。

```cpp
char* fgets(char* string, int n, FILE* stream);
```

三个参数分别代表: 

1. `string`: 需要输入的字符串地址
2. `n`: 需要输入到第几位
3. `stream`: 读取的文件的文件指针

使用方法如下: 

```cpp
#include <stdio.h>

int main() {
    // 程序运行前需要创建好 test2.txt, 并输入相应的内容
	FILE* pf = fopen("test2.txt", "r");
	if (pf == NULL) {
		printf("打开文件失败\n");
        
		return 0;
	}
    
	char ch[100] = { 0 };
	fgets(ch, 3, pf);
	printf("%s", ch);

	fgets(ch, 3, pf);
	printf("%s", ch);

	fclose(pf);
	pf = NULL;

	return 0;
}
```

![fgets_FILE |wide](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/file-fgets_FILE.webp)

`fgets`函数可以 自定义每次输入的字符长度 , 即 第二个参数 减 1

并且, 每次输入到内存中, 如果传参不变, 会将已经输入到内存中的数据覆盖

![fgets_MEMORY |wide](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/file-fgets_MEMORY.webp)

若, 传参大于文件中数据的长度, 则输入完整

`fgets(ch, 3, pf);`  >>>>>>  `fgets(ch, 100, pf);`

![fgets_FLIE_LONGTH |wide](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/file-fgets_FLIE_LONGTH.webp)

#### 2.3.4 格式化数据读写

这里的这个格式化, 不是格式化清空的意思, 而是 有一定格式的数据, 就是格式化数据. 比如, 结构体等自定义类型

格式化的读写, 需要用到这两个函数`fscanf 格式化输入函数` 和 `fprintf 格式化输出函数` 

这两个函数, 与scanf` 和 `printf`长得很像

其实不仅长得像, 用法也很类似: 

##### `fprintf()`

用结构体来举例: 

```cpp
#include <stdio.h>

struct student {
	char name[20];
	int age;
	char sex[10];
};

int main() {
    struct student xxs = {"July", 20, "male"};
    
    FILE* pf = fopen("test.txt", "w");
    if(pf == NULL) {
        printf("文件打开失败\n");
        return 0;
    }
    
    fprintf(pf, "%s %d %s", xxs.name, xxs.age, xxs.sex);

    fclose(pf);
    pf = NULL;

    return 0;
}
```

程序运行结果如下: 

![fprintf_FILE |wide](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/file-fprintf_FILE.webp)

同样的, 可以将文件指针改为 标准输出流 将内存中的数据输出到 屏幕上, 这里就不演示了

##### `fscanf()`

>还是用结构体来举例, 不过这次是将文件中的数据存入内存中: 
>
>```C
>#include <stdio.h>
>
>struct student {
>    char name[20];
>    int age;
>    char sex[10];
>};
>
>int main() {
>    struct student xxs = { 0 };
>    
>    FILE* pf = fopen("test2.txt", "r");
>    if(pf == NULL) {
>        printf("文件打开失败\n");
>        return 0;
>    }
>    
>    fscanf(pf, "%s %d %s", xxs.name, &(xxs.age), xxs.sex);
>    printf("%s %d %s", xxs.name, xxs.age, xxs.sex);
>
>    fclose(pf);
>    pf = NULL;
>
>    return 0;
>}
>```
>
>程序运行结果如下: 
>
>![fscanf_FILE |wide](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/file-fscanf_FILE.webp)

通过两个例子可以看出, `fprintf` 和 `fscanf`两个函数, 可以对内存或者文件中的 格式化的数据 进行读写的操作

并且, 两个函数的的使用方法与`printf` `scanf`两个函数的使用方法 十分的相似

#### 2.3.5 二进制读写

二进制的读取和写入, 顾名思义, 就是将数据从内存以二进制的形式输出到文件（写入文件）, 或者将二进制的数据从文件中写入到内存（读取文件）

##### `fwrite()`

```C
size_t fwrite(const void* buffer, size_t size, size_t count, FILE* stream );
```

`fwrite` 函数, 数据从内存以二进制的形式输出到文件（写入文件）

此函数的参数表示的是: 

1. `const void* buffer`: 需要输出到文件的数据
2. `size_t size`: 需要写入的数据的类型（大小）
3. `size_t count`: 需要写入的数据的个数
4. `FILE* stream`: 文件流

二进制输出示例: 

```cpp
#include <stdio.h>

struct Stu {
	char name[20];
	int age;
	char sex[10];
};

int main() {
	struct Stu stu[3] = { {"CSDN", 15, "Not"}, {"July", 19, "Male"}, {"Three", 20, "Male"} };
    
	FILE* pf = fopen("data.txt", "wb");		//以二进制输出形式打开文件（写入文件的形式）
	if (pf == NULL) {
		printf("打开文件失败\n");
        
		return 0;
	}
    
	fwrite(&stu, sizeof(struct Stu), 3, pf);

	fclose(pf);
	pf = NULL;

	return 0;
}
```

![fwrite_FILE |wide](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/file-fwrite_FILE.webp)

文件以记事本打开, 发现数据存在乱码, 那么究竟是不是二进制数据呢？

![fwrite_READ |wide](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/file-fwrite_READ.webp)

以二进制编辑器打开, 可以发现确实是二进制数据

##### `fread 二进制输入`

```C
size_t fread(void* buffer, size_t size, size_t count, FILE* stream);
```

二进制输入与二进制输出相反, 可以将文件中的二进制数据, 输入到内存中（读取文件中的二进制数据）

`fread` 函数的参数表示的是: 

1. `void* buffer`: 需要输入内存的地址
2. `size_t size`: 读取的文件中的数据的类型的大小
3. `size_t count`: 读取的数据的个数
4. `FILE* stream`: 需要读取的文件流

二进制输入（读取二进制数据）的示例: 

```cpp
#include <stdio.h>

struct Stu {
	char name[20];
	int age;
	char sex[10];
};

int main() {
	struct Stu stu[3] = {0};
    
	FILE* pf = fopen("data.txt", "rb");		//以二进制输入形式打开文件（读取文件的形式）
	// 打开的文件就是 上边的示例文件
	if (pf == NULL)
	{
		printf("打开文件失败\n");
        
		return 0;
	}
    
	fread(&stu, sizeof(struct Stu), 3, pf);

	printf("%s %d %s\n", stu[0].name, stu[0].age, stu[0].sex);
	printf("%s %d %s\n", stu[1].name, stu[1].age, stu[1].sex);
	printf("%s %d %s\n", stu[2].name, stu[2].age, stu[2].sex);

	fclose(pf);
	pf = NULL;

	return 0;
}
```

![fread_FILE |wide](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/file-fread_FILE.webp)

---

介绍过这些对文件顺序读写操作函数后, 可以发现 这些函数每执行一次, 文件指针 就会自然而然地按照排列顺序移动至下一个读写对象

这也就是为什么被称为顺序读写的原因

### 2.4  文件的随机读写

上面介绍的都是对文件进行顺序读写操作时, 能使用到的函数

被称为顺序读写操作, 是因为以上函数的每一次执行, 文件指针就会 按顺序移动至下一个需要读写对象

那么, 随机读写又是因为什么呢？

这里的随机并不是不可定的意思, 而是 **不用按照顺序的的意思**

#### 2.4.1 定位(指定)文件指针

##### `fseek()`

```C
int fseek(FILE *stream, long offset, int origin);
```

`fseek` 函数的功能是, 根据文件指针 的位置和偏移量 来定位文件指针（或 通过给定文件指针 的位置和偏移量 来指定文件指针的位置）

本函数的参数含义是: 

1. `FILE *stream`: 文件流

2. `long offset`: 偏移量

    就是需要指定 文件指针 从初始位置偏移的位数

3. `int origin`: 文件指针 开始偏移的初始位置

    此参数 C语言 给定了三个宏: 

    > **SEEK_CUR**
    >
    > 文件指针当前在文件流内容中的位置
    >
    > 即 不改变文件指针的位置, 使文件指针 **从当前位置** 开始偏移
    >
    > **SEEK_END**
    >
    > 此文件流内容的末尾
    >
    > 即 将文件指针指向文件流内容的末字符之后, 使文件指针 **从文件流内容的末位** 开始偏移
    >
    > **SEEK_SET**
    >
    > 此文件流内容的开始
    >
    > 即 将文件指针指向文件流内容的首位, 使文件指针 **从文件流内容的首位** 开始偏移

`fseek`函数到底如何使用呢？具体作用究竟是什么呢？: 

>首先, 我们先创建一个文件（我这里路径是 `D:\TEST.txt` ）, 并输入内容
>
>![fseek_TEST |inline](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/file-fseek_TEST.webp)
>
>当我们不使用 `fseek` 函数时, 
>
>```C
>#include <stdio.h>
>#include <string.h>
>#include <errno.h>
>
>int main() {
>	FILE* pf = fopen("D:\\TEST.txt", "r");
>	if (pf == NULL) {
>		printf("fopen::%s", strerror(errno));
>		return 0;
>	}
>    
>	int ch = 0;
>	for (int i = 0; i < 10; i++) {
>        // 进行 10 次循环 
>		ch = fgetc(pf);
>		printf("%c\n", ch);
>	}
>
>	fclose(pf);
>	pf = NULL;
>
>	return 0;
>}
>```
>
>这段代码的运行结果是:  
>
>![|wide](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/file-fseek_NOFSEEK.webp)
>
>此时, 文件指针应该在 文件内容的 `k` 字符上
> 
>如果再使用`ch = fgetc(pf)`, 并输出`ch`存入的字符, 将输出`k`
>
>但是, 如果这时候我们使用 `fseek` 函数, 就可以将文件指针定位到文件内容的其他地方, 使文件指针指向的文件内容改变: 
>
>```C
>#include <stdio.h>
>#include <string.h>
>#include <errno.h>
>
>int main() {
>    FILE* pf = fopen("D:\\TEST.txt", "r");
>    if (pf == NULL) {
>        printf("fopen::%s", strerror(errno));
>        return 0;
>    }
>
>    int ch = 0;
>    for (int i = 0; i < 10; i++) {
>        // 进行 10 次循环 
>        ch = fgetc(pf);
>        printf("%c\n", ch);
>    }
>
>    fseek(pf, 10, SEEK_CUR);	//使文件指针, 从当前位置向后偏移 10 个字符
>    //fseek(pf, 15, SEEK_SET);	//使文件指针, 从文件内容的首位, 向后偏移 15 个字符
>    //fseek(pf, -5, SEEK_END);	//使文件指针, 从文件内容的末字符之后, 向后偏移 -5 个字符（向前偏移 5 个字符）
>
>    ch = fgetc(pf);
>    printf("ch = %c\n", ch);
>
>    fclose(pf);
>    pf = NULL;
>
>    return 0;
>}
>```
>
>`fseek` 函数, 三次使用的运行结果 分别为: 
>
>1. `fseek(pf, 10, SEEK_CUR);`
>
>    ![fseek_SEEK_CUR |wide](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/file-fseek_CUR.webp)
>
>    文件指针从当前位置向后偏移 10 个字符, 到 `u` 
>
>2. `fseek(pf, 15, SEEK_SET);` 
>
>    ![fseek_SEEK_SET |wide](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/file-fseek_SET.webp)
>
>    文件指针从文件内容的首位, 想后偏移 15 个字符, 到 `p`
>
>3. `fseek(pf, -5, SEEK_END);` 
>
>    ![fseek_SEEK_END |wide](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/file-fseek_END.webp)
>
>    文件字符从文件内容的末字符之后, 向 前 偏移 5 个字符, 到 `v`

---

#### 2.4.2 获取偏移量

因为对文件进行随机读写操作 可能造成操作者不知道 文件指针此时的位置

所以为了能够确定 文件指针此时指向的位置, 就可以使用 `ftell` 函数

##### `ftell()`

`ftell` 函数, 可以返回 文件指针相对于文件内容初始位置 的偏移量

```C
long ftell(FILE *stream);
```

`ftell` 函数没有什么需要特别注意的地方, 了解一下如何使用就足够了: 

> ```C
> #include <stdio.h>
> #include <string.h>
> #include <errno.h>
> 
> int main() {
> 	FILE* pf = fopen("D:\\TEST.txt", "r");
> 	if (pf == NULL) {
> 		printf("fopen::%s", strerror(errno));
> 		return 0;
> 	}
>     
> 	int ch = 0;
> 	ch = fgetc(pf);
> 	printf("%c\n", ch);
> 
> 	ch = fgetc(pf);
> 	printf("%c\n", ch);
> 
> 	long ret = ftell(pf);
> 	printf("%ld\n", ret);
> 
> 	fclose(pf);
> 	pf = NULL;
> 
> 	return 0;
> }
> ```
> 
> 上述代码的运行结果: 
>
> ![ftell_FILE |wide](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/file-ftell_FILE.webp)
>
> 两次 `fget(pf)` 之后, 计算偏移量 为 `2`;

#### 2.4.3 返回初始位置

##### `rewind()`

```C
void rewind(FILE *stream);
```

`rewind` 函数可以将 文件指针 重新指向 文件内容的初始位置

> ```cpp
> #include <stdio.h>
> #include <string.h>
> #include <errno.h>
> 
> int main() {
> 	FILE* pf = fopen("D:\\TEST.txt", "r");
> 	if (pf == NULL) {
> 		printf("fopen::%s", strerror(errno));
>         
> 		return 0;
> 	}
>     
> 	int ch = 0;
> 
> 	ch = fgetc(pf);
> 	printf("%c\n", ch);
> 
> 	ch = fgetc(pf);
> 	printf("%c\n", ch);
> 
> 	long ret = ftell(pf);
> 	printf("%ld\n", ret);
> 
> 	rewind(pf);
> 	ret = ftell(pf);
> 	printf("%ld\n", ret);
> 
> 	fclose(pf);
> 	pf = NULL;
> 
> 	return 0;
> }
> ```
>
> 代码运行结果: 
>
> ![rewind_FILE |wide](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/file-rewind_FILE.webp)

---

以上就是部分的文件操作函数, 并不是全部的文件操作函数, 但是文件操作函数就只介绍到这里

~~传统功夫, 以点到为止~~

如果想要了解 学习更多的 文件操作函数, 可以参考 `Win32 API` 或者 [Cplusplus](http://cplusplus.com/) 等网站自行学习 
