function build(){
  return {
    name: 'build',
    // 第一个钩子 options
    options(options){
      console.log('options', options)
      return {
        ...options // 可以返回新的options 修改老的
      }
      // 此钩子一般不使用，因为这是汇总配置前执行的
    },
    // 构建开始
    buildStart(options){
      // 这里可以拿到所有的配置 汇总的配置
      console.log('buildStart')
    },
    async resolveId(source, importer){
      console.log('resolveId', source, importer)
    },
    async load(id){
      console.log('load', id)
    },
    async shouldTransformCachedModule({ id, code }){
      console.log('shouldTransformCachedModule', code, id)
      return true// 每次从缓存中加载都需要重新转换
    },
    async transform(code, id){
      console.log('transform', code, id)
    },
    async moduleParsed(moduleInfo){
      console.log('moduleParsed', moduleInfo)
    },
    async resolveDynamicImport(specifier, importer){
      console.log('resolveDynamicImport', specifier, importer)
    },
    // 最后一个钩子 构建结束
    buildEnd(){
      console.log('buildEnd')
    }
  }
}

export default build