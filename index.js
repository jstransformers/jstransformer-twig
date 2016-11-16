'use strict';

var path = require('path')
var Twig = require('twig')
var twigRender = Twig.twig

exports.name = 'twig'
exports.outputFormat = 'html'

exports.compile = function (str, options) {
  console.log(options)
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

  // Filters
  for (var name in options.filters || {}) {
    var filter = null;
    switch (typeof options.filters[name]) {
      case "string":
        try {
          filter = require(options.filters[name]);
        }
        catch {
          // Nothing.
        }
        break;
      case "function":
      default:
        filter = options.filters[name];
        break;
    }
    if (filter) {
      Twig.extendFilter(name, filter);
    }
  }

  // Build the template.
  var template = twigRender(options)

  // Use .bind() so that the template is "this" when rendering.
  return template.render.bind(template)
}
