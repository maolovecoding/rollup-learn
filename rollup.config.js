import build from './plugins/rollup-plugin-build.js'
import polyfill from './plugins/rollup-plugin-auto-polyfill-byAST.js'
import babel from './plugins/rollup-plugin-babel.js'
import output from './plugins/rollup-plugin-output.js'
export default {
  input: "./src/main.js",
  output: {
    // file: 'dist/bundle.js',
    dir: 'dist',
    // format: 'iife', // cjs/es/iife/umd/amd
    // name: 'bundleName', // umd / iife 需要变量名 只有入口文件导出了变量名 这个name才有用
  },
  plugins: [
    // build(),
    // polyfill(),
    // babel({
    //   extensions: ['.js', '.jsx'],
    //   include: 'src',
    //   exclude: /node_modules/,
    //   babel: {
    //     presets: [
    //       '@babel/preset-env'
    //     ]
    //   }
    // }),
    output()
  ]
};