var http = require('http'),
    httpProxy = require('http-proxy'),
    url = require('url'),
    fs = require('fs'),
    sys = require('util'),
    imgs = require('./imgs'),
    myCouch = require('./my_couch'),
    qs = require('querystring'),
    cache = require('./cache');

var ip = '127.0.0.1', port = 8000;

httpProxy.createServer(function (req, res, proxy) {
  var path = url.parse(req.url),
      id   = path.pathname.replace('/', ''),
      params = qs.parse(path.query),
      size   = parseSize(params.size) || {width: 100, height: 100},
      roundCorners = params.round;

  if (id == 'favicon.ico' || id == '') {
    return;
  } 

  var box = cache.check(id, size, roundCorners);

  box.on('hit', function(cacheUrl) {
    req.url = cacheUrl;
    proxy.proxyRequest(5984, '192.168.1.100',  req, res);
  });

  box.on('fail', function() {
    myCouch.downloadAttachment(id, {}, function(er, filePath) {
      var processor = imgs.process(filePath, {size: size, round: roundCorners});

      processor.on('error', function(er) {
        res.writeHead(404, {'Content-Type': 'text/plain'});
        res.end('Image not found');
      });
      processor.on('finish', function(filePath, mime) {
        res.writeHead(200, { 'Content-Type': mime });

        var readStream = fs.createReadStream(filePath, { 'encoding': 'binary' });

        readStream.on('data', function (chunk) {
          res.write(chunk, 'binary');
        });
        readStream.on('end', function () {
          res.end();
        });

        box.put(readStream, mime); 
      });
    });
  });
}).listen(port, ip);
console.log('Server running at ' + ip + ':' + port);

function p() {
  console.log(arguments);
}

function parseSize(str) {
  var size = {};
  if (str) {
    if(str.match(/(\d+)x(\d+)/)) {
      size.height = RegExp.$1;
      size.width  = RegExp.$2;

      return size; 
    }
  }
}
