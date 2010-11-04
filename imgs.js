var temp = require('temp'),
    utils = require('connect/utils'),
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
  var roundCorners = options.round;
  var newFile = temp.path({suffix: '.png'});
  var mime = utils.mime.type(newFile);

  gm(filePath)
   .resize(size.width, size.height)
   .write(newFile, function(err) {
       if(!err) {
         if (roundCorners) { 
           roundedCorners(newFile, function(finishFile) {
             self.emit('finish', finishFile, mime);
           }); 
         } else {
           self.emit('finish', newFile, mime);
         }
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
