var couchdb = require('./my_couch'),
    dbName = 'cache_test',
    EventEmitter = require('events').EventEmitter,
    http = require('http'),
    dbClient = http.createClient(5984, '192.168.1.100');

exports.check = function(id, size, roundCorners) {
  return new Box(id, size, roundCorners);
}

exports.runSweeper = function() {
  var feed = couchdb.listenChanges('images');

  feed.on('update', function(id) {
    clean(id);
  });
}

Box = function(id, size, roundCorners) {
  var self = this;
  var path = buildPath()
  var rev;
  check();

  function getRev() {
    if (rev) {
      var _rev = rev.substring(1, rev.length - 1);
      console.log('create _rev');
      console.log(_rev);
      return 'rev=' + _rev;
    }
  }

  function buildPath() {
    var attachName = 'size' + size.height + 'x' + size.width + (roundCorners ? '_round' : '');
    return '/' + dbName + '/' + id + '/' + attachName; 
  }

  function check() {
    var db = dbClient.request('HEAD', path);

    db.end();
    db.on('error', function (err) { });
    db.on('response', function (res) {
      //res.statusCode == 200 ? self.emit('hit', path) :
                              self.emit('fail');
    });
  }

  function put(readStream, mime) {
    var headers = {'Content-Type': mime};
    var db = dbClient.request('PUT', path + '?' + getRev(), headers);

    readStream.on('data', function (chunk) {
      if (db.writeable) {
        db.write(chunk, 'binary');
      } else {
        //readStream.destroy();
      }
    });

    readStream.on('end', function () {
      db.end();
    });

    db.socket.on('error', function(err) {
      console.log('socket error: ', err);
    });

    db.on('response', function (res) {
      res.setEncoding('utf8');

      if (res.statusCode != 201) {
        console.log('Couch not accept attach');
        console.log('Couch response status: ', res.statusCode);
      } 

      res.on('data', function (chunk) {
        console.log('BODY: ' + chunk);
      });
    });
  }

  this.put = put;
  return this;
}

Box.prototype.__proto__ = EventEmitter.prototype;
