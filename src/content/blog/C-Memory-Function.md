---
draft: true
title: "[C语言] 内存函数介绍与模拟实现"
pubDate: "2022-02-16"
description: "memcpy、memmove……"
image: https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/202306251812215.webp
categories:
    - Blogs
tags:
    - C语言
    - 内存管理
---

# 内存函数

## 1.`memcpy`

```cpp
void * memcpy( void* destination, const void* source, size_t num);
```

作用: `strcpy` 是用来拷贝字符串的, `memcpy` 也可以逐字节拷贝其他类型的数据(C语言要求其处理内存空间地址不重叠的数据)(PS: VS中 已经将其优化得可以处理内存空间地址重叠的数据)

模拟实现`memcpy`

```cpp
void* myMemcpy(void* dest, const void* src, size_t num) {
    void* ret = dest;
    assert(dest && src);
    
    while(num--) {
        *(char*)dest = *(char*)src;
        dest = (char*)dest + 1;	//上边强制类型转换解引用后, dest 的类型依旧是 void*, 无法直接加加, 所以依旧需要强制类型转换
        src = (char*)src + 1;
    }
    
    return ret; //有返回类型, 必须返回一个值(可忽略此返回值)
}
```

## 2.`memmove`

```cpp
void * memmove ( void * destination, const void * source, size_t num );
```

作用: 同`memcpy`一样, `memmove` 也可以逐字节拷贝其他类型的数据(C语言要求其处理内存空间地址重叠的数据)

模拟实现`memmove`

```cpp
void* myMemmove(void* dest, const void* src, size_t num) {
    void* ret = dest;
    assert(dest && src);
    
    if(dest < src) {
    	// 从前向后拷贝
        while(num--) {
        	*(char*)dest = *(char*)src;
        	dest = (char*)dest + 1;	//上边强制类型转换解引用后, dest 的类型依旧是 void*, 无法直接加加, 所以依旧需要强制类型转换
        	src = (char*)src + 1;
    	}
    }
    else {
        // 从后向前拷贝
        while(num--)
        	*((char*)dest+num) = *((char*)src+num);
    }
    
    return ret; //有返回类型, 必须返回一个值(可忽略此返回值)
}
```

## 3. `memcmp`

```cpp
int myMemcmp ( const void * ptr1, const void * ptr2, size_t num )
```

作用: `strcmp` 是用来比较字符串的, `memcmp` 也可以逐字节比较其他类型的数据

## 4. `memset`

```cpp
void *myMemset( void *dest, int c, size_t num) {
}
```

作用: 将数组前 `num` 字节, 每个字节赋值为 `c`

---------------------

