// 遍历ast
export default function walk(astNode, {enter, leave}){
  visit(astNode, null, enter, leave)
}
function visit(node, parent, enter, leave){
  if (enter) enter(node, parent)
  const keys = Object.keys(node).filter(key => typeof node[key] === 'object')
  keys.forEach(key=>{
    const vals = node[key]
    if (Array.isArray(vals)) {
      vals.forEach(val => val.type && visit(val, node, enter, leave))
    }else if(vals && vals.type){
      visit(vals, node, enter, leave)
    }
  })
  if (leave) leave(node, parent)
}
