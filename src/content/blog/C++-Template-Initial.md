---
draft: true
title: "[C++] 初接触-泛型编程 - C++模板分析: 函数模板结构、原理分析、类模板分析..."
pubDate: "2022-06-30"
description: "C++中的的模板, 分为两部分: 1. 函数模板 2. 类模板 本篇文章就从函数模板开始讲起"
image: https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/202306251810662.webp
categories: ['tech']
tags: ["C++", "泛型编程"]

---

# 泛型编程

C++中引入了重载的概念, 使得可以编写多个函数名相同但参数、返回值不同的函数, 例如: 

![|inline](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/image-20220630125804097.webp)

相同的函数名可以传入不同的参宿, 进而调用不同的函数

但, 即使有了重载, 相同功能的函数 还要分别对不同的类型进行编写, 未免过于繁琐

有没有一种方法, `对于相同的功能, 只需要定义一个类似 浇筑用的模具, 让编译器 按照模具根据不同的类型 自动将函数 "铸造" 出来呢？`

有！这就需要提到泛型编程了.

> 泛型编程: 编写与类型无关的通用代码, 是代码复用的一种手段。C++中模板是泛型编程的基础。  

# 模板

C++中的的模板, 分为两部分: 

1. 函数模板
2. 类模板

本篇文章就从函数模板开始讲起

## 函数模板

函数模板代表了一种函数, 而不是某个函数。

该函数模板与类型无关, `只有在被使用的时候才会根据使用时实参的类型, 产生该种函数特定类型的版本`
*类似于浇筑, 铜水浇筑 得到铜制品, 铝水浇筑 得到铝制品*

### 函数模板的结构

函数模板跟普通的函数定义没有很大的差别, 还以`swap函数`为例, 它的模板应该是:

![|inline](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/image-20220630134203858.webp)

即, 函数模板的格式应该是: 

```cpp
template<typename T1, typename T2, ......, typename Tn>
函数返回值 函数名(参数列表)
{}
```

> 其中 `T1`, `T2`, `Tn`等, 都可以随意起名, 其实就是表示 未知类型, `且一个名字只能表示一个类型`
>
> 而函数的内容及参数, 都使用未知类型定义或声明就可以
>
> 而 模板只是模板, 未使用时编译器不会实例化

### 函数模板的原理及实例化

函数模板是`为编译器提供的`, 编译器会在编译阶段, `根据函数模板被使用时 实参的类型 来推断生成特定类型的函数`供其调用

还以`swap函数`为例

![|lwide](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/image-20220630140832260.webp)

![|inline](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/image-20220630140920692.webp)

这个就是函数模板大致的使用过程 及 结果

根据`反汇编代码`可以看到, 编译器是会对使用的函数模板进行实例化的, 并且 `函数调用 调用的不是模板, 而是有模板实例化出的函数`

上面的例子是让编译器对实参类型进行推断, 进而实例化生成特定类型的函数, 这种方法叫: 
`隐式实例化: 让编译器根据实参推演模板参数的实际类型`

而, 函数模板实例化函数还有另外一种方法: 
`显式实例化: 在函数名后的<>中指定模板参数的实际类型`

---

一般当编译器无法根据实参推演模板参数的实际类型时, 就必须手动`显式实例化`: 

对于下面这种函数模板: 

![|inline](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/image-20220630143145311.webp)

模板参数只用在了返回值类型上, 而函数的参数的类型指定为 `int`
这样编译器是无法根据实参类型, 进行推断的: 

![|inline](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/image-20220630143937841.webp)

这时候, 就必须使用显式实例化指定类型了: 

![|inline](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/image-20220630144116496.webp)

显式实例化使用函数模板的格式就是: 

在函数名和参数列表之间 + `<类型>`: `函数名<类型>(参数)`

当然, `不只是无法隐式实例化才能使用显式实例化的, 任何函数模板都可以显式实例化`

![|inline](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/image-20220630151022809.webp)

即使编译器可以推断出 模板参数的类型, 也同样可以使用 `显式实例化`



而 `关于隐式实例化`, 除了上面正常使用的例子之外, 还有一些需要注意的地方: 

>  如果对只有一个模板参数的函数模板, 传入两个不同类型的参数会发生什么？
>
>  ![ |wide](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/image-20220630150013137.webp)
>
>  发生这种情况, 解决方法有两种: `强制类型转换` 和 `显式实例化`, 即: 
>
>  ![|large](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/image-20220630150407051.webp)
>
>  但是由于这两种方式都发生了类型的转换, 所以 对应的函数模板的参数也需要改变为 `const` 修饰的: 
>
>  ![|medium](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/image-20220630150541615.webp)

> PS: 模板参数可以给缺省类型, 模板函数的参数也可以给缺省类型

### 模板参数的匹配原则

如果存在 一个非模板函数 与 函数模板同名

1. 在使用该函数时, `如果实参类型与非模板函数匹配, 则优先调用非模板函数`

    ![|large](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/no_template.gif)

    可以看到, 当实参类型与非模板函数匹配时, 优先调用非模板函数

    当然也可以使用 `显式实例化` 强制走函数模板: 

    ![|large](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/no_template&template.gif)

2. 对于非模板函数和同名函数模板, 如果其他条件都相同, 在调动时会优先调用非模板函数而不会从该模板产生出一个实例。上面已经证实了
    但是, 如果模板可以产生一个具有更好匹配的函数,  那么将选择函数模板

    ![|large](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/better_template.gif)

    此例中, 模板参数使用了两个, 所以参数传入两个类型不报错, 且调用模板参数实例化函数

3. 模板函数不允许自动类型转换, 但普通函数可以进行自动类型转换

## 类模板

### 类模板的结构

```cpp
template<class T1, class T2, ......, class Tn>
class 类模板名
{
	//类模板成员
}
```

而类模板中成员的定义 就与 函数模板的定义一样

![|huger](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/image-20220630162812338.webp)

类模板中, 成员函数在类外定义时: 

1. 需要加上模板参数列表
2. 需要在成员函数前标明类域

### 类模板的实例化

与 函数模板的函数实例化不同, `类模板 类的实例化必须显式实例化, 不能推演`

即: 

![|inline](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/image-20220630163556763.webp)

以上面的类模板为例, 这也说明了, 类模板实例化类时, `SeqList<类型>` 才是类名, 而`SeqList`不是类名



# 模板 定义与声明 无法分离在两个文件中

模板 定义与声明 `无法分离在两个文件中`, 意思就是 `模板的声明和定义必须统一放在头文件中`。否则会发生`链接错误`

为什么？

这个原因就要从编译链接的角度分析了

> 关于编译链接, 可阅读博主文章: [[程序员的自我修养\] 理解编译到链接的过程](http://localhost:3000/posts/Compile&Link)

首先要知道, 编译链接的过程大致分为: `预处理`、`编译`、`汇编`、`链接`

而`前三个过程中, 多个源文件之间是没有联系`的。

即, 假如 模板的定义和声明分离在了两个文件中, 也就是这样: 

![|inline](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/20220630164906.webp)

那么源文件经过`预处理`之后就会大致变成这样, 且文件名会变为`.i` 后缀: 

![|inline](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/image-20220630165723271.webp)

可以非常明显的发现, `main` 函数所在文件里是`没有关于类模板函数的定义`的

并且 直到 `汇编操作之后, 链接之前` , 这两个文件之间是没有任何联系的
即,  `mian.i` 不能向 `template.i` 寻找内容, `template.i` 也不能向 `mian.i` 寻找内容

这就导致了

1. `template.i` 文件中, 没有需要类模板实例化的操作, 所以不会进行类模板实例化
2. `mian.i` 文件中, 有需要类模板实例化的操作`SeqList<int> slt;`, 但是此文件的类模板中 `成员函数没有定义, 只有声明`, 所一直会生成相应的类的成员函数的符号, 没有实质成员函数的地址

进而会导致, 最后的`链接`操作, 两文件中都没有关于函数的地址, 所以 `只有函数名没有函数地址, 会导致链接错误`

![](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/image-20220630172000157.webp)

所以, `模板的定义与声明 最好不要分离到两个文件中`, 如果非要分离在两个文件中, 那就需要: 

对需要实例化的模板, `在模板定义位置显式实例化`: 

![ ](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/image-20220630172403326.webp)
