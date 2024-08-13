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

module.exports = function ({ types: t, template }) {
  const buildWrapper = template(`
    process.client ? (%%expression%%) : {}
  `)

  return {
    visitor: {
      Identifier(path) {
        if (path.node.wasProcessed) return

        const name = path.node.name
        const filepath = path.hub.file.opts.filename

        if (!filepath.includes('node_modules') && isClientGlobals(name)) {
          const parent = path.parent

          if (t.isCallExpression(parent) && parent.callee === path.node) {
            // 函数调用，如 document.querySelector()
            wrapWithProcessClient(path.parentPath)
          } else if (t.isMemberExpression(parent) && parent.object === path.node) {
            // 属性访问，如 window.location
            if (!t.isAssignmentExpression(path.parentPath.parent)) {
              wrapWithProcessClient(path.parentPath)
            }
          }

          path.node.wasProcessed = true
          path.skip()
        }
      },
    },
  }

  function wrapWithProcessClient(path) {
    const wrapped = buildWrapper({
      expression: path.node,
    })
    path.replaceWith(wrapped.expression)
  }
}
