var temp = require('temp'),
    gm = require('gm'),
    EventEmitter = require('events').EventEmitter,
    exec = require('child_process').exec;


exports.process = function(filePath, options) {
  return new ImgProcessor(filePath, options);
};


//Private------------------------------------------------------------
function ImgProcessor(filePath, options) {
  options = options || {};
  var self = this;
  var size = options.size || {width: 100, height: 100};
  var newFile = temp.path({suffix: '.png'});

  gm(filePath)
   .resize(size.width, size.height)
   .write(newFile, function(err) {
       if(!err) {
         roundedCorners(newFile, function(finishFile) {
           self.emit('finish', finishFile, newFile);
         }); 
       } else {
         self.emit('error', err);
         console.log(err);
       }
    });

  return this;
}

ImgProcessor.prototype.__proto__ = EventEmitter.prototype;

roundedCorners = function(filePath, cb) {
  var newFile = temp.path();
  var cmd = './rounded_corners.sh ' + filePath + ' ' + newFile;
  console.log(cmd);

  exec(cmd, function(error, stdout, stderr) {
    console.log(error);
    console.log(stderr);
    cb(newFile);
  });
}
