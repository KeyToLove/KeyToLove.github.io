---
title: js实现简易LRU缓存
date: 2022-07-06 11:07:35
tags: LRU
categories: 算法
cover: /blogs/images/cover5.jpeg
---

## 前言

算法就是从`input`到`output`过程的一个实现，因此我们在学习或琢磨算法问题时应该先捋清思路，明确我们需要得到的是什么，试着列举从输入到输出我们需要处理的任务项，逐个实现。

## 什么是 LRU 缓存

首先我们看看百度百科对 LRU 的描述

> LRU 是 Least Recently Used 的缩写，即最近最少使用，是一种常用的页面置换算法，选择最近最久未使用的页面予以淘汰。该算法赋予每个页面一个访问字段，用来记录一个页面自上次被访问以来所经历的时间 t，当须淘汰一个页面时，选择现有页面中其 t 值最大的，即最近最少使用的页面予以淘汰。

针对百度百科的描述，举个例子：我们在使用浏览器浏览窗口时候，我们一个接一个的访问新的页面，内存将我们这些页面进行了缓存以方便我们稍后回过头访问；但是随着时间的推移，不断新增的新页即将塞满浏览器有限的内存，这个时候为了保证浏览器仍能正常工作，我们不得不删除页面来减少内存的占用；删除哪些页面呢？可以按访问的先后顺序或者说一个标准，`LRU`缓存就是这么一个标准，把**最近时间内，最久未访问**的页面给干掉。

## 使用场景

1. 系统底层的内存管理
2. 页面的置换算法
3. 一般的缓存服务，memcache、redis 之类
4. 部分资源有限的业务场景

## 简易实现

经过分析我们不难得出 `LRU` 有如下特点：

- 资源有限，假使资源无限我们也就不需要利用 `LRU` 进行删除处理·
- 存储空间需要是有序的,因为有序的数据结构才能让我们按顺序删除数据的以节省条件查询的时间,`javascript`中可采用`Arrary`、`Map`数据结构
- 存储空间达到上限时再新增数据，自动删除记录中最久远的数据
- 能从我们的存储的数据结构中获取和设置指定数据(get & set)

下面就用代码来实现这么一个满足特性的`LRUCache`类

```javascript
class LRUCache {
  constructor(size) {
    // 特性1: 资源有限 初始化存储空间大小
    this.size = size
    // 特性2: 存储空间数据结构的有序性 初始化数据存储结构(Map 存取时间复杂度优，因此优先考虑)
    this.data = new Map()
  }
  // 获取指定数据
  get(key) {
    const { data } = this
    // 未找到提前 return
    if (!data.has(key)) {
      return null
    }
    const value = data.get(key)
    // 通过先移除再重新插入的方式更新该数据在存储空间中的排序至最新
    data.delete(key)
    data.set(key, value)
    return value
  }
  // 存储指定数据
  set(key, value) {
    const { data, size } = this
    // 已存在数据先移除默认记录后续更新排序
    if (data.has(key)) {
      data.delete(key)
    }
    // 已达到存储上限，自动删除最久远历史数据
    if (data.size === size) {
      const _key = data.keys().next().value
      data.delete(_key)
    }
    // 设置/更新数据
    data.set(key, value)
    // 返回当前实例方便链式掉用
    // const l = new LRUCache(3)
    // l.set('k1','v1').set('k2','v2')
    return this
  }
}
```

我们主要是实现了`set`和`get`数据存取的两个方法，而数据的删除是由数据存储空间大小限制在`set`过程中自动处理的，接下来我们测试一下我们`LRUCache`的两个方法

- set

  <img src="/blogs/images/code1.png" alt="set.png" title="set.png" />

可以清楚看到，在存储空间占满之前，`set`按照先后顺序依次进行存储，当存储空间满了之后，会删除最旧的数据

- get

<img src="/blogs/images/code2.png" alt="get.png" title="get.png" />

`get`会在获取指定数据的同时，更新该数据在存储空间的所在顺序至最前

## 总结

就这样一个`javascript`版本的简易`LRU缓存`算法就被我们实现了，是不是觉得 just so so 😁

当然`LRU缓存`的核心思路远不只是这么简易，有兴趣的同学可以再深入进行探究～
