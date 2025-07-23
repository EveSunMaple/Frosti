---
draft: true
title: "[数据结构] 掌握 单链表 只需要这篇文章~ 「超详细」"
pubDate: "2022-04-20"
description: "为了解决顺序表存在的一些问题, 又提出了一种新的数据结构: 链表. 本篇文章将详细介绍 链表 中 单链表 的 结构 增 删 查 改 插入 等操作"
image: https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/List_cover.webp
categories:
    - Blogs
tags:
    - 数据结构
    - 链表
---

# 单链表引言🐙

❤️‍🔥
数据结构中有 `四大基础结构` , 即 `四大线性表`: 顺序表、**`链表👻`** 、栈、队列

| 线性结构 | 逻辑结构图示:                                                |
| :----- | :----------------------------------------------------------- |
| 顺序表 | ![](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722154431878.webp) |
| **`链表`** | ![](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722154433617.webp) |
| 栈     | ![](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722154435731.webp) |
| 队列   | ![](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722154437808.webp) |


上一篇文章的内容是: `顺序表`, 从上一篇文章 可以看出 `顺序表` 存在非常明显的缺点: 

1. `前插`、`前删`操作 的时间复杂度为 `O(N)`
2. 需要增容, 增容过程比较消耗资源`（需要开辟新空间, 拷贝数据, 释放旧空间等）`
3. 增容一般是呈2倍的增长, 势必会有一定的空间浪费。`（例如: 当前容量为100, 满了以后增容到200, 但是只继续插入了5个数据, 后面不再使用, 那么就浪费了95个数据空间）`

为了解决以上的问题, 又提出了一种新的数据结构: **`链表`**
本篇文章将详细介绍 **`链表`** 中 **`单链表`** 的 `结构`、 `增`、 `删`、 `查`、 `改`、 `插入` 等操作。

# 链表🐙

## 链表的分类🪸

❤️‍🔥
上面展示的链表结构是单链表, 其实链表有许多不同的结构: 

> 1. 单链表
>    ![|wide](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722154730660.webp)
> 
>2. 双向链表
> 
>    ![|wide](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722154732408.webp)
> 
>3. 带头结点的单链表
>     ![|wide](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722154753101.webp)
>
> 4. 带头结点的双向链表
>    ![|wide](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722154801575.webp)
> 
>5. 循环单链表
>     ![|wide](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722154811664.webp)
>
> 6. 循环双向链表
>    ![|wide](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722154820342.webp)
> 
>7. 带头结点的单向循环链表
>     ![|wide](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722154827045.webp)
>
> 8. 带头结点的双向循环链表
>    ![|wide](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722154833479.webp)
> 


链表的结构有这 `八` 种, 但是大部分都是不常用的。
常用的链表结构只有两种: 
1. `不带头节点的单向非循环链表`
2. `带头节点的双向循环链表`

> `【神秘海域】数据结构与算法` 系列, 也只会着重介绍这 `两种链表结构` , 简单来说只要掌握了这两种链表结构, 其他的链表结构就应该都不成问题

本篇文章介绍的内容就是 `不带头节点的单向非循环链表`, 一般直接被称为 `单链表👻`

## 单链表的结构🪸
❤️‍🔥
> `单链表的结构` 非常的简单, 在实际的使用中, 单链表一般作为更高级数据结构的子结构来使用。

引言的表中, 简单表示了 `单链表的结构` : 

![|huger](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722154857012.webp)

是有一个一个节点链接在一起形成的, 不过这只是逻辑结构, 逻辑顺序是通过 `链表中的指针链接次序` 实现的, 而实际的链表是一种 物理存储结构上 `非连续、非顺序` 的存储结构, 即 这些 `单个的节点在内存中不一定是连续存放的` 。

详细的实际情况应该是这样的: 

![](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722154858471.webp)

即: 单链表在 `逻辑上是连续的` , 一个连着一个, 但是在 `物理结构上是不一定连续的` 。
而且可以看出, 单链表中 `单个节点的结构` 由一个 `数据单元(存放数据)` 和一个 `指针单元(存放下个节点的地址)` 构成。这样可以保证 链表可以向后链接。

所以 `单链表结构中单个节点` 的代码就应该包括两个部分: `数据` 和 `next指针`
实现就为: 
```cpp
typedef int SLTDataType;        // int typedef 为 SLTDataType

// 单链表(SingleList)结构
typedef struct SListNode
{
	SLTDataType val;               // val 用来存放数据
	struct SListNode* next;       // next 存放下一节点地址, 用来指向下一节点 
}SListNode;
```

这就是单链表一个节点的结构。

## 单链表接口及实现🪸
❤️‍🔥

`链表` 与 `顺序表` 一样, 几乎所有的操作都是由一个个 `接口函数` 来完成的。

但是, 链表 是由一个个`单独的节点`连接起来而构成的, 而顺序表本质上是 一个`数组`。

所以对于链表的接口, 首先需要一个 `申请单独节点的接口函数` , 然后再进行其他的操作
即, 一般 `单链表的接口函数` 有: 
1.  新申请节点: `BuySLTNode`
2. 单链表打印: `SListPrint`
3. 单链表尾插: `SListPushBack`
4. 单链表头插: `SListPushFront`
5. 单链表尾删: `SListPopBack`
6. 单链表头删: `SListPopFront`
7. 单链表查找: `SListPushBack`
8. 单链表插入: `SListPushFront`
9. 单链表删除: `SListPushBack`
10. 单链表销毁: `SListPushFront`

先从新节点申请开始。

### 新节点申请🐚
❤️‍🔥
单链表节点的申请, 实现的功能一般是
创建一个 `新的节点指针` , 然后将 `节点指针作为返回值` 返回到 `需要使用的此节点的地方`

既然需要返回, 那么就必然需要用动态开辟来实现: 
```cpp
SListNode* BuySLTNode(SLTDataType x)
{
	SListNode* newNode = (SListNode*)malloc(sizeof(SListNode));
	if(newNode == NULL)
	{
		printf("BuyNode fail.\n");
		exit(-1);
	}
	// malloc 成功
	newNode->val = x;            // 将新节点val 赋予 x
	newNode->next = NULL;        // 将新节点的next 指向空
	
	return newNode;              // 返回新节点
}
```

返回接收后, 就可以使用新的节点。

### 单链表尾插🐚
❤️‍🔥
单链表尾插就是在 `链表的尾节点之后` 插入节点

那么思考一下, 尾插都需要实现什么功能: 
1. 需要申请 `存放有指定数据` 的新节点
2. 需要将新节点 `链接到链表的末尾`

功能有了, 那就来实现一下
```cpp
void SListPushBack(SListNode* phead, SLTDataType x)
{
	assert(pnode);
	
	SListNode* newNode = BuyNode(x);
	
	SListNode* tail = phead;        //记录首节点
	while(tail->next != NULL)
	{// 从首节点开始找尾
		tail = tail->next;
	}
	// 退出循环就代表找到尾节点
	tail->next = newNode;
}
```
代码实现完毕, 尾插来验证一下。

![|inline](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722154902124.webp)

但是发现, 程序非正常结束了。为什么？
`调试！`

![](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722154903531.webp)

但是当我继续 `F10` 希望进入循环时: 

![](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722154905199.webp)

发生了访问冲突。

为什么发生了访问冲突？

`分析!`

> 分析过程: 
>
> 首先看一下进入循环的条件是什么: 
>
>  `while(tail->next != NULL)`
>
>  当前的 `tail` 是什么: 
>
>  `tail == phead == NULL`
>
>  破案了
>
>  当前的 `tail == NULL` ,  `tail` 根本就没有 `next` , 如果对 `tail->next` 进行访问 可不就是访问冲突吗？
>
>  看来`刚才写的代码考虑的不全面`

那么就来分析一下, 有什么问题没有考虑到: 

`tail` 为空, 说明了什么问题？

`tail` 是首节点的记录, `tail` 为空就代表传过来的 `首节点为空`

也就是说, 当前 `链表中没有一个节点`

看来是这种情况`(当插入的节点是链表的首节点)`没有考虑到

那就再分析一下这种情况怎么解决

1. 首先, 当 `phead` 为空时, 应该单独判断

  如果 `phead == NULL` , `首节点` 就应该更变为 `需要插入的这个新节点` 

2. 这样的操作更改了传入的参数, 那么就又引发了另外一个问题

  `改变形参是不改变原值的`, 但是又需要 `改变原值`, 所以形参应该传入 `首节点的地址` , 通过地址改变原值

OK, 现在情况应该考虑完整了

再来重新实现代码: 
```cpp
// 单链表尾插
void SListPushBack(SListNode** pphead, SLTDataType x)
{// 传首节点指针 的地址, 要用**
	assert(pphead);				// 断言 首节点指针的地址不为空

	SListNode* newNode = BuySLTNode(x);
	
	// 首节点为空, 将新节点变为首节点
	if (*pphead == NULL)
	{
		*pphead = newNode;
		return;
	}

	// 首节点不为空就 找尾
	SListNode* tail = *pphead;        //记录首节点
	while (tail->next != NULL)
	{// 从首节点开始找尾
		tail = tail->next;
	}
	// 退出循环就代表找到尾节点
	tail->next = newNode;
}
```

![](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722154910827.webp)

多尾插几个数据试验一下: 

![](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722154913242.webp)

这样就没问题了~

### 单链表打印🐚
❤️‍🔥
实现了 `尾插` 之后, 如果每次查看数据都需要 `调试` 然后 `监视`, 也太麻烦了

所以一般需要实现一个打印函数, 打印函数没有那么多的注意点

实现一下: 
```cpp
// 单链表打印
void SListPrint(SListNode* phead)
{
	SListNode* cur = phead;
	while (cur != NULL)
	{// cur 为空时退出循环
		printf("%d->", cur->val);
		cur = cur->next;
	}
	printf("NULL\n");
}
```

打印刚才实现的单链表: 

![|inline](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722154916037.webp)

### 单链表尾删🐚
❤️‍🔥
实现过 `尾插` 和 `打印`
再实现一下 `尾删`

因为 `尾删` 也是改变 `单链表节点` 的函数, 当删除链表 `最后一个节点` 的时候 也是需要改变 `原值` 的, 所以传参也需要 `传入首节点指针的地址`

而且, 因为单链表 `只能从前向后找, 不能从后向前找`, 所以如果要删除尾节点, 当前位置需要处于 `尾节点的前一节点`, 或者可以保存`尾节点的前一节点`。

> 如果需要 `控制当前节点在尾节点的前一节点停下` , 就需要 用 `cur->next->next != NULL` 作找尾循环条件
> 但是这样需要保证 链表至少有`两个节点` , 所以 `空链表` 和 `只有一个节点的链表` 需要单独控制

实现: 

```cpp
// 单链表尾删
void SListPopBack(SListNode** pphead)
{
	assert(pphead);

	// 空链表
	if (*pphead == NULL)
		return;

	// 只有一个节点
	if ((*pphead)->next == NULL)
	{
		free(*pphead);
		*pphead = NULL;
		return;
	}

	// 多个节点
	SListNode* cur = *pphead;
	while (cur->next->next != NULL)
	{
		cur = cur->next;
	}
	// 退出循环时, cur即在尾节点的前一节点处
	free(cur->next);			// 释放cur的next节点(尾节点)
	cur->next = NULL;			// cur->next 指向空

	/* 或者用前后指针的方法, 将 cur 的前一个节点存储起来
	SListNode* prev = NULL;
	SListNode* cur = *pphead;
	while(cur->next != NULL)
	{
		prev = cur;				// 每次进入循环先将 cur 用prev存储起来
		cur = cur->next;
	}
	//退出循环时, cur是尾节点, prev是尾节点的前一个节点
	free(cur);					// 释放尾节点
	prev->next = NULL;
	cur = NULL;
	*/
}
```

验证一下 `尾删` 有没有出错: 

![|inline](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722154918903.webp)

即使过多次尾删也能成功

---
`尾插` 和 `尾删` 实现过后, 发现一个问题

`插入 和 删除 都需要从头开始找尾, 这时间复杂度不还是 O(N) 吗？`
是的, 单链表 `尾插` 和 `尾删` 的时间复杂度是 `O(N)`
所以, 对于单链表的 `插入删除操作` , 一般不用 `尾插` 和 `尾删`
而是使用 `头插` 和 `头删` 

下面就实现一下 `头插` 和 `头删` 

### 单链表头插🐚
❤️‍🔥
相较于单链表的尾插, `单链表头插` 的逻辑就简单得多了: 
1. 创建一个新的节点
2. 将新节点置于链表的头
3. 再将这个新节点设置为链表首节点

只需要这三步就可以了, 甚至不需要考虑链表是否存在节点。

因为需要修改 `链表的首节点` 所以传参还需要使用 `二级指针`

`单链表头插的实现: `
```cpp
// 单链表头插
void SListPushFront(SListNode** pphead, SLTDataType x)
{
	assert(pphead);

	SListNode* newNode = BuySLTNode(x);
	newNode->next = *pphead;            // 新节点的next 指向 *pphead
	*pphead = newNode;                // 将新节点置为 *pphead
}
```

头插几个数据测试一下: 

![|inline](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722154921581.webp)

`没有错误！`

动画过程: 

![|inline](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722154923152.gif)

### 单链表头删🐚
❤️‍🔥
头删就 `不像头插一样不需要考虑链表是否存在节点了` , 毕竟如果链表中没有节点, 也删除不了

所以 `头删需要考虑链表是否为空`
并且由于 `单链表后找不到前`, 且首节点是必须要释放掉的, 所以 `首节点` 或者 `第二节点` 需要存起来一个。

那么头删的逻辑应该是什么呢？
1. 判断链表是否为空
2. 链表不空: 
	1. 将 `首节点` 存起来, 然后将 `首节点的next` 置为 `*pphead`, 然后释放 `首节点`
	2. 将 `第二节点` 存起来, 然后将 `首节点` 释放, 然后释放 `第二节点` 置为 `*pphead`。

两种思路都实现一下:
```cpp
// 单链表头删
void SListPopFront(SListNode** pphead)
{
	assert(pphead);
	
	if (*pphead == NULL)
		return;
	
	// 存首节点
	SListNode* tail = *pphead;
	*pphead = tail->next;
	free(tail);
	tail = NULL;
	
	// 存第二节点
	/*SListNode* tail = (*pphead)->next;
	free(*pphead);
	*pphead = tail;*/
}
```

头删检测: 

![|inline](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722154925684.webp)

动画过程: 

![|inline](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722154927590.gif)

---
实现了 `头插` 和 `头删` 之后, 能够发现
`头删` 和 `头插` 操作不需要找尾, 直接`在链表头进行操作` 就可以, 所以时间复杂度是`O(1)`
比 `尾插` `尾删` 的时间复杂度快的多, 所以对于单链表的 `插入删除` 一般采用 `头插` 和 `头删`

### 单链表查找🐚
❤️‍🔥
单链表的查找, 其实是 `查找某个值节点`
找到数据之后返回 `节点`

不需要修改, 不需要添加, 只需要比较
所以, 传参只需要 `传一级指针`

实现: 
```cpp
SListNode* SListFind(SListNode* phead, SLTDataType x)
{
	SListNode* tail = phead;    // 记录首节点
	while(tail != NULL)
	{// tail不为空 进循环后 再进行判断
		if(tail->val == x)
			return tail;        // 找到就返回节点
			
		tail = tail->next;      // 没找到, tail 就变为 自己的 next
	}

	return NULL;    // 没进入循环或者从循环出来了, 就代表没找到, 返回NULL
}
```

验证一下: 

![|inline](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722154930295.webp)

### 单链表指定位置之后插入🐚
❤️‍🔥
单链表的 `插入函数` 一般是与单链表 `查找函数` 一起使用的
`查找函数先找到节点的位置` , 然后 `传入插入函数在结点之后插入新的节点`

单链表的 `插入函数的功能`, 一般实现 `在传入的节点之后` 插入新的节点

> 思考一下为什么一般不在指定节点位置之前插入?

在 `指定位置(pos)之后` 插入新节点, 就可以不用传入 `首节点` 直接将新节点 `链接在 pos 位置之后` 就可以了

```cpp
void SListInsertAfter(SListNode *pos, SLTDateType x)
{
	assert(pos);

	SListNode *newNode = BuySLTNode(x);
    newNode->next = pos->next;             // 先将新节点的next 链上 pos的next
    pos->next = newNode;            // 再将pos的next指向新节点
}
```

验证一下: 

![|inline](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722154932606.webp)

插入成功

且, 在 `pos位置之后` 插入的时间复杂度为 `O(1)`

动画过程: 

![|inline](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722154934513.gif)

### 单链表指定位置之后删除🐚
❤️‍🔥

与 `指定位置之后插入` 相同, `指定位置之后删除函数` 一般也是与查找函数一起使用

> 同样思考一下
> 单链表为什么 不直接删除指定位置节点呢？

因为 `删除 pos 位置之后` 的节点, 所以也不需要传入 `首节点指针`
所以, 它的时间复杂度 也是 `O(1)`

实现: 
```cpp
// 单链表删除(pos之后)
void SListEraseAfter(SLTNode* pos)
{
	assert(pos);

	SListNode* next = pos->next;			//先记录 pos 的 next 节点
	if (next)
	{// 若此节点不为空则进行操作
		pos->next = next->next;			// 先将 pos的next 指向 next的next
		free(next);						// 再释放 next
		next = NULL;
	}
}
```

验证: 

![|inline](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722154936783.webp)

动画过程: 

![|inline](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722154938760.gif)

### 单链表的销毁🐚
❤️‍🔥
对于单链表的销毁, 需要注意的点不多: 
1. 销毁是从首节点开始的
2. 销毁当前结点之前, 要将下一节点存储起来, 防止找不到链表
3. 因为销毁需要改变首节点, 所以需要传入二级指针
4. 销毁完成之后, `*pphead` 置空

经过以上接口的实现, 考虑完这些点, 就可以直接实现 `销毁` 了:
```cpp
// 销毁单链表
void SListDestroy(SListNode** pphead)
{
	assert(pphead);
	
	SListNode* tail = *pphead;
	while(tail != NULL)
	{// 链表不为空
		SListNode* next = tail->next;    //销毁当前结点之前,要将下一节点存储起来
		free(tail);
		tail = next;                // 将tail 赋成 存储起来的节点
	}
	
	*pphead = NULL;
}
```
验证: 

![|inline](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722154941168.webp)

单链表成功被销毁。

---

单链表 `主要接口` 的实现就是这些了
需要注意的 `细节` 有很多, 但都不是什么大问题

重新回到那个问题: 
1. 为什么插入不在 `pos` 位置之前？
2. 为什么删除不直接删除 `pos` 位置
3. 可以实现吗？为什么不实现？

### pos 位置插入删除的问题(补充)🐚
❤️‍🔥
实现 `指定位置之后插入、删除` 时, 可以非常简单的计算出, 这两个接口时间复杂度都是 `O(1)`

如果是在 `指定位置之前插入、删除` 呢？
那么, 时间复杂度就换变成 `O(N)`

由于单链表 `只能从前找后, 不能从后找前` , 所以如果想要操作 `pos` 位置之前的节点, 就需要先 `从首节点位置向后找, 直到找到 pos 之前的节点`, 才能依此基础进行操作

这个过程与 `单链表尾插、尾删` 非常的相似, 都需要找尾, 所以时间复杂度就来到了 `O(N)` 这个级别。

所以, 对于单链表 `pos位置的插入、删除` , 一般都是在 `pos` 位置之后

---
> 可以自己手动写一写, 在 `pos` 位置之前插入、删除的接口

# 结语🐙
❤️‍🔥
本篇文章所介绍实现的是 `线性表结构` 之一的: `单链表`。
是一个完全不同于 `顺序表` 的数据结构, 接口实现 需要注意的细节也有很多, 比如 `首节点` 什么时候需要变化, 接口什么时候 传参传入 `二级指针`。

好了, 本篇文章,  `【神秘海域】 数据结构与算法` 系列的第三篇 `单链表篇` , 至此结束。

感谢阅读！！

---
`求 关注！`

