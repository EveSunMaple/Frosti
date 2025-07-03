---
draft: true
title: "[数据结构] AVL-Tree平衡二叉搜索树的相关分析及实现"
pubDate: "2022-10-11"
description: "AVL树 是最早被设计出来的平衡二叉搜索树"
image: https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/202306251813180.webp
categories:
    - Blogs
tags:
    - 数据结构
    - 二叉平衡搜索树
---

上一篇文章介绍了`map` `multimap` `set` `multiset`, 并且提到过 这些容器的 底层都是**红黑树**实现的

之前介绍过 什么是二叉搜索树, 但是二叉搜索树有一个缺点就是 在特定的情况下插入数据, 可能会创建一个单边树

这也是为什么`set`和`map`不使用二叉搜索树, 而是用红黑树的原因

红黑树是平衡二叉搜索树的一种

本篇文章介绍的数据结构 也是一种平衡二叉搜索树, 但并不是 红黑树 而是**AVL树**

AVL树 是最早被设计出来的平衡二叉搜索树

# 平衡二叉搜索树

关于 平衡二叉搜索树, 除了它是二叉搜索树之外, 最重要的特点莫过于 平衡 

对二叉树而言 怎么样才算平衡？

平衡树: 任意节点的子树的高度差的绝对值都小于等于 1

> 任意节点的子树高度差的绝对值都 <= 1, 这句话是什么意思？
>
> 首先要明白 什么是节点的子树的高度差: 
>
> ![|small](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/202209052035064.webp)
>
> 以上面这棵二叉树为例: 
>
> 1. 对于`3`节点, 其左子树的高度为`3`, 右子树的高度为`2`
>
>     则可以说, `3`节点的子树的高度差 为 -1
>
> 2. 对于`5`节点, 其左子树的高度为`1`, 右子树的高度为`2`
>
>     则可以说, `5`节点的子树的高度差 为 1
>
> 3. 对于`2`节点, 其左子树的高度为`1`, 右子树的高度为`1`
>
>     则可以说, `2`节点的子树的高度差 为 0
>
> 也就是说, 节点的子树的高度差, 可以根绝节点的左右子树的高度来计算, 且计算时 左子树高度为负数, 右子树高度为正数
>
> 那么可以计算出上面这棵树的所有结点的高度差: 
>
> - `3:-1` `5: 1` `6: 0` `2: 0` `7: 0` `4: 0` `1:-1` `0: 0`
>
> 所有结点的子树高度差的绝对值都没有大于 1, 所以可以说上面这棵树是一颗平衡树

那么 平衡二叉搜索树, 就是在此树 满足二叉搜索树的结构规则的前提 下, 还要满足平衡

即, 一棵树同时满足这两个条件 就可以称此树是平衡二叉搜索树: 

1. 任意节点的子树的高度差的绝对值都小于等于 1
2. 任意节点的左孩子恒小于此节点, 右孩子恒大于此节点

## AVL 树

### AVL树 的概念

构建二叉搜索树存在一个缺点是 如果数据有序或接近有序 构建二叉搜索树

构建完成时会发现此树为单支树, 查找元素相当于在顺序表中查找, 时间复杂度接近`O(N)`

两位俄罗斯的数学家 **G.M.Adelson-Velskii** 和 **E.M.Landis** 发明了一种解决上述问题的方法:

**插入数据建立二叉搜索树的同时, 通过调整节点关系 使每个结点的左右子树高度差不超过 1, 进而建立出平衡二叉搜索树 可降低树的高度, 从而减少平均搜索长度**

由**G.M.Adelson-Velskii**和**E.M.Landis**提出的此方法构建出的 平衡二叉搜索树, 就被称为`AVL树`

### AVL树 节点的定义

AVL树的是一种三叉链结构, 即 每个节点除左右孩子、数据之外, 还存有父亲节点

为了方便得出每个节点的子树高度差, 所以还可以存储一个变量来记录左右孩子的高度差, 一般被称为**平衡因子**

所以, **`AVL树`的节点结构**可以设计为: 

![|big](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/202209052153361.webp)

> 当然 在节点内存储平衡因子并不是必须的, 也可以通过其他方法记录

### AVL树 插入数据

**AVL树**是平衡二叉搜索树, 建立的过程 是在 二叉搜索树的前提下, 调整节点构建出来的. 而树的构建过程, 其实也就是树节点插入的过程

那么, AVL树执行插入操作之后, 也就需要保证 结果树依旧是一个AVL树

不过, 在插入新节点之前需要保证 树已经是AVL树

所以, AVL树插入数据的过程可以大致分为 两个步骤: 

1. 按照二叉搜索树的插入方式插入新节点
2. 分析节点的子树高度差, 并进行调整

下面也按照这两个步骤来对 AVL树的插入操作进行分析: 

**按照二叉搜索树的插入方式插入新节点**

二叉搜索树的特点是: 节点的左孩子比节点小, 节点的右孩子比节点大

所以, 插入新节点就需要通过比较新节点与各个节点的大小, 找到合适的位置, 然后再将新节点连接到树中: 

```cpp
bool insert(const T& data) {
    // 首先按照 二叉搜索树的方式 查找插入位置并插入节点
    if (_root == nullptr) {
        // 树为空 插入节点 直接将新节点作为树的根
        _root = new Node(data);
        _root->_bf = 0;		// 只有根节点的树, 根节点平衡因子为 0

        return true;		// 插入成功, 直接返回
    }

    // 走到这里就说明需要 查找插入位置 了
    Node* cur = _root;	// 从根节点开始比较
    Node* parent = nullptr;	// 需要记录父亲节点 供插入时连接
    while (cur) {
        // 循环结束的条件是 cur为空, cur为空时就说明 插入位置找到了
        if (cur->_data > data) {
            // 插入值比当前节点值 小, 则向左孩子找
            parent = cur;
            cur = cur->_pLeft;
        }
        else if (cur->_data < data) {
            // 插入值比当前节点值 大, 则向右孩子找
            parent = cur;
            cur = cur->_pRight;
        }
        else {
            // 走到这里 说明数中已存在相同数据
            return false;
        }
    }

    // 出循环之后, cur 即为数据需要插入的位置
    cur = new Node(data);
    // 将cur与树连接起来
    if (data > parent->_data) {
        parent->_pRight = cur;		// 插入数据比父亲节点数据大, 则插入到父亲节点的右孩子
    }
    else if (data < parent->_data) {
        parent->_pLeft = cur;			// 插入数据比父亲节点数据小, 则插入到父亲节点的左孩子
    }
    // 三叉链结构, cur节点虚存储父亲节点
    cur->_pParent = parent;
}
```

二叉搜索树的插入已经轻车熟路了, 不过这并不是AVL树的重点, AVL树插入数据 最重要的、也是最难理解的部分 其实是: 

**插入数据之后, 对各个节点的平衡因子的分析, 以及对不平衡树的平衡操作**

---

在树中插入新的结点之后, 很有可能会造成树的不平衡, 举几个简单的例子: 

**分析节点的子树高度差, 并进行调整**

插入之后, 存在不会失衡的情况:

**7节点平衡因子, 从 1或-1 到0**:

![|huger](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/image-20230313201737882.webp) 

**7节点平衡因子 从 0 到 1或-1**:

![|huger](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/image-20230313201850541.webp) 

当然也有 使树失去平衡的情况: 

**21节点 平衡因子从 1 到 2**:

![](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/image-20230313202304687.webp)

**21节点 平衡因子从 -1 到 -2**: 

![](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/image-20230313202340833.webp) 

AVL树插入新节点之后, 一些节点的平衡因子一定会发生变化, 进而可能会对整棵树产生一定的影响

如果因为插入新节点, 导致某个节点的平衡因子的绝对值 >1, 那么就说明树不平衡了, 需要进行调整

在实际的插入过程中, **插入新节点之后**首先要做的并不是调整树的平衡, **首先要做的是调整新插入节点的祖先节点的平衡因子**
因为**插入新节点会改变其位置的祖先节点的平衡因子**

那么, 插入新节点之后首先要解决的问题就是: **如何更新新节点的祖先节点的平衡因子？**

其实并不难, 因为 AVL树的节点结构是 三叉链的结构, 所以可以**从新节点向上寻找父亲节点**来进行更新

但, 实际上并不是每一个祖先节点都需要更新平衡因子

对下面 这个稍微复杂的 刚插入一个新节点的 AVL树进行分析: 

![](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/image-20230313202436441.webp) 

黑色为未插入新节点的 AVL树, **绿、综、红表示在不同位置插入新节点**

1. 如果在 绿色 位置插入

    则**31节点平衡因子 由 0 变为 -1, 进而 22节点平衡因子由 -1 变为 0**

    **不再向上影响, 停止更新**

2. 如果在 棕色 位置插入

    则**46节点平衡因子 由 0 变为 -1, 进而 41节点平衡因子由 1 变为 2**

    **以 41节点为根的树失衡, 需要进行调节 保持平衡**

3. 如果在 红色 位置插入

    **77节点平衡因子 由 0 变为 -1, 进而 70节点平衡因子由 0 变为 1, 进而 82节点平衡因子由 -1 变为 -2**

    **以 82节点为根的树失衡, 需要进行调节 保持平衡**

可以发现:

1. **祖先节点平衡因子的变化 会影响 更上层的祖先节点的平衡因子时, 会继续向上对祖先节点进行调节**
2. **某祖先节点的平衡因子变为 2或-2, 导致以此节点为根的树失衡时, 需要停下对此树进行调节**, 以保持平衡
3. 存在**一直向上更新祖先节点的平衡因子, 直到更新到整棵树的根节点**的可能

根据这三种情况, 就可以分析出 如何向上更新祖先节点的平衡因子

1. 首先要记录 当前节点 和 节点的父亲节点
2. 如果当前节点 是 父亲节点的左孩子, 则父亲节点的平衡因子-1, 否则+1
3. 当父亲节点的平衡因子 变为 1或-1 时, 还会影响上层的祖先节点, 所以需要继续向上更新
4. 当父亲节点的平衡因子 变为 2或-2 时, 以此父亲节点为根的树失衡, 需要对此树进行调节
5. 当父亲节点的平衡因子 变为 0 时, 不会继续影响上层祖先节点, 所以停止向上更新
6. 因为 可能更新到整棵树的根节点, 所以循环需要设置到 根节点结束

经过分析, 可以更新祖先节点的平衡因子的操作可以这样写: 

```cpp
// cur 是插入后的新节点
cur->_pParent = parent;

while (parent) {
    if (cur == parent->_pLeft)
        parent->_bf--;			// 新节点在父亲节点的左孩子, 则父亲节点的左子树高度+1, 则父亲节点的平衡因子-1
    else
        parent->_bf++;

    // 更新完之后, 就需要判断 需要继续更新 还是停止更新 或是调整平衡
    if (parent->_bf == 0) {
        // 不会再影响更上边的节点, 可以结束
        break;
    }
    else if (parent->_bf == -1 || parent->_bf == 1) {
        // 可能会继续影响更高节点的平衡 所以需要更新parent 和 cur, 进而继续更新祖先节点的平衡因子
        cur = cur->_pParent;
        parent = parent->_pParent;
    }
    else if (parent->_bf == -2 || parent->_bf == 2) {
        // 需要调整平衡了
    }
    else {
        // 以上情况都是在 保证树已经是AVL树时 插入新节点
        // 如果不是 则会走到此处 触发断言 进而发现错误
        assert(false);
    }
}
```

祖先节点的平衡因子更新完成之后, 就需要对失衡的树进行调节了

处理失衡的树, 采用的方法是: **旋转**

---

#### 旋转调平

当 某节点的平衡因子的绝对值为2时, 需要对以此节点为根的树 进行**旋转调平**

即使树根的平衡因子的绝对值为 2, 整棵树的也会存在不同的实际情况, 而针对不同的情况 需要进行的旋转操作也是不同的

##### 左单旋

左单旋 处理的情况一般是这样的: 

![ |wide](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/image-20230313202638297.webp)

**某AVL树的根节点平衡因子为1(即此树右子树高度), 且又在此树的右子树中 插入新节点导致右子树高度再增加, 进而导致此树失衡**

此时, 需要**左单旋** 操作 将此树调平

究竟什么是 **左单旋** ？

要解释**左单旋** , 就需要对此种情况具体分析: 

1. `h = 0`

    `h = 0`, 即说明 A、B、C树为空

    此时 在C树中插入新节点, 其实就是在 N节点的右孩子处 插入新节点

    ![ |wide](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/image-20230313202758090.webp)

    此时 树失衡, 需要 将树调平

    根据**右孩子大**的特点, 假设 `M=10` `N=20` `X=30`

    要怎么调节才能将树变得平衡？

    在此树中 很简单, 只需要将树的结构这样变化: 

    ![三个节点都在, 且树平衡  |wide](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/image-20230313202857274.webp) 

     好像只是**将N(20)节点的父亲节点M(10)节点 变成了, N节点的左孩子**

2. `h = 1`

    A、B、C树的高度为 1, 在 C 树中插入新节点: 

    ![|wide](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/image-20230313203119573.webp)

    树失衡, 需要调平

    此时又该怎么调整树的结构呢？

    其实也很简单, 将60节点的左孩子 变成40节点的右孩子, 再将40节点 作为60节点的左子树, 让60节点变为树的根, 将树变为这样: 

    ![|wide](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/image-20230313203159437.webp)

    将**60的左孩子变为其父亲节点的右孩子, 再将 60节点的父亲节点 变为 60节点的左孩子**

3. `h = 2`

    A、B、C 树的高度是 2, 在 C 树中插入新节点

    在分析`h = 1`时, 可以看到 新节点插入的位置 可以有两个, 那么`h = 2`时, 只会更多

    ![(虚线, 表示其他可插入位置)  |wide](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/image-20230313203747704.webp)

    A、B 树各3种情况, C树只能是第3种高度为2的二叉树, 则新节点存在 4 个可插入位置

    所以`h = 2`时, 共有`36`种结构

      > 为什么 C树只能是第三种情况的树？
      >
      > 如果 C树是前两种情况, **可能出现非左单旋处理的情况, 而我们此时讨论的只是需要左单旋处理的情况**

    此时 树不平衡, 需要调平

    如何调整？

    稍微有些难想, 但是 根据之前的经验: 

    将**40节点的左子树 变为 其父亲节点的右子树, 再将 40节点的父亲节点 变为 40节点的左子树**:

    ![ |wide](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/image-20230313203600258.webp)

    树结构平衡

4. `h = 3` `······`

5. `······`

更复杂的情况还有, 但是分析到 h=2 应该就可以看出, 即使h再大, 对于

**某AVL树的根节点平衡因子为 1(即此树右子树高), 且又在此树的右子树中 插入新节点导致右子树高度再增加, 进而导致此树失衡**的这种情况, 其实可以用相同的方法解决

对比一下, h不同时 插入新节点 导致树失衡 再到 平衡的过程: 

![ |wide](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/image-20230313202857274.webp)

![ |wide](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/image-20230313203159437.webp)

![ |wide](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/image-20230313203600258.webp)

可以发现, 如果**将平衡因子为2的节点 为`parent`, 其右孩子节点 为`subR`**, 则此类情况的调整平衡的具体操作 其实是: 

**将`subR`的左孩子 变为`parent`的右孩子, 再将`parent`变为`subR`的左孩子**

![ |wide](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/image-20230313204053412.webp)

执行此操作之后, 树的结构就平衡了, **此操作也就是左单旋操作**

但是如果只改变结构, 整棵树其实还是不正确的, 因为**只动了结构, 平衡因子还没有更新**

观察可以发现, 左单旋操作之后, `parent`和`subR`的平衡因子变为了 0, **其他节点的平衡因子并没有改变**

所以, 左单旋操作的 代码实现可以是: 

```cpp
void RotateL(Node* parent) {
	Node* subR = parent->_pRight;		// 即 不平衡节点的右孩子
	Node* subRL = subR->_pLeft;			// 不平衡节点的右孩子 的 左孩子

	/* parent 可能是 整棵树的根, 也可能是某节点的子树根
	* 而 由于AVL树的节点是三叉链的结构, 所以改变节点的位置 需要改变此节点的父亲节点, 所以
	* 当 parent 是整棵树的根时, 即parent->_pParent 为空, 那么左旋时 就需要直接将 subR改为整棵树的根
	* 当 parent 是某节点的子树时, 就需要将 parent->_pParent 与 subR 连接起来
	* 所以 需要将 parent->_pParent 存储起来
	*/
	Node* ppNode = parent->_pParent;

	// 不平衡节点的右孩子的左孩子 变为 父亲节点的右孩子, 并将 父亲节点 变为 此节点的左孩子
	// 并记得 链接三叉链
	parent->_pRight = subRL;
	if (subRL)
		subRL->_pParent = parent;

	subR->_pLeft = parent;
	parent->_pParent = subR;

	// 改变不平衡节点 的 父亲节点的指向
	if (parent == _root) {
		_root = subR;
		_root->_pParent = nullptr;
	}
	else {
		if (parent == ppNode->_pLeft)		// 不平衡节点是其父亲节点的左孩子
			ppNode->_pLeft = subR;			// 把 subR 连接到 其父亲节点的左孩子上
		else
			ppNode->_pRight = subR;			// 把 subR 连接到 其父亲节点的右孩子上

		subR->_pParent = ppNode;		// 更新 subR 的父亲节点
	}

	parent->_bf = 0;
	subR->_bf = 0;
}
```

**注意:**

1. 三叉链的连接

    AVL树的节点的结构是 三叉链结构, 除左右孩子指针之外 还存在一个存储父亲节点地址的 父亲节点指针

    所以在调节平衡 改变节点的位置 或 关系的时候, 需要 特别注意 父亲节点的链接

2. 不平衡节点的父亲节点为空时的处理

    不平衡节点的父亲节点为空, 也就是说 平衡因子的绝对值为 2 的节点 其实就是整棵树的根

    此时 需要单独处理, 因为是整颗树的根, 所以旋转之后`subR`节点应该变为整棵树的根

3. 不平衡节点的右孩子的左孩子为空时的处理

    因为, 需要三叉链需要链接父亲节点, 

    所以, 在左单旋中, 由于`subR`节点的左孩子变成了`parent`节点的左孩子, 那么`subR`节点的左孩子的父亲节点就需要变为`parent`节点

    但是如果`subR`节点的左孩子为空, 就不能链接, 因为不能通过 空指针访问节点内容

**左单旋**, 用于处理**某 AVL树的根节点平衡因子为1(即此树右子树高), 且又在此树的右子树中 插入新节点导致右子树高度再增加, 进而导致此树失衡** 的情况

> 经过上面的分析, 可以知道 此种情况的特点是: **不平衡节点必须是因为右孩子的右子树高而不平衡的**
>
> 也就是说
>
> 当`parent->_bf == 2 && cur->_bf == 1`成立时, **才会左单旋进行调平**
>
> 并且, 左单旋之后, `parent->_bf`会-2, 且`subR->_bf`会 -1
>
> `parent->_bf - 2`, 是因为 右子树中少了一个新节点和`subR`节点的高度
>
> `subR->_bf - 1`, 是因为 左子树中多了`parent`节点 

而 对于另一种与之对应的情况: 

**某 AVL树的根节点平衡因子为-1(即此树左子树高), 且又在此树的左子树中 插入新节点导致左子树高度再增加, 进而导致此树失衡**

为了处理此种情况, 也有一种操作, 称为**右单旋**

##### 右单旋

**右单旋**处理的情况一般是这样的:

![](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/image-20230313204538026.webp)

**某 AVL树的根节点平衡因子为-1(即此树左子树高), 且又在此树的左子树中 插入新节点导致左子树高度再增加, 进而导致此树失衡**

此情况的解决方法 几乎与左单旋完全相同: 

如果将**平衡因子为-2的节点 为`parent`, 其左孩子节点 为`subL`**

则此类情况的调整平衡的具体操作 其实是: 

**将`subL`的右孩子变为`parent`的左孩子, 再将`parent`变为`subL`的右孩子**

![](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/image-20230313204452542.webp)

此种方法 就是 `右单旋`, 对应的实现代码即为: 

```cpp
void RotateR(Node* parent) {
	Node* subL = parent->_pLeft;		// 不平衡节点的左孩子
	Node* subLR = subL->_pRight;		// 不平衡节点的左孩子 的 右孩子

	Node* ppNode = parent->_pParent;

	// 将 不平衡节点的左孩子的的右孩子 变为 父亲节点的左孩子, 并将 父亲节点 变为 此节点的右孩子
	// 并记得 链接三叉链
	parent->_pLeft = subLR;
	if (subLR)			// 右孩子不为空才链接父亲节点
		subLR->_pParent = parent;

	subL->_pRight = parent;
	parent->_pParent = subL;

	// 改变不平衡节点 的 父亲节点的指向
	if (parent == _root) {
		_root = subL;
		_root->_pParent = nullptr;
	}
	else {
		if (parent == ppNode->_pLeft)		// 不平衡节点是其父亲节点的左孩子
			ppNode->_pLeft = subL;			// 把 subL 连接到 其父亲节点的左孩子上
		else
			ppNode->_pRight = subL;			// 把 subL 连接到 其父亲节点的右孩子上

		subL->_pParent = ppNode;		// 更新 subL 的父亲节点
	}

	parent->_bf = 0;
	subL->_bf = 0;
}
```

可以知道 此种情况的特点是: **不平衡节点必须是因为 左孩子的左子树高 而不平衡的**

也就是说, 当`parent->_bf == -2 && cur->_bf == -1`成立时, 才会**右单旋进行调平**

并且, 右单旋之后, `parent->_bf`会+2, 且`subL->_bf`会+1

`parent->_bf + 2`, 是因为 左子树中少了一个新节点和`subL`节点的高度

`subR->_bf + 1`, 是因为 右子树中多了`parent`节点

**左单旋**和**右单旋**分别解决了:

1. **某 AVL树的根节点平衡因子为 1 (即此树右子树高), 且又在此树的右子树中 插入新节点导致右子树高度再增加, 进而导致此树失衡**

    即 **不平衡节点因为其 右孩子的右子树高 而不平衡(简称 右右)**

2. **某 AVL树的根节点平衡因子为 -1 (即此树左子树高), 且又在此树的左子树中 插入新节点导致左子树高度再增加, 进而导致此树失衡**

    即 **不平衡节点因为其 左孩子的左子树高 而不平衡(简称 左左)**

但是, 不平衡的情况不仅仅只有这两种情况, 还存在其他情况

并且 这些情况更为复杂, 简单的单旋并不能完全解决问题, 所以需要继续分析

##### 左右双旋

左右双旋 处理的情况是这样的: 

![](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/image-20230313204823511.webp)

这种情况 是: 

**`某 AVL树的根节点平衡因子为 -1 (即此树左子树高), 且又在此根节点的左孩子的右子树中插入新节点 `**
**`导致 以 左孩子为根的树的高度 再增加, 进而导致此树失衡`**

也就是 `不平衡节点因为其 左孩子的右子树高 而不平衡(简称 左右)`

> 1. `h = 0`
>
>     h = 0, 也就意味着 A、B、C、D 树 都为空, 并且 60节点 都应该为空. 因为 B、C 树的高度是 h-1
>
>     所以 h = 0 时的实例图 应该为: 
>
> ![60节点 就是新插入的节点  |wide](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/image-20230313204910566.webp) 
>
> 	此时应该怎么调整呢？
> 	
> 	最终要调节的是 80节点, 80节点是因为左子树高而失衡的, 所以 `最终需要右单旋来调节`
> 	
> 	但是 右单旋处理的是 `左左` 的情况
> 	
> 	所以 需要将 此树调整为 `左左`
> 	
> 	而 左单旋就是将 `parent` 旋转到 `subR` 的左孩子, 并将`subR`连接到`parent`的父亲节点下
> 	
> 	那么 就以 40节点为`parent`进行左单旋
> 	
> 	即 
>
>   ![ |wide](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/image-20230313205051406.webp)
>
> 	这样 就把树的结构调整为了 `左左` 的情况
> 	
> 	然后 以 80节点 为 `parent` 进行 `右单旋`: 
>
> ![ |wide](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/image-20230313205202716.webp)
>
> 	树平衡
>
> 2. `h = 1`
>
>     h = 1, A、D树 高度为 1, B、C树 高度为 0, 在 60节点左、右孩子插入新节点
>
> ![(虚线, 表示其他可插入位置)  |wide](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/image-20230313205509787.webp)
>
> 	以80节点为根的树 失衡的情况是 `左右`
> 	
> 	80节点因为左子树高 而失衡, 最终需要 `右单旋`调节
> 	
> 	所以 需要先将此树调整为 `左左`
> 	
> 	以 40节点为 `parent` 进行左单旋, 可以将 `subR`(60节点)调整为左子树高, 且将 `subR` 连接在 `parent` 的父亲节点下
> 	
> 	即可以将 此树调整为 `左左`
> 	
> 	所以, 以 40节点为 `parent` 进行左单旋: 
>
> ![ |wide](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/image-20230313205650265.webp)
>
> 	此时 以80节点为根的树 失衡的情况就变成了 `左左`
> 	
> 	就可以 以 80节点为 `parent` 进行`右单旋`
>
> ![ |wide](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/image-20230313205713734.webp)
>
> 	树平衡
>
> 3. `h = 2`
>
>     A、D树 高度为2, B、C树 高度为1, 在B、C树插入新节点
>
> ![(虚线, 表示其他可插入位置)  |wide](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/image-20230313205806979.webp)
>
> 	A、D树各 3 种情况, 新节点可能插入位置有 4 个, 所以此情况的结构一共有 `36` 种
> 	
> 	但是还是可以用相同的思路分析: 
> 	
> 	80节点平衡因子是 -2, 最终需要 `右单旋`进行平衡
> 	
> 	而 `右单旋`解决的是 `“左左”` 的情况, 而现在是 `“左右”`
> 	
> 	根绝 左单旋的结果的特点 可以知道, 以 40节点为parent 执行左单旋操作
> 	
> 	会将 `subR`(60节点)的左子树增高, 并将 `subR` 连接在 `parent` 的父亲节点之下
> 	
> 	进而 可以使 以 80节点为根的树的失衡情况变为 `“左左”`
>
> ![ |wide](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/image-20230313205956389.webp)
>
> 	然后就可以, 以 80节点为`parent` 执行`右单旋`操作
>
> ![ |wide](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/image-20230313210019865.webp)
>
> 	树平衡
>
> 4. `h = 3` ······
>
> 5. ······
>
> h 当然可以更大, 但是 方法都是相同的, 因为是同一种失衡情况: `“左右”`, `不平衡节点因为其 左孩子的右子树高 而不平衡`

对比 h 不同时, 此种失衡情况, 从失衡到平衡的调节 过程: 

![ |wide](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/image-20230313210101534.webp)

![ |wide](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/image-20230313210115081.webp)

![ |wide](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/image-20230313210151607.webp)

可以看到, 插入新结点之后, 调节平衡的过程是: 

1. 先 以 不平衡节点的左孩子`subL` 为`parent`, 执行`左单旋`操作
2. 再 以 不平衡节点`parent` 为`parent`, 执行`右单旋`操作

这就是 **`左右双旋`** , 其处理的情况是: 

**`某 AVL树的根节点平衡因子为 -1 (即此树左子树高), 且又在此根节点的左孩子的右子树中插入新节点 `**
**`导致 以 左孩子为根的树的高度 再增加, 进而导致此树失衡`**

即 `不平衡节点因为其 左孩子的右子树高 而不平衡`

所以, 当 `parent->_bf == -2 && cur->_bf == 1` 时, 使用 `左右双旋` 调节平衡

`左右双旋` 的具体实现可以通过 调用`左单旋`和`右单旋`实现, 但是需要注意的是, `左右双旋` 调节结构之后

树的其中三个节点的平衡因子是会发生改变的, 需要根据情况更新平衡因子

根据对比实例可以看出, 插入新结点之后: 

1. 当 `subLR` 的平衡因子为0, 那么此次双旋操作中 `parent->_bf = 0`、`subL->_bf = 0`、`subLR->_bf = 0`
2. 当 `subLR` 的平衡因子为1, 那么此次双旋操作中 `parent->_bf = 0`、`subL->_bf = -1`、`subLR->_bf = 0`
3. 当 `subLR` 的平衡因子为-1, 那么此次双旋操作中 `parent->_bf = 1`、`subL->_bf = 0`、`subLR->_bf = 0`

所以 `左右双旋` 的实现代码: 

```cpp
void RotateLR(Node* parent) {
	Node* subL = parent->_pLeft;		// 不平衡节点的左孩子
	Node* subLR = subL->_pRight;		// 不平衡节点的左孩子的右孩子
	int bf = subLR->_bf;
	// 左右双旋
	RotateL(parent->_pLeft);
	RotateR(parent);

	// 画图可以看出来 如果插入的位置不同 平衡因子的更新规则也不同
	if (bf == 0) {
		parent->_bf = 0;
		subL->_bf = 0;
		subLR->_bf = 0;
	}
	else if (bf == 1) {
		parent->_bf = 0;
		subL->_bf = -1;
		subLR->_bf = 0;
	}
	else if (bf == -1) {
		parent->_bf = 1;
		subL->_bf = 0;
		subLR->_bf = 0;
	}
	else {
		assert(false);
	}
}
```

a

既然有 `左右双旋`, 那肯定也有 `右左双旋`

> ### `右左双旋`
>
> 与 `左单旋`和`右单旋` 之间的关系一样, `左右双旋`和`右左双旋` 也有相似的关系
>
> `右左双旋` 处理的失衡情况 是这样的: 
>
> ![ |wide](https://dxyt-july-image.oss-cn-beijing.aliyuncs.com/image-20230313210221665.webp)
>
> 对比 `左右双旋` 可以看出, `右左双旋` 解决的失衡情况是: 
>
> **`某 AVL树的根节点平衡因子为 1 (即此树右子树高), 且又在此根节点的右孩子的左子树中插入新节点 `**
> **`导致 以 右孩子为根的树的高度 再增加, 进而导致此树失衡`**
>
> 即 `不平衡节点因为其 右孩子的左子树高 而不平衡`, 可以简称为 `“右左”`
>
> 并且, 与 `左右双旋` 类似, `右左双旋` 则是:
>
> 1. 先 以 不平衡节点的右孩子`subR` 为`parent`, 执行`右单旋`操作
> 2. 再 以 不平衡节点`parent` 为`parent`, 执行`左单旋`操作
>
> 执行 双旋操作之后, 再根据插入新节点后 `subRL` 的平衡因子, 来更新 `parent`、`subR`、`subRL`的平衡因子
>
> 1. 当 `subRL` 的平衡因子为0, 那么此次双旋操作中 `parent->_bf = 0`、`subL->_bf = 0`、`subLR->_bf = 0`
> 2. 当 `subRL` 的平衡因子为1, 那么此次双旋操作中 `parent->_bf = -1`、`subL->_bf = 0`、`subLR->_bf = 0`
> 3. 当 `subRL` 的平衡因子为-1, 那么此次双旋操作中 `parent->_bf = 0`、`subL->_bf = 1`、`subLR->_bf = 0`
>
> `右左双旋` 的代码实现为: 
>
> ```cpp
> void RotateRL(Node* parent) {
> 	Node* subR = parent->_pRight;
> 	Node* subRL = subR->_pLeft;
> 	int bf = subRL->_bf;
> 	// 右左双旋
> 	RotateR(parent->_pRight);
> 	RotateL(parent);
> 
> 	if (bf == 0) {
> 		parent->_bf = 0;
> 		subR->_bf = 0;
> 		subRL->_bf = 0;
> 	}
> 	else if (bf == 1) {
> 		parent->_bf = -1;
> 		subR->_bf = 0;
> 		subRL->_bf = 0;
> 	}
> 	else if (bf == -1) {
> 		parent->_bf = 0;
> 		subR->_bf = 1;
> 		subRL->_bf = 0;
> 	}
> 	else {
> 		assert(false);
> 	}
> }
> ```
>
> > `右左双旋也可以画图 分析一下`

这 AVL树 插入数据大致分为的 两个步骤: 

1. 按照二叉搜索树的插入方式插入新节点
2. 分析节点的子树高度差, 并进行调整

都已经分析完了, 所以 AVL树的插入操作 具体的代码实现应该是: 

```cpp
public:
	bool insert(const T& data) {
		// 首先按照 二叉搜索树的方式 查找插入位置并插入节点
		if (_root == nullptr) {
			// 树为空 插入节点 直接将新节点作为树的根
			_root = new Node(data);
			_root->_bf = 0;		// 只有根节点的树, 根节点平衡因子为 0

			return true;		// 插入成功, 直接返回
		}

		// 走到这里就说明需要 查找插入位置 了
		Node* cur = _root;	// 从根节点开始比较
		Node* parent = nullptr;	// 需要记录父亲节点 供插入时连接
		while (cur) {
			// 循环结束的条件是 cur为空, cur为空时就说明 插入位置找到了
			if (cur->_data > data) {
				// 插入值比当前节点值 小, 则向左孩子找
				parent = cur;
				cur = cur->_pLeft;
			}
			else if (cur->_data < data) {
				// 插入值比当前节点值 大, 则向右孩子找
				parent = cur;
				cur = cur->_pRight;
			}
			else {
				// 走到这里 说明数中已存在相同数据
				return false;
			}
		}

		// 出循环之后, cur 即为数据需要插入的位置
		cur = new Node(data);
		// 将cur与树连接起来
		if (data > parent->_data) {
			parent->_pRight = cur;		// 插入数据比父亲节点数据大, 则插入到父亲节点的右孩子
		}
		else if (data < parent->_data) {
			parent->_pLeft = cur;			// 插入数据比父亲节点数据小, 则插入到父亲节点的左孩子
		}
        
		// 三叉链结构, cur节点虚存储父亲节点
		cur->_pParent = parent;
		while (parent) {
			if (cur == parent->_pLeft)
				parent->_bf--;			// 新节点在父亲节点的左孩子, 则父亲节点的左子树高度+1, 则父亲节点的平衡因子-1
			else
				parent->_bf++;

			// 更新完之后, 就需要判断 需要继续更新 还是停止更新 或是调整平衡了
			if (parent->_bf == 0) {
				// 某祖先节点的平衡因子 从 -1 或 1 -> 0, 说明 插入新节点使此祖先节点的左右子树高度相等了
				// 不会再影响更上边的节点, 所以可以结束
				break;
			}
			else if (parent->_bf == -1 || parent->_bf == 1) {
				cur = cur->_pParent;
				parent = parent->_pParent;
			}
			else if (parent->_bf == -2 || parent->_bf == 2) {
				// 左单旋的情况
				if (parent->_bf == 2 && cur->_bf == 1) {
					RotateL(parent);
				}
				// 右单旋的情况
				else if (parent->_bf == -2 && cur->_bf == -1) {
					RotateR(parent);
				}
				// 左右双旋的情况
				else if (parent->_bf == -2 && cur->_bf == 1) {
					RotateLR(parent);
				}
				else if (parent->_bf == 2 && cur->_bf == -1) {
					RotateRL(parent);
				}

				break;
			}
			else {
				// 以上情况都是在保证插入新节点时, 树已经是平衡二叉搜索树
				// 如果不是 则会走到此处 触发断言 进而发现错误
				assert(false);
			}
		}
		
		return true;
	}

private:
	void RotateL(Node* parent) {
		Node* subR = parent->_pRight;		// 此节点, 即不平衡节点的右孩子
		Node* subRL = subR->_pLeft;			// 此节点左孩子

		/* parent 可能是 整棵树的根, 也可能是某节点的子树根
		* 而 由于AVL树的节点是三叉链的结构, 所以改变节点的位置 需要改变此节点的父亲节点, 所以
		* 当 parent 是整棵树的根时, 即parent->_pParent 为空, 那么左旋时 就需要直接将 subR改为整棵树的根
		* 当 parent 是某节点的子树时, 就需要将 parent->_pParent 与 subR 连接起来
		* 所以 需要将 parent->_pParent 存储起来
		*/
		Node* ppNode = parent->_pParent;

		// 将 此节点的左孩子 变为 父亲节点的右孩子, 并将 此节点的父亲节点 变为 此节点的左孩子
		// 并记得 链接三叉链
		parent->_pRight = subRL;
		if (subRL)
			subRL->_pParent = parent;

		subR->_pLeft = parent;
		parent->_pParent = subR;

		// 改变不平衡节点 的 父亲节点的指向
		if (parent == _root) {
			_root = subR;
			_root->_pParent = nullptr;
		}
		else {
			if (parent == ppNode->_pLeft)		// 不平衡节点是其父亲节点的左孩子
				ppNode->_pLeft = subR;			// 把 subR 连接到 其父亲节点的左孩子上
			else
				ppNode->_pRight = subR;			// 把 subR 连接到 其父亲节点的右孩子上

			subR->_pParent = ppNode;		// 更新 subR 的父亲节点
		}

		parent->_bf = 0;
		subR->_bf = 0;
	}

	void RotateR(Node* parent) {
		Node* subL = parent->_pLeft;		// 此节点, 即不平衡节点的左孩子
		Node* subLR = subL->_pRight;		// 此节点右孩子

		Node* ppNode = parent->_pParent;
        
		parent->_pLeft = subLR;
		if (subLR)
			subLR->_pParent = parent;

		subL->_pRight = parent;
		parent->_pParent = subL;

		// 改变不平衡节点 的 父亲节点的指向
		if (parent == _root) {
			_root = subL;
			_root->_pParent = nullptr;
		}
		else {
			if (parent == ppNode->_pLeft)		// 不平衡节点是其父亲节点的左孩子
				ppNode->_pLeft = subL;			// 把 subL 连接到 其父亲节点的左孩子上
			else
				ppNode->_pRight = subL;			// 把 subL 连接到 其父亲节点的右孩子上

			subL->_pParent = ppNode;		// 更新 subL 的父亲节点
		}

		parent->_bf = 0;
		subL->_bf = 0;
	}

	void RotateLR(Node* parent) {
		Node* subL = parent->_pLeft;
		Node* subLR = subL->_pRight;
		int bf = subLR->_bf;
		// 左右双旋
		RotateL(parent->_pLeft);
		RotateR(parent);
		
		// 画图可以看出来 如果插入的位置不同 平衡因子的更新规则也不同
		if (bf == 0) {
			parent->_bf = 0;
			subL->_bf = 0;
			subLR->_bf = 0;
		}
		else if (bf == 1) {
			parent->_bf = 0;
			subL->_bf = -1;
			subLR->_bf = 0;
		}
		else if (bf == -1) {
			parent->_bf = 1;
			subL->_bf = 0;
			subLR->_bf = 0;
		}
		else {
			assert(false);
		}
	}

	void RotateRL(Node* parent) {
		Node* subR = parent->_pRight;
		Node* subRL = subR->_pLeft;
		int bf = subRL->_bf;
		// 右左双旋
		RotateR(parent->_pRight);
		RotateL(parent);
		
		if (bf == 0) {
			parent->_bf = 0;
			subR->_bf = 0;
			subRL->_bf = 0;
		}
		else if (bf == 1) {
			parent->_bf = -1;
			subR->_bf = 0;
			subRL->_bf = 0;
		}
		else if (bf == -1) {
			parent->_bf = 0;
			subR->_bf = 1;
			subRL->_bf = 0;
		}
		else {
			assert(false);
		}
	}
```

AVL树的 插入操作, 是AVL树第二难理解的内容, 最难理解的内容是 `AVL树 数据的删除`

> `AVL树 数据的删除` 更难解决一些, 本篇文章不做分析
