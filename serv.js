var http = require('http'),
    httpProxy = require('http-proxy'),
    url = require('url');

var sys = require('util'),
    dbName = 'rocks_file_store',
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

  getDoc(id, function(er, doc) {
    console.log('request come');
    console.log(req.url);
    for(var k in doc._attachments) {}
    req.url = '/' + dbName + '/' + id + '/' + k;
    proxy.proxyRequest(5984, '192.168.1.100',  req, res);
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

function getDoc(docID, cb) {
  var request = dbClient.request(
        'GET', 
        '/' + dbName + '/' + docID
  );

  request.end();
  request.on('response', function (response) {
    var buffer = '';
    response.setEncoding('utf8');
    response.on('data', function (chunk) {
      buffer += (chunk || '');
    });
    response.on('end', function (chunk) {
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
