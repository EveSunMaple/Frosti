---
draft: true
title: "[QT5] 常用控件-按钮控件: PushButton、RadoiButton、CheckButton..."
pubDate: "2024-12-17"
description: "QT是一种GUI开发框架, 它内置有许多各种各样的控件, 接下来就对常用控件做一些介绍"
image: https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/202412241545562.webp
categories: ['tech']
tags: ["QT", "控件"]
---

前面一篇文章简单介绍了`QWidget`类中, 一些控件的公共属性

本篇文章的针对**按钮**相关控件展开介绍

# 按钮类控件

`QT`中拥有四种按钮类控件: `QPushButton` `QCheckBox` `QRadioButton` `QToolButton(不在本篇文章介绍)`

这四个控件均继承于`QAbstractButton`类:

![](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/202412231556020.webp)

此类是一个抽象类, 所以无法实例化出对象

它继承于`QWidget`, 提供了一些按钮可能需要的公共的属性: 点击信号、按压信号、图标、文本...

所以, 继承于它的四种按钮控件, 都默认具有这些属性

## `QAbstractButton`

`QAbstractButton`的属性, 并不是四个按钮控件都会用到, 不同的按钮会使用到不同的`QAbstractButton`属性

`QPushButton`已经使用过很多次, 就先以`QPushButton`为例子

使用一下, 适用于`QPushButton`按钮属性

## `QPushButton`

`QAbstractButton`中的属性, 适用于`QPushButton`的常用属性有: `icon` `autoRepeat` `shortCut`

### `icon`

通过`icon`属性, 可以**设置按钮的图标样式**

不是按钮样式, 而是按钮图标的样式

> 如果需要使用到图标, 可以在[iconfont-阿里巴巴矢量图标库](https://www.iconfont.cn/)查找并使用

先将需要使用的图标使用`qrc`机制管理起来, 然后在进行使用:

![](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/202412231621557.webp)

然后通过`QT Designer`创建5个`QPushButton`:

![|huger](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/202412231633287.webp)

`QAbstractButton`图标相关的接口:

| 接口                               | 功能                   |
| ---------------------------------- | ---------------------- |
| `void setIcon(const QIcon &icon);` | **设置按钮图标**       |
| `QIcon icon() const;`              | **获取按钮当前的图标** |
| `QSize iconSize() const;`          | **设置按钮图标的大小** |

创建完成之后, 通过代码为下面的四个`PushButton`添加`icon`:

```cpp
#include "widget.h"
#include "ui_widget.h"

#include <QIcon>

Widget::Widget(QWidget* parent)
    : QWidget(parent)
    , ui(new Ui::Widget) {
    ui->setupUi(this);

    // 为按钮设置图标 
    ui->pushBtn_up->setIcon(QIcon(":/up.png"));
    ui->pushBtn_up->setIconSize(QSize(88, 88));

    ui->pushBtn_down->setIcon(QIcon(":/down.png"));
    ui->pushBtn_down->setIconSize(QSize(88, 88));
        
    ui->pushBtn_left->setIcon(QIcon(":/left.png"));
    ui->pushBtn_right->setIcon(QIcon(":/right.png"));
}

Widget::~Widget() {
    delete ui;
}

void Widget::on_pushBtn_up_clicked() {
    QRect nowGeo = ui->pushBtn_ICON->geometry();
    if (nowGeo.y() < 5)
        return;

    ui->pushBtn_ICON->setGeometry(nowGeo.x(), nowGeo.y() - 5, nowGeo.width(), nowGeo.height());
}

void Widget::on_pushBtn_down_clicked() {
    QRect nowGeo = ui->pushBtn_ICON->geometry();
    if (nowGeo.y() > ui->pushBtn_up->geometry().y() - nowGeo.height() - 1)
        return;

    ui->pushBtn_ICON->setGeometry(nowGeo.x(), nowGeo.y() + 5, nowGeo.width(), nowGeo.height());
}

void Widget::on_pushBtn_left_clicked() {
    QRect nowGeo = ui->pushBtn_ICON->geometry();
    if (nowGeo.x() < 5)
        return;

    ui->pushBtn_ICON->setGeometry(nowGeo.x() - 5, nowGeo.y(), nowGeo.width(), nowGeo.height());
}

void Widget::on_pushBtn_right_clicked() {
    QRect nowGeo = ui->pushBtn_ICON->geometry();
    if (nowGeo.x() > this->geometry().width() - nowGeo.width() - 1)
        return;
    ui->pushBtn_ICON->setGeometry(nowGeo.x() + 5, nowGeo.y(), nowGeo.width(), nowGeo.height());
}

```

执行结果为:

![](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/202412231931754.gif)

### `autoRepeat`

从字面上看, `autoRepeat`是自动重复的意思

在按钮上, `autoRepeat`属性表示**点击事件的自动重复**

什么意思呢?

默认情况下, 在按钮上长按鼠标左键, 鼠标会触发`pressed`信号, 而不是`clicked`

`clicked`是按下和抬起两个动作, 长按鼠标左键只是一个按下动作

长按鼠标左键的结果为:

![|huger](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/202412231954153.gif)

`autoRepeat`属性, 是设置鼠标长按时, **是否重复产生点击信号**, 而不是仅有按下

相关的接口有:

| 接口                               | 功能                                                        |
| ---------------------------------- | ----------------------------------------------------------- |
| `void setAutoRepeat(bool);`        | **设置按钮的`autoRepeat`属性**                              |
| `bool autoRepeat() const;`         | **获取按钮当前的`autoRepeat`属性**                          |
| `void setAutoRepeatDelay(int);`    | **设置按钮`autoRepeat`触发延迟, 即 按下多久触发**           |
| `int autoRepeatDelay() const;`     | **获取按钮当前的`autoRepeat`触发延迟**                      |
| `void setAutoRepeatInterval(int);` | **设置按钮`autoRepeat`触发周期, 即 重复发送点击信号的间隔** |
| `int autoRepeatInterval() const;`  | **获取按钮当前`autoRepeat`触发周期**                        |

将`up`和`down`设置为`autoRepeat(true)`:

```cpp
Widget::Widget(QWidget* parent)
    : QWidget(parent)
    , ui(new Ui::Widget) {
    ui->setupUi(this);

    ui->pushBtn_up->setIcon(QIcon(":/up.png"));
    ui->pushBtn_up->setIconSize(QSize(32, 32));
    ui->pushBtn_up->setAutoRepeat(true);

    ui->pushBtn_down->setIcon(QIcon(":/down.png"));
    ui->pushBtn_down->setIconSize(QSize(32, 32));
    ui->pushBtn_down->setAutoRepeat(true);

    ui->pushBtn_left->setIcon(QIcon(":/left.png"));
    ui->pushBtn_left->setIconSize(QSize(32, 32));

    ui->pushBtn_right->setIcon(QIcon(":/right.png"));
    ui->pushBtn_right->setIconSize(QSize(32, 32));
}
```

![|huger](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/202412231958387.gif)

### `shortCut`

`shortCut`是快捷键属性, 这个属性一定不会陌生

快捷键有关的接口为:

| 接口                                         | 功能                         |
| -------------------------------------------- | ---------------------------- |
| `void setShortcut(const QKeySequence &key);` | **设置按钮按压的快捷键**     |
| `QKeySequence shortcut() const;`             | **获取按钮当前按压的快捷键** |

可以以上面为例子, 设置上下左右的快捷键为`w` `s` `a` `d`:

```cpp
Widget::Widget(QWidget* parent)
    : QWidget(parent)
    , ui(new Ui::Widget) {
    ui->setupUi(this);

    ui->pushBtn_up->setIcon(QIcon(":/up.png"));
    ui->pushBtn_up->setIconSize(QSize(32, 32));
    ui->pushBtn_up->setShortcut(QKeySequence("w"));

    ui->pushBtn_down->setIcon(QIcon(":/down.png"));
    ui->pushBtn_down->setIconSize(QSize(32, 32));
    ui->pushBtn_down->setShortcut(QKeySequence("s"));

    ui->pushBtn_left->setIcon(QIcon(":/left.png"));
    ui->pushBtn_left->setIconSize(QSize(32, 32));
    ui->pushBtn_left->setShortcut(QKeySequence("a"));

    ui->pushBtn_right->setIcon(QIcon(":/right.png"));
    ui->pushBtn_right->setIconSize(QSize(32, 32));
    ui->pushBtn_right->setShortcut(QKeySequence("d"));
}
```

运行结果为:

![|huger](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/202412231946693.gif)

通过设置的`w` `a` `s` `d`就能点击按钮

并且从运行结果来看, `shortCut`快捷键的`autoRepeat`是默认`true`的

按下快捷键时, 默认重复产生`clicked`信号

---

上面通过`QKeySequence("w")`等, 设置字母区按键

自己手动输入, 终究容易出错

`QT`内置有按键名的枚举, 可以直接在实例化`QKeySequence`对象时使用

![|big](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/202412232011689.webp)

所以, 快捷键的设置可以改为:

```cpp
Widget::Widget(QWidget* parent)
    : QWidget(parent)
    , ui(new Ui::Widget) {
    ui->setupUi(this);

    ui->pushBtn_up->setIcon(QIcon(":/up.png"));
    ui->pushBtn_up->setIconSize(QSize(32, 32));
    ui->pushBtn_up->setShortcut(QKeySequence(Qt::Key_W));

    ui->pushBtn_down->setIcon(QIcon(":/down.png"));
    ui->pushBtn_down->setIconSize(QSize(32, 32));
    ui->pushBtn_down->setShortcut(QKeySequence(Qt::Key_S));

    ui->pushBtn_left->setIcon(QIcon(":/left.png"));
    ui->pushBtn_left->setIconSize(QSize(32, 32));
    ui->pushBtn_left->setShortcut(QKeySequence(Qt::Key_A));

    ui->pushBtn_right->setIcon(QIcon(":/right.png"));
    ui->pushBtn_right->setIconSize(QSize(32, 32));
    ui->pushBtn_right->setShortcut(QKeySequence(Qt::Key_D));
}
```

运行结果:

![|huger](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/202412240859323.gif)

> `QT`提供的按键枚举, 不仅有这些, 基本上包括了所有的按键
>
> 不过都在同一个文件中, 可以查看一下

`QT`提供的按键枚举常量, 可以在**使用时相加**, 实现组合键的效果, 比如:

```cpp
ui->pushBtn_up->setShortcut(QKeySequence(Qt::CTRL + Qt::Key_W));
ui->pushBtn_down->setShortcut(QKeySequence(Qt::CTRL + Qt::Key_S));
ui->pushBtn_left->setShortcut(QKeySequence(Qt::ALT + Qt::Key_A));
ui->pushBtn_right->setShortcut(QKeySequence(Qt::SHFIT + Qt::Key_D));
```

运行结果为:

![|huger](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/202412240903075.gif)

---

`QAbstractButton`的属性, 是各种按钮都拥有的

### `default`和`autoDefault`

`QPushButton`除了上面继承于`QAbstractButton`的属性之外

常用的属性还有两个: `autoDefault`和`default`

按照文档介绍:

`autoDefault`设置按钮是否为自动默认按钮, `default`设置按钮是否为默认按钮

这两个属性, 决定在当前对话框中按下`Enter`键时会发生什么

如果当前对话框存在`default`按钮, 当用户按下`Enter`键时, `default`按钮会被自动按下

但是, 如果当前对话框中存在`autoDefault`按钮, 且按钮具有焦点, 按下`Enter`会自动按下`autoDefault`焦点, 而不会按下`default`按钮

如果, 没有`default`或`autoDefault`按钮具有焦点, 按下`Enter`则会按下焦点链中的下一个`autoDefault`按钮

这两个属性默认为`false`

**一个对话框中, `default`按钮只能存在一个, `autoDefault`按钮可以存在多个**

---

实际上`default`按钮的触发, 与窗口的焦点策略有关

在`QWidget`窗口中, 默认情况下

`default`和`autoDefault`按钮在没有焦点时, 即使按下`Enter`按键, 按钮也不会被自动按下

---

`QPushButton`相关的接口有:

| 接口                         | 功能                                  |
| ---------------------------- | ------------------------------------- |
| `bool autoDefault() const;`  | **获取按钮当前`autoDefault`属性状态** |
| `void setAutoDefault(bool);` | **设置按钮的`autoDefault`属性状态**   |
| `bool isDefault() const;`    | **获取按钮当前`default`属性状态**     |
| `void setDefault(bool);`     | **设置按钮的`default`属性状态**       |

## `QRadioButton`

`QRadioButton`是单选按钮, 允许在多个单选中选择一个

`QAbstractButton`中的属性, 适用于`QRadioButton`的常用属性有: `checkable` `checked` `autoExclusive`

### `checkable`和`checked`

单选按钮, 肯定具有一个被选中的状态

`checkable`和`checked`则是与选中有关的属性

**`checkable`属性, 表示按钮的可选中状态**

**`checked`属性, 表示按钮是否被选中**

直接创建几个`QRadioButton`:

```cpp
#include "widget.h"
#include "ui_widget.h"

Widget::Widget(QWidget* parent)
    : QWidget(parent)
    , ui(new Ui::Widget) {
    ui->setupUi(this);

    ui->label->setText("请选择你的性别:");
    ui->radioButton_male->setText("男");
    ui->radioButton_female->setText("女");
    ui->radioButton_unknow->setText("未知");
}

Widget::~Widget() {
    delete ui;
}
```

运行结果为:

![|huger](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/202412241120758.gif)

从结果来看, 默认情况下, 不做任何属性设置

`RadioButton`按钮被点击, 就会被选中

当然, 也可以通过`checkable`和`checked`属性来设置, `RadioButton`的选中状态

`QRadioButton`相关的接口有:

| 接口                        | 功能                                           |
| --------------------------- | ---------------------------------------------- |
| `void setCheckable(bool);`  | **设置单选按钮的可被选中状态**                 |
| `bool isCheckable() const;` | **获取单选按钮当前的可被选中状态**             |
| `bool isChecked() const;`   | **获取单选按钮当前的选中状态**                 |
| `void setChecked(bool);`    | **设置单选按钮的选中状态, 此函数是一个槽函数** |

```cpp
Widget::Widget(QWidget* parent)
    : QWidget(parent)
    , ui(new Ui::Widget) {
    ui->setupUi(this);

    ui->radioButton_male->setText("男");
    ui->radioButton_female->setText("女");
    ui->radioButton_unknow->setText("未知");
    ui->label->setText("请选择你的性别:");

    ui->radioButton_unknow->setCheckable(false);
}
```

这段代码可以让**未知**选项设置为, 不可选中状态:

![|huger](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/202412241128425.gif)

`checkable`属性可以设置按钮为不可选中或可选中

而`checked`则用于设置, 单选按钮的选中状态:

```cpp
Widget::Widget(QWidget* parent)
    : QWidget(parent)
    , ui(new Ui::Widget) {
    ui->setupUi(this);

    ui->radioButton_male->setText("男");
    ui->radioButton_female->setText("女");
    ui->radioButton_unknow->setText("未知");
    ui->label->setText("请选择你的性别:");

    ui->radioButton_unknow->setCheckable(false);
    ui->radioButton_male->setChecked(true);
}
```

设置**男**为选中状态:

![|huger](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/202412241155972.gif)

可以看到的, 此时窗口打开选项**男**即为选中

### `autoExclusive`

`autoExclusive`属性, 表示**是否排他**

`QRadioButton`默认是单选, 即一组`QRadioButton`中, 默认只能同时选中一个

因为, `QRadioButton`按钮都是默认排他的, 即 `autoExclusive`为`true`

如果将其设置为`false`, 就能实现不排他:

```cpp
Widget::Widget(QWidget* parent)
    : QWidget(parent)
    , ui(new Ui::Widget) {
    ui->setupUi(this);

    ui->radioButton_male->setText("男");
    ui->radioButton_female->setText("女");
    ui->radioButton_unknow->setText("未知");
    ui->label->setText("请选择你的性别:");

    ui->radioButton_unknow->setAutoExclusive(false);
    ui->radioButton_male->setChecked(true);
}
```

执行结果为:

![|huger](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/202412241349825.gif)

从结果来看, 未知和其他两个选项可以同时存在

并且, 从现象来看, **`autoExclusive`属性其实更像是对控件自身的影响**

`autoExclusive`为`false`时, 实际表示控件自身 不受其他控件排他性的影响, 且不影响其他控件

`autoExclusive`为`true`时, 实际表示控件自身 会受到其他控件排他性的影响, 且会影响其他控件

### `clicked()`信号 **

在简单使用`QPushButton`时, 就已经使用过`clicked()`信号

但是, `clicked()`信号其实有两个, 带参和不带参: `clicked()`和`clicked(bool)`

`QPushButton`中, 最常用的就是`clicked()`信号, 通常情况下不需要使用带参的版本

而`QRadioButton`不同, `QRadioButton`是单选按钮, 是拥有被选中状态的

而此时, `clicked(bool)`信号, 就能出场了

**`clicked(bool)`这里的参数, 实际就表示按钮的选中状态**

对应的槽函数接收到的参数, 就是触发`clicked(bool)`时, 按钮的选中状态

下面这个例子, 可以很好的展示出`clicked(bool)`的用法:

```cpp
#include "widget.h"
#include "ui_widget.h"

#include <QDebug>

Widget::Widget(QWidget* parent)
    : QWidget(parent)
    , ui(new Ui::Widget) {
    ui->setupUi(this);

    ui->radioButton_male->setText("男");
    ui->radioButton_female->setText("女");
    ui->radioButton_unknow->setText("未知");
    ui->label->setText("请选择你的性别:");

    ui->radioButton_unknow->setAutoExclusive(false);
    ui->radioButton_male->setChecked(true);
}

Widget::~Widget() {
    delete ui;
}

void Widget::on_radioButton_male_clicked(bool checked) {
    qDebug() << "radioButton_male checked: " << checked;
}

void Widget::on_radioButton_male_clicked() {
    qDebug() << "radioButton_male clicked";
}

void Widget::on_radioButton_unknow_clicked(bool checked) {
    qDebug() << "radioButton_unknow checked: " << checked;
}
```

运行结果为:



可以看到, **带参的`clicked`信号的槽, 能够接收到`QRadioButton`的选中状态**

同时, **`QRadioButton`被点击时, 会发送`clicked()`和`clicked(bool)`两种信号**

### `pressed()`和`released()`信号

`pressed()`信号, 是按钮被按下时会发送的信号, 仅按下这个动作

而`released()`信号, 是按钮被按下后, 抬起时会发送的信号, 仅抬起这个动作

```cpp
#include "widget.h"
#include "ui_widget.h"

#include <QDebug>

Widget::Widget(QWidget* parent)
    : QWidget(parent)
    , ui(new Ui::Widget) {
    ui->setupUi(this);

    ui->radioButton_male->setText("男");
    ui->radioButton_female->setText("女");
    ui->radioButton_unknow->setText("未知");
    ui->label->setText("请选择你的性别:");

    ui->radioButton_unknow->setAutoExclusive(false);
    ui->radioButton_male->setChecked(true);
}

Widget::~Widget() {
    delete ui;
}

void Widget::on_radioButton_male_pressed() {
    qDebug() << "radioButton_male pressed";
}

void Widget::on_radioButton_male_released() {
    qDebug() << "radioButton_male released";
}
```

这段代码的执行结果为:

![](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/202412241417836.gif)

可以看到, 按钮被按下, 会发送`pressed()`信号, 抬起时, 会发送`released()`信号

### `toggled(bool)`信号

`toggled(bool)`信号, 是**按钮的选中状态改变时会发送的信号**, 且**携带的参数, 表示改变后的新状态**

以下面代码为例, 为**女**和**未知**选项, 添加`toggled(bool)`信号的槽函数:

```cpp
#include "widget.h"
#include "ui_widget.h"

#include <QDebug>

Widget::Widget(QWidget* parent)
    : QWidget(parent)
    , ui(new Ui::Widget) {
    ui->setupUi(this);

    ui->radioButton_male->setText("男");
    ui->radioButton_female->setText("女");
    ui->radioButton_unknow->setText("未知");
    ui->label->setText("请选择你的性别:");

    ui->radioButton_unknow->setAutoExclusive(false);
    ui->radioButton_male->setChecked(true);
}

Widget::~Widget() {
    delete ui;
}

void Widget::on_radioButton_unknow_toggled(bool checked) {
    qDebug() << "radioButton_unknow checked changed, new checked: " << checked;
}

void Widget::on_radioButton_female_toggled(bool checked) {
    qDebug() << "radioButton_female checked changed, new checked: " << checked;
}
```

这段代码的运行结果为:

![](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/202412241423268.gif)

### `QButtonGroup` **

在快餐店(比如肯德基)点套餐时, 经常会遇到一个场景:

需要在汉堡中几选一、饮料中几选一、小吃中几选一

即, 汉堡、饮料或小吃, 各自都有几种

汉堡只能选一个, 饮料只能选一个, 小吃也只能选一个, 但汉堡、饮料和小吃之间又互不影响

`QRadioButton`也是选择的按钮, 可以实现这样的场景吗?

答案是可以的, `QT`提供了一个类**`QButtonGroup`, 即 按钮组**

**`QButtonGroup`类, 可以将按钮组合成一个组, 组内的按钮的状态可能会互相影响, 但不会影响组外的按钮的状态**

即, 如果使用`QButtonGroup`分出汉堡组、饮料组和小吃组, 就能实现在一个按钮组中的选择, 不影响其他组

可以模拟一个简单的场景, 了解一下`QButtonGroup`类的使用

`QT Designer`:

![|huger](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/202412241445131.webp)

代码:

```cpp
#include "widget.h"
#include "ui_widget.h"

#include <QButtonGroup>

Widget::Widget(QWidget* parent)
    : QWidget(parent)
    , ui(new Ui::Widget) {
    ui->setupUi(this);

    QButtonGroup* staplesGroup = new QButtonGroup(this);
    QButtonGroup* snacksGroup = new QButtonGroup(this);
    QButtonGroup* sweetyGroup = new QButtonGroup(this);
    QButtonGroup* drinkGroup = new QButtonGroup(this);

    staplesGroup->addButton(ui->radioBtn_staples_spa, 1);
    staplesGroup->addButton(ui->radioBtn_staples_yes, 2);
    ui->radioBtn_staples_spa->setChecked(true);

    snacksGroup->addButton(ui->radioBtn_snacks_fries, 1);
    snacksGroup->addButton(ui->radioBtn_snacks_chickenRice, 2);
    ui->radioBtn_snacks_fries->setChecked(true);

    sweetyGroup->addButton(ui->radioBtn_sweety_redBeanPie, 1);
    sweetyGroup->addButton(ui->radioBtn_sweety_mashedPotato, 2);
    sweetyGroup->addButton(ui->radioBtn_sweety_sundae, 3);
    sweetyGroup->addButton(ui->radioBtn_sweety_sundaeStrawberry, 4);
    ui->radioBtn_sweety_redBeanPie->setChecked(true);

    drinkGroup->addButton(ui->radioBtn_drink_coke, 1);
    drinkGroup->addButton(ui->radioBtn_drink_juice, 1);
    drinkGroup->addButton(ui->radioBtn_drink_lemonTea, 1);
    ui->radioBtn_drink_coke->setChecked(true);
}

Widget::~Widget() {
    delete ui;
}
```

执行结果为:

![|huger](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/202412241500876.gif)

## `QCheckBox`

`QCheckBox`是复选框, 也就是多选

`QCheckBox`与`QRadioButton`的用法基本一致, 最常用的同样是继承于`QAbstractButton`的`checkable`和`checked`

![|huger](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/202412241548646.webp)

所以, 属性方面就不在过多介绍, 简单的用一下`QCheckBox`

`QT Designer`:

![|huger](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/202412241600952.webp)

`widget.cc`:

```cpp
#include "widget.h"
#include "ui_widget.h"

#include <QString>

Widget::Widget(QWidget* parent)
    : QWidget(parent)
    , ui(new Ui::Widget) {
    ui->setupUi(this);
}

Widget::~Widget() {
    delete ui;
}

void Widget::on_pushButton_clicked() {
    QString result = "小孩子才做选择, 而我选择:";

    if (ui->checkBox->isChecked()) {
        result += " " + ui->checkBox->text();
    }
    if (ui->checkBox_2->isChecked()) {
        result += " " + ui->checkBox_2->text();
    }
    if (ui->checkBox_3->isChecked()) {
        result += " " + ui->checkBox_3->text();
    }
    if (ui->checkBox_4->isChecked()) {
        result += " " + ui->checkBox_4->text();
    }

    ui->label->setText(result);
}
```

运行结果为:

![|huger](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/202412241605544.gif)
