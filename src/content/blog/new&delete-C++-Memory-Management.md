---
draft: true
title: "[C++] 超详细分析 C++内存分布、管理(new - delete)、C 和 C++ 内存管理关系、内存泄漏"
pubDate: "2022-06-29"
description: "在介绍详细 C++ 内存管理的方法之前, 先简单做个铺垫, 先介绍一下: C/C++程序 内存区域的划分"
image: https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/202306251805245.webp
categories: ['tech']
tags: ["C++", "内存管理"]
---

# 一、C/C++ 内存分布

在介绍详细 C++ 内存管理的方法之前, 先简单做个铺垫, 先介绍一下: `C/C++程序 内存区域的划分`

首先先分析以下这段代码, 并且思考问题: 

![](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/image-20220629144649718.webp)

程序中所有的变量应该存储在什么区域？

不妨先分析一下, 再继续阅读下面的文章

---

C/C++ 程序运行之后, 程序中的数据的存储区域大致可以划分这样: 

![|small](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/image-20230409232144743.webp)

这张图可以展示出 C/C++ 程序数据在内存中的大致区域

1. `栈` 又叫 `堆栈`, 一般存储 `非静态局部变量`、`函数参数`、`返回值`等等, `向下增长(先使用高地址空间)`
2. `内存映射段` 是 `高效的I/O映射方式`, 用于装载一个共享的动态内存库。用户可使用系统接口创建共享共享内存, 做进程间通信
3. `堆` 用于程序运行时 `动态内存分配`, `malloc`、`realloc`、`calloc`开辟出的空间即存储在此, `向上增长(先使用低地址空间)`
4. `数据段`, 语言中常称作 `静态区` , 存储全局数据和静态数据
5. `代码段`, 语言中常称作 `常量区` , 存储可执行的代码(二进制代码)、只读常量

看完数据的存储区域, 上面的问题就可以完美的解决了！: 

![|inline](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/image-20220629141223975.webp)

> `globalVar`、`staticGlobalVar`、`staticVar` 很明显属于 全局或静态变量, 所以应该存储在`静态区`
>
> `localVar`、`num1`、`char2`、`pChar3`、`ptr1`、`ptr2`、`ptr3` 都是在函数定义的局部变量, 所以存储在 `栈区`
> `*char2` 是 对数组名解引用, 即为数组中第一个元素, `用常字符串赋值数组, 是将字符串数据拷贝至数组中`, 不是直接将常量放至数组中, 所以`*char2` 也存储在 `栈区`
>
> `*pChar3`, 是对 `指针pChar3` 的解引用, 而`pChar3`指向了 常字符串, 所以`*pChar3`存储在 `常量区`
>
> `*ptr1`、`*ptr2`、`*ptr3` 都是动态开辟处的空间, 所以存储在 `堆区`

分析完上面的问题 以及 程序数据在内存中的存储区域, 应该已经对 C/C++的内存分布有了一定的了解

下面就正式进入整体 `C/C++ 内存管理`

# 二、C/C++ 动态内存管理

C语言为 动态内存管理提供了 四个函数`malloc`、`calloc`、`realloc`、`free`

而C++, 由于增添了许多特性, 即使依旧可以延用C语言的动态管理, 但是总有无法处理的地方
所以 C++ 又提供了两个新的动态管理的关键词 `new` 和 `delete`

## 2.1 C语言动态内存管理

### malloc

```cpp
void* malloc (size_t size);
```

作用: `向内存申请一块连续可用的空间, 并返回指向这块空间的指针, 开辟失败则返回空指针`

使用注意: 返回值类型为 `空类型指针`, 所以使用时需要指定 指针类型

![|inline](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/image-20220629153315360.webp)

`malloc` 开辟出的空间不初始化

![|inline](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/image-20220629153504293.webp)

### calloc

```cpp
void* calloc (size_t num, size_t size);
```

作用: `向内存申请 num 个大小为 size 的连续可用的空间, 并将每一字节初始化为0, 返回指向这块空间的指针, 开辟失败则返回空指针`

使用方式与 `malloc` 类似

![|inline](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/image-20220629153959427.webp)

### realloc

```cpp
void* realloc (void* ptr, size_t size);
```

作用: `对已经动态开辟出的内存空间进行大小上的调整, 返回调整后空间的地址`

使用: `ptr` 传入已经动态开辟的内存空间的首地址, `size` 需要调整为的大小

注意: `size` 需要传入需要调整到的大小
比如, 原本开辟了 `5个int` 大小的空间, 想要扩充到 `10个int` 大小, `size`就传入`10`

![|inline](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/image-20220629155056038.webp)

> `realloc` 扩充空间, 默认从 旧空间向后扩充
>
> 除非旧空间后的空间不够扩充了, 则会完全开辟一块新的指定大小的空间, 并将旧空间数据拷贝至新空间
>
> 返回新空间的地址

### free

```cpp
void free (void* ptr);
```

作用: `释放动态开辟的内存空间, 防止内存泄露`

使用: `free(内存空间地址)`

注意: `free`只能释放 `动态开辟的内存空间, 且只能从头释放`



## 2.2 C++ 动态内存管理

C++ 补充了 `new` 和 `delete` 作为自己的动态内存管理工具

不过 `new` 和 `delete` 的实现也是嵌套了 `malloc`和`free` 的, 更再此基础上做了补充 以完善C++的内存管理

### new 和 delete 的用法

`new` 和 `delete` 的用法 比 C语言动态内存管理的方法 简单许多

![|huge](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/image-20220629161545639.webp)

`new` 和 `detele` 都属于 C++ 中的关键词, 而不是函数, 所以与C语言中 `malloc` 等用法不同

> 虽然用法不同, 但其实对内置类型来说, 不论使用 `malloc` 还是 `new` , 结果都是一样的, 没有一点差别
>
> `new` `detele` 与 `malloc` `free`的差别, 在对自定义类型的操作上

>  `new` `delete` 和 `new []` `delete[]` 是对应的
>
> `new` `delete` 用于申请和释放单个空间, `new []` `delete[]` 用于申请和释放连续空间, 使用时也必须对应

---

`new` 和 `detele` 操作自定义类型空间的使用, 与操作内置类型的使用相同

![|huge](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/image-20220629163737630.webp)

在对自定义类型空间的操作上, `new` `delete` 与 `malloc` `free` 相比, 有一个非常适合 C++语法的作用 就是
`new` 和 `detele` 在操作自定义类型的空间时, 会调用 `构造函数和析构函数`；而 `malloc` 和 `free` 不会

>  `new` 和 `delete` 增添了对 类的适配, 这是 `malloc` 和 `free` 没有的

调试

![|large](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/image-20220629164925433.webp)

所以, `new` 开辟自定义类型的空间, 实际对象的实例化, 也是调用 其构造函数实现的

>  `new` 开辟了一块空间, 并调用构造函数在这块空间中实例化了对象

如果是对下面这个类动态开辟空间: 

![|huger](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/image-20220629171128548.webp)

使用 `new` 动态开辟: 

![|huge](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/image-20220629173132969.webp)

除了开辟空间之外, 还会调用构造函数对对象初始化

使用 `malloc` 动态开辟: 

![|huge](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/image-20220629173737579.webp)

只负责开辟空间, 不调用构造函数, 对象不初始化

> 对象实例化之后, 在对齐进行初始化就不容易了
>
> 因为 对象的成员一般会设为私有的, 所以在对象之外无法操作, 除非再实现一个初始化函数, 得不偿失
>
> 并且, 构造函数也不能手动调用, 所以 `malloc` 自定义类型 一般不用 

### operator new 和 operator delete

`operator new` 和 `operator delete`是系统提供的`全局函数`

在实际使用`new` 和 `delete` 时
`new`其实是 在底层调用`operator new`来申请空间, `delete`则是 在底层通过调用`operator delete`来释放空间的

而 这两个全局函数的内容其实也是调用了 `malloc` 和 `free`, 并在此基础上进行了改造: 

`operator new`:

![operator new |inline](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/image-20220629174925434.webp)

`operator delete`:

![operator delete |inline](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/image-20220629175405517.webp)

> `operator new` 实际也是通过`malloc`来申请空间, 如果`malloc`申请空间成功就直接返回
> 否则执行用户提供的空间不足应对措施, 如果用户提供该措施就继续申请, 否则就抛异常
>
> `operator delete` 最终是通过`free`来释放空间的

这两个全局函数可以直接调用, 也可以通过`new` 和 `delete` 调用
直接调用的方法与`malloc`相同

```cpp
int* pa = (int*)operator new(sizeof(int));
```

像这样使用 `operator new` 就可以申请一块空间

但是对于自定义类型来说, `operator new` 就只能做到申请空间而已, 作用与`malloc`一样, 无法调用对象的构造函数初始化

而 `new` 可以, 所以 `new` 可以被看作 `operator new + 构造函数`

同理, `delete` 也可以被看作 `operator delete + 析构函数`

#### 抛异常

什么是抛异常？

与 `malloc` 申请空间失败返回空指针 不同, `new` 申请空间失败的表现是 `抛异常`

有抛异常, 就需要接收异常, 否则程序会直接崩溃

> 这也是为什么 `new` 不需要像 `malloc` 一样, 在申请空间结束之后检查是否申请成功

抛异常演示: 

![抛异常未接收 |inline](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/image-20220629180854302.webp)

如果接收了抛出的异常: 

![ |huge](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/image-20220629181443062.webp)

#### operator new 和 operator delete 的类专属重载

介绍过 `new` 和 `delete` 后, 其实 使用 `new`和`delete` 会调用 两个全局函数

不过这两个全局函数是 `可以在类中重载` 的, 这就意味着
使用`new`申请自定义类型的空间时, 其实是可以调用重载的`operator new`进行申请
意思就是, 可以手动设置 `new` 申请自定义空间的方式

这是一个非常重要的特性

> 可根据这个特性实现: 申请自定义类型空间时, 不通过 `堆区` 而是 `从内存池中申请空间`
>
> 进而大幅度提升`new`申请自定义类型空间的效率

### 定位new表达式 placement-new

定位`new`表达式, 是在已经`开辟的原始内存空间`中调用构造函数初始化一个对象

即, 对使用`malloc` 或 `operator new` 开辟的自定义类型的空间, 调用构造函数初始化一个对象

使用方法是: `new(开辟空间的地址)开辟空间的类型(初始化参数)`

> 初始化参数, 即构造函数所需传参

此操作可以解决 `已经开辟的自定义类型空间无法初始化的问题`

![|inline](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/image-20220629213043600.webp)

![|inline](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/image-20220629213200638.webp)



# 面试问题

## malloc、calloc、realloc有什么区别

```cpp
void* malloc (size_t size);
```

```cpp
void* calloc (size_t num, size_t size);
```

```cpp
void* realloc (void* ptr, size_t size);
```

1. 首先, 除了最基础的使用传参不同之外, 他们的作用也是不同的
2. malloc 的作用, 是向内存申请一段连续的空间, 申请成功返回这块空间的地址, 失败则返回空指针, 且不对空间数据初始化
3. calloc 的作用同样是向内存申请一段连续的空间, 申请成功返回空间的地址, 失败则返回空指针, 不过 会将空间数据按每字节初始化为0
4. realloc 的作用是, 调整一段动态开辟的空间的大小, 传参除了原空间地址之外, 还需要传入的是最终目标大小而不是调整的大小。调整之后, 返回结果空间的地址
5. realloc 扩充空间, 原则上在原空间基础上向后扩充, 若原空间后的空间充足, 则扩充完毕后返回原空间地址；若原空间后的空间不足, 则重新申请一段连续的空间, 并将原空间数据拷贝至新空间对应位置, 然后返回新空间地址

## new 与 malloc 有什么区别

1. 除使用方法不同,  `new`是关键字, 而`malloc`是函数之外, 还有具体功能的区别
2. 对于内置类型, `new` 和 `malloc` 除使用方法不同之外, 基本上没有区别, 结果也是一模一样的, 唯一不同的是就是
    `new` 申请空间失败抛异常, 而 `malloc` 申请空间失败返回空指针
3. 对于自定义类型, `new` 除了申请空间之外, 还会调用内置类型的构造函数对对象初始化；而 `malloc` 不能调用构造函数, 毕竟C语言中的函数
4. 再有就是, 自定义类型中, 可以对 `operator new` 进行重载, 进而可以将 `new` 改变为在一定程度上按照指定的思路开辟空间 

## free 与 delete 有什么区别

1. `free` 和 `delete` 的作用都是对 动态开辟的内存空间进行释放, 在处理内置类型上, 没有什么不同
2. 而 在处理 自定义类型的空间上, `delete` 还会调用 自定义类型的析构函数进行资源的清理
3. 另外就是, 在自定义类型中, 可以对`operator delete`进行重载, 在一定程度上修改`delete`的某些思路

## 什么是内存泄漏？及如避免内存泄漏

内存泄漏, 指因为疏忽或错误造成`程序未能释放已经不再使用的内存`的情况。并且, 内存泄露并不是只物理上内存泄露、消失了什么的, 而是指 `失去了对已经开辟出的 且没有释放的内存空间的控制`。

举示例讲, 就是
存在一块被一个指针指向的动态开辟的空间, 不过不经意间发生了事故, 导致这个指针指向了别的空间, 而原空间无法再被找到并释放, 就造成了内存泄漏

内存泄漏对于经常被打开关闭的程序没有什么大的危害, 因为程序的关闭会清理资源将使用过的内存还给操作系统, 但是长期运行的程序出现内存泄漏, 影响很大, 如操作系统、后台服务等等, 出现内存泄漏会导致响应越来越慢, 最终卡死

`如何避免内存泄露的出现呢？`

1. 工程前期良好的设计规范, 养成良好的编码规范, 申请的内存空间记着匹配的去释放。ps: 这个理想状
    态。但是如果碰上异常时, 就算注意释放了, 还是可能会出问题。需要下一条智能指针来管理才有保
    证。
2. 采用RAII思想或者智能指针来管理资源。
3. 有些公司内部规范使用内部实现的私有内存管理库。这套库自带内存泄漏检测的功能选项。
4. 出问题了使用内存泄漏工具检测。

内存泄漏非常常见, 解决方案分为两种: 1、事前预防型。如智能指针等。2、事后查错型。如泄漏检测工具。  
