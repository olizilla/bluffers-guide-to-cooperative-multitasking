var fs = require('fs')
var http = require('http')
var random = require('lodash/number/random');

// I am a server
http.createServer(function (request, response) {
  response.writeHead(200, {'Content-Type': 'text/plain'});

  // I do things that may take a while...
  var firstName = pickName()
  var nickname = [pickConnective(), pickWord()].join(' ')
  var lastName = pickName()
  var result = firstName + ' "' + nickname + '" ' + lastName

  // ok go!
  response.end(result + '\n')

}).listen(1341, function (err) {
  console.log('sync server on: http://127.0.0.1:1341')
})

function pick (path) {
  var words = fs.readFileSync('/usr/share/dict/' + path, "utf8");
  words = words.split('\n')
  return words[random(words.length - 1)]
  return 'foo'
}

function pickName () {
  return pick('propernames')
}

function pickConnective () {
  return pick('connectives')
}

function pickWord () {
  return pick('words')
}
