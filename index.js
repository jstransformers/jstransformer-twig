'use strict';

var path = require('path')
var twig = require('twig').twig

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
  if (options.path && options.path !== 'string') {
    options.path = path.format(options.path)
  }

  // Build the template.
  var template = twig(options)

  // Use .bind() so that the template is "this" when rendering.
  return template.render.bind(template)
}
