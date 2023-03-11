---
title: 【leetcode】6.Z字形变换
date: 2022-08-22 18:11:25
tags: leetcode
categories: 算法
cover: /blogs/images/cover4.jpeg
---

## 前言

<p style="font-size:16px">Leetcode 算法题是一个全新的文章系列，该系列将会抽选 <a href="https://leetcode.cn/">Leetcode</a> 上题目记录解题思路以及总结等</p>
<b style="font-size:14px;color:red">tips: 为节省文章篇幅，题目描述以及相关示例本系列文章中不再额外赘述，可以对照题目原链接查看</b>

本篇为 Leetcode 第 6 题-Z 字形变换，题目链接：[Z 字形变换](https://leetcode.cn/problems/zigzag-conversion/description/)

## 题解

- 题目描述为 Z 形转换，其实当成一个反转的 N 更好理解
- 我们可以把给到的字符串 s 按照要求组合成 numRows 行 Z 状分布的字符串数组，然后依次将数组每一行字符串拼接起来即可

```js
var convert = function (s, numRows) {
  // 两种情况直接返回
  // 如果 numRows 为1，不会发生Z形转换
  // 如果 s.length < numRows ，则numRows中每行的字符串不超过1个，最终拼接结果依然为原字符串
  if (numRows == 1 || s.length < numRows) return s
  // 初始化numRows行空字符串数组
  const rows = new Array(numRows).fill('')
  // 定义当前要操作的行下标 初始下标0
  let index = 0
  // 定义方向是否向下 初始false
  let down = false
  for (const c of s) {
    // 根据当前维护的index来拼接rows中对应行的字符串
    rows[index] += c
    // 到 numRows 的首行和尾行时扭转方向
    if (index === 0 || index === numRows - 1) {
      down = !down
    }
    index += down ? 1 : -1
  }
  // 定义结果字符串
  let ans = ''
  // 按照rows字符串数组依次拼接
  ans = rows.join('')
  return ans
}
```

复杂度分析：

- 时间复杂度：O（N）N 字符串 s 的长度

- 空间复杂度：O(N) 为创建 numRows 长度数组开销
