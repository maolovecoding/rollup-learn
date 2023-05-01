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

## rollup的基本使用

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

### rollup插件的编写

#### 插件的钩子执行流程图

![image-20220508164526513](https://gitee.com/maolovecoding/picture/raw/master/images/web/webpack/image-20220508164526513.png)
