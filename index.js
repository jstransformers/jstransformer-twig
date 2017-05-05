'use strict'

var path = require('path')
var Twig = require('twig')

var twigRender = Twig.twig

exports.name = 'twig'
exports.outputFormat = 'html'

exports.compile = function (str, options) {
  // Construct the Twig options.
  options = options || {}
  options.data = str
  if ('filename' in options && !('path' in options)) {
    options.path = options.filename
  }

  // Make sure path is always a string, and not an object.
  // TODO: Make sure the `root` is correct?
  if (options.path && typeof options.path !== 'string') {
    var pathRoot = options.root || options.path.root
    if (pathRoot) {
      options.path = path.join(pathRoot, path.format(options.path))
    } else {
      options.path = path.format(options.path)
    }
  }

  // Extend Filters and Functions
  var extendable = {
    filters: 'extendFilter',
    functions: 'extendFunction'
  }
  // eslint-disable-next-line guard-for-in
  for (var extendableName in extendable) {
    var extendFunctionName = extendable[extendableName]
    // Allow options.filters to be a require() string.
    if (typeof options[extendableName] === 'string') {
      try {
        // eslint-disable-next-line import/no-dynamic-require
        options[extendableName] = require(options[extendableName])
      } catch (err) {
        // Nothing.
      }
    }
    // Loop through all the given filters.
    for (var name in options[extendableName] || {}) {
      if ({}.hasOwnProperty.call(options[extendableName], name)) {
        switch (typeof options[extendableName][name]) {
          case 'string':
            try {
              // Load the filter module.
              // eslint-disable-next-line import/no-dynamic-require
              var out = require(options[extendableName][name])

              // Check if the module is just a function.
              if (typeof out === 'function') {
                Twig[extendFunctionName](name, out)
              } else if (out && (typeof out === 'object')) {
                // Perhaps it is an associative array of functions?
                for (var outName in out) {
                  if (typeof out[outName] === 'function') {
                    Twig[extendFunctionName](outName, out[outName])
                  }
                }
              }
            } catch (err) {
              // Nothing.
            }
            break
          case 'function':
          default:
            Twig[extendFunctionName](name, options[extendableName][name])
            break
        }
      }
    }
  }

  // Build the template.
  try{
  var template = twigRender(options)
}catch(e) {
  console.log(options)
  console.error(e)
}

  // Use .bind() so that the template is "this" when rendering.
  return template.render.bind(template)
}
