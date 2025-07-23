---
draft: true
title: "[数据结构] 顺序表千字破解~"
pubDate: "2022-04-15"
description: "本篇文章将详细介绍 顺序表 的 结构 增 删 查 改 插入 等操作"
image: https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/DS_Cover_qesList.webp
categories:
    - Blogs
tags:
    - 数据结构
    - 顺序表
---

# 顺序表引言

数据结构中有 `四大基础结构` , 即 `四大线性表`: **`顺序表`**、`链表`、`栈`、`队列`

被称为线性表是因为, 数据用以上四种结构存储, 再逻辑结构上都是 `在一条线上相邻连续的`

| 线性结构 | 逻辑结构图示:                                                |
| :----- | :----------------------------------------------------------- |
| **`顺序表`** | ![](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722154431878.webp) |
| 链表   | ![](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722154433617.webp) |
| 栈     | ![](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722154435731.webp) |
| 队列   | ![](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722154437808.webp) |

本篇文章将详细介绍 **`顺序表`** 的 `结构` `增` `删` `查` `改` `插入` 等操作。

# 顺序表
## 顺序表的概念
先来了解一下什么是 顺序表: `用一段物理地址连续的存储单元依次存储数据元素的线性结构, 一般情况下采用数组存储。在数组上完成数据的增删查改`
本质来说上, 顺序表 就是一个实现增删查改等操作 的数组。

## 顺序表的两种结构
顺序表的实现方式一般分为两种: 
1. 静态的顺序表
   
    所谓`静态`, 就是 `使用定长数组存储数据`
    
    定长的数组是 `有一定的弊端` 的, 即 `只能存储一定数量的数据`
    
    即: 
    
    ![|wide](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722154506638.gif)
    
    采用定长的数组实现顺序表, `顺序表存满(即数组存满)之后, 无法直接继续存储数据, 想要继续存储数据就需要改动源代码.`
    一般实现代码为: 
    
    ```cpp
    #define N 10
    typedef int SLDataType;
    
    typedef struct SeqList
    {
    	SLDataType a[N];    // SLDataType 表示数据类型, 已经被typedef 为 int
    	int Size;    //数组内存放数据数量
    }SeqList;
    
    // 如果需要改变顺序表的容量就需要改动 N 的值
    ```

2. 动态的顺序表
   
   `动态的顺序表`, 就是 `使用动态开辟的数组存储数据`
   
   动态开辟的数组, 可以实现一个功能就是, `当数组满了的时候可以自动扩容`
   
   即: 
   
   ![|wide](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722154510524.gif)
   
   当数组处于已满的状态且再要存入数据时, 数组扩容。
   
   这样采用动态数组实现的顺序表, `使用的时候不需要考虑容量的问题` , 所以 一般 `实现顺序表就用动态开辟的数组` 实现。
   
   结构的实现代码为: 
   
   ```cpp
   typedef int SLDataType;
   
   typedef struct SeqList
   {
   	SLDataType* arr;    // 指向动态开辟的数组
   	int Size;    //数组内存放数据数量
   	int Capacity;    //顺序表容量
   }SeqList;
   // 此结构的顺序表 创建后, 使用前, 需要初始化
   ```

## 顺序表接口实现

静态顺序表 `只适用于确定知道需要存多少数据的场景`
所以现实中基本都是使用动态顺序表, 根据需要动态的分配空间大小

	以下也都是以动态顺序表为基础
一个动态顺序表一般拥有这些接口: 
1. 初始化    `seqListInit`
2. 容量检查    `checkCapacity`
3. 尾插    `seqListPushBack`
4. 尾删    `seqListPopBack`
5. 头插    `seqListPushFront`
6. 头删    `seqListPopFront`
7. 查找    `seqListFind`
8. 指定位置插入    `seqListInsert`
9. 指定位置删除    `seqListErase`
10. 销毁顺序表    `seqListDestory`
11. 打印顺序表    `seqListPrint`

下面就来一一实现这些接口:
### 顺序表动态存储结构
```cpp
typedef int SLDataType;

typedef struct SeqList
{
	SLDataType* arr;    // 指向动态开辟的数组
	int Size;    //数组内存放数据数量
	int Capacity;    //顺序表容量
}SeqList;
// 此结构的顺序表 创建后, 使用前, 需要初始化
```

实现动态顺序表结构, 需要在结构体内

### 顺序表初始化
```cpp
// 顺序表初始化
void seqListInit(SeqList* psl); 
```

初始化函数非常的简单, 只需要将创建好的顺序表结构体内: 
`arr` 指向 `NULL`
`Size` 和 `Capacity` 赋予 `0`
就完成了一个顺序表的初始化

实现代码: 
```cpp
// 顺序表初始化
void seqListInit(SeqList* psl)
{
	assert(psl);

	psl->arr = NULL;
	psl->Size = psl->Capacity = 0;
}
```

创建一个顺序表验证一下: 

![](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722154514137.webp)

创建出的顺序表, 初始化成功。

### 顺序表尾插 及 容量检查
```cpp
// 顺序表容量检查
void checkCapacity(SeqList* psl);
// 顺序表尾插
void seqListPushBack(SeqList* psl, SLDataType x);
```

顺序表尾插, 即 `在顺序表最后一个数据之后存放数据`
存放数据进入顺序表之前, 要 `先确保顺序表处于未满状态` 的, 不然数据无法存储。

所以在实现尾插之前, 先 `实现一个容量检查的函数` 。
`容量检查一般需要实现什么功能？`

1. 检查顺序表是否已满
2. 如果顺序表已满, 则扩容

具体实现如下: 

```cpp
void checkCapacity(SeqList* psl)
{
	assert(psl);

	if(psl->Size == psl->Capacity)
	{// 如果存入的数据数量 与 顺序表的容量相等, 就代表顺序表已满
		int newCapacity = psl->Capacity == 0 ? 2 : 2 * psl->Capacity;    
		//如果当前容量等于0,代表新顺序表,新容量给 2
		//如果当前容量不等于0,代表非新顺序表, 新容量给原来容量的两倍
		SLDataType* tmp = (SLDataType*)realloc(psl->arr, sizeof(SLDataType)* newCapacity);
		// 先用tmp 指向 realloc 扩容出新空间, 以防止扩容失败导致元数据丢失
		if(tmp == NULL)
		{// tmp 为空 表示扩容失败, 退出程序
			printf("realloc fail!\n");
			exit(-1);
		}
		// tmp 不为空, 再将tmp 赋于 psl->arr;
		psl->arr = tmp;  //psl->arr 指向扩容后的地址
		psl->Capacity = newCapacity;   // 容量改为扩容后的容量
	}
}
```

容量检查函数实现成功之后, 就可以继续 `实现尾插函数`: 

先考虑一下, `尾插都需要注意哪些事项`: 
1. 需要先用容量检查函数检查容量
2. 需要在数组中 `Size` 的位置放入数据之后, `Size` 自增
`(因为数组下标从 0 开始, 所以 Size 位置即为最后一个数据之后)`

具体实现如下: 
```cpp
// 尾插
void seqListPushBack(SeqList* psl, SLDataType x)
{
	assert(psl);    //断言保证传入的结构体的地址不为空

	checkCapacity(psl);    //容量检查函数检查容量

	psl->arr[psl->Size] = x;    // 将 x 尾插
	psl->Size++;    // 存储数据量加1 , Size也要加1
}
```

`每实现一个接口, 最好都要验证一下`

尾插三个整型数据, 验证

![](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722154518213.webp)

尾插三次, 扩容两次, 尾插成功.

### 顺序表打印
```cpp
// 顺序表打印
void seqListPrint(SeqList* psl);
```
尾插存放数据是可以了, 但是如何实现顺序表的打印呢？

`顺序表打印` 接口的实现也是非常的简单: 

```cpp
// 顺序表打印
void seqListPrint(SeqList* psl)
{
	assert(psl);

	for (int i = 0; i < psl->Size; i++)
	{
		printf("%d ", psl->arr[i]);
	}
	printf("\n");
}
```

验证: 

![|inline](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722154520349.webp)

### 顺序表尾删
```cpp
// 顺序表尾删
void seqListPopBack(SeqList* psl);
```

实现了顺序表的尾插, 如果需要删除数据, 对应的还有顺序表的尾删。

尾删需要注意几个点: 
1.  尾删需不需要将 `需要删除的数据` 的空间释放掉？
2. 尾删需不需要将 `需要删除的数据` 赋值为 `0` ?
3. 尾删需不需要控制一下顺序表中的 `Size` ？
4. 控制不控制 `Size` 的值, 对顺序表来说有什么区别？

先来思考一下第一个问题, 尾删需不需要将 `需要删除的数据` 的空间释放掉？
答案是, 不需要, 也无法释放。
因为 `free` 函数使用的条件是, `malloc` 或 `realloc` 函数开辟的`整块空间`, 且`传入的必须是是这块空间的首地址`。所以无法释放其中的单独一块空间。


第二个问题, 尾删需不需要将 `需要删除的数据` 赋值为 `0` ?

答案同样是, 不需要。
因为尾删之后, `下次使用这块空间一定是在插入数据的时候, 到时候会有新的数据将其覆盖, 所以不需要将其赋值为 `0`

第三个问题和第四个问题, 一起思考一下: 

尾删需不需要控制一下顺序表中的 `Size` ？
控制不控制 `Size` 的值, 对顺序表来说有什么区别？

答案是, 需要控制 `Size` 的值, 防止 过多次使用尾删`(使用次数比存放数据数量多)` 导致 `Size` 变成负数。
`Size` 变成负数, 会发生什么情况？

使用下面段 尾删函数试验一下: 
```cpp
// 顺序表尾删
void seqListPopBack(SeqList* psl)
{
	assert(psl);

	psl->Size--;
}
```
![](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722154522887.webp)

`尾插 3 个数据, 但是尾删了 5 次`
可以看到, 顺序表中的 `Size` 变成了 `-3`
变成负数之后, 如果继续进行其他操作, 一定会发生错误
比如: 

![|inline](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722154524664.webp)

即使, 尾插了两次, 顺序表中还是无法输出数据, 也就是说, 再次尾插的两个数据并没有存放至顺序表中。
因为 这两次尾插, 是从 `Size 为 -3` 的地方执行的, 并没有从 `0` 位置开始, 所以无法存入, `同时也发生了越界现象`。

> 这里 `VS 编译器` 不报错, 是因为 `对于数组越界的情况,  VS编译器 是抽查的`。也就是说, 并不是所有的越界情况 `VS编译器` 都能检查得到


所以`尾删`, 需要对顺序表中的 `Size` 进行一个简单的控制: 
```cpp
// 顺序表尾删
void seqListPopBack(SeqList* psl)
{
	assert(psl);
	
	if (psl->Size > 0)
	{// 当Size 大于零 再进行自减
		psl->Size--;
	}
}
```
这样就不会发生使 `Size` 减到负 的问题: 

![](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722154527553.webp)

即使 尾删次数过多, `Size` 也不会变为负数, 也就不会发生其他操作错误的情况。


### 顺序表头插
```cpp
// 顺序表头插
void seqListPushFront(SeqList* psl, SLDataType x);
```

顺序表的尾插比较简单, 只需要在顺序表 `Size` 位置放入数据就可以了。

头插呢？头插需要注意到什么问题？
顺序表本质上是 `数组实现的`, 那么需要在数组的首位置插入数据就不仅仅是插入数据那么简单。`需要先将数组中的数据向后移动一位, 然后才能将新数据放入首位置`
`演示: `

![|inline](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722154529846.gif)

`那么来实现头插一下: `
```cpp
// 头插
void seqListPushFront(SeqList* psl, SLDataType x)
{
	assert(psl);    //断言保证传入的结构体的地址不为空

	checkCapacity(psl);    //插入前 首先检查容量

	// 方法一: 
	int end = psl->Size;
	while (end)
	{
		psl->arr[end] = psl->arr[end - 1];
		end--;
	}

	// 方法二: 
	/*int end = psl->Size - 1;
	while (end >= 0)
	{
		psl->arr[end + 1] = psl->arr[end];
		end--;
	}*/

	// 这两个方法其实一样的, 只是对 末尾元素的位置控制方式不同
	

	psl->arr[0] = x;    // 将 x 尾插
	psl->Size++;    // 存储数据量加1 , Size 加1
}
```

验证: 

![|inline](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722154532419.webp)

头插成功。

### 顺序表头删
```cpp
// 顺序表头删
void seqListPopFront(SeqList* psl);
```

实现了头插, 接着来实现一下头删

头删和头插的思路相似, 不过只是将从 `1 ~ Size-1` 位置的数据向前移动一位。
不过, 头删同样需要保证 `Size > 0` 才能执行。
`演示: `

![|inline](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722154534608.gif)

`头删实现: `

```cpp
// 顺序表头删
void seqListPopFront(SeqList* psl)
{
	assert(psl);

	if (psl->Size > 0)
	{
		int begin = 1;
		while (begin < psl->Size)
		{
			psl->arr[begin] = psl->arr[begin - 1];
			begin++;
		}

		psl->Size--;
	}
}
```

验证: 

![|inline](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722154536884.webp)

即使删除过多, 也不会出错。

### 顺序表查找
```cpp
int seqListFind(SeqList* psl, SLDataType x);
```

查找顺序表中某个数据所在的位置, 可以用到顺序表查找的操作。
因为顺序表的本质是数组, 所以 `只需要将顺序表从头到尾遍历一遍`, 找到值就返回 `其所在的位置` , 找不到就返回 `-1`。

查找的实现: 
```cpp
// 顺序表查找
int seqListFind(SeqList* psl, SLDataType x)
{
	assert(psl);

	for (int i = 0; i < psl->Size; i++)
	{
		if (x == psl->arr[i])
			return i;
	}

	return -1;
}
```

验证: 

![|inline](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722154539694.webp)

验证了, 一般情况、边界情况、未找到情况, 均返回正确。

### 指定位置插入
```cpp
void seqListInsert(SeqList* psl, size_t pos, SLDataType x);
```

尾插、头插都实现了, 接下来就实现一下指定 `pos` 位置插入数据。
在指定 `pos` 位置插入数据, 和前插有一点相似, 需要将数据向后移一位。

我们可以用相似的方法移动, 不过是从 `pos` 位置以后的数据向后移动一位。
不过首先还是要检查容量: 
```cpp
// 指定位置插入
void seqListInsert(SeqList* psl, size_t pos, SLDataType x)
{
	assert(psl);
	
	SeqListCheckCapacity(psl);    // 检查容量
	
	size_t end = psl->Size;
	while(end > pos)
	{
		psl->arr[end] = psl->arr[end - 1];
		end--;
	}
	
	psl->arr[pos] = x;
	psl->Size++;
}
```
验证一下: 
> 在插入之前可以使用 查找函数 获取一下 `pos` 位置

![|inline](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722154542454.webp)

`pos` 位置插入数据 成功了。

但是真的成功了吗？
这个函数, 现在还有没有什么问题？
比如, 当我在 `20` 这个位置插入, 会发生什么呢？
看一下: 

![|inline](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722154544490.webp)

在 `20` 位置插入数据没有报错, 但是输出的时候输出的是随机值
而且, 在实际的操作中, 程序是延迟了一会才结束的
为什么？

因为, 顺序表中存放的数据数量只有 `9` 个, 占用的位置只有`0 ~ 8`, 如果在 `20` 位置插入数据, 超出了顺序表应有的位置, 这个时候 `Size` 照常自增
那么输出的时候就会输出 `0 ~ 9` 位置的数据, 而 `9` 位置并没有赋予数据, 所以输出的是随机值。

这就提出了一个问题: 当传入的 `pos` 位置比实际应该插入的位置大, 怎么解决？
其实也很简单, 如果 `pos` 位置过大, `直接结束 插入函数` 就可以了。

那么改进后的代码就是: 
```cpp
// 指定位置插入
void seqListInsert(SeqList* psl, size_t pos, SLDataType x)
{
	assert(psl);
	
	checkCapacity(psl);    // 检查容量
	
	if(pos > psl->Size)
	{// 尾插的位置是 Size, 如果大于Size, 就代表pos过大
		printf("Insert fail. Pos > Size! Pos = %d \n", pos);
		return;
	}
	
	size_t end = psl->Size;
	while(end > pos)
	{
		psl->arr[end] = psl->arr[end - 1];
		end--;
	}
	
	psl->arr[pos] = x;
	psl->Size++;
}
```
现在再执行一遍代码: 

![|inline](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722154547362.webp)

当 `pos` 大于 `Size` 时, 会输出警告, 并停止插入。

#### 调用指定位置插入的 尾插 和 头插
那么。
既然插入函数可以指定位置插入数据, 是不是就说明 `头插` `尾插` 都可以`直接调用插入函数` 实现呢？
答案当然是可以的。
所以 `尾插` 和 `头插` 函数就可以改进为: 

```cpp
// 尾插
void seqListPushBack(SeqList* psl, SLDataType x)
{
	assert(psl);    //断言保证传入的结构体的地址不为空
	/*
	checkCapacity(psl);    //容量检查函数检查容量

	psl->arr[psl->Size] = x;    // 将 x 尾插
	psl->Size++;    // 存储数据量加1 , Size也要加1
	*/
	
	seqListInsert(psl, psl->Size, x);    //在 Size 位置插入数据, 就是尾插
}
```

```cpp
// 头插
void seqListPushFront(SeqList* psl, SLDataType x)
{
	assert(psl);    //断言保证传入的结构体的地址不为空
	
	/*
	checkCapacity(psl);    //插入前 首先检查容量

	// 方法一: 
	int end = psl->Size;
	while (end)
	{
		psl->arr[end] = psl->arr[end - 1];
		end--;
	}

	// 方法二: 
	int end = psl->Size - 1;
	while (end >= 0)
	{
		psl->arr[end + 1] = psl->arr[end];
		end--;
	}

	// 这两个方法其实一样的, 只是对 末尾元素的位置控制方式不同
	

	psl->arr[0] = x;    // 将 x 尾插
	psl->Size++;    // 存储数据量加1 , Size 加1
	*/
	seqListInsert(psl, 0, x);   // 在 0 位置插入数据, 就是头插
}
```

使用改良后的 `头插` `尾插`验证: 

![|inline](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722154550225.webp)

改良后的 `头插` 和 `尾插` 成功


### 指定位置删除
```cpp
void seqListErase(SeqList* psl, size_t pos);
```

删除 `pos` 位置的数据, 思路也是与 `头删` 相似。
即, `pos` 位置以后的数据, 向前移动一位, 同时 `Size` 自减

同样的, 指定位置删除的 `pos` 也是要控制一下的

那么, 指定位置删除的实现就是: 
```cpp
// 指定位置删除
void seqListErase(SeqList* psl, size_t pos)
{
	assert(psl);

	if(pos >= psl->Size)
	{// 这里 pos 必须小于 Size 才能删除
		printf("Erase fail. Pos >= Size! Pos = %d \n", pos);
		return;
	}
	
	size_t begin = pos + 1;
	while(begin < psl->Size)
	{
		psl->arr[begin - 1] = psl->arr[begin];
		begin++;
	}
	
	psl->Size--;
}
```
验证一下: 
删除之前插入的三个 `0`: 

![|inline](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722154552774.webp)

删除成功, 同样 超出 `Size` 直接取消删除。

#### 调用指定位置删除的 尾删 和 头删

既然 `尾插` 和 `头插` 都可以直接调用 `指定位置插入函数` 实现
我 `尾删` 和 `头删` 也要调用 `指定位置删除函数`

安排: 
```cpp
// 顺序表尾删
void seqListPopBack(SeqList* psl)
{
	assert(psl);
	
	/*
	if (psl->Size > 0)
	{// 当Size 大于零 再进行自减
		psl->Size--;
	}
	*/
	seqListErase(psl, psl->Size - 1);    // Size - 1 即为末尾元素位置
}
```

```cpp
// 顺序表头删
void seqListPopFront(SeqList* psl)
{
	assert(psl);
	
	/*
	if (psl->Size > 0)
	{
		int begin = 1;
		while (begin < psl->Size)
		{
			psl->arr[begin] = psl->arr[begin - 1];
			begin++;
		}
		
		psl->Size--;
	}
	*/
	seqListErase(psl, 0);    // 0 位置即为首元素
}
```

也使用改良后的 `头删` `尾删`验证: 

![|inline](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722154555774.webp)

改良后的 `头删` 和 `尾删` 成功

### 顺序表销毁
```cpp
// 顺序表销毁  
void seqListDestory(SeqList* psl);
```

对于顺序表的销毁, 比较简单, 与初始化相似, 一看就懂: 
```cpp
// 顺序表销毁
void SeqListDestory(SeqList *psl)
{
    assert(psl);

    free(psl->s);
    psl->s = NULL;
    psl->size = psl->capacity = 0;;
}
```

---

至此 `顺序表结构`、`主要接口` 已经全部实现。
阅读到这里的一定都是勤奋好学的hxd了
加油！

# 结语
本篇文章所介绍实现的是 线性表的第一个结构: `顺序表`。是相对简单的一个数据结构。虽然相对简单, 但是也存在着许多需要注意的细节, 像`检查容量时`对 `realloc` 函数的掌握、 像 `删除函数` 中 `Size`的要点、 像 `指定位置操作` 中  `pos` 位置的控制 等。都是一些需要用心注意的细节。

好了, 本篇文章, 也是 `【神秘海域】 数据结构与算法` 系列的第二篇, 至此结束。

感谢阅读！！
