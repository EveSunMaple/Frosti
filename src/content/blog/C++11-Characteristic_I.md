---
draft: true
title: "[C++] C++11新特性介绍 分析(1): 列表初始化、右值引用、万能引用、移动语义、哈希表、智能指针..."
pubDate: "2023-04-21"
description: "本篇文章是关于C++11标准 一些常用的新特性的介绍, 比如: 列表初始化、右值引用、万能引用、完美转发、类的新默认成员函数 和 可变参数列表等"
image: https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/202306251811775.webp
categories: ['tech']
tags: ["C++", "C++11"]
---

# C++11

## 介绍

在2003年C++标准委员会曾经提交了一份技术勘误表(简称TC1), 使C++03这个名字已经取代了C++98成为`C++11`之前的最新C++标准名称

不过由于C++03主要是对C++98标准中的漏洞进行修复, 语言的核心部分则没有改动, 因此还是习惯性的把两个标准合并称为C++98/03标准

从C++0x到`C++11`, C++标准10年磨一剑, 第二个真正意义上的标准珊珊来迟

相比于C++98/03, `C++11`则带来了数量可观的变化, 其中包含了约140个新特性, 以及对C++03标准中约600个缺陷的修正, 这使`C++11`更像是从C++98/03中孕育出的一种**新语言**

相比较而言, `C++11`能更好地用于系统开发和库开发、语法更加泛华和简单化、更加稳定和安全, 不仅功能更强大, 而且能提升程序员的开发效率

`C++11`增加的语法特性篇幅非常多, 没办法一一介绍, 所以只简单介绍`C++11`中比较常用、实用的语法特性

## 统一的列表初始化 `{}`

`C++11`, 为变量、对象、容器提供的一种新的初始化的方式: `{}`初始化

具体的使用就像这样: 

```cpp
struct Point {
    int _x;
    int _y;
};

int main() {
    int a = 1; 			// 之前
    int b = {2};		// C++11 支持
    int c{3};			// C++11 支持

    Point po1 = {1, 2};
    Point po2{1, 2};

    int array1[] = {1, 2, 3, 4, 5};
    int array2[5]{1, 2, 3, 4, 5};

    return 0;
}
```

在定义变量时, 可以直接使用`{}`对对象进行初始化

除了简单的对象初始化, 还可以对类进行初始化: 

```cpp
class Date {
public:
    Date(int year, int month, int day)
        : _year(year)
        , _month(month)
        , _day(day) {
        cout << "Date(int year, int month, int day)" << endl;
    }

private:
    int _year;
    int _month;
    int _day;
};

int main() {
    Date d1(2022, 1, 1);

    // C++11支持的列表初始化, 这里会调用构造函数初始化
    Date d2{2022, 1, 2};
    Date d3 = {2022, 1, 3};

    return 0;
}
```

C++11之前, 对于类实例化对象, 一般都会使用`Date d1(2022, 1, 1);`

C++11之后, 就也可以使用 `{} 列表初始化`

但是, 这些用法好像没有什么实际用处?

不过下面这样的使用, 就比之前初始化要好用一些: 

```cpp
int main() {
    int* pA = new int{1};
    int* pArray = new int[9]{1, 2, 3, 4, 5, 6, 7, 8, 9};
    
    vector<int> v1{1, 2, 3, 4, 5, 6, 7, 8, 9, 0};
    vector<int> v2 = {1, 2, 3, 4, 5, 6, 7, 8, 9, 0};
    vector<int>* v3 = new vector<int>[4]{ {1,2,3,4}, {5,6,7,8}, {9,10,11,12}, {12,13,14,15} };
    
    return 0;
}
```

可以直接使用`{}`对容器进行初始化, 更可以在`new[]`时使用`{}`对数组进行初始化.

即, **列表初始化可以更好地去支持`new[]`变量的初始化**

使用`{}`初始化类, **会去调用构造函数, 不仅仅是默认构造函数**

而, `C++11`是怎么实现这样的东西的呢？

## `initializer_list`

实际上`{}`是一个类型

可以这样来查看`{}`的类型: 

```cpp
int main() {
    auto li = {1,2,3,4,5};
    cout << typeid(li).name() << endl;

    return 0;
}
```

![|biger](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/202307041000041.webp)

可以看到, `auto` 接收`{}`的类型是: `initializer_list`

![|biger](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/202307041013969.webp)

`{}`本身就是一个容器类型

`{1, 2, 3, 4, 5}`就是通 `initializer_list<int>`实例化出的一个对象

这样初始化: 

```cpp
int main() {
	vector<int> v1{1, 2, 3, 4, 5, 6, 7, 8, 9, 0};
    vector<int> v2 = {1, 2, 3, 4, 5, 6, 7, 8, 9, 0};
    vector<int>* v3 = new vector<int>[4]{ {1,2,3,4},{5,6,7,8},{9,10,11,12},{12,13,14,15} };
    
    return 0;
}
```

本质上, 其实就是调用了**以`{}`对象为参数的构造函数**来实例化对象

因为, STL容器中其实定义有 使用`{}`对象的构造函数

![|biger](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/202307041021964.webp)

其他STL 容器中 也同样如此: 

`set:`

![|biger](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/202307041021169.webp)

```cpp
int main() {
 	 set<int> s1{1, 2, 3, 4, 5, 6, 7};
    set<int> s2 = {1, 2, 3, 4, 5, 6, 7};

	 return 0;
}
```

`map:`

![|biger](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/202307041022546.webp)

```cpp
int main() {
	 map<string, string> dict ={ {"apple", "苹果"}, {"banana", "香蕉"}, {"sun", "太阳"} };
    
	 return 0;
}
```

STL的容器, 在`C++11`之后 都支持了`initializer_list`对象为参数的构造函数

也就是说, STL容器实现`{}`初始化对象是通过实现了针对`initializer_list`类型的构造函数

而自己自定义的多成员变量的类是怎么实现使用`{}`初始化的呢？

其实是**隐式类型转换+编译优化**

比较类似`C++11`之前, 单个成员变量的类的直接赋值初始化

## 新的声明

C++中, 除了可以使用各种类型来声明变量、对象、函数之外, `C++11`提供了一些**新的声明方式**

### `auto`

首先就是`auto`

`auto`会根据对象、变量的赋值实际类型去**自动推导**对象、变量的类型

```cpp
int main() {
    int b = 1;
    auto c = 3.3;
    std::cout << typeid(b).name() << std::endl;
    std::cout << typeid(c).name() << std::endl;
    
    return 0;
}
```

![](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/202307041028181.webp)

实际使用时, `auto`一般用于非常长的容器的迭代器的自动推导

### `decltype`

`decltype` 可以用来推导 表达式的类型: 

```cpp
int main() {
    decltype(1 * 1) d;
    decltype(2 * 2.2) e;
    cout << typeid(d).name() << endl;
    cout << typeid(e).name() << endl;
    
    return 0;
}
```

![](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/202307041030249.webp)

### `nullptr`

在C++中可能经常使用`nullptr`来表示空指针

而`nullptr`实际上是`C++11`才提出的

在C语言中, 通常使用`NULL`作为空指针, 不过`NULL`在C语言中其实就是0, **有时可能会被识别为整型**

所以, `C++11`就使用了`nullptr`

## 范围for

范围`for`, 其实是一种遍历容器数据的一种方法, 是**基于范围**的`for`循环

可以对所有支持**迭代器`iterator`**的容器使用: 

```cpp
int main() {
    vector<int> v = {1, 2, 3, 4, 5, 6, 7, 8, 9};
    for(auto e : v) {
        cout << e << " ";
    }

    return 0;
}
```

![|large](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/image-20230422000634152.webp)

## 智能指针

`C++11`提出一个很重要的概念, 就是**智能指针**

不过本篇文章不做介绍:

[C++智能指针原理分析 介绍: RAII思想、智能指针原理、unique_ptr、shared_ptr、weak_ptr分析及模拟、与boost库中智能指针的关系...](http://humid1ch.cn/posts/C++-Smart-Pointer)

## STL 新容器

`C++11`为STL添加了六个新容器: 

![|bigger](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/202307041035476.webp)

除了哈希表的四个, 另外两个其实没有什么值得介绍的

`array`就是静态数组, 在使用上与平时的`int arr[10];`没什么区别. 但是, **`array`默认支持了越界检查**

`forward_list`就是单链表, 以方便使用来说, 还是`list`好用

> 另外的 哈希表, 博主有专门介绍的文章: 
>
> [[C++-STL] 哈希表以及unordered_set和unordered_set的介绍](https://www.humid1ch.cn/posts/C++-Hash-Table)
>
> [[C++-STL] 用哈希表封装unordered_map和unordered_set](https://www.humid1ch.cn/posts/C++-Hash-Table-Package-unordered_map&unordered_set)

## 右值引用 **

文章篇幅有限, 详情请阅读单独的文章:

[C++11新特性--右值引用的深入分析: 右值引用、万能引用、引用折叠、完美转发、移动语义...](http://humid1ch.cn/posts/C++11-Characteristic_RvalueRef)

## 新的类功能

### 新默认成员函数

在`C++11`之前, 类一共有6个默认成员函数:

1. 构造函数
2. 析构函数
3. 拷贝构造函数
4. 拷贝赋值重载
5. 取地址重载函数
6. const 取地址重载函数

`C++11`之后, 又有2个新增的默认成员函数 我们已经介绍过了:

1. 移动构造函数
2. 移动赋值重载函数

既然是默认成员函数, 那么他们是可以由编译器自动生成的.

但是, 这2个默认成员函数与其他的默认成员函数有一些不同. 他们的自动生成的条件有一些严苛, 不过功能的实现与其他默认成员函数类似:

1. 如果没有自己实现 **移动构造函数**, 且 **没有实现析构函数、拷贝构造、拷贝赋值重载中的任意一个**

    那么, 编译器才会自动生成一个默认移动构造

    默认生成的移动构造函数, 对于内置类型成员会执行逐成员按字节拷贝(深拷贝)

    对于自定义类型成员, 则需要看这个成员是否实现移动构造, 如果实现了就调用移动构造, 没有实现就调用拷贝构造

2. 如果没有自己实现 **移动赋值重载函数**, 且 **没有实现析构函数 、拷贝构造、拷贝赋值重载中的任意一个**

    那么, 编译器才会自动生成一个默认移动赋值

    默认生成的移动赋值重载函数, 对于内置类型成员会执行逐成员按字节拷贝

    对于自定义类型成员, 则需要看这个成员是否实现移动赋值, 如果实现了就调用移动赋值, 没有实现就调用拷贝赋值

3. **如果你提供了移动构造或者移动赋值, 编译器不会自动提供拷贝构造和拷贝赋值**

4. **没有实现析构函数、拷贝构造、拷贝赋值重载中的任意一个** 的意思是, 三个函数都没有实现

### 强制生成默认函数的关键字 `default`

这个关键字的使用很简单:

```cpp
class MyClass {
public:
    MyClass();  // 默认构造函数
    MyClass(const MyClass& other) = default;  // 强制生成默认拷贝构造函数
    MyClass& operator=(const MyClass& other) = default;  // 强制生成默认拷贝赋值运算符

    MyClass(MyClass&& other);  // 移动构造函数
    MyClass& operator=(MyClass&& other);  // 移动赋值运算符
};
```

只需要 函数定义时 在函数后加上 `= default` 就可以强制编译器生成相应的默认成员函数

### 禁止生成默认函数的关键字 `delete`

此关键字的用法 与 `default` 相同. 功能相反

`delete`是禁止生成默认成员函数, 或者 可理解为禁用

## 可变参数模板 **

在C语言中, 经常使用的两个函数 具有可变参数: `printf()` 和 `scanf()`

这两个函数的参数数量是可变的. 即可以根据需要传入不同数量的参数.

![](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/202307060942712.webp)

`C++11`之后, 不仅函数可以支持可变参数, 模板也可以支持可变参数了:

```cpp
template <class ...Args>
void ShowList(Args... args) {}

/*
其中 Args是一个模板参数包, args是一个函数形参参数包
声明可变一个参数包用 Args...args
此参数包, 可以看作是一个按参数传入顺序将传入的参数存储起来的一个数据结构
*/
```

`C++11`之前, 模板只能设置固定数量参数; `C++11`之后, 模板支持可变参数

但是, 函数拿到可变参数包之后, 并 **不能直接通过实参 来获取 参数类型、内容**

语法没有支持, 类似这样的获取参数包中 参数详情的使用方法:

```cpp
template <class ...Args>
void ShowList(Args... args) {
	args[0];
    // 类似这样的方法, 以及范围for, 都无法使用. 
}
```

但是可以通过其他方法 来获取参数类型或内容:

1. 递归 展开参数包

    ```cpp
    // 递归终止函数
    template <class T>
    void ShowList(const T& t) {
        cout << typeid(t).name() << ":";
        cout << t << endl;
    }
    
    // 展开函数
    template <class T, class ...Args>
    void ShowList(T value, Args... args) {
        cout << typeid(value).name() << ":";
        cout << value <<"    ";
        ShowList(args...);
    }
    
    int main() {
        ShowList(1);
        ShowList(1, 'A');
        ShowList(1, 'A', std::string("sort"));
    
        return 0;
    }
    ```

    我们可以通过在模板可变参数之前, 添加一个普通模板参数

    那么, 传入模板的**第一个参数**就是**可直接使用**的

    只需要在此函数内, 递归调用此函数

    那么 就可以不断 **获得参数包内的第一个参数**

    直到递归到最后, 参数包内只剩一个参数时, 开始返回

    > 这里递归结束的函数是 针对`ShowList()`实现了一个只有一个参数时的特化

    这段代码执行结果是:

    ![|wide](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/202307061006102.webp)

2. 列表初始化 展开参数包

    ```cpp
    template <class T>
    void PrintArg(T t) {
        cout << typeid(t).name() << ":";
        cout << t << "    ";
    }
    
    //展开函数
    template <class ...Args>
    void ShowList(Args... args) {
        int arr[] = { (PrintArg(args), 0)... };
        cout << endl;
    }
    
    int main() {
        ShowList(1);
        ShowList(1, 'A');
        ShowList(1, 'A', std::string("sort"));
        
        return 0;
    }
    ```

    在这种方法中, 我们使用逗号表达式保证 `(PrintArg(args), 0)` 的值为 0.

    然后还使用了列表初始化 来初始化一个变长数组

    `int arr[] = { (PrintArg(args), 0)... }` 

    会被展开为 

    `int arr[] = { (PrintArg(arg1), 0), (PrintArg(arg2), 0), (PrintArg(arg3), 0)... }`

    当然, 这里的逗号表达式不是必须的, 只需要将`PrintArgs()`设置一个整型返回值, 就可以不用逗号表达式

    ```cpp
    template <class T>
    int PrintArg(T t) {
        cout << typeid(t).name() << ":";
        cout << t << "    ";
        
        return 0;
    }
    
    //展开函数
    template <class ...Args>
    void ShowList(Args... args) {
        int arr[] = { PrintArg(args)... };
        cout << endl;
    }
    ```

    这种方法的执行结果为:

    ![|wide](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/202307061057057.webp)

## `emplace_back()`

`emplace_back()` 是`C++11`之后, 添加到STL容器中的一个 使用可变参数的元素插入接口

我们都知道, STL容器都是模板类, `emplace_back()`其实使用的就是模板可变参数

![](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/202307061101052.webp)

这个接口的使用也很简单:

```cpp
int main() {
    std::vector<pair<int, std::string>> arr;
    arr.emplace_back(11, "十一");
    arr.emplace_back(20, "二十");
    arr.emplace_back(make_pair(30, "三十"));
    arr.push_back(make_pair(40, "四十"));
    arr.push_back({ 50, "五十" });
    
    for (auto e : arr) {
		cout << e.first << ":" << e.second << endl;
    }
    
    return 0;
}
```

![](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/202307061109378.webp)

从结果来看好像没有区别

从用法来看, 好像也没有什么太大的改变, 无非就是支持了 直接使用 构建 `pair` 的参数来插入.

但是, 实际的执行上是有一些细小的差别的.

1. `arr.emplace_back(11, "十一");` 和 `arr.emplace_back(20, "二十");`

    `emplace_back()`会根据传入的两个参数, 直接调用`pair`的构造函数构造一个`pair`对象, 然后存储在 `arr`末尾

2. `arr.emplace_back(make_pair(30, "三十"));`

    先执行`make_pair()`创建了一个临时`pair`对象

    然后通过`emplace_back`在`arr`末尾创建了这个对象的副本

    它调用了两次`pair`构造函数: 一次在`make_pair`, 一次在`emplace_back`

3. `arr.push_back(make_pair(40, "四十"));`

    先执行`make_pair()`创建了一个临时`pair`对象

    然后通过`push_back`将创建这个对象的副本, 并将这个对象的副本插入到`arr`的末尾

    它也调用了两次`pair`构造函数: 一次在`make_pair`, 一次在`push_back`

4. `arr.push_back({ 50, "五十" });`

    首先, 通过**列表初始化**创建了一个临时`pair`对象
    
    然后通过`push_back`将创建这个对象的副本, 并将这个对象的副本插入到`arr`的末尾
    
    它也调用了两次`pair`构造函数: 一次在**列表初始化**, 一次在`push_back`

总的来说, 就是当容器的元素类型是自定义类型时

可以直接使用`emplace_back()`传入数据

`emplace_back()`会通过传入的数据, **直接构造元素并插入容器的末尾**, 不会再拷贝或者移动元素

