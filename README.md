# never-ending-stream

Automatically restarts your stream for you when it ends

## Usage

var nes       = require('never-ending-stream')
  , from      = require('from2')
  , through   = require('through2')
  , assert    = require('assert')
  , chunks    = [new Buffer('hello'), new Buffer('world')]
  , stream    = nes(function() {
      var source = [].concat(chunks)
      var orig = from.obj(function(size, next) {
        next(null, source.shift())
      })
      return orig
    })
  , expected  = [].concat(chunks).concat(chunks)

stream.pipe(through.obj(function(chunk, enc, cb) {
  if (expected.length === 0)
    return stream.destroy() // stops the stream!

  assert.deepEqual(expected.shift(), chunk, 'chunk should be the same')
  cb()
}))

## License

MIT
