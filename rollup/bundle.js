import path from 'path'
import fs from 'fs'
import { Bundle as MagicStringBundle } from 'magic-string'
import Module from './module.js'
import { writeFileSync } from './utils.js'
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
    // console.log('entryModule', entryModule)
    // 展开所有语句
    this.statements = entryModule.expandAllStatement()
    // console.log(this.statements)
    const { code } = this.generate()
    // 写入文件系统
    writeFileSync(output, code, {
      encoding: 'utf-8',
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
      const source = statement._source.clone()
      if (statement.type === 'ExportNamedDeclaration') {
        // export const name = 'xx' => const name = 'xx'
        source.remove(statement.start, statement.declaration.start)
      }
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