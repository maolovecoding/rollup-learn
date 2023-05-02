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