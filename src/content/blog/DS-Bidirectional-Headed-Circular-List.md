---
draft: true
title: "[数据结构] 最复杂的链表结构？不, 是最方便的链表结构~ 带你领略双向带头循环链表的美~"
pubDate: "2022-05-04"
description: "本篇文章的的具体内容是 带 头结点的双向循环链表 接口的实现"
image: https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/Blog_SXDTXHLB_cover.webp
categories:
    - Blogs
tags:
    - 数据结构
    - 链表
---

# 引言

在 `数据结构与算法: 单链表篇` 的时候, 已经介绍了 `链表` 的多种结构 `(具体内容可以去单链表的那篇去看一下, 这里不再赘述)`

> [🌈【神秘海域】[动图] 掌握 单链表 只需要这篇文章~ 「超详细」](https://humid1ch.cn/posts/DS-Single-List)

而且呢, 也在单链表篇提到, 链表会详细介绍两种结构 : 

1. `不带头节点的单向非循环链表 (以下简称单链表)`
2. **`带 头节点的双向循环链表`**

本篇文章的的具体内容就是 **`带 头结点的双向循环链表`** 接口的实现



**`带 头结点的双向循环链表(以下简称带头双向循环链表)`** ~~`(好像也没多简)`~~  在结构上是 `最复杂` 的一种链表结构, 但是 在使用、实现时, 其实是 `最方便、最简单` 的一种链表结构

下面就就来详细介绍一下 **`带头双向循环链表 节点结构及接口`** 的实现: 



---

# 带头双向循环链表

`带头双向循环链表的结构` 示意图是这样的: 

![|inline](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/image-20220503180047664.webp)

## 节点结构

观察其结构, 实现过单链表之后, **`带头双向循环链表的节点`** 可以直接写出来了: 

```cpp
typedef int ListDataType;
typedef struct ListNode
{
	ListDataType val;
	struct ListNode *prev;
	struct ListNode *next;
}ListNode;
```

一个数据类型变量 `存放数据` , 一个结点指针 `存放下一节点地址`, 第二个结点指针 `存放前一节点地址`

## 接口及实现

**`带头双向循环链表`** 功能接口 与 `单链表` 的功能接口 基本一致: 

1. `ListInit`  链表初始化
2. `BuyListNode`  创建新节点
3. `ListPushBack`  链表尾插
4. `ListPopBack`  链表尾删
5. `ListPushFront`  链表头插
6. `ListPopFront`  链表头删
7. `ListFind`  查找节点
8. `ListInsert`  链表 `pos` 位置插入
9. `ListErase`  链表 `pos` 位置删除
10. `ListPrint`  链表打印
11. `ListDestroy`  链表销毁

### 链表尾插 `ListPushBack`

```cpp
void ListPushBack(ListNode *phead, ListDataType x);
```

这一次先不实现 `链表的初始化接口`,  直接实现一个尾插的接口: 

不过在实现尾插之前, 需要先实现 `BuyListNode 创建新节点` 接口: 

> ```cpp
> ListNode* BuyListNode(ListDataType x)
> {
> 	ListNode *newNode = (ListNode*)malloc(sizeof(ListNode));
> 	if (newNode == NULL)
> 	{
> 		printf("BuyListNode fail!\n");
> 		exit(-1);
> 	}
> 	// 节点赋值
> 	newNode->val = x;
> 	newNode->prev = NULL;
> 	newNode->next = NULL;
> 
> 	return newNode;
> }
> ```

**`带头双向循环链表`** 的尾插, 不需要像 `单链表` 那样找尾, 因为 头节点的 `prev` 节点就是链表的尾节点

所以可以在此基础上 直接进行尾插: 

![List_Push_Back |inline](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/List_Push_Back.gif)

代码实现即为: 

```cpp
// 带头双向循环链表 尾插
void ListPushBack(ListNode *phead, ListDataType x)
{
	assert(phead);

	ListNode *newNode = BuyListNode(x);
	ListNode *tail = phead->prev;				// 记录 头结点的prev节点

	newNode->prev = tail;
	tail->next = newNode;

	newNode->next = phead;
	phead->prev = newNode;
}
```

这就是 对一个有数据的链表尾插操作的接口 实现



### 链表初始化 `ListInit`

```cpp
void ListInit(ListNode *pphead);
ListNode* ListInit();
```

`单链表` 不需要初始化, 因为如果此结构的链表为空, 直接定义结点指针为空就可以了。

但是 **`带头双向循环链表`** 是需要初始化的, 不仅仅是因为 此结构存在一个头节点。

那么 **`带头双向循环链表`** 需要怎么初始化呢？

1. 首先一定是, 需要一个头节点
2. 其次, 虽然只有一个头节点, 但既然是 **`带头双向循环链表`** 那么 只有一个头节点也是因该是一个 `循环链表`

所以, 初始化应该有这两个功能: 

```cpp
void ListInit(ListNode **pphead)
{
	assert(pphead);

	*pphead = BuyListNode(0);
	(*pphead)->next = *pphead;
	(*pphead)->prev = *pphead;
}
```

这个初始化接口, 实现了 `定义一个头节点`  并 `将其设置为循环` 

>  实现的代码中, 需要注意的是: 
>
> 1. 因为需要改变参数原值, 所以需要传 `二级指针`
> 2. 头节点的 `数据变量` 最好不要存放任何有用数据, 所以可以随意传值
> 3. 由于 `操作符优先级` 的问题, `*pphead` 需要用 `()` 括起来

但是这样的初始化接口需要传入二级指针, 如果操作不当, 可能会操作不必要的麻烦

所以 **`带头双向循环链表`** 的初始化接口 还有另外一种直接 `不需要传参` 的写法: 

```cpp
ListNode* ListInit()
{
	ListNode *phead = BuyListNode(0);
	phead->next = phead;
	phead->prev = phead;
    
    return phead;
}
```

直接在函数内部 定义一个头节点, 然后作为返回值, 返回到调用的位置 用一个变量接收。

这两种方法没有优劣之分, 看使用习惯。`(以下均使用第二种)`



---

初始化之后的链表, 除了头节点之外是没有其他数据节点的。

那么在没有其他数据节点的情况下, 上面所写的尾插接口 还能成功实现功能吗？

调试分析: 

![ ](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/image-20220503220100159.webp)

![|inline](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/image-20220503224018491.webp)

光标进入 `尾插接口`: 

![ ](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/image-20220503220602287.webp)

光标继续移动, 将 `tail` 与 `newNode` 连接起来

![ ](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/image-20220503221543363.webp)

![|inline](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/image-20220503230829976.webp)

再将 `newNode` 与 `phead` 连接起来: 

![ ](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/image-20220503221910810.webp)

![|inline](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/image-20220503231509032.webp)

可以看到, 即使是 只有头节点, 尾插函数也可以成功发挥作用

尾插接口实现的时候 并没有主动考虑 `边界问题(即只有头节点)`, 不过 经过测试发现即使只有头节点也是可以成功操作的

这 其实是 **`带头双向循环链表`** 结构的优越带来的便利



### 链表尾删 `ListPopBack`

```cpp
void ListPopBack(ListNode *phead);
```

与 `尾插` 相似, 因为 结构的优秀, 所以 `尾删` 也不需要找尾, 可以直接在头节点进行操作

但是, 仍需要注意: 
在 `free` 之前, 一定要记录尾节点的前一节点, `不然无法将链表恢复成循环状态`
并且, 当链表 `只有头结点时, 不进行删除`

所以代码实现为: 

```cpp
void ListPopBack(ListNode *phead)
{
	assert(phead);
	if (phead->next == phead)
	{
		return;					// 防止只有头节点
	}

	ListNode *tail = phead->prev;
	ListNode *tailPrev = tail->prev;		//记录尾节点的prev 防止重找

	tailPrev->next = phead;
	phead->prev = tailPrev;

	free(tail);
	tail = NULL;
}
```



### 链表打印 `ListPrint`

```cpp
void ListPrint(ListNode *phead);
```

实现了简单的 `尾插尾删` 操作, 总要将链表中的数据打印出来

`链表打印` 没有什么需要注意的要点, 只需要注意一下 `打印结束的条件` 

代码实现: 

```cpp
void ListPrint(ListNode *phead)
{
	assert(phead);

	ListNode *tail = phead->next;		// 记录 phead 的 next
	while (tail != phead)//从 phead 的next 开始打印
	{
		printf("<-%d->", tail->val);
		tail = tail->next;
	}
	printf("\n");
}
```

用打印函数, 将上边的接口都验证一下: 

![|inline](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/image-20220504094219559.webp)

都可以正常发挥作用



### 链表的头插 `ListPushFron`t

```cpp
void ListPushFront(ListNode *phead, ListDataType x);
```

实现了 **`带头双向循环链表`** 的 `尾插` 和 `尾删`,  头插和头删自然也不在话下: 

```cpp
void ListPushFront(ListNode *phead, ListDataType x)
{
	assert(phead);

	ListNode *newNode = BuyListNode(x);
	ListNode *Next = phead->next;

	Next->prev = newNode;
	newNode->next = Next;

	newNode->prev = phead;
	phead->next = newNode;
}
```

![|inline](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/image-20220504161039016.webp)

### 链表尾删 `ListPopFront`

```cpp
void ListPopFront(ListNode *phead)
{
	assert(phead);
	assert(phead->next != phead);

	ListNode* Next = phead->next->next;
	free(phead->next);

	phead->next = Next;
	Next->prev = phead;
}
```

![|inline](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/image-20220504161411773.webp)

### 链表查找 `ListFind`

```cpp
ListNode* ListFind(ListNode *phead, ListDataType x);
```

`查找` 与 `单链表接口` 的查找的主体 其实一模一样

```cpp
ListNode* ListFind(ListNode *phead, ListDataType x)
{
	assert(phead);
	if (phead->next == phead)
	{
		return;
	}

	ListNode* cur = phead->next;
	while (cur != phead)
	{
		if (cur->val == x)
		{
			return cur;
		}

		cur = cur->next;
	}

	return NULL;
}
```

![|inline](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/image-20220504154331160.webp)



### 链表 pos 之前插入 `ListInsert`

```cpp
void ListInsert(ListNode *pos, ListDataType x);
```

在实现 `头插` 和 `头删`之前, 先来实现一下 `插入` 和 `删除`

在 `pos` 节点之前 插入非常的简单

```cpp
void ListInsert(ListNode *pos, ListDataType x)
{
	assert(pos);

	ListNode *newNode = BuyListNode(x);
	ListNode *posPrev = pos->prev;

	posPrev->next = newNode;
	newNode->prev = posPrev;

	newNode->next = pos;
	pos->prev = newNode;
}
```

 验证: 

![|inline](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/image-20220504155105531.webp)



插入实现之后, `链表的尾插` 和 `头插` 可以直接复用 `插入`

#### 尾插复用

```cpp
void ListPushBack(ListNode *phead, ListDataType x)
{
	assert(phead);

	/*ListNode *newNode = BuyListNode(x);
	ListNode *tail = phead->prev;

	newNode->prev = tail;
	tail->next = newNode;

	newNode->next = phead;
	phead->prev = newNode;*/
	
    ListInsert(phead, x);
}
```

#### 头插复用

```cpp
void ListPushFront(ListNode *phead, ListDataType x)
{
	assert(phead);

	/*ListNode *newNode = BuyListNode(x);
	ListNode *Next = phead->next;

	Next->prev = newNode;
	newNode->next = Next;

	newNode->prev = phead;
	phead->next = newNode;*/
    ListInsert(phead->next, x);
}
```



### 链表 pos 节点删除 `ListErase`

```cpp
void ListErase(ListNode *pos);
```

删除也非常的简单, 但是要注意的是: 

> 在删除 `pos` 节点之前, 将其 `prev` 与 `next` 节点 记录, 或者在 `free(pos)` 之前, 将其 `prev` 与 `next` 节点相连接

```cpp
void ListErase(ListNode *pos)
{
	assert(pos);

	ListNode* posPrev = pos->prev;
	ListNode* posNext = pos->next;

	free(pos);
	pos = NULL;

	posPrev->next = posNext;
	posNext->prev = posPrev;
}
```

![|inline](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/image-20220504155752938.webp)

`删除`实现之后, `尾删` 和 `头删` 也可以直接复用: 

#### 尾删复用

```cpp
void ListPopBack(ListNode *phead)
{
	assert(phead);
	if (phead->next == phead)
	{
		return;					// 防止只有头节点
	}

	/*ListNode *tail = phead->prev;
	ListNode *tailPrev = tail->prev;		//记录尾节点的prev 防止重找

	tailPrev->next = phead;
	phead->prev = tailPrev;

	free(tail);
	tail = NULL;*/
    
    ListErase(phead->prev);
}
```

#### 头删复用

```cpp
void ListPopFront(ListNode *phead)
{
	assert(phead);
	assert(phead->next != phead);

	/*ListNode* Next = phead->next->next;
	free(phead->next);

	phead->next = Next;
	Next->prev = phead;*/
    
    ListErase(phead->next);
}
```

### 链表销毁 `ListDestroy`

```cpp
void ListDestroy(ListNode *phead);
```

销毁 **`带头双向循环链表`** , 有一点需要注意: 

> 最好 `最后销毁头节点`

```cpp
void ListDestroy(ListNode *phead)
{
	assert(phead);

	ListNode *cur = phead->next;
	while (cur != phead)
	{
		ListNode *Next = cur->next;
		free(cur);
		cur = Next;
	}
	free(phead);
}
```

这里可以看到, 在销毁链表之后, 并没有将 `phead` 置为空。为什么呢？

因为没有什么意义, 即使在函数内将 `phead` 置为空, 也只是将 `形参phead` 置空了, 并没有改变实参

所以, 一般需要在调用 `ListDestroy` 接口之后再将 `链表头节点置空

![ ](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/image-20220504162911544.webp)

执行之后: 

![ ](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/image-20220504163657580.webp)

然后再将 `pList` 置空



---

实现了 **`带头双向循环链表`** 会发现, 它的结构是最复杂的, `既是循环又是双向又有头节点` 但是 它用起来其实是最方便、最简单的。

得益于 **`带头双向循环链表`** 的结构, 对此结构链表进行操作时会省不少的力



# 结语

OK~ 本篇文章到此就结束啦, 介绍了 **`带头双向循环链表`** 这个很复杂 很重要 很简单 的链表结构, 希望大家多多支持！

![|tiny](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/%E7%BF%BB%E6%BB%9A%E5%B0%8F%E7%8C%AB.gif)
