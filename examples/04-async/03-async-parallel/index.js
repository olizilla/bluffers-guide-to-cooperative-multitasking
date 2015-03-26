var fs = require('fs')
var http = require('http')
var random = require('lodash/number/random');
var async = require('async')

// I am a server
http.createServer(function (request, response) {
  response.writeHead(200, {'Content-Type': 'text/plain'});

  // I do things that may take a while...
  async.parallel(
    {
      firstName: pickName,
      connective: pickConnective,
      word: pickWord,
      lastName: pickName
    },

    function (err, res) {
      var nickname = [res.connective, res.word].join(' ')
      var fullname = res.firstName + ' "' + nickname + '" ' + res.lastName
      response.end(fullname + '\n')
    }
  )

}).listen(1343, function (err) {
  console.log('sync server on: http://127.0.0.1:1343')
})

function pick (path, cb) {
  var words = fs.readFile('/usr/share/dict/' + path, "utf8", function (err, words) {
    words = words.split('\n')
    cb(err, words[random(words.length - 1)] )
  });
}

function pickName (cb) {
  return pick('propernames', cb)
}

function pickConnective (cb) {
  return pick('connectives', cb)
}

function pickWord (cb) {
  return pick('words', cb)
}
