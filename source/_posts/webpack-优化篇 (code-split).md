---
title: webpack-优化篇 (code split)
date: 2022-06-28 16:26:31
tags: webpack
categories: 前端工程化
cover: /blogs/images/cover3.jpeg
---

### 背景

一般来讲，基于 webpack 的 spa 应用，如果没有额外配置，所有的 js 经过打包后都会整合到一个 chunk 中，这就可能会导致这个 chunk 的体积过大，用户通过浏览器访问我们应用时就需要花费更多的时间来下载资源

### 为什么

1. 我们可以把较大的资源根据实际情况拆分成小的模块，利用 http 可以并行请求资源的特点，大幅节省下载资源的时间开销

2. 合理的代码分割也可以帮我们剔除模块中重复引入的代码（eg：node_modules 中的依赖抽离出来单独打包成一个 chunk），节省项目体积

3. 多页面应用通过分包可以只加载当前 html 页面的资源，节省流量，优化用户体验

### 配置

单页面应用

```js
// webpack.config.js
module.exports = {
  // ...省略无关配置
  optimization: {
    splitChunks: {
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          chunks: 'all',
          name: 'vendor',
          priority: 10, // 优先级
          enforce: true,
          minChunks: 1,
          maxSize: 1024 * 1024 * 10, // 最大10m
        },
      },
    },
  },
}
```

经过这么配置，最终会生成两个 js 的 chunk，一个是对应入口文件生成的 chunk 文件，另一个则是将我们应用中引入的依赖分割出去生成一个 chunk

多页面应用

```js
const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
module.exports = {
  // ...省略无关配置
  entry: {
    main: './src/index.js',
    other: './src/other.js',
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'js/[name].[contenthash:6].js',
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/index.html',
      filename: 'index.html',
      title: 'index',
      chunks: ['vendor', 'main'], // 指定只需要引入的chunks
    }),
    new HtmlWebpackPlugin({
      template: './src/index.html',
      filename: 'other.html',
      title: 'other',
      chunks: ['vendor', 'other'], // 指定只需要引入的chunks
    }),
  ],
  optimization: {
    splitChunks: {
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          chunks: 'all',
          name: 'vendor',
          priority: 10, // 优先级
          enforce: true,
          minChunks: 1,
          maxSize: 1024 * 1024 * 10, // 最大10m
        },
      },
    },
  },
}
```

多页面应用通过指定多入口文件会自动生成对应每个入口文件的 chunk，比如以上配置最终会生成 `main.[hash]` 、 `other.[hash]` 、 `vendor.[hash]`三个 chunk 文件，分别对应其入口文件以及它们所引入的 node_modules 中的依赖

值得注意的是我们不要忘了给`html-webpack-plugin`添加`chunks`的配置，来让我们对应的 html 文件只引入其所需的 chunks，而不是引入所有 chunks
