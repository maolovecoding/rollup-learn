var logger = new URL("logger.js", document.baseURI).href;

// import { name1, age } from './msg'
// import {name2 } from './name2'
// console.log(name2, name1, age)

// const sum = (a,b) => a+b
// console.log(sum(1,2))

dynamicImportPolyfill('./name2-586ea2d4.js', import.meta.url).then(res=>{
  console.log(res);
});
console.log(logger);
