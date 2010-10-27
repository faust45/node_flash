var http = require('http'),
    httpProxy = require('http-proxy'),
    url = require('url'),
    gm = require('gm'),
    fs = require('fs');

var sys = require('util'),
    dbName = 'test',
    couchdb = require('couchdb'),
    client = couchdb.createClient(5984, '192.168.1.100'),
    db = client.db(dbName);
    dbClient = http.createClient(5984, '192.168.1.100');

httpProxy.createServer(function (req, res, proxy) {
  var path = url.parse(req.url),
      id = path.pathname.replace('/', '');

  if (id == 'favicon.ico') {
     //proxy.proxyRequest(5984, '192.168.1.100');
     return;
  } 

  getDoc(id, {}, function(er, doc) {
    console.log('request come');
    console.log(req.url);
    for(var k in doc._attachments) {}
    req.url = '/' + dbName + '/' + id + '/' + k;
    console.log(req.url);
    //proxy.proxyRequest(5984, '192.168.1.100',  req, res);
     
    var path = doc._id + '/' + k;
    db.getDoc(path, {responseEncoding: 'binary'}, function(er, data) {
      console.log('come');
      fs.writeFile(k, data, function (err) {
        if (err) throw err;
        console.log('It\'s saved!');
      });
    });
  });

}).listen(8000);


    //db.getAttachment(doc._id, attachmentId, function(er, data) {
    //  console.log(doc);
    //});
http.createServer(function (req, res) {
  res.writeHead(200, {'Content-Type': 'text/plain'});
  res.end('Hello World\n');
}).listen(9000, "127.0.0.1");

console.log('Server running at http://127.0.0.1:8000/');

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
