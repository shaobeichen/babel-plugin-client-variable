# babel-plugin-client-variable

## 安装

使用 npm 安装

```bash
npm install babel-plugin-client-variable -D
```

## 使用

在 babel.config.js 中添加

```diff
+  const clientVariable = require('babel-plugin-client-variable');

module.exports = {
+  plugins: [
+    clientVariable
+  ]
}
```

## 使用后效果

使用前打包编译成

```js
function name1() {
  const aaa = document.querySelector('body')
  console.warn(aaa)
}

name1()
```

使用后打包编译成

```js
function name1() {
  const aaa = process.client ? document.querySelector('body') : {}
  console.warn(aaa)
}

name1()
```
