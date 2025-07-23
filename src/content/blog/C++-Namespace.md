---
draft: true
title: "[C++] 带你理解 using namespace std;"
pubDate: "2022-05-19"
description: "本篇文章要涉及的内容, 就是理解 C++ 中 using namespace std; 的含义"
image: https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/202306251809044.webp
categories:
    - Blogs
tags:
    - C++
---

# 引言

本篇文章是 `C++系列` 的第一篇文章, 也就意味着 `C++系列` 开张了！~~我将其称之为 `大航海时代的开始！(bushi`~~

标题已经点明了本篇文章要涉及的内容, 就是理解 `C++ 中 using namespace std;` 的含义

---

在 `C语言` 中,  `同一个作用域中` 定义变量或初始化变量, 变量名是不可以相同的, 即 `不可以重定义变量 多次初始化变量`

![C语言重定义、多次初始化 |inline](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250711181045776.webp)

这是 C语言 中的规定, 但是这个规定 `过于死板` 

因为在一个项目开发中, 一个项目是由多个小组 `分组负责` 的, 不可能保证在定义某些函数、接口、结构的时候一定不相同

C语言因为这个规定, 就会造成: 如果存在命名相同, 那就只能留一个, 其他人都需要修改。

这在一般由多组负责的一个项目中, 是非常不合理的。



---

那么在 `C++` 中, 这个问题得到比较完美的解决: `namespace`

下面就介绍一些, `C++` 中的 `namespace` 是如何解决 `重定义` 这个问题的



# namespace

相信许多人在刚开始学习 `C++` 的时候, 一定很纳闷这是个什么东西: 

![|large](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250711181048864.webp)

这句话究竟是什么意思: `using` 是什么意思？`namespace` 是什么意思？`std` 又是什么意思？

这一句的使用, 其实与 `namespace` 有关

## 什么是namespace

`namespace` 在 `C++` 中被提出来, 用来解决 `C语言` 不能重定义的问题

`namespace` 被称为 `命名空间` , 使用时可以将其认为是一块单独开辟出的空间。这块空间内, 可以随意定义 变量、函数等。

## namespace(命名空间)定义及作用

定义一个命名空间非常的简单: 

```cpp
#include <iostream>

namespace July
{
	int J = 10;
	int U = 11;
}

int main()
{

	return 0;
}
```

这样就已经定义了一个 `命名空间` 了, 编译也不会出错。

但是命名空间有什么作用呢？

编译以下下面的代码: 

```cpp
#include <iostream>

namespace July
{
	int J = 10;
	int U = 11;
}

namespace July_
{
	int J = 20;
	int U = 21;
}

int J = 30;
int U = 31;
int main()
{

	return 0;
}
```

![ ](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250711181051864.webp)

编译也是没有错误的。这就说明, `命名空间内的变量` 是不会与 `命名空间外` 的 `其他同名变量` 冲突的。

这样就解决了, 在小组分工时可能存在的重定义的问题。只需要不同的小组 按需 `开辟命名空间` 就可以了。

> 命名空间内是可以嵌套命名空间的: 
>
> ```cpp
> namespace July
> {
> 	int J = 10;
> 	int U = 11;
> 	namespace July1
> 	{
> 		int J = 10;
> 		int U = 11;
> 		namespace July11
> 		{
> 			int J = 10;
> 			int U = 11;
> 		}
> 	}
> }
> ```
>
> 不同的命名空间内的变量都是相互隔离的。
>
> `PS: 同一个工程中的 同名的 命名空间 , 编译时编译器会将其合并为 一个命名空间` 

其实简单来看, `namespace` 命名空间作用就是 `将变量 或 函数等 规划到了不同的作用域` , 这样就起到了 将变量隔离的效果, 就不用再担心会有重定义的现象发生了。

命名空间怎么定义已经知道了, 定义之后, 怎么使用命名空间内的变量呢？

## namespace(命名空间) 使用

命名空间内容的使用, 有很多种方法: 

#### 1. 方法一: 

```cpp
#include <iostream>

namespace July
{
	int J = 10;
	int U = 11;
	namespace July1
	{
		int J = 10;
		int U = 11;
		namespace July11
		{
			int J = 10;
			int U = 11;
		}
	}
}

int main()
{
	printf("%d\n", July::J);
	printf("%d\n", July::July1::J);
	printf("%d\n", July::July1::July11::J);

	return 0;
}
```

![ |inline](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250711181054861.webp)

`命名空间` + `::` + `变量名`, 就是 使用命名空间内变量的最简单的用法。
使用嵌套的命名空间中的变量, 是这样的: `命名空间` + `::` + `(命名空间::) + 变量名`

> `::` :作用域限定符

#### 2. 方法二: 

除了在变量名之前添加 `命名空间`, 还可以直接将命名空间释放出来: 

```cpp
#include <iostream>

namespace July
{
	int J = 10;
	int U = 11;
	namespace July1
	{
		int L = 20;
		int Y = 21;
	}
}

using namespace July;

int main()
{
	printf("%d\n", July1::L);

	return 0;
}
```

![](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250711181057056.webp)

`using namespace July;` 之后, 使用 `July` 内的变量就不需要再变量前 加`July::`

> 文章读到这里, 再看这一句 `using namespace std;`
