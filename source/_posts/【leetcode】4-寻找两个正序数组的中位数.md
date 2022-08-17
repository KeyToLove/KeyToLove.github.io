---
title: 【leetcode】4.寻找两个正序数组的中位数
date: 2022-08-02 18:22:09
tags: leetcode
categories: 算法
cover: /images/cover2.jpeg
---

## 前言

<p style="font-size:16px">Leetcode 算法题是一个全新的文章系列，该系列将会抽选 <a href="https://leetcode.cn/">Leetcode</a> 上题目记录解题思路以及总结等</p>
<b style="font-size:14px;color:red">tips: 为节省文章篇幅，题目描述以及相关示例本系列文章中不再额外赘述，可以对照题目原链接查看</b>

本篇为 Leetcode 第 4 题-无重复字符的最大子串，题目链接：[寻找两个正序数组的中位数](https://leetcode.cn/problems/median-of-two-sorted-arrays/)

## 题解

根据题意组简单的方式我们可以合并` nums1`和`nums2`两个数组,对新组成的数组综合排序后再求的中位数即可

```js
/**
 * @param {number[]} nums1
 * @param {number[]} nums2
 * @return {number}
 */
var findMedianSortedArrays = function (nums1, nums2) {
  // 合并两数组并排序
  const nums = [...nums1, ...nums2].sort((a, b) => a - b)
  const l = nums.length
  // 区分奇数/偶数 分别计算中位数
  if (l & 1) {
    // 奇数直接除以2向下取整
    return nums[l >> 1]
  } else {
    // 偶数取中间两数之和再除以二
    return (nums[l >> 1] + nums[(l >> 1) - 1]) / 2
  }
}
```

复杂度分析：

- 时间复杂度：O（N log N）N 为组成的新数组长度

- 空间复杂度：O(N) N 为组成的新数组长度 即 nums1、nums2 两数组长度之和

## 待优化

没有利用题目中`nums1`和`nums2`两数组已经是正序排列的特点
