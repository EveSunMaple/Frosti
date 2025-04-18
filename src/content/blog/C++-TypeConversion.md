---
draft: true
title: "[C++] C++新的类型转换方式介绍: C语言类型转换介绍、static_cast、reinterpret_cast、const_cast、dynamic_cast、RTTI介绍"
pubDate: "2023-07-10"
description: "C语言中 的类型转换可视性比较差, 所有的转换形式都是以一种相同形式书写, 难以跟踪错误的转换. C++则针对不同场景实现了4种不同的类型转换..."
image: https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/202307101801517.webp
categories: ['tech']
tags: ["C++", "C++11"]
---

# C语言中的类型转换

在C语言中, 有一些情况需要发生类型转化:

1. 赋值运算符左右两侧类型不同
2. 比较运算符左右两侧类型不同
3. 形参与实参类型不匹配
4. 返回值类型与接收返回值类型不一致
5. ...

C语言中总共有两种形式的类型转换: **隐式类型转换** 和 **显式类型转换**

## 隐式类型转化

1. 编译器会在编译阶段自动进行, 比如像这样:

    ```cpp
    #include <iostream>
    
    int main() {
        size_t pos = 0;
        int i = 10;
        while (i >= pos) {
            i--;
            std::cout << i << std::endl;
        }
    
        return 0;
    }
    ```

    这段代码的执行结果是什么?

    第一眼看去: 好像很简单啊, 不就是 打印 `9->0` 吗?

    但是, 当程序执行之后:

    ![|wide](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/202308211603499.gif)

    很神奇, 明明 `i < 0` 了 但是循环还在继续.

    原因是: `while (i >= pos)` 这里发生了隐式类型转换:

    前10次循环, 是没有出什么问题的 也就是 i从10->0的过程.

    不过, 当i==0进入循环时 会执行i--, i成为了负数-1. 按正常思维, 循环就要跳出了.

    但是, 当 `i==-1`时, `while (i >= pos)` 的这个条件判断, 在作比较时 i会被隐式类型转换为 `size_t` 无符号整型

    这意味着什么? 这意味着, 即使 实际上`i==-1`, 但在比较时 它就是 **二进制32位全1的无符号整数**, 所以 `while (i >= pos)` 也就永远不会结束.

2. 如果允许隐式类型转换, 那编译器就会发生. 如果此处不允许, 那 编译就会报错

    ```cpp
    #include <iostream>
    
    int main() {
        char a = 'c';
        int b = a;
        std::cout << a << " : " << b << std::endl;
    
        int* c= a;
    
        return 0;
    }
    ```

    这段代码, `int* c = a;` 会报错. 因为不允许发生隐式类型转换.

    ![|wide](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/202307102319439.webp)

    不过, 前面的可以编译通过:

    ![|wide](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/202307102320096.webp)

这是C语言的隐式类型转换

## 显式强制转换

除了上面介绍的 编译器自动做的一些类型的转换. 用户还可以显式的对变量的类型做转换

```cpp
#include <cstdlib>
#include <iostream>

int main() {
    int* a = (int*)std::malloc(sizeof(int));
    *a = 20;

    std::cout << *a << std::endl;

    std::free(a);

    return 0;
}
```

将 `malloc()`的返回值, 使用`(int*)`强制类型转换为 `int*`

即, C语言中 可以使用 `(类型)` 强制转换变量的类型. 但是 必须是相近的类型, 不然会报错.

---

C语言中 就只有这两种类型转换的方式, 用户可以使用的也就只有 `(类型)` 

并且还具有明显的缺陷:

可视性比较差, 所有的转换形式都是以一种相同形式书写, 难以跟踪错误的转换

C++则实现了 4种不同的类型转换

# C++的4种类型转换

虽然C语言的类型转换很简单, 但是也存在一些问题:

1. 隐式类型转换可能会导致精度丢失或者判断错误
2. 显式类型转换则所有情况同一书写方式, 比较混乱 代码不够清晰

所以, C++增添设计了4种新的类型转换: `static_cast` `reinterpret_cast` `const_cast` `dynamic_cast`

四种类型转换分别用于不同的场景, 看到就可以分辨出来此处的类型转换是什么类型了.

## `static_cast`

`static_cast` 静态转换, 常用于相关的内置类型之间、以及相关自定义类型之间的转换, 即 **`相关相近类型之间的转换`**.

用法很简单, `static_cast<需要转换为什么类型>(需要转换类型的变量)` 下面三种也是这种用法

```cpp
#include <iostream>

int main() {
    double d = 123.12398;
    int a = static_cast<int>(d);
    std::cout << d << " : " << a << std::endl;

    return 0;
}
```

![ ](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/202307102347545.webp)

## `reinterpret_cast`

`reinterpret_cast` 则常用于类似 `int->int*`, 这种不相近类型之间的转换. 但只能小单位向大单位转换

```cpp
#include <cstdlib>
#include <iostream>

int main() {
    double d = 123.12398;
    int a = static_cast<int>(d);
    std::cout << d << " : " << a << std::endl;

    // 报错
    //int* c = static_cast<int*>(a);
    int* c = reinterpret_cast<int*>(a);
    std::cout << c << std::endl;
    // int b = reinterpret_cast<int>(c);  // 64位平台 可能会报错
    // 因为 64位平台 指针是8字节, 而int是4字节 可能产生数据丢失
    // 经测试 GCC 会报错, MSVS则不会

    return 0;
}
```

![ ](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/202307110002360.webp)

## `const_cast`

在介绍进程信号的时候, 介绍过一个关键字 `volatile`, 其作用是 **`保持内存的可见性`**

在我们使用 `const` 修饰变量时, **编译器可能会认为此变量不会被修改** 而将此 **变量值优化到寄存器** 中, 在之后使用此变量时, 可能会 **直接从寄存器中获取值**. 还有些编译器 会 **直接在预处理时其当作值**. 原因就是 编译器认为这个变量不会被改变.

但是 实际上, 还是可以 **改变此变量的值** 的:

```cpp
int main(){
    const int val = 100;
    int* pV = (int*)&val;
    *pV = 200;

    std::cout << val << std::endl;
    std::cout << *pV << std::endl;

    return 0;
}
```

这段代码的执行结果是:

![ ](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/202307110927036.webp)

通过 对`const int val`取地址 再 将其强制类型转换为`int*`, 然后通过`int*`修改变量的值.

最终打印变量 和 指向变量地址的`int*`变量的值, 会输出两个不同的值.

原因就是, 直接打印变量 编译器会从寄存器获取数据 或 直接在预处理阶段把变量改为值. 而通过指针访问变量的地址 则是真正的访问了内存中的数据. 想要不让编译器做优化, 就可以使用`volatile`关键词保持变量的内存可见性, 即使用此变量必须从内存中获取.

不过, 我们这里主要介绍的是 `const_cast`. `const_cast` 常用于这种取消`const`变量的常量属性的场景.

所以, 上面的代码还可以换成:

```cpp
int main(){
    volatile const int val = 100;
    int* pV = const_cast<int*>(&val);
    *pV = 200;

    std::cout << val << std::endl;
    std::cout << *pV << std::endl;

    return 0;
}
```

![ ](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/202307110940794.webp)

## `dynamic_cast`

`dynamic_cast` 是功能相对最复杂的一个类型转换方式. 它 用于 **将一个父类对象的指针或引用 转换为 子类对象的指针或引用(动态转换)**

C++继承体系中:

**向上转换**: 子类对象的指针或引用 是 **默认支持**类型转换到 父类对象的指针或引用的(赋值兼容), 比如多态调用.

**向下转换**: 而 在一般情况下 父类对象的指针或引用 是 **不支持**直接转换成 子类对象的指针或引用的. 强制转换的话是可以的, 但是不安全.

首先要了解, 什么时候可能会用到向下转换呢?

看一个简单的场景:

```cpp
class A {
public:
    virtual void f() {}
};

class B : public A {};

void fun(A* pa) {
    B* pb1 = static_cast<B*>(pa);
    B* pb2 = dynamic_cast<B*>(pa);

    cout << "pb1:" << pb1 << endl;
    cout << "pb2:" << pb2 << endl;
}

int main() {
    A a;
    B b;
    fun(&a);
    fun(&b);

    return 0;
}
```

当`fun()`被调用时, 其实参是否有可能是子类对象的指针?

很明显是有可能的, 因为这是一个简单的多态调用嘛. 也就是说, **`pa`可能指向父类对象也可能指向子类对象**.

而, 如果我们需要在`fun()`函数内部弄明白, **pa到底是指向一个父类对象还是子类对象** 要怎么实现?

在 **没有`dynamic_cast`时**, 可以通过在类内部实现一个支持多态调用的函数, 如果是多态调用返回`true`, 表示指向子类对象, 否则返回`false`, 表示返回父类对象.

```cpp
class A {
public:
    virtual void f() {}
    virtual bool isPoly() {
        return false;
    }
};

class B : public A {
public:
    virtual bool isPoly() {
        return true;
    }
};

void fun(A* pa) {
    if(pa->isPoly()) {
        cout << "多态调用, 指向子类对象" << endl;
    }
    else if(!pa->isPoly()) {
        cout << "指向父类对象" << endl;
    }
}

int main() {
    A a;
    B b;
    fun(&a);
    fun(&b);

    return 0;
}
```

就像上面这样, 执行结果为:

![ ](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/202307111013138.webp)

但是, 有了`dynamic_cast`之后, 就不需要这样了:

```cpp
class A {
public:
    virtual void f() {}
};

class B : public A {};

void fun(A* pa) {
    B* pb1 = static_cast<B*>(pa);
    B* pb2 = dynamic_cast<B*>(pa);

    cout << "pb1:" << pb1 << endl;
    cout << "pb2:" << pb2 << endl;
}

int main() {
    A a;
    B b;
    fun(&a);
    fun(&b);

    return 0;
}
```

这段代码的执行结果是:

![ ](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/202307111014050.webp)

前两个输出是传入父类对象指针时的输出, 后两个输出是传入子类对象指针时的输出.

有什么差别?

可以看到:

1. `static_cast`, 无论传入父类对象的指针 还是 子类对象的指针, 他都可以成功的向下转换.
2. 而`dynamic_cast`, **传入父类对象的指针时, 向下转换失败**, 返回0. **传入子类指针时, 向下转换成功**

这意味着什么? 

**`dynamic_cast`会动态转换, 如果父类对象的指针或引用 原本就是 子类对象的指针或引用, `dynamic_cast`才能转换成功. 否则, 转换失败 结果为`0`. 这说明了, `dynamic_cast`更加安全**

因为, 父类对象的指针强制转化成子类对象的指针, 是不安全的. 

不过, 需要注意的是, **`dynamic_cast`只能用于父类含有虚函数的类**

如果是下面这种类体系, `dynamic_cast`无法使用:

```cpp
class A {};

class B : public A {};

void fun(A* pa) {
    B* pb1 = static_cast<B*>(pa);
    B* pb2 = dynamic_cast<B*>(pa);

    cout << "pb1:" << pb1 << endl;
    cout << "pb2:" << pb2 << endl;
}

int main() {
    A a;
    B b;
    fun(&a);
    fun(&b);

    return 0;
}
```

![ ](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/202307111022230.webp)

GCC会报错: 原类型不支持多态



## RTTI

**RTTI(Run-Time Type Information, 运行时类型信息识别)** 是 C++ 的一个特性, 它允许程序在运行时获取对象的类型信息

主要通过两个运算符实现: `typeid`、`dynamic_cast`

1. `typeid`

    使用`typeid(val).name()`可以获取到当前对对象的类型, 但只是一个字符串. 而且结果根据编译器而定, 不同平台很可能不同.

2. `dynamic_cast`

    `dynamic_cast`则是通过判断是否可以转换为子类对象指针或引用, 来判断父类对象指针或引用原本的内容的.

了解一下就好

---

感谢阅读~