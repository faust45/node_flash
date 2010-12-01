var sys = require('util'),
    ID3File = require('id3'),
    db = require('couchdb'),
    exec = require('child_process').exec,
    dbReq = db.createClient(5984, '192.168.1.100').db('rocks_dev'),
    myCouchdb = require('./my_couch');


var feed = myCouchdb.listenChanges('mp3_need_proccess');

feed.on('data', function(data) {
  console.log(data);
  return;
  myCouchdb.downloadAttachment(data.id, {}, function(err, filePath) {

    var cmd = 'ruby fetch_tags.rb ' + filePath;
    exec(cmd, function(error, stdout, stderr) {
      var info = JSON.parse(stdout);

      getByAttachmentId(data.id, function(doc) {
        var audio = new Audio(doc);
        audio.update(info);
      });
    });

  });
});

function getByAttachmentId(id, cb) {
  dbReq.view('global', 'audios_by_track_id', {key: id, include_docs: true, reduce: false}, function(err, resp) {
    resp.rows.forEach(function(item) {
      cb(item.doc);
    });
  })
}

function Audio(doc) {
  function assignAuthor() {
      dbReq;
  }

  function addToAlbum() {
  }

  function assignTags() {
  }

  function update(info) {
    console.log('update info');
    console.log(info);
    assignAuthor(info.author);
    addToAlbum(info.author);
    assignTags(info);
  }

  function save() {
    dbReq.saveDoc(doc._id, doc, function(err, resp) {
      console.log(resp);
    });
  }

  return {
    update: update
  }
}
