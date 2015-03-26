Meteor.methods({
  doThings: function (many) {
    var then = Date.now()
    for (i=0; i<=many; i++) { /* do nothing */}
    var duration = Date.now() - then
    return 'Did ' + many + ' things in ' + duration + 'ms'
  }
})
