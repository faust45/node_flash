var http = require('http'),
    httpProxy = require('http-proxy'),
    url = require('url');

var sys = require('sys'),
    dbName = 'rocks_file_store',
    couchdb = require('couchdb'),
    client = couchdb.createClient(5984, '192.168.1.100'),
    db = client.db(dbName);

httpProxy.createServer(function (req, res, proxyRequest) {
  var path = url.parse(req.url),
      id = path.pathname.replace('/', '');

  if (id == 'favicon.ico') {
     proxyRequest(5984, '192.168.1.100');
     return;
  } 

  console.log('request doc: ' + id);
  db.getDoc(id, function(er, doc) {
    if (er) {
      console.log(er);
    } else {
      console.log('got doc: ' + doc._id);
      var attach = doc._attachments;
      for(var k in attach) {}

      req.url = '/' + dbName + '/' + id + '/' + k;
    }

    console.log(req.url);
    proxyRequest(5984, '192.168.1.100');

    //db.getAttachment(doc._id, attachmentId, function(er, data) {
    //  console.log(doc);
    //});
  });
}).listen(8000);


/*
  http.createServer(function (req, res) {
  res.writeHead(200, {'Content-Type': 'text/plain'});
  res.end('Hello World\n');
}).listen(8000, "127.0.0.1");
*/

console.log('Server running at http://127.0.0.1:8000/');
