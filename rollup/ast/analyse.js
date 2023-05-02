import wark from './wark.js'
import Scope from './scope.js'
/**
 * 
 * @param {*} ast 
 * @param {*} code 
 * @param {Module} module 模块实例
 */
function analyse(ast, code, module){
  // 开启第一轮循环 找出本模块导入导出了那些变量
  ast.body.forEach(statement => {
    Object.defineProperties(statement,{
      _included: { value: false, writable: true }, // 表示这条语句默认不包含在输出结果里
      _module: {
        value: module, // 指向自己的模块
      },
      _source: { // 语句对应的源码
        value: code.snip(statement.start, statement.end),
      },
      _dependsOn: {
        value: {}, // 依赖的变量
      },
      _defines: {
        value: {}, // 表示此语句定义的顶级变量 {name: true }
      },
      _modifies: {
        value: {}, // 存放修改语句 副作用语句
      }
    })
    // 找出导入的变量 import {} from 'xx'
    if (statement.type === 'ImportDeclaration') {
      // 导入模块的相对路径
      const source = statement.source.value
      statement.specifiers.forEach(specifer => {
        // 导入的模块导出的变量名
        const importName = specifer.imported.name
        // 导入的模块 在该模块内生效的变量名 可能起别名了
        const localName = specifer.local.name
        // {当前模块导入的变量名：{导入模块导出的变量名, 导入的模块}}
        module.imports[localName] = {
          source, importName
        }
      })
    } else if (statement.type === "ExportNamedDeclaration") {
      // export const xx = 'xx'
      const declaration = statement.declaration
      if (declaration?.type === 'VariableDeclaration') {
        // 一个语句可以导出多个变量 export const a= 1, b = 2
        const declarations = declaration.declarations
        declarations.forEach(variableDeclaration => {
          // 模块内的名字
          const localName = variableDeclaration.id.name
          // 导出的变量名 也可以不一样 export {name as myName}
          const exportName = localName
          module.exports[exportName] = {
            localName
          }
        })
      }
    }
  })
  // 第二轮循环 创建作用域链
  // 需要知道本模块内用到了那些变量 用到的变量留下
  // 还需要知道用到的变量是局部变量还是全局的
  // 第一次是模块的顶级作用域
  let currentScope = new Scope({ name: '模块内的顶级作用域' })

  ast.body.forEach(statement=>{
    /**
     * 
     * @param {*} name 
     * @param {*} isBlockDeclaration 是否是块级声明 let const
     */
    function addToScope(name, isBlockDeclaration) {
      currentScope.add(name, isBlockDeclaration)
      if (currentScope.parent === null ||
        (currentScope.isBlock && !isBlockDeclaration) // 是块级作用域 但是不是块级变量 变量提升
        ) {
        // 是顶级作用域了 此变量就是顶级作用域变量了
        // 则该变量需要保存
        statement._defines[name] = true // 该语句定义了顶级变量
        module.definitions[name] = statement // 此顶级变量定义的语句就是这条语句
      }
    }
    // 读取变量名了
    function checkForReads(node){
      if (node.type === 'Identifier'){
        // 表示当前这个语句依赖了 node.name这个变量
        statement._dependsOn[node.name] = true
      }
    }
    // 修改语句
    function checkForWrites(node) {
      if (node.type === 'AssignmentExpression') {
        addNode(node.left)
      } else if (node.type === 'UpdateExpression') {
        addNode(node.argument)
      }
    }
    function addNode(node){
      const { name } = node
      statement._modifies[name] = true // 表示此语句修改了该变量
      if (!Object.hasOwn(module.modifications, name)) module.modifications[name] = []
      module.modifications[name].push(statement)
    }
    wark(statement, {
      enter(node){
        checkForReads(node)
        checkForWrites(node)
        let newScope = null
        switch (node.type) {
          // 函数声明 需要创建新的作用域 function say(){}
          case 'FunctionDeclaration': {
            addToScope(node.id.name)// 函数声明本身也是变量
            // 函数形参列表
            const names = node.params.map(param => {
              // function (a, b) {}
              if (param.type === 'Identifier') return param.name
              // function (...b) {}
              if (param.type === 'RestElement') {
                const argument = param.argument
                // function (...b) {}
                if (argument.type === 'Identifier') return argument.name
                // function (...[a,b]) {}
                if (argument.type === 'ArrayPattern') return argument.elements.map(e => e.name)
                // function (...{a,b,c}) {} ...args => args是数组 这样结构 abc都是undefined
                if (argument.type === 'ObjectPattern') {
                  // value是在函数内实际使用的变量名字 function say(a,...{length,b:bb})
                  return argument.properties.map(property => property.value.name)
                }
              }
            }).flat(Infinity)
            newScope = new Scope({
              name: node.id.name,
              parent: currentScope,
              names, // 如果有参数 直接可以放入names
              isBlock: false
            })
            break;
          }
          case "ArrowFunctionExpression": // 箭头函数
            break
          case 'VariableDeclaration': { // 变量声明
            const declarations = node.declarations
            declarations.forEach(declaration => {
              if (node.kind === 'let' || node.kind === 'const')
                addToScope(declaration.id.name, true)
              else addToScope(declaration.id.name, false) // var
            })
            break
          }
          case 'BlockStatement':
            newScope = new Scope({
              parent: currentScope,
              isBlock: true
            })
            break
          default:
            break
        }
        if (newScope) { // 定义节点所在的作用域
          Object.defineProperty(node, '_scope', {
            value: newScope
          })
          // 当前作用域是新创建的作用域
          currentScope = newScope
        }
      },
      leave(node){
        if (Object.hasOwn(node,'_scope')) {
          currentScope = currentScope.parent // 回到父级作用域
        }
      }
    })
  })
}
export default analyse