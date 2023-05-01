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