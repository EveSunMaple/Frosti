---
draft: true
title: "[C++] 模板的特化相关介绍: 非类型模板参数、模板的全特化、偏特化分析、迭代器萃取分析..."
pubDate: "2022-07-18"
description: "之前关于模板 还有一些问题没有解决, 本篇文章就是对模板 提出问题和解决问题的"
image: https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/202306251810793.webp
categories:
    - Blogs
tags:
    - C++
    - 泛型编程
---

本篇文章是 C++ 模板的第二篇文章, 第一篇文章简单介绍了模板的函数模板、类模板的相关定义及调用等

然而 从初始模板到这篇文章之间, 已经介绍了C++中有关 string、vector、stack、queue、priority_queue、iterator的功能、实现等内容, 相信 对模板已经有了一定的认识

但是模板还有一些问题没有解决, 本篇文章就是对模板 提出问题和解决问题的

---

# 非类型模板参数

在一般的模板中, 无论是函数模板还是类模板, 他们的定义都是, 像这样的: 

![|inline](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/image-20220716232837542.webp)

模板参数都是 虚拟的, 传参时都需要传类型, 但是 在定义模板时, 模板参数还有另一种形式

即, 不传 类型, 而是已经知道了类型 传数值, 叫做非类型模板参数, 并且 C++11 引入了一种使用非类型模板参数的容器 叫 array

## 什么是 非类型模板参数？

其实查看一下 array 容器的模板定义一眼就可以看出来什么是 非类型模板参数: 

![ ](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/image-20220716233342736.webp)

对, 没错, **非类型模板参数就是已经知道类型的模板参数**。使用这个模板 在传参的时候, 除了传类型之外, 还要传入**指定类型的数值**

> 其实 非类型模板参数只能传入整型数值: size_t、int、char
>
> 并且, 传入的数值是一个常量, 具有常性无法修改！！

而在 array 这个容器中, size_t N 这个模板参数的作用, 是为了定义一个大小为N的数组准备的, 并且这个数组是静态的, 与C语言中原生定义的数组没有什么区别: 

![|inline](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/image-20220716234201918.webp)

也就是说, 在容器 array 中, 存在的非类型模板参数是为了指定需要定义数组的大小

> array 这个容器, 其实就是 C语言中的原生数组, 只不过在C++中 封装实现了
>
> array 相比原生的数组, 具有优势的地方好像只有一个: **array 实例化的对象, 边界检查相比原生指针更准确**
>
> 因为 array 的边界是 assert 强制检查的

array 没有什么需要注意的地方, 一般只用于开辟大数据的静态数组

但是 由于他是在内存的栈区 开辟空间的, 而栈区又很小, 所以还是不常用, 还是 vector 用的多

# 模板的特化

## 特化的概念

C++ 模板是泛型编程的一种, 是为了一套代码 多方使用而出现的

但是 在实际的使用中总会有 特殊的类型需要特殊的处理的情况发生, 就比如这样: 

![|inline](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/image-20220718151812209.webp)

greater 是一个函数模板, 是用来比较两个类型的大小的
在使用时, 对于a, b 这两个变量可以直接 返回正确的返回值, 但是 当传入的是 a, b 的指针时, 就会发生错误: 

![|huge](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/image-20220718153756173.webp)

因为, greater 函数是作用是 直接对比传入类型的数据, 而 c, d 是两个指针 指针对比是对比的地址大小而不是指针指向的内容大小, 所以对于这样的情况就需要 特殊处理: 

![|inline](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/image-20220718161107898.webp)

经过特化处理的类型, 再使用函数模板时, 会调用最适合的函数模板: 

![|inline](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/image-20220718161234325.webp)

不会再出现, 返回值错误的情况

> 当然, 当前只是以 函数模板 举一个例子, 来解释一下什么特化, **真正的编程中, 一般不对函数模板特化**, 因为特化需要制定 类型, **函数模板被指定类型其实跟 定义一个特定类型的函数没什么区别**, 所以 一般不对函数模板特化, **重新再写一个重载函数就行了**

一句话总结模板的特化就是: 在原模板的基础上, 针对指定类型所进行单独、特殊处理的实现方式
模板特化中分为 **函数模板特化** 与 **类模板特化**  

上面介绍的是函数模板特化, 其特化的条件是: 

1. 必须先有基础模板, 才能特化
2. 关键字template后面接一对 **空的尖括号<>**
3. 函数名后跟一对尖括号, 尖括号中指定需要特化的类型, 即 **<指定类型>**
4. **函数形参表必须要和模板函数的基础参数类型完全相同**
    即, 基础参数类型有几种, 特化就要有几种

而 类模板的特化 更经常使用, 下面介绍类模板的特化

## 类模板的特化

类模板的特化 随便一个类模板为例: 

![|inline](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/image-20220718164040693.webp)

> 使用此模板实例化对象时, 会打印:  **TT <T1, T2>,  即 调用原模版**

类模板的特化有 两种形式: 全特化和偏特化

下面一一来介绍

### 类模板全特化

类模板全特化的意思是, 对 类模板所有的模板参数进行特化处理, 即像这样

![](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/image-20220718165353335.webp)

当类模板对指定类型特化时, 使用指定的类型实例化对象就会调用 特化版的类模板: 

![|inline](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/image-20220718164552275.webp)

> 类模板的全特化 与 函数模板的特化, 其实都不经常使用, 因为类模板的全特化也像是直接定义了一个指定类型的类而已, 类模板的特化更重要的、更常用的是, 类模板的偏特化(半特化)

### 类模板的偏特化

类模板偏特化的作用更像是对类模板的限制, 而不是指定类

偏特化有两种 表现形式: 

#### 1. 部分特化

看名字就可以看出来, 部分特化, 即 **将类模板参数列表中的一部分参数特化**

![|tiny](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/%E4%B8%BE%E4%B8%AA%E6%A0%97%E5%AD%90.webp)

![|inline](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/image-20220718165544695.webp)

而 当对象实例化的时候, 如果第二个参数是 double, 那么就会调用 特化过的类模板进行实例化: 

![|inline](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/image-20220718165859957.webp)

除了这种, 对类模板参数部分特化的偏特化之外, 还有另外一种形式

#### 2. 参数形式限制特化

特化 并不仅仅只是将模板参数特定为某一个类型, 更可以将参数模板特化为 某种类型: 

![|inline](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/image-20220718171040641.webp)

特化 更可以对特定的某种类型处理: 

![|inline](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/image-20220718171215138.webp)

> 注意: 只有所有参数都满足特化类型时, 才会去调用特化类模板
>
> ![|wide](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/image-20220718171802484.webp)



---

# 迭代器萃取

