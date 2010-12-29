var couchdb = require('couchdb'),
    http = require('http'),
    ID3 = require('musicmetadata'),
    fs = require('fs'),
    temp = require('temp'),
    dbName = 'rocks_file_store_dev',
    EventEmitter = require('events').EventEmitter,
    dbClient = http.createClient(5984, '192.168.1.100'),
    couch = couchdb.createClient(5984, '192.168.1.100').db(dbName);


exports.listenChanges = function(filter) {
    return new CouchFeed(filter);
}

exports.downloadAttachment = function(docID, options, cb) {
  options = options || {};

  getAttachmentName(docID, function(er, fileName) {
    if (!er) {
      console.log('start downloadAttachment...');

      var filePath = temp.path();
      var fileStream = fs.createWriteStream(filePath, {'encoding': 'binary'});
      var path = '/' + dbName + '/' + docID + '/' + fileName;
      var dbClient = http.createClient(5984, '192.168.1.100');
      var request = dbClient.request('GET', path);
      var countLength = 0;
      request.end();

      request.on('response', function (response) {
        response.setEncoding('binary');

        response.on('data', function (chunk) {
          fileStream.write(chunk, 'binary');
          countLength = countLength + chunk.length;

          if (options.limit) {
            if (options.limit <= countLength) {
              response.emit('end');
              response.destroy();
            }
          }
        });
        response.on('end', function() {
          fileStream.end();
          return cb && cb(null, filePath);
        });
      });
    } else {
      return cb && cb(er, null);
    }
  });
}

function getAttachmentName(docID, cb) {
  couch.getDoc(docID, function(er, doc) {
    if (!er) {
      for(var fileName in doc._attachments) {}
      return cb(null, fileName);
    } else {
      return cb(er, null);
    }
  });
}

exports.getID3 = function(path, cb) {
    var dbClient = http.createClient(5984, '192.168.1.100');
    var request  = dbClient.request('GET', path, {'Content-Range': 'bytes 0-499/1234'});
    var len = 0;
    
    request.end();
    request.on('response', function (response) {
        var parser = new ID3(response);
        parser.on('metadata', function(result) {
            console.log('real result');
            console.log(result);
            cb && cb(null, result);
        });

        parser.parse();

        response.on('data', function (chunk) {
        });
        response.on('end', function() {
        });
    });
}



exports.downloadBuffer = function(docID, options, cb) {
  options = options || {};
  options.limit = options.limit || 2000;

  getAttachmentName(docID, function(er, fileName) {
    if (!er) {
      console.log('start download Buffer...');

      var path = '/' + dbName + '/' + docID + '/' + fileName;
      var dbClient = http.createClient(5984, '192.168.1.100');
      var request = dbClient.request('GET', path);
      var buffer = new Buffer(options.limit, 'binary'), len = 0;

      request.end();
      request.on('response', function (response) {
        response.setEncoding('binary');

        response.on('data', function (chunk) {
          console.log('data come...', len);
          len += buffer.write(chunk, len, 'binary');

          if (options.limit) {
            if (options.limit <= len) {
              response.emit('end');
              response.destroy();
            }
          }
        });
        response.on('end', function() {
          return cb && cb(null, buffer);
        });
      });
    } else {
      return cb && cb(er, null);
    }
  });
}

function getDoc(docID, options, cb) {
  options = options || {};
  var path = '/' + dbName + '/' + docID;
  var request = dbClient.request(
        'GET', 
        path 
  );

  console.log(path);
  request.end();
  request.on('response', function (response) {
    var buffer = '';
    response.setEncoding(options.responseEncoding || 'utf8');

    response.on('data', function (chunk) {
      console.log('in chunc');
      buffer += (chunk || '');
    });
    response.on('end', function (chunk) {
         if(options.responseEncoding == 'binary') {
            return cb && cb(null, buffer);
          }

         try {
            json = JSON.parse(buffer);
          } catch (e) {
            return cb && cb(new Error('invalid json: '+json+" "+e.message));
          }

          if ('error' in json) {
            return cb && cb(json);
          }

          return cb && cb(null, json);
    });
  });
}



CouchFeed = function(filter) {
  var self = this;

  couch.info(function(err, info) {
    runRequest({since: info.update_seq});
  })

  function runRequest(options) {
      options = options || {}
      var query = {
          feed: 'continuous',
          filter: 'global/' + filter,
          since:  options.since,
          heartbeat: 1 * 1000
      };

 
      var path = '/' + dbName + '/_changes?' + couchdb.toQuery(query);
      var dbClient = http.createClient(5984, '192.168.1.100');
      var request = dbClient.request('GET', path);

      request.end();
      request.on('response', function (response) {
          var buffer = '';
          response.setEncoding('utf8');

          response.on('data', function (chunk) {
              buffer += (chunk || '');

              var offset, change;
              while ((offset = buffer.indexOf("\n")) >= 0) {
                  change = buffer.substr(0, offset);
                  buffer = buffer.substr(offset +1);

                  // Couch sends an empty line as the "heartbeat"
                  if (change == '') {
                      return self.emit('heartbeat');
                  }

                  try {
                      change = JSON.parse(change);
                  } catch (e) {
                      return stream.emit('error', 'invalid json: '+change);
                  }

                  self.emit('data', change);
              }
          });
      });
  }
}


CouchFeed.prototype.__proto__ = EventEmitter.prototype;
