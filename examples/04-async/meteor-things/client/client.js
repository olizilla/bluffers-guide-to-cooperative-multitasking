
// counter starts at 0
Session.setDefault('counter', 0);

Template.hello.helpers({
  counter: function () {
    return Session.get('counter');
  }
});

Template.hello.events({
  'click button': function () {
    Meteor.call('doThings', 1e9, function (err, res) {
      console.log(res)
    })
  }
});
