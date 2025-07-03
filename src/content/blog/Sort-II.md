---
draft: true
title: "[算法] 八大排序II: 快速、归并、计数、堆排序 的逻辑、复杂度、稳定性详解 - C++实现"
pubDate: "2024-8-3"
description: ""
image: https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/202408281115509.webp
categories:
    - Blogs
tags: 
    - 算法
    - 排序
    - C++
---



# 快速排序

快速排序, 是最常用的排序算法之一

C++中`std::sort()`, 在数据量较大但不会超负荷时, 就会采用快速排序



## 逻辑分析

快速排序有很多的版本, 不过所有版本均 **基于分治的思想** 实现

**什么是分治?** 分治, 分而治之. 

**思想是, 将一个问题分为若干个相同(相似)的子问题, 并再对子问题进行分化, 直到可以最简单的解决最小的子问题, 然后逐步返回并解决大问题**

下面从创始人版本开始分析

### 1. `Hoare` 版

`Hoare`版的快速排序的思路是什么呢?

1. 首先, 选择数组的有效范围的头或尾元素, 作为一个`key`

    如果是选择头作为`key`, 那么先移动右指针, 直到找到`<key`的值, 再移动左指针

    如果是选择尾作为`key`, 那么先移动左指针, 直到找到`>key`的值, 再移动右指针

2. 定义`左(left)右(right)指针`分别指向数组有效范围的头尾, 并开始向对方靠拢

3. 左指针找`>key`的数据, 右指针找`<key`的数据

4. 找到之后, 交换两指针指向的数据

5. 直到两指针相遇, 然后将所选的`key`与相遇位置的数据进行交换

6. `key`的选择, 一般为数组有效范围的头或尾

    选择其他位置, 可能需要做特殊处理

这些步骤的作用是什么? 

是为了 **以`key`作为分界值, 将数组分为两部分: `key`左边的数据`均<key`, `key`右边的数据`均>key`**

这就是为什么, 如果选择数组头作为`key`, 就先移动右指针; 选数组尾作为`key`, 就先移动左指针

这样可以保证最后两指针相遇位置的数据, 在与`key`交换位置之后, 依旧满足 `key`左边的数据`均<key`, `key`右边的数据`均>key`

在对数组做出这样的处理之后, 就可以将数组分为两部分, 然后可以在对分出的两部分做相同的处理

直到, 最后分出的两部分的长度为1

此时, 说明整个数组已经完成了排序

以此思路的一趟排序, 用动图演示为:

![](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/hoareQsort_apart.gif)

从演示的结果来看, 这样的一趟排序之后, 有效地将数组分为两部分:

1. **`[0, mid-1]`, 元素均`<=nums[mid](key)`**
2. **`[mid+1, size]`, 元素均`>=nums[mid](key)`**
3. 无论是`left`遇到与`key`相等的值, 还是`right`遇到与`key`相等的值, 都可以不停下来, 因为即使停下来交换数据也没有什么意义, 无非就是在`mid`的左边或右边的区别

一趟`Hoare`处理之后, 对分出来的左右两部分再次进行相同的处理, 直到最后`left`和`right`不再维护一个有效的范围

### 2. 挖坑版

挖坑版的思路与`Hoare`版不同, 但是目的是相同的

挖坑版快速排序的思路是这样的:

1. 首先, 将数组有效范围的头或尾看作一个坑`pit`, 并将坑值作为`key`

2. 定义`左(left)右(right)`指针分别指向数组有效范围的头尾

    如果是选择头作为`key`, 那么先移动右指针, 直到找到`<key`的值

    如果是选择尾作为`key`, 那么先移动左指针, 直到找到`>key`的值

3. 在数组中, 移动`right`向左找`<key`的值

4. `right`找到目标之后, 将`right`位置数据放入`pit`位置, 即 放入坑中, 并 **记录`right`为新的`pit`**

5. 然后, 开始移动`left`向右找`>key`的值

6. `left`找到目标之后, 交换`left`位置数据放入`pit`位置, 并 **记录`left`为新的pit**

7. 以此为循环, 直到`left`与`right`相遇, 相遇位置为最终的`pit`

8. 然后将存储的`key`放入最终的`pit`, 完成一趟排序

主要思路就是, 挖坑和填坑:

如果, `left`位置是坑, 那么`right`就找符合条件的数据填坑, 然后`right`位置就成了新坑

如果, `right`位置是坑, 那么`left`就找符合条件的数据填坑, 然后`left`位置就成了新坑

这样, 保证了`key`左边数据恒`>=key`, `key`右边数据恒`<=key`

即, 最终的目的与`Hoare`版是相同的

以这样的思路作为一趟排序, 动图演示为:

![](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/pitQsort_apart.gif)

这样一个过程之后, 同样可以将数组分为满足要求的两部分

以相同的思路, 继续处理分出来的两部分, 直到最终`left`和`right`不再维护一个有效范围位置, 整个数组排序完成

挖坑版 比 `Hoare`版优了一点点, 因为 **挖坑版没有执行实质上两个数据的交换, 只有数据覆盖**, `left`和`right`遇到条件满足的数据之后, 会直接将数据放到`pit`位置, 不用管`pit`位置的数据

### 3. 前后指针版

前面两种方法, 也是使用双指针, 不过是用双指针分别指向数组有效范围的头尾, 然后向对方移动靠近

下面这种方法, 使用的两个指针都是从数组有效范围的头开始

1. 首先, 选定数组有效范围的头元素作为`key`
2. 然后, 定义两个指针 `last`从头位置开始, `fast`从头+1位置开始
3. `fast`向数组尾遍历, 遇到`<key`的数 停下
4. 交换`nums[fast]`和`nums[++last]`的数据
5. 一直执行此操作, 直到`fast`遍历完整个数组
6. 然后将 头位置元素与`nums[last]`进行交换

至此, 完成数组中`<key`和`>key`两部分数据的划分

那么, 前后指针划分数据的过程是怎么样的呢?

`fast`从`key`的下一位开始, 向右找`<key`的值, `last`只在交换数据之前`++`:

![](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/pointerQsort_apart.gif)

从演示中可以发现, 在交换数据时`last`会有两种位置: **1. 与`fast`相同的位置; 2. 目前数组中首个`>key`数据的位置**

第1种情况, 会发生在`fast`还未遇到第一个`<key`的数据时, 此时 交换数据其实没有意义, 更新移动`last`才是重点

第2种情况, 则会发生在`fast`遇到第一个`<key`的数据之后, 此时 才是有效的数据交换

使用这种方式, 同样可以实现, 对数据的区分

## 代码实现

上面分析了三种快速排序单趟排序的版本

三种版本都可以 对给定范围的数组 划分出两个部分, 但这只是单趟排序, 为实现对整个数组的排序, 还需要对划分出来的两部分执行相同的操作

此时, 递归就比较合适

### 1. Hoare 版

```cpp
void numSwap(int& num1, int& num2) {
	int tmp = num1;
    num1 = num2;
    num2 = tmp;
}

// Hoare版
int hoareSortAPart(std::vector<int>& nums, int left, int right) {
	int keyi = left;
    int key = nums[keyi];
    while (left < right) {
		while (nums[right] >= key && left < right)
            right--;
        
        while (nums[left] <= key && left < right)
            left++;
        
        numSwap(nums[left], nums[right]);
    }
    numSwap(nums[keyi], nums[left]);
    
    return left;	// 返回 left, 即两只指针相遇地点, 也就是划分数组界限的位置
}

void _quickSort(std::vector<int>& nums, int begin, int end) {
    if (begin >= end) {
        return;			// 两指针不在维护一个长度>1的有效数组, 返回
    }
    
    int keyi = hoareSortAPart(nums, begin, end);	// 处理给定范围的数组
    _quickSort(nums, begin, keyi - 1);				// 处理划分出来 <key的部分
    _quickSort(nums, keyi + 1, end);				// 处理划分出来 >key的部分
}

void quickSort(std::vector<int>& nums) {
    _quickSort(nums, 0, nums.size()-1);
}
```

使用此版本进行排序:

![总是先处理<key的部分, 所以编号以此为基础](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/image-20240806154052052.webp)

可以看到当下次可能需要处理的数据有效长度不`>1`时, 不再递归

### 2. 挖坑版

```cpp
// pit
int pitSortAPart(std::vector<int>& nums, int left, int right) {
    int key = nums[left];
    int pit = left;
    while (left < right) {
		while (nums[right] >= key && left < right)
            right--;
        nums[pit] = nums[right];
        pit = right;
        
        while (nums[left] <= key && left < right)
            left++;
        nums[pit] = nums[left];
        pit = left;
    }
	nums[left] = key;		// 相遇位置是最后的坑
    
    return left;	// 返回 left, 即两只指针相遇地点, 也就是划分数组界限的位置
}

void _quickSort(std::vector<int>& nums, int begin, int end) {
    if (begin >= end) {
        return;			// 两指针不在维护一个长度>1的有效数组, 返回
    }
    
    int keyi = pitSortAPart(nums, begin, end);		// 处理给定范围的数组
    _quickSort(nums, begin, keyi - 1);				// 处理划分出来 <key的部分
    _quickSort(nums, keyi + 1, end);				// 处理划分出来 >key的部分
}

void quickSort(std::vector<int>& nums) {
    _quickSort(nums, 0, nums.size()-1);
}
```

![](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/image-20240806155035864.webp)

挖坑版的排序过程 与 `Hoare`版有些许不同, 但最终结果是相同的

### 3. 前后指针版

```cpp
void numSwap(int& num1, int& num2) {
	int tmp = num1;
    num1 = num2;
    num2 = tmp;
}

// 前后指针版
int pointerSortAPart(std::vector<int>& nums, int left, int right) {
    int key = nums[left];
    int fast = left + 1;
    int last = left;
    while (fast <= right) {
		if (nums[fast] < key && fast != ++last)
            numSwap(nums[fast], nums[last]);
        
        fast++;
    }
    numSwap(nums[left], nums[last]);
    
    return last;	// 返回 last, 划分数组界限的位置
}

void _quickSort(std::vector<int>& nums, int begin, int end) {
    if (begin >= end) {
        return;			// 两指针不在维护一个长度>1的有效数组, 返回
    }
    
    int keyi = pointerSortAPart(nums, begin, end);	// 处理给定范围的数组
    _quickSort(nums, begin, keyi - 1);				// 处理划分出来 <key的部分
    _quickSort(nums, keyi + 1, end);				// 处理划分出来 >key的部分
}

void quickSort(std::vector<int>& nums) {
    _quickSort(nums, 0, nums.size()-1);
}
```

![](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/image-20240806155812210.webp)

## 快排优化

快排的整体思路 大概就是: **从数组中选择一个`key`, 将有效范围内的数据分为`<=key`和`>=key`的两部分, 对分出的部分, 继续进行相同的操作**

所以, 其实`key`的选择是可以影响快排的时间消耗的

而, 上面的写法中都默认使用了数组的有效范围的首元素作为`key`, 默认选择首元素, 可能会增加快排的时间消耗

所以, 快排有一种优化思路: 优化`key`的取值

可以使用 **三数取中法: 对比数组有效范围的头、尾以及中间数据, 选择大小为中间的数据作为`key`**

不需要重写上面的三种方法, 可以在`_quickSort()`中进行修改:

```cpp
void numSwap(int& num1, int& num2) {
	int tmp = num1;
    num1 = num2;
    num2 = tmp;
}

int qSortGetMid(std::vector<int>& nums, int begin, int end) {
    // 假如 [12, 20], 那么 mid 为 16
    int mid = begin + (end - begin) / 2;		// begin 不一定为0
    if (nums[begin] > nums[mid]) {
        if (nums[mid] > nums[end]) 				// begin > mid > end
            return mid;
        else if (nums[end] > nums[begin])		// end > begin > mid
            return begin;
        else 
            return end;
    }
    else { // mid > begin
        if (nums[end] > nums[mid]) 				// end > mid > begin
            return mid;
        else if (nums[begin] > nums[end])		// mid > begin > end
            return begin;
        else 
            return end;
    }
}

void _quickSort(std::vector<int>& nums, int begin, int end) {
    if (begin >= end) {
        return;			// 两指针不在维护一个长度>1的有效数组, 返回
    }
    
    int midi = qSortGetMid(nums, begin, end);
    numSwap(nums[midi], nums[begin]);				// 将取到的中值, 与数组头元素交换位置, 后边的处理中, 就会用中值做key
    
    int keyi = pointerSortAPart(nums, begin, end);	// 处理给定范围的数组
    _quickSort(nums, begin, keyi - 1);				// 处理划分出来 <key的部分
    _quickSort(nums, keyi + 1, end);				// 处理划分出来 >key的部分
}
```

优化过后:

![](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/image-20240806162536721.webp)

左右部分的区分更加平均化

---

除了`key`取值的优化之外, 快排在实际使用时, 还可以进行其他优化

比如, 当一个数组的有效范围比较小时, 即 数组中数据较少时, 再递归调用快排, 有些浪费时间和空间, 就可以使用其他的排序方法, 这样可以节省空间和时间

毕竟递归调用需要开辟函数栈帧的

这种优化, 被称为 **小区间优化**, 表示 调用快排的数组有效数据区间较小时, 使用其他排序实现优化

## 非递归快排

非递归的快排, 可以使用 **辅助栈** 来实现

只要理解递归时 函数栈帧的创建顺序, 实际用辅助栈来实现非递归快排并不困难

不需要再额外实现排序的功能函数, 因为上面已经实现过了

`hoareSortAPart()` `pitSortAPart()` `pointerSortAPart()`

只需要注意调用的时机就可以了

---

```cpp
void nonRecursiveQuickSort(std::vector<int>& nums) {
    std::stack<int> qSortIntervalSt;	// 快排区间栈, 用于存储数组区间
    qSortIntervalSt.push(0);
    qSortIntervalSt.push(nums.size() - 1);
    
    while (!qSortIntervalSt.empty()) {
        int end = qSortIntervalSt.top();
        qSortIntervalSt.pop();
        int begin = qSortIntervalSt.top();
        qSortIntervalSt.pop();
        
        int midi = qSortGetMid(nums, begin, end);
    	numSwap(nums[midi], nums[begin]);				// 将取到的中值, 与数组头元素交换位置, 后边的处理中, 就会用中值做key
        
        int keyi = pointerSortAPart(nums, begin, end);	// 处理给定范围的数组
        if (begin < keyi - 1) {			// 保证入栈为有效数组区间
            qSortIntervalSt.push(begin);
            qSortIntervalSt.push(keyi - 1);
        }
        if (end > keyi + 1) {
            qSortIntervalSt.push(keyi + 1);
            qSortIntervalSt.push(end);
        }
    }
}
```

重要的地方就是, 区间的入栈和出战数据与时机

![](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/image-20240806170910381.webp)

## 复杂度

快排是将数组以一个特定的值分为两部分

所以最好的情况是, 每次划分都能将区间 平等长度的分为两部分, 此时 时间复杂度就是`O(N*log N)`

最坏的情况, 则是每次选值都选到最大值或最小值, 划分都只能将区间分为长度为`0`和长度为`n-1`的两部分, 那么 此时时间复杂度就是`O(N*N)`

但是, 根据快速排序的优化, 最坏情况是不可能出现的, 所以时间复杂度可以看作是 **`O(N*log N)`**

无论是递归还是非递归, 快速排序的空间复杂度都是 **`O(log N)`**

## 稳定性

了解了快速排序的思想和过程, 很容易就能判断出来 **快速排序是不稳定的**



# 归并排序

## 逻辑分析

归并排序, 也是一种基于分治思想的一种排序方法

归并排序的基本思想是, **将给定的数组等分为两部分, 分别对这两个子数组排序, 然后再将两个子数组按照要求顺序合并到一起**

基于分治思想, 归并排序最终会分出元素个数为1的子序列, 并一路返回 对同级子序列进行合并、排序

划分过程:

![](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/202408141152382.gif)

归并过程:

![](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/202408141157590.gif)

归并的过程本质上, 就是将 同级子序列 按照 序列元素的大小顺序 进行复原排序

归并的整个过程结束之后, 数组完成排序

> 上面只是演示 思想, 并不代表归并排序实际的执行过程

---

归并排序是分治的思想, 最简单的实现方法是递归

归并排序通过递归, 先后将数组等分为左右子序列, 直到分出的子序列长度为1, 返回并归并

既然是递归, 就会有左右先后顺序, 也就表示当左子序列长度为1 并返回之后, 才会对右子序列进行递归

可以画一个图来的展示递归的过程:

![](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/202408141543281.webp)

先递归划分左序列, 所以可以从图中看到, 第1、2、3、4次递归发生, 都是在划分左序列

直到第四次递归之后, 左序列长度为1, 才有了第1次返回

然后才有了第5次递归(第1次右序列的递归), 此时序列的长度为1, 所以返回

基于分治思想, 当子问题最小时, 就要处理问题了, 所以当第5次递归返回之后, 就要第1次处理问题了

归并排序的目的 是排序, 所以此时需要对`9`和`2`两个子序列进行合并并排序

采用的方法是, **遍历两个子序列, 将较小的数放到前面, 较大的数放在后面, 直到两个子序列合并在一起**, 合并出的结果序列有序

**当两个子序列合并成有序序列之后, 返回到上层递归. 返回之后, 如果当前层的做有子序列均已经递归完毕, 就表示左右子序列均有序, 此时, 就可以对左右子序列合并排序**

如此直到, 返回到最外层的递归中, 将左右两个有序子序列合并, 就可以实现整个数组的排序

> 有兴趣可以从图中推算一下, 什么时候会对左右子序列合并
>
> 第2次返回之后, 合并`9`和`2`, 结果`2 9`
>
> 第4次返回之后, 合并`2 9`和`3`, 结果`2 3 9`
>
> 第7次返回之后, 合并`7`和`5`, 结果`5 7`
>
> 第9次返回之后, 合并`5 7`和`1`, 结果`1 5 7`
>
> 第10次返回之后, 合并`2 3 9`和`1 5 7`, 结果`1 2 3 5 7 9`
>
> 第13次返回之后, 合并`0`和`8`, 结果`0 8`
>
> 第15次返回之后, 合并`0 8`和`4`, 结果`0 4 8`
>
> 第18次返回之后, 合并`0`和`1`, 结果`0 1`
>
> 第19次返回之后, 合并`0 4 8`和`0 1`, 结果`0 0 1 4 8`
>
> 第20次返回之后, 合并`1 2 3 5 7 9`和`0 0 1 4 8`, 结果`0 0 1 1 2 3 4 5 7 8 9`

## 代码实现

```cpp
// 归并	排序的递归函数
void _mergeSort(std::vector<int>& nums, int begin, int end, std::vector<int>& tmpNums) {
    // 如果begin和end维护的序列长度 <=1, 返回
    if (begin >= end)
        return;
    
    // 计算中间位置
    int mid = (begin + end) / 2;
    
    // 开始递归分化
    _mergeSort(nums, begin, mid, tmpNums);		// 先左子序列
    _mergeSort(nums, mid + 1, end, tmpNums);	// 再右子序列
    
    // 走到这里, 表示begin~mid 和 mid+1~end, 两序列在原数组中有序
    // 需要将这两部分进行合并, 不能直接在原数组中合并, 会覆盖还没有处理的数据
    // 在tmpNums中合并, 再拷贝到原数组对应位置
    int beginLeft = begin, endLeft = mid;		// 左子序列的开始和结束位置
    int beginRight = mid + 1, endRight = end;	// 右子序列的开始和结束位置
    // 遍历两个序列, 直到一个序列遍历结束
    while (beginLeft <= endLeft && beginRight <= endRight) {
        if (nums[beginLeft] <= nums[beginRight])
            tmpNums.push_back(nums[beginLeft++]);
        else
            tmpNums.push_back(nums[beginRight++]);
	}
    
    // 走到这里, 至少有一个序列的所有数据都已经存储到了tmpNums
    // 可能还有另外一个序列没有遍历结束
    while (beginLeft <= endLeft) {
        tmpNums.push_back(nums[beginLeft++]);
    }
    while (beginRight <= endRight) {
        tmpNums.push_back(nums[beginRight++]);
    }
    
    // 走到这里, 两个子序列已经合并在tmpNums中并有序
    // 再将tmpNums的数据, 按照对应位置映射到nums的begin~end中
    int tmpBegin = begin;
    while (begin <= end) {
        nums[begin++] = tmpNums[begin - tmpBegin];
        // 赋值, 左表达式后执行, 所以可以++
    }
    
    // 清空tmpNums
    tmpNums.resize(0);
}

void mergeSort(std::vector<int>& nums) {
    // 归并排序需要合并数组, 所以要用一个临时数组
    // 但是如果每次递归时, 都创建一个临时数组, 会有额外开销, 所以在开始递归之前, 定义一个数组
    // 向递归函数传入数组就可以了
	std::vector<int> tmpNums;
    _mergeSort(nums, 0, nums.size() - 1, tmpNums);
}
```

使用这段代码进行排序:

![](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/202408141654634.webp)

可以完成排序

并且, 与上面推测的归并次数与元素一致

## 非递归实现

与快排的非递归实现不同, 归并排序的非递归实现并不需要借用栈来模拟函数栈帧的创建与销毁

归并排序, 实际上是对数组划分小区间, 然后归并, 直到所有小区间归并完毕, 则所有小区间有序

再对数组划分大区间, 然后归并, 直到所有大区间归并完毕

所以, 非递归可以直接对数组进行:

1. 一一分组, 区间归并
2. 两两分组, 区间归并
3. 四四分组, 区间归并
4. 八八分组, 区间归并
5. ...

直到将整个数组只能分为两部分, 并归并结束

```cpp
void nonRecursiveMergeSort(std::vector<int>& nums) {
    std::vector<int> tmpNums;

    int gap = 1;
    // 从间隔为1开始, 对间隔区间内的数据进行归并
    while (gap < nums.size()) {
        for (int i = 0; i < nums.size(); i += gap * 2) {
            int beginLeft = i, endLeft = i + gap - 1;                         // g = 1, 0 0,  2 2
            int beginRight = i + gap, endRight = i + 2 * gap - 1; // g = 1, 1 1,  3 3

            // 因为是以固定的间隔规律进行 区间划分的, 所以要判断一下, 区间是否在数组内
            // 首先, beginLeft 不会越界, 因为以i赋值
            // 所以要判断其他三个
            if (endLeft >= nums.size())
                    endLeft = nums.size() - 1;

            if (beginRight >= nums.size()) // 第二个区间不存在
                    endRight = nums.size() - 1;
            else if (endRight >= nums.size())
                    endRight = nums.size() - 1;

            // 开始归并 [beginLeft, endLeft] 和 [beginRight, endRight]

            while (beginLeft <= endLeft && beginRight <= endRight) {
                    if (nums[beginLeft] < nums[beginRight])
                            tmpNums.push_back(nums[beginLeft++]);
                    else
                            tmpNums.push_back(nums[beginRight++]);
            }

            while (beginLeft <= endLeft) {
                    tmpNums.push_back(nums[beginLeft++]);
            }

            while (beginRight <= endRight) {
                    tmpNums.push_back(nums[beginRight++]);
            }
        }
		// 退出for循环, 则表示以gap为间隔进行划分区间, 并对区间两两归并完毕
    	// 向原数组中赋值
    	nums.swap(tmpNums);
    	tmpNums.resize(0);

    	gap *= 2;  // 扩大间隔, 扩大下次划分区间的间隔
    }
}
```

![](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/202408141948002.webp)

## 复杂度

空间复杂度, 因为是递归 并且使用了额外空间来合并、存储序列, 所以空间复杂度为`O(N)`

非递归使用了额外的空间来记录所以, 也是同样的空间复杂度为`O(N)`

时间复杂度, 每次将数组分为等分子序列, 且需要递归, 所以时间复杂度为`O(N*log N)`

## 稳定性

归并排序, 是在原数组的基础上, 直接将原数组等分为左右两部分进行处理

所以, 相同元素的相对位置, 在归并排序前后 是不会发生变化的

因为划分左右子序列是直接根据数组长度划分的, 在左边的就会在左边, 在右边的就会在右边

所以, **归并排序是稳定的**

# 计数排序

## 逻辑分析

计数排序, 使用了哈希的思想, 将原数组中的数据, 映射到另一个数组中

映射的位置 需要与数据的大小有关, 举个简单的例子解释:

存在原数组`nums`, 映射计数数组`count`

如果, `nums[i] = 1`, 那么就可以将`nums[i]`映射到`count[1]`位置

如果, `nums[i] = 10`, 那么就可以将`nums[i]`映射到`count[10]`位置

即, `nums`数组的值 作为`count`数组的下标

`nums`中的所有数据按照这样的思路在`count`中之后, 遍历`count`, 其实就可以按照数据大小的先后顺序遍历所有数据

并且, 在遍历`count`的过程中, 将数据在按照顺序放入`nums`数组中, 就可以实现队员数组的内容进行排序

而`count`中对应数据的映射位置也不会存储原数据, 而是记录映射数据的个数

这样在遍历`count`时, 就可以将原数组中相同的数据一起放入`nums`中

具体的映射思路, 大概可以这样演示:

![](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/countSort_count.gif)

那么, 实现排序的思路, 大概就可以这样演示:

![](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/countSort_sort.gif)

映射计数的过程很容易理解, **如果数值为n, 那么就将 映射数组的n位置数值++**

而之后实际执行的排序过程呢? 向`nums`中赋值的规则是什么?

映射计数完毕之后, 向`nums`中赋值的过程就是排序的过程

整个过程是这样的

1. 遍历映射数组

2. 如果`count[n] > 0`, 就将`n`放置在原数组中, 同时`count[n]--`

    在原数组中放置数据的过程中, 在原数据中位置是从`0`开始的, 每放置一个数据位置向后移

3. 直到映射数组中的所有元素都为`0`, 可以看作数据全部按大小顺序还原到原数组中

## 代码实现

计数排序的逻辑就是上面介绍那样, 不过代码实现还要考虑另一个映射的实际问题

如果直接将`count`开辟为`max(nums)`的大小, 那么`count`数组中`min(nums)`位置之前的空间就都被浪费了, 因为不会有数据放在其中

所以, 一般将`min(nums)`映射在`count[0]`

所以, **`count`的大小应该是`max-min+1`, 映射时, 也应该对 `数据-min`进行映射, 还原时也应该`+min`**

所以, 相应的代码实现:

```cpp
void countSort(std::vector<int>& nums) {
    // 找nums中的最大值和最小值
    int max = nums[0], min = nums[0];
    for (auto e : nums) {
        if (e > max)
            max = e;
        if (e < min)
            min = e;
    }
    
    std::vector<int> count(max - min + 1); 	// 构建count数组
    for (int i = 0; i < nums.size(); i++) {
        count[nums[i] - min]++;				// 映射并计数
    }
    
    int j = 0;
    for (int i = 0; i < count.size(); i++) {
        while (count[i]-- > 0) {			// 将count[i]清零
            nums[j++] = i + min;
        }
    }
}
```

使用这段代码进行排序:

![](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/image-20240808093551574.webp)

由于计数排序需要开辟的数组空间过大, 所以就不展示过程, 直接展示结果

从结果来看是可以完成排序的

## 复杂度

计数排序的时间复杂度变化很大, 因为与数据的极值有关

**如果`max-min <= nums.size()`, 那么就是`O(N)`, 否则就是`O(max-min)`**

向上面的例子中, 极值为`2`和`64576`, 差值为`64574`, 那么在排序时 遍历`count`数组, 循环就需要执行`6w`多次, 而实际上`nums.size()`才`18`

`6w`多次的循环, 比`18`的`3`次方的十倍还要多

所以, **计数排序比较适合极值差较小的数组之间的排序**

**空间复杂度也是`O(max-min)`**

## 稳定性

计数排序可以实现为稳定的

计数排序是将原数组的数据从头至尾, 映射到另一个数组中, 如果是相同的元素, 也会可以看作按照对应的顺序在`count`数组中计数的

即, 如果映射统计的过程中, 先后遇到了 `6 6 6 6 6`, 那么`count[6]`最终值就等于`5`

此时, **可以将最后一个计数看作是最后一个`6`**, 即`count[6]==5`时, 表示的是最后一个`6`

那么此时, **如果排序的过程是从原数组尾开始赋值的, 那么就可以说此时的计数排序是稳定的**

**反之, 则可以说此时的计数排序是不稳定的, 因为相同元素的相对位置刚好相反**

# 堆排序

## 逻辑分析

如果了解二叉树 和 大根堆、小根堆的建立, 那么堆排序的逻辑就比较简单

**堆排序, 就是对给定数组的所有数据减小根堆或大根堆**

然后, **记录根, 删除根, 然后在新堆的基础上, 调整建 大根堆或小根堆**

重复上面的过程, 直到堆只剩下一个根, 并记录此根

那么, 负责记录根的数组, 就是已经完成了排序的数组

**堆排序最重要的部分, 就是建立大根堆和小根堆的方法**

什么是大根堆?

堆是具有特殊规则的完全二叉树, 堆有很多种

在树中, 每一个节点, 都可以 以此作为根 看作一颗新树

而 **大根堆, 就是 如果把每一个节点都看作一棵树的根节点, 那么可以保证根节点是其所在树中, 所有节点中最大的**

**即, 一棵树的中, 一个节点的子节点一定<=此节点**

**也可以换一种说法, 一个节点的父亲节点, 一定>=此节点**

小根堆则相反

那么, 对一个数组的所有数据建立大根堆, 则 根就是整个数组中最大的数

删除根, 修正新堆为大根堆, 则 根就是整个数组中第二大的数

重复此操作, 那么就能逐一选出数组中第n大的数, 从而完成排序

---

那么, 如何建立一个大根堆呢?

先看一下建立大根堆的一种方法的过程:

![](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/202408151007587.gif)

上面展示的是 **向下调整** 的方法, 来调整一颗树, 将树调整为一个大根堆

向下调整的思路是:

1. 提供一棵树的根, 如果此树拥有子节点, **根记录为父节点, 其左右子节点的较大节点记录为子节点**
2. **对比父节点与字节点的大小, 如果子节点大, 则父子结点交换位置**
3. 交换完成之后, 父节点的新位置, 记录做新的父节点
4. 将新的父节点, 当作一棵树的根, 重复上面的操作, 直到新的父节点不存在子节点
5. 此时, 完成向下调整

向下调整, 是将不满足要求的根节点向下曾调整, 将整棵树保持为大根堆

但 **此方法的前提是, 当前的根节点下面的子树, 已经是大根堆了**, 此时, 才能堆当前树向下调整建立大根堆

像上面的演示中, 将`10`节点的左子节点`20`作为一个树的根 进行向下调整时, `20`节点的两颗子树已经是大根堆了

所以, 对一棵非大根堆的完全二叉树来说, 该怎么样进行调整呢?

对一棵普通的完全二叉树来说, **在开始对某个子树进行向下调整之前, 要确保此子树的子树已经是大根堆**

而一棵普通的完全二叉树, 不可能每棵子树都是大根堆, 不然这棵树就已经是大根堆了

所以, **要对一棵普通的完全二叉树进行 调整建立大根堆, 就要从最后一个非叶子节点开始**

原因:

1. 叶子节点, 不存在子节点, 不需要调整
2. 对完全二叉树来说, 最后一个非叶子节点 的子节点, 必定是叶子节点, 也就表示最后一个非叶子节点的子树可以看作是一个大根堆

在上面的演示中, `22`节点就是最后一个非叶子节点

---

对一棵二叉树, 调整方式很形象, 因为在树中可以直接通过节点找孩子

对数组, 则可以通过数组下标将数组看作一棵完全二叉树, 然后进行调整

怎么将数组看作一棵完全二叉树:

假如存在一个数组: `[10, 20, 20, 4, 22, 2, 4, 11, 7, 25, 2]`

那么, 这个数组怎么看作一棵完全二叉树?

其实很简单, 按照下标顺序排列就可以了:

![](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/202408151149717.webp)

即, 将一个数组看作一棵完全二叉树, 只需要将数组数据按照数组的下标顺序排列, 就可以将其看作一棵完全二叉树

找到其规律, 就可以找到最后一个非叶子节点, 然后就可以进行大根堆调整

然后就可以删除根, 进行堆排序

**将数组看作完全二叉树, 最后一个非叶子节点怎么算? **

反过来, 如果知道最后一个非叶子节点的下标i, 怎么计算其子节点的下标?

左孩子: `2 * i + 1`, 右孩子: `2 * i + 2`

而数组的最后一个元素, 一定是最后一个非叶子节点的孩子节点, 所以 **可以根据最后一个叶子节点的下标来计算其父节点的下标**

如果, 最后一个叶子节点是左孩子, 那么数组元素个数就是偶数, 那么`size / 2 - 1`和`(size + 1) / 2 - 1`的结果是相同的, 都是其父亲节点的下标

`size / 2 - 1` 表示只有左孩子时, 根据`size`计算父节点下标

那么, `(size + 1) / 2 - 1`就可以表示有右孩子时, 根据有左孩子时的`size`计算父节点下标

那么, 无论有没有右孩子, 都可以直接用`size / 2 - 1`计算父节点的下标

## 代码实现

```cpp
void numSwap(int& num1, int& num2) {
        int tmp = num1;
        num1 = num2;
        num2 = tmp;
}

// 建立大根堆 向下调整 函数
void bigRootAdjustDown(std::vector<int>& nums, int size, int root) {
    // 传入数组 和 数组下标作为需要调整的树的根节点
    // 另外这里传入的size不代表数组的总长度, 而是 可以看作是完全二叉树的数据的长度
    // 也就是 size 之后的数据, 不需要调整
    // 要处理的数据范围是[0, size)
    
    // 记录 parent 和 child(左孩子节点, 因为右孩子不一定存在)
    // 根据完全二叉树的特点, 计算一个节点的左孩子节点下标
    int parent = root;
    int child = parent * 2 + 1;
    while (child < size) {
		// child 默认表示左孩子, 要判断左右孩子谁大
        if (child + 1 < size && nums[child] < nums[child + 1])
            child++;			// 右孩子大, child += 1 记录右孩子下标
       	
        if (nums[parent] < nums[child]) {
			numSwap(nums[parent], nums[child]);
            parent = child;
            child = parent * 2 + 1;
        }
        else {		// 已经是大根堆了
			break;	// 不需要再向下走, 此次调整完毕
        }
    }
}

void heapSort(std::vector<int>& nums) {
    // 先建立 大根堆
    // 从最后一个非叶子节点开始
    for (int index = nums.size() / 2 - 1; index >= 0; index--) {
		bigRootAdjustDown(nums, nums.size(), index);
    }
    
    // 大根堆建立完成
    // 正式开始堆排序
    // 进入循环之前, 数组首元素已经是最大值, 所以先将首元素与尾元素调换位置
    // 并缩减需要 向下调整处理的数据范围
   	// 直到 缩减到 0
    int end = nums.size() - 1;	// 需要处理的数据范围 [0, end)
    while (end > 0) {
        numSwap(nums[end], nums[0]);
        bigRootAdjustDown(nums, end, 0);
        end--;					// 缩减end
    }
    // 排序完毕
}
```

使用堆排序进行排序:

![](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/202408151504548.webp)

可以完成排序

## 复杂度

堆排序, 在原数组上排序 只用了常数大小的内存空间, 所以 **空间复杂度为`O(1)`**

而在时间上, 建立大根堆之后, 需要循环N次实现对所有元素建立大根堆, 建立大根堆的过程最坏情况是log N, 所以 **堆排序的时间复杂度为O(N*log N)**

## 稳定性

堆排序需要不停调整数据的位置, 所以可能会导致相等数据的相对位置发生改变, 所以 **堆排序是不稳定的**