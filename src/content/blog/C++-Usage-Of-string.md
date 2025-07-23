---
draft: true
title: "[C++-STL之前] 剖析string类~ 介绍C++-STL"
pubDate: "2022-07-02"
description: "C++ 为了更方便的管理、操作、使用字符串, 设计了一个类模板 —— basic_string"
image: https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/202306251810988.webp
categories:
    - Blogs
tags:
    - C++
    - 容器
---

# 什么是 string

C语言中, 字符串是以`'\0'`结尾的一些字符的集合, 并且C标准库中也提供了一些`str`系列的库函数, 但是这些库函数与字符串是分离开的, 不太符合 `面向对象编程(OOP)` 的思想, 而且底层空间需要用户自己管理, 稍不留神可能还会越界访问。

所以, C++ 为了更方便的管理、操作、使用字符串, 设计了一个类模板 —— `basic_string`

而 C++中最常用的 `string` 即为 以 `char` 为字符类型的 `basic_stirng` 的实例化类

> 除 以 `char` 为字符类型的 `string`——`typedef basic_string<char> u16string;` 之外 
>
> 还有
>
> 以 `char16_t` 为字符类型的 `u16string`—— `typedef basic_string<char16_t> u16string;`
>
> 以 `char32_t` 为字符类型的 `u32string`——`typedef basic_string<char32_t> u32string;`
>
> 以 `wchar_t` 为字符类型的`wstring`——`typedef basic_string<wchar_t> wstring;`
>
> 四个以不同编码字符为字符类型的类, 都是 用`basic_string` 这个类模板实例化出来的

即, `string` 是表示字符串的字符串类

下面就是本篇文章的重点内容了: `string` 常用接口的介绍及使用

# string 常用接口的介绍及使用

`string` 是类模板的实例, 即它本身就是一个类

既然是类, 那么就从构造函数开始介绍

## 1. string类 对象的常见构造

| `(constructor)`函数名称                                      | 功能说明                                   |
| ------------------------------------------------------------ | ------------------------------------------ |
| `string() `**（重点）**                                      | 构造空的`string`类对象, 即空字符串         |
| `string(const char* s) `**（重点）**                         | 用`C-string`来构造`string`类对象           |
| `string(size_t n, char c) `                                  | `string`类对象中包含`n`个字符`c`           |
| `string(const string&s)` **（重点）**                        | 拷贝构造函数                               |
| `string (const char* s, size_t n);`                          | 以`C-string`前`n`个字符, 构造              |
| `string (const string& str, size_t pos, size_t len = npos);` | 以`string类`中, `pos`位置向后`len`长度构造 |

> 使用 `string` 类时, 需要包含 `#include <iostream>` 头文件
> 为使用方便, 可将 `namespace std` 全部展开

![|inline](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250711182857922.webp)

一个一个看: 

1. `string s1;` 无参调用构造函数, 即实例化一个空对象`s1`

    ![|wide](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250711182859835.webp)

2. `string s2(s);` `string s3("hello world");` 

    使用 C字符串 实例化 对象`s2` 和 `s3`

    ![ |wide](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250711182901324.webp)

3. `string s4(s2);` `string s5 = s4;` 调用拷贝构造函数, 实例化对象`s4` 和 `s5`

    ![|wide](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250711182902941.webp)

4. `string s6(10, 'S');` 将前 10 个字节, 初始化为 `'S'`, 实例化对象`s6`

    ![|wide](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250711182904579.webp)

5. `string s7(s, 4);` `string s8("hello world", 5);`

    以 C字符串的前`n`个字符 实例化对象 

    ![|wide](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250711182906496.webp)

6. `string s9(s2, 2, 5);`

    以 字符串对象 `s2`, 从 `pos`位置(从0开始)向后延伸`n`位, 实例化对象

    ![|wide](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250711182908026.webp)

    > 此构造函数声明为: `string (const string& str, size_t pos, size_t len = npos);`
    >
    > 其中 `参数len` 给了 `缺省值 npos`
    >
    > `npos` 是 `string`类中的静态无符号常整型值为 -1: 
    >
    > ![|small](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250711182909879.webp)
    >
    > 
    >
    > 无符号的 -1, 即为`int`类型中最大值: 4294967295
    >
    > ![|medium](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250711182911344.webp)
    >
    > 参数`len` 有缺省值`npos`就意味着, 如果`len`不传参, 就是从 `pos` 位置延伸到字符串最后
    > 因为实际上不会有字符串的长度 可以达到 4294967295 独占4G的内存

## 2. string类对象的访问及遍历操作

| operator[] （重 点）         | **返回**`pos`位置的字符                                      |
| ---------------------------- | ------------------------------------------------------------ |
| **迭代器`iterator`（重点）** | `begin` **获取一个字符的迭代器** + `end`**获取最后一个字符下一个位置的迭代器** |
| 范围`for `                   | C++11**支持更简洁的范围**`for`**的新遍历方式**               |

1. **`operator[]`**

    此方法类似于 字符数组的下标访问

    ![|huger](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250711182913583.webp)

    

    `operator[]`是重载函数:

    ![|medium](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250711182915810.webp)

    它的返回值是, 指定位置字符的引用

    > 这里返回 引用类型, 有两个作用: 
    >
    > 1. 返回 & 类型, 减少数据拷贝节省资源
    > 2. 返回 & 类型, 不仅可以访问指定位置的字符, 还可以修改指定位置字符, 传值返回不可

    由于返回值类型为&类型, 即默认情况 `可读可写`, 但不排除有只读类型的对象调用, 所以重载了一个 `const` 修饰的函数

2. **迭代器`iterator`**

    > 在 `string`、`vector` 这种实际数据内容是 一篇连续的内存空间的类中
    >
    > 迭代器可以看作指针类型
    >
    > 但, 在其他 `STL` 类中, 不可将其简单的看作指针

    ![|huge](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250711182917430.webp)

    > 迭代器的比较, 最好不要用 `<` `>` `<=` `>=`, 因为在其他 类中的数据地址可能不是连续的

    `string`中, 迭代器不仅仅有 `iterator`, 迭代器一共有四种: 

    1. `iterator`: 正向 可读写 迭代器

    2. `const_iterator`: 正向 可读 迭代器

        ![|small](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250711182920022.webp)

        取 `string`对象中字符串首字符位置, 返回给正向迭代器

        

        ![|small](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250711182921677.webp)

        取 `string`对象中字符串末字符的下一位置, 返回给正向迭代器

        `const` 可以很容易理解
        正向, 代表 此迭代器`从左向右`为正向, 即 自增移动方向为从左向右`(从上面例子即可看出)`

    3. `reverse_iterator` : 反向 可读写 迭代器

    4. `const_reverse_iterator` : 反向 可读 迭代器

        ![|small](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250711182923400.webp)

        取`string`对象字符串的末字符下一位置, 返回给`反向迭代器`

        ![|small](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250711182925314.webp)

        取 `string`对象中字符串首字符位置, 返回给`反向迭代器`

        反向, 代表 此迭代器`从右向左`为正向, 即 自增移动方向为从右向左

        ![ |wide](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250711182927310.webp)

3. **范围`for `**

    范围`for`方法, C++11 提出的 调用迭代器的、编写更为简洁的方法

    ![|large](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250711182928843.webp)

## 3. string类对象的容量操作

| 函数名称                             | 功能说明                                            |
| ------------------------------------ | --------------------------------------------------- |
| **`size()`（重点）**                 | 返回字符串有效字符长度                              |
| `length()`                           | 返回字符串有效字符长度                              |
| `capacity()`                         | 返回空间总大小                                      |
| **`empty()` （重点）**               | 检测字符串是否为空串, 是返回`true`, 否则返回`false` |
| **`clear() `（重点）**               | 清空有效字符                                        |
| **`reserve(size_t n = 0) `（重点）** | 为字符串预留空间, `扩容量`                          |
| **`resize(size_t n)` （重点）**      | 将有效字符的个数改为`n`个, 多出的空间用字符`c`填充  |
| **`max_size()`**                     | 返回字符串最大长度                                  |

1. `size()` 返回字符串 有效字符长度, 即返回 对象的`size`

    ![|small](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250711182931207.webp)

    ![|large](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250711182932484.webp)

2. `length()` 返回字符串 有效字符长度, 即返回 对象的`size`

    ![|small](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250711182934212.webp)

    ![|large](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250711182935535.webp)

    两函数返回值相同, 即其实都返回 对象的 `size`, 但是为什么有两个函数呢？

    > 因为, `string` 比 `STL` 出现的要早, 对于字符串用 `length` 长度, 比较合适
    >
    > 但是, 后来 `STL` 出现之后, 其中的类(树、链表等) 都用的 `size`, 所以为了统一使用 `string` 添加了一个 `size`
    
3. `capacity()` 返回总容量大小

    `string` 管理字符串, 空间是动态开辟的, 所以会存在有效字符大小和总空间大小, 这也就意味着 总空间满了之后, 是需要扩容的

    ![|small](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250711182937699.webp)

    ![|large](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250711182939113.webp)

4. `empty()` 检测字符串是否为空串

    ![|small](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250711182941247.webp)

    ![|large](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250711182942522.webp)

5. `clear() ` 清空有效字符, 即`size清零`

    ![|small](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250711182944410.webp)

    ![|large](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250711182945932.webp)

6. `reserve(size_t n = 0)` 为字符串预留空间, `扩容量`

    ![|small](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250711182948173.webp)

    `string` 中, 字符串的维护空间是动态开辟的, 当容量满时, 是需要扩容的

    而执行某些操作时, 比如尾插 10000个字符, 需要频繁的扩容, 会导致效率降低

    `reserve` 就是 防止频繁扩容降低效率时 用的, 它的作用是, 为字符串预开辟空间, `可一次性开辟指定大小的空间`

    ![|wide](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250711182949566.webp)

    `reserve` 只能扩容, 不能缩容: 

    ![|wide](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250711182951515.webp)

7. `resize(size_t n, char c)`将有效字符的个数改为`n`个, 多出的空间用字符`c`填充

    ![|small](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250711182953792.webp)

    `resize` 存在重载函数 `resize(size_t n)` 

    ![|wide](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250711182955053.webp)

    ![|wide](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250711182956711.webp)

    > 当使用 `resize(size_t n)` 不传指定字符时, 多出的位置会被初始化为 `0`

    `resize` 也无法缩容, 但是, 可以指定有效字符大小: 

    ![|wide](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250711182958610.webp)

8. `max_size` 返回字符串最大长度

    ![|small](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250711183001850.webp)

    ![|wide](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250711183003452.webp)

## 4. string类对象的修改操作 

| 函数名称                  | 功能说明                                                     |
| ------------------------- | ------------------------------------------------------------ |
| **`push_back(char c)`**   | 在字符串后尾插字符`c`                                        |
| **`append `**             | 在字符串后追加一个字符串                                     |
| **`operator+=` （重点）** | 在字符串后追加字符串`str`                                    |
| **`c_str`（重点）**       | 返回 C格式字符串                                             |
| **`find`（重点）**        | 从字符串`pos`位置开始往后找字符`c`, 返回该字符在字符串中的位置 |
| **`rfind` **              | 从字符串`pos`位置开始往前找字符`c`, 返回该字符在字符串中的位置 |
| **`substr `**             | 在`str`中从`pos`位置开始, 截取`n`个字符, 然后将其返回        |
| **`insert`**              | `pos`位置插入字符串                                          |
| **`erase`**               | 指定范围删除字符                                             |

1. **`push_back(char c)`** 在字符串后尾插字符`c`

    ![|small](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250711183006464.webp)

    ![|wide](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250711183007827.webp)

2. **`append `** 在字符串后追加一个字符串

    ![|huge](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250711183009819.webp)

    `append`函数有多种重载, 即 它有多种用法: 

    ![|wide](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250711183011265.webp)

3. **`operator+=`** 在字符串后追加字符串`str`

    ![ |large](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250711183013177.webp)

    这个运算符重载函数, 在`string`中 尾插用的最多, 比前面两个多得多, 因为它非常的方便

    ![|wide](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250711183014536.webp)

4. **`c_str`** 返回 C格式字符串, 即C语言中的指针指向的字符串

    `c_str` 非常的重要, 因为编写程序时, 可能会经常用到C语言标准库中的接口, 需要使用指针, 此时就需要`c_str` 发挥作用

    ![|small](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250711183016423.webp)

    ![ |wide](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250711183017751.webp)

    不过要注意, `c_str` 的返回值是 被`const`修饰的

5.  **`find`**

    从字符串`pos`位置开始往后找字符`c`, 返回该字符在字符串中的位置

    ![|huge](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250711183019508.webp)

    `find`并不仅限于找字符, 还可以找字符串: 

    ![|wide](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250711183021032.webp)

6. **`rfind`**

    从字符串`pos`位置开始往前找字符`c`, 返回该字符在字符串中的位置

    使用与 `find` 一致

    ![|huge](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250711183023003.webp)

7. **`substr `**

    在`str`中从`pos`位置开始, 截取`n`个字符, 然后将其返回

    ![|medium](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250711183025128.webp)

    `substr` 将截取的字符串以`string对象`的形式返回

    ![|wide](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250711183026456.webp)

9. **`insert`**  `pos`位置插入字符串

    ![|wide](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250711183028291.webp)

    由于 `insert` 很可能需要挪动数据, 所以不常用

    ![|wide](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250711183029834.webp)

10. **`erase`** 指定范围删除字符

    ![|large](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250711183031984.webp)

    ![|wide](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250711183035188.webp)

## 5. string类非成员函数

| 函数                               | 功能说明                                 |
| ---------------------------------- | ---------------------------------------- |
| **`operator+`**                    | 尽量少用, 因为传值返回, 导致深拷贝效率低 |
| **`operator>>（重点）`**           | 流提取运算符重载                         |
| **`operator<<（重点）`**           | 流插入运算符重载                         |
| **`getline（重点）`**              | 获取一行字符串                           |
| **`relational operators（重点）`** | 大小比较                                 |
| **`swap`**                         | 交换 两`string`对象 内容                 |

> 使用 某些类外函数时, 需要 `#include <string>` 

1. **`operator+`**

    ![|large](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250711183037112.webp)

    可以在官方文档中看到, `operator+` 的返回值都是传值返回, 所以一般不会使用, 还要深拷贝效率太低

    ![|wide](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250711183038656.webp)

2. **`operator>>`** 

    ![|medium](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250711183040727.webp)

    `operator>>` 主要是为了输入数据, 所以操作非常的简单

    ![|large](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250711183041990.webp)

    但是 还有一个问题是: 

    ![|large](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250711183044323.webp)

    当然还有其他解决办法

3. **`getline`** 获取一行字符串

    **`getline`** 与 `>>` 和 `scanf` 都不同, **`getline` **只以`'\n'` , 以及`指定的符号`来判断接受字符结束的标志

    ![|large](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250711183046290.webp)

    所以使用 `getline` 可以用来接收带空格的字符串数据

    ![|wide](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250711183047753.webp)

    甚至可以控制 `获取某个指定字符之前的字符串`

    ![|wide](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250711183049780.webp)

4. **`operator<<`**

    `operator<<` 的作用就是直接输出 对象中字符串的内容了

    ![|large](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250711183051553.webp)

    ![|wide](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250711183052832.webp)

5. **`relational operators`**

    ![|large](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250711183054763.webp)

    比较大小, 即为`>` `<` `==` `!=` 等逻辑判断运算符的重载

    可以实现 `C类字符串` 与 `string对象`之间的比较

6. **`swap`** 交换 两`string`对象 内容

    ![|small](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250711183056867.webp)

    ![|wide](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250711183057983.webp)

> 这部分内容, 都是`string类`的非成员函数
>
> 其实也就是说, 操作对象的函数的定义, 不一定非要定义在类中, 也可以在类外

---

`string` 的常用接口的用法基本都介绍完了, 但是这里的内容并不是`string类`中所有的接口函数

如果遇到本篇文章没有介绍的 `string类` 接口函数, 可以直接 查看官方文档。
