import Bundle from './bundle.js'
/**
 * 
 * @param {string} entry 入口 
 * @param {*} output 输出
 */
function rollup(entry, output){
  const bundle = new Bundle({
    entry
  })
  bundle.build(output)
}

export default rollup