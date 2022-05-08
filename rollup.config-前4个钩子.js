import path from "path";
import babel from '@babel/core'
export default {
  input: "./src/index.js", // 类似于 webpack的entry
  output: {
    // 类似于webpack的output
    // file: "./dist/bundle.js", // 类似于 webpack的 filename
    dir: path.resolve(__dirname, "./dist"),
    format: "es", // 六种输出格式 amd es iife umd cjs system: ;
    name: "calculator", // 导出名字 在输出格式为iife或者umd的时候必须提供 将会作为一个全局变量挂在window上
  },
  // 插件
  plugins: [
    // 1) 先写一个构建的插件 主要核心就是转义代码
    // 基本上所有的插件都是函数 rollup插件本质上是一个对象(函数的执行结果)
    buildHooks({
      alias: {
        "@": "./src",
      },
    }),
  ],
};
/*
  1. 构建的钩子，需要将代码进行转化的一系列方法 await rollup.rollup(inputOptions);
  2. 生成的钩子 写真实的文件，添加文件的内容 整理打包的资源 await bundle.generate(outputOptions);
*/

// 1 2  根据输入进行构建input 根据输出进行打包结果 output

// 构建的钩子 buildHooks
function buildHooks(userOptions = {}) {
  let input;
  const alias = Object.keys(userOptions?.alias || {});
  return {
    // rollup要求你需要配置一个名字 一般以 rollup-plugin- 开头 用来提示错误信息 方便定位
    name: "rollup-plugin-build-hook",
    // inputOptions 用户配置的 rollup config
    options(inputOptions) {
      // 这个钩子内可以获取整个rollup的配置 但是无法拿到整个所有插件执行完毕的配置信息
      // 这个钩子中可以做一些初始化操作
      // console.log(inputOptions);
      // return {} // 如果你返回的是一个对象 那么会替换调这个inputOptions
    },
    // 所有的插件的options钩子执行完毕后，会调用 buildStart 这里通常做的事情是保留配置到插件自身
    buildStart(inputOptions) {
      input = inputOptions.input; // config中的入口文件
      console.log(input);
      // rollup重新打包，要求文件得有变化 而且是依赖的文件变化了才会重新打包
      // this.addWatchFile(); // 用来添加一个监控的文件或者目录(相对或者绝对路径) 文件变化时重新打包
    },
    // 解析我们导入的文件 在importer中导入了importee文件
    // 这个钩子通常用来改写引入的路径
    resolveId(importee, importer) {
      // importee -> source
      const char = importee.split("/")[0];
      console.log(alias, char, importee, importer);
      if (alias.includes(char)) {
        console.log(importee.replace(char, userOptions.alias[char]));
        return importee.replace(char, userOptions.alias[char]);
      }
      // 如果 resolveId钩子返回了false，代码就不会再执行了
      // 如果返回了一个路径 我们就会去解析这个路径的文件
      // 如果返回的路径 不是 . 或者 ./ 开头， 或者没有 . 等情况 rollup就认为是外部模块
    },
    // 用的非常少 可以进行 import.meta.url的替换
    // resolveFileUrl({ filename }) {
    //   return JSON.stringify(new URL("xx.html", "http://www.baidu.com").href);
    // },
    // 根据你给我的路径 可以返回文件中的内容 （不是外部模块才会来到这个钩子）
    load(importee) {
      if (importee.endsWith("index.js")) {
        // 根据路径 返回对应的内容
        // 统计的功能 我想计算一下总共打了多少个文件
        // const referenceId = this.emitFile({
        //   type: "asset",
        //   source: "<div>你好</div>",
        //   fileName: "xx.html",
        // }); // emitFile 可以为打包添加额外的文件
        // import.meta.ROLLUP_FILE_URL_id 是发射文件的路径
        // return `export default import.meta.ROLLUP_FILE_URL_${referenceId}`
        const referenceId2 = this.emitFile({
          type: "chunk",
          id: path.resolve(__dirname, "./src/minus.js"),
        });
        return `export default import.meta.ROLLUP_FILE_URL_${referenceId2}`;
        // return "abc"
      }
    },
    // 用的最多的钩子 90%的插件都是靠这个钩子 将代码进行转化
    transform(code) {
      // console.log(code)
      // 将es6转化为es5的代码 需要rollup配合babel来使用 @/babel/core @babel/preset-env
      /** 
       * 内部将es6转为es5 -> babel.transform()
      */
    },
  };
}
