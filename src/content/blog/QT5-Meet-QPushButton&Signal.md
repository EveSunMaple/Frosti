---
draft: true
title: "[QT5] 通过使用按钮, 初见信号与槽, 简单了解坐标位置"
pubDate: "2024-8-27"
description: "简单使用QPushButton, 以及 首次使用信号与槽, 介绍一下坐标"
image: https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722182616835.webp
categories:
    - Blogs
tags: 
    - QT
    - 信号与槽
    - Windows
---

# 按钮控件

按钮是图形化程序中最用的控件之一

本篇文章简单使用一下`QPushButton`这个按钮控件

## 图形化添加按钮

在`QT Creator`中双击`.ui`文件, 来到`Designer`中

找到`Button->Push Button`, 将其拖入到预览窗口中:

![](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722182501075.webp)

可以随意拖动这个`Push Button`及其边界, 调整他的位置和大小

![](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722182503491.webp)

当你点击这个控件时, 可以在右下方的属性列表中看到, 第一个属性`objectName`为`pushButton`

并且, 无论你是复制一个相同的按钮, 还是在拖入一个`Push Button`, 这个新的`Push Button`都会自动生成一个唯一的`objectName`:

![](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722182505331.webp)

> `QT`程序中, 每一个控件对象的`objectName`最好都设置成唯一的, 可以最大程度的避免混淆
>
> 当然, `QT`并没有在任何层面限制控件的`objectName`必须唯一, 如果你的程序不需要通过`objectName`来确定唯一的控件, 当然可以设置重复的`objectName`

然后运行程序, 按钮可以点击但是并不会有任何行为:

![](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722182507559.webp)

要想让按钮的点击事件会触发一定的行为, 那么就要涉及到`QT`的信号与槽的机制了

## 连接信号与槽**

> 本篇文章只简单见一下信号与槽的使用

`QT`中, 信号与槽构成了一种通信机制, 用于对象之间的消息传递和事件处理等

上面在窗口中创建了两个按钮, `objectName`分别是`pushButton`和`pushButton_2`

当这两个`PushButton`被点击之后, 会产生一个信号`clicked`

而上面并没有在代码中对对象的信号做处理, 所以点击按钮没有任何行为触发

可以实现一个简单的功能, 点击按钮, 将按钮的文本设置为`Hello QT`, 并在之后点击中将其与`Hello World`相互切换:

`widget.h`:

```cpp
#pragma once

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

    // 定义一个槽函数
	void changeText();

private:
	Ui::Widget* ui;
};
```

`widget.cc`:

```cpp
#include "widget.h"
#include "ui_widget.h"

Widget::Widget(QWidget* parent)
	: QWidget(parent)
	, ui(new Ui::Widget) {
	ui->setupUi(this);

    // 连接信号与槽
	connect(ui->pushButton, &QPushButton::clicked, this, &Widget::changeText);
}

Widget::~Widget() {
	delete ui;
}

void Widget::changeText() {
	if (ui->pushButton->text() != "Hello QT")
		ui->pushButton->setText("Hello QT");
	else
		ui->pushButton->setText("Hello World");
}
```

然后, 再次运行程序并点击按钮, 可以看到一些变化:

![](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722182510773.gif)

点击第一个按钮, 会出现预想的现象

但是, 点击第二个按钮, 依旧并不会任何行为发生

出现这种情况的原因是, 代码中 只将`objectName`为`pushButton`的按钮 的点击信号, 与`槽函数changeText()`连接在了一起

`objectName`为`pushButton_2`的按钮产生的`clicked`, 并没有接收, 更没有处理

那么也就意味着, 只有`objectName`为`pushButton`产生`clicked`信号时, `Widget::changeText()`函数才会进行处理

上面的代码中, 最关键的一条语句就是:

```cpp
// Widget()构造函数中的
connect(ui->pushButton, &QPushButton::clicked, this, &Widget::changeText);
```

`connect()`函数, 是`QT`中用于连接信号与槽的一个函数, **不是Linux的`socket`编程中的`connect()`**

```cpp
QObject::connect(
    const QObject *sender,
    const char *signal,
    const QObject *receiver,
    const char *method,
    Qt::ConnectionType type = Qt::AutoConnection)
```

此函数, 需要手动传入前四个参数:

1. `const QObject *sender`

    发送者, 即 发送信号的对象, 需要继承自`QObject`类

2. `const char *signal`

    信号, 即 发送对象发送的需要被处理的信号, 是一个函数一般要在类中声明, 不过`QPushButton`内部已经声明有了`clicked`函数

    信号不需要实现函数体

3. `const QObject *receiver`

    接收者, 即 接收信号的对象, 同样需要继承自`QObject`类

4. `const char *method`

    信号处理方法, 即 当发送者发送指定信号, 接收者接收到信号之后, 接收者需要如何进行处理的函数

    此函数, 一般定义于接收者类的内部, 即 为接受者类的成员函数

值得注意的是, `signal`和`method`两个参数的类型并不是函数指针, 而是 **常量字符串**, 但是, 上面传入的是函数的指针

不过暂时不用关心这个, 只需要了解`connect()`的用法就可以了

## 代码添加按钮

上一篇文章中, 已经了解了代码创建控件的方式, 所以这里就直接列代码了:

`widget.h`:

```cpp
#pragma once

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

	void changeText();

private:
	Ui::Widget* ui;
	QPushButton* btn;
};
```

`widget.cc`:

```cpp
#include "widget.h"
#include "ui_widget.h"

Widget::Widget(QWidget* parent)
	: QWidget(parent)
	, ui(new Ui::Widget) {
	ui->setupUi(this);

	btn = new QPushButton(this);
	btn->setText("  Hello MFK  ");

	connect(btn, &QPushButton::clicked, this, &Widget::changeText);
}

Widget::~Widget() {
	delete ui;
}

void Widget::changeText() {
	if (btn->text() != "Hello QT")
		btn->setText("Hello QT");
	else
		btn->setText("Hello World");
}
```

> 为了简单了解信号与槽的基础作用, 将`QPushButton* btn`设置为`Widget`的成员变量, 为了方便槽函数进行操作

此时, 运行程序:

![](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722182514234.gif)

不过, 因为没有设置按钮的位置, 所以按钮还是在窗口的最左上角

# 坐标系

数学中的笛卡尔坐标系(平面直角坐标系)大家一定都很熟悉, X轴向右增加, Y轴向上增加

而计算机中不同, **计算机屏幕最左上角 X轴记作0, Y轴记作0, X轴向右增加 `Y轴向下增加`**, (0, 0)位置记作原点

而在`QT`中, **一个非顶级控件 所在坐标位置, 是相对于其父控件计算的, 即父控件内部的最左上角为原点**

**而一个顶级控件, 即没有父控件的控件, 其所在坐标系原点 即为整个屏幕的最左上角**

之前使用代码创建控件时, 控件的默认位置处于窗口的最左上角, 实际就是窗口的`(X:0, Y:0)`位置

## 设置控件位置

控件的位置, 是相对于其所在坐标系原点的, 即其父控件的左上角

`QT`的控件, 可以使用`move()`函数 来设置控件的位置:

`widget.cc`:

```cpp
#include "widget.h"
#include "ui_widget.h"

Widget::Widget(QWidget* parent)
	: QWidget(parent)
	, ui(new Ui::Widget) {
	ui->setupUi(this);

	btn = new QPushButton(this);
	btn->setText("  Hello MFK  ");
    // 将按钮移动到X:300, Y:300的位置
	btn->move(300, 300);

	connect(btn, &QPushButton::clicked, this, &Widget::changeText);
}

Widget::~Widget() {
	delete ui;
}

void Widget::changeText() {
	if (btn->text() != "Hello QT")
		btn->setText("Hello QT");
	else
		btn->setText("Hello World");
}
```

![](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722182516970.webp)

`move()`操作的单位是物理像素点(`px`), 与你的显示器常见的像素点单位同步(比如, `1920x1080`, `2560x1440`)

> 如果顶级控件使用`move()`, 那么就是设置窗口在显示器上的位置
