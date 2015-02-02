
var through = require('through2')
  , eos     = require('end-of-stream')

function neverEndingStream(build, opts) {
  var result = through.obj({ highWatermark: 1 })
  var stream = null
  var stopped = false

  var oldDestroy = result.destroy

  result.destroy = function() {
    stopped = true
    stream.destroy()
    oldDestroy.call(this)
  };

  restart()

  return result

  function restart() {
    if (stopped) {
      return
    }

    stream = build(opts)
    stream.pipe(result, { end: false })
    eos(stream, restart)
  }
}

module.exports = neverEndingStream
