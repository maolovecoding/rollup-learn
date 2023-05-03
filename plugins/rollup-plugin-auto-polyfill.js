const PROXY_SUFFIX = '?inject-polyfill'
const POLYFILL_ID = '\0polyfill'

function autoPolyfill(){
  return {
    name: 'autoPolyfill',
    async resolveId(source, importer, options){
      // 拦截中间模块
      if (source === POLYFILL_ID) {
        return {
          id: POLYFILL_ID,
          moduleSideEffects: true
        }
      }
      // 查找引入模块source的绝对路径
      if (options.isEntry) {
        // 说明这是一个入口点
        // 将导入解析为模块id也就是文件名
        const resolution = await this.resolve(source, importer, {
          skipSelf: true, // 跳过当前插件的钩子
          ...options
        })
        /*
          {
            assertions: {},
            external: false, // 是否是外部模块
            id: 'F:\\vscode\\webpack-vite-rollup\\rollup\\rollup-learn\\src\\main.js', // 绝对路径
            meta: {},
            moduleSideEffects: true, // 模块是否有副作用 有副作用会禁用treeshaking
            resolvedBy: 'rollup',
            syntheticNamedExports: false // 没有export导出
          }
          默认情况rollup只认识相对路径 不认识第三方模块
        */
        // console.log(resolution, '--------------')
        if (!resolution || resolution.external) {
          // 无法解析模块 或者是外部模块
          return resolution // 直接返回会报错 或者提示
        }
        // 加载模块内容
        const moduleInfo = await this.load(resolution)
        moduleInfo.moduleSideEffects = true // 模块有副作用
        // console.log(moduleInfo)
        return `${resolution.id}${PROXY_SUFFIX}`
      }
      return null
    },
    load(id){
      if(id === POLYFILL_ID) {
        return `console.log('内置代码')`
      }
      // 代理模块
      if (id.endsWith(PROXY_SUFFIX)) {
        const entryId = id.slice(0, -PROXY_SUFFIX.length)
        // 中间模块
        const code = `
        import ${JSON.stringify(POLYFILL_ID)}
        export * from ${JSON.stringify(entryId)}
        `
        return code // 有返回值 不走其他插件 也不走默认处理
      }
    },
  }
}

export default autoPolyfill