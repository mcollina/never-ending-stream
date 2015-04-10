var through = require('through2')
var eos = require('end-of-stream')

function neverEndingStream (build) {
  var result = through.obj({ highWatermark: 1 })
  var stream = null
  var stopped = false
  var piped

  var oldDestroy = result.destroy

  result.destroy = function() {
    stopped = true
    if (stream) {
      stream.destroy()
    }
    oldDestroy.call(this)
  }

  restart()

  return result

  function restart () {
    if (stopped) {
      return
    }

    piped = false
    next(null, build(next))
  }

  function next(err, s) {
    stream = s
    if (err) return result.emit('error', err)
    if (piped || !s) return

    piped = true
    s.pipe(result, { end: false })
    eos(s, restart)
    stream = s
  }
}

module.exports = neverEndingStream
