console.log('main.js')
console.log('hello')

import { name, age } from './msg'
function say(a, ...[b,c]) {
  console.log(name, a, b, c)
}
say()