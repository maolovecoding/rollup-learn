class Scope {
  constructor(options = {}) {
    this.name = options.name // 作用域名称
    /**
     * @type {Scope}
     */
    this.parent = options.parent || null // 父作用域
    this.names = options.names || []// 当前作用域中定义的变量
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
export default Scope