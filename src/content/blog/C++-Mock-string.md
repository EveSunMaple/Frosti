---
draft: true
title: "[C++] string类的模拟实现"
pubDate: "2022-07-04"
description: "本篇文章着重 模拟实现 string类 及其各接口"
image: https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/202306251814025.webp
categories:
    - Blogs
tags:
    - STL
    - 容器
---

# string类 模拟实现

上篇文章中介绍了 C++的 string类 及 string类的接口

本篇文章着重 模拟实现 string类 及其各接口

## string类的结构

string类 实质上其实就是一个提供了许多功能接口的字符串

但是 string类 除了字符串之外, 类中还提供了 表示字符串大小和容量的变量

所以 string类的结构应该是: 

```cpp
class string {
private:
    char* _str;				// 字符串
    size_t _size;			// 字符串实际长度
    size_t _capacity;		 // 字符串指针表示的字符串的容量
};
```

## 构造函数

string类 的构造函数需要实现的功能有: 

1. 默认实例化 空string
2. 使用 C字符串 实例化string
3. 使用其他string对象 实例化 新的string对象

`默认构造函数`可以实现前两个功能, `拷贝构造函数`则用于实现第三个功能

### 默认构造函数

> string 的默认构造函数 首先需要实现 实例化 `空string` 时的初始化设置
>
> ```cpp
> string() 
>        : _size(0)
>        , _capacity(0);
> {
>        _str = new char[1];
>        _str[0] = '\0';
> }
> ```
>
> 首先 字符串要提供扩容的功能, 所以字符串需要 `满足动态管理`, 所以 实例化空string类时 需要new char[1] 并将字符串唯一一个空间设置为‘\0’ 表示字符串为空
>
> 若要实现 使用C字符串 实例化string
>
> ```cpp
> string(const char* str) 
>        : _size(strlen(str))
>        , _capacity(_size)
> {
>         _str = new char[_capacity + 1];
>         strcpy(_str, str);
> }
> ```
>
> 使用了 `字符串函数 来进行字符串的拷贝`
>
> 不过 这两个构造函数可以合并在一起由 一个构造函数来实现: 
>
> ```cpp
> string(const char* str = "")
>        : _size(strlen(str))
>        , _capacity(_size)
> {
>            _str = new char[_capacity + 1];
>            strcpy(_str, str);
> }
> ```

### 拷贝构造函数

拷贝构造函数 需要实现用 旧string对象 实例化 新string对象

一般来说 手动实现的拷贝构造函数 提供`深拷贝`功能

> ```cpp
> string(const string& s)
>        : _size(s._size)
>        , _capacity(s._capacity)
> {
>         _str = new char[_capacity + 1];
>         strcpy(_str, s._str);
> }
> ```
>
> 这是传统的 拷贝构造函数的实现方法
>
> 拷贝构造函数的实现还有更加便捷的实现: 
>
> ```cpp
> void swap(string& s) {
>        std::swap(_str, s._str);
>        std::swap(_size, s._size);
>        std::swap(_capacity, s._capacity);
> }
> string(const string& s) {
>        string tmp(s._str);
>        swap(tmp);
> }
> ```
>
> 这种拷贝构造函数的写法, 其实是 `调用了 字符串实例化string类的构造函数, 然后使用swap函数将临时string对象的内容与 新string类内容做交换`
>
> 就完成了拷贝构造函数, 此种实现拷贝构造函数的方法被称为`现代方法`

所以 模拟string类的构造函数相关代码: 

```cpp
class string {
public:
    // 默认构造函数
    string(const char* str = "") 
        : _size(strlen(str))
        , _capacity(_size)
    {
        _str = new char[_capacity + 1];
        strcpy(_str, str);
    }
    // 拷贝构造函数
    // 传统
    string(const string& s)
        : _size(s._size)
        , _capacity(s._capacity)
    {
        _str = new char[_capacity + 1];
        strcpy(_str, s._str);
    }
    // 现代
    void swap(string& s) {
        std::swap(_str, s._str);
        std::swap(_size, s._size);
        std::swap(_capacity, s._capacity);
    }
    string(const string& s) {
        string tmp(s._str);
        swap(tmp);
    }
    
private:
    char* _str;				// 字符串
    size_t _size;			// 字符串实际长度
    size_t _capacity;		 // 字符串指针表示的字符串的容量
};
```

## 赋值重载函数

赋值重载函数的作用 是将 `一个string对象 赋值给 另一个string对象`

赋值重载函数需要实现什么功能？

1. 禁止 `自我赋值`
2. 实现 被赋值的对象的 `内容, _size, _capacity` 均被赋值
3. 实现 `连续赋值`

所以 赋值重载函数相关代码可以为: 

```cpp
string& operator=(const string& s) {			// string&返回值 可以实现连续赋值
    if (this != &s) {					// 对比 s 与 自己的地址, 禁止自我赋值
        char* tmps = new char[s._capacity + 1];
        strcpy(tmps, s._str);
        delete[] _str;
        _str = tmps;
        _size = s._size;
        _capacity = s._capacity;
    }
    
    return *this;			// 返回当前对象的地址
}
```

> 赋值重载函数, 最好禁止自我赋值
>
> 如果不禁止 自我赋值, 则 `delete[] _str;` 必须放在 `strcpy(tmps, s._str);` 之后
>
> 因为 如果不禁止自我赋值, s对象 即为 自己, 如果 先执行`delete[] _str;` 那么 后边的 `strcpy(tmps, s._str);` 就会将 随机值拷贝到`tmps`中, 因为 `s._str` 已经被`delete[]` 了

不过这只是传统的写法

与 拷贝构造函数一样, 赋值重载函数也存在现代写法: 

```cpp
string& operator=(const string& s) {
    if (this != &s) {					// 依旧禁止自我赋值
        string tmpStr(s._str);				// 使用s的内容 实例化对象
        swap(tmpStr);					   // 交换临时对象与本对象的内容
    }
    
    return *this;
}
```

不过 除此之外, 还存在更简单的现代写法: 

```cpp
string& operator=(string s) {
    swap(s);
    
    return *this;
}
```

此方法 正好利用了 `类的传值传参会生成临时对象的特点`

直接将 本对象与临时对象的内容交换, 就可以直接完成赋值, 且不用考虑自我赋值的情况, 因为 传值传参生成的是临时对象

所以 模拟string类的赋值重载函数 代码如下: 

```cpp
class string {
public:
    // 赋值重载 传统写法
    string& operator=(const string& s) {			// string&返回值 可以实现连续赋值
        if (this != &s) {					// 对比 s 与 自己的地址, 禁止自我赋值
            char* tmps = new char[s._capacity + 1];
            strcpy(tmps, s._str);
            delete[] _str;
            _str = tmps;
            _size = s._size;
            _capacity = s._capacity;
        }
    
        return *this;			// 返回当前对象的地址
    }
    // 现代写法1: 
    string& operator=(const string& s) {
        if (this != &s) {					// 依旧禁止自我赋值
            string tmpStr(s._str);				// 使用s的内容 实例化对象
            swap(tmpStr);					   // 交换临时对象与本对象的内容
        }
    
        return *this;
    }
    // 现代写法2: 
    string& operator=(string s) {
        swap(s);
    
        return *this;
    }
    
private:
    char* _str;				// 字符串
    size_t _size;			// 字符串实际长度
    size_t _capacity;		 // 字符串指针表示的字符串的容量
};
```

## 迭代器

上一篇文章中介绍过, string的迭代器实际上就是 char* 类型的指针, 也就是说 string中的迭代器其实就是 `指向字符串某位置的指针`

所以 string关于迭代器的代码: 

```cpp
class string {
public:
    typedef char* iterator;						// 迭代器
    typedef const char* const_iterator;			  // const迭代器
    
    iterator begin() {
        return _str;						   // begin返回字符串首位置迭代器
    }
    
    iterator end() {
        return _str + _size;					// end 返回字符串末位置(字符串的最后一个有效字符的下一个位置)迭代器
    }
    
    const_iterator begin() const {
        return _str;
    }
    
    const_iterator end() const {
        return _str;
    }
    
private:
    char* _str;				// 字符串
    size_t _size;			// 字符串实际长度
    size_t _capacity;		 // 字符串指针表示的字符串的容量
};
```

## resize 和 reserve

string类中有两个非常重要的接口函数, 就是: reserve 和 resize

> **`reserve`** 需要实现的是: 
>
> 1. 指定大小扩容
> 2. 不能缩容
> 3. 不能改变string对象的_size, 只改变 _capacity, 即不对扩容的空间进行填充
>
> 如何实现呢？
>
> > C语言中 realloc 可以直接在 malloc出来的空间的基础上直接扩容
> >
> > 但是 在C++ 中, `由于 realloc的实现过于复杂, C++的new 取消了realloc的思路`
> >
> > 所以 这里的扩容, 不能用 realloc
> >
> > C++ 中对于扩容, `通常直接 new一块新空间来代替原空间`
>
> 所以 reserve的实现 相关代码可以为: 
>
> ```cpp
> void reserve(size_t n) {
> 	if(n > _capacity) {				// n 比原空间大才执行操作
> 		char* tmps = new char[n + 1];
> 		strcpy(tmps, _str);
> 		delete[] _str;				// 释放原字符串所在的堆空间
>         
> 		_str = tmps;
> 		_capacity = n;				// 更改 string对象的_capacity 为n
> 	}
> }
> ```

> **`resize`** 则需要实现的是: 
>
> 1. n < _size 时, 直接截断字符串, 不改变 _capacity
> 2. n > _size, 但是 n < _capacity 时, 从 _size 到 n-1 填充指定字符
> 3. n > _caapcity, 则 扩容, 并填充
>
> 则 resize相关代码可以为: 
>
> ```cpp
> void resize(size_t n, char ch = '\0') {				// 第二个参数是指定字符
> 	if (n < _size) {
> 		// 截断字符串
> 		_size = n;
> 		_str[n] = '\0';
> 	}
> 	else {
> 		if (n > _capacity) {
> 			// 需要扩容
> 			reserve(n);
> 		}
>         
> 		for (size_t i = _size; i < n; i++) {
> 			_str[i] = ch;					// 填充字符操作
> 		}
> 		_size = n;
> 		_str[n] = '\0';
> 	}		
> }
> ```

## 插入字符: push_back、append、insert、+=的重载

> ### `push_back`
>
> `push_back` 的作用是 在字符串后插入新的字符, 如果容量不够则需要扩容
>
> ```cpp
> void push_back(char ch) {
>    	if (_size == _capacity) {
>    		reserve(_capacity == 0 ? 4 : _capacity*2);				// 两倍扩容
>    	}
>     
>     	_str[_size] = ch;							// 在 size位置插入新字符
>     	_size++;
>     	_str[_size] = '\0';							// 结尾放 '\0'
> }
> ```

> ### `append`
>
> `append` 的作用是在 字符串后插入一个字符串
>
> > 但是 append 通常不使用, 因为 存在+=
>
> ```cpp
> void append(const char* str) {
>     size_t len = strlen(str);
>     if (_size + len > _capacity) {
>         reserve(_capacity == 0 ? len : _capacity + len);
>     }
>     
>     strcpy(_str + _size, str);				// 从字符串末尾处拷贝 str
>     _size += len;
> }
> ```

> ### `insert`
>
> `insert` 需要提供的功能就多了: 
>
> 1. 指定位置插入字符
> 2. 指定位置插入字符串
> 3. 指定位置插入string对象
>
> insert提供的功能是 `指定位置`, 既然指定了位置, 那么就需要考虑 `向后挪动字符`的操作
>
> `插入字符`
>
> ```cpp
> string& insert(size_t pos, char ch) {
> 	assert(pos <= _size);		// pos位置 需要合法
> 
> 	if (_size == _capacity) {
> 		reserve(_capacity == 0 ? 4 : _capacity * 2);
> 	}
> 
> 	size_t end = _size + 1;
> 	// 1. end位置在 _size+1, 挪动数据的步骤就是将 end-1 位置的数据一个一个挪至end
> 	// 2. 如果 end位置在 _size, 则挪动数据的步骤是将 end位置的数据 挪至 end+1
> 	// (两种方法 从 '\0' 开始挪动)
> 	// 表面看 两种方法好像都一样, 但是 如果end的初始位置是_size, 需要额外处理 pos位置为0的情况
> 	// 因为 当pos位置为零时, 方案二 end的结束位置应该在 -1, 但是 end是 size_t 类型的数据, 所以end永远不会为-1, 即会死循环
> 	// 而 方案一 不会有这种情况, 方案一 如果 pos为0, 循环结束时 end == pos, 会退出循环
> 	while (end > pos) {
> 		_str[end] = _str[end - 1];
> 		end--;
> 	}
> 	_str[pos] = ch;
> 	_size++;
> 
> 	return *this;
> }
> ```
> 
> `插入字符串`
> 
>```cpp
> string& insert(size_t pos, const char* str) {
>	assert(pos <= _size);
> 
> 	size_t len = strlen(str);
> 	if (_size + len > _capacity) {
> 		reserve(_capacity == 0 ? len : _capacity + len);
> 	}
> 
> 	size_t end = _size + len;
> 	while (end > pos + len - 1)	{	// 可以画图判断一下end结束位置 
> 		_str[end] = _str[end - len];
> 		end--;
> 	}
> 	strncpy(_str + pos, str, len);		// 使用strncpy 可以防止字符串的'\0' 也被拷贝进去
> 	_size += len;
> 
> 	return *this;
> }
> ```
> 
> `插入对象`
> 
> ```cpp
> string& insert(size_t pos, const string& s) {
> 	assert(pos <= _size);
>
> 	insert(pos, s._str);				// 直接调用 插入字符串
>
> 	return *this;
> }
> ```

> ### `+=的重载`
>
> `+=` 操作是string尾插字符(串) 最常用的操作
>
> `+=` 操作 需要实现 尾插字符、字符串、对象的操作, 并且需要支持 连续`+=`
>
> 不过 在实现过上面的几种插入操作之后, `+=重载`的实现 可以直接复用上面的接口
>
> ```cpp
> string& operator+=(const string& s) {
> 	insert(_size, s);		// += 对象复用 insert
> 	return *this;
> }
> string& operator+=(const char* str) {
> 	append(str);			// += 字符串复用 append
> 	return *this;
> }
> string& operator+=(char ch) {
> 	push_back(ch);		// += 字符 复用 push_back
> 	return *this;
> }
> ```

## 删除字符 erase

string 类提供的 erase操作, 有 删除 指定两位置之间的字符

所以 erase的相关代码可以为: 

```cpp
string& earse(size_t pos, size_t len = npos) {
	assert(pos < _size);
			
	// 当从pos位置向后删除的长度大于 字符串长度时, 不用考虑挪动数据 直接修改 _size 和 结尾符 '\0'
	if (len == npos || pos + len >= _size) {
		_str[pos] = '\0';
		_size = pos;
	}
	else {
		size_t begin = pos + len;
		// 挪动数据
		while (begin <= _size) {
			_str[begin - len] = _str[begin];
			begin++;
		}
		_size -= len;
	}

	return *this;
}
```

## find

string提供的 `find` 有四个重载类型

这里只简单实现两个 重载类型: 查找字符、查找字符串

> 查找字符: 
>
> ```cpp
> size_t find(char ch, size_t pos = 0) {
> 	assert(pos < _size);
> 
> 	for (; pos < _size; pos++) {
> 		if (_str[pos] = ch)
> 			return pos;
> 	}
> 
> 	return npos;
> }
> ```
> 
> 首先要判断 指定的位置存在
>
> 然后向后一一对比就可以了

> 查找字符串: 
>
> ```cpp
> size_t find(const char* str, size_t pos = 0) {
> 	assert(pos < _size);
> 
> 	//直接用strstr()找字符串的地址, 找到就返回字符串首字符的地址, 找不到就返回空指针
> 	// 找到的话  找到的str的地址 - 原字符串的地址 就是字符串首字符的在string中的位置
> 	const char* ps = strstr(_str + pos, str);
> 	if (ps != nullptr) {
> 		return ps - _str;
> 	}
> 
> 	return npos;
> }
> ```
> 
> 使用 strstr这个字符串接口找, 比较快

## 比较运算符的重载

比较运算符的操作数 有两个

所以 不能在 string类内重载比较运算符, 因为类内定义的函数 默认有一个 this指针作为第一个参数, 如果在类内重载比较运算符就不能正常调用 比较运算符

所以需要在类外 定义比较运算符

```cpp
// 实现 > 和 == 都用strcmp来对字符串作比较
bool operator>(const string& s1, const string& s2) {
	return strcmp(s1.c_str(), s2.c_str()) > 0;
}
bool operator==(const string& s1, const string& s2) {
	return strcmp(s1.c_str(), s2.c_str()) == 0;
}
bool operator>=(const string& s1, const string& s2) {
	return s1 > s2 || s1 == s2;
}
bool operator<(const string& s1, const string& s2) {
	return !(s1 >= s2);
}
bool operator<=(const string& s1, const string& s2) {
	return s1 < s2 || s1 == s2;
}
bool operator!=(const string& s1, const string& s2) {
	return !(s1 == s2);
}
```

## 流插入 和 流提取 的重载

流插入操作符是 `<<`, 作用是向流中插入数据, 常用于 输出

流提取操作符是 `>>`, 作用是从流中提取数据, 常用于 输入 

这两个操作符原本叫 `>>右移操作符` `<<左移操作符`, 当这两个操作符与 流对象结合使用就变成了 流操作符

> cout 和 cin 就是流对象

### << 流插入重载

流插入重载用于输出, 而C++`输出的数据 是 >> 的右操作符`, `流对象是左操作符`, 语句结构就像这样: cout << string;

所以 << 重载的第一个参数需要是 流对象, 所以需要在类外定义: 

```cpp
ostream& operator<<(ostream& out, const string& s) {
	// 其实就是string类的字符串遍历
	// 三种方法使用哪种方法都行
	// 下面使用 范围for 比较简单 (使用之前需要实现 迭代器)
	for (auto ch : s)
	{
		out << ch;
	}

	return out;
}
```

`ostream&` 就是`输出流类`

### >> 流提取重载

与 << 流插入操作符的重载相似, 不过要将流换为输入流, 并且实现的功能应该是 对string实现输入操作

在模拟实现 cin >> string 之前, 要先了解 库中 cin>>string 的效果是什么

> C++库中 string 类的 `cin` 效果是 **`完全将原字符串替换为写入的字符串`**
>
> 被替换的还有 `_size`, 且 如果原来的 `_capacity` 不足以容纳输入的字符串, 就扩容；如果足以容纳, 则 `_capacity` 不变
>
> 并且 `cin >>` 的操作 会以 `' '` 和 '`\n'` 为结束标志

所以 模拟实现string输入 的具体操作就是:

1. `先清除 string 类中的内容`

	> C++库中 string 有 clear()函数 是清楚字符串内容的, 这里需要自己实现

2. 定义一个char变量 来`循环接收输入的字符 并 += 至s字符串中`(字符串已用`clear()`清除, 所以用+=)

	> 注意, 接收输入的字符不能用 `cin>>` 接收, 因为 `cin 也不能接收' ' 和 '\n', 所以会导致无法判断结尾`
	>
	> 这里接收字符 会用到输入流类的一个成员函数 `get() 这个函数接收 单个字符没有限制`

3. 因为 ch的内容要用来判断循环结束, 所以ch第一次接收无法在循环内接收, 所以需要在循环外第一次接收字符

4. 然后设置循环

```cpp
void clear() {
	resize(0);
}

istream& operator>>(istream& in, string& s) {
	char ch;
	s.clear();
	ch = in.get();
	while (ch != ' ' && ch != '\n') {
		s += ch;
		ch = in.get();
	}
	
	return in;
}
```

但是 上面这种输入方式有一个弊端: 

**`如果使用上面那种方法 输入一个很长的字符串, 由于是一个一个字符接收并 += 的, 会造成频繁的扩容, 就会消耗许多资源`**

所以有一种优化版的输入模拟实现方法

**`将输入的字符串先存在一个字符数组中, 字符数组满了再一次性 += 至string字符串中, 如果字符数组未满时, 就已经换行或者接收到了' ' 就直接将当前的字符数组内容 += 至 string字符串中`**

这样 可以有效地优化 当输入一个长字符串时 频繁扩容的消耗

```cpp
istream& operator>>(istream& in, string& s) {
	char ch;
	s.clear();		// 清理string原字符串
	ch = in.get();
	char tmp[128] = { '\0' };		//字符数组内容初始化为 '\0', 大小适合就可以
	size_t i = 0;				   // 用来访问字符数组下标赋值, 以及记录字符数组中字符个数
	while (ch != ' ' && ch != '\n') {
		tmp[i++] = ch;
		if (i == 127) {	
			// 字符数组大小为 128, 看作字符串的话, 可容纳有效字符数就是 127, 因为最后一位'\0'作为结束标志 
			// 字符数组一满, 就将字符数组中的内容 += 至string对象, 然后清空字符数组
			s += tmp;
			memset(tmp, '\0', 128);	// 使用 memset 将字符数组所有空间设置为 '\0' 以防下次 += 会出错
			i = 0;
		}
		ch = in.get();
	}
	s += tmp;		// 循环结束, 再将字符数组中还有的内容 += 至string对象

	return in;
}
```

> 由于这两个重载函数访问了类的私有成员, 且这两个函数又是在类外定义的, 所以需要将其设置为友元函数
>
> ```cpp
> friend istream& operator>>(istream& in, string& s);
> friend istream& operator<<(istream& in, string& s);
> ```

## []重载

`[]` 符号的重载, 需要实现 以此`访问指定位置字符、修改字符` 的功能

所以 `[]` 的重载可以写为: 

```cpp
char& operator[](size_t pos) {
	assert(pos < _size);		// 下标要合法

	return _str[pos];
}
```

还有一个 只读指定位置字符的版本: 

```cpp
const char& operator[](size_t pos) const {
	assert(pos < _size);		// 下标要合法

	return _str[pos];
}
```

## 成员函数补充

除了上述模拟实现的更加重要一些接口函数之外, 还有些稍微重要但是没有难点的的成员函数: 

```cpp
// 析构函数
~string() {
	if (_str) {	// 得先保证 _str 不是空指针
		delete[] _str;
		_str = nullptr;
		_size = _capacity = 0;
	}
}

// size() 返回string有效字符大小
size_t size() const {		// 不修改原对象的尽量加上 const 
	return _size;
}

// capacity() 返回 string 有效字符容量
size_t capacity() const {
	return _capacity;
}

// c_str 返回对象中字符串的 C类指针形式
// 按照库中的类型 const修饰
const char* c_str() const {
	return _str;
}
```

# string模拟实现代码总结

```cpp
class string {
	friend istream& operator>>(istream& in, string& s);
	friend istream& operator<<(istream& in, string& s);
public:
	// 默认构造函数
	string(const char* str = "") 
		: _size(strlen(str))
		, _capacity(_size)
	{
		_str = new char[_capacity + 1];
		strcpy(_str, str);
	}
	// 拷贝构造函数
	// 传统
	/*string(const string& s)
		: _size(s._size)
		, _capacity(s._capacity)
	{
		_str = new char[_capacity + 1];
		strcpy(_str, s._str);
	}*/
    
	// 现代
	void swap(string& s) {
		std::swap(_str, s._str);
		std::swap(_size, s._size);
		std::swap(_capacity, s._capacity);
	}
	string(const string& s) {
		string tmp(s._str);
		swap(tmp);
	}
    
    // 赋值重载 传统写法
    /*string& operator=(const string& s) {			// string&返回值 可以实现连续赋值
		if (this != &s) {					// 对比 s 与 自己的地址, 禁止自我赋值
			char* tmps = new char[s._capacity + 1];
			strcpy(tmps, s._str);
			delete[] _str;
			_str = tmps;
			_size = s._size;
			_capacity = s._capacity;
		}
    
		return *this;			// 返回当前对象的地址
	}
	// 现代写法1: 
	string& operator=(const string& s) {
		if (this != &s) {					// 依旧禁止自我赋值
			string tmpStr(s._str);				// 使用s的内容 实例化对象
			swap(tmpStr);					   // 交换临时对象与本对象的内容
		}
    
		return *this;
	}*/
    
	// 现代写法2: 
	string& operator=(string s) {
		swap(s);

		return *this;
	}
    
	typedef char* iterator;						// 迭代器
	typedef const char* const_iterator;			  // const迭代器
    
	iterator begin() {
		return _str;						   // begin返回字符串首位置迭代器
	}
    
	iterator end() {
		return _str + _size;					// end 返回字符串末位置(字符串的最后一个有效字符的下一个位置)迭代器
	}
    
	const_iterator begin() const {
		return _str;
	}
    
	const_iterator end() const {
		return _str;
	}
    
	void reserve(size_t n) {
		if(n > _capacity) {				// n 比原空间大才执行操作
			char* tmps = new char[n + 1];
			strcpy(tmps, _str);
			delete[] _str;				// 释放原字符串所在的堆空间

			_str = tmps;
			_capacity = n;				// 更改 string对象的_capacity 为n
		}
	}

	void resize(size_t n, char ch = '\0') {				// 第二个参数是指定字符
		if (n < _size) {
			// 截断字符串
			_size = n;
			_str[n] = '\0';
		}
		else {
			if (n > _capacity) {
				// 需要扩容
				reserve(n);
			}	

			for (size_t i = _size; i < n; i++) {
				_str[i] = ch;					// 填充字符操作
			}
			_size = n;
			_str[n] = '\0';
		}		
	}
    
     // 尾插字符
	void push_back(char ch) {
		if (_size == _capacity) {
			reserve(_capacity == 0 ? 4 : _capacity*2);				// 两倍扩容
		}
	
		_str[_size] = ch;							// 在 size位置插入新字符
 		_size++;
 		_str[_size] = '\0';							// 结尾放 '\0'
	}
    
     // 尾插 字符串
	void append(const char* str) {
		size_t len = strlen(str);
		if (_size + len > _capacity) {
			reserve(_capacity == 0 ? len : _capacity + len);
		}

		strcpy(_str + _size, str);				// 从字符串末尾处拷贝 str
		_size += len;
	}
    
     // 插入字符
	string& insert(size_t pos, char ch) {
		assert(pos <= _size);		// pos位置 需要合法

		if (_size == _capacity) {
			reserve(_capacity == 0 ? 4 : _capacity * 2);
		}

		size_t end = _size + 1;
		// 1. end位置在 _size+1, 挪动数据的步骤就是将 end-1 位置的数据一个一个挪至end
		// 2. 如果 end位置在 _size, 则挪动数据的步骤是将 end位置的数据 挪至 end+1
		// (两种方法 从 '\0' 开始挪动)
		// 表面看 两种方法好像都一样, 但是 如果end的初始位置是_size, 需要额外处理 pos位置为0的情况
		// 因为 当pos位置为零时, 方案二 end的结束位置应该在 -1, 但是 end是 size_t 类型的数据, 所以end永远不会为-1, 即会死循环
		// 而 方案一 不会有这种情况, 方案一 如果 pos为0, 循环结束时 end == pos, 会退出循环
		while (end > pos) {
			_str[end] = _str[end - 1];
			end--;
		}
		_str[pos] = ch;
		_size++;

		return *this;
	}
	// 插入字符串
	string& insert(size_t pos, const char* str) {
		assert(pos <= _size);

		size_t len = strlen(str);
		if (_size + len > _capacity) {
			reserve(_capacity == 0 ? len : _capacity + len);
		}

		size_t end = _size + len;
		while (end > pos + len - 1)	{	// 可以画图判断一下end结束位置 
			_str[end] = _str[end - len];
			end--;
		}
		strncpy(_str + pos, str, len);		// 使用strncpy 可以防止字符串的'\0' 也被拷贝进去
		_size += len;

		return *this;
	}
     // 插入对象
	string& insert(size_t pos, const string& s) {
		assert(pos <= _size);

		insert(pos, s._str);				// 直接调用 插入字符串

		return *this;
	}

     // += 重载
	string& operator+=(const string& s) {
		insert(_size, s);		// += 对象复用 insert
		return *this;
	}
	string& operator+=(const char* str) {
		append(str);			// += 字符串复用 append
		return *this;
	}
	string& operator+=(char ch) {
		push_back(ch);		// += 字符 复用 push_back
		return *this;
	}
    
     // 删除字符
	string& earse(size_t pos, size_t len = npos) {
		assert(pos < _size);
			
		// 当从pos位置向后删除的长度大于 字符串长度时, 不用考虑挪动数据 直接修改 _size 和 结尾符 '\0'
		if (len == npos || pos + len >= _size) {
			_str[pos] = '\0';
			_size = pos;
		}
		else {
			size_t begin = pos + len;
			// 挪动数据
			while (begin <= _size) {
				_str[begin - len] = _str[begin];
				begin++;
			}
			_size -= len;
		}
	
		return *this;
	}
    
     // 查找字符
	size_t find(char ch, size_t pos = 0) {
		assert(pos < _size);
	
		for (; pos < _size; pos++) {
			if (_str[pos] = ch)
				return pos;
		}

		return npos;
	}
     //查找字符串
	size_t find(const char* str, size_t pos = 0) {
		assert(pos < _size);
	
		//直接用strstr()找字符串的地址, 找到就返回字符串首字符的地址, 找不到就返回空指针
		// 找到的话  找到的str的地址 - 原字符串的地址 就是字符串首字符的在string中的位置
		const char* ps = strstr(_str + pos, str);
		if (ps != nullptr) {
			return ps - _str;
		}
	
		return npos;
	}
    
     // 清除对象内容
	void clear() {
		resize(0);
	}
    
	// [] 重载
	char& operator[](size_t pos) {
		assert(pos < _size);		// 下标要合法	

		return _str[pos];
	}
	
	const char& operator[](size_t pos) const {
		assert(pos < _size);		// 下标要合法
	
		return _str[pos];
	}

	// size() 返回string有效字符大小
	size_t size() const {		// 不修改原对象的尽量加上 const 
		return _size;
	}

	// capacity() 返回 string 有效字符容量
	size_t capacity() const {
		return _capacity;
	}

	// c_str 返回对象中字符串的 C类指针形式
	// 按照库中的类型 const修饰
	const char* c_str() const {
		return _str;
	}
    
	// 析构函数
	~string() {
		if (_str) {	// 得先保证 _str 不是空指针
			delete[] _str;
			_str = nullptr;
			_size = _capacity = 0;
		}
	}
    
private:
	char* _str;				// 字符串
	size_t _size;			// 字符串实际长度
	size_t _capacity;		 // 字符串指针表示的字符串的容量
    
    const static size_t npos;
};

const size_t string::npos = -1;

// 实现 > 和 == 都用strcmp来对字符串作比较
bool operator>(const string& s1, const string& s2) {
	return strcmp(s1.c_str(), s2.c_str()) > 0;
}
bool operator==(const string& s1, const string& s2) {
	return strcmp(s1.c_str(), s2.c_str()) == 0;
}
bool operator>=(const string& s1, const string& s2) {
	return s1 > s2 || s1 == s2;
}
bool operator<(const string& s1, const string& s2) {
	return !(s1 >= s2);
}
bool operator<=(const string& s1, const string& s2) {
	return s1 < s2 || s1 == s2;
}
bool operator!=(const string& s1, const string& s2) {
	return !(s1 == s2);
}

ostream& operator<<(ostream& out, const string& s) {
	// 其实就是string类的字符串遍历
	// 三种方法使用哪种方法都行
	// 下面使用 范围for 比较简单 (使用之前需要实现 迭代器)
	for (auto ch : s)
	{
		out << ch;
	}

	return out;
}

// 流提取
/*istream& operator>>(istream& in, string& s) {
	char ch;
	s.clear();
	ch = in.get();
	while (ch != ' ' && ch != '\n') {
		s += ch;
		ch = in.get();
	}
	
	return in;
}*/
// 流提取优化
istream& operator>>(istream& in, string& s) {
	char ch;
	s.clear();		// 清理string原字符串
	ch = in.get();
	char tmp[128] = { '\0' };		//字符数组内容初始化为 '\0', 大小适合就可以
	size_t i = 0;				   // 用来访问字符数组下标赋值, 以及记录字符数组中字符个数
	while (ch != ' ' && ch != '\n') {
		tmp[i++] = ch;
		if (i == 127) {	
			// 字符数组大小为 128, 看作字符串的话, 可容纳有效字符数就是 127, 因为最后一位'\0'作为结束标志 
			// 字符数组一满, 就将字符数组中的内容 += 至string对象, 然后清空字符数组
			s += tmp;
			memset(tmp, '\0', 128);	// 使用 memset 将字符数组所有空间设置为 '\0' 以防下次 += 会出错
			i = 0;
		}
		ch = in.get();
	}
	s += tmp;		// 循环结束, 再将字符数组中还有的内容 += 至string对象

	return in;
}
```

---

本篇文章至此结束

感谢阅读~

![|tiny](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250711181041973.webp)
