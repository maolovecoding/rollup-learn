## rollup

### input和output

```js
export default {
  input: "./src/index.js", // 类似于 webpack的entry
  output: {
    // 类似于webpack的output
    file: "./dist/bundle.js", // 类似于 webpack的 filename
    format: "cjs", // 六种输出格式 amd es iife umd cjs system
    name: "calculator", // 导出名字 在输出格式为iife或者umd的时候必须提供 将会作为一个全局变量挂在window上
  },
};
```

#### format的六种方式的区别

在入口文件上就写一行代码

```js
export default "index"
```

##### cjs

配置format的值为cjs的时候，我们打包的代码的格式：

```js
'use strict';

var index = "index";

module.exports = index;

```

##### es

```js
var index = "index";

export { index as default };
```

##### iife

立即执行函数的表达式，返回值给了我们当时配置的name属性的值。

```js
var calculator = (function () {
 'use strict';

 var index = "index";

 return index;

})();

```

##### umd

```js
(function (global, factory) {
 typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
 typeof define === 'function' && define.amd ? define(factory) :
 (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.calculator = factory());
})(this, (function () { 'use strict';

 var index = "index";

 return index;

}));

```

##### amd(了解)

```js
define((function () { 'use strict';

 var index = "index";

 return index;

}));

```

##### system(废弃)

```js
System.register('calculator', [], (function (exports) {
 'use strict';
 return {
  execute: (function () {

   var index = exports('default', "index");

  })
 };
}));

```

### rollup的基本使用

```js
// 使用babel
import babel from '@rollup/plugin-babel'
// 支持commjs
import commonjs from "@rollup/plugin-commonjs";
// node模块解析
import nodeResolve from '@rollup/plugin-node-resolve'
// 支持ts
import typescript from "@rollup/plugin-typescript";
// 压缩代码
import { terser } from 'rollup-plugin-terser'
// 支持css
import postcss from 'rollup-plugin-postcss'
// 开发服务器
import serve from 'rollup-plugin-serve'
export default {
  input: "./src/main.ts",
  output: {
    file: 'dist/bundle.js',
    format: 'iife', // cjs/es/iife/umd/amd
    name: 'bundleName', // umd / iife 需要变量名 只有入口文件导出了变量名 这个name才有用
    globals: {
      lodash: '_',
      jquery: '$', // 模块对应的全局变量名
    }
  },
  // 配置外部模块 也就是打包的时候不打包这两个模块了 走的是CDN
  external: ['lodash', 'jquery'],
  // 插件
  plugins: [
    // babel({
    //   exclude: /node_modules/,
    // }),
    nodeResolve(),
    commonjs(),
    typescript(),
    // terser(),
    postcss(),
    serve({
      open: true,
      port: 8000,
      contentBase: [
        './public',
        './dist'
      ] // 静态资源根目录
    })
  ],
};
```

## rollup的实现

安装依赖

```shell
pnpm i rollup magic-string acorn -D
```

### magic-string的用法

```js
import MagicString, { Bundle } from 'magic-string'
const sourceCode = `export const name = 'mao'`
const ms = new MagicString(sourceCode)
// 裁减 0-6范围的内容
console.log(ms.snip(0, 6).toString()) // export
// 删除 0-7范围的内容
console.log(ms.remove(0, 7).toString()) // const name = 'mao'
// 拼接字符串
const bundle = new Bundle()
bundle.addSource({
  content: 'const a = 1;',
  // separator: '\n'
})
bundle.addSource({
  content: 'const b = 2;',
  // separator: '\n'
})
console.log(bundle.toString())
```

### acron的使用

#### ast遍历

```js
import * as acron from 'acorn'
const sourceCode = `import $ from 'jquery'`
// 解析生成ast
const ast = acron.parse(sourceCode, {
  locations: true,
  ranges: true,
  sourceType: 'module',
  ecmaVersion: 8
})

// 遍历ast
function walk(astNode, {enter, leave}){
  visit(astNode, null, enter, leave)
}
function visit(node, parent, enter, leave){
  if (enter) enter(node, parent)
  const keys = Object.keys(node).filter(key => typeof node[key] === 'object')
  keys.forEach(key=>{
    const vals = node[key]
    if (Array.isArray(vals)) {
      vals.forEach(val => val.type && visit(val, node, enter, leave))
    }else if(vals && vals.type){
      visit(vals, node, enter, leave)
    }
  })
  if (leave) leave(node, parent)
}

ast.body.forEach(statement => {
  walk(statement, {
    enter(node){
      console.log(node.type, '进入')
    },
    leave(node){
      console.log(node.type, '离开')
    }
  })
})
```

#### js变量作用域

```js

class Scope {
  constructor(options = {}) {
    this.name = options.name // 作用域名称
    /**
     * @type {Scope}
     */
    this.parent = options.parent // 父作用域
    this.names = options.names// 当前作用域中定义的变量
  }
  add(name) {
    this.names.push(name) // 作用域中添加一个新的变量
  }
  findDefiningScope(name) {
    // 查找变量作用域
    if (this.names.includes(name)) {
      return this
    }
    if (this.parent !== null)
      return this.parent.findDefiningScope(name)
    return null
  }
}

// =============================
var a = 1
function one(){
  var b = 2
  function two(){
    var c = 3
    console.log(a, b, c)
  }
}
// =============================
const globalScope = new Scope({
  name: 'global',
  names: ['a'],
  parent: null
})
const oneScope = new Scope({
  name: 'oneScope',
  names: ['b'],
  parent: globalScope
})
const twoScope = new Scope({
  name: 'twoScope',
  names: ['c'],
  parent: oneScope
})
console.log(twoScope.findDefiningScope('c'))
console.log(twoScope.findDefiningScope('b'))
console.log(twoScope.findDefiningScope('a'))
```

### rollup插件的编写

#### 插件的钩子执行流程图

![image-20220508164526513](https://gitee.com/maolovecoding/picture/raw/master/images/web/webpack/image-20220508164526513.png)

#### rollup执行三个阶段

```js
import { rollup } from 'rollup'
import config from './rollup.config.js'

/** 
 * rollup 执行有三个阶段
 * 1. 打包阶段
 * 2. 生成阶段
 * 3. 写入阶段
*/
(async () => {
  // 1. 打包阶段
  const bundle = await rollup(config)
  // 2. 生成阶段
  await bundle.generate(config.output)
  // 3. 写入阶段
  await bundle.write(config.output)
  // 4. 关闭阶段
  await bundle.close()
})()
```

#### 插件的编写

1. 插件是一个函数
2. 插件返回值是一个对象

- 插件应该有一个清晰的名称，带有rollup-plugin-prefix
- 在package.json中包含插件关键字
- 插件应该经过测试。我们推荐mocha或ava，它们支持开箱即用的Promise
- 尽可能使用异步方法。
- 编写英文文档
- 如果合适的话，确保你的插件输出正确的sourcemap
- 如果您的插件使用“虚拟模块”（例如，用于辅助功能），请在模块ID前面加上\0。这会阻止其他插件尝试处理它
