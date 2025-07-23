---
draft: true
title: "[C++] 类和对象(1): 认识类、封装特性、隐含的this指针..."
pubDate: "2022-06-18"
description: "C++ 中的类其实与 C语言 中的结构体类似。不过, C++将C语言 中的 struct 进行了升级, 在C++中 struct 可以用来定义类"
image: https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/202306251806115.webp
categories:
    - Blogs
tags:
    - C++
    - 类和对象
---

# 一、类

C++ 中的类其实与 C语言 中的结构体类似。不过, C++ 将 C语言 中的 `struct` 进行了升级, 在C++中 `struct` 可以用来定义类

C++ 升级了 `struct` , 使其定义的结构体: 

1. 结构体内部可以定义函数
2. 结构体名可以直接作为类型使用

```cpp
struct User
{
	void Init(const char* name, const char* sex, const char* tele, int age)
	{
		strcpy(_name, name);
		strcpy(_sex, sex);
		strcpy(_tele, tele);
		_age = age;
	}
	void Print()
	{
		cout << _name << "  " << _sex << "  " << _tele << "  " << _age << endl;
	}

	char _name[20];
	char _sex[10];
	char _tele[20];
	int _age;
};
```

类似这样的结构体, 在 C++ 中是合理合法的, 函数是可以被定义在结构体内部的。
并且在定义变量时, 可以直接使用 `User` 不用再添加 `struct` 
结构体内的函数也可以用使用结构体变量的方式调用。

![|inline](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250711175559580.webp)

不过, 在 C++ 中定义结构体通常用 `class` 而不是 `struct`；定义出的类型也通常被称为 `类`, 而不是 结构体；使用类型定义的变量也不再称为变量了, 而是 `对象`.

![](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250711175601345.webp)

上图简单的将 由 `struct定义的结构体` 改为了 `由class定义的类`, 并进行了一定的修改

类的定义结构体的定义究竟有何不同？

# 二、类的定义

类的定义其实与结构体的定义相似, 将 `struct` 改为了 `class`

其实经过C++ 升级过后的 `struct` 与 `class`, 基本上是一样的
不同的地方在于 默认的访问权限

## 2.1 public、private

C++中的 结构体和类的内部 其实都设置有访问权限。但是结构体与类 默认的访问权限 略有不同。

结构体内部成员默认是 `公有的(public)`；而类内部成员默认是 `私有的(private)`；

而 public、private 被称为访问限定符

> public修饰的成员 和 private修饰的成员 区别是: 
>
> 1. 公有(public) : 公有成员可以在外部直接进行访问
>
> 2. 私有(private) : 私有成员不能在外部直接进行访问, 但是可以通过公有成员间接进行访问
>
>     > 除公有、私有之外, 还存在一个访问限定符 : 保护(protected)。现阶段不过多介绍, 可将其看为 与private 相同

在上边介绍 `class` 时, 其实就已经使用过 `public` 和 `private` 

但是访问限定符具体有什么作用呢？

以上图中的 `User 类`

![|tiny](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250711175604496.webp)

```cpp
class User
{
public:
	void Init(const char* name, const char* sex, const char* tele, int age)
	{
		strcpy(_name, name);
		strcpy(_sex, sex);
		strcpy(_tele, tele);
		_age = age;
	}
	void Print()
	{
		cout << _name << "  " << _sex << "  " << _tele << "  " << _age << endl;
	}

private:
	char _name[20];
	char _sex[10];
	char _tele[20];
	int _age;
};
```

在此类中, public 修饰两个成员函数, private 修饰四个成员变量。就表示, 在类外不能直接访问成员变量

![ ](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250711175606958.webp)

无法用 `u1._age` 来直接访问 `对象u1 中的 _age 变量`

但是因为 private修饰的成员 只是`无法在类外进行访问, 在类内依旧是可以进行访问的`, 所以可以通过 public修饰的成员对private成员进行间接的访问:  

![ ](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250711175609043.webp)

---



![ ](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250711175610681.webp)

> 有一个细节需要注意的是, 访问限定符只在编译时起作用, 当编译完成, 数据映射至内存时就已经不存在什么公有成员、私有成员的概念了

## 2.2 类的封装特性

众所周知, C++ 是一种面向对象的编程语言。面向对象, 有三大基本特性: **`封装`**、继承、多态

使用C++类, 可以更好的将数据与操作封装结合起来。而 C语言的结构体不可以。

比如在 之前文章中用C语言分析实现过的数据结构: `栈`

**`C语言 结构体实现栈: `**

![Stack](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250711175613068.webp)

使用 C语言 实现的栈, 其结构与操作接口是分离的。而使用 C++ 的类进行对栈的实现, 就完全可以将操作接口也写入类中

**`C++ 类实现栈: `**

```cpp
#include <iostream>
#include <cstdlib>
#include <cassert>
using namespace std;

class Stack 
{
public:
	// 栈的初始化
	void StackInit()
	{
		_data = nullptr;
		_top = 0;			// 栈顶初始位置定义 (top = -1, 先++后赋值; top = 0, 先赋值后++)
		_capacity = 0;
	}
	// 栈的销毁
	void StackDestroy()
	{
		free(_data);
		_data = nullptr;
		_top = _capacity = 0;
	}
	// 压栈
	void StackPush(int x)
	{
		if (_top == _capacity)
		{
			int newCapacity = _capacity == 0 ? 4 : _capacity * 2;
			int* tmp = (int*)realloc(_data, newCapacity * sizeof(int));
			if (tmp == nullptr)
			{
				printf("realloc failed\n");
				exit(-1);
			}
			else
				_data = tmp;

			_capacity = newCapacity;
		}

		_data[_top++] = x;
	}
	// 出栈
	void StackPop()
	{
		assert(_top > 0);

		--_top;
	}
	// 判空
	bool StackEmpty()
	{
		return _top == 0;			// top 等于 0 栈为空, 返回 true; 不等于 0 , 返回 false
	}
	// 栈顶数据
	int StackTop()
	{
		return _data[_top - 1];
	}

private:
	int *_data;
	int _top;				// 栈顶位置
	int _capacity;			// 栈的容量
};
```

这样将 数据结构与操作接口 封装到类中有什么用呢？

> 这样的封装操作, 可以避免在C语言中可能出现的错误的操作——`不调用接口, 直接操作数据`
>
> 对数据结构中的数据进行操作时, 是`很忌讳不调用接口直接对数据进行操作`的: 
>
> 比如: 栈初始化时
>
> ![class_StackInit |wide](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250711175617049.webp)
>
> 这两种方式, 直接操作数据肯定是不规范的。有时候会造成不必要的麻烦
>
> 而类的出现, 将成员变量修饰为 private 成员, 直接在编译时阻止了直接操作数据这种不规范的操作

类, 将 成员与操作接口 封装至在一起, 但是设置不同的访问权限。类的封装特性, 其实可以看作是对数据的管理。

## 2.3 类的作用域

既然, 一个类内部可以包含 成员函数。那么函数的声明及定义就有可能分离: 

![](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250711175618930.webp)

当类中, 成员函数的声明与定义分离, 定义时需要在函数名前加 `类名::` 连接`（:: 是作用域运算符）`

> 需要注意: 
>
> 在类内定义的成员函数, 默认 `inline`, 所以 一般成员函数较小时在类内定义

## 2.4 类的大小

之前C语言关于结构体的文章中, 分析了一个结构体类型大小的计算方式。

引入了一个概念叫结构体对齐, `C++中类的大小计算, 也是根据对齐计算的`。且 类的对齐方式 与 结构体对齐的方式 是一模一样的。

> 这里不再赘述, 如有需要可以参考结构体博文: 
>
> [详解结构体, 详细分析结构体对齐](http://humid1ch.cn/posts/C-Struct)

所以, **`一般的类的大小其实就是对齐后成员变量的大小`**

但是, 由于在类内可以存在成员函数, 那么就存在一个特殊的类——只有成员函数, 没有成员变量的类: 

![class_onlyfunction](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250711175621349.webp)

像这样没有成员变量的类, 它的大小会是多少呢？

![|huger](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250711175623000.webp)

可以看到, 只有成员函数的类的大小为 `1`

如果是空类呢？

![|huger](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250711175625089.webp)

可以看到, 没有成员变量的类, 其大小都为 `1`

所以, 可以说 C++中, 没有成员变量的类, 其大小为 `1` 
(表示这个类存在)

---

为什么？为什么没有成员变量, 类的大小就为 `1` 呢？成员函数大小不算入类的大小吗？那成员函数存放在哪呢？

### 2.4.1 类对象的存储

上边提到, 类的大小计算其实是 `类内所有成员变量经对齐后的大小的和`

那么一个类 定义的一个对象, 这个对象的内容在内存中大致上是如何存储的呢？

对一个有成员变量和成员函数的类, 定义出的对象的内容有成员变量是一定的。但`这个对象的内容会存在成员函数吗？`

以这个类为例: 

![class_User](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250711175627688.webp)

根据这个疑问, 就可以假设两种情况: 

1. 每个对象均存储一份成员函数

    > 对于相同的类, 每个对象大致是这样的
    >
    > ![|small](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250711175629704.webp)
    >
    > 此方式有一个缺点, 就是每个对象中都存储有功能相同的函数, 会造成浪费

2. 多个相同类的对象共用同一个成员函数

    > 对于相同的类, 多个对象大致是这样的: 
    >
    > ![ |wide](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250711175631561.webp)

类对象在内存中的存储大致也就这两种方式了, 那么计算机中究竟使用的是哪一种呢？

调用函数调试, 并查看反汇编代码: 

![ ](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250711175633471.webp)

可以发现, 相同类的不同的对象, 调用同一个成员函数, 调用地址相同。

所以计算机中, 类对象的存储, 其实是第二种: **`多个相同类的对象共用同一个成员函数`**

---

看到这里有一个疑问——对象调用成员函数可以访问对应对象的成员变量, 但是在定义成员函数时, 并没有进行传参操作。

那么怎么能够做到的 对象调用成员函数可以访问对应对象的成员变量呢？

## 2.5 隐含的 this指针

我们知道, 对象中是不存储类的成员函数的。那么, 是如何保证类似这样的操作: `U1.Print`、`U2.Print`, 可以分别操作 `U1`、`U2`的成员变量的呢？

其实, 类的成员函数中 `除自己写的参数之外, 还有一个隐含的 this指针 参数`, 就是用来指定函数所控制的对象的: 

同样以此类为例: 

![ ](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250711175635672.webp)

定义不同的对象, 并且调用函数时, 编译器会进行这样的处理: 

![](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250711175637798.webp)

所以, 对于一个成员函数, 编译器处理后其实是这样的: 

![ ](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250711175639473.webp)

但是这些操作都是由 `编译器` 完成的, 不能手动添加, 手动添加是错误的: 

![ ](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250711175642091.webp)


![](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250711175643977.webp)

所以, `this指针在定义(声明)成员函数时不能写出来, 也不能手动传参, this指针传参的整个过程是编译器完成的。所以被称为 隐含的this指针`

虽然传参是编译器执行的, 但是 ` 成员函数内部其实是可以直接使用 this指针 ` 的。

可以使用成员函数将 this指针 的地址打印出来: 

![|inline](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250711175645776.webp)

### 2.5.1 面试: this指针可否为空指针？this指针存储在哪个区？*

思考一个问题, 既然 this指针传参的整个过程都是由编译器实现的, 那么this指针能否为空指针呢？

以下面这段代码为例: 

```cpp
class A
{
public:
	void PrintA()
	{
		cout << _a << endl;
	}
	void Show()
	{
		cout << "Show()" << endl;
	}
private:
	int _a;
};

int main()
{
	A* p = nullptr;
    p->Show();
	p->PrintA();

	return 0;
}
```

这段代码 定义了 类的一个空指针, 再用空指针调用成员函数

试分析一下, `这段代码是否有可能会崩溃？如果崩溃了, 原因在哪里？`

答案是, 当代码进入 `PrintA()` 执行 `cout << _a << endl;` 时, 程序崩溃。`原因是对空指针解引用`

注意: 在执行 `Show()` 时并不会崩溃, 因为 `Show() 函数中并没有对 this指针进行解引用`

![|huge](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250711175648978.webp)

由此, 可以判断出 其实` this指针 是可以为空指针的, this指针为空指针时不会有任何的编译错误`。但是, 如果 this指针为空指针, 那么成员函数很有可能会对空指针解引用, 发成运行错误导致程序崩溃。所以, `this指针 最好不要为空指针`

---



传参时, this指针 不能被写出来, 那么 this指针 存储在内存中哪个区域呢？

答案是, `栈区`。因为, 归根结底 `this指针也只是函数的一个形参 `而已, 形参也就存储在栈帧中, 也就是栈区。

`不过, 由于this指针 在成员函数中可能被频繁的使用到, 所以为了提高使用效率, this指针也有可能被存储至寄存器中。(因编译器而异)`

![ ](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250711175652560.webp)

