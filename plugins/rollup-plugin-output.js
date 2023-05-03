function outputPlugin(){
  return {
    name: 'outputPlugin',
    // 生成阶段的钩子
    outputOptions(outputOptions){
      console.log(outputOptions)
    },
    renderStart(outputOptions,inputOptions){
      console.log(outputOptions, inputOptions)
      outputOptions.dir = 'dist'
      // outputOptions.file = 'bundle.js'
    },
    // async banner(){},
    // async footer(){},
    // async intro(){},
    // async outro(){},
    renderDynamicImport(){ // 同步钩子
      return {
        left: 'dynamicImportPolyfill(',
        right: ', import.meta.url)'
      }
    },
    augmentChunkHash(chunkInfo){
      console.log(chunkInfo)
      return false
    },
    resolveId(source) { // 获取source对应的绝对路径
      if (source === 'logger') {
        return source
      }
    },
    load(id) {
      if (id === 'logger') {
        // 无中生有 虚拟模块
        // 向输出目录写入一个文件
        const referenceId = this.emitFile({
          type: 'asset',
          source: 'console.log("logger")',
          fileName: 'logger.js'
        })
        return `export default import.meta.ROLLUP_FILE_URL_${referenceId}`
      }
    },
    resolveFileUrl({chunkId, fileName}){
      return `new URL("${fileName}", document.baseURI).href`
    },
    // import.meta.  xxx 属性 都走这个钩子
    resolveImportMeta(property){
      console.log(property,'----------')
      if (property==='age') return 22
    },
    renderChunk(code, chunk, options){

    },
    // 向输出目录写入一个html
    generateBundle(options, bundle, isWrite){
      let entryNames = []
      for (let fileName in bundle) {
        if (bundle[fileName].isEntry) {
          entryNames.push(fileName)
        }
      }
      this.emitFile({
        type: 'asset',
        source: `
        <!DOCTYPE html>
  <head>
      <meta charset="UTF-8">
      <meta http-equiv="X-UA-Compatible" content="IE=edge">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Document</title>
        ${entryNames.map(entryName => {
          return '<script src="./'+ entryName + '"></script>'
        })}
        </head>
        <body>
        </body>
        </html>
            `,
            fileName: 'index.html'
          })
    },
    writeBundle(){},
    renderError(){},
    closeBundle(){}
  }
}

export default outputPlugin