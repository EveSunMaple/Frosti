---
draft: true
title: "[QT5] 常用控件: QLabel、"
pubDate: "2024-12-17"
description: "QT是一种GUI开发框架, 它内置有许多各种各样的控件, 接下来就对常用控件做一些介绍"
# image:
categories:
    - Blogs
tags:
    - QT
    - 控件
---

# `QLabel`

`QLabel`控件, 是`QT`中的标签控件, 可以用来显示文本和图像等

`QLabel`的属性有:

| 属性                | 功能                                                         |
| ------------------- | ------------------------------------------------------------ |
| `text`              | **`QLabel`中需要显示的文本**                                 |
| `textFormat`        | **`QLabel`中文本的格式: `PlainText(纯文本)` `RichText(富文本)` `MarkdownText`** |
| `pixmap`            | **`QLabel`中需要显示的图片**                                 |
| `scaledContents`    | **图片是否自动填充拉伸**                                     |
| `alignment`         | **`QLabel`中元素的对齐方式, 可以设置水平和垂直方向的对齐方式** |
| `wordWrap`          | **是否自动换行**                                             |
| `indent`            | **文本缩进属性**                                             |
| `margin`            | **文本与`QLabel`边框的距离**                                 |
| `openExternalLinks` | **是否允许打开外部链接, `QLabel`的内容包含`URL`是会涉及到**  |
| `buddy`             | **伙伴, 即 给`QLabel`绑定一个伙伴, 当点击此`QLabel`时, 伙伴就会被激活** |

## `text`和`textFormat`

这两个属性非常的简单

`QT`的相关接口有:

| 接口                                  | 功能                           |
| ------------------------------------- | ------------------------------ |
| `void setText(const QString &);`      | **设置`QLabel`显示的文本内容** |
| `QString text() const;`               | **获取`QLabel`当前显示的文本** |
| `void setTextFormat(Qt::TextFormat);` | **设置`QLabel`显示文本格式**   |
| `Qt::TextFormat textFormat() const;`  | **获取`QLabel`当前文本格式**   |

使用也非常简单:

```cpp
#include "widget.h"
#include "ui_widget.h"

#include <QDebug>

Widget::Widget(QWidget* parent)
    : QWidget(parent)
    , ui(new Ui::Widget) {
    ui->setupUi(this);

    ui->label->setText("这是一段纯文本");
    qDebug() << ui->label->text();
    ui->label->setTextFormat(Qt::PlainText);

    ui->label_2->setText("<strong>这是一段加粗富文本</strong>");
    qDebug() << ui->label_2->text();
    ui->label_2->setTextFormat(Qt::RichText);

    ui->label_3->setText("# 这是一个Markdown一级标题");
    qDebug() << ui->label_3->text();
    ui->label_3->setTextFormat(Qt::MarkdownText);
}

Widget::~Widget() {
    delete ui;
}
```

这段代码的运行结果为:

![](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/202412271657433.webp)

> `textFormat`可设置的值, 是`QT`提供的一个枚举常量:
>
> ```cpp
> enum TextFormat {
>     PlainText,  // 纯文本
>     RichText,	// 富文本
>     AutoText,	// 自动推导
>     MarkdownText	// Markdown文本
> };
> ```

## `pixmap`

`QLabel`除了可以显示文本之外, 还可以显示图片

相关的接口有:

| 接口 | 功能 |
| ---- | ---- |
|      |      |

