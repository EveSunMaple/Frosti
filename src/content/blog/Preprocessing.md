---
draft: true
title: "编译器的预处理是什么情况？"
pubDate: "2022-03-12"
description: "在C语言的代码编写中, 经常会见到的 #include #define #pragma 等写在整个代码文件开头的位置, 这些 拥有 # 且一般写在 代码开头的语句, 就是代码的 预处理指令"
image: https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/202306251811483.webp
categories: ['tech']
tags: ["C语言"]
---

# 预处理详解

在C语言的代码编写中, 经常会见到的 `#include ` `#define` `#pragma` 等写在整个代码文件开头的位置, 这些 拥有 `#` 且一般写在 代码开头的语句, 就是代码的 `预处理指令`。

## 预定义符号
预定义符号, 是 C语言标准 默认内置的宏定义符号。
可以直接被拿出使用。

C语言 默认的预定义符号有 5 个: 
```cpp
__FILE__  //进行编译的源文件文件名 (字符串)
__LINE__  //文件当前的行号 （整型）
__DATE__  //文件此次被编译的日期 （字符串）
__TIME__  //文件此次被编译的时间 （字符串）
__STDC__  //当编译器遵循ANSI C时, 其值为1, 否则未定义
```
用一段代码可以非常直观的表示出 这 5 个预定义符号的特点: 
```cpp
#include <stdio.h>

int main()
{
	FILE* pf = fopen("log.txt", "w");

	for (int i = 0; i < 5; i++)

	{
		fprintf(pf, "%s %s %s %d i=%d \n", __DATE__, __TIME__, __FILE__, __LINE__, i);
	}

	fclose(pf);
	printf("执行完成\n");

	return 0;
}
```
代码执行效果: 

![预定义符号 |inline](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/PRE-Symbols.webp)

![|huge](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/PRE-Symbols-Show.webp)

## #define

### 用#define定义 无参宏(标识符)
用 #define 来定义无参数的宏, 也被成为标识符, 是比较简单的

具体的使用, 比如: 
```cpp
#define Max 100
#define uchar unsigned char
#define TIME_PRINT printf("Today is %s.\n\
The time now is %s.\n", \
						   __TIME__, __DATE__)
```
这些被定义的 **宏** 在使用的时候, 是不需要输入参数的, 可以直接在代码编写中使用: 

![define-symbol-show |inline](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/PRE-define-symbol-show.webp)

截图, 使用 `uchar` 定义了 无符号字符类型变量 `c`
`c < 10`,  所以 `c` 被赋予 `Max`
然后使用 `TIME_PRINT` 来输出时间
> ```cpp
> #define TIME_PRINT printf("Today is %s.\n \
> 						   The time now is %s.\n", \
> 						   __TIME__, __DATE__)
> ```
>
> > 在这一句使用 #define 定义中, 第一个 `\n` 后的  ```\``` , 和 `,`  后的 ```\``` , 作用都是续行
> >
> > 如果需要被定义的指令过长, 可以分成几行写, 除了最后一行外, 每行的后面都加一个反斜杠, 作用是续行
>
> 宏的具体用途是: 
>
> 对于较长的固定的, 或需要重复使用的某句指令 或 内容, 用一个 自定义的标识符 来表示, 方便以后统一使用或修改。
>
> #define 定义标识符的规则就是:
>
> `#define + 自定义标识符 + 需要被自定义的内容`
>
> 或者通俗的说
>
> `#define + 新名字(自己起) + 旧名字(原来的)`
>
> 不过需要注意的是, 对于 `#define` 定义的使用, 最好不要在指令的末尾加 `;`
>
> 因为 `#define` 后第一个字符或字符串 之后的所有内容都是会在 编译和链接 的过程中 替换掉的
>
> 在 `#define` 指令的最后 加上 `;` , 如果不注意使用 标识符 的话, 就可能会造成不必要的错误。
### 用#define定义 有参宏

对于有参数的宏, 模样 与 使用方法 和函数十分的相似: 
执行以下代码, 对比以下: 

```cpp
#include <stdio.h>

#define ADD(x, y) ((x)+(y))

int Add(int x, int y)
{
	return x + y;
}

int main()
{
	int a = 20;
	int b = 30;
	printf("%d\n", ADD(a, b));
	printf("%d\n", Add(a, b));

	return 0;
}
```
![define_function-pk |inline](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/define_function-pk.webp)

结果是, `#define` 定义的 有参宏 与 自定义的函数, 都实现了两数相加的功能。

像这样, 对变量大小的相加、相减、比较等简单的代码执行,  有参宏 和 函数都可以实现, 不过可以明显地看出, 对于比较这些功能的实现, 宏的规模和执行, 都要比函数要优许多。
宏也可以实现, 一般函数实现不了的事情, 比如: 
> 当我们需要输出非常多类似这样的语句: 
> ```cpp
> the value of a = 1
> the value of b = 2
> the value of c = 3
> ```
> 每次输出, `=`  左右两边的输出值, 都会随着输出的 变量名 和 变量数值大小 改变
> 这种实现, 函数是实现不了, 或者说不容易实现
> 但, 这样的操作可以使用宏来实现

