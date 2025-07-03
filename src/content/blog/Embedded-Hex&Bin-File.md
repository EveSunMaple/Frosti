---
draft: true
title: "Hex文件与Bin文件"
pubDate: "1001-01-01"
description: "嵌入式中的Hex文件与Bin文件"
# image: 
categories:
    - Blogs
tags:
    - 嵌入式
---

# `.hex`

`.hex`文件, 是一种ASCII文本文件, 文件内容遵循`Intel HEX`文本格式

`Intex HEX`文件中, 每行包含一个`HEX`记录, 记录由十六进制数字组成

`Intex HEX`文件, 常用于记录 存储在`ROM`或`EPROM`中的程序和数据

`Intex HEX`文件中, 每行`HEX`记录的格式为: **`:llaaaatt[dd...]cc`**

除首位`:`外, 每个字母均表示一个十六进制数据

1. `:`, 表示 每行`HEX`记录 的开始标记

2. `ll`, 表示 每行`HEX`记录中 的有效载荷数据长度字节

3. `aaaa`, 地址字段, 表示 每行`HEX`记录中实际存储有效载荷的起始地址

4. `tt`, 表示 本行`HEX`记录 的类型, 有6种类型:

    1. `00`, 表示 数据记录
    2. `01`, 表示 文件结束记录
    3. `02`, 表示 扩展段地址记录
    4. `03`, 表示 起始段地址记录
    5. `04`, 表示 扩展线性地址记录
    6. `05`, 表示 开始线性地址记录, 这个仅限`MDK-ARM`

5. `dd`, 表示 每行`HEX`记录中 的有效载荷数据, 两个字母表示一个字节, 要与`ll`字段记录的字节数对应

    若, `ll`字段为`00`, 本字段不填写

6. `cc`, 表示 本行的完整`HEX`记录的校验和

    校验和的计算方法是: 

    将记录中所有 十六进制数字对 的值相加 模256, 然后取二进制补码

其中, `:` `ll` `aaaa` `tt` `cc` 字段是必须的, `dd`字段 与`ll`字段需要对应

## 例子

这是一个`Keil`编译`C51`工程生成的`.hex`文件的内容:

![](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/202409192300800.webp)

以首行`HEX`记录为例:

```cpp
// LCD9648 示例 .hex 首行
:1007030048454C4C4F20574F524C4400D1A7CFB0D3
```

1. `:`

2. `ll`: `10`, 表示 本行`HEX`记录中 记录`16`字节的有效载荷

3. `aaaa`: `0703`, 表示 有效载荷数据起始地址在`0x0703`

4. `tt`: `00`, 表示 本行`HEX`记录 是数据记录

5. `dd`: `48454C4C4F20574F524C4400D1A7CFB0`, `32`个十六进制字符, `16`字节的有效载荷数据, 与`ll`对应

6. `cc`: `D3`, 校验和计算步骤如下:

    ```cpp
    1. 计算所有十六进制数字对的和
        10+07+03+00+48+45+4C+4C+4F+20+57+4F+52+4C+44+00+D1+A7+CF+B0 = 62D
    2. 用 和 % 256(10进制), 100(16进制)
        62D -> 1581(10) % 256 = 45 -> 2D
    3. 取模结果 取补码 得到校验和
    	2D -> 00101101 --取反-> 11010010 --加1-> 11010011 -> D3
    ```

> 数据来源-- `Arm`开发者文档 和 `维基百科`:
>
> [**GENERAL: Intel HEX File Format**](https://developer.arm.com/documentation/ka003292/latest) 和 [**Intel HEX -Wikipedia**](https://en.wikipedia.org/wiki/Intel_HEX)

# `.bin`

在嵌入式编程中, `.bin`文件一般是二进制文件, `bin`是`binary`的缩写, 是一种非文本文件

如果使用常规的编辑器打开二进制文件, 编辑器显示的内容基本上是乱码, 因为编辑器无法将非文本意义的二进制数据转换成有效文本

在嵌入式编程中, `.bin`文件的内容基本就是程序的机器码和数据的二进制

---

用 `HexView`, 打开 `Keil`对同一工程生成的`.hex`和`.bin`文件, 可以看到两个文件的二进制数据是相同的:

![](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/202409192251147.webp)

> `Keil`编译`C51`工程, 由`.hex`生成`.bin`的方法, 请阅读`Arm`开发者文档:
>
> [**GENERAL: Making Binary Files from Hex Files**](https://developer.arm.com/documentation/ka003932/latest)