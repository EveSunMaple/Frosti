---
draft: true
title: "[程序员的自我修养] 超详解函数栈帧"
pubDate: "2022-03-31"
description: "程序运行背后的机制和由来, 可以看作是程序员的一种“自我修养”。------ 程序员的自我修养 “链接、装载与库”"
image: https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/cover.webp
tags:
    - 程序员的自我修养
    - 内存
---

在阅读这篇文章之前, 请思考一下对于下面的这些问题, 你有一个准确清晰的认知吗？

1. 什么是函数栈帧？
2. 程序中的局部变量, 是如何创建的？
3. 为什么局部变量不初始化会是随机值？
4. 函数传参, 究竟是如何传参的？
5. 函数的形参和实参存在什么关系？
6. 函数是如何被调用的？
7. 函数被调用之后是如何返回的？

如果没有, 请尝试阅读、分析、理解本篇文章。
读懂本篇文章将会提升你的“自我修养”。

> `程序运行背后的机制和由来, 可以看作是程序员的一种“自我修养”。`
> **------ 程序员的自我修养 “链接、装载与库”**
---

# 栈与栈帧

## 什么是栈？

在操作系统中, 栈是一个动态内存区域。

函数的中的局部变量, 都存放在内存的栈区中。

栈区的使用, 和数据结构中的栈使用规则相似: 

压栈、出栈、先进后出。

栈区总是先使用高地址, 再使用低地址, 即栈区的使用是 `从高地址向低地址延伸` 的。

## 什么是栈帧？
从逻辑上讲, 栈帧就是一个函数执行的环境。

栈会保存一个函数被调用所需要的维护信息, 保存这些信息所用的信息空间, 常被称为 `函数栈帧`。

每一个函数的调用, 都会创建一个独立的栈帧。

维护函数栈帧, 需要用 `两个寄存器` 来记录函数栈帧的大小, 也可以叫 划定函数活动记录的范围 , 这两个寄存器存放的是地址, 两个地址之间, 就是函数的栈帧大小: 
1. 寄存器 `ebp`: 栈底指针

  指向维护栈帧的高地址.

2. 寄存器 `esp`: 栈顶指针

  指向维护的栈帧的低地址, 会随每次压栈自动向低地址延伸.

# 栈帧是如何创建的?
> 	以下均在Windows平台, VS2013编译环境下演示
>																						
> 	不同平台, 不同编译环境下的栈帧操作可能会有差异, 但是逻辑相通。

创建一个最简单的可以观察函数栈帧的程序

（步骤划分越细, 函数栈帧观察越容易）: 

```cpp
#include <stdio.h>

int Add(int x, int y)
{
	int z = 0;
	z = x + y;

	return z;
}

int main()
{
	int a = 10;
	int b = 20;
	int c = 0;
	c = Add(a, b);

	return 0;
}
```
在对代码进行调试的时候, 对函数栈帧调用进行查看, 此时调用 mian 函数栈帧:

![SF_Main](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722155222689.webp)

将光标继续向后走, 走到 `21行` 之后跳到另外一个界面: 

![main函数被调用](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722155224276.webp)

发现, `main` 函数并不是直接被计算机调用的, 而是由另外一个函数所调用

向上翻阅代码, 能看到 main 函数其实是在 `__mainCRTStartup` 函数中被调用

而 `__mainCRTStartup` 函数, 又在 `mainCRTStartup` 函数中被调用

![__mainCRTStartup被调用](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722155226316.webp)

所以 在调用 `main` 函数之前, 其实已经调用了两个函数, 也已经创建了两个函数的栈帧。但是这两个函数的栈帧创建的过程并不容易被看到, 所以我们可以观察 main 函数的栈帧的创建来详细了解栈帧的创建。

重新回到, 光标刚指向 `main` 函数的时候, `转到反汇编`: 

![反汇编](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722155228652.webp)

右边 `反汇编窗口的代码` , 其实就是 `main` 函数中, `从函数栈帧创建, 到 main 函数结束` 的整个操作及顺序。

以动画形式演示: 
 1. `main` 函数调用之前, `mainCRTStartup` 和 `__mainCRTStartup` 函数的栈帧创建(无详细内容): 

    ![|large](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722155802933.gif)

 2. 进入 `main` 函数: 

    > 1. `(push ebp)` 压栈, 压入内容是 `ebp` 指向的地址`(为保存当前 ebp 内容)``
    >     `ps: 压栈之后, esp(栈顶指针)自动指向栈顶`
    > 2. `(mov  ebp,esp)` 将 `ebp` 指向 `esp` 的地址( 将 `esp` 赋予 `ebp`)

    此时, `ebp` 和 `esp` 的实际变化为: 

    > 未执行 :
    >
    > ![|wide](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722183154404.webp)
    >
    > 执行 `push ebp` :
    >
    > ![|wide](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722183156265.webp)
    >
    > 执行 `mov ebp,esp` :
    >
    > ![|wide](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722183158097.webp)
    >
    > ![压栈ebp, 调整 |large](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722183159859.gif)

3. 此时, 反汇编中的语句光标指向了 

    `sub esp,0E4h`

    ![next_esp_sub |large](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722155806161.webp)

    即下一句执行指令的就是 `sub esp,0E4h`

    > 汇编语言: `sub 相减`
    >
    > `sub esp,0E4h` 指 `esp = esp - 0E4h`
    >
    > `0E4h` 是十六进制数, 转换成十进制为 228:
    >
    > ![0E4h |large](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722155808407.webp)

    执行`sub esp,0E4h` 的变化: 

    > 未执行: 
    >
    > ![|wide](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722155809979.webp)
    >
    > 执行 `sub esp,0E4h`: 
    >
    > ![|wide](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722155811886.webp)

    ![sub esp,0E4h |large](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722155813343.gif)

    执行之后, `esp` 和 `ebp` 之间会 存在一块由其新维护的空间

    而这段空间其实就是为 `main` 函数预开辟的空间

    查看地址: 

    ![For_main_space |medium](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722155822509.webp)

    即: 从 `0x00AFF8A4` 到 `0x00AFF988` 就是为 `main` 函数与开辟的空间

    也被成为 `main` 函数的栈帧。

    但是, 这里并不是函数栈帧创建的结束。

4. 继续执行汇编指令, 光标继续移动: 

    ![Push_ebx_esi_edi |wide](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722155824372.webp)

    ![Save_ebx_esi_edi |large](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722155825833.gif)

    保存了寄存器`ebx` `esi` `edi`

5. 指令继续执行: 

    > 1. 执行`lea edi,[ebp-0E4h]`:
    >
    >     ![lea_edi |wide](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722155829113.webp)
    >
    >       这里的 `ebp-0E4h` 地址, 经过对比, 就是 预开辟的 `main` 函数栈帧的栈顶地址`(0x00AFF8A4)`
    >
    >     > 汇编指令 : `lea(Load effect address)`   加载有效地址
    >     > `lea edi,[ebp-0E4h]`  即为: 加载有效地址 `ebp-0E4h` 至寄存器`edi`
    >
    > 2. 执行 `mov ecx,39h` 和 `mov eax,0CCCCCCCCh`
    >
    >     ![No_mov_ecx_eax |wide](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722155830664.webp)
    >
    >     👇👇👇
    >
    >     ![mov_ecx_eax |wide](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722155832375.webp)
    >
    >     寄存器 `ecx` 存入 `十六进制 39(十进制 57)`
    >
    >     寄存器 `eax` 存入`0xCCCCCCCC`
    >
    > 3. 执行 `rep_stos  dword_ptr_es:[edi]`:
    >
    >     ![rep_stos |medium](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722155834695.webp)
    >
    >     执行之后, 从 `0x00AFF988 - 4` 到 `0x00AFF8A4` 的`(每4字节)`所有内容都被设置为了 `0xCCCCCCCC` , 即 开辟的`main` 栈帧中的所有内容被设置为 `0xCCCCCCCC` 
    >
    >     汇编指令:
    >
    >     ```
    >     lea         edi,[ebp-0E4h]  
    >     mov         ecx,39h  
    >     mov         eax,0CCCCCCCCh  
    >     rep stos    dword ptr es:[edi]
    >     ```
    >
    >     这一段汇编指令中最后一句
    >
    >     `rep_stos    dword_ptr_es:[edi]`
    >
    >     `rep` :  重复上面指令,  即 
    >
    >     ```
    >     lea         edi,[ebp-0E4h]  
    >     mov         ecx,39h  
    >     mov         eax,0CCCCCCCCh
    >     ```
    >
    >     寄存器 `ecx` 中的值, 即为重复的次数
    >
    >     `stos` : 将 `eax` 中的值拷贝到 `edi` 指向的地址
    >
    >     > 指令执行时, 默认 `edi` 中的地址, 是增大的(向高地址增长)。所以, 会从`edi [ebp-0E4h(0x00AFF8A4)]` 每4字节的增长, 增长到 `0x00AFF988` 共 57次(寄存器 `ecx` 中存入的数据)
    >
    > `main` 函数栈帧中所有内容被 设置为了 `0xCCCCCCCC`
    >
    > 那么 在 `main` 函数中 定义局部变量 而不初始化
    >
    > 局部变量就会表示随机值
    >
    > 所以 输出一个未初始化的局部变量, 很可能会出现:
    >
    > ![|wide](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722155838229.webp)

到此, `main` 函数栈帧的预创建全部完成（只是预创建）。
接下来就是, 局部变量的创建、调用函数栈帧的创建、函数传参、函数返回等。


# 局部变量是如何创建的？调用函数究竟是如何传参的？
以上, 详细分析了 `main` 函数栈帧在内存中创建的过程。
创建完成之后, 就会按照顺序执行 `main` 函数中的函数 或 语句。


接下来, 就是局部变量在栈帧中的创建 和 函数被调用时传参的实现: 

## 局部变量在栈帧中的创建
先在反汇编窗口中, 右键选择显示符号名, 可以看到: 

![|medium](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722155840581.webp)

关闭字符名则会显示地址: 

![Local_variables_creat_front |inline](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722155842629.webp)

> `dword ptr` 表示地址内容为双字`(4字节)`数据

观察汇编代码, 对 局部变量 `a`、 `b`、 `c` 的创建及初始化是从 地址`ebp-8` 开始的。
代码向下执行: 

![Local_variables_creat](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722155845402.webp)

![Local_variables_creat |large](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722155857247.gif)

局部变量的创建相对简单, 一张动图就可以理解。

## 函数被调用时的传参 及 被调用函数栈帧的创建
调用需要使用参数的函数时, 需要传入存在的局部变量, 作为函数的参数。
但是, 被传入函数的参数, 在函数中都被称为 `形参`, 在被调用函数中 直接改变 并不能真正改变原来的变量, 这是为什么？

真正的原因, 就在这里: 

---

![|inline](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722155909397.webp)

先分析汇编代码: 

> ```
> mov        eax,dword ptr [ebp-14h]
> push       eax
> mov        ecx,dword ptr [ebp-8]
> push       ecx
> ```
> 将 `ebp-14h` 地址处的双字的值（即变量 b 的值）存入 寄存器 `eax`, 压栈存入 `eax` , 压入位置是: `0x00AFF894`
> 将 `ebp-8` 地址处的双字的值（即变量 a 的值）存入 寄存器 `ecx`, 压栈存入 `ecx`, 压入位置是: `0x00AFF890`

执行之后内存中的变化: 

![形参的传参](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722155913432.webp)

`这两个步骤, 其实就是形参的创建, 或者说调用函数时的传参操作`
`(被调用函数究竟是如何使用形参的内容在下边)`
也就是说, 形参的创建其实是在 `main` 函数的栈帧中创建的。

汇编指令继续向下执行（注意: 执行 `call` 指令时, `(VS环境)`按`F11` 进入函数内部 ）: 
> `call` 指令, 在这里的作用是: 
> 1. 将 `call` 指令的一下条指令的地址`(00911F00)`压入栈中
> 2. 然后跳转至 后边的地址`(009111E0)`的代码处

![Call 指令执行](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722155917452.webp)

到此时内存变化: 

![Virtual_variables_creat |large](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722155919728.gif)

> `jmp` 指令: 无条件跳转至 后边的地址处
> 即在此指令中, 跳转至`00911A40` 处

执行 `jmp` : 

![jmp Add |inline](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722155929749.webp)

执行 `jmp` 之后, 进入 `Add 函数`, 会发现一段熟悉的指令, 和进入 `main` 函数时的前几行指令相似。
这段指令就是 `Add` 函数预开辟栈帧的指令（不再分析）, 直接看图: 
1. 先压栈, 压入的是 维护 `main` 函数栈帧时的`ebp`  : 

    ![Add函数压入维护main的ebp |wide](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722155932127.webp)

2. 连续执行指令, 预创建及处理 `Add` 函数栈帧: 

    ![Add_函数栈帧创建 |wide](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722155934034.webp)

![Add_SF_Create |large](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722155937517.gif)

以上是 `Add` 函数栈帧的创建过程。


## 被调用函数形参的使用

自定义的 `Add` 函数, 目的是求两个`int` 类型整数的和, 返回值也是 `int` 类型。

观察、对比汇编代码: 

> ![|wide](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722155949469.webp)
>
> 1. `z` , 是在 `Add` 函数栈帧内创建的局部变量, 对应的地址是 `ebp-8`, 即从 `ebp(此时维护Add栈帧的栈底指针)` 向低地址偏移 `8 字节`, 发现在 `Add` 栈帧内部。
>
>     ![ |wide](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722155951401.webp)
>
> 2. `x`、`y` 分别对应 : `ebp+8` 、`ebp+0Ch`
>     即从 `ebp` 向高地址偏移 `8 字节` 和 `12 字节`, 很明显不在 `Add` 函数栈帧内, 究竟在哪？
>     
>     ![ |wide](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722155953632.webp)
>     
>     分析之后发现, `Add` 函数调用的形参 其实就是之前(即将进入`Add`函数时), 执行这一段代码时压栈的内容: 
>     
>     > ```
>     > mov        eax,dword ptr [ebp-14h]
>     > push       eax
>     > mov        ecx,dword ptr [ebp-8]
>     > push       ecx
>     > ```
>     >
>     > 将 `ebp-14h` 地址处的双字的值（即变量 `b` 的值）存入 寄存器 `eax`, 压栈存入 `eax`, 压入位置是: `0x00AFF894`
>     > 将 `ebp-8` 地址处的双字的值（即变量 `a` 的值）存入 寄存器 `ecx`, 压栈存入 `ecx`, 压入位置是: `0x00AFF890`
>
> 3. 所以
>
>     `函数的形参其实早在main函数栈帧中就已经创建好并且存储在一个位置, 并不是进入函数才创建的, 函数要使用形参直接在存储的那个地址拿就可以了, 这就是 在函数中改变形参不会影响原变量 的原因`

观察过后, 执行相加的语句: 

![](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722155956927.webp)

相加操作完成

但是需要将相加的结果作为返回值返回, 并且重新回到`main` 函数中, 这个函数才算执行结束.

返回操作具体是如何进行的呢？

##  函数返回
函数返回并没有看上去那么简单: 

![|medium](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722160000257.webp)

`return z;` 语句之后, 其实都是函数返回需要进行的操作。

1. 首先是, `return z;`

    返回值操作是, `mov  eax,dword ptr [ebp-8]`

    将 `ebp-8(z)` 处的两字`(4字节)` 的值存入 寄存器 `eax`

    返回 `z` 的操作, 其实就是将 `z` 的值, 存入了寄存器中。

    当函数使用完后, 局部变量会被销毁, 但是寄存器在CPU中是不会被销毁的。

    所以将 局部变量 `z` 的值 存放在寄存器中, 就能达到返回 `z` 的值 的效果

    ![return_z  |wide](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722160002360.webp)

2. 再按顺序将:

   在进入 `Add` 函数后 压栈的 `edi`, `esi`, `ebx` 三个内容退栈

   ![pop_edi_esi_ebx |wide](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722160005051.webp)

3. 然后将 `ebp` 的值 给 `esp`, 当 `esp` 的值变为 `ebp` 的值的时候, `Add` 函数栈帧的维护就结束了。`Add` 函数栈帧的空间就会还给内存

    ![|wide](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722160007521.webp)

4. 再然后就是 `pop   ebp`

    `pop  ebp`  与 一般 `pop` 其他内容不同, `pop ebp` 还会将这里需要弹出的 `ebp` 的值 给 寄存器 `ebp`

    ![pop_ebp |wide](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722160009564.webp)

    此时, `esp` 和 `ebp` 两个维护栈帧的寄存器, 就又去维护 `main` 函数栈帧了。

    这整个过程的动画

    ![|large](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722160011498.gif)

5. 最后一步就是 `ret` 指令

    当 `Add` 函数使用结束之后, 汇编代码应该继续回到 `main` 函数中的 `call` 指令的下一条语句的地方: 

    即这里: 

    ![return 应该回到的位置 |medium](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722160028552.webp)

    那么怎么才能回到这里呢？

    回想一下, 在 `esp` 和 `ebp` 重新维护`main` 函数栈帧的时候, `esp` 指向的地址, 其实就是之前 `call` 指令执行时, 压栈压入的`call` 指令的下一条指令的地址:

    ![ret的地址 |wide](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722160030401.webp)

    `ret` 指令执行之后, 会直接把这个空间弹出栈, 然后返回到这个空间存放的地址的指令处: 

    ![ret |large](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722160032247.gif)

    ![|wide](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722160037863.webp)

    这些步骤执行之后, 逻辑成功从 `Add` 函数中返回到 `main` 函数中。

    继续执行代码: 

    `add  esp,8`:

    ![esp+8 |wide](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722160043185.webp)

    `mov dword ptr [ebp-20h],eax`:

    ![ |wide](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722160039765.webp)

    ![esp+8-movC |large](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722160050980.gif)
    
    

代码走到这里, 函数栈帧的大部分内容都已经讲的很清楚了。本篇文章到这里也就结束了。

---

# 结束

再回过头来看文章开头的问题: 
1. 什么是函数栈帧？

2. 程序中的局部变量, 是如何创建的？
3. 为什么局部变量不初始化会是随机值？
4. 函数传参, 究竟是如何传参的？
5. 函数的形参和实参存在什么关系？
6. 函数是如何被调用的？
7. 函数被调用之后是如何返回的？

如果读懂了本篇文章, 对于这些问题应该是有一个清晰明确的理解的。
希望可以帮到大家。

---

这篇文章, 是提升自我修养篇的第一篇文章。
文章的内容主要来源于 `《程序员的自我修养----“链接、装载与库”》` 以及 博主自己的调试与总结。

感谢！！！
（画图真的耗时间）



