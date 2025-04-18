---
draft: true
title: "[C++] C++异常处理介绍 分析: 异常概念、异常抛出与捕获匹配原则、重新抛出、异常安全、异常体系..."
pubDate: "2023-07-07"
description: "C语言程序发生错误, 很可能会直接导致程序退出. 而C++引进了 异常的概念, 可以更灵活更快速的 排查处理错误..."
image: https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/202307071821830.webp
categories: ['tech']
tags: ["C++", "异常"]
---

# C语言 错误处理方式

在C语言中, 代码发生错误一般会有两种处理方式:

1. **终止程序**. 

    比如 直接使用`assert()`断言. 或者直接崩溃

2. **返回、设置错误码**

    C语言某些函数执行失败, 但是结果不足以导致致命问题时, 就会将错误码设置在`errno`中. 用户可以通过`strerr(errno)`来获取错误信息. 

但是这些针对错误的处理方式, 不灵活. 严重的错误直接就是崩溃, 没有一点回转的余地. 虽然程序出现问题很可能跟编写有关, 不过还是灵活一些比较好.

# C++ 异常

## 异常概念

由于C语言中针对错误的处理不灵活. 所以C++引入了异常的概念.

异常是什么?

异常是一种处理错误的方式, 当一个函数 发现自己无法处理的错误时就可以 **抛出异常**, 让函数的直接或间接的 **调用者** 处理这个错误.

```cpp
double Division(int a, int b) {
    // 当b == 0时抛出异常
    if (b == 0)
        throw "Division by zero condition!";
    else
        return ((double)a / (double)b);
}

void Func() {
    int len, time;
    cin >> len >> time;
    cout << Division(len, time) << endl;
}

int main() {
    try {
        Func();
    }
    catch (const char* errmsg) {
        cout << errmsg << endl;
    }

    return 0;
}
```

这段代码就可以展现出最简单的 抛异常、捕捉异常、处理异常的场景.

那么 这段代码执行会出现什么现象呢?

![|inline](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/202307081031865.webp)

这段代码, 我们在`main()`的`try作用域`中调用了`Func()`, 在`Func()`中调用了`Division()`计算两数相除.

执行代码后, 可以发现 当遇到除零错误时, 会打印一个字符串. 且 这个字符串就是`throw "Division by zero condition!";`中的字符串. 并且, 没有返回错误退出信息.

如果将`Func()`从`try`中移除, 又会是什么结果呢?

![|inline](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/202307081030309.webp)

此时 发生除零错误, 进程会直接被`abort`终止. 退出信息为`134`. 这是编译器帮忙强制终止了

从这里可以看出, C++异常是如何处理的:

1. `throw`

    `throw`是一个关键词, 用来抛出异常, 可以抛出 **任意类型**. 上述例子中:

    `if(b == 0);`		`throw "Division by zero condition!";`

    就是在发生除零错误时, 抛出异常`"Division by zero condition!"`

2. `try`

    `try`也是一个关键词, 一般来说可能会抛出异常的代码, 都放在`try`块中. 放在`try`块中的代码, 通常被成为 **保护代码**. 在本例中: 

    `Func()`在`try`中时, 可以捕获到异常并处理

    不在`try`中时, 不会捕获异常.

3. `catch`

    `catch`同样是一个关键词, 是用来捕获`throw`抛出的异常的. 在本例中:

    `catch (const char* errmsg)`捕获`const char*`类型的异常. **`catch`的异常类型 必须与`throw`的异常类型相同. 否则无法捕获目标异常.**

    `catch`块中的代码, 为 捕获到异常后 要做的处理.

    **可以有多个`catch`针对不同的异常进行捕获, 但是 多个`catch`中不能设置相同类型的异常**

    即, 如果像这样设置`catch`:

    ```cpp
    try {
    }
    catch (const char* e){
    }
    catch (const char* e){
    }
    ```

    在一些编译器中会报错, 最少也是一个警告:

    ![|wide](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/202307081131411.webp)

    这就表示, 第二个`catch (const char* e)`捕获不到`const char*`类型的异常. 

这就是C++异常处理的最基本的概念.

## 异常的使用

上面介绍了 最基础的异常的使用. 

不过, 想要用好异常, 还有许多的细节 和 用法需要了解.

### **1. 异常的抛出 与 捕获 的匹配原则**

1. 异常是通过抛出 **对象** 而引发的, 该 **对象的类型** 决定了应该激活哪个`catch`的处理代码

    即, **`catch`的异常类型 必须与`throw`的异常类型相同. 否则无法捕获目标异常.**

2. 被选中的处理代码是调用链中 **与该对象类型匹配 且离抛出异常位置最近** 的那一个

    这句话是什么意思呢?

    来分析这一段代码:

    ```cpp
    #include <iostream>
    
    using std::cout;
    using std::endl;
    using std::cin;
    
    double Division(int a, int b) {
        // 当b == 0时抛出异常
        if (b == 0) {
            try {
                throw "Division by zero condition!";
            }
            catch (const char* errmsg) {
                cout << "Division 捕获了 const char* 异常: " << errmsg << endl;
                return 1;
            }
        }
        else
            return ((double)a / (double)b);
    }
    
    void Func() {
        int len, time;
        cin >> len >> time;
        try {
            cout << Division(len, time) << endl;
        } 
        catch (const int errI) {
            cout << "Func 捕获了 const int 异常: " << errI << endl;
        } 
        catch (const char* errS) {
            cout << "Func 捕获了 const char* 异常: " << errS << endl;
        } 
    }
    
    int main() {
        try {
            Func();
        }
        catch (const char* errmsg) {
            cout << "main 捕获了 const char* 异常: " << errmsg << endl;
        }
    
        return 0;
    }
    ```

    这段代码, 如果发生除零错误, 会触发哪个`catch`捕获异常呢?

    ![|wide](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/202307081153143.webp)

    很明显是`Divison()`内部的`catch (const char* errmsg)`会捕捉到. 因为 **捕捉异常类型与抛出异常类型匹配 且离抛出异常位置最近**

    如果 将`Division()`内部的`catch (const char* errmsg)`改为`catch (const int errI)`, 那么又会被哪个`catch`捕捉到呢?

    ![|wide](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/202307081352678.webp)

    没错, 就是`Func()`内部的`catch (const char* errS)`

3.  `throw`抛出异常时, 编译器会生成一个 **异常对象的临时拷贝**. **就像函数返回那样**. 所以可以正常的被更上层的函数栈捕捉到.

4. 使用`catch(...)`可以 **捕获任意类型的异常**.

    也就是说, 使用`catch(...)`之后, 只要 **有异常在此之前没有被捕获**, 就 会**捕获此异常**.

    比如可以用这段代码来实验一下:

    ```cpp
    #include <iostream>
    
    using std::cout;
    using std::endl;
    using std::cin;
    
    class Exc1 {
    private:
        int _excID;
    };
    
    class Exc2 {
    private:
        int _excID;
    };
    
    double Division(int a, int b) {
        // 当b == 0时抛出异常
        if (b == 0) {
            throw "Division by zero condition!";
        }
        else if (b == 1) {
            throw 1024;
        }
        else if (b == 2) {
            throw 'b';
        }
        else if (b == 3) {
            throw Exc1();
        }
        else if (b < 0) {
            throw Exc2();
        }
        else
            return ((double)a / (double)b);
    }
    
    void Func() {
        int len, time;
        cin >> len >> time;
        try {
            cout << Division(len, time) << endl;
        } 
        catch (const int errI) { 		// 捕获const整型异常
            cout << "Func 捕获了 const int 异常: " << errI << endl;
        } 
        catch (const char errC) {		// 捕获const字符异常
            cout << "Func 捕获了 const char 异常: " << errC << endl;
        } 
    }
    
    int main() {
        while(true) {
            try {
                Func();
            }
            catch (const char* errmsg) {	// 捕获const字符串异常
                cout << "main 捕获了 const char* 异常: " << errmsg << endl;
            }
            catch (...) {
                cout << "main 捕获了 未知异常" << endl;
            }
        }
    
        return 0;
    }
    ```

    ![|inline](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/202307081418987.webp)

    `const char*`、`const int`、`const char`这三种类型的异常, 我们分别在`main()`和`Func()`中指定捕捉了.

    而 在传入的 b == 3 和 b < 0 时, 抛出的`Exc1对象和Exc2对象`异常 并没有指定捕捉. 

    但是, 他们却执行了`cout << "main 捕获了 未知异常" << endl;`这个语句. 

    即, 执行了`catch(...)`内的处理.

    这可以说明, **`catch(...)`可以捕捉任意类型的异常. 但是由于没有指定类型, 所以不知道捕捉到的究竟是什么类型的异常.**

5. 虽说 **`catch`的异常类型 必须与`throw`的异常类型相同. 否则无法捕获目标异常.**

    但实际上, 那只是一般情况下. 除此之外, 还存在一个特例:

    **如果`catch`捕捉基类异常, 那么 除了可以捕捉到`throw`抛出的 此基类异常外, 还可以捕捉到`throw`抛出的 此基类的派生类异常**

    比如这段代码:

    ```cpp
    #include <iostream>
    
    using std::cin;
    using std::cout;
    using std::endl;
    
    class faClass {
    private:
        size_t _faExcID;
    };
    
    class sonClass: public faClass { 
    private:
        size_t _sonExcID;
    };
    
    double Division(int a, int b) {
        // 当b == 0时抛出异常
        if (b == 0) {
            throw "Division by zero condition!";
        }
        else if (b == 1) {
            throw faClass();
        }
        else if (b < 0) {
            throw sonClass();
        }
        else
            return ((double)a / (double)b);
    }
    
    void Func() {
        int len, time;
        cin >> len >> time;
        cout << Division(len, time) << endl;
    }
    
    int main() {
        while (true) {
            try {
                Func();
            }
            catch (const char* errmsg) {
                cout << errmsg << endl;
            }
            catch (const faClass& e) {
                cout << "main 捕获到faClass类异常 或 以faClass为基类的派生类异常" << endl;
            }
        }
    
        return 0;
    }
    ```

    这段代码:

    1. `b`传入`0`,`throw "Division by zero condition!"`
    2. `b`传入`1`,`throw faClass()`
    3. `b`传入`负数`,`throw sonClass()`.`sonClass`是`faClass`的派生类

    而除了`catch(const char* errmsg)`之外, 只`catch(const faClass& e)`

    那么, 这段代码发生各种异常的结果是什么?

    ![|inline](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/202307081439541.webp)

    可以看到, 当`b`传入`负数`或`1`时, 都会执行`catch (const faClass& e)`内的处理动作.

    这其实就证明了, **如果`catch`捕捉基类异常, 那么 除了可以捕捉到`throw`抛出的 此基类异常外, 还可以捕捉到`throw`抛出的 此基类的派生类异常**

    **`这个特性非常的有用! 经常在开发中使用!`**

### **2. 在函数调用链中 异常栈展开匹配原则**

1. 首先检查`throw`本身是否在`try`块内部. 

    如果是, 则在当前函数栈帧 查找匹配的`catch`语句

    如果当前函数栈帧有匹配的, 则 **跳到`catch`的地方进行处理**

2. 如果当前函数栈帧内没有匹配的, 则 **退出当前函数栈, 继续在外层调用函数的栈中进行查找匹配的`catch`**

    此操作, 会一直退出到`main()`函数栈帧中

3. 如果到达`main`函数的栈, 依旧没有匹配的`catch`, 则 **终止进程**

4. 整个沿着调用链 向更外层调用函数的栈帧中查找匹配的catch的行为, 被称为 **栈展开**

5. 为了避免 由于异常没有匹配的`catch`导致进程终止, 所以 **都会在最后 使用`catch(...)`捕获未知异常**

6. **找到匹配的`catch`子句并处理以后, 会继续沿着`catch`子句后面继续执行**

此原则中, 前三条原则 即为栈展开的过程.

假如存在`Func1()`、`Func2()`、`Func3()`:

```cpp
void Func3() {
    throw "Throw an exception directly!";
    cout << "hello Func3" << endl;
}

void Func2() {
    Func3();
    cout << "hello Func2" << endl;
}

void Func1() {
    Func2();
    cout << "hello Func1" << endl;
}
```

且,`main()`函数呢存在以下内容:

```cpp
int main() {
    try {
        Func1();
    }
    catch (const char* errmsg) {
        cout << errmsg << endl;
    }
    cout << "hello main" << endl;

    return 0;
}
```

那么,`throw`异常之后, 栈展开的过程大概为这样的:

![ ](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/202307081545386.webp)

C++异常处理有一个 **`非常麻烦`** 的点.

**`throw`之后, 如果找到对应类型的`catch`, 会直接跳转到对应函数栈帧内执行`catch`子句, 执行完之后 会留在此函数内继续向下执行. 而不是回到`throw`继续向下执行.**

执行上面的代码也可以证明这一点:

![|inline](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/202307081552569.webp)

`Func1()`、`Func2()`、`Func3()`中, 都有一句`cout`语句. 但是, 只执行了`main()`中的`cout`语句.

这样很可能会造成什么后果呢? 可以看一看这段代码:

```cpp
#include <iostream>

using std::cout;
using std::endl;

void Func1() {
    // new一块空间
    int* arr = new int[20480];

    throw "Throw an exception directly!";
    cout << "hello Func1" << endl;

    delete[] arr;
}

int main() {
    while (true) {
        try {
            Func1();
        }
        catch (const char* errmsg) {
            cout << errmsg << endl;
        }
        cout << "hello main" << endl;
    }

    return 0;
}
```

这段代码执行之后, 会发生什么后果?

没错, **`内存泄漏! 非常严重的内存泄漏!`**

![ ](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/202308211609441.gif)

可以看到, 名为`exception_test.exe`的内存占用, 在疯狂的上涨.

这是比较明显的内存泄漏. 这是什么原因呢?

其实是因为, 我们`new int[20480]`出来的空间, 没有被`delete[]`掉. 

但是`Func1()`函数中,`new[]`之后 函数结束前 明明`delete[]`了, 为什么没有`delete[]`掉呢?

就是因为`Func1()`函数内`throw`之后, 直接跳到了`main()`中`catch`的位置, **并且留在了`main()`中没有回到`throw`那里**. 所以 在throw之后的 **`delete[]`语句根本就没有执行**. 就 **造成了内存泄漏**

当前阶段, 如何正确的解决这个问题呢?

如果存在`new`之后会`throw`的可能, 就需要直接在`Func1()`内 将`throw`放在`try`块内, 就地`catch`处理并返回:

```cpp
void Func1() {
    // new一块空间
    int* arr = new int[20480];
	
    try {
        throw "Throw an exception directly!";
    }
    catch (const char* errmsg) {
        cout << errmsg << endl;
        delete[] arr;
        return;
    }

    // 这里也要delete[]
    // 因为在其他场景中, 可能并不一定会throw
    delete[] arr;
}
```

这样, 就不会发生内存泄漏了:

![ ](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/202308211609599.gif)

这是当前阶段最简单的处理方式, 不过太难用.

### **3. 异常的重新抛出**

观察这段代码:

```cpp
double Division(int a, int b) {
    // 当b == 0时抛出异常
    if (b == 0) {
        throw "Division by zero condition!";
    }
    return (double)a / (double)b;
}

void Func() {
    int* array = new int[10];
    
    try {
        int len, time;
        cin >> len >> time;
        cout << Division(len, time) << endl;
    }
    catch (...) {
        cout << "delete []" << array << endl;
        delete[] array;
        throw;
    }
    
    cout << "delete []" << array << endl;
    delete[] array;
}

int main() {
    try {
        Func();
    }
    catch (const char* errmsg) {
        cout << errmsg << endl;
    }
    
    return 0;
}
```

`Func()` 中`new`了一个数组. 但是在`delete[]`之前又有可能`throw`异常. 

此异常的处理动作, 已经在 `main()`函数中实现了.

但是, 由于还有`new`出来的空间未`delete`, 又不得不在`Func()`函数内添加一个`try{...}catch{...}`

不过, 这里的捕获异常 可以**使用`catch(...)`捕获任意异常, 并且不处理异常, 只将未释放的空间`delete`掉, 然后再将异常原从新抛出**

抛出之后, **会再沿着调用链进行栈展开寻找对应的`catch`, 找到真正处理此异常的`catch`再处理掉异常**

上面例子中, `Func()` 的`catch(...)`子句中的 `throw` 即为 **重新抛出异常**

> 由于这里使用的是 `catch(...)` 没有指定类型捕获, 所以 `throw;` 就可以重新抛出
>
> 如果指定了类型 `catch(const char* errmsg)`, 就需要 `throw errmsg;` 来实现重新抛出.

### **4. 异常安全**

关于异常的使用, 有一些情况下需要非常的小心:

1. 构造函数的作用是 完成对象的构造和初始化, 最好 **不要在构造函数中抛出异常**, 否则 **可能导致对象不完整或没有完全初始化**

2. 析构函数的作用是 完成资源的清理, 最好 **不要在析构函数内抛出异常**, 否则 **可能导致资源泄漏(内存泄漏、句柄未关闭等)**

3. 还有就是, 在`new`和`delete`中抛出了异常, 导致 **内存泄漏**. 在`lock`和`unlock`之间抛出了异常 **导致死锁**.

    这些问题的更加好用的解决, 需要用到智能指针.

### **5. C++标准库的异常体系**

在介绍 异常的抛出与捕获匹配原则时, 介绍过 **如果`catch`捕捉基类异常, 那么 除了可以捕捉到`throw`抛出的 此基类异常外, 还可以捕捉到`throw`抛出的 此基类的派生类异常**

并且也举了简单的例子证明. 

所以, C++委员会就根据此原则, 实现了一个 **异常类体系**.

说明白一点, 就是 C++委员会 实现了许多的类 来对应C++可能发生的所有错误, 被称为 **异常类**. 这些异常类, 都来派生于一个基类 `std::exception`.

![|inline](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/202307081714069.webp)

文档中对此类的描述是:

**标准库中所有组件抛出的异常对象都派生于此类. 因此, 通过捕获此类, 就可以捕获所有标准异常**

此类中, 除了构造、析构等成员函数之外, 还实现了一个共其派生类重写的成员函数`what()`

#### **`what()`**

![|inline](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/202307081724540.webp)

`what()` 有什么用呢?

由于标准异常有很多, 而且都可以通过捕获`std::exception`来捕获.

所以, **捕获到之后要分辨 捕获到的究竟是什么异常是很麻烦的**

所以, `std::exception`提供了`what()`函数. 它需要实现的作用是: **`获取标识异常的字符串`**

设置成虚函数, 就是为了让派生类重写此函数, 实现不同派生类可以 返回标识其本身的字符串.

也就是说, 通过捕获`std::exception`捕获到异常对象之后, **可以调用其成员函数`what()`并接收其返回值, 来知道捕获到的是什么异常**.

#### C++标准库中的异常类

![|inline](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/202307081734176.webp)

C++标准库中, 实现了许多的异常类.

1. **`bad_alloc`**

    分配内存失败时, 抛出的异常.

2. **`bad_cast`**

    动态转换时, 抛出的异常

3. **`out_of_range`**

    越界访问时, 抛出的异常

4. ...

这张图, 可以用来表示 C++标准库中的异常类体系:

![](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/202307081759809.webp)

### **6. 自定义异常体系**

实际的项目开发中, 许多的公司都会自己定义一套异常体系 来进行规范的异常管理. 

原因嘛, 用一句话总结 大概就是: 标准库的异常体系无法满足需求.

这里有一个 自定义异常体系的例子:

```cpp
#include <iostream>
#include <string>
#include <unistd.h>

using std::string;
using std::cout;
using std::endl;

class Exception {
public:
    Exception(const string& errmsg, int id) 
        : _errmsg(errmsg)
        , _id(id) 
    {}
    
    virtual string what() const {
        return _errmsg; 
    }

protected:
    string _errmsg;
    int _id;
};

class SqlException : public Exception {
public:
    SqlException(const string& errmsg, int id, const string& sql)
        : Exception(errmsg, id)
        , _sql(sql) 
    {}

    virtual string what() const {
        string str = "SqlException:";
        str += _errmsg;
        str += "->";
        str += _sql;

        return str;
    }

private:
    const string _sql;
};

class CacheException : public Exception {
public:
    CacheException(const string& errmsg, int id) 
        : Exception(errmsg, id) 
    {}
    
    virtual string what() const {
        string str = "CacheException:";
        str += _errmsg;

        return str;
    }
};

class HttpServerException : public Exception {
public:
    HttpServerException(const string& errmsg, int id, const string& type)
        : Exception(errmsg, id)
        , _type(type)
    {}

    virtual string what() const {
        string str = "HttpServerException:";
        str += _type;
        str += ":";
        str += _errmsg;

        return str;
    }

private:
    const string _type;
};

void SQLMgr() {
    if (rand() % 7 == 0) {
        throw SqlException("权限不足", 100, "select * from name = '张三'");
    }
    else {
        cout << "Sql Success" << endl;
    }
}

void CacheMgr() {
    if (rand() % 5 == 0) {
        throw CacheException("权限不足", 101);
    }
    else if (rand() % 6 == 0) {
        throw CacheException("数据不存在", 102);
    }
    else {
        cout << "Cache Success" << endl;
    }
    
    SQLMgr();
}

void HttpServer() {
    if (rand() % 3 == 0) {
        throw HttpServerException("资源请求错误", 103, "get");
    }
    else if (rand() % 4 == 0) {
        throw HttpServerException("权限不足", 104, "post");
    }
    else {
        cout << "Http Success" << endl;
    }
    
    CacheMgr();
}

int main() {
    srand(time(0));
    while (true) {
        // 此代码中 唯一一个不能跨平台的函数sleep(), 这里用的是 Linux环境
        // Windows 平台 需要将其换为 Sleep(1000);
  		// 并将 头文件 unistd.h 换为 Windows.h
        sleep(1);
        try {
            HttpServer();
        }
        catch (const Exception& e) {
            // 多态
            cout << e.what() << endl;
        }
        catch (...) {
            cout << "Unkown Exception" << endl;
        }
    }
    
    return 0;
}
```

我们先分析一下这段代码:

1. 首先, 代码实现了 4 个类: 1个基类, 3个派生类

    > 基类 `Exception`
    >
    > 成员变量: `_errmsg`, `string`类型 用于存储异常信息. `_id`, `int`类型 用于存储异常代码
    >
    > 成员函数: `what()`, 返回异常信息, 用于获取当前异常类

    > 派生类1 `SqlException`
    >
    > 成员变量: 除继承于基类的 `_errmsg` 和 `_id` 之外. `_sql`, `const string`类型 用于存储 **异常`sql`指令**
    >
    > 成员函数: 重写`what()`, 返回异常信息, 包括 `所属类`、`_errmsg`和`_sql`

    > 派生类2 `CacheException`
    >
    > 成员变量: 除继承于基类的 `_errmsg` 和 `_id` 之外, 无其他成员变量.
    >
    > 成员函数: 重写`what()`, 返回异常信息, 包括 `所属类`和`_errmsg`

    > 派生类3 `HttpServerException`
    >
    > 成员变量: 除继承于基类的 `_errmsg` 和 `_id` 之外. `_type`, `const string`类型 用于存储 发生异常的服务类型
    >
    > 成员函数: 重写`what()`, 返回异常信息, 包括 `所属类`、`type`和`_errmsg`

2. 其次, 实现了三个函数 用来模拟不同的服务的异常场景

    > **`SqlMgr()`:**
    >
    > 模拟数据库管理时的异常场景: 
    >
    > `随机数 % 7 == 0` 执行 `throw SqlException`. 来模拟数据库管理时权限不足的场景.
    >
    > 异常信息: `权限不足`, 异常代码: `100`, 异常`Sql`语句: `select * from name = '张三'`

    > **`CacheMgr()`:**
    >
    > 模拟缓存管理时的异常场景:
    >
    > `随机数 % 5 == 0` 执行 `throw CacheException("权限不足", 100)`
    >
    > 异常信息: `权限不足`, 异常代码: `101`
    >
    > `随机数 % 6 == 0` 执行 `throw CacheException("数据不存在", 101)`
    >
    > 异常信息: `数据不存在`, 异常代码: `102`
    >
    > 最后, 调用 `SqlMgr()`

    > **`HttpServer()`:**
    >
    > 模拟HTTP服务可能发生的异常场景:
    >
    > `随机数 % 3 == 0` 执行 `HttpServerException("请求资源不存在", 200, "get")`
    >
    > 异常信息: `资源请求错误`, 异常代码: `103`, 异常服务类型: `get`
    >
    > `随机数 % 4 == 0` 执行 `HttpServerException("权限不足", 100, "post")`
    >
    > 异常信息: `权限不足`, 异常代码: `104`, 异常服务类型: `post`
    >
    > 最后, 调用`CacheMgr()`

3. 最后, 主函数内 死循环模拟服务器运行.

    `try`块内调用`HttpServer()`, 而`HttpServer()`内调用`CacheMgr()`, `CacheMgr()`内调用`SqlMgr()`, 模拟服务运行的流程.

    `catch (const Exception& e)及代码块`实际作用是 捕获三种异常类, 并多态调用不同异常类对象的`what()` 接受打印相关异常信息

    `catch (...)及代码块`捕获其他异常, 输出未知异常

至此, 整个代码分析结束, 从`HttpServer()` 层层调用到 `SqlMgr()`, 每个函数内都有概率抛出不同的异常, 抛出之后会在 `main`内被捕获并处理.

查看执行结果:

![|inline](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/202308211609376.gif)

从结果可以看到, 每次循环 每层调用都有一定的概率抛异常. 并且都会在`main`函数内被捕捉到并处理.

> 图中, 光标可能在某行停顿1-2s, 说明此时并没有异常抛出

---

在添加一个`SeedMsg()`函数, 模拟发送信息异常. 

```cpp
void SeedMsg(const string& str) {
    if (rand() % 2 == 0) {
        throw HttpServerException("SeedMsg::网络错误", 105, "put");
    }
    else if (rand() % 4 == 0) {
        throw HttpServerException("SeedMsg::你已经不是对方好友", 106, "post");
    }
    else {
        cout << "消息发送成功！->" << str << endl;
    }
}
```

将 `main()` 函数try块中执行的函数 换为此函数, 查看执行:

![|inline](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/202308211609918.gif)

并尝试, 将 **网络错误异常的处理方式** 改为 发生异常之后 直接重试再发送10次.

其实很简单, 只需要改动`main`函数内容就可以(不过要先在 `Exception`类中添加一个成员函数`getid()`):

```cpp
int main() {
    srand(time(0));
    while (true) {
        // 此代码中 唯一一个不能跨平台的函数sleep(), 这里用的是 Linux环境
        // Windows 平台 需要将其换为 Sleep(1000);
  		// 并将 头文件 unistd.h 换为 Windows.h
        sleep(1);
        try {
            for(int i = 1; i <= 10; i++) {
                try {
            		SeedMsg("你好啊?");
                    // 能走到这里 一定发送成功
                    // 直接break跳出 for循环
                    break;
                }
                catch (const Exception& e) {
                    if (e.getid() == 105) {
                        // 针对 103 异常处理
                        cout << "网络错误, 重发送, 第 " << i << " 次" << endl;
                        continue;
                    }
                    else {
                        // 不是此异常, 重新抛出
                        throw e;
                    }
                }
            }
        }
        catch (const Exception& e) {
            // 多态
            cout << e.what() << endl;
        }
        catch (...) {
            cout << "Unkown Exception" << endl;
        }
    }
    
    return 0;
}
```

执行结果:

![inline](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/202308211610265.gif)

这里的关键点就是, **异常的重新抛出**, 还有 **`SeedMsg()`之后的`break`**.

由于需要特定的处理 `_id`为`105`的异常, 所以需要先就近`catch`一下, 然后判断异常代码, 进行处理.

而, 由于只处理105异常, 其他异常就需要再次抛出, 让其他地方处理.

然后, `SeedMsg()`之后的`break`. `SeedMsg()`正常返回, 就一定会顺着向下走, 也表示这发送成功, 就不需要继续`for`循环, 所以直接`break`. 如果抛异常, 则会跳过`break`, 然后异常被下面的`catch`子句捕获.

---

介绍到这里, C++关于异常的内容 就暂时介绍完了. 

感谢阅读~
