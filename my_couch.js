var couchdb = require('couchdb'),
    http = require('http'),
    fs = require('fs'),
    temp = require('temp'),
    dbName = 'rocks_file_store_dev',
    dbClient = http.createClient(5984, '192.168.1.100');
    couch = couchdb.createClient(5984, '192.168.1.100').db(dbName);

exports.downloadAttachment = function(docID, options, cb) {
  options = options || {};

  getAttachmentName(docID, function(er, fileName) {
    if (!er) {
      var filePath = temp.path();
      var fileStream = fs.createWriteStream(filePath, {'encoding': 'binary'});
      var path = '/' + dbName + '/' + docID + '/' + fileName;
      var request = dbClient.request('GET', path);

      request.end();
      request.on('response', function (response) {
        response.setEncoding('binary');

        response.on('data', function (chunk) {
          fileStream.write(chunk, 'binary');
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


