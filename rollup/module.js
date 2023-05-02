import  MagicString from 'magic-string'
import { parse } from 'acorn'
import analyse from './ast/analyse.js'
const SYSTEM_VARS = ['console', 'log']
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
    // 存放该模块内导入了那些变量 导出
    this.imports = {} // name: {source:相对当前模块的路径/绝对路径, importName: 导入的变量名}
    this.exports = {}
    this.definitions = {} // 存放本模块的顶级变量的定义语句是那个
    // 存放变量修改的语句 副作用
    this.modifications = {}
    // 分析语法树
    analyse(this.ast, this.code, this)
  }
  /**
   * 展开语句
   */
  expandAllStatement(){
    const allStatements = []
    this.ast.body.forEach(statement=>{
      // 过滤掉导入的语句
      if (statement.type === 'ImportDeclaration') return
      // 默认情况不包含所有的变量声明语句
      if (statement.type === 'VariableDeclaration') return
      const statements = this.expandStatement(statement)
      allStatements.push(...statements)
    })
    return allStatements
  }
  expandStatement(statement){
    statement._included = true // 语句包含在输出结果
    const res = []
    // 找到此语句使用到的变量 把这些变量定义语句取出来，放到res数组
    const _dependsOn = Object.keys(statement._dependsOn)
    _dependsOn.forEach(name => {
      const definitions = this.define(name)
      res.push(...definitions)
    })
    res.push(statement)
    // 找到此语句定义的变量 把此语句对应的修改语句也包含进去
    const defines = Object.keys(statement._defines)
    defines.forEach(name => {
      // 找到变量对应的副作用语句
      const modifications = Object.hasOwn(this.modifications, name) && this.modifications[name]
      if (modifications) {
        modifications.forEach(modification => {
          if (!modification._included) {
            const statements = this.expandStatement(modification)
            res.push(...statements)
          }
        })
      }
    })
    return res
  }
  define(name){
    // 区分变量是模块内声明 还是外部导入
    if (Object.hasOwn(this.imports, name)) {
      const { source, importName } = this.imports[name]
      // 获取导入的模块
      const importedModule = this.bundle.fetchModule(source, this.path)
      const { localName } = importedModule.exports[importName]
      return importedModule.define(localName)
    } else {
      // 内部定义的
      const statement = this.definitions[name] // 变量定义的语句
      if (statement) {
        if (statement._included) {
          return []
        } else {
          return this.expandStatement(statement)
        }
      } else {
        if (SYSTEM_VARS.includes(name)) {
          return []
        } else {
          throw new Error(`变量${name}即没有外部导入，也没有在当前模块内声明。`)
        }
      }
    }
  }
}

export default Module