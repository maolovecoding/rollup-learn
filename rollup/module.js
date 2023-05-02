import  MagicString from 'magic-string'
import { parse } from 'acorn'
import analyse from './ast/analyse.js'
class Module{
  constructor(options){
    const {
      code, // 源代码
      path, // 文件路径
      bundle // 打包的Bundle类实例
    } = options
    this.code = new MagicString(code)
    this.path = path
    this.bundle = bundle
    // 获取ast
    this.ast = parse(code, {
      ecmaVersion: 8,
      sourceType: 'module'
    })
    // 分析语法树
    analyse(this.ast, this.code, this)
  }
  /**
   * 展开语句
   */
  expandAllStatement(){
    const allStatements = []
    this.ast.body.forEach(statement=>{
      const statements = this.expandStatement(statement)
      allStatements.push(...statements)
    })
    return allStatements
  }
  expandStatement(statement){
    statement._included = true // 语句包含在输出结果
    const res = []
    res.push(statement)
    return res
  }
}

export default Module