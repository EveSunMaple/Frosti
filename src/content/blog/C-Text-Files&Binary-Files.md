---
draft: true
title: "[C语言] 什么是文本文件和二进制文件？"
pubDate: "2022-03-27"
description: '文件按照功能分类, 可以分为 程序文件、数据文件 两类。
此外, 文件的分类还有其他的分类方法, 比如 按照文件数据的组织形式 来分为 二进制文件 和 文本文件。'
image: https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/202306251813684.webp
categories: ['tech']
tags: ["C语言", "文件"]
---

# 文本文件、二进制文件及其存储

上一篇介绍过, 文件按照功能分类, 可以分为 `程序文件`、`数据文件` 两类。

此外, 文件的分类还有其他的分类方法, 比如 按照文件数据的组织形式 来分为 `二进制文件` 和 `文本文件`。

---

## 文本文件和二进制文件

具体什么是文本文件, 什么是二进制文件呢？

关于文本文件, 一般我们自己创建并写入内容的文档, 或者 Markdown 文件等, 都是可以看懂内容的的, 这些都属于文本文件的。

比如: 

> 一个 `.txt` 文件: 
>
> ![|small](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/file-TEXT_FILE.webp)
>
> 或者 一个 `.md` 文件 :
> 
> ![|small](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/file-BINARY_FILE.webp)

而对于二进制文件, 一般人打开二进制文件是没有办法直接看懂的, 因为大部分内容都是乱码

除非用二进制的编辑器打开才会显示二进制的形式, 不过一般人还是无法看懂的

>类似这样: 
>
>![BINARY_READ1 |wide](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/file-BINARY_READ1.webp)
>
>这样: 
>
>![BINARY_READ2 |wide](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/file-BINARY_READ2.webp)
>
>或者这样: 
>
>![BINARY_READ3 |wide](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/file-BINARY_READ3.webp)
>
>类似于, 这些文件, 一般人（反正我是）真的看不懂。

这时候可能有人会说

> 那 文本文件不就是, 打开后 一般人能看懂的文件
>
> 二进制文件不就是, 打开后内容都是二进制或者乱码形式的一般人看不懂的文件吗

啊, 确实

但是身为新时代青年的我们, 不能这样简单的区分

我们要知道, 文本文件 和 二进制文件  在内存中都是如何存储的

虽然两种文本的内容在内存中都是以二进制的形式存储的, 但是存储的方式又有其他不同。

## 文本文件在内存中的存储

> 文本文件, 我们可以直接打开看懂, 主要是因为 文本文件存入内存的二进制数据是经过转换的。
>
> 在文本文件的内容 存入内存之前, 文本文件的所有内容 都会转换为 `ASCII 码` 的形式, 然后再 以 `ASCII 码` 的二进制数据存入内存中。
>
> 也就是, 对于文本文件的内容: 
>
> > 字符类型、数值类型的数据, 都会按位转换为 对应的 `ASCII码` , 然后将 `ASCII码`对应的二进制数据, 存储到内存中
>
> 然后当使用者打开文本文件的时候, 也是会经过转换再显示的。

## 二进制文件在内存中的存储

> 二进制文件, 直接打开一般会有一部分乱码
>
> 是因为, 二进制文件的内容, 不会全部以 `ASCII 码` 的形式存入内存中, 只有字符型的数据, 会转换为相应的 `ASCII码` 再存储至内存。
>
> 所以直接打开二进制文件, 字符型以外的数据 就会以乱码的形式展现给用户。
>
> > 或许会有 打开二进制文件 却发现中文内容也变成了乱码, 那可能是文件内容编码不合适导致的

## 数据在内存中的存储

> 介绍完 `文本文件` 和 `二进制文件`, 会发现有一个共同点: 
>
> 字符型的数据, 都会先转换为 `ASCII码` 之后, 在存储 `ASCII码` 的二进制数据。
>
> 其实是因为, 数据在内存中的存储具体是这样的: 
>
> 1. 字符型的数据, 都会 以其对应的 `ASCII码` 的二进制存储至内存中
> 2. 数值型的数据, 可以 以其对应的 `ASCII码` 的二进制存储至内存中（文本文件）, 也可以 直接以数值本身的二进制形式存储至内存中 
>
> 那么, 数值型的数据 的两种不同形式的存储 有没有什么区别呢？
>
> 答案是有的！
>
> 举例说明: 
>
> > 当 我们需要将 99999 存储起来, 可以用两种形式: 
> >
> > 1. 以 `ASCII码` 的形式存储: 
> > 
> >     需要将`9` `9` `9` `9` `9` 分别转换为字符, 然后存储其对应的 `ASCII码`的二进制
> > 
> >     即: 
> > 
> >     ![DATA_STORAGE-ASCII |wide](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/file-DATA_STORAGE-ASCII.webp)
> > 
> >     `VS2013`:
> > 
> >     ![ASCII-READ |wide](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/file-DATA_STORAGE-ASCII-READ.webp)
> > 
> > 2. 直接以数值的二进制存储: 
> > 
> >     即: 
> > 
> >     ![DATA_STORAGE-BINARY |wide](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/file-DATA_STORAGE-BINARY.webp)
> > 
> >     `VS2013`: 对文件中以二进制输出 `99999`
> > 
> >     ![|large](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/file-DATA_STORAGE-BINARY-READ.webp)
> > 
> >     ![BINARY-READ2 |wide](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/file-DATA_STORAGE-BINARY-READ2.webp)
> >
> > 我们可以非常明确的看到, 对于同一个数值型数据, 以 `99999` 为例
> >
> > 如果以 `ASCII码`形式 存储, 占用 5 字节 内存
> >
> > 如果直接以 数值的二进制形式 存储, 占用 4 字节 内存
> >
> > 所以, 数值型数据的两种不同的存储方式, 在内存方面 是有一定的区别的。

看完这些, 相信都可以理解究竟什么是二进制文件, 什么是文本文件了吧！

