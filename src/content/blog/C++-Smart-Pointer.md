---
draft: true
title: "[C++11] C++智能指针原理分析 介绍: RAII思想、智能指针原理、unique_ptr、shared_ptr、weak_ptr分析及模拟、与boost库中智能指针的关系..."
pubDate: "2023-07-09"
description: "C++引入了异常处理的概念之后, 内存泄露的问题就变得更加防不胜防了. 而 智能指针的出现 大大缓解了内存泄漏出现的频率..."
image: https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/202307090019836.webp
categories:
    - Blogs
tags:
    - C++
    - C++11
---

一直以来, C++一直最令人诟病的问题之一是什么?

没错, 就是 **`内存泄漏`**

C语言还好一些, 但是 在C++中, 异常的相关处理出现之后, `内存泄漏`的问题简直是防不胜防

> 博主 C++异常相关文章:
>
> [[C++] C++异常处理分析介绍: 异常概念、异常抛出与捕获匹配原则、重新抛出、异常安全、异常体系...](https://www.humid1ch.cn/posts/C++-Exception)

而且, C++也不像Java那样带有垃圾自动回收机制, 所以在C++11之前, C++的内存管理一直是一件非常麻烦的事情.

虽然现在也麻烦, 不过已经好了很多.

# 智能指针

C++在引入了异常的概念之后, 内存泄漏的问题就非常有可能出现.

比如这段代码:

```cpp
#include <iostream>
#include <exception>

using std::cin;
using std::cout;
using std::endl;
using std::exception;
using std::invalid_argument;

int div() {
    int a, b;
    cin >> a >> b;
    if (b == 0)
        throw invalid_argument("除0错误");

    return a / b;
}

void Func() {
    // 1、如果p1这里new 抛异常会如何？
    // 2、如果p2这里new 抛异常会如何？
    // 3、如果div调用这里又会抛异常会如何？
    int* p1 = new int;
    int* p2 = new int;

    cout << div() << endl;

    delete p1;
    delete p2;
}

int main() {
    try {
        Func();
    }
    catch (exception& e) {
        cout << e.what() << endl;
    }

    return 0;
}
```

注释的三个问题, 各自都会产生什么结果?

1. 如果 `int* p1 = new int;` 时抛异常, 其实是空间开辟失败了, 所以不会发生内存泄漏.
2. 如果 `int* p2 = new int;` 时抛异常, 那就说明`p1`空间是开辟成功了的, 所以如果这里抛异常, 会导致`p1`指向的空间无法被`delete`, 会发生内存泄漏
3. 而, 如果`div()`执行时抛异常, 那么 就会导致`p1`和`p2`所指向的空间泄露.

不过, 如果是第3种情况, 可以直接这样解决:

```cpp
void Func() {
    int* p1 = new int;
    int* p2 = new int;

    try {
        cout << div() << endl;
    }
    catch (...) {
        delete p1;
        delete p2;
        throw;
    }

    delete p1;
    delete p2;
}
```

但是, 如果类似第2种情况, 就无法相对方便的解决.

虽然看似可以模仿上面的解决方法尝试解决问题. 但实际上是无法解决的.

为什么呢?

`int* p2 = new int;`时抛异常, 我们捕捉到异常之后, 就需要将`p1`的空间释放掉. 

但如果是这种情况呢?

```cpp
void Func() {
    int* p1 = new int;
    int* p2 = new int;
    int* p3 = new int;
    int* p4 = new int;
    int* p5 = new int;

    try {
        cout << div() << endl;
    }
    catch (...) {
        delete p1;
        delete p2;
        delete p3;
        delete p4;
        delete p5;
        throw;
    }

    delete p1;
    delete p2;
    delete p3;
    delete p4;
    delete p5;
}
```

如果是在 `p3`、`p4`或`p5`任意一个位置抛异常了呢? 

如果是`p3`, 那就需要释放 `p1` `p2`; 如果是`p4`, 那就需要释放 `p1` `p2` `p3`; 如果是`p5`, 那就需要释放 `p1` `p2` `p3` `p4`

如果 开辟的操作更多, 那么不同位置抛异常, 要处理的情况就不同. 

这种情况, 就会非常的麻烦. 

所以, C++11正式引入了`智能指针`.

## RAII思想

**`RAII (Resource Acquisition Is Initialization) 资源获取即初始化`** 是一种 **利用对象生命周期来控制程序资源** 的技术.

什么意思呢?

我们知道, 一个对象在生命周期即将结束时 是会自动调用析构函数释放资源的.

我们可以利用这一点, **将我们所需要获取的资源 来托管给对象, 通过对象来进行管理、访问、使用资源**.

即, **实现一个类, 其成员变量包括所需资源, 在实例化对象时 通过构造函数开辟并初始化资源, 在对象生命周期快要结束时 对象会自动调用析构函数, 将开辟出来的空间释放**.

这样做有什么好处呢?

1. 不需要显式地释放资源
2. 所需的资源在对象生命周期内始终保持有效

比如, 这段代码:

```cpp
#include <iostream>
#include <exception>

using std::cin;
using std::cout;
using std::endl;
using std::exception;
using std::invalid_argument;

template <class T>
class SmartPtr {
public:
    SmartPtr(T* ptr = nullptr)
        : _ptr(ptr) {}

    ~SmartPtr() {
        if (_ptr) {
            cout << "析构 释放资源" << _ptr << endl;
            delete _ptr;
        }
    }

private:
    T* _ptr;
};

int div() {
    int a, b;
    cin >> a >> b;
    if (b == 0)
        throw invalid_argument("除0错误");

    return a / b;
}

void Func() {
    //  int* p1 = new int;
    //  int* p2 = new int;

    SmartPtr<int> p1(new int);
    SmartPtr<int> p2(new int);

    cout << div() << endl;
}

int main() {
    try {
        Func();
    }
    catch (exception& e) {
        cout << e.what() << endl;
    }

    return 0;
}
```

这段代码, 如果发生异常 会是什么结果?

![ ](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250711181114325.webp)

通过传入`new int`调用构造函数, 实例化一个 `SmartPtr`对象.

`SmartPtr`对象的成员函数是一个指针, 用来指向开辟资源的空间. 构造函数将`_ptr`指向`new int`出来的空间. 析构函数`delete`掉`_ptr`指向的空间.

所以这就实现了, 不用手动的`delete` `new`出来的资源. 对象生命周期结束, 析构函数会自动释放. 

这就是 **智能指针的实现思想, 也是RAII思想**

## 智能指针原理

我们通过`SmartPtr`类, 介绍了智能指针的实现思想.

但 对于`SmartPtr`, 还不能将其称之为智能指针. 因为, 它的对象还不具有指针的行为: `*解引用`、`->`等

所以, 智能指针至少还需要 重载`*`和`->`, 不过这两个操作符的重载很简单:

```cpp
template <class T>
class SmartPtr {
public:
    SmartPtr(T* ptr = nullptr)
        : _ptr(ptr) {}

    T& operator*() {
        return *_ptr;
    }

    T* operator->() {
        return _ptr;
    }

    ~SmartPtr() {
        if (_ptr) {
            cout << "析构 释放资源" << _ptr << endl;
            delete _ptr;
        }
    }

private:
    T* _ptr;
};
```

这样就可以实现, 直接通过对象进行`*解引用`和`->`相关操作:

```cpp
struct Date {
    int _year;
    int _month;
    int _day;
};

int main() {
    SmartPtr<int> sp1(new int);
    *sp1 = 10;
    cout << *sp1 << endl;

    SmartPtr<Date> sparray(new Date);
    sparray->_year = 2018;
    sparray->_month = 1;
    sparray->_day = 1;

    cout << sparray->_year << "-" << sparray->_month << "-" << sparray->_day << endl;

    return 0;
}
```

这段代码执行结果为:

![ ](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250711181117840.webp)

可以直接通过对象, 来实现指针相关的操作.

### 智能指针的问题

从上面来看, 智能指针的原理是不是非常的简单?

但智能指针的实现, 其实还存在着非常大的问题: **`对象的拷贝构造和赋值怎么实现?`**

在普通指针的使用中, 经常会有这样的操作:

![|inline](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250711181119853.webp)

在指针定义时, 直接用其他指针初始化 或 用指针给指针赋值.

转换为`SmartPtr`, 就大概是这样:

![|inline](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250711181121383.webp)

对于类来说 `SmartPtr<int> sp2 = sp1` 就是拷贝构造. 所以 智能指针是需要实现 **拷贝构造和赋值重载** 的.

但问题是, 该如何实现呢? 需要使用 **深拷贝还是浅拷贝?**

**一定是需要实现浅拷贝. **

**因为无论是 普通指针给普通指针初始化 还是普通指针给普通指针赋值. 这两个操作完成之后, `这两个普通指针一定是指向同一块空间的`, 即两个指针维护同一块空间.**

那么, **智能指针也需要实现相同的逻辑, 所以 无论是拷贝构造还是赋值重载都 `不能实现深拷贝`**.

浅拷贝怎么实现?

很简单嘛:

```cpp
template <class T>
class SmartPtr {
public:
    SmartPtr(T* ptr = nullptr)
        : _ptr(ptr) {}

    // 拷贝构造
    SmartPtr(const SmartPtr<T>& sp)
        : _ptr(sp._ptr) {}
    
	// 赋值重载
    SmartPtr<T>& operator=(const SmartPtr<T>& sp){
        // 防止自我赋值
        if(this != &sp) {
            // 先清除被赋值对象中的资源
            if(_ptr)
                delete _ptr;
            
	        _ptr = sp._ptr;
        }
    }

    T& operator*() {
        return *_ptr;
    }

    T* operator->() {
        return _ptr;
    }

    ~SmartPtr() {
        if (_ptr) {
            cout << "析构 释放资源" << _ptr << endl;
            delete _ptr;
        }
    }

private:
    T* _ptr;
};
```

都浅拷贝实现, 只需要将传入的`SmartPtr`对象维护的资源 赋值给当前对象需要维护的资源变量就可以了.

但是, 这样 **`会出大问题`**

```cpp
int main() {
    SmartPtr<int> sp1(new int);
    // 用 sp1 拷贝构造 sp2
    SmartPtr<int> sp2 = sp1;
    
    return 0;
}
```

这样的代码执行之后:

![](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250711181124479.webp)

会发现, 同一块空间 被释放了两次. 直接报错.

出现这种情况的原因就是, **浅拷贝让两个对象的成员变量指向了同一块空间. 在两个对象生命周期结束时, 会调用析构函数 尝试delete同一块空间**. 

这就是 **`智能指针的实现 存在的最大的问题`**, 需要实现浅拷贝, 但是浅拷贝就会出现重复`delete`的问题.

为了解决这个问题, C++诞生了许多版本的智能指针.

下面就来一一介绍.

## **`auto_ptr`**

为了解决 同一块空间会被`delete`两次的问题, C++98实现的智能指针`auto_ptr`用了一个"神"操作.

`auto_ptr`在执行拷贝构造或者赋值重载时, 会 **转移资源的管理权**. 什么意思呢?

就是, 会 **先把传入的对象的资源给新对象, 然后再把传入对象的指向资源的指针置空**

`auto_ptr`的模拟代码就是这样的:

```cpp
namespace July {
    template <class T>
    class auto_ptr {
    public:
        auto_ptr(T* ptr = nullptr)
            : _ptr(ptr) {}

        auto_ptr(auto_ptr<T>& sp)
            : _ptr(sp._ptr) {
            sp._ptr = nullptr;
        }

        auto_ptr<T>& operator=(auto_ptr<T>& sp) {
            // 防止自我赋值
            if (this != &sp) {
                // 先清除被赋值对象中的资源
                if (_ptr)
                    delete _ptr;

                _ptr = sp._ptr;
                sp._ptr = nullptr;
            }
        }

        T& operator*() {
            return *_ptr;
        }

        T* operator->() {
            return _ptr;
        }

        ~auto_ptr() {
            if (_ptr) {
                cout << "析构 释放资源" << _ptr << endl;
                delete _ptr;
            }
        }

    private:
        T* _ptr;
    };
} // namespace July
```

这种方法 确实解决了 同一块空间会被`delete`两次的问题. (因为其中一个对象的资源变成了 `nullptr`, `delete nullptr` 什么都不做)

但是, 却又出现了一个更离谱的问题: 

**`auto_ptr`执行过拷贝构造或赋值重载之后, 旧对象或者说等号右边的对象, 就不能再使用了**

```cpp
int main() {
    July::auto_ptr<int> ap1(new int);
    *ap1 = 10;
    cout << "ap1:: " << *ap1 << endl;
    
    July::auto_ptr<int> ap2(ap1);
    cout << "ap1:: " << *ap1 << endl;
    cout << "ap2:: " << *ap2 << endl;

    return 0;
}
```

使用上面的类, 执行这段代码:

![ ](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250711181128452.webp)

会报出段错误. 原因是: **通过 `ap1` 拷贝构造 `ap2`, `ap1`的资源会被置空, 所以无法再被访问**.

使用库中的 `auto_ptr` 也是相同的效果:

```cpp
#include <memory>

int main() {
    std::auto_ptr<int> ap1(new int);
    *ap1 = 10;
    cout << "ap1:: " << *ap1 << endl;
    
    std::auto_ptr<int> ap2(ap1);
    cout << "ap1:: " << *ap1 << endl;
    cout << "ap2:: " << *ap2 << endl;

    return 0;
}
```

![](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250711181130528.webp)

使用库中的`auto_ptr`编译器甚至会报出警告, 提示此类已弃用.

我们把 后面的 `cout << "ap1:: " << *ap1 << endl;` 注释掉, 就可以执行了:

![ ](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250711181132658.webp)

成功的用`ap1`拷贝构造了`ap2`, 然后成功的解决了同一块空间释放两次的问题, 但是 也成功的添加了一个更离谱的问题.

由于 `auto_ptr` 执行拷贝构造或赋值重载之后, 旧对象就无法正常使用了, 所以这是一个失败的设计. 很多公司可能会明令禁止使用.

> `auto_ptr`解决 同一块空间释放两次 的方法是 转移对资源的管理权. 
>
> 这会导致, 旧对象无法再访问资源, 所以挺没用的

这个智能指针是C++98就存在的. 但是太难用.

所以C++11又设计了三个相对好用一些的智能指针

## **`unique_ptr`**

`unique_ptr` 是C++11设计的智能指针之一.

基本的用法不必多说. 不过, 它是 **怎么解决 同一块空间会被`delete`两次的问题** 的呢?

这个智能指针的解决方法有一些 简单粗暴: **`禁止拷贝构造和赋值`**

没错, `unique_ptr` 直接禁止了拷贝构造和赋值的行为.

```cpp
namespace July {
    template <class T>
    class unique_ptr {
    public:
        // RAII思想
        unique_ptr(T* ptr = nullptr)
            : _ptr(ptr) {}

        ~unique_ptr() {
            if (_ptr) {
                cout << "delete" << _ptr << endl;
                delete _ptr;
                _ptr = nullptr;
            }
        }

        T& operator*() {
            return *_ptr;
        }

        T* operator->() {
            return _ptr;
        }

        // C++11 之后
        unique_ptr(const unique_ptr<T>& up) = delete;
        unique_ptr<T>& operator=(const unique_ptr<T>& up) = delete;

    private:
        // C++98 可以这样实现
        // 1. 只声明不实现, 不过如果是public, 这种方法可以在其他地方实现功能
        // 2. 声明成私有
        //  unique_ptr(const unique_ptr<T>& sp);
        //  unique_ptr<T>& operator=(const unique_ptr<T>& sp);
        T* _ptr;
    };
} // namespace July
```

使用此类, 如果尝试拷贝构造或者赋值, 是无法编译通过的:

```cpp
int main(){
    July::unique_ptr<int> up1(new int);
    *up1 = 20;
    cout << "up1:: " << *up1 << endl;

    // 尝试拷贝构造
    July::unique_ptr<int> up2(up1);

    return 0;
}
```

编译时, 编译器会直接报错:

![](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250711181135762.webp)

使用库中的, 也会有相同的效果:

![ ](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250711181137434.webp)

不过 库中的实现要复杂的多.

## **`shared_ptr **`**

上面介绍的两个智能指针, 好像都没有办法相对完美的解决 同一块资源被`delete`两次的问题(一个转移资源、一个禁止拷贝).

不过, C++11还有一个智能指针 可以很好的解决这个问题.

那就是 **`shared_ptr`**.

这个智能指针的解决方法是: **在类中添加一个成员变量 用来引用计数, 每有一个对象指向同一个资源空间, 这个计数就增加1, 否则则减少1. 只有当计数为0是, 才会释放资源空间**

但是, 这个用以引用计数的成员变量, 不能直接用`static`修饰的变量. 

如果使用 `static`修饰的变量作为引用计数变量, 那么这个变量会被所有`shared_ptr`对象共享, 无论是否维护同一块资源空间.

但是, 我们要实现的是 **维护同一块资源空间的对象之间共享一个引用计数**

这要怎么实现呢? 其实很简单, 如何实现多个对象维护同一块资源空间 就如何实现多个对象共享引用计数.

`shared_ptr`模拟:

```cpp
namespace July {
    template <class T>
    class shared_ptr {
    public:
        // RAII思想
        shared_ptr(T* ptr)
            : _ptr(ptr)
            , _pCount(new int(1)) {}

        ~shared_ptr() {
            release();
        }

        shared_ptr(const shared_ptr<T>& sp)
            : _ptr(sp._ptr)
            , _pCount(sp._pCount) {
            (*_pCount)++;
        }

        shared_ptr<T>& operator=(const shared_ptr<T>& sp) {
            // 这里需要用 维护资源是否相同来判断 是否需要执行赋值操作
            // 不能只判断对象是否相同, 因为不同对象维护的资源也可能相同
            if (_ptr != sp._ptr) {
                release();

                _ptr = sp._ptr;
                _pCount = sp._pCount;
                ++(*_pCount);
            }

            return *this;
        }

        T& operator*() {
            return *_ptr;
        }

        T* operator->() {
            return _ptr;
        }

        // 释放资源函数
		// 当前对象的引用计数为1(再--为0)时, 才真正进行资源释放操作
        void release() {
            if (--(*_pCount) == 0 && _ptr) {
                cout << "delete" << _ptr << endl;
                delete _ptr;
                _ptr = nullptr;

                delete _pCount;
                _pCount = nullptr;
            }
        }
        int getCount() {    
            return *_pCount;
        }

    private:
        T* _ptr;
        int* _pCount;
    };
} // namespace July
```

其中, 最重要的四个部分:

1. 成员变量 `int* _pCount`

    要实现多个对象之间共享一个引用计数, 就需要让多个维护同一资源的对象能够同时访问这个变量.

    那其实 资源共享是怎么是实现的, 引用计数一样的方法实现 就可以了

    所以, 使用一个`int*`指针变量, 在实例化对象时初始化为`new int(1)`. 就可以让 此指针指向一块堆空间.

    这样, 就可以让其他对象的`int*`指针变量指向同一块空间.

2. 析构函数

    由于可能存在多个对象正在共同维护同一块资源的情况. 所以 需要在当前引用计数为1(再--就为0)时 调用析构函数, 才进行资源的释放.

    否则就只需要将引用计数--, 就可以了.

    所以实现了一个, `release()`函数:

    ```cpp
    // 释放资源函数
    // 当前对象的引用计数为1(再--为0)时, 才真正进行资源释放操作
    void release() {
        // 先 --(*_pCount), 然后判断结果是否为0
        // 如果为0, 且维护资源不为空, 则进行资源释放
        // 需要释放 资源空间 和 引用计数空间
        if (--(*_pCount) == 0 && _ptr) {
            cout << "delete" << _ptr << endl;
            delete _ptr;
            _ptr = nullptr;
    
            delete _pCount;
            _pCount = nullptr;
        }
    }
    ```

    在析构函数内, 直接调用此函数就可以了

3. 拷贝构造

    此类的拷贝构造的实现 非常简单.

    只需要根据传入的对象所 维护的资源和引用计数, 初始化新对象. 然后 引用计数++就可以了

    ```cpp
    shared_ptr(const shared_ptr<T>& sp)
        : _ptr(sp._ptr)
        , _pCount(sp._pCount) {
        (*_pCount)++;
    }
    ```

4. 赋值重载

    赋值重载的实现 是最复杂的. 

    首先, 需要判断 **两个对象维护的资源是否为同一资源**, 如果是 则不执行赋值操作. 如果不是在执行.

    然后要执行赋值操作, 就需要知道两个对象相互赋值会发生什么. 比如 `sp1 = sp2` 可能会发生什么呢?

    1. `sp1` 将会失去原先维护的资源.

        如果`sp1`原来的引用计数为1, 那么就需要将`sp1`维护的资源空间释放掉

        所以, 需要先执行 `release()`, 判断是否需要释放资源.

    2. `sp2` 维护的资源和引用计数, 将会多一个维护者`sp1`.

        所以 需要将 `sp2`维护的资源 和 引用计数, 赋值给 `sp1`

    ```cpp
    shared_ptr<T>& operator=(const shared_ptr<T>& sp) {
        // 这里需要用 维护资源是否相同来判断 是否需要执行赋值操作
        // 不能只判断对象是否相同, 因为不同对象维护的资源也可能相同
        if (_ptr != sp._ptr) {
            release();
    
            _ptr = sp._ptr;
            _pCount = sp._pCount;
            ++(*_pCount);
        }
    
        return *this;
    }
    ```

此时模拟的`shared_ptr`, 就是一个好用的智能指针:

```cpp
int main() {
    July::shared_ptr<int> sp1(new int(10));
    cout << "构造 sp1, sp1:: " << *sp1 << ", pCount:: " << sp1.getCount()
         << endl;
    July::shared_ptr<int> sp2(sp1);
    cout << "由sp1拷贝构造 sp2, sp2:: " << *sp2
         << ", pCount:: " << sp2.getCount() << endl;
    July::shared_ptr<int> sp3(sp1);
    cout << "由sp1拷贝构造 sp3, sp3:: " << *sp3
         << ", pCount:: " << sp3.getCount() << endl << endl;

    cout << "更改 *sp2 = 20" << endl;
    *sp2 = 20;
    cout << "sp1:: " << *sp1 << ", pCount:: " << sp1.getCount() << endl;
    cout << "sp2:: " << *sp2 << ", pCount:: " << sp2.getCount() << endl;
    cout << "sp3:: " << *sp3 << ", pCount:: " << sp3.getCount() << endl << endl;

    July::shared_ptr<int> sp4(new int(44));
    cout << "构造 sp4, sp4:: " << *sp4 << ", pCount:: " << sp4.getCount()
         << endl << endl;

    sp2 = sp4;
    cout << "sp4赋值给sp2, sp2:: " << *sp2 << ", pCount:: " << sp2.getCount()
         << endl << endl;
    cout << "sp1:: " << *sp1 << ", pCount:: " << sp1.getCount() << endl << endl;

    sp4 = sp2;
    cout << "sp2赋值给sp4, sp4:: " << *sp4 << ", pCount:: " << sp4.getCount()
         << endl << endl;

    return 0;
}
```

这段代码的执行结果是:

![|inline](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250711181142448.webp)

将 `shared_ptr` 换成标准库中的(还需要将 调用的`getCount()`改为`use_count()`), 依旧是这样:

![|inline](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250711181144219.webp)

## **`shared_ptr`的循环引用 与 `weak_ptr`**

虽然 `shared_ptr` 已经很好用了.

但是, 使用不当的话还会出现一种后果很严重的错误. 比如这样用: 

```cpp
struct ListNode {
    int _data;
    July::shared_ptr<ListNode> _prev = nullptr;
    July::shared_ptr<ListNode> _next = nullptr;

    ~ListNode() {
        cout << "~ListNode()" << endl;
    }
};

int main() {
    July::shared_ptr<ListNode> node1(new ListNode);
    July::shared_ptr<ListNode> node2(new ListNode);

    cout << node1.getCount() << endl;
    cout << node2.getCount() << endl;
    
    node1->_next = node2;
    node2->_prev = node1;
    
    cout << node1.getCount() << endl;
    cout << node2.getCount() << endl;

    return 0;
}
```

使用 `shared_ptr` 管理 `ListNode` 结构体对象.

而 `ListNode` 内部 指向前节点和后节点的成员变量, 同样是 `shared_ptr<ListNode>类型`

那么, 上面的这段代码 执行结果是什么?

![ ](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250711181147266.webp)

看起来很正常. 首先创建了两个节点. 然后分别指向对方, 就像这样:

![ ](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250711181149557.webp)

`node1` 维护自己的空间资源, 然后 `node2->_prev` 也维护同一空间, 所以 `node1.getCount()` 变为2.

`node2` 维护自己的空间资源, 然后 `node1->_next` 也维护同一空间, 所以 `node2.getCount()` 变为2.

看起来很正常. 但是 **`空间释放了吗?`**

我们是实现的 `shared_ptr` 的析构函数中, 如果释放了资源 是会输出`delete+地址`的.

再加一句话演示一下:

```cpp
struct ListNode {
    int _data;
    July::shared_ptr<ListNode> _prev = nullptr;
    July::shared_ptr<ListNode> _next = nullptr;

    ~ListNode() {
        cout << "~ListNode()" << endl;
    }
};

int main() {
    July::shared_ptr<ListNode> node1(new ListNode);
    July::shared_ptr<ListNode> node2(new ListNode);

    cout << node1.getCount() << endl;
    cout << node2.getCount() << endl;
    
    node1->_next = node2;
    node2->_prev = node1;
    
    cout << node1.getCount() << endl;
    cout << node2.getCount() << endl;
    
    July::shared_ptr<int> sp1(new int(10));
    cout << "构造 sp1, sp1:: " << *sp1 << ", pCount:: " << sp1.getCount()
         << endl;

    return 0;
}
```

![ ](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250711181152168.webp)

`sp1` 的空间释放了, 但是**`node1`和`node2`的空间并没有释放!**

用VS调试看看:

![](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250711181153836.gif)

可以看到, `main` 函数执行完`return 0;`之后, `sp1`的引用计数从`1->0`, 资源被销毁.

但是, `node1`和`node2`的引用计数 却是从`2->1`, 而且没有销毁资源. 这是为什么?

来分析一下:

1. 首先 用`shared_ptr`构造维护了两个节点: `node1` 和 `node2`

    此时, 两块资源空间, 只有各自维护, `_pCount` 为 1

2. 在 `node1` 和 `node2` 被构造出来的时候, 其各自有两个成员变量 `_next` 和 `_prev` 也被构造了出来

3. 然后, 将 `node2` 赋值给了 `node1->_next`

    此时, `node2` 的资源空间, 就有两个 `shared_ptr`对象在维护: `node2` 和 `node1->_next`

    `_pCount` 变为2

4. 将 `node1` 赋值给了 `node2->_prev`

    此时, `node1` 的资源空间, 也就有两个 `shared_ptr`对象在维护: `node1` 和 `node2->_next`

    `_pCount` 变为2

5. 然后, 直到执行 `return 0;` 

    按期望来说, `main`函数结束 `node1` 和 `node2`对象生命周期结束, 应该调用析构函数 将维护的资源释放掉

    但是, 很明显 `node1` 和 `node2` 析构函数是调用了, 但是资源并没有释放掉.

    因为 在 `node1` 和 `node2` 调用析构函数时, 两块资源空间的引用计数都是2, 是不会释放资源的, 只会将对应的引用计数--. 然后将对象摧毁掉.

    也就是说, `node1` 和 `node2` 对象被摧毁, 但由于 `原node2的_prev`还在维护`原node1`的资源空间, `原node1的_next`还在维护`原node2`的资源空间, 导致两块资源空间没有释放. 

    变化如下:

    ![|wide](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250711181155982.webp)

    我们将`原node1`标号为1号空间, `原node2`标号为2号空间

    `node1`和`node2`对象被销毁之后, 资源的维护状态就变成了: **1号空间内有对象在维护2号空间, 2号空间内有对象在维护1号空间**

    那么 **这两块空间就没办法释放** 掉了.

    因为, 如果要 **释放1号空间资源**, 就 **需要调用维护着它的 2号空间里的`_prev`对象 的析构函数**. 而 我们知道 析构函数是在 **对象生命周期结束时自动调用** 的, 想要 **2号空间里的`_prev`对象生命周期结束 就需要 释放2号空间**

    而 如果要 **释放2号空间资源**, 就 **需要调用维护着它的 1号空间里的`_next`对象 的析构函数**

    这就成了一个 **`循环`**, 然后 释放空间的条件永远无法满足, 空间就无法释放, 也无法访问. 这又是一种内存泄漏. 

    这种情况被称为, **`shared_ptr`的循环引用**, 即 两块空间内都存在`shared_ptr`对象 维护着对方空间, 导致释放空间的条件无法满足, 出现内存泄漏.

上面的这种情况, 单使用 `shared_ptr`是无法解决的. 

`shared_ptr`的循环引用问题, 需要通过 `weak_ptr` 这个智能指针来解决

### **`weak_ptr`**

`weak_ptr` 是一个特殊的智能指针, 它是辅助`shared_ptr`使用的.

它可以指向`shared_ptr`指向的对象. 但是, 它只能 **访问、管理数据**, **不能管理这块资源空间**. 即 不参与资源的释放, 也不会使资源空间的引用计数增加.

它就像一个指向`shared_ptr`指向的对象的普通指针.

并且, **`weak_ptr`只能访问已经存在的对象, 实例化新对象需要使用`shared_ptr`**

所以, 在上述例子中, 我们只需要将 `ListNode` 节点结构体中的`_prev`和`_next`改用`weak_ptr`管理数据就可以了:

```cpp
namespace July {
    template <class T>
    class shared_ptr {
    public:
        // RAII思想
        shared_ptr(T* ptr)
            : _ptr(ptr)
            , _pCount(new int(1)) {}

        ~shared_ptr() {
            release();
        }

        shared_ptr(const shared_ptr<T>& sp)
            : _ptr(sp._ptr)
            , _pCount(sp._pCount) {
            (*_pCount)++;
        }

        shared_ptr<T>& operator=(const shared_ptr<T>& sp) {
            // 这里需要用 维护资源是否相同来判断 是否需要执行赋值操作
            // 不能只判断对象是否相同, 因为不同对象维护的资源也可能相同
            if (_ptr != sp._ptr) {
                release();

                _ptr = sp._ptr;
                _pCount = sp._pCount;
                ++(*_pCount);
            }
            else {
                // 为了演示
                cout << "自我赋值, 跳过执行" << endl;
            }

            return *this;
        }

        T& operator*() {
            return *_ptr;
        }

        T* operator->() {
            return _ptr;
        }

        // 释放资源函数
        // 当前对象的引用计数为1时, 进行资源释放操作
        void release() {
            if (--(*_pCount) == 0 && _ptr) {
                cout << "delete" << _ptr << endl;
                delete _ptr;
                _ptr = nullptr;

                delete _pCount;
                _pCount = nullptr;
            }
        }

        T* get() const {
            return _ptr;
        }

        int getCount() {
            return *_pCount;
        }

    private:
        T* _ptr;
        int* _pCount;
    };

    // 简化版本的weak_ptr实现
    template <class T>
    class weak_ptr {
    public:
        weak_ptr()
            : _ptr(nullptr) {}

        weak_ptr(const shared_ptr<T>& sp)
            : _ptr(sp.get()) {}
        
        weak_ptr<T>& operator=(const shared_ptr<T>& sp) {
            _ptr = sp.get();
            return *this;
        }
        
        T& operator*() {
            return *_ptr;
        }
        
        T* operator->() {
            return _ptr;
        }

    private:
        T* _ptr;
    };
} // namespace July

struct ListNode {
    int _data;
    July::weak_ptr<ListNode> _prev;
    July::weak_ptr<ListNode> _next;

    ~ListNode() {
        cout << "~ListNode()" << endl;
    }
};

int main() {
    July::shared_ptr<ListNode> node1(new ListNode);
    July::shared_ptr<ListNode> node2(new ListNode);

    cout << node1.getCount() << endl;
    cout << node2.getCount() << endl;

    node1->_next = node2;
    node2->_prev = node1;

    cout << node1.getCount() << endl;
    cout << node2.getCount() << endl;

    return 0;
}
```

修改了, `ListNode` 之后, 这段代码的运行结果是:

![ ](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250711181201007.webp)

即使 执行了`node1->_next = node2;` `node2->_prev = node1;` `node1` 和 `node2`的引用计数也不会发生变化. 也就不会影响资源的释放.

## 智能指针的定制删除器

本文前面介绍智能指针时, 智能指针维护的资源 全部都是`new`出来的

但是, C++除了`new`之外 还有`new[]`. 而`new[]`开辟的资源 需要使用 `delete[]`释放. C++是兼容 C语言的, 还可以`malloc`空间. 这就导致了, 使用智能指针释放资源的方式并不是固定的, 并且开辟空间存储的资源也是不固定的.

智能指针 针对标准内置类型数据, 有一个很好的释放支持. 

但如果是自定义类型呢?

```cpp
class Date {
public:
    ~Date() {
        cout << "~Date" << endl;
    }

private:
    int _year = 1;
    int _month = 1;
    int _day = 1;
};

int main() {
    std::shared_ptr<Date> sp1(new Date);
    std::shared_ptr<Date> sp2(new Date[10]);

    return 0;
}
```

![ ](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250711181203363.webp)

执行后, 输出的第一行是 `~Date` 说明 `new` 出来的正常释放了.

但是, `new[]`出来的数据, 没法释放 进程直接崩溃了.

那么, 怎么才能让智能指针 支持对各种类型的数据, 各种开辟的方法实现正常的释放呢?

这就需要用到 定制删除器的概念了:

![|inline](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250711181205571.webp)

![ ](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250711181207348.webp)

查看文档中 `unique_ptr`的模板 和 `shared_ptr`的构造函数

`unique_ptr`的模板中, 实际有两个模板参数, 一个是资源类型, **另一个 则是仿函数-定制删除器 用来指定资源的释放方式**

`shared_ptr`的构造函数中, 也有一个可以传入`del`的重载, 这也是需要传入定制删除器的

定制删除器实际 就是释放资源方式的仿函数.

还是以上面的代码为例, 我们在 构造智能指针时, 传入一个`lambda表达式`:

```cpp
int main() {
    std::shared_ptr<Date> sp1(new Date);
    std::shared_ptr<Date> sp2(new Date[10], [](Date* d){ delete [] d; });

    return 0;
}
```

这段代码的执行结果:

![ ](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250711181210150.webp)

很顺利的释放了所有资源

## C++11智能指针 和 boost智能指针的关系

其实这两个东西之间的关系非常容易解释.

我们每个人肯定或多或少都玩过游戏. **他们之间的关系 就好像 游戏的体验服 和 正式服之间的关系**.

Boost库是一个非常强大且广泛使用的C++库集合, 它包含了一系列为C++开发提供便利的库, 旨在 **扩展C++标准库的功能**. Boost库的开发遵循严格的编程规范和高质量标准, 因此其代码质量和性能得到了广泛认可.

许多 Boost 库的作者本身就是 C++ 标准委员会成员, 因此, Boost“天然”成了标准库的后备, 负责向新标准输送组件, 这也使得 Boost 获得了“准”标准库的美誉

而 C++11中的三个智能指针 `unique_ptr` `shared_ptr` `weak_ptr` 就是从 Boost库中优化过来的.

1. C++ 98 中产生了第一个智能指针 `auto_ptr`, 这个智能指针太离谱

2. C++ Boost给出了更实用的 `scoped_ptr` 和 `shared_ptr` 和 `weak_ptr`.

3. C++ TR1, 引入了`shared_ptr`等. 不过注意的是TR1并不是标准版。

4. C++ 11, 引入了`unique_ptr`和`shared_ptr`和`weak_ptr`.

  需要注意的是 `unique_ptr` 对应的就是 Boost库中的`scoped_ptr`, 改了个名字

  并且这些智能指针的实现原理是参考Boost中的实现的

---

有关C++智能指针的内容, 就介绍到这里

感谢阅读~
