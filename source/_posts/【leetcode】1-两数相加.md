---
title: 【leetcode】两数相加
date: 2022-07-22 11:26:59
tags: leetcode
categories: 算法
cover: /images/cover8.jpeg
---

## 前言

<p style="font-size:16px">Leetcode 算法题是一个全新的文章系列，该系列将会抽选 <a href="https://leetcode.cn/">Leetcode</a> 上题目记录解题思路以及总结等</p>
<b style="font-size:14px;color:red">tips: 为节省文章篇幅，题目描述以及相关示例本系列文章中不再额外赘述，可以对照题目原链接查看</b>

本篇为 Leetcode 第 2 题-两数相加，题目链接：[两数相加](https://leetcode.cn/problems/add-two-numbers/)

## 题解

根据题目描述以及示例分析可知，我们最终需要得到一个链表，并且链表只需要将给到的`l1`、`l2`两个链表按节点进行求和运算即可，注意考虑进位情况

```js
/**
 * Definition for singly-linked list.
 * function ListNode(val, next) {
 *     this.val = (val===undefined ? 0 : val)
 *     this.next = (next===undefined ? null : next)
 * }
 */
/**
 * @param {ListNode} l1
 * @param {ListNode} l2
 * @return {ListNode}
 */
var addTwoNumbers = function (l1, l2) {
  // 是否进位标识
  let carry = 0,
    // 最终返回链表
    head = null,
    // 记录链表当前节点所在位置
    curr = null
  // 循环给定的两条链表，直到两条都已经循环完成
  while (l1 || l2) {
    // 链表l1当前节点值,为空则根据题意取0
    const v1 = l1?.val ?? 0
    // 链表l2当前节点值,为空则根据题意取0
    const v2 = l2?.val ?? 0
    // 计算生成链表对应节点的值,注意包含上次是否进位的状态
    const sum = v1 + v2 + carry
    // 初始化链表
    if (!head) {
      head = curr = new ListNode(sum % 10)
    } else {
      // 链表已初始化则更新链表节点
      curr.next = new ListNode(sum % 10)
      // 指针位置相应后移
      curr = curr.next
    }
    // 判断并缓存本次求和计算进位结果
    carry = Math.floor(sum / 10)
    // 未循环完成则继续向后循环
    l1 && (l1 = l1.next)
    l2 && (l2 = l2.next)
  }
  // 判断最后是否还有进位，有则补充
  if (carry) {
    curr.next = new ListNode(carry)
  }
  return head
}
```

复杂度分析：

- 时间复杂度：O(\max(m,n))O(max(m,n))，其中 mm 和 nn 分别为两个链表的长度。我们要遍历两个链表的全部位置，而处理每个位置只需要 O(1)O(1) 的时间。

- 空间复杂度：O(1)O(1)。注意返回值不计入空间复杂度。
