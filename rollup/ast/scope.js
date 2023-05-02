class Scope {
  constructor(options = {}) {
    this.name = options.name // 作用域名称
    /**
     * @type {Scope}
     */
    this.parent = options.parent || null // 父作用域
    this.names = options.names || []// 当前作用域中定义的变量
    this.isBlock = !!options.isBlock // 这个作用域是不是块级作用域
  }
  add(name, isBlockDeclaration) {
    if (!isBlockDeclaration && this.isBlock) {
      this.parent.add(name, isBlockDeclaration) // 不是块作用域 var 变量提升
    } else this.names.push(name) // 作用域中添加一个新的变量
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