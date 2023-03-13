---
title: 【leetcode】3.无重复字符的最大子串
date: 2022-07-27 11:39:33
tags: leetcode
categories: 算法
cover: /images/cover1.jpeg
---

## 前言

<p style="font-size:16px">Leetcode 算法题是一个全新的文章系列，该系列将会抽选 <a href="https://leetcode.cn/">Leetcode</a> 上题目记录解题思路以及总结等</p>
<b style="font-size:14px;color:red">tips: 为节省文章篇幅，题目描述以及相关示例本系列文章中不再额外赘述，可以对照题目原链接查看</b>

本篇为 Leetcode 第 3 题-无重复字符的最大子串，题目链接：[两数相加](https://leetcode.cn/problems/longest-substring-without-repeating-characters/)

## 题解

根据题意，我们需要求出最大子串，换言之也就是我们需要得到开始和结尾两个下标,满足这两个下标之间组成的子串不出现重复且是最大的即可;这样一种求区间范围内最大值的情况考虑用`滑动窗口`思路来解题

- 采用 set 维护最长子串，发生重复依次从头删除

```js
/**
 * @param {string} s
 * @return {number}
 */
var lengthOfLongestSubstring = function (s) {
  // 定义滑动窗口左右指针 l,r 以及字符串长度 n 最终结果 max
  let l = 0,
    r = 0,
    n = s.length,
    max = 0,
    // 定义 set 用来记录当前已经出现过的字符，用来作为是否重复出现过的依据
    set = new Set()
  // 约束窗口可滑动的范围:右指针不超过字符串长度，左指针不超过右指针
  while (l <= r && r < n) {
    // 如果当前字符未记录过：
    // 1. 比较当前左右两指针间窗口大小和当前max大小，更新max
    // 2. 记录当前字符到set中
    // 3. 因为当前仍未发生重复，因此窗口可以继续扩大范围，右指针向右平移
    if (!set.has(s[r])) {
      max = Math.max(r - l + 1, max)
      set.add(s[r])
      r++
    } else {
      // 如果当前字符已经被记录过：
      // 1. 右指针保持不动
      // 2. 在set中移除左指针对应的字符 左指针右移缩小窗口大小
      set.delete(s[l])
      l++
    }
  }
  return max
}
```

- 采用 map 维护出现过的字符和其出现下标，发生重复直接**跳跃**到指定位置，一定程度减少循环次数

```js
/**
 * @param {string} s
 * @return {number}
 */
var lengthOfLongestSubstring = function (s) {
  let max = 0
  // 采用map记录字符的同时一并记录出现的下标
  let map = new Map()
  let l = 0
  for (let r = 0; r < s.length; r++) {
    // 同时满足两个条件表示子串出现重复，重复了就把l指针挪动到重复位置的下一个下标
    // 1. map中已记录当前字符
    // 2. 因为当前子串范围为 l -> r , 因此如果当前字符已经被记录但是不在l -> r 这个区间中，那么当前子串也是未发生重复的
    if (map.has(s[r]) && map.get(s[r]) >= l) {
      l = map.get(s[r]) + 1
    }
    // 计算最大子串长度
    max = Math.max(max, r - l + 1)
    // 存储当前字符以及所在下标
    map.set(s[r], r)
  }
}
```

复杂度分析：

- 时间复杂度：O(N) N 为字符串 s 长度

- 空间复杂度：O(T) T 为字符串 s 中最大不重复子串的大小
