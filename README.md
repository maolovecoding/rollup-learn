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

### rollup插件的编写

#### 插件的钩子执行流程图

![image-20220508164526513](https://gitee.com/maolovecoding/picture/raw/master/images/web/webpack/image-20220508164526513.png)
