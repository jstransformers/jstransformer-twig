'use strict'

const path = require('path')
const Twig = require('twig')
const validPackageName = require('validate-npm-package-name')

const twigRender = Twig.twig

const loadModuleFilter = (name, filterModule, extendFunctionName) => {
  // Validate that we're loading an actual package.
  if (!validPackageName(filterModule).validForNewPackages) {
    return
  }

  try {
    // Load the filter module.
    const out = require(filterModule)

    // Check if the module is just a function.
    if (typeof out === 'function') {
      Twig[extendFunctionName](name, out)
    } else if (out && (typeof out === 'object')) {
      // Perhaps it is an associative array of functions?
      for (const outName in out) {
        if (typeof out[outName] === 'function') {
          Twig[extendFunctionName](outName, out[outName])
        }
      }
    }
  } catch (error) {
    console.error(error)
  }
}

const transformer = {
  name: 'twig',
  outputFormat: 'html',
}

transformer.compile = function (input, options) {
  // Construct the Twig options.
  options = options || {}
  options.data = input
  if ('filename' in options && !('path' in options)) {
    options.path = options.filename
  }

  // Make sure path is always a string, and not an object.
  // TODO: Make sure the `root` is correct?
  if (options.path && typeof options.path !== 'string') {
    const pathRoot = options.root || options.path.root
    options.path = pathRoot ? path.join(pathRoot, path.format(options.path)) : path.format(options.path)
  }

  // Extend Filters and Functions
  const extendable = {
    filters: 'extendFilter',
    functions: 'extendFunction',
  }

  for (const extendableName of Object.keys(extendable)) {
    const extendFunctionName = extendable[extendableName]
    // Allow options.filters to be a require() string.
    if (typeof options[extendableName] === 'string') {
      try {
        options[extendableName] = require(options[extendableName])
      } catch (error) {
        console.error(error)
      }
    }

    // Loop through all the given filters.
    for (const name of Object.keys(options[extendableName] || {})) {
      const filter = options[extendableName][name]
      if (typeof filter === 'string') {
        loadModuleFilter(name, options[extendableName][name], extendFunctionName)
      } else if (typeof filter === 'function') {
        Twig[extendFunctionName](name, options[extendableName][name])
      }
    }
  }

  // Build the template.
  let output = ''
  try {
    // Build the template renderer.
    const template = twigRender(options)

    // Use .bind() so that the template is "this" when rendering.
    output = template.render.bind(template)
  } catch (error) {
    console.log(options)
    console.error(error)
  }

  return output
}

module.exports = transformer
