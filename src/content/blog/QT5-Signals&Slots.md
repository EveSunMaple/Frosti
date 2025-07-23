---
draft: true
title: "[QT5] 信号与槽: 认识信号与槽, 认识connect, 自定义信号和槽..."
pubDate: "2024-12-13"
description: "QT中, 什么信号和槽? connect()有什么作用? 如何自定义槽? 如何自定义信号?"
image: https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722182752048.webp
categories:
    - Blogs
tags:
    - QT
    - 信号与槽
---

 

之前的文章中, 通过`PushButton`这个控件简单见了一下**信号**和**槽**

实现了通过点击`PushButton`改变按钮上显示的文本

那么`QT`中, 究竟什么是信号, 什么是槽?

# 信号和槽

`Linux`系统中, 系统可以向进程发送信号, 进程收到信号之后, 进程默认以不同的形式终止

`QT`中的信号与`Linux`中的信号没有任何关系, 但是使用非常相似

## 什么是信号、槽

用比较简单的话来介绍:

**`QT`的信号`(signal)`, 是由`QObject`的各种派生类对象产生的, 一般表示对象发生了某种事情, 以类的成员函数的形式存在, 但一般不实现函数体**

比如, 在`QPushButton`对象被点击时, 会产生一个`clicked`信号, 表示对象被点击了

**`QT`的槽`(slot)`, 是在特定信号发生后, 对此信号要执行的处理函数, 同样以类的成员函数的形式存在**

如果使用`connect()`将对象的特定信号与槽函数连接起来, 当特定对象产生特定信号时, 与此信号连接的槽函数就会被调用执行

所以**槽函数其实是一种回调函数, 信号与槽机制实际是`QT`中的一种对象间通信的机制**

---

## `connect()` **

`connect()`可以将对象的信号与信号处理槽函数连接起来, 接口具体长这样:

```cpp
static QMetaObject::Connection connect(
    const QObject *sender, const char *signal,
    const QObject *receiver, const char *member, 
    Qt::ConnectionType = Qt::AutoConnection);
```

但是下面这样使用`connect()`也能将信号与槽连接起来:

创建一个最基本的`QWidget`项目, 修改`widget.cpp`中`Widget`构造函数的内容:

```cpp
Widget::Widget(QWidget* parent)
    : QWidget(parent)
    , ui(new Ui::Widget) {
    ui->setupUi(this);

    btn = new QPushButton(this);
    btn->setText("hello close");

    connect(btn, &QPushButton::clicked, this, &Widget::close);
}
```

在界面中添加一个`QPushButton`控件, 将此按钮的`clicked`信号 与 `Widegt`的`close`槽函数连接起来, 可以实现以下效果:

![|huger](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722182804593.gif)

`connect()`这个函数来自于`QObject`类, 是`QObject`类的成员函数

`QObject`类是非常多`QT`类的祖先基类, 包括`QWidget`:

![|lwide](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722182806538.webp)

`connect()`是它的成员函数, 所以可以在`Widget`构造函数中直接调用

`connect()`有四个参数非缺省参数:

1. `const QObject *sender`

    第一个参数, 需要传入一个`QObject`对象指针

    表示可以发出特定信号的对象, 即 信号的发送者

2. `const char *signal`

    第二个参数, 需要传入一个`char*`对象

    表示信号发送者 发送的信号

3. `const QObject *receiver`

    第三个参数, 需要传入一个`QObject`对象指针

    表示发送者 发送的特定信号 的接收者, 即 信号的接收者

4. `const char *member`

    第四个参数, 需要传入一个`char*`对象

    表示信号接收者拥有的槽函数, 即 信号处理函数

第一和第三个参数, 不用过多说明 传入的是 发送信号的控件对象和接收信号的控件对象

而第二和第四个参数, 需要传入**信号**和**槽函数**, 但是类型**并不是函数指针, 而是`char*`**

而`QPushButton::clicked`和`Widget::close`实际是什么类型呢?

![|lwide](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722182808812.webp)

`QPushButton::clicked()`和`Widget::close()`实际就是函数

函数指针和`char*`类型是禁止隐式转换的, 除了都是指针, 是两个完全不相干的东西

但为什么`connect()`对应的的参数却不是函数指针而是`char*`类型呢?

实际上, 信号和槽参数类型是`const char*`的`connect()`是`QT4`及以前版本的接口

`QT4`中的`connect()`, 在使用时需要这样使用:

```cpp
connect(btn, SIGNAL(clicked()), this, SLOT(close()));
```

第二个参数, 需要借助`SIGNAL`宏来传参, `SIGNAL()`的参数不需要指明类, 但要加上`()`

第四个参数, 需要借助`SLOT`宏来传参, `SLOT`的用法与`SIGNAL`相同

`SIGNAL()`和`SLOT()`宏会根据传入的参数生成字符串, 进而传入`connect()`中

---

`QT5`中, 重载了一个泛型的`connect()`

![](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722182810856.webp)

**`QT5`中的`connect()`, 函数原型实际是这样的:**

```cpp
template <typename Func1, typename Func2>
static inline QMetaObject::Connection connect(
    const typename QtPrivate::FunctionPointer<Func1>::Object *sender,
    Func1 signal,
    const typename QtPrivate::FunctionPointer<Func2>::Object *receiver,
    Func2 slot,
    Qt::ConnectionType type = Qt::AutoConnection);
```

更乱了, 但还是可以理解一下:

1. 模板声明: `template <typename Func1, typename Func2>`

    即, 此函数两个模板参数`Func1`和`Func2`

2. `const typename QtPrivate::FunctionPointer<Func1>::Object *sender`

    第一个参数, 需要传入信号发送者对象

    参数类型很长

3. `Func1 signal`

    第二个参数, 需要传入信号

    信号类型, 即为 模板参数`Func1`的类型

4. `const typename QtPrivate::FunctionPointer<Func2>::Object *receiver`

    第三个参数, 需要传入信号接收者对象

    参数类型很长

5. `Func2 slot`

    第四个参数, 需要传入槽函数

    槽函数类型, 即为 模板参数`Func2`的类型

冷静的分析一下参数类型, 可以发现在正常使用`connect()`时, `Func1`和`Func2`这两个类型是确定的

**就是传入的信号和槽的类型**

而`QtPrivate::FunctionPointer< Func1/2 >::Object`就能根据`Func1`和`Func2`, 萃取出 传入的信号发送者和信号接收者的原类型(目前不需要太过关注这个过程)

这样, 就能实现**信号和槽**的连接

**`connect()`的返回值是`QMetaObject::Connection`类型, 可以表示连接的句柄, 可以通过这个句柄断开连接**

**`connect()`的使用需要注意的一个点是**: 调用时传参, 需要保证参数2确实是参数1的信号, 参数4确实是参数3拥有的槽

## 槽和信号的自定义

直接或间接继承自`QObject`的类, 都默认拥有一些信号和槽

除此之外, 信号和槽也可以自定义实现

### 自定义槽

槽函数的自定义途径, 不仅仅只有一种

#### 途径1: 完全通过代码

`QT4`之前, 自定义槽需要将槽函数声明在`slots`关键词下:

```cpp
class Widget : public QWidget {
    Q_OBJECT

public:
    Widget(QWidget* parent = nullptr);
    ~Widget();

private slots:
    void aSlotFunc();

private:
    Ui::Widget* ui;
};
```

![|huge](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722182813797.webp)

只有声明在`slots`下的函数, 才是槽

> `slots`是`QT`自己扩展的关键词, 与C++标准库无关

而在`QT5`之后, 自定义槽函数就不需要在`slots`关键字下声明了:

![|huge](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722182815897.webp)

完成函数的定义之后, 就可以当作一个正常的槽使用了:

`widget.cc`:

```cpp
#include "widget.h"
#include "ui_widget.h"

Widget::Widget(QWidget* parent)
    : QWidget(parent)
    , ui(new Ui::Widget) {
    ui->setupUi(this);

    btn = new QPushButton(this);
    btn->setText("按钮");
    btn->move(300, 270);
    btn->setFixedSize(200, 30);

    connect(btn, &QPushButton::clicked, this, &Widget::aSlotFunc);
}

Widget::~Widget() {
    delete ui;
}

void Widget::aSlotFunc() {
    btn->setText("按钮已经被点击");
    this->setWindowTitle("自定义槽");
}
```

`widget.h`:

```cpp
#ifndef WIDGET_H
#define WIDGET_H

#include <QWidget>
#include <QPushButton>

QT_BEGIN_NAMESPACE
namespace Ui {
    class Widget;
}
QT_END_NAMESPACE

class Widget : public QWidget {
    Q_OBJECT

public:
    Widget(QWidget* parent = nullptr);
    ~Widget();

    void aSlotFunc();

private:
    Ui::Widget* ui;
    QPushButton* btn;
};

#endif // WIDGET_H
```

运行此程序:

![|huger](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722182818779.gif)

#### 途径2: 图形化创建槽函数

`QT`不仅能通过代码创建控件, 还能直接通过图形化的方法添加控件

自然能够通过图形化的方法, 添加自定义槽

先通过`Designer`添加`PushButton`控件

![](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722182820945.webp)

右键`PushButton`控件, 选择**转到槽**

![](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722182822939.webp)

然后**可以选择控件继承树中的所有信号**:

![](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722182824876.webp)

选择`clicked()`信号之后, `QT Creator`就会自动跳转到`widget.cc`中并创建槽函数定义, 同时`Widget`类中也会声明好相同的槽函数:

![](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722182826583.webp)

对此槽函数实现与上面相同的功能, 并运行:

```cpp
void Widget::on_pushButton_clicked() {
    ui->pushButton->setText("按钮已经被点击");
    this->setWindowTitle("图形化自定义槽函数");
}
```

![|huger](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722182836535.gif)

从执行结果来看, 可以正常运行

**但是, 代码中并没有调用`connect()`**

明明没有通过`connect()`连接信号和槽, 为什么点击按钮 还是能够正确的执行槽函数呢?

答案就在`QT Creator`自动创建的槽函数上

通过图形化的方法自动创建的槽函数, 函数名默认有一定的规则: `on_pushButton_clicked()`

观察这个槽函数名可以发现它其实是由3部分组成的: **`on_<objectName>_<signal>()`**

即, **当槽函数名以上面这样的规则定义时, 可以不通过`connect()`实现信号与槽的连接, 而是自动的通过草函数名与特定的信号建立连接**

当然, 并不是只定义好槽函数就能实现了, 还需要调用另外一个函数:

![](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722182838677.webp)

根据`.ui`文件自动生成的`UI_Widget`类中, 调用了**`QMetaObject::connectSlotsByName(Widget);`**

这个调用, 可以让整个`Widget`对象树上的所有**控件通过特定规则的槽函数名和特定信号自动连接, 而不用手动调用`connect()`**

**只有槽函数名遵循`on_<objectName>_<signal>()`这个规则时, 才能实现通过槽函数名与信号自动连接**

### 自定义信号

自定义槽函数时, `QT4`及以前必须将槽定义在`slots`关键字下, `QT5`之后才不需要

但是自定义信号, 就必须使用一个关键词`signals`

即, **自定义信号必须要声明在`signals`关键字下**

`widget.h`:

```cpp
#ifndef WIDGET_H
#define WIDGET_H

#include <QWidget>
#include <QPushButton>

QT_BEGIN_NAMESPACE
namespace Ui {
    class Widget;
}
QT_END_NAMESPACE

class Widget : public QWidget {
    Q_OBJECT

public:
    Widget(QWidget* parent = nullptr);
    ~Widget();

signals:
    void diySignal();	// 自定义信号

private slots:
    void on_pushButton_clicked();
    void diySignalHandler();

private:
    Ui::Widget* ui;
};

#endif // WIDGET_H
```

`widget.cc`:

```cpp
#include "widget.h"
#include "ui_widget.h"

Widget::Widget(QWidget* parent)
    : QWidget(parent)
    , ui(new Ui::Widget) {
    ui->setupUi(this);

    connect(this, &Widget::diySignal, this, &Widget::diySignalHandler);
}

Widget::~Widget() {
    delete ui;
}

// 按钮被点击槽, 发送自定义信号
void Widget::on_pushButton_clicked() {
    ui->pushButton->setText("按钮已被点击, 槽发送diySignal");
    emit diySignal();
}
// 自定义信号的槽
void Widget::diySignalHandler() {
    this->setWindowTitle("diySignal被接收到, 并执行槽函数");
}
```

这段代码的执行结果为:

![|huger](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722182842382.gif)

在`signals:`关键字下定义了`diySignal`信号, 并定义了此信号的槽, 并建立连接

通过`emit`关键字发送了`diySignal`信号, 能够实现对信号的处理

> **`emit`是发送信号的关键字**
>
> 不过, 在`QT5`之后 不使用`emit`直接调用信号, 也能实现信号的发送

## 带参的信号和槽

信号和槽是可以携带参数的

当信号携带参数被发出时, 与其链接的槽函数是可以捕捉信号携带的参数的

举个例子:

`widget.h`

```cpp
#ifndef WIDGET_H
#define WIDGET_H

#include <QWidget>
#include <QPushButton>

QT_BEGIN_NAMESPACE
namespace Ui {
    class Widget;
}
QT_END_NAMESPACE

class Widget : public QWidget {
    Q_OBJECT

public:
    Widget(QWidget* parent = nullptr);
    ~Widget();

signals:
    void diySignal(int, const QString&); 	// 带参数的信号

private slots:
    void on_pushButton_clicked();
    void diySignalHandler(int, const QString&);	// 带参数的槽

private:
    Ui::Widget* ui;
};

#endif // WIDGET_H
```

`widget.cc`

```cpp
#include "widget.h"
#include "ui_widget.h"

Widget::Widget(QWidget* parent)
    : QWidget(parent)
    , ui(new Ui::Widget) {
    ui->setupUi(this);

    connect(this, &Widget::diySignal, this, &Widget::diySignalHandler);
}

Widget::~Widget() {
    delete ui;
}

void Widget::on_pushButton_clicked() {
    ui->pushButton->setText("按钮已被点击, 槽发送diySignal");
    // 按钮点击信号的槽函数, 发送自定义信号
    emit diySignal(20, "diySignal携带一个标题参数");
}

void Widget::diySignalHandler(int num, const QString& title) {
    this->setWindowTitle(title);
    qDebug("Receive type(int) data: %d\n", num);
}

```

定义了参数为`const QString&`的信号和槽

![|huger](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722182845920.webp)

并在发出信号时传参:

![|huger](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722182848111.webp)

这段代码的执行结果为:

![](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722182849862.gif)

槽函数能够捕捉信号携带的参数

### 信号与槽的带参规则

信号与槽的定义都可以带参, 并且 槽能够捕捉信号的参数

不过, 带参的规则是 **信号与槽的对应顺序参数类型必须一致, 且信号参数的个数需小于等于槽参数个数**

**信号与槽的对应参数类型必须一致**, 即 如果信号的参数的类型是`const QString&, int`, 那么 对应槽的参数类型也应该是`const QString&, int`, 而不能是`int, const QString&`, 否则编译不通过

将上述例子中, 槽的参数 交换顺序

```cpp
void diySignalHandler(const QString&, int);

void Widget::diySignalHandler(const QString& title, int num) {
    this->setWindowTitle(title);
    qDebug("Receive type(int) data: %d\n", num);
}
```

再试图编译运行:

![](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722182852193.webp)

编译不通过

所以, **信号与槽的对应顺序参数类型必须一致**

除此之外, **信号与槽的参数个数是不需要完全一致的, 槽的参数个数不能大于信号的参数个数**

即, 如果信号存在两个参数, 那么槽最多能够拥有两个参数, 一个参数也可以:

`widget.h`:

```cpp
#ifndef WIDGET_H
#define WIDGET_H

#include <QWidget>
#include <QPushButton>

QT_BEGIN_NAMESPACE
namespace Ui {
    class Widget;
}
QT_END_NAMESPACE

class Widget : public QWidget {
    Q_OBJECT

public:
    Widget(QWidget* parent = nullptr);
    ~Widget();

signals:
    void diySignal(int, const QString&); 	// 一个自定义带参信号

private slots:
    void on_pushButton_clicked();
    void diySignalHandler1(int num, const QString&);	// 两个参数的槽
    void diySignalHandler2(int num);	// 一个参数的槽

private:
    Ui::Widget* ui;
};

#endif // WIDGET_H
```

`widget.cc`:

```cpp
#include "widget.h"
#include "ui_widget.h"

Widget::Widget(QWidget* parent)
    : QWidget(parent)
    , ui(new Ui::Widget) {
    ui->setupUi(this);

    // 一个信号连接两个槽 
    connect(this, &Widget::diySignal, this, &Widget::diySignalHandler1);
    connect(this, &Widget::diySignal, this, &Widget::diySignalHandler2);
}

Widget::~Widget() {
    delete ui;
}

void Widget::on_pushButton_clicked() {
    ui->pushButton->setText("按钮已被点击, 槽发送diySignal");
    // 按钮点击信号的槽函数, 发送自定义信号
    emit diySignal(20, "diySignal携带一个标题参数"); // 发出两个参数的信号
}

void Widget::diySignalHandler1(int num, const QString& title) {
    this->setWindowTitle(title);
    qDebug("Handler1 receive type(int) data: %d\n", num);
}

void Widget::diySignalHandler2(int num) {
    qDebug("Handler2 receive type(int) data: %d\n", num);
}
```

这段代码的执行结果是:

![](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722182855408.gif)

可以看到, 两个槽都能够成功接收并处理信号

`diySignal`的参数有两个`int, const QString&`, 但是有一个槽的参数为`int`

这个槽也能够与`diySignal`连接, 接收并处理发出的`diySignal`信号

---

上面的结果显示: 

**信号与槽的对应顺序参数类型必须一致, 且信号参数的个数需小于等于槽参数个数**

## `disconnect()`

已经了解了`connect()`的用法, 从`disconnect()`函数名上来看, 就已经可以知道它的用途

**`disconnect()`可以让信号与槽之间建立的连接断开**, 比较常用的`disconnect()`的函数原型为:

```cpp
bool disconnect(const QMetaObject::Connection &);

template <typename Func1, typename Func2>
bool disconnect(const typename QtPrivate::FunctionPointer<Func1>::Object *sender,
                Func1 signal,
                const typename QtPrivate::FunctionPointer<Func2>::Object *receiver,
                Func2 slot);
```

只有一个参数的`disconnect(const QMetaObject::Connection &)`

它的参数应该传入的, 其实是`connect`的返回值

`connect()`的原型是这样的:

```cpp
static QMetaObject::Connection connect(****);
```

它的返回值, 就是建立的信号与槽的句柄

将句柄传入`disconnect()`, 当然就能实现信号与槽连接的断开

另外一个, 就与`connect()`用法相似了, 需要传入信号发送者、信号、信号接收者、接收者拥有的槽

能够完成信号与槽之间连接的断开

举个简单的例子就能理解:

先通过图形化方式, 创建两个按钮, 并图形化创建 两个按钮`clicked`信号的槽

`widget.h`:

```cpp
#ifndef WIDGET_H
#define WIDGET_H

#include <QWidget>

QT_BEGIN_NAMESPACE
namespace Ui {
    class Widget;
}
QT_END_NAMESPACE

class Widget : public QWidget {
    Q_OBJECT

public:
    Widget(QWidget* parent = nullptr);
    ~Widget();

private slots:
    void aSlot();

    void on_pushButton_clicked();

    void on_pushButton_2_clicked();

private:
    Ui::Widget* ui;
};
#endif // WIDGET_H
```

`widget.cc`:

```cpp
#include "widget.h"
#include "ui_widget.h"

Widget::Widget(QWidget* parent)
    : QWidget(parent)
    , ui(new Ui::Widget) {
    ui->setupUi(this);
}

Widget::~Widget() {
    delete ui;
}

void Widget::aSlot() {
    ui->pushButton->setText("在按钮2被按下之后, 按钮1再被按下");
    this->setWindowTitle("按钮1的clicked信号连接的槽, 已成功被修改为aSlot()");
}

void Widget::on_pushButton_clicked() {
    // 按钮1的clicked信号的槽
    ui->pushButton->setText("按钮1已被按下");
    this->setWindowTitle("按钮1已被按下, 标题被修改");
}

void Widget::on_pushButton_2_clicked() {
    // 按钮2的clicked信号的槽
    ui->pushButton_2->setText("按钮2已被按下, 修改按钮1 clicked信号连接的槽");
    // 断开按钮1与原槽的连接
    disconnect(ui->pushButton, &QPushButton::clicked, this, &Widget::on_pushButton_clicked);
    // 按钮1与另一个槽建立连接
    connect(ui->pushButton, &QPushButton::clicked, this, &Widget::aSlot);
}
```

这段代码的执行结果为:

![|huger](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722182900618.gif)

这个例子, 是通过`disconnect()`断开连接, 然后再通过`connect()`建立新的连接
