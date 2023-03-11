---
title: 如何优雅的实现前端请求Mock
date: 2022-07-13 11:25:38
cover: /blogs/images/cover6.jpeg
---

## 前言

本文将详细介绍两种不借助第三方 Mock 工具的前端请求 Mock 方案

## 背景

在我们前端的日常工作中，难免需要请求后端的接口获取数据来进行页面的渲染，这个时候我们前端静态页面的开发以及相应的逻辑处理都与后端的接口息息相关，所以绝大多数时候在新需求的前期，我们前后端需要统一一份接口文档，以此来作为各自开发的指导和约束。

接口定义好入参、返参之后我们就可以在前端自己 mock 数据进行相关的开发，比如有一个定义好的查询商品列表的接口,我们很自然的就能依据接口文档写出如下代码

```js
// 定义api
const getProducts = () => {
  return axios.get('/products')
}

// 组件中使用
getProducts().then(res => {
  this.productList = res.data
})
```

但是在一开始，后端往往只是定义了一个接口格式，并没有实现其中的业务逻辑，或者是并没有部署，为了让页面有数据方便开发，我们可能会按照以下两种方式进行 mock

1. 修改定义 api 的部分

```js
const getProducts = () => {
  return Promise.resolve([{ id: 001, name: '商品1' }])
}
```

2. 修改调用部分

```js
getProducts()
  .then(res => {
    // this.productList = res.data
  })
  .finally(() => {
    this.productList = [{ id: 001, name: '商品1' }]
  })
```

可以看出无论哪种方式，我们都要修改接口相关处的代码，等到接口真正可用时我们又得删除这一部分无用的 mock 代码，如果有几十个接口，重复的工作量大不说，而且容易遗漏，接下来我们就一起来尝试如何优雅实现前端 mock

## 实践

因为目前公司项目以 vue 为主，所以接下来的两个方案都是以`vue/cli 4.x`版本构建的项目进行介绍（react 同理，配置 webpack 即可）,http 请求使用的主流的`axios`

### 方案一 利用 axios 的 adpter

`axios`作为一款优秀的 http 库,能兼容在浏览器环境以及 node 环境发送 http 请求，核心就是其内置`adpter`模块会根据运行环境在浏览器端使用`XMLHttpRequest`，在 node 环境使用其内置`http`发起请求，并且支持配置自定义`adpter`,方案一就从这里入手

从场景出发，我们在本地开发的时候是否需要使用 mock 显然是一个需要全局可控的操作，可以简单的进行开关，最合适的方式就是从脚本区分

添加`dev:mock`脚本，区分`dev`,开启全局 mock

```json
// package.json
"scripts": {
    "dev": "vue-cli-service serve",
    "build": "vue-cli-service build",
    "dev:mock": "cross-env IS_MOCK=true vue-cli-service serve",
  },
```

`cross-env`帮我们处理兼容问题，向`process.env`中注入`IS_MOCK`变量

修改 webpack 配置,省略其余不相关配置

```js
// vue.config.js
const IS_MOCK = process.env.IS_MOCK === 'true' // 当运行dev:mock时为true

module.exports = {
  // 利用webpack definePlugin注入全局变量
  chainWebpack: config => {
    config.plugin('define').tap(args => {
      args[0].IS_MOCK = IS_MOCK
      return args
    })
  },
}
```

添加 mock 配置文件

```js
module.exports = {
  '/products': {
    code: 0,
    data: [{ id: 001, name: '商品1' }],
    message: 'success',
  },
}
```

封装 axios 实例

```js
import axios from 'axios'
// 读取mock配置
const mockMap = require('xxxxxx/mock.js') // mock配置文件路径
var instance = axios.create({
  adapter: config => {
    // mock配置中匹配到当前url并且开启mock启用自定义adpter
    if (mockMap[config.url] && IS_MOCK) {
      return Promise.resolve({
        data: mockMap[config.url],
        status: 200,
      })
    } else {
      // 调用默认的适配器处理，需要删除自定义适配器，否则会死循环
      delete config.adapter
      return axios(config)
    }
  },
})
export default instance
```

定义 api 采用配置后的 axios 实例

```js
// api.js
import instance from 'xxxx' // axios实例路径
export const getProducts = () => {
  return instance.get('products')
}
```

组件中使用

```js
import { getProducts } from 'api.js'

getProducts().then(res => {
  this.productList = res.data
})
```

使用这种方案后续只需要维护`mock.js`文件,把接口文档相应的内容配置上就可以实现本地开发请求的 mock,可以运行`dev`或者`dev:mock`来决定是否启用 mock

\*\* 这种模式类似于上面修改定义 api 的方式实现 mock，方便之处在于可以全局统一处理，实际上并不会发送 http 请求。

### 方案二 proxy + express

方案一虽然实现了简单的 mock 功能，但实际上思考一下还是有几处不够合理的地方：

1.  并没有实际发送 http 请求，对请求的整个链路没有做到尽可能真实的模拟
2.  依赖于 axios 库，其它 http 库能否实现以及实现是否像 axios 一样轻便没有探究，因此可拓展性较差
3.  功能耦合，mock 作为一个额外的功能模块，把其嵌入到 axios 中处理，会使得 axios 变得略显臃肿

基于以上几个问题，于是有了使用`express`启动一个代理服务器，接收我们前端应用的请求来进行 mock 相关的处理，模拟一个完整的 http 请求链路的想法

首先在项目根目录下新建一个`server.js`文件，用来写我们代理服务器的代码

```js
const express = require('express')
// 引入mock配置文件
const mockMap = require('./mock')
const app = express()
app.use(express.json())

app.all('*', requestFilter, async (req, res, next) => {
  const { path } = req
  res.send(mockMap[path])
})

// 端口和 webpack prxoy中设置对应上，可以随意设置一个未被占用的端口
app.listen('3306', () => {
  console.log('serve is running at port 3306')
})
```

通熟易懂，就是监听 3306 端口，拦截所有请求,返回 mock 数据

修改 webpack 的 proxy 配置，使得运行 mock 脚本时，请求打到我们的代理服务器上,省略其余不相关配置

```js
// vue.config.js
const IS_MOCK = process.env.IS_MOCK === 'true' // 当运行dev:mock时为true

module.exports = {
  devServer: {
    // ...
    proxy: {
      // 所有匹配/api的请求会被转发到target
      '/api': {
        // 开启mock时 设置target为本地代理服务地址，这里端口3306与serve中监听端口保持一致
        target: IS_MOCK ? 'http://localhost:3306/' : 'xxxxx',
        ws: true,
        changeOrigin: true,
        pathRewrite: {
          '^/api': '',
        },
      },
    },
  },
}
```

修改一下上文创建 axios 实例的代码`instance.defaults.baseURL = "/api"`,设置一下所有请求的`baseURL`，以此来使 proxy 配置匹配所有请求

完成上述配置，我们重启前端应用，并且启动我们的服务端代码就可以使用 mock 功能了
,我们可以修改一下脚本，方便当我们开启 mock 功能的时候自动启动 serve 服务

```json
// package.json
"scripts": {
    "dev": "vue-cli-service serve",
    "build": "vue-cli-service build",
    "dev:mock": "cross-env IS_MOCK=true vue-cli-service serve & node serve.js",
  },
```

其实到这里，mock 的功能已经可用了，我们还可以基于现有的代码结合自身的需求的进行拓展

#### 拓展

我在项目中使用的时候进行了一点点拓展，给大家提供一个拓展的参考

修改`mock`配置文件

```js
module.exports = {
  '/products': {
    code: 0,
    data: [
      {
        id: 1,
        name: '商品1',
      },
    ],
    message: 'success',
    config: {
      method: 'GET',
      delay: 1000,
      validator: request => {
        const error = {
          status: 400,
          msg: '请检查参数是否合法!',
        }
        const success = {
          status: 200,
          msg: 'success',
        }
        // 假设该请求需要一个必传参数 timestamp
        return request.query.timestamp ? success : error
      },
    },
  },
}
```

加了额外的 config 字段进行一些差异化配置，例如指定响应延时 1000ms 必传参数校验等

修改`serve`端代码

```js
const express = require('express')
const mockMap = require('./mock')
const app = express()
app.use(express.json())

// 请求过滤器
const requestFilter = (req, res, next) => {
  const { path, method } = req
  // 设置相应头 处理中文乱码
  res.set('Content-Type', 'text/plain')
  // 404 提前过滤
  if (!mockMap[path]) {
    res.status(404).end()
  }
  // 请求方法不匹配提前过滤
  if (method !== mockMap[path].config?.method ?? 'GET') {
    res.status(405).end('请检查请求方法是否正确!')
  }
  // 自定义校验规则不匹配过滤
  if (mockMap[path].config && mockMap[path].config.validator) {
    const data = mockMap[path].config.validator(req)
    if (data.status !== 200) {
      res.status(data.status).end(data.msg)
    }
  }
  setTimeout(() => {
    next()
  }, mockMap[path].config?.delay ?? 0)
}
app.all('*', requestFilter, async (req, res, next) => {
  const { path } = req
  // 移除config字段
  const { code, data, message } = mockMap[path]
  res.send({ code, data, message })
})
app.listen('3306', () => {
  console.log('serve is running at port 3306')
})
```

核心就是加了个中间件去处理额外的一些逻辑，可以根据实际需求按需拓展中间件即可

上述就是我介绍的两种前端实现请求 Mock 的方案，配置起来还是非常简单，新老项目都能轻易的插拔上述 mock 功能来提高开发的效率
