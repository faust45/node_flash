var gm = require('gm'),
    fs = require('fs'),
    dbName = 'test',
    couchdb = require('couchdb'),
    client = couchdb.createClient(5984, '192.168.1.100'),
    db = client.db(dbName);



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

gm('test.jpg')
  .resize(240, 240)
  .write('resize.png', function(err) {
    console.log(err);
    if (!err) print('done');
  });
