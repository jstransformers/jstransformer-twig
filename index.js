'use strict';

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
    }
    else {
      options.path = path.format(options.path)
    }
  }

  // Filters
  for (var name in options.filters || {}) {
    switch (typeof options.filters[name]) {
      case 'string':
        try {
          // Load the filter module.
          var out = require(options.filters[name]);

          // Check if the module is just a function.
          if (typeof out === 'function') {
            Twig.extendFilter(name, out)
          }
          // Perhaps it is an associative array of functions?
          else if (out && (typeof out === 'object')) {
            for (var outName in out) {
              if (typeof out[outName] === 'function') {
                Twig.extendFilter(outName, out[outName])
              }
            }
          }
        }
        catch(err) {
          // Nothing.
        }
        break;
      case 'function':
        Twig.extendFilter(name, options.filters[name]);
        break;
    }
  }

  // Build the template.
  var template = twigRender(options)

  // Use .bind() so that the template is "this" when rendering.
  return template.render.bind(template)
}
