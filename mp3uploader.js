var http = require('http'),
    url = require('url'),
    fs = require('fs'),
    sys = require('util'),
    couchdb = require('./my_couch'),
    temp = require('temp');

var feed = couchdb.listenChanges('mp3_need_proccess');

feed.on('data', function(data) {
  couchdb.downloadAttachment(data.id, {limiSize: 2000}, function(err, filePath) {
    console.log('file download ok...');
    console.log(filePath);
  });
});

