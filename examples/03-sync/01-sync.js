/*
As the procrastinators know all too well,
even doing nothing can take ages, if you do enough of it.
*/
function doThings (many) {
  var then = Date.now()
  for (i=0; i<=many; i++) { /* do nothing */}
  var duration = Date.now() - then
  return 'Did ' + many + ' things in ' + duration + 'ms'
}
