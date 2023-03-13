---
title: 【leetcode】5.最长回文子串
date: 2022-08-17 11:44:30
tags: leetcode
categories: 算法
cover: /images/cover3.jpeg
---

## 前言

<p style="font-size:16px">Leetcode 算法题是一个全新的文章系列，该系列将会抽选 <a href="https://leetcode.cn/">Leetcode</a> 上题目记录解题思路以及总结等</p>
<b style="font-size:14px;color:red">tips: 为节省文章篇幅，题目描述以及相关示例本系列文章中不再额外赘述，可以对照题目原链接查看</b>

本篇为 Leetcode 第 5 题-最长回文子串，题目链接：[最长回文子串](https://leetcode.cn/problems/longest-palindromic-substring/)

## 题解

首先我们要了解`回文字符串`的特点 - 中心对称,即形如`aba` `abba`这样中心轴对称的字符串，根据题目要求，我们需要在所有回文字符串中找出最长的那一条即可

```js
/**
 * @param {string} s
 * @return {string}
 */
var longestPalindrome = function (s) {
  let max = ''
  const helper = (l, r) => {
    // 不越界的同时 满足中心对称特点则外扩 直到已经不满足中心对称的特点
    while (l >= 0 && r < s.length && s[l] === s[r]) {
      l--
      r++
    }
    // 得到最后一次外扩前回文字符串
    const str = s.slice(l + 1, r)
    // 比较当前回文长度和已记录最大回文长度
    max = str.length > max.length ? str : max
  }
  // 结合回文字符串中心对成的特点，遍历字符串依次作为中心点进行计算
  for (let i = 0; i < s.length; i++) {
    // 回文为奇数的情况 例如 aba
    helper(i, i)
    // 回文为偶数的情况 例如 abba
    helper(i, i + 1)
  }
  return max
}
```

复杂度分析：

- 时间复杂度：O（N ^ 2）N 字符串 s 的长度 （外层一次循环 内层 helper 函数执行两次，单次最多循环 N / 2 次 ）

- 空间复杂度：O(1)
