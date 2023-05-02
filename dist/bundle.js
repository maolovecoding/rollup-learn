console.log('main.js')
console.log('hello')
const name = 'name'
function say(a, ...[b,c]) {
  console.log(name, a, b, c)
}
say()