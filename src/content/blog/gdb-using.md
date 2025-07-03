---
draft: true
title: "[Linux] GDB使用记录"
pubDate: "2024-7-1"
description: ""
# image:
categories:
    - Blogs
tags: 
    - Linux使用问题
    - GDB
    - C++
---

---

# GDB的基本使用

使用`gcc`或`g++`编译时, 加`-g`选项 生成有调试信息的可执行程序

此类型程序可以使用`gdb`调试

`gdb`常用命令:

`l`, `list` 用于查看代码及对应行号, `l 行号`可以查看指定行号上下`5行`的的代码

`b`, `break` 用于给程序打断点, `b 行号`可以给指定代码行打上断点, 并会按照断点生成的先后顺序给断点编号

`d`, `delete` 用于删除断点, `d 断点编号`可以给删除指定的断点

`s`, `step` 逐步骤执行, 可跳入函数体内

`n`, `next` 逐过程执行, 直接完成函数执行