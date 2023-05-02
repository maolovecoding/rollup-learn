
class Scope {
  constructor(options = {}) {
    this.name = options.name // 作用域名称
    /**
     * @type {Scope}
     */
    this.parent = options.parent // 父作用域
    this.names = options.names// 当前作用域中定义的变量
  }
  add(name) {
    this.names.push(name) // 作用域中添加一个新的变量
  }
  findDefiningScope(name) {
    // 查找变量作用域
    if (this.names.includes(name)) {
      return this
    }
    if (this.parent !== null)
      return this.parent.findDefiningScope(name)
    return null
  }
}

// =============================
var a = 1
function one(){
  var b = 2
  function two(){
    var c = 3
    console.log(a, b, c)
  }
}
// =============================
const globalScope = new Scope({
  name: 'global',
  names: ['a'],
  parent: null
})
const oneScope = new Scope({
  name: 'oneScope',
  names: ['b'],
  parent: globalScope
})
const twoScope = new Scope({
  name: 'twoScope',
  names: ['c'],
  parent: oneScope
})
console.log(twoScope.findDefiningScope('c'))
console.log(twoScope.findDefiningScope('b'))
console.log(twoScope.findDefiningScope('a'))
