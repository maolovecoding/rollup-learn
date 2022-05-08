// import { sum } from "@/sum.js";
import {sum} from  "./sum.js";
console.log(sum(1, 2));
// import jquery from  "jquery"
// console.log(jquery)
class A {}
console.log(new A());

import("./minus").then(({ default: res }) => {
  console.log(res);
});
console.log(import.meta.xxx) // xxx -> my-xxx