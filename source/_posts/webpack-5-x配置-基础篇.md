---
title: webpack-5.x配置-基础篇
date: 2022-06-24 14:35:31
tags: webpack
categories: 前端工程化
---

## webpack 是什么?

> 本质上，webpack 是一个用于现代 JavaScript 应用程序的静态模块打包工具。当 webpack 处理应用程序时，它会在内部构建一个 依赖图(dependency graph)，此依赖图对应映射到项目所需的每个模块，并生成一个或多个 bundle。

现在开源社区中，与 webpack 功能相似的有 rollup、vite 等，在这我做一下简单的介绍

> `Rollup `是一个 JavaScript 模块打包器，可以将小块代码编译成大块复杂的代码，例如 library 或应用程序
> `Rollup `偏向应用于 js 库，例如做 ES 转换，模块解析等，webpack 则更偏向于前端工程、UI 库等，如果应用场景中不止包含 js 代码，还涉及 html、css,涉及复杂的代码拆分合并的话，webpack 会更加出众
> `Vite` —— 一种新的、更快地 web 开发工具(opinionated)，Vite 的主要特点是依赖浏览器原生的 ES module 来开发，省略了打包这一过程，采用 rollup for producton.

## webpack 的核心概念

1. entry:入口
2. output:出口
3. loader:模块转换器,loader 可以使你在 import 或 "load(加载)" 模块时预处理文件
4. plugins:插件,插件目的在于解决 loader 无法实现的其他事

## Begin

```bash
mkdir 'webpack-study'
cd webpack-stydy
npm init -y or yarn init -y
```

配置 webpack 首先需要安装 webpack、webpack-cli

由于前端技术迭代迅速,并且不同版本包之间的配置存在差异,版本号标注如下

```json
"webpack":"^5.27.1",
"webpack-cli": "^4.5.0"
```

```bash
npm i webpack webpack-cli -D
```

> 从 v4.0.0 开始，webpack 可以不用再引入一个配置文件来打包项目，然而，它仍然有着 高度可配置性，可以很好满足你的需求。

我们接下来采用自定义配置的方式，去探索一下 webpack 的魅力

首先，项目根目录下新建 `src/index.js`文件作为我们接下来配置的入口文件，同样根目录下新建 `webpack.config.js` 文件来进行我们的 webpack 配置

让我们随便写点什么～

``` js
// src/index.js
const p = 'mike'
```

``` javascript
// webpack.config.js
const path = require('path')
module.exports = {
  //默认./src/index.js
  entry: './src/index.js',
  //默认打包到dist/main.js
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.[contenthash:6].js',
  },
}
```

使用 `npx webpack` 进行构建，根目录下成功生成`/dist/bundle.6f3551.js`文件，但是留意到有警告信息：
![在这里插入图片描述](https://img-blog.csdnimg.cn/19d32ec7e75e418899ccfaafc700d563.png#pic_center)

提示我们没有设置 mode，默认将采用`production`模式，为了方便调试，我们将 mode 设置为`development`模式，重新使用`npx webpack --mode=development`构建，警告清除

为了方便启动,在`package.json`中添加脚本,每次重新构建运行`npm run build`即可

```json
{
  "scripts": {
    "build": "webpack --mode=development"
  }
}
```

打开 dist 目录下构建好的文件

```js
/******/ ;(() => {
  // webpackBootstrap
  var __webpack_exports__ = {}
  /*!**********************!*\
  !*** ./src/index.js ***!
  \**********************/
  const p = 'mike'
  /******/
})()
```

### JS 向下兼容

由于 js 代码最终运行在用户的浏览器上，少数低版本浏览器例如 ie 对 js 的的新语法存在兼容性问题，这时候我们就需要将这一部分不兼容的语法转义成浏览器能解析的低版本语法

```bash
npm i babel-loader -D
npm i @babel/core @babel/preset-env core-js -D
```

```js
// webpack.config.js
module.export = {
  //...
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        loader: 'babel-loader',
        exclude: /node_modules/,
      },
    ],
  },
}
```

添加上 babel-loader 之后，还需要对 babel 进行配置,根目录下新建.babelrc 文件

```json
// babelrc
{
  "presets": [
    [
      "@babel/preset-env",
      {
        "targets": {
          "chrome": "58",
          "ie": "11"
        },
        "corejs": "3",
        "useBuiltIns": "usage"
      }
    ]
  ]
}
```

再次运行`npm run build`构建

```js
/******/ ;(() => {
  // webpackBootstrap
  var __webpack_exports__ = {}
  /*!**********************!*\
  !*** ./src/index.js ***!
  \**********************/
  var p = 'mike'
  /******/
})()
```

可以看到声明变量从`const`已经转义成`var`

捣鼓了这么久，可能有些小伙伴就该问了：怎么还不能在浏览器上查看页面呢？那么我们接着往下走

首先安装依赖包

```bash
npm install html-webpack-plugin -D
```

项目根目录新建`public`文件夹，在该目录下新建 index.html 文件，文件内容为标准 html5 模板即可

`webpack.config.js`添加如下配置

```js
const HtmlWebpackPlugin = require('html-webpack-plugin')
module.exports = {
  // ...
  plugins: [
    new HtmlWebpackPlugin({
      template: './public/index.html',
      filename: 'index.html', //打包后的文件名
      hash: true,
    }),
  ],
}
```

再次运行`npm run build`构建,可以看到 dist 目录下多了依照`public/index.html`生成的`index.html`文件，并且自动引入了构建的 js 文件,这时候我们已经可以通过`live server`将我们的代码运行在浏览器上了，但是每次修改后都要重新构建才能预览变更显然是不合理的，我们需要的是在浏览器中能实时展示效果

### 实时预览

遇事不决，先装依赖

```bash
npm install webpack-dev-server -D
```

在`package.json`添加脚本

```json
{
  "scripts": {
    "dev": "webpack serve",
    "build": "webpack --mode=development"
  }
}
```

运行启动脚本 `npm run dev`，可以在终端看到程序已经运行到`http://localhost:3000/`，打开浏览器访问该连接即可预览我们程序

修改一下我们的代码，例如在 `src/index.js` 中添加`console.log('Hello World')` 保存后回到浏览器打开控制台，可以发现已经成功打印,我们还可以在 `webpack.config.js` 中进行自定义的 `webpack-dev-server` 相关配置，更多配置 [webpack-dev-server](https://webpack.js.org/)

```js
// webpack.config.js
module.exports = {
  //...
  devServer: {
    port: '9000', //修改端口为 9000
    compress: true, //是否启用 gzip 压缩
  },
}
```

重新`npm run dev`程序启动在`http://localhost:9000/`，抱着严谨的态度复制该链接在 IE 浏览器访问，打开控制台，好家伙居然报错了，我们开始不是通过`babel`把高版本 js 向下兼容了吗,根据报错信息以及`dist`文件夹下打包的代码定位到原因：`babel`的确帮我们进行了转义，但是 webpack 5 在构建的时候默认是箭头函数来包裹代码，而箭头函数在低版本浏览器中是不兼容的

```js
// webpack.config.js
module.exports = {
  //...
  output: {
    // 配置webpack不使用箭头函数
    environment: {
      arrowFunction: false,
    },
  },
}
```

修改配置文件后，需要重新启动程序`npm run dev`,ie 浏览器下刷新报错清除，正常打印,运行`npm run build`发现`dist`目录下构建的 js 代码中箭头函数被替换成普通函数

### devtool

我们将`src/index.js`中`console.log('Hello World')`这一行前回车多添加几个空行,打开浏览器控制台查看
![在这里插入图片描述](https://img-blog.csdnimg.cn/cbf8d7fa623c4b82980b2baff6bb448e.png#pic_center)

如图告诉我这一行打印来自与 bundle.xxx 文件第二行，而实际情况是我的这行代码写在`src/index.js`的第五行，这样就很影响我们开发过程中定位问题，`devtool`可以帮助我们映射源码位置，帮助我们 debugger

```js
// webpack.config.js
module.exports = {
  //...
  devtool: 'source-map',
}
```

修改配置文件，重启程序`npm run dev`，正确映射源码地址
![在这里插入图片描述](https://img-blog.csdnimg.cn/d25ba09807a24ebd9d3a2a95a120ed08.png#pic_center)

\*`devtool`的不同设置会直接影响到构建速度，以及打包后文件的大小，因此要根据实际情况配置，具体参考[devtool](https://webpack.js.org/configuration/devtool/)

### style

新建`src/index.less`文件，并且在`src/index.js`中引入

```less
//  index.less
body {
  height: 100vh;
  background: chocolate;
}
```

![在这里插入图片描述](https://img-blog.csdnimg.cn/dbbcb275b2734ab09eec2149846eb5b6.png#pic_center)

终端报错，提示我们需要`loader`来处理`.less`类型的文件。对于`css`、`less`、`sass`等样式文件 webpack 并不能直接处理，需要借助相应的 loader，接下来以`less`为例，来使得 webpack 可以处理样式文件，首先先安装依赖

```bash
npm i style-loader css-loader less-loader less -D
```

修改`webpack.config.js`配置文件

```js
// webpack.config.js
module.exports = {
  // ...
  module: {
    rules: [
      // ...
      {
        test: /\.(c|le)ss$/,
        use: ['style-loader', 'css-loader', 'less-loader'],
        exclude: /node_modules/,
      },
    ],
  },
}
```

`npm run dev` 重启程序，报错清楚，浏览器能正确显示设置的背景色

### 图片以及字体文件处理

修改`src/index.less`

```less
// index.less
body {
  height: 100vh;
  background: url('../img/tx.jpeg');
}
```

当我们设置背景为一张本地图片时，发现终端报类似上面处理`less`文件的错误，也就是说我们需要配置对应`loader`来处理

```bash
npm install url-loader -D
```

```js
// webpack.config.js
module.exports = {
  // ...
  module: {
    rules: [
      // ...
      {
        test: /\.(png|jpg|gif|jpeg|webp|svg|eot|ttf|woff|woff2)$/,
        use: [
          {
            loader: 'url-loader',
            options: {
              limit: 10240, //10K 小于10k的图片会转换称base64 能减少http请求
              esModule: false,
              name: '[name]_[contenthash:6].[ext]', // 命名  默认是文件名转MD5的哈希值
              outputPath: 'assets/images', //本地资源较多时 指定统一的打包地址
            },
          },
        ],
        exclude: /node_modules/,
      },
    ],
  },
}
```

### 打包前清空 dist 目录

由于每次打包都会生成`dist`文件夹，文件名上又存在 hash 的原因，所以每次打包，之前的`dist`目录下的文件就会成为没有意义的垃圾文件，我们可以打包前手动清除它，当然我们可以使用`webpack`的插件来帮我们偷懒

```bash
npm i clean-webpack-plugin -D
```

```js
// webpack.config.js
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
module.exports = {
  // ...
  plugins: [
    // ...
    new CleanWebpackPlugin(),
  ],
}
```

可以配置`cleanOnceBeforeBuildPatterns`,来排除那些不想清除的文件

```js
// webpack.config.js
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
module.exports = {
  // ...
  plugins: [
    // ...
    new CleanWebpackPlugin({
      cleanOnceBeforeBuildPatterns: ['**/*', '!base', '!base/**'],
    }),
  ],
}
```

### 静态资源拷贝

有时候我们有一些本地资源不希望经过 webpack 打包处理，比如一些外部 sdk,接下来我们来模拟一下，在`public`目录下新建`js/cdn.js`文件，然后在`public/index.html`中将其引入

```js
// public/cdn.js
console.log('cdn init')
```

```html
<!-- index.html -->
<script src="./js/cdn.js"></script>
```

打开浏览器控制台，发现我们引入的`cdn.js`报 404 了，因为我们并没有在入口文件`src/index.js`中引入`cdn.js`，所以 webpack 并没有将其打包，我们可以通过插件来帮我们自动拷贝文件来解决这个问题

```bash
npm i copy-webpack-plugin -D
```

修改配置文件

```js
// webpack.config.js
const CopyWebpackPlugin = require('copy-webpack-plugin')
module.exports = {
  // ...
  plugins: [
    // ...
    new CopyWebpackPlugin({
      patterns: [
        {
          from: 'public/js/*.js',
          to: 'js/[name][ext]',
        },
      ],
    }),
  ],
}
```

`npm run dev`重启程序，发现浏览器控制台 404 错误清除，正确打印`cdn init`

配置到这一步，webpack 的基础配置就差不多完成了，不过 webpack 的强大远不止此，可以根据实际的需求完善&优化 webpack 的配置～
