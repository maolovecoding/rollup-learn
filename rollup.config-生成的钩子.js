import path from "path";
import fs from "fs";
import babel from "@babel/core";
import pluginutils from "rollup-pluginutils";
import { execSync } from "child_process";
export default {
  input: "./src/index.js", // 类似于 webpack的entry
  output: {
    // 类似于webpack的output
    // file: "./dist/bundle.js", // 类似于 webpack的 filename
    dir: path.resolve(__dirname, "./dist"),
    // format: "es", // 六种输出格式 amd es iife umd cjs system: ;
    // name: "calculator", // 导出名字 在输出格式为iife或者umd的时候必须提供 将会作为一个全局变量挂在window上
  },
  // 插件
  plugins: [
    autoInstall(),
    // 1) 先写一个构建的插件 主要核心就是转义代码
    // 基本上所有的插件都是函数 rollup插件本质上是一个对象(函数的执行结果)
    buildHooks({
      alias: {
        "@": "./src",
      },
      include: /\.js$/,
      exclude: /\.txt/,
    }),
  ],
};
// 自动下载未安装的模块
function autoInstall() {
  const commands = {
    npm: "npm install",
    yarn: "yarn add",
  };
  const manager = fs.existsSync(path.resolve(__dirname, "./package-lock.json"))
    ? "npm"
    : "yarn";
  const cmd = commands[manager];
  const packageJson = JSON.parse(
    fs.readFileSync(path.resolve(__dirname, "./package.json"))
  );
  const installed = new Set([
    ...Object.keys(packageJson.devDependencies),
    ...Object.keys(packageJson.dependencies),
  ]);

  return {
    name: "rollup-plugin-auto-install",
    resolveId(importee, importer) {
      if (!importer) return; // 根入口
      if (importee[0] === "." || path.isAbsolute(importee)) {
        // 相对路径引入
        return;
      }
      // 绝对路径
      if (!installed.has(importee)) {
        console.warn("install " + importee);
        // 使用子进程命令进行安装
        execSync(`${cmd} ${importee} -D`);
      }
    },
  };
}

/*
  1. 构建的钩子，需要将代码进行转化的一系列方法 await rollup.rollup(inputOptions);
  2. 生成的钩子 写真实的文件，添加文件的内容 整理打包的资源 await bundle.generate(outputOptions);
*/

// 1 2  根据输入进行构建input 根据输出进行打包结果 output

// 构建的钩子 buildHooks
function buildHooks(userOptions = {}) {
  let input;
  const alias = Object.keys(userOptions?.alias || {});
  const { include, exclude } = userOptions;
  const filter = pluginutils.createFilter(include);
  return {
    name: "rollup-plugin-build-hook",
    options(inputOptions) {},
    buildStart(inputOptions) {},
    resolveId(importee, importer) {
      const char = importee.split("/")[0];
      if (alias.includes(char)) {
        return importee.replace(char, userOptions.alias[char]);
      }
    },
    load(importee) {},
    // 用的最多的钩子 90%的插件都是靠这个钩子 将代码进行转化
    transform(code, filename) {
      if (!filter(filename)) return;
      // code 是代码 filename 在加载的资源不是js的情况 比如图片等
      // console.log(code)
      // 将es6转化为es5的代码 需要rollup配合babel来使用 @/babel/core @babel/preset-env
      /**
       * 内部将es6转为es5 -> babel.transform()
       * 加载部分的配置文件 loadPartialConfig() -> .babelrc
       */
      const config = babel.loadPartialConfig({ filename }); // 可以相对一个文件去找 babelrc
      // 拿到转化后的配置选项
      const transformOptions = config.options;
      // console.log(transformOptions);
      // 进行同步转化
      const res = babel.transformSync(code, {
        ...transformOptions,
        caller: {
          name: "@rollup/plugin-babel",
          supportsStaticESM: true, // 不需要解析es模块
        },
      });
      // console.log(res);
      return res;
    },
    // 这个钩子可以修改ast语法树 在vite中没办法使用这个钩子了
    moduleParsed(moduleInfo) {
      // console.log(moduleInfo.ast)
    },
    // 主要用来解析动态导入的 import().then
    resolveDynamicImport(id) {
      if (id.endsWith("minus")) {
        return path.resolve(__dirname, "./src/minus.js");
      }
    },
    // 解析import.meta.xxx 的钩子
    resolveImportMeta(property, { moduleId }) {
      if (property === "xxx") {
        return `${JSON.stringify("my-xxx")}`;
      }
      return null;
    },
  };
}
