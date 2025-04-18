---
draft: true
title: "[QT5] 遇见QT5, 初识对象树"
pubDate: "2024-8-19"
description: "简单介绍一下QT5中的一些基本的特性, Form是什么? QWidget有什么用?"
image: https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/202408280929461.webp
categories: ['tech']
tags: ["QT", "Windows", "GUI"]
---

# `QWidget`默认项目结构

使用`QT Creator`创建一个`QWidget`的默认项目之后, 可以看到整个项目的结构

![|lwide](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/202408200830383.webp)

> 博主在`QT Creator`中修改了C++源文件的后缀, 默认应该是`.cpp`

## `QWidget` 

自动生成的`main`函数所在源文件:

```cpp
#include "widget.h"

#include <QApplication>

int main(int argc, char* argv[]) {
    QApplication a(argc, argv);
    Widget w;
    w.show();
    
    return a.exec();
}
```

`main()`函数内

1. 首先创建了一个`QApplication`对象, 构造函数的参数是`argc`和`argv`, 即程序运行时传入的选项数及选项
2. 定义了一个`Widget`对象`w`, 这个类是用户创建项目时自定义命名的类, 选择`QWidget`为基类之后 默认命名就是`Widget`
3. 通过`w`调用`show()`成员函数
4. `return a.exec()`

重点看`Widget`类, 打开`widget.h`:

![|lwide](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/202408221555667.webp)

首先, 因为`Widget`是`QWidget`的派生类, 所以需要先`#include <QWidget>`

然后使用两个宏, 在合适的`namespace`内声明了`Widget`类

```cpp
QT_BEGIN_NAMESPACE
namespace Ui {
	class Widget;
}
QT_END_NAMESPACE
```

`QT_BEGIN_NAMESPACE` `QT_END_NAMESPACE` 是`QT`官方库定义的两个宏, 其实际的内容是这样定义的:

```cpp
// qglobal.h 头文件中的相关定义

#if !defined(QT_NAMESPACE) || defined(Q_MOC_RUN)
#	define QT_BEGIN_NAMESPACE
#	define QT_END_NAMESPACE
#else
#	define QT_BEGIN_NAMESPACE namespace QT_NAMESPACE {
#	define QT_END_NAMESPACE }
#endif
```

也就是说, 如果`QT_NAMESPACE`没有被定义, 那么这两个宏就就没有内容

如果, `QT_NAMESPACE`被定义了, 那么这两个宏就是 `namespace QT_NAMESAPCE`的开始和结束包含

而`QT_NAMESPACE`这个宏定义与否, 是根据用户编译时, 是否使用`-qtnamespace`选项决定的

也就是说:

1. 如果编译时没有使用`-qtnamespace`选项, 那么这两个宏就是空的

    ```cpp
    namespace Ui {
    	class Widget;
    }
    ```

2. 如果编译时使用了`-qtnamesapce`选项, 那么这两个宏就 起到命名空间的包含 作用

    ```cpp
    // 这里 QT_NAMESPACE 这个宏的内容也是由用户指定
    namespace QT_NAMESPACE {
    namespace Ui {
    	class Widget;
    }
    }
    ```

默认不做修改的话, `-qtnamespace`并不会被使用, 所以这段代码只是声明了`namespace Ui`里的`Widget`

---

下面就是 **`QWidget`类的自定义派生类`Widget`** 的定义:

```cpp
// Widget类名, 是创建项目时自定义的
class Widget : public QWidget {
	Q_OBJECT

public:
	Widget(QWidget* parent = nullptr);
    
	~Widget();

private:
	Ui::Widget* ui;
};

```

> `Q_OBJECT`也是一个宏定义, 这个宏定义比较庞大, 与信号、槽有关, 暂时不做介绍

`QT Creator`默认为`Widget`类生成了:

1. `private`的成员变量`Ui::Widget* ui`

    上d面声明的`Widget`, 就在这里被使用, 定义了一个名为`ui`的成员变量

2. 构造函数`Widget(QWidget* parent = nullptr)`

    构造函数的参数是`QWidget`的指针, 此参数的作用, 是为实例化的`Widget`对象指定一个父节点

    `QT`为管理控件, 引入了 **对象树** 的概念, 创建一个`Widget`对象就可以将此对象挂在指定的父节点上, 实现以树型对`Widget`的管理

3. 析构函数`~Widget()`

可以在`widget.cc`中 看到`Widget`成员函数的定义:

![](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/202408231420869.webp)

析构函数, 没什么内容, 只`delete`了成员变量`ui`

构造函数:

```cpp
Widget::Widget(QWidget* parent)
	: QWidget(parent)
	, ui(new Ui::Widget) {
	ui->setupUi(this);
}
```

构造函数在初始化列表中, 将传入的`QWidget`指针 用于 初始化`Widget`对象的基类部分

并`new Ui::Widget`对象 初始化成员变量`ui`

除了初始化内容, 构造函数的函数体内只有一个语句 **`ui->setupUi(this)`**

可以重点来看一下`ui::setup()`函数

> 查看`ui::setup()`函数之前, 至少要运行过一次本`QT`项目
>
> 因为`ui_widget.h`文件, 是在运行`QT`时才会自动生成的
>
> 如果不运行, 就找不到`Ui::Widget`的相关定义

![|wide](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/202408231441423.webp)

从本文件开头的注释可以得到一个信息:

**通过读取`UI`文件`"widget.ui"`生成, 且重新编译`UI`文件时, 在本文件中做出的所有修改都会丢失**

这个文件里的内容是根据设计的`.ui`文件生成的, 那么也就是说, 当修改`.ui`文件之后, 本文件也会重新生成

这也就是说, 如果手动在`ui_widget.h`中做出一些代码修改:

1. 如果不去修改`.ui`文件的内容, 那么做出的修改不会失效

    因为`QT Creator` 不会重新编译`.ui`文件, 生成新的`ui_widget.h`

2. 如果修改了`.ui`文件的内容, 那么手动在`ui_widget.h`中做出的修改就会失效

    因为`QT Creator` 会重新编译`.ui`文件, 进而生成新的`ui_widget.h`

修改了`.ui`文件, `ui_widget.h`会发生变动:

![](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/202408231451104.webp)

再编译运行程序:

![](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/202408231454166.webp)

可以看出来, `Ui_Widget`类是实际生成窗口界面所需要的一个类, 此类的内容会根据`widget.ui`这个`UI`文件自动生成

而`Ui::Widget`这个类, 就是`Ui_Widget`的派生类

在`Widget`的构造函数内 通过 **调用`ui->setup(this)`, 就能将`Widget`对象与`UI`关联起来**

然后在`main()`函数中, 调用`w.show()`就能将窗口创建并展示出来, 如果调用`w.hide()`窗口就不会被展示出来

> 从阅读代码可以看出出来, 实际上将`this`作为参数传到`ui::setup()`中, 除了对`Widget`进行一些设置之外
>
> 还是为了在创建其他的控件对象时, 为对象指定父节点

### 编译之后

使用`QT Creator`对项目 编译运行之后, 会在系统的项目目录的同级路径下额外生成一个目录:

![](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/202408261054013.webp)

这个新目录下, 就是`QT Creator`自动生成的编译前所需文件 和 编译后的结果文件:

![](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/202408261055401.webp)

在`debug`或`release`中(编译版本不同), 会生成项目对应的可执行程序:

![](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/202408261056066.webp)

## `Form`

`QT`中窗口的`UI`设计文件以`xxxx.ui`命名, `.ui`文件, 在`QT Creator`中被分类到`Forms`中

这个文件本质上是一个`XML`语言的文件:

![](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/202408231608474.webp)

不过, `QT Creator`限制了对此文件的直接编辑: `This file can only be edited in Design mode`

如果想要修改`.ui`文件的内容, 就只能在设计中以图形化的方式对`UI`进行修改, 然后编译, 进而`.ui`文件才会发生变动

**双击`.ui`文件** 就能直接进入设计页面:

![](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/202408260946513.webp)

进入设计页面之后, 中间部分 就是窗口的预览, 并且可以在这部分进行编辑

左边部分, 就是设计窗口可能用到的一些控件, 右边则是用到的控件的对象名以及控件对象的一些属性设置:

![](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/202408260950890.webp)

可以直接拖动左边的控件到窗口中, 就能够实现在窗口中添加控件:

![](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/202408260952500.webp)

此时, 编译运行, 就能看到窗口中出现了`Hello QT5`的文本:

![](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/202408260954433.webp)

## `.pro`文件

使用`QT Creator`打开一个项目, 项目中显示的第一个文件就是`项目名.pro`

打开这个文件, 可以看到一些很熟悉的内容:

![](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/202408261004522.webp)

从内容就可以分辨出来, `.pro`文件类似与`makefile`

`makefile`是`make`需要用到的文件, 而`.pro`就是`qmake`所使用的文件, 作用与`makefile`是一样的

不同的是, `QT Creator`会在编译前自动生成一个`.pro`文件, 不需要手动去编写

`.pro`文件的作用与`makefile`差不多, 不过内容也要介绍一下:

![](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/202408261035995.webp)

## 代码实现`Hello QT5`文本

上面介绍`.ui`文件时, 介绍了 可以直接在设计页面拖动添加控件 在窗口中实现文本的显示

除此之外, 当然还可以直接通过代码来 **创建控件、编辑控件、显示控件...**

---

已经了解到, 在`QT Creator`根据`.ui`文件自动生成的`ui_widget.h`中, 会生成控件以及相关设置代码

如果要代码创建控件, 也需要写在`ui_widget.h`中吗?

答案是, 最好不要.

即使, 在`ui_widget.h`的`Ui_widget::setup()`函数中可以手动创建控件, 也最好不要

因为, `QT Creator`每次重新编译`.ui`文件, 都会重新生成`ui_widget.h`, 也就意味着你在里边的改动都会丢失

所以, 最好不要在`ui_widget.h`中手动编写代码

---

可以在`widget.cc`中, 创建控件对象:

![](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/202408261107252.webp)

可以尝试创建一个`QLabel`对象, 在窗口中显示`Hello QT5`:

![](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/202408261350318.webp)

可以看到, 控件是可以直接通过代码进行创建并展示的

不过, 使用代码控件的位置默认是在窗口的`0,0`位置的

---

从代码中看, 使用`new`在堆上创建了`QLabel`对象`hq`, 但是并没有使用`delete`进行释放, **这是不是有可能发生内存泄漏?**

不使用`new`, 直接在栈上创建不行吗?

从语法上来说, 直接在栈上创建是可以的, 但是想让其正常的显示在窗口中, 就要关注 **对象的生命周期**

# 简单认识对象树

`QT`中引入了 **"对象树"** 的概念, 对各类控件对象进行管理

上面无论是根据`.ui`文件生成代码创建控件, 还是直接通过代码来创建控件对象, 都可以看到在实例化控件对象时, 传入了一个`Widget`对象指针作为构造参数

上面解释说, 是为了给控件对象指定一个父节点

因为`QT`管理控件 是采用了一种树结构, 才需要对控件对象指定一个父节点的

并且, `QT5`中几乎所有的控件, 在实例化对象时都可以传入一个指针参数 为其指定一个父节点, 而可作为控件对象构造参数的类型, 通常是这两种:

```cpp
QWidget*;
QObject*;
```

被指定了父节点的对象, 就可以看作此对象被挂在了一棵树上

当然也可以不为对象指定父节点, 这样此控件默认为顶级窗口控件, 就像在`main()`函数中自动生成的`Widget w`

通过在实例化对象时指定父节点, 实例化对象多了就会渐渐形成一棵树

`QT`这样设计并不仅仅是觉得这样好玩, 而是为了 **方便管理对象**

**通过为控件指定父节点, 可以实现即使`new`也不用手动`delete`**, 因为, `QT`会自动对挂在树上的控件进行管理

举一个简单的例子, 思考一个简单的问题, **一个窗口, 上面所展示的控件一般来说应该在什么时候被销毁?**

这个答案只有一个, 当整个窗口需要被销毁的时候. 除非某个控件需要在一定条件下单独销毁

这就意味着, 窗口上控件的生命周期应该与窗口保持一致, 不然可能会出现控件不显示的情况, **`QT`中当一个控件对象已经被销毁了, 就无法在窗口中展示**

基于这样的情况, **`QT`采用树的形式对控件进行管理, 当这棵树的根节点需要被销毁了, 才代表着整棵树上的所有对象都需要被销毁, `QT`会自动的将树上的所有节点销毁掉**

这样, `new`出来的控件对象, 也就不需要用户手动`delete`

不过, `new`出来的对象, 想要不手动`delete`, 必须要将其挂在树上(指定被管理的父节点), 否则就会发生内存泄漏

---

这也是为什么, `QT`中一般使用`new`实例化控件对象, 因为可以实现根据父节点的生命周期来管理控件的生命周期

而在栈上实例化对象, 如果不在关注对象的生命周期, 用户是看不到控件的:

![](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/202408261458164.webp)

原因就是, **在栈上实例化的控件对象, 当对象出了其所在作用域就直接被销毁了**, 被销毁的对象很明显是不可能被展示出来的

所以, **除顶级窗口部件之外, 一般来说建议使用`new`来创建控件对象, 并且最好为其指定父节点方便管理**

**`QT`的对象树, 是一种N叉树, 没有限制节点的度**

## 测试对象树的存在

了解了对象树, 可以测试一下对象树是否真的存在

我们可以在项目中创建一个新的继承于`QLabel`的类, 然后编写一下派生类的析构函数, 让其在析构的时候打印数据:

![](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/202408261626286.webp)

然后编写`mylabel.h` `mylabel.cc` 以及 `widget.cc`:

`mylabel.h`:

```cpp
#pragma once

#include <QLabel>

class MyLabel : public QLabel {
public:
	MyLabel(QWidget* parent = nullptr);
	~MyLabel();

private:
	static int count;
};
```

`mylabel.cc`:

```cpp
#include "mylabel.h"

#include <iostream>

int MyLabel::count = 0;

MyLabel::MyLabel(QWidget* parent)
	: QLabel(parent) {
}

MyLabel::~MyLabel() {
	count++;
	std::cout << MyLabel::count << "  MyLabel delete" << std::endl;
}
```

`widget.cc`:

```cpp
#include "widget.h"
#include "ui_widget.h"
#include "mylabel.h"

#include <QLabel>

Widget::Widget(QWidget* parent)
	: QWidget(parent)
	, ui(new Ui::Widget) {
	ui->setupUi(this);

	// 在堆上创建MyLabel对象, 并指定this为父节点
	MyLabel* hq1 = new MyLabel(this);
	MyLabel* hq2 = new MyLabel(this);
    // 不指定this为父节点
	MyLabel* hq3 = new MyLabel;

	// 创建一个QFont 字体对象
	QFont font;
	font.setFamily(QString::fromUtf8("HarmonyOS Sans SC Medium"));
	font.setPointSize(14);
        
	// 设置MyLabel的字体
	hq1->setFont(font);
	hq2->setFont(font);
	hq3->setFont(font);
	// 设置MyLabel的文本
	hq1->setText("Hello QT5");
	hq2->setText("Hello QT5");
	hq3->setText("Hello QT5");
}

Widget::~Widget() {
	delete ui;
}

```

然后程序运行:

![](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/202408261721609.webp)

> 可以看到字体很厚, 像是加粗了, 因为创建了三个`MyLabel`都显示在了同一个位置, 重叠了

然后将窗口关闭:

![](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/202408261721083.webp)

从结果上来看, `hq1`和`hq2`指定了父节点, 即创建项目时自动生成的`Widget w`, 所以`hq1`和`hq2`挂在一个被管理的对象树上

所以, 在窗口关闭时, 会自动调用析构函数释放`hq1`和`hq2`对象

而, `hq3`没有指定父节点, 也就意味着`hq3`没有被管理, 所以当窗口关闭时没有自动调用析构函数进行释放. 此时, 如果程序并没有退出, 就发生了内存泄漏

从现象中, 可以测试出`QT`对象树的存在

## 关于`QT`中`std::cout`中文乱码*

在Windows平台下, 当你在`QT`中尝试用`std::cout`或`printf()`打印中文, 你会发现他打印的是乱码:

![](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/202408270859215.webp)

原因是 **代码文件的编码格式 与 控制台的编码格式不同**

一般来说, 使用`QT Creator`创建的文件默认应该是`UTF-8`编码格式的:

![](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/202408270911364.webp)

而控制台中一般会与平台的编码格式保持一致, 如果使用的是中文的`Windows`, 那么默认的编码格式应该会是`GBK`, 至少不会是`UTF-8`

所以, 由于代码文件内容的编码与控制台的编码不同, 所以中文显示就会发生错误

所以, 要正确的打印中文, 就需要让打印的内容的编码格式在不同位置保持一致

如何实现呢?

1. 可以直接修改代码文件的编码格式, 不过这样太麻烦
2. `QT`实现了`QString`容器, 可以实现编码的转换
3. `QT`实现了专用打印日志的工具`qDebug`, 会自动管理字符串的编码

![](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/202408270948177.webp)

`QString::toLocal8Bit()`可以将`QString`编码格式转换为本地编码格式, 不过还是不建议用`std::cout`, 因为有`qDebug`

`qDebug`需要包含头文件`<QDebug>`, 会自动打印换行

> `qDebug`有一个非常好用的优点:
>
> 可以通过设置编译宏条件, 一键关闭所有的`qDebug`的打印信息
