var http = require('http'),
    myCouch = require('./my_couch'),
    url = require('url'),
    qs = require('querystring');

http.createServer(function (req, res) {
  var path   = url.parse(req.url),
      params = qs.parse(path.query);

      console.log(req.url, path);

  if (id == 'favicon.ico') {
      return;
  }

  myCouch.getID3(path, function(err, tags) {
      var js = params.callback + '(' + JSON.stringify(tags) + ')';
      res.writeHead(200, {'Content-Type': 'application/javascript; charset=utf-8'});
      res.end(js);
  });
}).listen(8124, "127.0.0.1");

