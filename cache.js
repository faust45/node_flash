var couchdb = require('couchdb'),
    dbName = 'cache',
    EventEmitter = require('events').EventEmitter,
    http = require('http'),
    dbClient = http.createClient(5984, '192.168.1.100');

exports.check = function(id, size, roundCorners) {
  return new Box(id, size, roundCorners);
}


Box = function(id, size, roundCorners) {
  var self = this;
  var path = buildPath()
  check();

  function buildPath() {
    return '/' + dbName + '/' + id + '_size' + size.height + 'x' + size.width + (roundCorners ? '_round' : '') + '/img';
  }

  function check() {
    var db = dbClient.request('HEAD', path);

    db.end();
    db.on('error', function (err) { });
    db.on('response', function (res) {
      res.statusCode == 200 ? self.emit('hit', path) :
                              self.emit('fail');
    });
  }

  function put(readStream, mime) {
    var headers = {'Content-Type': mime};
    var db = dbClient.request('PUT', path, headers);

    readStream.on('data', function (chunk) {
      db.write(chunk, 'binary');
    });
    readStream.on('end', function () {
      db.end();
    });

    db.on('response', function (res) {
      res.setEncoding('utf8');

      res.on('data', function (chunk) {
        console.log('BODY: ' + chunk);
      });
    });
  }

  this.put = put;
  return this;
}

Box.prototype.__proto__ = EventEmitter.prototype;
