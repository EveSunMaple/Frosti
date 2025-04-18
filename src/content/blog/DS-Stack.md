---
draft: true
title: "[数据结构] 栈 详解"
pubDate: "2022-05-07"
description: "本篇文章来介绍一下 栈 这种数据结构"
image: https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/Stack_Cover.webp
categories: ['tech']
tags: ["数据结构", "栈"]
---

# 引言

数据结构中有 `四大基础结构` , 即 `四大线性表`: 顺序表、链表、**`栈`**、队列

被称为线性表是因为, 数据用以上四种结构存储, 在逻辑结构上都是 `在一条线上相邻连续的`

| 线性结构 | 逻辑结构图示:                                                |
| :------- | :----------------------------------------------------------- |
| 顺序表   | <img src="https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/SeqList_photo.webp" style="zoom:67%;" /> |
| 链表     | <img src="https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/List_photo.webp" style="zoom:62%;" /> |
| **`栈`** | <img src="https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/Stack_photo.webp" style="zoom:67%;" /> |
| 队列     | <img src="https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/Queue_photo.webp" style="zoom:67%;" /> |

前面已经介绍了前两个: `顺序表` 和 `链表`

本篇文章就来介绍一下 `栈` 这种数据结构。

# 栈

## 什么是栈

前几篇文章介绍的 `顺序表` 和 `链表` 都属于比较自由的数据结构, 没有限制存入数据应该从哪里存入

但是, `栈` 就不一样了

`栈` 规定 只能从固定的一端 `入数据(存放数据)`, `出数据(删除数据)`, 并称这一端为 `栈顶`。另一端称为 `栈底`

而 `入数据(存放数据)` 的操作, 通常被称作: `压栈`

`出数据(删除数据)` 的操作, 通常被称为: `出栈`

也就是说, `压栈` 和 `出栈` 都是从 `栈顶` 进行操作的

> 数据结构中的 `栈` 与 操作系统中的 `栈`, 本质上是完全不同的, 相同的 只有 `名字` 及 `创建销毁（出入数据）顺序`
>
> 操作系统中的 `栈`, 如果调用函数, 创建栈帧是从栈顶创建的, 销毁栈帧也是从栈顶销毁的
>
> 详情可阅读博主本篇文章: [【程序员的自我修养】[动态图文] 超详解函数栈帧](https://humid1ch.cn/posts/Function-Stack-Frame)



`栈` 存放数据的方式就像 砌砖, 在 `不破坏结构` 的情况下只能这样 放 和 拿: 

![|inline](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/6929a33778e6355875037e2cade6f591.gif)

由图 可以看出 `栈` 是一种 `后进先出(LIFO)` 的数据结构, 即 最后放入的数据, 最先出来

基于这种 `只能从栈顶存入删除数据, 后进先出` 的规则, `栈` 结构的实现一般由 `数组` 来实现

>  当然也可以用 `链表` 进行实现, 不过 用单链表的话, 想要效率只能 `头插 头删`,  不便于理解；更复杂的链表的话, 会有多出的节点什么的也不方便。所以最好还是 `用数组实现栈`

```
以下 栈 也由 数组 实现
```

## 栈的结构

 `栈` 指定了 只能从栈顶进行 `压栈出栈` 的操作。所以结构内, 除数组之外, 还需要记录栈顶位置的变量

所以 `栈` 结构一般为: 

```cpp
typedef int StackDataType;

typedef struct Stack
{
	StackDataType *data;
	int Top;				//记录栈顶位置
	int Capacity;			//记录数组容量
}Stack;
```

> 这里注意: 
>
> `Top(记录栈顶位置)` 变量的初值一般有两种情况: `-1` 和 `0`
>
> `Top` 初值不同, 接口的实现 会有细微的差异: 
> 初值为 `-1`, `Top` 指向数组最后一个元素的位置；压栈时, `Top` 先加一, 再入数据
>
> ![ |wide](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/image-20220507160801719.webp)
>
> 初值为 `0`, `Top` 指向数组最后一个元素的下一位置；压栈时, 先入数据, `Top` 再加一
>
> ![ |wide](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/image-20220507160745124.webp)
>
> `并且, 由于 Top 有不同的情况, 与栈有关的操作最好使用已有接口进行`



## 栈的接口及实现

### 栈的常用接口

由于 `栈` 规定了 `入栈出栈` 的位置, 所以只有固定的 `压栈出栈` 操作, 不支持其他位置的插入

所以 `栈` 的接口一般有: 

> 1. 初始化 StackInit
> 2. 入栈 StackPush
> 3. 出栈 StackPop
> 4. 取栈顶元素 StackTop
> 5. 栈元素个数 StackSize
> 6. 判空 StackEmpty
> 7. 栈销毁 StackDestroy

### 初始化 `StackInit`

`Top` 初始化有两种情况, 这里选择 初始化为 `0`

```cpp
void StackInit(Stack *pst)
{
	assert(pst);
	
	pst->data = NULL;
	pst->Top = pst->Capacity = 0;
}
```

![ ](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/image-20220507173412153.webp)

### 入栈 `StackPush`

因为只有 压栈 时, 栈的容量可能会满, 所以就不需要单独写一个判断栈满的函数了

```cpp
void StackPush(Stack *pst, StackDataType x)
{
	assert(pst);

	if (pst->Top == pst->Capacity)		// 数组已满	扩容
	{
		int newCapacity = pst->Capacity == 0 ? 4 : pst->Capacity * 2;
		StackDataType *tmp = (StackDataType*)realloc(pst->data, sizeof(StackDataType)* newCapacity);
		if (tmp == NULL)
		{
			printf("realloc fail\n");
			exit(-1);
		}

		pst->data = tmp;
		pst->Capacity = newCapacity;
	}

	pst->data[pst->Top++] = x;
    /*	Top 初值为 -1
    psy->data[++pst->Top] = x;
    */
}
```

![ ](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/image-20220507174850928.webp)

### 出栈 `StackPop`

因为 由 `数组` 实现的栈, 开辟的空间是 `不能单独释放` 的。即: `出栈`, 不需要释放空间, 也不需要修改数据

所以 `出栈` 非常的简单！！

```cpp
void StackPop(Stack *pst)
{
	assert(pst);
	assert(pst->Top > 0);		//保证栈不为空
	/*	Top 初值为 -1
	assert(pst->Top > -1);
	*/

	--pst->Top;
}
```

因为, 在 `栈` 中是由 `Top` 来决定 `栈` 存放数据的数量的, 所以 `Top` 减小就代表 `有数据出栈`

### 取栈顶元素 `StackTop`

```cpp
// 取栈顶元素
StackDataType StackTop(const Stack *pst)
{
	assert(pst);
	assert(pst->Top > 0);	

	return pst->data[pst->Top - 1];
	/*	Top 初值为 -1
	return pst->data[pst->Top];
	*/
}
```

![|inline](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/image-20220507181738115.webp)

### 判空 `StackEmpty`

```cpp
// 判空
bool StackEmpty(const Stack *pst)
{
	assert(pst);

	return pst->Top == 0;
	/*	Top 初值为 -1
	return pst->Top == -1;
	*/
}
```

![|inline](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/image-20220507182200048.webp)

### 栈元素个数 `StackSize`

```cpp
int StackSize(const Stack *pst)
{
	assert(pst);

	return pst->Top;
	/*	Top 初值为 -1
	return pst->Top + 1;
	*/
}
```

![|inline](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/image-20220507182706721.webp)

### 栈销毁 `StackDestroy`

```cpp
void StackDestory(Stack *pst)
{
	assert(pst);

	free(pst->data);
	pst->data = NULL;
	pst->Capacity = pst->Top = 0;
}
```

![|inline](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/image-20220507183021201.webp)



---

至此, `栈` 的结构以及`常用接口`的 分析与实现 都已经完成了。

`栈结构及接口` 是非常简单的, 但是关于 `栈` 的题可能会很麻烦`(因为后进先出)`



# 结语

本篇文章 对 数据结构: `栈 结构及接口` 进行了 分析和实现。

但只是 由 `数组实现的栈`, 有兴趣可以 `用链表实现栈`

OK~ 本篇文章到此结束~ 

![|tiny](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/005PeXV6gy1grtp9ji59cg306r07iaf0.gif)
