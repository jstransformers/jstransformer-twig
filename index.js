'use strict';

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

  // Build the template.
  var template = twig(options)

  // Use .bind() so that the template is "this" when rendering.
  return template.render.bind(template)
}
