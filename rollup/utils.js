import fs from 'fs'
import path from 'path'
export function writeFileSync(filepath, content, options) {
  // if (!fs.existsSync(filepath)) mkdir(filepath)
  fs.writeFileSync(filepath, content, options)
}
const dirCache = {}
/**
 * 
 * @param {string} filepath 
 */
function mkdir(filepath) {
  const arr = path.posix.join(filepath).split('\\')
  let dir = arr[0]
  for (let i = 1; i < arr.length; i++) {
    if (!dirCache[dir] && !fs.existsSync(dir)) {
      dirCache[dir] = true
      fs.mkdirSync(dir)
    }
    dir = dir + '/' + arr[i]
  }
}