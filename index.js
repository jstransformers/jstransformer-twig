'use strict';

var twig = require('twig').twig

exports.name = 'twig'
exports.outputFormat = 'html'

exports.compile = function (str, options) {
  options = options || {}
  options.data = str
  var template = twig(options)
  return template.render.bind(template)
}
