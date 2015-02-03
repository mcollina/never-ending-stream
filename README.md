# never-ending-stream

Automatically restarts your stream for you when it ends

## Usage

```js
var nes = require('never-ending-stream')
var from = require('from2')
var through = require('through2')
var assert = require('assert')
var chunks = [new Buffer('hello'), new Buffer('world')]
var stream = nes(function(cb) {
  var source = [].concat(chunks)
  var orig = from.obj(function(size, next) {
    next(null, source.shift())
  })
  // or cb(null, orig)
  return orig
})
var expected  = [].concat(chunks).concat(chunks)

stream.pipe(through.obj(function(chunk, enc, cb) {
  if (expected.length === 0)
    return stream.destroy() // stops the stream!

  assert.deepEqual(expected.shift(), chunk, 'chunk should be the same')
  cb()
}))
```

## License

MIT
