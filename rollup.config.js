export default {
  input: "./src/main.js",
  output: {
    file: 'dist/bundle.js',
    format: 'iife', // cjs/es/iife/umd/amd
    name: 'bundleName', // umd / iife 需要变量名 只有入口文件导出了变量名 这个name才有用
  },
};