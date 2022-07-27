---
title: 【leetcode】1.两数之和
date: 2022-07-21 15:17:43
tags: leetcode
categories: 算法
cover: /images/cover7.webp
---

## 前言

<p style="font-size:16px">Leetcode 算法题是一个全新的文章系列，该系列将会抽选 <a href="https://leetcode.cn/">Leetcode</a> 上题目记录解题思路以及总结等</p>
<b style="font-size:14px;color:red">tips: 为节省文章篇幅，题目描述以及相关示例本系列文章中不再额外赘述，可以对照题目原链接查看</b>

本篇为 Leetcode 第 1 题-两数之和，题目链接：[两数之和](https://leetcode.cn/problems/two-sum/)

## 题解

- 猴子算法

> 无限猴子定理最早是由埃米尔·博雷尔在 1909 年出版的一本谈概率的书籍中提到的，此书中介绍了“打字的猴子”的概念。无限猴子定理是概率论中的柯尔莫哥洛夫的零一律的其中一个命题的例子。大概意思是，如果让一只猴子在打字机上随机地进行按键，如果一直不停的这样按下去，只要时间达到无穷时，这只猴子就几乎必然可以打出任何给定的文字，甚至是莎士比亚的全套著作也可以打出来。

既然题目指出一定存在一组满足条件的数，那我们通过随机**总能**找到最终的答案；简而言之 10 次不行，那就来 100 次，100 次还不行？那就试试 10000 次

```js
const twoSum = function (nums, target) {
  const l = nums.length
  while (true) {
    // 在数组长度范围内随机取一个数，作为第一个数字的下标
    const idx1 = parseInt(Math.random() * l)
    // 在数组长度范围内随机取一个数，作为第二个数字的下标
    const idx2 = parseInt(Math.random() * l)
    // 满足题目条件退出循环：1.数组中同一个元素在答案里不能重复出现 2.两数相加等于target
    if (idx1 !== idx2 && nums[idx1] + nums[idx2] === target) return [idx1, idx2]
  }
}
```

分析：因为我们求解过程的核心在于**随机**上，因此我们得到答案所需要循环的次数是不确定的，或许运气好一次循环就能找到满足条件的两个数，也有可能需要一直循环下去，因此这种方式求解的时间复杂度不可衡量，是娱乐的解法 😄

- 双层 for 循环

```js
const twoSum = function (nums, target) {
  let num1, num2
  for (let i = 0; i < nums.length; i++) {
    // 循环得到第一个数
    num1 = nums[i]
    for (let j = i + 1; j < nums.length; j++) {
      // 从余下的数中循环得到第二个数
      num2 = nums[j]
      // 满足条件 退出循环
      if (num1 + num2 === target) return [i, j]
    }
  }
}
```

分析：因为采取了两层嵌套的`for`循环，所以时间复杂度上是 O(N^2)

- map 存储

```js
const twoSum2 = function (nums, target) {
  // 缓存已遍历过的数据
  const map = new Map()
  for (let i = 0; i < nums.length; i++) {
    // 计算满足条件的另一个数
    const num = target - nums[i]
    // 如果该数已经被缓存，直接取出缓存的下标与当前下标即可
    if (map.has(num)) return [map.get(num), i]
    // 否则说明先前不存在与当前数相加合为target的数，把当前数和下标缓存，供后续循环判断
    map.set(nums[i], i)
  }
}
```

分析：一次`for`循环就能找出符合题意的答案，时间复杂度为 O(N),空间复杂度 O(N),为创建哈希表的开销
