# never-ending-stream

Automatically restarts your stream for you when it ends.
This can be easily use to concatenate multiple streams.

## Usage

```js
'use strict'

var nes = require('never-ending-stream')
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
```

## API

### neverEndingStream([opts,] build([cb]))

Creates a binary never-ending stream, by concatenating all streams
generated by `build`. `build` is called whenever the
previous stream completes.

`build` can be synchronous or asynchronous:

* if it accepts no callback, is synchronous, and it should return the
  stream, or `null` to close the `never-ending-stream`.

* if it accepts a callback, is asynchronous, and you should call the
  callback when the next stream is ready, like `cb(null, stream)`.

All other options will be passed to [through2](http://npm.im/through2).

### neverEndingStream.obj([opts, ], build([cb]))

Like `neverEndingStream()`, but with `objectMode: true` by default.

## License

MIT
