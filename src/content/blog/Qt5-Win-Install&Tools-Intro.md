---
draft: true
title: "[QT5] 掌握QT, 从安装QT Creator开始"
pubDate: "2024-8-15"
description: "简单介绍一下什么是QT, 怎么安装QT Creator, 怎么使用QT Creator创建项目..."
image: https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/202408280930338.webp
categories: ['tech']
tags: ["QT", "Windows", "GUI"]
---

# 什么是QT

QT是一个跨平台的C++图形用户界面应用程序开发框架

在初期学习C/C++时, 大部分程序运行起来只会在终端或者控制台中输出程序运行的结果

而QT可以开发具有图形化界面的程序, 像`WPS Office`就是使用QT开发的

简单来说, **QT就是一种C++开发框架, 是用来开发拥有图形界面的程序的**

它使用的是C++语法, 但有些内容又与C++标准库不同

所以也有一定的学习成本

下面, 就介绍一下`QT Creator` 在`Windows`下的安装流程吧

# `QT Creator`

`QT Creator`是用来开发`QT`程序的集成开发环境

当然, 既然`QT`是一种开发框架, 就表示`QT Creator`并不是必须的. 也就是说, 开发`QT`并不是只能用`QT Creator`

也可以使用比如`Visual Studio`或`CLion`等其他集成开发环境, 不过使用这些软件进行`QT`开发的话, 还需要进行一些额外的配置

`QT Creator`最适合用来接触`QT`, 因为不需要安装`QT Creator`不需要进行额外的配置, 基本上可以说是"开箱即用"

本篇文章, 介绍`QT5`相关`QT Creator`的安装

不涉及`Visual Studio`以及`Clion`

## `QT Creator 5.14.2` 下载

首先进入, `QT Creator`离线安装包的下载页面:

https://download.qt.io/archive/qt/

![](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/202408191352879.webp)

然后, 点击进入`5.14`目录下:

![](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/202408191353804.webp)

选择`5.14.2`, 点击`qt-opensource-windows-x86-5.14.2.exe`下载对应平台安装程序

![](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/202408191354382.webp)

等待下载完成, 就可以进行安装了

下载速度可能会很慢, 等一等就好

> 为什么不选择`5.15`?
>
> 因为`QT Creator`从`5.15`版本开始, 不再提供编译完成的二进制可执行程序
>
> 所以, 如果选择`5.15`就没有打包好的可执行程序, 进行安装
>
> ![|wide](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/202408191403636.webp)

## `QT Creator 5.14.2` 安装

> 下面的安装演示过程中, 没有登录QT相关账号的界面
>
> 因为博主电脑中已经登录并安装`QT5.14.2`, 所以没有显示
>
> 遇到那个页面注册登录就好, 没有其他可注意的

下载完成后, 双击打开, 会出现此页面:

![|inline](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/202408191444712.webp)

点击`Next`:

![|inline](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/202408191444605.webp)

点击`下一步`:

![|inline](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/202408191444257.webp)

然后按照下面的选项进行勾选:

![](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/202408191444464.webp)

`下一步`:

![](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/202408191445125.webp)

`下一步`:

![image-20240819144519277](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/202408191445443.webp)

`下一步`:

![](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/202408191445603.webp)

`安装`, 就可以了

整个过程中, 只有`第4步`需要注意一下, 如果你的系统还是`32位`的, 那么就不选`64bit`, 选`32bit`

安装完成之后, 打开就可以看到`QT Creator`的界面了:

![](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/202408191449614.webp)

# `QT Creator` 创建项目

打开`QT Creator`之后, 就可以在工具栏->文件->新建项目了:

![](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/202408191455687.webp)

点击新建项目之后, 会出现一个选择模板的弹窗:

![](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/202408191456516.webp)

可以发现, 有许多的模板:

`QT Widgets Application` 和 `QT Console Application`

甚至还有`QT for Python - Empty` 和 `QT for Python - Window`

以及下面一系列的`QT Quick Application`

要用C++开发QT桌面应用就选第一个就可以, 然后就是一系列的项目配置:

![|wide](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/202408191509314.webp)

1. 项目路径

    除了 **项目路径不要存在中文** 之外, 没什么其他值得注意的

2. 构建工具

    如果你在Linux平台下, 构建过`C/C++`项目, 那么你大概率使用过`make`或`cmake`

    像这样的构建工具, 如果将`makefile`写好了, 可以节省大量的项目编译、构建成本

    `QT Creator`中默认的`qmake` 与 `make`和`cmake`相似, 只不过是专门用来编译、构建`QT`项目的

    就选择默认的`qmake`就可以

3. 基类选择

    `QT Creator`创建项目时, 提供了三种基类选择:

    1. `QWidget`

        是`QT`中最基本的窗口类, 默认情况下只提供了基本的窗口功能

        使用此类作为基类, 如果不做其他任何的修改, 编译运行 生成的窗口就是这样的:

        ![|wide](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/202408191539035.webp)

        什么都没有

        使用此类基本从零开始绘制窗口, 所以更加灵活

    2. `QMainWindow`

        此类, 是`QWidget`的派生类

        它在`QWidget`的基础上, 默认提供了菜单栏、工具栏、状态栏和中央窗口

        使用此类作为基类, 如果不做其他任何的修改, 编译运行生成的窗口是这样的:

        ![|wide](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/202408191549442.webp)

        好像与`QWidget`没有什么区别?

        其实是有的, 去到`Design`界面进行`UI`设计时:

        ![|wide](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/202408191557345.webp)

        可以清楚的对比出来, `QMainWindow`作为基类的项目, 实际上默认多了:

        菜单栏、状态栏, 并且可以直接右键添加工具栏

        这是`QWidget`默认情况下不具备的

        只不过, 因为没有设置菜单栏和状态栏的内容, 所以创建的窗口中没有显示罢了

    3. `QDialog`

        以此类位基类创建出的窗口, 是一个对话框形式的窗口

        默认情况下, 与`QWidget`一样 只有一个空的窗口

        不过, `QDialog`默认存在几个特性:

        1. 模态、非模态

            模态对话框, 此时会阻止用户与其他窗口交互

            非模态对话框, 此时允许用户与其他窗口交互

        2. 返回值

            可以存在一个返回值, 用于表示用户在此对话框中的操作结果

        3. 默认按钮

            可以设置两个默认按钮, 确认和取消

        4. 顶层窗口

            此对话框通常设置为程序最顶层的窗口

    一般来说, 创建项目时选择`QWidget`就可以

    ---

    选择好基类之后, **需要给默认生成的类取一个类名**, 且此默认生成的类, 就是所选择的基类的派生类

    > 类名最好与文件名相同, 对应的文件有:
    >
    > `Header file`和`Source file`

    ---

    还有一个`Form file`文件, 是`UI`文件, 之后再介绍

4. 国际化相关

    实际就是选择程序需要翻译成什么语言, 需要开发者进行配置和翻译

5. 编译工具选择

    选择需要使用的编译器

    在安装`QT Creator`时, 就已经选择了`MinGW xxx 64bit`

    实际就是`GCC/G++`的`Windows`移植版, 如果之前安装了`MSVC`且已经配置好了, 且会使用, 也可以进行选择

6. 项目版本管理

    是否添加`Git`等工具

选择并创建之后, 项目会自动打开:

![](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/202408191618773.webp)

> 博主换了主题和字体

一个最简单的`QWidget`项目, `QT Creator`将其结构分为了:

```shell
Test
  ├── Test.pro    
  ├── Headers
  │   └── mywidget.h
  ├── Sources
  │   ├── main.cc
  │   └── mywidget.cc
  └── Forms
      └── mywidget.ui
```

不过, 这只是在`QT Creator`中的显示结构, 实际在文件系统中, 并没有对文件进行分类:

![](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/202408191626007.webp)

---

本篇文章结束

感谢阅读~
