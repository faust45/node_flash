var fs = require('fs'),
    dbName = 'test',
    couchdb = require('couchdb'),
    client = couchdb.createClient(5984, '192.168.1.100'),
    db = client.db(dbName),
    exec = require('child_process').exec;


function p() {
  console.log(arguments);
}

/*
*/


/*
var id = '04938d03be60e7a47287ae447f70876c', attachmentId = 'test.jpg';
db.getAttachment(id, attachmentId, function(er, data) {
  fs.writeFile(attachmentId, data, 'binary', function (err) {
    if (err) throw err;
    console.log('It\'s saved!');
  });
});
*/

child = exec("./rounded_corners.sh " + 'resize.png r.png');
