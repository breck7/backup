#!/usr/bin/env node
var fs = require("fs"),
    AWS = require('aws-sdk'),
    spawn = require('child_process').spawn,
    program = require('commander'),
    path = require('path')

program
  .version('0.1.1')
  .option('-d, --directory [string]', 'Directory to zip')
  .option('-a, --aws [string]', 'Path to AWS config file')
  .option('-b, --bucket [string]', 'Bucket name')
  .option('-o, --outputDir [string]', 'Optional. Provide a path to also save the backup locally.')
  .parse(process.argv)

var localDir = path.resolve(program.outputDir || process.cwd())

function uploadBackup(filename) {
  
  fs.readFile(localDir + '/' + filename, function (err, data) {
    if (err)
      throw err
  
    AWS.config.loadFromPath(path.resolve(program.aws))
    var s3 = new AWS.S3()
    
    s3.client.createBucket({Bucket: program.bucket}, function() {
      var params = {Bucket: program.bucket, Key: filename, Body: data}
      s3.client.putObject(params, function(err, data) {
        if (err)
          console.log(err)
        else
          console.log('Successfully uploaded ' + filename + ' to ' + program.bucket)
        if (!program.outputDir)
          fs.unlink(localDir + '/' + filename)
      })
    })
  })
  
}

function backupDir (dir) {
  
  var now = new Date()
  var hours = now.getHours()
  if (hours > 12)
    hours = hours - 12
  else if (hours == 0)
    hours = 12
  // backupName is directory_at_10.20.2012_10.51.23am.zip
  var backupName = path.basename(dir) + '_at_' +
    (now.getMonth() + 1) + '.' +
    (now.getDate()) + '.' +
    (now.getFullYear()) + '_' +
    (hours) + '.' +
    (now.getMinutes()) + '.' +
    (now.getSeconds()) + 
    ((now.getHours()) < 12 ? 'am' : 'pm') + '.zip'
  
  var zip = spawn('zip', ['-r', localDir + '/' + backupName, '.'], {cwd : dir})
  zip.on('exit', function (code) {
    if (code == 0)
      uploadBackup(backupName)
    else
      console.log('zip process exited with code ' + code);
  })
}

backupDir(path.resolve(program.directory))
