var http = require('http'),
    httpProxy = require('http-proxy'),
    url = require('url'),
    fs = require('fs'),
    sys = require('util'),
    utils = require('connect/utils'),
    imgs = require('./imgs'),
    myCouch = require('./my_couch'),
    qs = require('querystring');

httpProxy.createServer(function (req, res, proxy) {
  var path = url.parse(req.url),
      id = path.pathname.replace('/', '');
      params = qs.parse(path.query),
      size = parseSize(params.size) || defaultSize;

  if (id == 'favicon.ico') {
    return;
  } 

  myCouch.downloadAttachment(id, {}, function(er, filePath) {
    p('download complete');
    p(filePath);

    var processor = imgs.process(filePath, {size: size});
    processor.on('finish', function(filePath, fileName) {
      p('finish');
      res.writeHead(200, {
        'Content-Type': utils.mime.type(fileName)
      });
      var readStream = fs.createReadStream(filePath, {'encoding': 'binary'});

      readStream.on('data', function (chunk) {
        res.write(chunk, 'binary');
      });
      readStream.on('end', function () {
        res.end();
      });
    });
  });

  //req.url = '/' + 'cache' + '/' + id + '/' + fileName;
  //proxy.proxyRequest(5984, '192.168.1.100',  req, res);
}).listen(8000);
console.log('Server running at http://127.0.0.1:8000/');

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
