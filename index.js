'use strict'

const path = require('path')
const Twig = require('twig')
const validPackageName = require('validate-npm-package-name')

const twigRender = Twig.twig

exports.name = 'twig'
exports.outputFormat = 'html'

exports.compile = function (input, options) {
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
    if (pathRoot) {
      options.path = path.join(pathRoot, path.format(options.path))
    } else {
      options.path = path.format(options.path)
    }
  }

  // Extend Filters and Functions
  const extendable = {
    filters: 'extendFilter',
    functions: 'extendFunction'
  }
  // eslint-disable-next-line guard-for-in
  for (const extendableName in extendable) {
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
    for (const name in options[extendableName] || {}) {
      if ({}.hasOwnProperty.call(options[extendableName], name)) {
        switch (typeof options[extendableName][name]) {
          case 'string':
            // Validate that we're loading an actual package.
            if (validPackageName(options[extendableName][name]).validForNewPackages) {
              try {
                // Load the filter module.
                const out = require(options[extendableName][name])

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
