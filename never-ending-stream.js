var through = require('through2')
var eos = require('end-of-stream')

function neverEndingStream (build) {
  var result = through.obj()
  var stream = null
  var stopped = false
  var piped

  var oldDestroy = result.destroy

  result.destroy = function() {
    stopped = true
    if (stream && stream.destroy) {
      stream.destroy()
    }
    oldDestroy.call(this)
  }

  restart()

  return result

  function restart () {
    if (stopped) {
      return next()
    }

    if (build.length === 1) {
      build(next)
    } else {
      next(null, build())
    }
  }

  function next(err, s) {
    stream = s
    if (err) return result.emit('error', err)

    if (!stream) {
      result.end()
    } else {
      s.pipe(result, { end: false })
      eos(s, restart)
    }
  }
}

module.exports = neverEndingStream
