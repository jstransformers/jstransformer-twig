# jstransformer-twig

[Twig.js](https://github.com/justjohn/twig.js) support for [JSTransformers](http://github.com/jstransformers).

[![Build Status](https://img.shields.io/travis/jstransformers/jstransformer-twig/master.svg)](https://travis-ci.org/jstransformers/jstransformer-twig)
[![Coverage Status](https://img.shields.io/codecov/c/github/jstransformers/jstransformer-twig/master.svg)](https://codecov.io/gh/jstransformers/jstransformer-twig)
[![NPM version](https://img.shields.io/npm/v/jstransformer-twig.svg)](https://www.npmjs.org/package/jstransformer-twig)

This project does not strictly adhere to semantic versioning. Instead it tracks the major version of the jstranformer main dependency.

## Installation

    npm install jstransformer-twig

## API

```js
var twig = require('jstransformer')(require('jstransformer-twig'))

twig.render('Hello, {{ name }}!', { name: 'World' }).body
//=> 'Hello, World!'
```

## License

MIT
