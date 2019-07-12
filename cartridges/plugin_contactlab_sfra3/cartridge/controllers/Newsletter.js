var server = require('server');

server.get('Start', function (req, res, next) {
  // TODO: Cleanup form
  // => newsletter/newslettersignup
  next();
});

server.get('NewsletterForm', function (req, res, next) {
  // TODO: Display form
  // OK => newsletter/newslettersuccess
  // KO => newsletter/newslettererror
  next();
});

module.exports = server.exports();