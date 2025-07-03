---
draft: true
title: "[C++] 类和对象(4): 初始化列表、构造函数细节、static成员、友元、内部类..."
pubDate: "2022-06-28"
description: "关于: '对象的成员变量是在哪里定义的？' 的这个问题, 要提出一个名词: 初始化列表"
image: https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/202306251807073.webp
categories:
    - Blogs
tags:
    - C++
    - 类和对象
---

# 一、构造函数补充

## 1.1 初始化列表

类的六大默认成员函数之一的 `默认构造函数` , 是对象定义(实例化)时, 自动调用对 对象成员变量进行初始化的函数

而对象的定义其实是`对对象整体的定义`, 构造函数的内容是`对象成员变量的赋值`

![|inline](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/image-20220626214449795.webp)

这就出现了一个问题: `对象的成员变量是在哪里定义的？`

这就要提出一个名词: `初始化列表`. 对象成员变量的定义就是在这里实现的

### 1.1.1 什么是初始化列表

`初始化列表`, 是位于构造函数 `()`之下,`{}`之上, 定义对象成员变量的一个列表.
具体的位置是在这里: 

![|inline](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/image-20220626215814360.webp)

初始化列表 以一个`冒号:`开始, 以`逗号,`分割成员变量, 成员变量以此形式位列其中: `成员变量名(初始化内容)`
当调用默认构造函数, 但`不进入默认构造函数内容时, 成员变量就已经定义好了`

![ ](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/image-20220626221101976.webp)

根据调试时对象的监视, `成员变量在初始化列表中未显式定义时, 编译器也是会自动经过初始化列表定义的, 但是未作初始化`

> 这也是 `编译器自动生成的默认构造函数对内置类型变量不做处理, 对自定义类型调用其默认构造函数处理` 的原因
>
> 默认构造函数都是编译器自动生成的, 初始化列表肯定也是自动生成的
> 自动生成的初始化列表只对内置类型成员变量进行定义, 而不初始化
>
> `初始化列表中未显式定义的成员变量, 编译器也会自动定义`

### 1.1.2 初始化列表的用途

经过上面对初始化列表的介绍
可以发现`对于一般的内置类型`, 好像没有必要使用初始化列表进行赋初值, 赋初值的操作在构造函数内部也能够实现
那么, 初始化列表是不是就没有用呢？

答案肯定是有用
因为`不是所有的变量都可以定义和赋值分离的`

比如这样的变量,  还能不通过初始化列表, 而是在构造函数内部赋初值吗？

![|inline](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/image-20220626230214658.webp)

这三种类型的成员变量中
`const修饰的`和`&引用类型的`很显然`定义与赋值是不能分离的`, 定义时必须初始化
`类A的对象`由于没有默认构造函数, 显然也是必须传参才能实例化的

所以, 类似这样的变量作为成员变量是`必须要显式在初始化列表进行定义并初始化`的

即: 

![|inline](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/image-20220626231708005.webp)

而在成员变量声明中的这个东西: 

![|inline](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/image-20220627135448835.webp)

类的成员变量在声明处给了缺省值, 而这个`缺省值就是给初始化列表使用的`: 

![](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/image-20220627135908514.webp)

### 1.1.3 初始化列表执行顺序

判断一下以下代码的`输出结果`是什么？

![|inline](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/image-20220627140435108.webp)

![|small](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/image-20220627140634031.webp)

是 `1` 和 `随机值`

初始化列表中, `_a1`的定义在`_a2`之前, 为什么`_a1`有数值 `_a2`是随机值?

因为, `成员变量的初始化顺序是按照声明顺序来的, 并不是变量在初始化列表中的编写顺序`

所以, 在上面一段代码中, `_a2` 先初始化为`_a1`, `_a1`后初始化, 所以 `_a1`有数值, `_a2`是随机值

## 1.2 构造函数中的隐式类型转换 及 explicit

以只有一个成员变量的类为例
在对象实例化时, 不仅可以这样实例化: 

![|inline](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/image-20220627143207678.webp)

还可以这样实例化: 

![|inline](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/image-20220627143345962.webp)

第一种方式是正常调用了构造函数

而第二种方式则经历了一个过程, `隐式类型转换的过程`
这种方式其实是先将 `2022` 使用构造函数构造了一个`临时对象`, 再将这个`临时对象` 拷贝构造至`c2`（编译器未优化）
如果编译器对这个过程进行了优化, 那么就直接是 对`c2`进行构造了

直接使用数值对象实例化是可以的, 不过如果想要禁止这种方法 可以将构造函数用 `explicit` 修饰
可以禁止隐式类型转换: 

![|inline](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/image-20220627145718768.webp)

### 1.2.1 构造函数中隐式类型转换的意义

既然 可以直接用数值进行对象的实例化, 那么是否可以`直接 类引用数值呢`？

答案也是可以的, 不过需要用 `const` 关键词修饰: 

![|inline](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/image-20220627144408734.webp)

如果不加 `const` 修饰就会报错: 

![|medium](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/image-20220627144459207.webp)

因为 `直接使用数值进行对象实例化, 数值会先构造成一个临时对象, 临时对象其实是具有常性的`
如果不用`const`修饰就加以引用, 其实是一种权限放大的操作, 是错误的 

> 另外, `给临时对象起别名, 会使临时对象的生命周期延长至别名生命周期结束`

---

> 直接使用数值(常量)是可以进行对象实例化的, 也就同时意味着可以直接使用常量 传参, 但是参数的声明需要用`const`修饰
>
> PS: 直接使用常量传参在 `string` 中, 非常有意义: 
>
> ![|small](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/image-20220627150359000.webp)

# 二、static 修饰类成员

`static` 在类内使用, 用来修饰成员变量或者成员函数, 被修饰的成员会被存放入静态区
`static`的类成员称为类的静态成员
用`static`修饰的成员变量, 称之为`静态成员变量`
用`static`修饰的成员函数, 称之为`静态成员函数`  

## 2.1 static 修饰成员变量

`static` 修饰 成员变量, 与其修饰普通变量的用法不同

随便举个例子: 

![|inline](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/image-20220627164834652.webp)

`static` 修饰成员变量时, 需要在类外手动定义(不用加`static`)之后才能使用

> 成员变量 是`在对象实例化时, 才会通过初始化列表定义的`。类中只是成员变量的声明, 并不是定义
>
> 并且, `静态成员变量`是不通过初始化列表定义的
>
> 初始化列表的作用是, 定义每个对象的成员变量, 使对象成功实例化。每个对象都有其各自的成员变量
>
> 而`静态成员变量`是被 `static` 修饰的成员变量, 是不能频繁被定义的, 只能被定义一次
> 所以`并不是每个对象都有各自的静态成员变量, 静态成员变量整个类中只有一个`
> 所以 `静态成员变量` 的定义不经过初始化列表, 而是需要在类外手动定义
>
> 经过定义的`静态成员变量` `属于整个类`
> 即, `属于此类的所有对象都可以访问类的公用的静态成员变量`

以此类为例: 

![|inline](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/image-20220627170703703.webp)

此类, 每调用一次 `默认构造函数` , `静态成员变量_x`自增1

![|inline](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/image-20220627171625667.webp)

实例化四个对象, `_x`自增四次, 所以四个对象访问的`_x`都是 `4`

并且, 直接通过类 访问 `_x` 也是没问题的

> 可以证明, `静态成员变量不属于任何一个对象, 而是属于整个类`

## 2.2 static 修饰成员函数

类中, 为了限制直接对成员变量进行访问, 所以`一般都会将成员变量设为私有, 包括静态成员变量`

而静态成员变量又不属于任何一个对象, 所以`静态成员变量设置为私有的话, 是无法通过某个对象或类来直接访问的`: 

![ ](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/image-20220627172422033.webp)

所以, 对于`静态成员变量`通常会通过函数来专门操作

![|inline](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/image-20220627172803331.webp)

但是, 对于 `静态成员变量`, 它`是可以在没有对象的情况下通过类来访问的`
而一般的成员函数只能通过对象来调用
为了可以 直接通过类调用成员函数, 可以在成员函数前加上 `static` 进行修饰, 被称为 `静态成员函数`

![|inline](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/image-20220627173726050.webp)

### 静态成员函数 可以通过类直接调用

非静态成员函数不能通过类直接调用

![|inline](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/image-20220627174018279.webp)

静态成员变量可以通过类直接调用

![|inline](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/image-20220627174207871.webp)

### 静态成员函数 只能操作静态成员变量

`静态成员函数, 只能访问静态成员变量, 不能访问非静态成员变量`, 因为静态成员函数没有 `this指针`

![|inline](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/image-20220627175149215.webp)

# 三、友元

`友元`分为: `友元函数`、`友元类`

友元提供了一种突破封装的方法。即, `友元函数或友元类, 即使定义在类外部, 也可以操作类的成员`

不过, 友元`会破坏类的封装, 会提高类的耦合度`。而类追求的是 `低耦合,高内聚`, 所以友元能少用就少用

## 3.1 友元函数

既然友元会破坏封装, 那么就`最好在必要情况下在使用友元, 否则不要轻易使用`

什么是必要情况下？

### 3.1.1 日期类 >>、<< 重载

之前对实现日期类的时候, 对几乎所有 有意义的运算符都实现了重载
不过, 却没有对 `流提取>>` 、`流插入<<` 这两个运算符重载, 进而实现类似与内置类型一般 `cin 直接输入`和`cout 直接输出`的功能

下面就来对日期类实现一下 `cout` 与 `cin` 的功能: 

对内置类型使用的 `cout <<` 和 `cin >>`, 其中的 `<<` 和 `>>` 也是重载, 因为其原本的意义应该是`<< 按位左移`、`>> 按位右移`

![|inline](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/image-20220627233819574.webp)

既然是重载, 那么 `cout` 和 `cin` 就属于操作数, `cout` 和 `cin` 是什么类型的操作数呢？

![ ](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/image-20220627234601546.webp)

在上图中可以看出, `cout` 属于 `ostream类`, `cin` 属于 `istream类`

所以对于`流插入<<` 和 `流提取>>` 应该这样定义重载函数: 

![|inline](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/image-20220628000515269.webp)

`ostream&` 和 `istream&` 作为类型, 分别取 `_cout`、`_cin` 作 `cout`、`cin`的别名

定义完之后会发现, 无法正常使用: 

![|huge](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/image-20220628003034692.webp)

原因很清楚: 
因为`运算符重载默认, 第一个参数为左操作数, 第二个参数为右操作数`
所以 `对象d` 需作左操作数, `ostream 类型的 cout` 需作右操作数

为了正常使用, 应该让 `ostream 类型的 cout` 作为左操作数
所以, 就只能在类外重载`>>` 和 `<<`运算符

> 在类内, 非静态成员函数 默认第一个参数是 `this指针`, 这个规则是无法修改的
> 所以, 要想实现正常的 `cout` 和 `cin`, 那么只能在类外实现 `>>` 和 `<<` 的重载函数

所以, 在类外应该这样定义: 

![|inline](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/image-20220628004249949.webp)

但是, 在编译器中无法编译通过: 

![ ](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/image-20220628003854057.webp)

函数定义在类外, 无法访问类内私有成员

如果想要正常使用, 只需要将函数添加为`友元函数`就可以了！

![|inline](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/image-20220628003647141.webp)

然后:

![|medium](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/image-20220628004424890.webp)

这样就可以正常的使用了

---

在上面对日期类中 `>>` 和 `<<` 的重载, 想要正常使用两个运算符, 就必须使用友元: 

![ |large](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/image-20220628004819766.webp)

像这样的函数, 就被称为`友元函数`

即, 在类外定义的, 在类内加上 `关键词friend` 重新声明的函数

但是, 关于 `友元函数` 有几个规则需要注意: 

> 1. 友元函数, 虽在类内声明, 并且可以访问类内私有和保护的成员, 但 `友元函数不属于类的成员函数`
> 2. 一个函数, 可以同时作为多个类的友元函数
> 3. 友元函数不能被 `const` 修饰
>     因为`友元函数没有 this指针`
> 4. 友元函数可以在内类任意位置声明, 且不受类访问限定符的限制

## 3.2 友元类

理解了友元是什么意思之后, `友元类` 也就非常容易理解了

其实就是`类可以作为另一个类的友元类`

还是以日期类为例, `将日期类作为时间类的友元类`

![|huger](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/image-20220628010522764.webp)

友元类的所有成员函数, 都可以作为另一个类的友元函数使用

> PS: 
> 友元类只有单向性: 
> 例如, `Date类 作为 Time类 的友元类, 使 Date类的成员函数 可访问 Time类的成员, 但是 Time类的成员函数 是不能访问 Time类的成员的`

# 四、内部类

`内部类`, 顾名思义就是 `定义在类内部的类`

![|inline](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/image-20220628012339023.webp)

> 内部类是一个独立的类, 它`不属于外部类`, 所以 `外部类的成员函数无法访问内部类的成员`
>
> 并且, `内部类就是外部类的友元类`, 但 外部类不是内部类的友元类

![|large](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/image-20220628012549678.webp)

类B的对象, 可访问 类A对象的成员

内部类还需要注意: 

> 1. 内部类可以定义在外部类的 `public`、`private`、`protected`, 并且受这些访问限定符的限制
>
> 2. 内部类可以直接访问外部类的 static修饰成员、枚举成员等, `不需要 类名或对象`
>
> 3. 对右内部类的类使用 `sizeof()`, 结果是`只有外部类的大小, 不算内部类`。
>     因为内部类是独立的, 并不属于外部类
>
>     ![|wide](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/image-20220628013446903.webp)
>
>     `sizeof(A)` 不计算 类B的大小
