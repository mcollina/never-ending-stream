
var test    = require('tape')
  , through = require('through2')
  , from    = require('from2')
  , nes     = require('./')

test('starts the stream', function(t) {
  var chunks = [new Buffer('hello'), new Buffer('world')]
    , stream = nes(function() {
        var source = [].concat(chunks)
        var orig = from(function(size, next) {
          next(null, source.shift())
        })
        return orig
      })
    , expected = [].concat(chunks)

  t.plan(chunks.length)

  stream.pipe(through(function(chunk, enc, cb) {
    if (expected.length === 0) {
      return stream.destroy()
    }

    t.equal(expected.shift(), chunk, 'chunk should be the same')
    cb()
  }))
})

function restartTest(name, chunks) {
  test('restarts the stream ' + name, function(t) {
    var stream = nes(function() {
          var source = [].concat(chunks)
          var orig = from.obj(function(size, next) {
            next(null, source.shift())
          })
          return orig
        })
      , expected = [].concat(chunks).concat(chunks)

    t.plan(expected.length)

    stream.pipe(through.obj(function(chunk, enc, cb) {
      if (expected.length === 0)
        return stream.destroy()

      t.equal(expected.shift(), chunk, 'chunk should be the same')
      cb()
    }))
  })
}

restartTest('with buffers', [new Buffer('hello'), new Buffer('world')])
restartTest('with objects', [{ hello: 'world' }, { my: 'name' }])
