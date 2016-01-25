'use strict'

var nes = require('./')
var from = require('from2')
var chunks = [new Buffer('hello'), new Buffer('world')]
var count = 0

var stream = nes(function () {
  if (count++ === 2) {
    // close the stream after 2 runs
    return null
  }

  var source = [].concat(chunks)

  return from.obj(function (size, next) {
    var chunk = source.shift() || null
    next(null, chunk)
  })
})

// prints
//  hello
//  world
//  hello
//  world
stream.on('data', function (data) {
  console.log(data.toString())
})
