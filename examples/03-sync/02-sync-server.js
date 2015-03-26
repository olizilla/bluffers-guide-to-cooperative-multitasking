http.createServer(function (request, response) {
  response.writeHead(200, {'Content-Type': 'text/plain'});
  // I do some things that may take a while...
  var results = doThings(1e9)
  response.end(results + '\n')
}).listen(1337, function (err) {
  console.log('sync server on: http://127.0.0.1:1337')
})

// Things take a while to do...
function doThings (many) {
  var then = Date.now()
  for (i=0; i<=many; i++) { /* do nothing */ }
  var duration = Date.now() - then
  return 'Did ' + many + ' things in ' + duration + 'ms'
}
