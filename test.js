var test = require('tape')
var through = require('through2')
var from = require('from2')
var nes = require('./')

function buildFrom (count, chunks, async) {
  return function () {
    if (count-- === 0) {
      return null
    }

    var source = [].concat(chunks)
    source.push(null)

    var opts = {}

    opts.objectMode = !Buffer.isBuffer(chunks[0])

    return from(opts, function (size, next) {
      var chunk = source.shift()
      if (async) {
        setImmediate(function () {
          next(null, chunk)
        })
      } else {
        next(null, chunk)
      }
    })
  }
}

test('starts the stream', function (t) {
  var expected = [new Buffer('hello'), new Buffer('world')]
  t.plan(expected.length)

  var stream = nes(buildFrom(1, [].concat(expected)))

  stream.pipe(through(function (chunk, enc, cb) {
    t.deepEqual(chunk, expected.shift(), 'chunk should be the same')

    if (expected.length === 0) {
      return stream.destroy()
    }

    cb()
  }))
})

function restartTest (name, chunks, toNes) {
  test('restarts the stream ' + name, function (t) {
    var stream = toNes(buildFrom(2, chunks))
    var expected = [].concat(chunks).concat(chunks)

    t.plan(expected.length)

    stream.pipe(through.obj(function (chunk, enc, cb) {
      t.deepEqual(chunk, expected.shift(), 'chunk should be the same')

      if (expected.length === 0) {
        return stream.destroy()
      }

      cb()
    }))
  })

  test('restarts asynchronously the stream ' + name, function (t) {
    var stream = toNes(buildFrom(2, chunks, true))
    var expected = [].concat(chunks).concat(chunks)

    t.plan(expected.length)

    stream.pipe(through.obj(function (chunk, enc, cb) {
      if (expected.length === 0) {
        return stream.destroy()
      }

      t.equal(expected.shift(), chunk, 'chunk should be the same')
      cb()
    }))
  })
}

restartTest('with buffers', [new Buffer('hello'), new Buffer('world')], nes)
restartTest('with objects', [{ hello: 'world' }, { my: 'name' }], nes.obj)

test('emits end if the stream is null', function (t) {
  t.plan(1)

  var stream = nes(function () {
    return null
  })

  stream.on('end', t.pass.bind(t))

  stream.resume()
})

test('destroy', function (t) {
  t.plan(1)

  var chunks = [new Buffer('hello'), new Buffer('world')]
  var stream = nes(buildFrom(1, chunks))

  stream.on('end', t.pass.bind(t))

  stream.resume()
  stream.destroy()
})
