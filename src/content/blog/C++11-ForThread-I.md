---
draft: true
title: "[C++] C++标准中的线程: C++标准线程、锁、条件变量、原子操作的使用, "
pubDate: "2024-12-09"
description: ""
# image: 
categories: ['tech']
tags: ["C++", "C++11", "多线程"]
---

`Linux`线程的相关内容, 概念、锁、条件变量、信号量等在前面的文章中已经做了介绍

C++在`C++11`标准中, 新增了线程相关的类等: `std::thread` `std::mutex` `std::condition_variable` `std::atomic`等等

`C++11`标准中的线程, 只是为跨平台实现的, 底层概念上与`Linux`或`Windows`上没有差别

本篇文章, 只是对相关类、接口的使用介绍

# `std::thread`

`std::thread`是`C++11`实现的线程类, 头文件为`<thread>`:

![](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/202412191946968.webp)

`std::thread`类的成员很少, 涉及到线程的`id`、创建、等待、分离、交换、销毁等

>  以下的介绍中, 省略`std::`命名空间访问

## `thread::id`

`std::thread`创建的线程也有自己的唯一标识, 它不是`Linux`中的`pthread_t`, 而是C++自己实现的标识

C++标准的线程标识类型是`std::thread::id`, 不是基础类型, 而是C++封装的一个类:

![|wide](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/202412201021854.webp)

从相关的源码中可以看到, `thread::id`是`thread`的一个内部类

`thread::id`中, 存在成员对象`_M_thread`实际是`unsigned long int`类型数据, 作为线程的唯一标识符

使用`<<`向标准输出流输出, 可以打印出`thread::id::_M_thread`, 即 线程的唯一标识符

## `thread` **

`thread`是C++标准封装的线程类

`thread`的构造函数, 就能创建线程:

![](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/202412201040580.webp)

首先, 为防止线程被拷贝破坏线程的唯一性, `thread`类禁用了**拷贝构造函数**和**普通赋值重载函数**:

![|biger](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/202412201043756.webp)

但保留了**移动构造函数**和**移动赋值重载函数**, 为必要时线程所有权的转移提供了方法

---

C++使用`std::thread`创建线程非常的简单:

```cpp
#include <chrono>
#include <iostream>
#include <thread>

int cnt = 0;

void loopPrint() {
	while (true) {
		std::cout << "thread_"<< std::this_thread::get_id() << ", out: " << cnt++ << std::endl;
		std::this_thread::sleep_for(std::chrono::milliseconds(500));
	}
}

int main() {
	std::thread td1(loopPrint);

	td1.join();

	return 0;
}
```

> 上面代码中使用到一部分比较陌生的内容:
>
> 1. `std::this_thread`
>
>     这是`C++11`的一个命名空间, 内部提供了一些可以直接在线程内使用的接口
>
>     ![|wide](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/202412201126131.webp)
>
>     `sleep_for()`: 可以让线程`sleep`一段时间
>
>     `sleep_until()`: 可以让线程`sleep`到某个时间点
>
>     `get_id()`: 可以获取线程的`id`, 即 `thread::id`
>
>     `yield()`: 可以让线程让出时间片, 即 调用后线程将不在继续执行, 让出时间片让其他线程执行
>
>     ---
>
>     上面的代码中使用了`std::this_thread::get_id()`和`std::this_thread::sleep_for()`
>
>     用于获取线程`id` 和 让线程`sleep`上`500ms`
>
> 2. `std::chrono`
>
>     `<chrono>`是C++标准的时间库, 实现了一些有关时间的类和接口:
>
>     ![|wide](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/202412201126773.webp)
>
>     上面使用`std::chrono::milliseconds(500)`, 就是实例化一个表示`500ms`的时间段对象
>
>     另外还有其他的一些时间的类或函数

执行结果:

![|biger](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/202412201104426.gif)

实例化`thread`对象调用构造函数时, **参数传入需要让线程执行的函数**, 就能创建一个执行传入函数的线程

此时, 调用的构造函数是:

![|biger](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/202412201108845.webp)

是一个模板化的构造函数:

1. 第一个模板参数, 也是构造函数的第一个参数

    需要传入, **让线程执行的函数**, 即 线程函数

2. 第二个模板参数, 是一个可变参数

    这个可变参数, 实际是第一个参数的参数, 即, **线程函数的参数**

    **如果线程函数没有参数, 就不用传参**

原则上, 实例化线程时必须要传参, 为线程指定执行代码

如果实例化线程时不传参, 那么这个线程对象实例化出来, 什么用都没有

因为`std::thread`的无参默认构造函数是编译器自动生成的, 基本什么都不会做:

![](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/202412201134600.webp)

所以, **使用`std::thread`创建线程时, 必定要传参指定线程的执行代码**

### `thread`线程函数传参问题 **

创建线程时, 需要指定 线程函数的

大多数情况, 线程函数是带参的, 此时就需要在创建线程时, 指明线程函数需要使用的参数

这也是`thread()`的模板构造函数中, 可变参数存在的意义

举一个简单的例子:

```cpp
#include <chrono>
#include <iostream>
#include <thread>

void loopPrint(int cnt) {
	while (cnt < 10) {
		std::cout << "thread_" << std::this_thread::get_id() << ", out: " << cnt++ << std::endl;
		std::this_thread::sleep_for(std::chrono::milliseconds(500));
	}
}

int main() {
	int cnt = 5;
	std::thread td1(loopPrint, cnt);

	td1.join();

	std::cout << "主线程, cnt: " << cnt << std::endl;

	return 0;
}

```

这段代码的执行结果为:

![|biger](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/202412201147835.gif)

`cnt`成功传入到`loopPrint()`函数中, 而且是传值传参, 所以主线程内的数据不会被修改

如果将`loopPring()`参数改为 引用传参:

```cpp
void loopPrint(int& cnt) {
	while (cnt < 10) {
		std::cout << "thread_" << std::this_thread::get_id() << ", out: " << cnt++ << std::endl;
		std::this_thread::sleep_for(std::chrono::milliseconds(500));
	}
}
```

尝试编译运行:

![|biger](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/202412201152237.webp)

发现报错!

尝试将参数换为`const int&`, 再试一试:

```cpp
#include <chrono>
#include <functional>
#include <iostream>
#include <thread>
#include <utility>

void loopPrint(const int& cnt) {
	std::cout << "thread_" << std::this_thread::get_id() << ", out:" << cnt << std::endl;
	std::this_thread::sleep_for(std::chrono::milliseconds(500));
}

int main() {
	int cnt = 6;
	std::thread td1(loopPrint, cnt);

	td1.join();

	std::cout << "主线程, cnt: " << cnt << std::endl;

	return 0;
}
```

![|biger](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/202412201732204.webp)

发现又可以了!

回过头, 这里直接引用传参为什么会报错呢?

报错的提示语是: `error: static assertion failed: std::thread arguments must be invocable after conversion to rvalues`

这个报错的意思为: **静态断言失败: `std::thread`参数, 在转换为右值时必须可用**

线程函数的参数是`int&`类型的, 是一个左值引用类型, 好像和右值没有关系

但是如果改为`const int&`, 就能编译通过

而C++左值引用有一个特性是: **左值引用无法引用右值, 但是`const`左值引用可以引用右值**

而且编译的报错信息是**参数在转换为右值时必须可用**

这可能说明一个问题, `std::thread`构造函数内部创建线程, 向线程函数传参传的实际是一个右值

即, **构造`std::thread`线程时传参, 构造函数会在内部将可变参数转换成右值, 再传给线程函数**

从上面的现象中, 可以猜测出这一点

结合`std::thread`构造函数原型:

```cpp
template <typename _Callable, typename... _Args, typename = _Require<__not_same<_Callable>>>
explicit thread(_Callable&& __f, _Args&&... __args);
```

可变参数使用了万能引用, 而万能引用之后, 如果要以原类型再传参, 通常要通过`std::forward()`

阅读`std::thread`源码, 可以发现`thread`构造函数中有一段用到了模板参数:

```cpp
using _Invoker_type = _Invoker<__decayed_tuple<_Callable, _Args...>>;
_M_start_thread(
    _S_make_state<_Invoker_type>(std::forward<_Callable>(__f),
                                 std::forward<_Args>(__args)...),
								  __depend);
}
```

`_M_start_thread()`很明显是用来启动线程的

参数是`_S_make_state<_Invoker<__decayed_tuple<_Callable, _Args...>>>()`

猜测参数是线程创建和初始化的过程:

```cpp
template <typename _Callable>
struct _State_impl : public _State {
	_Callable _M_func;

	template <typename... _Args>
	_State_impl(_Args&&... __args)
		: _M_func{ { std::forward<_Args>(__args)... } } {}

	void _M_run() {
		_M_func();
	}
};

void _M_start_thread(_State_ptr, void (*)());

template <typename _Callable, typename... _Args>
static _State_ptr _S_make_state(_Args&&... __args) {
	using _Impl = _State_impl<_Callable>;
	return _State_ptr{ new _Impl{ std::forward<_Args>(__args)... } };
}
```

`_S_make_state`相关的代码, 并没有明显转换参数的代码

而`_S_make_state()`正式进入函数体之前, 它的参数还需要创建一个类`_Invoker<__decayed_tuple<_Callable, _Args...>>`

```cpp
// A call wrapper that does INVOKE(forwarded tuple elements...)
template <typename _Tuple>
struct _Invoker {
    _Tuple _M_t;

    template <typename>
    struct __result;
    template <typename _Fn, typename... _Args>
    struct __result<tuple<_Fn, _Args...>> 
        : __invoke_result<_Fn, _Args...> {};

    template <size_t... _Ind>
    typename __result<_Tuple>::type _M_invoke(_Index_tuple<_Ind...>) {
        return std::__invoke(std::get<_Ind>(std::move(_M_t))...);
    }

    typename __result<_Tuple>::type operator()() {
        using _Indices = typename _Build_index_tuple<tuple_size<_Tuple>::value>::__type;
        return _M_invoke(_Indices());
    }
};

template <typename... _Tp>
using __decayed_tuple = tuple<typename decay<_Tp>::type...>;

public:
// Returns a call wrapper that stores
// tuple{DECAY_COPY(__callable), DECAY_COPY(__args)...}.
template <typename _Callable, typename... _Args>
static _Invoker<__decayed_tuple<_Callable, _Args...>> 
__make_invoker(_Callable&& __callable, _Args&&... __args) {
    return { 
        __decayed_tuple<_Callable, _Args...> { 
        	std::forward<_Callable>(__callable),
        	std::forward<_Args>(__args)... }
    };
}
```

`__decayed_tuple`是`tuple<typename decay<_Tp>::type...>`

它的作用, 是使用`decay`将参数包的参数类型进行衰减, 并创建一个元组`tuple`

即, 如果传入的参数是左值引用或右值引用, 经过`decay`之后, 引用属性会被衰减掉; 如果传入的参数是函数类型, 将会衰减为函数指针类型

然后, **会将衰减之后的类型和数据构造出一个`tuple`元组, 这个元组里, 存储的都是传入参数的原始类型的副本**

即, `tuple`中的数据都是没有任何引用属性的原始类型的数据, 只不过数据值与传入值相同



![|biger](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/202412201718712.gif)
