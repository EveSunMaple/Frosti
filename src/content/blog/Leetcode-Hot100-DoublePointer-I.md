---
draft: true
title: "[Leetcode] 力扣 热题100道--双指针1: 283. 移动零(简单)"
pubDate: "2024-07-27"
description: "给定一个数组 nums, 编写一个函数将所有 0 移动到数组的末尾, 同时保持非零元素的相对顺序"
image: https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/image-20240729095253735.webp
categories:
    - Blogs
tags:
    - Leetcode
    - 算法题
---

# 283. 移动零

这是LeetCode 热题100中, 双指针相关的第一道题

![|inline](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722160159458.webp)

## 题意分析

结合描述以及题目给出的示例, 可以很直观的看出题目的要求

题意大概是: 

**给定一个无序数组`nums`, 数组元素包含若干个0, 在不额外开辟空间的基础上, 将原数组中所有的0移动至数组的末尾, 且不改变其他元素的相对位置**

题目有两个要求: 1. 将所有0移动至数组末尾; 2. 其他元素相对位置不变

画图可以更加直观得理解 题目的意思:

原数组 `nums = {0, 1, 0, 3, 12}`

![|inline](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722160201851.webp)

结果数组 `nums = {1, 3, 12, 0, 0}`, `1, 3, 12`相对位置保持不变, `0`移动至数组末尾

## 思路分析

如果题目只有一个要求: 将所有0移动至数组末尾

那么, 这道题就非常简单

1. 指针`left`指向数组首元素, 指针`right`指向数组末尾元素
2. 两指针逐步向数组中间靠拢, **`right`遇到非0停止, `left`遇到0停止**
3. 交换两指针指向元素, 直到`left >= right`

但是很明显, 此时非零元素之间的相对位置会发生改变, 无法满足本题目要求

既然无法直接将0移动至数组末尾, 那就从数组左边开始逐个遍历数组元素, 在合适的时机将0移动到数组末尾

定义两个指针, 都从数组首元素开始:

![|inline](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722160204102.webp)

两指针向右移动, left指针找0, right指针找非0值, 分别找到对应位置之后, 交换数据:

![|inline](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722160206349.webp)

一次交换完成之后, 继续left指针找0, right指针找非0值:

![|inline](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722160209093.webp)

left和right移动的满足条件的位置, 又可以交换数据了

而此时, 观察分析可以确定: 

1. left指针左边 所有数据均是已经处理过的数据, 即 left指针左边元素不存在0;
2. left指针 与 right指针之间的数据, 均为0; `[left, right)`
3. right指针右边 则是待处理的数据

在一个短数组中, 现象好像并不是很明显

不过可以, 分析一下: 

left指针是逐步向右移动的, 遇0才停, 那么可以确定 left左边不可能存在0

right指针也是逐步向右移动的, right指针除了初始位置与left相同, 其他时刻恒在left指针的右边, 且遇非0才停, 那么可以确定 left 到 right 之间不可能存在非0数据

此时, left和right两个指针将整个数组分为了3部分:

1. [0, left), 全 非0
2. **[left, right), 全0**
3. [right, n], 未处理

我们只需要按照上面的步骤, `left`找0, `right`找非0, 就能保证数组被正确的分为三部分

最终, 当`right`指向数组尾元素, 并完成数据处理之后, `[left, right]` 全0

这也就对数组完成了处理, 保证了所有0被移动到数组的末尾

并且, 因为`left`和`right`均是逐步从左向右移动的, 所以 不会造成非0元素的相对位置发生改变的情况

至此, 完成题目要求

## 代码实现

```cpp
class Solution {
public:
    void moveZeroes(vector<int>& nums) {
        // 定义left 和 right
        int left = 0, right = 0;
        
        // right移动到数组末尾之前, 循环不结束
        while (right < nums.size()) {
			if (nums[right] != 0) {
                swap(nums[left], nums[right]);
                left++;
            }
            right++;
        }
    }
};

```

1. 定义`left`和`right`, 用来表示数组位置, 都从0开始

2. 数组处理结束的标志是: `right`指向数组最后一个元素, 所以循环结束条件为`right == nums.size()`

3. 循环体, 每次循环`right++`, 当下次循环时`nums[right] != 0`时, 表示`right`满足数据交换的那条件

    然后, 对数据进行处理

4. 当此次循环满足`nums[right] != 0`, 直接交换 `left`和`right`指向位置的数据, 并`left++`

这里有一个疑问: **`left`为什么只在`nums[right] != 0`时, 才++? `left`不应该找0吗?**

在思路分析中, 当 **`left`和`right`刚好达成交换条件** 时, 将数组分为了三部分:

1. [0, left), 全 非0
2. **[left, right), 全0**
3. [right, n], 未处理

因为 **`left`遇到0就不再移动了, `right`遇到非0也不再移动**, 所以 在可以交换数据的条件 满足的情况下 **[left, right)位置上的数据均为0**

那么, 在交换完 `left`和`right`位置的数据之后, `left++`就可以保证`nums[left] == 0`, 除非, `left`的下一位就是`right`, 那么此时`left`和`right`可能均没有遇到数组中的第1个0

**在left和right均没有遇到数组中的第1个0时, left和right可以看作一起向右移动, 因为right!=0时, left++**

所以, **数组中的第1个0 left和right可以看作是一起遇到的**, 而此时left会停止移动, right则会继续找非零值

直到 满足 可以交换数据的条件

![|lwide](https://humid1ch.oss-cn-shanghai.aliyuncs.com/20250722160213109.webp)
