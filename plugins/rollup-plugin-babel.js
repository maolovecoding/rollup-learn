import { transformAsync } from '@babel/core'
import { createFilter } from 'rollup-pluginutils'
function babelPlugin({include, exclude, extensions = ['.js'], babel}){
  const extensionsRegexp = new RegExp(`(${extensions.join('|')})$`)
  // const useDefinedFilter = createFilter(include, exclude)
  const filter = id => extensionsRegexp.test(id)
  return {
    name: 'babel',
    async transform(code, id){
      if (!filter(id)) return null // 不需要处理
      const { code: resCode, ast, map } = await transformAsync(code, {
        presets:babel.presets
      })
      return {
        code: resCode,
        ast,
        map
      }
    }
  }
}

export default babelPlugin