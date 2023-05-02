import path from 'path'
import fs from 'fs'
import { Bundle as MagicStringBundle } from 'magic-string'
import Module from './module.js'
import { writeFileSync } from './utils.js'
import walk from './ast/wark.js'
class Bundle{
  constructor(options){
    this.entryPath = options.entry.replace(/\.js$/, '')+'.js'
    this.modules = new Set()
  }
  /**
   * 编译
   * @param {*} output 输出文件
   */
  build(output){
    const entryModule = this.fetchModule(this.entryPath)
    // 展开所有语句
    this.statements = entryModule.expandAllStatement()
    // 解决变量名冲突问题
    this.deconflict()
    const { code } = this.generate()
    // 写入文件系统
    writeFileSync(output, code, {
      encoding: 'utf-8',
    })
  }
  deconflict(){
    const defines = {} // 定义的变量
    const conflicts = {} // 变量名冲突的变量
    this.statements.forEach(statement => {
      Object.keys(statement._defines).forEach(name => {
        if (Object.hasOwn(defines, name)) {
          // 定义过该变量 冲突了
          conflicts[name] = true
        }else {
          defines[name] = []
        }
        // 把此变量定义语句对应的模块放到数组
        defines[name].push(statement._module)
      })
    })
    // 获取变量名冲突的变量数组
    Object.keys(conflicts).forEach(name => {
      const modules = defines[name]
      modules.pop() // 最后一个模块不需要重命名 可以保留原来的变量名
      modules.forEach((module, index) => {
        const replacement = `${name}$${modules.length - index}`
        module.rename(name, replacement) // 模块重命名
      })
    })
  }
  /**
   * 根据模块路径获取模块
   * @param {string} importee 被引入的模块
   * @param {string} importer 引入的模块
   * 在importer模块中导入了importee模块
   */
  fetchModule(importee, importer){
    let route
    if (!importer) {
      route = importee
    } else {
      if (path.isAbsolute(importee)) {
        // 导入的模块是绝对路径
        route = importee
      } else {
        // 导入的模块是相对路径
        route = path.resolve(path.dirname(importer), importee.replace(/\.js$/, '')+'.js')
      }
    }
    if (route) {
      // 文件 内容
      const code = fs.readFileSync(route, 'utf-8')
      // 创建模块实例
      const module = new Module({
        code,
        path: route,
        bundle: this
      })
      this.modules.add(module)
      return module
    }
  }
  /**
   * 代码生成
   */
  generate(){
    // 拼接statement
    const msBundle = new MagicStringBundle()
    this.statements.forEach(statement=>{
      const replacements = {}
      // 拿到模块依赖的变量 和定义的变量
      Object.keys(statement._dependsOn)
      .concat(Object.keys(statement._defines))
      .forEach(name => {
        const canonicalName = statement._module.getCanonicalName(name)
        if (name !== canonicalName) {
          replacements[name] = canonicalName
        }
      })
      const source = statement._source.clone()
      if (statement.type === 'ExportNamedDeclaration') {
        // export const name = 'xx' => const name = 'xx'
        source.remove(statement.start, statement.declaration.start)
      }
      replaceIdentifier(statement, source, replacements) // 替换变量名
      msBundle.addSource({
        content: source,
        separator: '\n'
      })
    })
    return {
      code: msBundle.toString()
    }
  }
}

export default Bundle

function replaceIdentifier(statement, source, replacements) {
  walk(statement, {
    enter(node) {
      if (node.type === 'Identifier') {
        if (node.name && replacements[node.name])
        // 重写部分源码
          source.overwrite(node.start, node.end, replacements[node.name])
      }
    }
  })
}