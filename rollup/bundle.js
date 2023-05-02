import path from 'path'
import fs from 'fs'
import { Bundle as MagicStringBundle } from 'magic-string'
import Module from './module.js'
import { writeFileSync } from './utils.js'
class Bundle{
  constructor(options){
    this.entryPath = path.resolve(options.entry)
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
   * @param {*} importee 
   */
  fetchModule(importee){
    let route = importee
    if (route) {
      // 文件 内容
      const code = fs.readFileSync(route, 'utf-8')
      // 创建模块实例
      const module = new Module({
        code,
        path: route,
        bundle: this
      })
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
      const soruce = statement._source.clone()
      msBundle.addSource({
        content: soruce,
        separator: '\n'
      })
    })
    return {
      code: msBundle.toString()
    }
  }
}

export default Bundle