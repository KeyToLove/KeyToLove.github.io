---
title: DIY属于自己的chatgpt web应用
date: 2023-03-29 16:40:12
tags:
cover: /images/cover5.jpeg
---

## 前言

得力于其强大的`AI`对话能力，最近`chatgpt`可谓是火出圈了；不管你是向它抛出专业领域的问题（代码、科技、医疗...），还是更贴近生活的提问（文案优化、内容提纲、增肌减脂建议...），`chatgpt`基本都能给出较为满意的答案。

![陨石为什么总是落到陨石坑](/images/chatgpt01.jpg) 一些看起来不太正常的问题除外 😆

本文对`chatgpt`就不展开做更多的介绍了（正儿八经技术文），主要是用其对外开放的 API 能力来帮我们 DIY 一个自己的 web 小应用。做这个的初衷一个是捣鼓一下 API 耍耍，还有一个最重要的原因就是优化个人使用的体验，DIY 能提供更多的自由度让我们“调教”`chatgpt`来做更多有趣的事。很多最近使用`chatgpt`的小伙伴应该也发现访问其官网不太稳定，即使使用了 🪜，许多网络节点（香港/台湾/日本等）仍然并不可使用，但是 API 没做额外的限制，下面我给大家介绍自己做的一个简单 demo，大家可以作为参考来折腾更好玩的功能，项目仓库和体验地址将会在文末贴出，那么 let's go ~

## 效果预览

Demo 主要是使用了`openai`的生成图片和对话的 API 接口，实现了如下两个功能
先放上几张效果图大伙们感受一下:

- Home Page

  ![首页](/images/chatgpt06.jpg)

- 示例-1: 根据描述生成图片 & 翻译

  ![示例-1](/images/chatgpt02.jpg)

- 示例-2: 智能 AI 对话

  ![示例-2](/images/chatgpt03.jpg)

## 实现

这里将会有一些前面的准备工作需要做：

- 网络环境 ok，有 vpn

- 要使用`openai`对外的 API 能力必须得有`openai`的账号并且创建一个 key，这个 key 就是我们调用`oepnai` API 的凭证信息，可以理解成 token。这里对创建账号和生成 key 不额外介绍（已有很多相关教程），贴一下`openai`的链接地址，生成 key 和后续查阅 API 文档都会用到 https://platform.openai.com/

- 最终我们的项目调用`openai` API 采用的是`vercel` `Edge Functions` 的模式，因此可以先行创建`vercel`账号，推荐 `github` 授权即可，免注册 https://vercel.com/

好的废话说完了，开始操作起来 🕶️

首先是初始化工程，这里采用的是 `create-vite` 快速项目

```
npm create vite <your_project_name>
```

根据提示一步步选择你个人喜好的即可

![create-vite初始化项目](/images/chatgpt04.jpg)

你也可以一步到位，直接根据现有模版初始化工程

![create-vite初始化项目](/images/chatgpt05.jpg)

本人由于公司项目一直使用`React`技术栈，所有这里选择`Vue`来初始化 Demo,换换口味～

```
npm create vite@latest <your_project_name> -- --template vue
```

项目初始化后我们可以删除模版多余模块仅保留入口文件即可，毕竟是 DIY 自己的 web 应用，前端页面的布局可以随性发挥，自己怎么喜欢怎么来。接下来会结合应用中的 demo 挑选部分逻辑讲解。

#### 前端路由

本应用暂时只包含`Demo-1` `Demo-2`两个示例，所以并没有额外引入`vue-router`,而是直接通过监听 url hash 值的变化，用动态组件的方式渲染对应的示例

```js
<template>
  <div class="nav">
    <button @click="go('demo-1')" :class="{ active: activeRoute === 'demo-1' }">
      Demo-1
    </button>
    <button @click="go('demo-2')" :class="{ active: activeRoute === 'demo-2' }">
      Demo-2
    </button>
  </div>
  <component :is="currentView"></component>
</template>

<script setup lang="ts">
const currentPath = ref(window.location.hash)

window.addEventListener('hashchange', () => {
  currentPath.value = window.location.hash
})

const activeRoute = computed(() => {
  return currentPath.value === '#/demo-2' ? 'demo-2' : 'demo-1'
})

const go = (path: string) => {
  window.location.href = `#/${path}`
}
</script>
```

#### 服务端调用 openai API

采用`vercel` `Edge Functions`的方式，将调用 openai API 的 server 端运行在 vercel 有如下好处：

1. 可以不需要购买服务器进行部署
2. vercel 云函数节点在纽约等地区，可以避免 proxy 节点污染导致访问 openai API 异常等问题

这一块可以直接参考该项目中 `/api` 目录下逻辑，具体细节可翻阅 `vercel` 文档

#### openai 对话 API 流处理

有使用过`chatgpt`的小伙伴应该知道，当我们发送给它一个问题，它会短暂 loading 后以打字机效果逐字给我们进行回复，因为`chatgpt`的模型十分庞大，如果待完整的处理完用户的输入，再将结果一并返回客户端进行渲染，将会有一段较长的 loading，对话 API 可以接受流的形式返回数据，核心代码如下

```ts
// 服务端处理stream
import {
  createParser,
  ParsedEvent,
  ReconnectInterval,
} from 'eventsource-parser'

const res = await fetch('https://api.openai.com/v1/chat/completions', {
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${your_openai_key}`,
  },
  method: 'POST',
  body: JSON.stringify(payload), // payload 为API参数，可查阅openai对应文档 https://platform.openai.com/docs/api-reference/completions/create
})

const stream = new ReadableStream({
  async start(controller) {
    // callback
    function onParse(event: ParsedEvent | ReconnectInterval) {
      if (event.type === 'event') {
        const data = event.data
        // https://beta.openai.com/docs/api-reference/completions/create#completions/create-stream
        if (data === '[DONE]') {
          controller.close()
          return
        }
        try {
          const json = JSON.parse(data)
          const text = json.choices[0].delta?.content || ''
          if (counter < 2 && (text.match(/\n/) || []).length) {
            // this is a prefix character (i.e., "\n\n"), do nothing
            return
          }
          const queue = encoder.encode(text)
          controller.enqueue(queue)
          counter++
        } catch (e) {
          // maybe parse error
          controller.error(e)
        }
      }
    }

    // stream response (SSE) from OpenAI may be fragmented into multiple chunks
    // this ensures we properly read chunks and invoke an event for each SSE event stream
    const parser = createParser(onParse)
    // https://web.dev/streams/#asynchronous-iteration
    for await (const chunk of res.body as any) {
      parser.feed(decoder.decode(chunk))
    }
  },
})
```

```ts
//client端读取流核心代码
const reader = data.getReader()
const decoder = new TextDecoder()
let done = false

while (!done) {
  const { value, done: doneReading } = await reader.read()
  done = doneReading
  const chunkValue = decoder.decode(value)
  // onMessage为页面回调函数，拼接更新文本框内容实现打字机效果
  onMessage(chunkValue)
}
```

#### 对话代码高亮 & 一键 copy

使用`marked`解析 markdown 文本，结合`highlight`对 markdown 中代码块高亮；

AI 回复完成后追加 copy 按钮

```ts
const addCopyButton = () => {
  // 找到所有 marked 解析后的代码块
  document.querySelectorAll('pre code').forEach((block: Element) => {
    const parentNode = block.parentElement as HTMLElement
    // 忽略已经添加复制按钮的代码块
    if (parentNode?.firstChild?.nodeName === 'BUTTON') {
      return
    }
    const copyButton = document.createElement('button')
    copyButton.className = 'copy-button'
    copyButton.textContent = 'Copy'
    parentNode.insertBefore(copyButton, block)
    // 添加复制功能
    copyButton.addEventListener('click', () => {
      const code = block.textContent as string
      const el = document.createElement('textarea')
      el.value = code
      document.body.appendChild(el)
      el.select()
      document.execCommand('copy')
      document.body.removeChild(el)
      copyButton.textContent = 'Copied!'
      setTimeout(() => {
        copyButton.textContent = 'Copy'
      }, 2000)
    })
  })
}
```

#### 对话记录持久化

每完成一次对话操作将对话内容持久化存储`localStorage`中，初始化的时候读取本地对话历史进行渲染，请求时携带对话上下文历史信息，这里有很多 Todo,例如不只是记录一条对话历史，像`chatgpt`记录近期完整的对话记录等

## 写在最后

项目 github 仓库地址：https://github.com/KeyToLove/chatgpt-demo
项目 vercel 体验地址：https://chatgpt-keytolove.vercel.app/

项目受 [twitterbio](https://github.com/Nutlope/twitterbio) 启发，感谢 🙏

欢迎大家分享 open API 使用上更多好玩的点子 💡 喜欢的话可以点个 👍 和 给仓库一个 star ～
