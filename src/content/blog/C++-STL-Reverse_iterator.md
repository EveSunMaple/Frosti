---
draft: true
title: "[C++-STL] 反向迭代器实现原理的相关介绍"
pubDate: "2022-07-16"
description: "反向迭代器该如何实现呢？它究竟是什么东西呢？"
image: https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/202306251814470.webp
categories:
    - Blogs
tags:
    - STL
---

在 string 类介绍的时候, 就已经开始接触迭代器了

在 string 和 vector 种, 迭代器其实就是指针, 但是在 list、stack、queue 中 迭代器就不能简单地看作是指针了, 并且在之后 接触地STL容器 之中, 基本不会再遇到内置指针作为迭代器地情况

并且 无论是 string、vector 还是 list、stack、queue, 他们的正向迭代器在之前的文章中都已经实现过了

那么反向迭代器该如何实现呢？它究竟是什么东西呢？

---

# 什么是反向迭代器

正向迭代器, 我们知道是按照正常思维从头到尾迭代的, 即 ++ 就是向后移动, -- 就是向前移动

那么什么是反向迭代器呢？

其实就是反正常思维的迭代器, ++ 是向前移动, --是向后移动, 与正向迭代器的迭代方向是相反的

一般在类中 都会有取迭代器的成员函数: `begin()`, `end()`, `rbegin()`, `rend()`

> STL源码中, 取正向迭代器的函数: 
>
> 1. `begin()`, 就是取容器中**第一个数据的位置**, 并以迭代器类型返回
> 2. `end()`, 就是取容器中的**最后一个数据的下一位**, 并以迭代器类型返回
>
> 即, `begin()` 和`end()`所取迭代器的数据范围是左闭右开的 `[begin(), end())`

> 而 STL源码中的去反向迭代器的函数, 正好与之相反: 
>
> 1. `rbegin()`, 取容器中**最后一个数据的下一位**, 并以迭代器类型返回
> 2. `rend()`, 取容器中**第一个数据的位置**, 并以迭代器类型返回
>
> 并且, `rbegin()` 和 `rend()` 所取的迭代器, `++` 为向前移动, `--` 为向后移动
> 所以, `rbegin()` 和 `rend()` 所取得迭代器的数据范围 同样可以看作左闭右开 `[rend(), rbegin())`

# 反向迭代器的实现

在上面介绍完反向迭代器之后, 肯定会想到: 

反向迭代器的实现也太简单了, ++ 重载函数内 换成 --, -- 重载函数内换成 ++, 再把 类中 rbegin() 和 rend() 的返回位置改一下就可以了

其实这样的实现是可行的, 但是不够通用, 如果想要实现不同类中各自的迭代器, 就要分别实现许多遍太过繁琐, 正向迭代器都可以定义为 不同的类通用的, 反向迭代器如果只是单独堆某个类定义的话 太low了

所以 反向迭代器 也要设计为 不同的类传不同的模板参数就可以实现不同的反向迭代器

其实 STL 源码中也是这样设计的: 

![|inline](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/image-20220716005519094.webp)

STL源码中的反向迭代器 是通过已经实现了的正向迭代器来实现的

反向迭代器的源码框架大概就是这样, 其成员函数就是 迭代器需要的 ++、--、*、->、==、!= 以及部分迭代器才需要的 +、+=、-、-=、[]等操作符的重载

> STL 源码实现大多是进行过优化的, 不考虑优化模拟实现的话可以抛弃一些暂时未知的数据

下面就可以根据 STL源码大致的框架, 进行模拟实现了: 

![reverse_iterator_fix](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/reverse_iterator_fix.webp)

```cpp
template<class Iterator, class Ref, class Ptr>
struct reverseIterator
{
    typedef reverseIterator<Iterator, Ref, Ptr> Self;
    Iterator _it;

    // 构造函数
    // 反向迭代器的成员变量是正向迭代器, 构造函数都是在对象实例化时调用的
    // 反向迭代器就是在 类的 rbegin() 或 rend() 中, 构造函数的传参也是
    // 需要将反向迭代器的成员变量初始化为 其调用对象的相应的正向迭代器
    reverseIterator(Iterator it)
        :_it(it)
        {}
    // * 操作符重载
    // 作用是 *解引用反向迭代器, 可提供对返回值的修改, 所以要用&返回
    // 返回的是 当前位置正向迭代器的前一位的解引用, 实质返回的是什么需要看 正向迭代器的实现
    // 为什么是正向迭代器的前一位？
    // 以 rbegin() 获取的反向迭代器为例, 获取的是最后一个元素的下一位, 即不在容器的数据范围内, 如果直接对当前位置的正向迭代器解引用, 会发生错误, 前一位才数据容器的数据范围
    Ref operator*()
    {
        Iterator tmp(_it); 		// 因为返回的是正向迭代器的前一位, 所以不能拷贝构造, 只能根据 传成员变量调用构造函数构造 Iterator
        return *(--tmp);
    }
    // -> 操作符重载
    // -> 一般用于指针操作, 所以返回应该是指针
    // 返回的也是 当前位置正向迭代器的迁移位置解引用的取地址
    Ptr operator->()
    {
        return &(operator*()); 		// 复用 *重载
    }
    // 前置++重载
    // 前置 ++\-- 都直接改变原值所以不需要拷贝, 且返回的都是修改后的迭代器
    // 后置 ++\-- 返回修改前的迭代器, 所以需要保存修改前的迭代器
    Self& operator++()
    {
        --_it; 			// 反向迭代器 ++其实是 --

        return *this;
    }
    // 后置++
    Self operator++(int)
    {
        Self tmp = *this; 		// 保存修改前的迭代器
        --_it;
        return tmp;  			// 返回临时变量所以 传值返回
    }
    // 前置--
    Self& operator--()
    {
        ++_it; 			// 反向迭代器 --其实是 ++
        return *this;
    }
    // 后置--
    Self operator--(int)
    {
        Self tmp = *this;
        ++_it;
        return tmp;
    }

    // != 与 == 的重载
    bool operator!=(const Self& sit)
    {
        return _it != sit._it;
    }
    bool operator==(const Self& sit)
    {
        return _it == sit._it;
    }
};
```

这就是 反向迭代器的实现, 基本可以适用于大部分的容器, 但是没有实现 +、+=等运算符重载。

---
