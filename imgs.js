var temp = require('temp');
var exec = require('child_process').exec;

exports.roundedCorners = function(fileName, fun) {
  var newFile = temp.path();
  var cmd = './rounded_corners.sh ' + fileName + ' ' + newFile;
  console.log(cmd);

  exec(cmd, function(error, stdout, stderr) {
    console.log(error);
    console.log(stderr);
    fun(newFile);
  });
}

exports.toPng = function(fileName) {
  return fileName.replace(/\.\w*$/, '.png');
}
