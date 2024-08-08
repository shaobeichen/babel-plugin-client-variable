const { browser: browserGlobals, node: nodeGlobals } = require('globals')

/**
 * 判断是否是客户端变量，而且是服务端没有的，比如window，document，location
 * 比如setTimeout，两端都有，就不能算
 * @param {string} variable
 * @returns {boolean}
 */
function isClientGlobals(variable) {
  return variable in browserGlobals && !(variable in nodeGlobals)
}

module.exports = function ({ template }) {
  return {
    visitor: {
      // 访问所有Identifier节点
      Identifier(path) {
        const name = path.node.name
        const filepath = path.hub.file.opts.filename

        // 检查是否在非node_modules文件中，并且变量是客户端特有的全局变量
        if (!filepath.includes('node_modules') && isClientGlobals(name)) {
          if (path.scope.block.body.body) {
            path.scope.block.body.body.unshift(template(`if(!process.client) return`)())
          }
        }
      },
    },
  }
}
