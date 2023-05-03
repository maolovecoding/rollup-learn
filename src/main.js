// import { name1, age } from './msg'
// import {name2 } from './name2'
// console.log(name2, name1, age)

// const sum = (a,b) => a+b
// console.log(sum(1,2))

import('./name2.js').then(res=>{
  console.log(res)
})
import logger from 'logger'
console.log(logger)