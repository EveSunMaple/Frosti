---
draft: true
title: '[C语言] 字符串函数的相关介绍与模拟实现'
pubDate: '2022-02-09'
description: 'C语言中使用最频繁的字符串操作函数'
image: https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/202306251811474.webp
categories:
    - Blogs
tags:
    - C语言
---

# 字符串函数

## `strlen`

```cpp
size_t strlen(const char* str );
```

作用: 

​	求字符串中`'\0'`前的字符串的长度

要求: 

​	字符串必须以`'\0'` 结束

```cpp
/* 可创建临时变量 */
int my_strlen(const char* str) {
    assert(str);
    int count = 0;
    
    while(*str++)
  		count++;
    
    return count;
}

/* 不可创建临时变量 (递归)*/
int my_strlen(const char* str) {
	if(!(*str))
		return 0;
	else
		return 1+my_strlen(str+1);
}

/* 指针相减 */
int my_strlen(char* str) {
	char *pstr = str;
	while(*pstr)
		pstr++;
    
	return pstr-str;
}
```

标准库中, `strlen()`的返回值类型是`size_t`, 也就是`unsigned int`无符号整型

在使用函数的时候, 如果没有注意到, 就可能写出下面这样的代码: 

> ```cpp
> #include <stdio.h>
> #include <string.h>
> 
> int main() {
> 	if(strlen("asd") - strlen("asdasd") > 0)
>       printf(">\n");
>   else
>       printf("<=\n");
> 
> 	return 0;
> }
> ```
>
> 这段代码最终输出的是`>` 
>
> 因为两个无符号整型相减, 结果肯定也是无符号整型, 所以结果肯定是大于`0`的

模拟实现的`my_strlen()`返回值是`int`类型, 不会出现如果不小心写出错误的代码的问题

## `strcpy`

```cpp
char* strcpy(char* dest, const char* src);
```

作用: 

​	将`src`字符串中的内容, 包括`'\0'`, 拷贝至`dest`字符串中

要求: 

​	`src`中必须存在 `'\0'`, `dest`空间必须足够大且可修改, 即不被 `const` 修饰

```cpp
char* my_strcpy(char* dest, const char* src) {
    char* ret = dest;
    assert(dest && src);
    
    while(*dest++ = *scr++)
        ;
    
    return ret;
}
```

## `strcat`

```cpp
char* strcat(char* dest, const char* src);
```

作用: 

​	将 字符串`src`的内容, 追加到字符串`dest`后

要求: 

​	字符串`src`必须以`'\0'`结束；`dest`指向空间足够大且可修改

```cpp
char* my_strcat(char* dest, const char* src) {
    char* ret = dest;
    assert(dest && src);
    
    while(*dest) {
        // 注意: 循环里的"++" 不能放入循环条件里: 
        // 若放至 dest 后, 会跳过原 dest 中的 '\0'；若放至 dest 前, 如果 dest 首字符为'\0'也会被跳过
        dest++;
    }

    while(*dest++ = *src++)
        ;
  	
    return ret;
}
```

## `strcmp`

```cpp
int strcmp(const char* str1, const char* str2);
```

作用: 

​	比较两个字符串, 对应位置上字符的大小

> `str1 > str2`:	返回一个正数
>
> `str1 < str2`:	返回一个负数
>
> `str1 == str2`:	返回零

```cpp
int my_strcmp(const char* str1, const char* str2) {
    assert(str1 && str2);
    
    while(*str1 == *str2) {
        if(*str1 == '\0')
            return 0;
        
        str1++;
        str2++;
    }
    
    return *str1 - *str2;
}
```

## `strncpy`

```cpp
/* 受长度限制的字符串拷贝函数 */
char* strncat(char* dest, const char* src, size_t num);
```

作用: 

​	将 字符串`src`中的前`num`个字符, 拷贝到 字符串`dest`中

​	如果`num`大于 字符串`src`的长度, 多出的部分均存入`'\0'`

```cpp
char* my_strncpy(char* dest, const char* src, size_t num) {
    char* ret = dest;
    assert(dest && src);
    
    while (num > 0 && *src != '\0') {
        *dest++ = *src++;
        num--;
    }

    // 若 n 未耗尽, 用 '\0' 填充剩余空间
    while (num > 0) {
        *dest++ = '\0';
        num--;
    }
    
    return ret;
}
```

## `strncat`

```cpp
/* 受长度限制的字符串追加函数 */
char* strncat(char* dest, const char* src, size_t num);
```

作用: 

​	将 字符串`src`中的前`num`个字符, 追加到 字符串`dest`后(从第一个`'\0'`开始算), 并在末尾放入`'\0'`

​	如果`num`大于 字符串`src`的长度, 则只追加已有的`src`字符串及末尾的`'\0'`


```cpp
char* my_strncat(char* dest, const char* src, size_t num) {
    char* ret = dest;
    assert(dest && src);
    
    while(*dest) {
        // 注意: "++" 不能放入循环条件里
        // 若放至 dest 后, 会跳过原 dest 中的 '\0'；若放至 dest 前, 如果 dest 首字符为'\0'也会被跳过
        dest++;
    }
    // dest 指向dest的'\0'位置

    while (num > 0 && *src != '\0') {
        *dest++ = *src++;
        num--;
    }

    *dest = '\0';
    
    return ret;
}
```

## `strncmp`

```cpp
/* 受长度限制的字符串比较函数 */
int strncmp(const char* str1, const char* str2, size_t num);
```

作用:

​	比较 字符串`str2`和`str1`对应的前`num`个字符的大小

```cpp
int my_strncmp(const char* str1, const char* str2, size_t num) {
    assert(str1 && str2);
    
    while(num > 0 && *str1 == *str2) {
        if(*str1 == '\0')
            return 0;
        
        str1++;
        str2++;
        num--;
    }
    
    return *str1 - *str2;
}
```

## `strstr`

```cpp
char* strstr(const char* string, const char* substr);
```

作用: 

​	在 字符串`string`中, 查找第一个`substr`字符串；若`substr`指向长度为零的字符串(即, `substr`为空), 则返回原字符串, 没找到返回空指针, 找到了返回找到的字符串的首字符地址


模拟实现 `strstr()`

```cpp
char* my_strstr(const char* str, const char* substr) {
    assert(str && substr);
    
    if(*substr == '\0')
        return str;
    
    char* flag = (char*)str;	// 记录本次查找的起始地址
    char* str1;
    char* str2;					// 记录 查找的字符串
    
    while(*flag) {
        str1 = flag;			// 因本次查找中 起始位置需要一直知道, 所以将 flag 存入另一个指针变量
        str2 = (char*)substr;	// 每次循环从 查找字符串的首字符开始查找
        while(*st1 && *str2 && (*str1 == str2)) {
            // 此循环做对比, str1与str2指向的字符都不为'\0', 且相等时, 继续查找下一个字符, str2指向的字符为'\0'时, 查找成功
            str1++;
            str2++;
        }
        
        if(*str2 == '\0')
            return flag;
        
        flag++;
	}
    
    return NULL;
}
```

## `strtok`

```cpp
char* strtok(char * str, const char * sep);
```

作用: 
    
​	将字符串分割成一个个片段(自己设定分隔符)

- `sep`参数是个字符串, 定义了用作分隔符的字符集合第一个参数指定一个字符串, 它包含了0个或者多个由`sep`字符串中一个或者多个分隔符分割的标记

- `strtok`函数找到`str`中的下一个标记, 并将其用`\0`结尾, 返回一个指向这个标记的指针
(注: `strtok`函数会改变被操作的字符串, 所以在使用`strtok`函数切分的字符串一般都是临时拷贝的内容并且可修改)

- `strtok`函数的第一个参数不为`NULL`, 函数将找到`str`中第一个标记, `strtok`函数将保存它在字符串中的位置

- `strtok`函数的第一个参数为`NULL`, 函数将在同一个字符串中被保存的位置开始, 查找下一个标记。如果字符串中不存在更多的标记, 则返回`NULL`指针

  >即:
  >
  > 1. `strtok`函数在使用的时候, 因为会改变参数, 所以第一个参数需要是目标参数的临时拷贝
  >
  > 2. `strtok`函数在找第一个标记的时候, 函数的第一个参数不是`NULL`
  >
  > 3. `strtok`函数在找非第一个标记的时候, 函数的第一个参数不是`NULL`
  >
  > 例: 
  >
  > ```cpp
  > int main() {
  >     const char* p = "@.";
  >     char arr[] = "dxyt2002@humid1ch.cn";
  >     char arr_copy[50] = { 0 };
  > 
  >     strcpy(arr_copy, arr);
  >     char* str = NULL;
  >     for(str = strtok(buf, p); str != NULL; str = strtok(NULL, p)) {
  >         printf("%s\n", str);
  >     }
  > 
  >     return 0;
  > }
  > ```

## `strerror`

```cpp
char* strerror(int errnum);
```

作用: 

​	返回错误码, 所对应的错误信息

> ```cpp
> int main() {
>     int i = 0;
>     for(int i = 0; i < 10; i++)
>         printf(" %s\n", strerror(i));
>     
>     return 0;
> }
> // 此段代码可测试输出各错误码表示的错误信息
> ```
>
> 实际操作: 
>
> 在执行某些操作时, 可能会遇到一些错误, 这时候就需要到这个函数了
>
> 例如: C语言操作文件时, 遇到错误时
>
> ```cpp
> // fopen 函数可以操作文件(返回值, 参数, 头文件等具体问题, 看MSDN)
> // 当库函数使用错误时, 会将 errno(C语言提供的全局变量,可直接使用, 需要头文件 errno.h) 赋值为此次库函数使用错误时的错误码
> #include <errno.h>
>
> int main() {//打开文件
>     FILE* pf = fopen("humid1ch.txt", "r");
>     if(NULL == pf) {
>         printf("%s\n", strerror(errno));
>         return 0;
>     }
>    
>    // 关闭文件
>    fclose(pf);
>    pf = NULL;
>    
>    return 0;
> }
> ```

## 字符分类、字符转换函数

| 字符分类函数 |               如果他的参数符合下列条件就返回真               |
| :----------: | :----------------------------------------------------------: |
|  `iscntrl `  |                         任何控制字符                         |
|  `isspace `  | 空白字符: 空格`' '`, 换页`'\f'`, 换行`'\n'`, 回车`'\r'`, 制表符`'\t'`或者垂直制表符 `'\v'` |
|  `isdigit `  |                        十进制数字 0~9                        |
| `isxdigit `  | 十六进制数字, 包括所有十进制数字, 小写字母`a~f`, 大写字母`A~F` |
|  `islower `  |                        小写字母`a~z`                         |
|  `isupper `  |                        大写字母`A~Z`                         |
|  `isalpha `  |                       字母`a~z`或`A~Z`                       |
|  `isalnum `  |               字母或者数字, `a~z`,`A~Z`,`0~9`                |
|  `ispunct `  |     标点符号, 任何不属于数字或者字母的图形字符（可打印）     |
|  `isgraph `  |                         任何图形字符                         |
|  `isprint `  |            任何可打印字符, 包括图形字符和空白字符            |

| 字符转换函数 |        作用        |
| :----------: | :------------------------: |
|  `tolower`   | 大写字母转小写字母 |
|  `toupper`   | 小写字母转大写字母 |
