var http = require('http'),
    httpProxy = require('http-proxy'),
    url = require('url');

var sys = require('sys'),
    couchdb = require('couchdb'),
    client = couchdb.createClient(5984, '192.168.1.100'),
    db = client.db('rocks_file_store_dev');

httpProxy.createServer(function (req, res, proxyRequest) {
  var path = url.parse(req.url),
      id = path.pathname.replace('/', '');

  console.log(req.url)
  console.log(id)
  db.getDoc(id, function(er, doc) {
    var attach = doc._attachments;
    for(var k in attach) {}
    console.log(k);

    req.url = '/rocks_file_store_dev/' + id + '/' + k;
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
