/**
 * 
 * @param {*} ast 
 * @param {*} code 
 * @param {Module} module 模块实例
 */
function analyse(ast, code, module){
  ast.body.forEach(statement => {
    Object.defineProperties(statement,{
      _included: { value: false, writable: true }, // 表示这条语句默认不包含在输出结果里
      _module: {
        value: module, // 指向自己的模块
        writable: true
      },
      _source: { // 语句对应的源码
        value: code.snip(statement.start, statement.end),
        writable: true
      }
    })
  })
}
export default analyse