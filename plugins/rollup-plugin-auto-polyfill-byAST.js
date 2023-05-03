function autoPolyfill(){
  return {
    name: 'autoPolyfill',
    async transform(code, id){
      return `
        console.log('polyfill内部代码')
        ${code}
      `
    }
  }
}

export default autoPolyfill