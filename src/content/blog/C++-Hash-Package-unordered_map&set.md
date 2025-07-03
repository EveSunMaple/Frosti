---
draft: true
title: "[C++-STL] 用哈希表封装unordered_map和unordered_set"
pubDate: "2022-11-13"
description: "STL的两个容器 unordered_map 和 unordered_set 底层是由哈希表实现的, 那么本篇文章的内容 就是将哈希表封装为 unordered_set 和 unordered_map"
image: https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/202306251813360.webp
categories:
    - Blogs
tags: 
    - STL
    - 哈希表
    - 容器
---

上一篇文章介绍分析了 哈希表的结构 与 基础的插入 查找 删除 三个接口, 也介绍了 STL的两个容器 `unordered_map`和`unordered_set`底层是由哈希表实现的, 那么本篇文章的内容 就是将哈希表封装为`unordered_set`和 `unordered_map`

但是 上一篇文章中模拟实现的哈希表 还不足以直接封装起来共`unordered_set`和`unordered_map`使用, 所以在封装之前, 需要 `改造哈希表`

---

# 改造哈希表

```
温馨提示: 本篇文章底层哈希表的实现 使用 开散列法, 即 链地址法
```

> 阅读本文章之前, 建议先阅读博主 红黑树 和 set与map封装 的相关文章:
>
> [[C++-STL\] 红黑树的详析分析与实现](http://humid1ch.cn/posts/DS-Analysis-RedBlack-Tree)
>
> [[C++-STL\] set和map容器的模拟实现](http://humid1ch.cn/posts/C++-Simulate-the-Implementation-of-Set&Map)

unordered_set 和 unordered_map 的封装 其实与 set 和 map 的封装 `很相似`:

1. 与 set 和 map 一样, 在使用的时候, 第一个模板参数传Key数据的类型, 第二个模板参数传Value数据的类型(set没有这个模板参数), 但在`底层的结构中`, 第一个模板参数只是为了说明Key的类型, `第二个模板参数才是真正的需要存储的数据类型`

	即 节点中存储的数据类型 一个是 Key, 另一个是 pair<Key, Value>

2. 由于 set是单个类型作为数据类型, 而 map是两个数据类型组合成pair作为实际的数据类型, 所以想要使用一个相同的底层结构, 就要用到仿函数来针对不同的数据类型提取当前数据中的 key(因为需要用key实现许多操作)

	即 与set和map原理相同的 `KeyOfT仿函数`

3. 只要实现了可以同时兼容实现 set 与 map 的底层, 关于set 与 map 的接口实现就非常的简单

与 set 和 map `不同的是`, unordered_set 和 unordered_map 的底层是哈希表, 所以在哈希表中需要`针对特别的数据类型(无法直接转换整形的类型)计算哈希值`, 所以 unordered_set 和 unordered_map 要多出一个 计算Key数据的哈希值的仿函数, 即 `hashFunc`

## 模板参数

前面提到, unordered_set 和 unordered_map 使用时传参, 第一个传Key类型, 第二个传Value类型, 但实际上 底层实现 第二个传真正的数据类型, 在两个不同容器中分别为 Key 和 pair<Key, Value>

而且 还需要 KeyOfT仿函数 和 hashFunc仿函数, 所以 要实现可以同时兼容封装 unordered_set 和 unordered_map, 底层哈希表的模板参数需要改造为

```cpp
template<class Key, class T, class KeyOfT, class hashFunc>
class hashTable {};
/*  Key:关键字类型	T:存储的数据类型	KeyOfT:取数据中的关键字的仿函数	  hashFunc:计算Key哈希值的仿函数*/
```

## 哈希表的迭代器 *

在模拟实现哈希表的迭代器之前, 首先要分析清楚, `迭代器的模板参数应该是什么`.

### 模板参数 成员变量

首先要明白 迭代器需要实现什么功能:

1. 基本意义是需要 `表示某一个数据节点的指针`, 所以 节点的数据类型需要知道, 即 `T`

2. ++操作, 迭代器根据哈希表中的桶的顺序及桶的内容 向后移动, 指向下一个节点

	很明显, 想要实现在这个功能, 只知道某一个节点是不行的, 因为`哈希表存在多个桶(多个链表), 只知道某单个链表上的某个节点, 是不可能实现遍历整个哈希表的`. 所以 `每个迭代器中还需要知道迭代器指向节点所在的整个哈希表`, 也就是需要获取 此哈希表的指针
	
	那么 其实 `迭代器的模板参数需要与哈希表的模板参数一模一样`

这两个功能 除确定了 哈希表的模板参数之外, 其实还确定了 哈希表的两个成员变量: `数据节点的指针变量, 节点所在哈希表的指针变量`:

```cpp
template<class Key, class T, class KeyOfT, class hashFunc>
struct __hashTableIterator{
	typedef hashNode<T> Node;
	typedef hashTable<Key, T, KeyOfT, hashFunc> hashTable;
    
	typedef __hashTableIterator<Key, T, KeyOfT, hashFunc> Self;				// 迭代器本身类型 typedef为 Self

private:
	Node* _node;					    // 节点指针
	hashTable* _pht;					// 节点所在哈希表的指针
};
```

### 成员函数

迭代器的成员函数, 就是迭代器需要实现的功能

> 迭代器实际需要实现的功能太多了, 就不一一列举了, 只举几个比较重要的

#### 构造函数

构造函数没有什么需要注意的

```cpp
__hashTableIterator() {}

__hashTableIterator(Node* node, hashTable* pht)
	:_node(node)
	, _pht(pht)
{}
```

#### operator++

++的重载, 需要实现的功能就是 将`迭代器移向下一个节点`

移向下一个节点, 听起来很简单, 但 还需要解决一些问题, 因为存在不同的情况:

1. 当迭代器指向的节点 是桶的非尾节点时

	此时 可以直接 指向下一个节点, 因为桶还没有遍历完, 只需要像单链表那样向后移动就可以了

2. 当迭代器指向的节点 是桶的尾节点时

	此时 就要面临一个问题: 已经是当前桶的最后一个数据节点了, ++之后, `迭代器需要到下一个不为空的桶的头节点位置, 怎么寻找下一个桶?`

其实 找桶的方法也不难:

因为知道当前节点, 所以可以`根据节点的Key数据计算出当前节点所在的桶的位置`, 然后从此位置在`哈希表里向后找第一个不为空的位置` 就是下一个桶

那么 operator++ 的实现代码就可以为:

```cpp
Self& operator++() {
	if(_node->_next != nullptr) {				// 当前节点的 _next不为空, 表示不是桶的尾节点
		_node = _node->next;
	}
	else {
		KeyOfT kot;						// 创建取key值的仿函数对象
		hashFunc hf;					// 创建计算key的哈希值的仿函数对象
		// 在使用时 仿函数可以直接使用匿名对象
		
		size_t hashI = hf(kot(_node->_data)) % _pht->_tables.size();			// 先用kot调用取key值的仿函数, 再用hf调用计算key的哈希值的仿函数, 然后 % 哈希表数组的容量, 求出当前桶的哈希地址
		// 向后查找 不为空的桶
		hashI++;
		for(; hashI < _pht->_tables.size(); hashI++) {
			if(_pht->_tables[hashI]) {			// 哈希表数组的 hashI 位置不为空, 表示此桶不为空
				_node = _pht->_tables[hashI];		// 更新迭代器节点为此桶的头节点
				break;
			}
		}
		
		// 如果循环正常走完, 就表示没有找到下一个非空桶
		// 也就表示 当前迭代器所指向的节点 是整个哈希表中的最后一个数据节点
		// 那么 ++操作之后, 节点应该指向空
		if(hashI == _pht->_tables.size()) {
			_node = nullptr;
		}
		// 上面 存在直接访问哈希表私有变量的情况, 所以 迭代器类需要设置为哈希表类的友元函数
	}
	
	return *this;
}
```

#### operator* operator->

对于迭代器, `*的作用可以看作对结点指针(迭代器可以看成类似结点指针)的解引用`, 也就是说 `*迭代器 可以直接访问 修改节点 数据`, 所以 :

```cpp
Node& operator*() {
	return _node->_data;
}
```

而 `->的作用, 则是访问节点数据的地址`:

```cpp
Node* operator->() {
	return &_node->_data;
}
```

#### operator== opertor!=

这两个运算符重载就更简单了, 直接对比 节点的指针就可以了

```cpp
bool operator==(const Self& sIt) const {
	return _node == sIt._node;
}

bool operator!=(const Self& sIt) const {
	return _node != sIt._node;
}
```

---

迭代器最重要的部分功能就是上面这些了

---

迭代器 设计结束之后, 关于哈希表的改造, 就只剩下一些`接口函数`了

## 哈希表结构 与 接口函数

### 结构

分析过 模板参数与迭代器之后, 哈希表的结构已经基本完善了:

```cpp
template<class Key>
struct defaultHashFunc {
	size_t operator()(const Key& key) {
		return (size_t)key;
	}
};
template<>
struct defaultHashFunc<string> {
	size_t operator()(const string& str) {
		size_t hash = 0;
		for(auto c : str) {
			hash = hash * 131 + c;
		}
		
		return hash;
	}
};

template<class T>
struct hashNode{
	T _data;
	hashNode<T>* _next;
	
	hashNode(const T& data)
		:_data(data)
		,_next(nullptr)
	{}
};

template<class Key, class T, class KeyOfT, class hashFunc>
class hashTable {
	typedef hashNode<T> Node;
	
	template<class KeyType, class Type, class KeyOfType, class hashFunction>
	friend struct __hashTableIterator;

public:
	typedef __hashTableIterator<Key, T, KeyOfT, hashFunc> iterator;
	
private:
	vector<Node*> _tables;						 // 存储桶的数组
	size_t _n = 0;								// 存储的节点数
};
```

注意, **按照C++标准, 在`hashTable`类内 声明`__hashTableIterator`为友元类时, `__hashTableIterator`生命的模板参数不可以与`hashTable`的模板参数使用相同的命名, 即使 模板参数没有什么实际意义**

什么意思?

```cpp
template<class Key, class T, class KeyOfT, class hashFunc>
class hashTable {
	template<class KeyType, class Type, class KeyOfType, class hashFunction>
	friend struct __hashTableIterator;
};
```

需要在`hashTable`内部声明`__hashTableIterator`为友元

如果`hashTable`的模板参数为`template<class Key, class T, class KeyOfT, class hashFunc>`

那么声明`__hashTableIterator`就不能`template<class Key, class T, class KeyOfT, class hashFunc>`

否则, 就是发生了 **模板参数重影**

就像下面这样的代码:

```cpp
template<class Key, class T, class KeyOfT, class hashFunc>
class hashTable {
	template<class Key, class T, class KeyOfT, class hashFunc>
	friend struct __hashTableIterator;
};
```

使用`g++`编译, 是会报错的

![](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/image-20240807192429057.webp)

不过, 如果使用`MSVC`的编译器, 就不会出错

编译器处理有差异

### 接口函数

#### insert

数据插入接口的大逻辑 在上一篇文章中已经介绍过了

因为哈希表的结构 参数都优化过, 所以细节会有一些区别:

1. 返回值, insert 的返回值应该是 pair<iterator, bool> 类型的, 一个是插入数据的节点所在的迭代器, 另一个是插入结果
2. 计算哈希值, 需要先用 KeyOfT仿函数取key值, 再进行计算

```cpp
pair<iterator, bool> insert(const T& data) {
	hashFunc hf;
	KeyOfT kot;
	
	// 先查找哈希表中是否已经存在此数据
	iterator pos = find(kot(data));
	if (pos != end()) {						// 迭代器存在, 且 != end(), 即表示存在此数据
		return make_pair(pos, false);
	}
	
	// 当 负载因子 == 1 时, 数组扩容
	if(_tables.size() == _n) {
		size_t newSize = _tables.size() == 0 ? 10 : _tables.size() * 2;
		
		vector<Node*> newTables;
		newTables.resize(newSize, nullptr);
		for(int i = 0; i < _tables.size(); i++) {
			Node* cur = _tables[i];
			while (cur) {
				Node* next = cur->_next;
				
				size_t hashI = hf(kot(cur->_data)) % newSize;				// 取key值 以新数组的大小映射哈希地址
				cur->_next = newTables[hashI];
				newTables[hashI] = cur;
				
				cur = next;
			}
			_tables[i] = nullptr;
		}
		// 新数组映射结束, 交换数组
		_tables.swap(newTables);
	}
	// 扩容结束
	// 计算 需要插入的哈希桶的位置
	size_t hashI = hf(kot(data)) % _tables.size();
	// 头插数据
	Node* newNode = new Node(data);
	newNode->_next = _tables[hashI];
	_tables[hashI] = newNode;
	
	++_n;
	
	return make_pair(iterator(newNode, this), true);
} 
```

#### find

查找数据 也是细节有些不同:

```cpp
iterator find(const Key& key) {
	if(_n == 0) {
		return iterator(nullptr, false);
	}
	
	hashFunc hf;
	KeyOfT kot;

	size_t hashI = hf(key) % _tables.size();
	Node* cur = _tables[hashI];
	while (cur) {
		if (kot(cur->_data) == key) {
			return iterator(cur, this);
		}
		cur = cur->_next;
	}
	
	// 走到这里就是没有找到
	return iterator(nullptr, this);
}
```

#### erase

```cpp
bool erase(const Key& key) {
	hashFunc hf;
	KeyOfT kot;
	
	size_t hashI = hf(key) % _tables.size();
	Node* cur = _tables[hashI];
	Node* prev = nullptr;
	while (cur) {
		if (kot(cur->_data) == key) {
			if (cur == _tables[hashI]) {					// 如果需要删除的节点是桶的头节点
				_tables[hashI] = cur->_next;
			}
			else {
				prev->_next = cur->_next;
			}
			delete cur;
			--_n;
			
			return true;
		}
		
		prev = cur;
		cur = cur->_next;
	}
	
	// 走到这里说明 没有可删除的节点
	return false;
}
```

#### begin end

这两个接口是 取哈希表中首节点迭代器 和 取哈希表中尾节点的下一节点迭代器 的接口

```cpp
iterator begin() {
	for(size_t i = 0; i < _tables.size(); i++) {
		Node* cur = _tables[i];
		if (cur) {
			return iterator(cur, this);
		}
	}
	
	return end();
}

iterator end() {
	return iterator(nullptr, this);
}
```

#### 析构函数

模拟实现的 哈希表的底层是 vector 和 我们自己实现的单链表的结合

虽然 vector会自动调用析构函数去释放空间, 但是 我们自己实现的单链表 是不会自己释放的, 所以 `需要写析构函数将 桶 释放`

```cpp
~hashTable() {
	for (size_t i = 0; i < _tables.size(); ++i) {
		Node* cur = _tables[i];
		while (cur)	{
			Node* next = cur->_next;
			delete cur;
			cur = next;
		}

		_tables[i] = nullptr;
	}
}
```



# 封装 unordered_set 与 unordered_map

哈希表最基本的功能模拟完成之后, 就可以封装 unordered_set 和 unordered_map 了

## unordered_set

### 结构

模拟实现的 unordered_set 的底层结构, 很简单. 就只是一个`哈希表 和 针对unordered_set取key值的仿函数` 而已:

```cpp
template<class Key, class hashFunc = defaultHashFunc<Key>>
class unordered_set {
	struct KeyOfT_set {
		const Key& operator()(const Key& key) {
			return key;
		}
	};
public:
	typedef typename hashTable<Key, Key, KeyOfT_set, hashFunc>::iterator iterator;
    
private:
	hashTable<Key, Key, KeyOfT_set, hashFunc> _ht;
};
```

> 对于这里的 hashFunc可能会有疑问: 为什么要在这里传 hashFunc?
>
> 因为Key的类型是在使用unordered_set时 传过去的, 那么针对Key值计算哈希值的仿函数 也应该在使用 unordered_set 时传参
>
> 同样也是因为, `unordered_set 是封装后的hashTable, 用户是不能直接修改 hashTable的, 所以需要在上层传参`

### 接口函数

相较于 hashTable的底层实现, 上层封装容器的接口函数的实现就简单得多, 因为只需要调用底层接口就可以

```cpp
iterator begin() {
	return _ht.begin();
}

iterator end() {
	return _ht.end();
}

pair<iterator, bool> insert(const Key& key) {
	return _ht.insert(key);
}

iterator find(const Key& key) {
	return _ht.find(key);
}

bool erase(const Key& key) {
	return _ht.erase(key);
}
```

## unordered_map

unordered_map的封装与 unordered_set基本相同, 只是数据的类型不同而已

### 结构

```cpp
template<class Key, class Value, class hashFunc = defaultHashFunc<Key>>
class unordered_map {
	struct KeyOfT_map {
		const Key& operator()(const pair<Key, Value>& kv) {
			return kv.first;
		}
	};
public:
	typedef typename hashTable<Key, pair<Key, Value>, KeyOfT_map, hashFunc>::iterator iterator;
	
private:
	hashTable<Key, pair<Key, Value>, KeyOfT_map, hashFunc> _ht;
};
```

### 接口函数

```cpp
iterator begin() {
	return _ht.begin();
}

iterator end() {
	return _ht.end();
}

pair<iterator, bool> insert(const pair<Key, Value>& kv) {
	return _ht.insert(kv);
}

iterator find(const Key& key) {
	return _ht.find(key);
}

bool erase(const Key& key) {
	return _ht.erase(key);
}
```

# 代码整理

## 哈希表

```cpp
template<class Key>
struct defaultHashFunc {
	size_t operator()(const Key& key) {
		return (size_t)key;
	}
};
template<>
struct defaultHashFunc<string> {
	size_t operator()(const string& str) {
		size_t hash = 0;
		for(auto c : str) {
			hash = hash * 131 + c;
		}
		
		return hash;
	}
};

template<class T>
struct hashNode{
	T _data;
	hashNode<T>* _next;
	
	hashNode(const T& data)
		:_data(data)
		,_next(nullptr)
	{}
};

// 需要在 迭代器类前声明 哈希表类
template<class Key, class T, class KeyOfT, class hashFunc>
class hashTable;

// 迭代器
template<class Key, class T, class KeyOfT, class hashFunc>
struct __hashTableIterator{
	typedef hashNode<T> Node;
	typedef hashTable<Key, T, KeyOfT, hashFunc> hashTable;
    
	typedef __hashTableIterator<Key, T, KeyOfT, hashFunc> Self;				// 迭代器本身类型 typedef为 Self
public:
	__hashTableIterator() {}

	__hashTableIterator(Node* node, hashTable* pht)
		:_node(node)
		, _pht(pht)
	{}
    
	Self& operator++() {
		if(_node->_next != nullptr) {				// 当前节点的 _next不为空, 表示不是桶的尾节点
			_node = _node->next;
		}
		else {
			KeyOfT kot;						// 创建取key值的仿函数对象
			hashFunc hf;					// 创建计算key的哈希值的仿函数对象
			// 在使用时 仿函数可以直接使用匿名对象
			
			size_t hashI = hf(kot(_node->_data)) % _pht->_tables.size();			// 先用kot调用取key值的仿函数, 再用hf调用计算key的哈希值的仿函数, 然后 % 哈希表数组的容量, 求出当前桶的哈希地址
			// 向后查找 不为空的桶
			hashI++;
			for(; hashI < _pht->_tables.size(); hashI++) {
				if(_pht->_tables[hashI]) {			// 哈希表数组的 hashI 位置不为空, 表示此桶不为空
					_node = _pht->_tables[hashI];		// 更新迭代器节点为此桶的头节点
					break;
				}
			}
			
			// 如果循环正常走完, 就表示没有找到下一个非空桶
			// 也就表示 当前迭代器所指向的节点 是整个哈希表中的最后一个数据节点
			// 那么 ++操作之后, 节点应该指向空
			if(hashI == _pht->_tables.size()) {
				_node = nullptr;
			}
			// 上面 存在直接访问哈希表私有变量的情况, 所以 迭代器类需要设置为哈希表类的友元函数
		}
		
		return *this;
	}
	
	Node& operator*() {
		return _node->_data;
	}

	Node* operator->() {
		return &_node->_data;
	}

	bool operator==(const Self& sIt) const {
		return _node == sIt._node;
	}

	bool operator!=(const Self& sIt) const {
		return _node != sIt._node;
	}

private:
	Node* _node;					    // 节点指针
	hashTable* _pht;					// 节点所在哈希表的指针
};

template<class Key, class T, class KeyOfT, class hashFunc>
class hashTable {
	typedef hashNode<T> Node;
	
	template<class Key, class T, class KeyOfT, class hashFunc>
	friend struct __hashTableIterator;

public:
	typedef __hashTableIterator<Key, T, KeyOfT, hashFunc> iterator;

	~hashTable() {
		for (size_t i = 0; i < _tables.size(); ++i) {
			Node* cur = _tables[i];
			while (cur)	{
				Node* next = cur->_next;
				delete cur;
				cur = next;
			}

			_tables[i] = nullptr;
		}
	}
	
	// 插入数据	
	pair<iterator, bool> insert(const T& data) {
		hashFunc hf;
		KeyOfT kot;
		
		// 先查找哈希表中是否已经存在此数据
		iterator pos = find(kot(data));
		if (pos != end()) {						// 迭代器存在, 且 != end(), 即表示存在此数据
			return make_pair(pos, false);
		}
		
		// 当 负载因子 == 1 时, 数组扩容
		if(_tables.size() == _n) {
			size_t newSize = _tables.size() == 0 ? 10 : _tables.size() * 2;
			
			vector<Node*> newTables;
			newTables.resize(newSize, nullptr);
			for(int i = 0; i < _tables.size(); i++) {
				Node* cur = _tables[i];
				while (cur) {
					Node* next = cur->_next;
					
					size_t hashI = hf(kot(cur->_data)) % newSize;				// 取key值 以新数组的大小映射哈希地址
					cur->_next = newTables[hashI];
					newTables[hashI] = cur;
					
					cur = next;
				}
				_tables[i] = nullptr;
			}
			// 新数组映射结束, 交换数组
			_tables.swap(newTables);
		}
		// 扩容结束
		// 计算 需要插入的哈希桶的位置
		size_t hashI = hf(kot(data)) % _tables.size();
		// 头插数据
		Node* newNode = new Node(data);
		newNode->_next = _tables[hashI];
		_tables[hashI] = newNode;
	
		++_n;
	
		return make_pair(iterator(newNode, this), true);
	} 

	// 查找数据
	iterator find(const Key& key) {
		if(_n == 0) {
			return iterator(nullptr, this);
		}
		
		hashFunc hf;
		KeyOfT kot;
	
		size_t hashI = hf(key) % _tables.size();
		Node* cur = _tables[hashI];
		while (cur) {
			if (kot(cur->_data) == key) {
				return iterator(cur, this);
			}
			cur = cur->_next;
		}
		
		// 走到这里就是没有找到
		return iterator(nullptr, this);
	}
	
	// 删除数据
	bool erase(const Key& key) {
		hashFunc hf;
		KeyOfT kot;
		
		size_t hashI = hf(key) % _tables.size();
		Node* cur = _tables[hashI];
		Node* prev = nullptr;
		while (cur) {
			if (kot(cur->_data) == key) {
				if (cur == _tables[hashI]) {					// 如果需要删除的节点是桶的头节点
					_tables[hashI] = cur->_next;
				}
				else {
					prev->_next = cur->_next;
				}
				delete cur;
				--_n;
					
				return true;
			}
			
			prev = cur;
			cur = cur->_next;
		}
		
		// 走到这里说明 没有可删除的节点
		return false;
	}
	
	iterator begin() {
		for(size_t i = 0; i < _tables.size(); i++) {
			Node* cur = _tables[i];
			if (cur) {
				return iterator(cur, this);
			}
		}
		
		return end();
	}

	iterator end() {
		return iterator(nullptr, this);
	}

private:
	vector<Node*> _tables;						 // 存储桶的数组
	size_t _n = 0;							// 存储的节点数
};
```

## unordered_set

```cpp
template<class Key, class hashFunc = defaultHashFunc<Key>>
class unordered_set {
	struct KeyOfT_set {
		const Key& operator()(const Key& key) {
			return key;
		}
	};
public:
	typedef typename hashTable<Key, Key, KeyOfT_set, hashFunc>::iterator iterator;
		
	iterator begin() {
		return _ht.begin();
	}
	
	iterator end() {
		return _ht.end();
	}
	
	pair<iterator, bool> insert(const Key& key) {
		return _ht.insert(key);
	}
	
	iterator find(const Key& key) {
		return _ht.find(key);
	}
	
	bool erase(const Key& key) {
		return _ht.erase(key);
	}
    
private:
	hashTable<Key, Key, KeyOfT_set, hashFunc> _ht;
};
```

## unordered_map

```cpp
template<class Key, class Value, class hashFunc = defaultHashFunc<Key>>
class unordered_map {
	struct KeyOfT_map {
		const Key& operator()(const pair<Key, Value>& kv) {
			return kv.first;
		}
	};
public:
	typedef typename hashTable<Key, pair<Key, Value>, KeyOfT_map, hashFunc>::iterator iterator;

	iterator begin() {
		return _ht.begin();
	}
	
	iterator end() {
		return _ht.end();
	}
	
	pair<iterator, bool> insert(const pair<Key, Value>& kv) {
		return _ht.insert(kv);
	}
	
	iterator find(const Key& key) {
		return _ht.find(key);
	}
	
	bool erase(const Key& key) {
		return _ht.erase(key);
	}

private:
	hashTable<Key, pair<Key, Value>, KeyOfT_map, hashFunc> _ht;
};
```

---

OK 本篇文章到这里就结束了~

感谢阅读~

希望大家 点赞+评论+收藏~
