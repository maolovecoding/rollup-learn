import { rollup, watch } from 'rollup'
import config from './rollup.config.js'

/** 
 * rollup 执行有三个阶段
 * 1. 打包阶段
 * 2. 生成阶段
 * 3. 写入阶段
*/
(async () => {
  // 1. 打包阶段
  const bundle = await rollup(config)
  // 2. 生成阶段
  await bundle.generate(config.output)
  // 3. 写入阶段
  await bundle.write(config.output)
  const watcher = watch(config)
  watcher.on('event',event=>{
    console.log(event)
  })
  setTimeout(() => {
    watcher.close()
  }, 1000);
  // 4. 关闭阶段
  await bundle.close()
})()