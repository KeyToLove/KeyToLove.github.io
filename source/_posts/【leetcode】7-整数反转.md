---
title: 【leetcode】7.整数反转
date: 2023-10-19 16:34:16
tags: leetcode
categories: 算法
cover: /images/cover7.webp
---

## 前言

<p style="font-size:16px">Leetcode 算法题是一个全新的文章系列，该系列将会抽选 <a href="https://leetcode.cn/">Leetcode</a> 上题目记录解题思路以及总结等</p>
<b style="font-size:14px;color:red">tips: 为节省文章篇幅，题目描述以及相关示例本系列文章中不再额外赘述，可以对照题目原链接查看</b>

本篇为 Leetcode 第 7 题-整数反转，题目链接：[整数反转](https://leetcode.cn/problems/reverse-integer/description/)

## 题解

- 题目描述很清晰，给到一个数字，将该数字进行反转后的值返回即可
- 需要注意两个点：1. 保留数字符号 2. 依题意判断是否越界

1. 转字符串反转

```js
/**
 * @param {number} x
 * @return {number}
 */
var reverse = function (x) {
  // 记录符号
  const flag = x > 0 ? 1 : -1

  // 移除符号进行字符串反转
  const res = String(Math.abs(x)).split('').reverse().join('')

  // 判断边界并且补充原始符号
  return res > Math.pow(2, 31) - 1 || res < Math.pow(-2, 31) ? 0 : flag * res
}
```

复杂度分析：

- 时间复杂度：O（N）

- 空间复杂度：O(1)

2. 模 10 取余,反转数字

```js
/**
 * @param {number} x
 * @return {number}
 */
var reverse = function (x) {
  var reverse = function (x) {
    let res = 0
    while (x !== 0) {
      // 左移一位，求模补在末位
      // 求摸和Math.trunc都会保留符号，故不用处理符号问题
      res = res * 10 + (x % 10)
      // 移除末位
      x = Math.trunc(x / 10)
    }
    // 判断边界
    return res > Math.pow(2, 31) - 1 || res < Math.pow(-2, 31) ? 0 : res
  }
}
```

复杂度分析：

- 时间复杂度：O（log|x|）,翻转的次数即 x 十进制的位数

- 空间复杂度：O(1)
