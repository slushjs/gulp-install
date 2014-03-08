'use strict';
var through2 = require('through2'),
    gutil = require('gulp-util'),
    path = require('path'),
    childProcess = require('child_process'),
    cmdMap = {
      'bower.json': {cmd: 'bower', args: ['install']},
      'package.json': {cmd: 'npm', args: ['install']}
    };

module.exports = function install () {
  var toRun = [],
      count = 0;
  return through2(
    {objectMode: true},
    function (file, enc, cb) {
      if (!file.path) {
        cb();
      }
      var cmd = cmdMap[path.basename(file.path)];
      if (cmd) {
        toRun.push(cmd);
      }
      this.push(file);
      cb();
    },
    function (cb) {
      if (!toRun.length) {
        return cb();
      }
      if (skipInstall()) {
        gutil.log('Skipping install.', 'Run `' + gutil.colors.yellow(formatCommands(toRun)) + '` manually');
        return cb();
      } else {
        toRun.forEach(function (command) {
          runCommand(command, function () {
            done(cb, toRun.length);
          });
        });
      }
    }
  );

  function done (cb, length) {
    if (++count === length) {
      cb();
    }
  }
};


function runCommand (command, cb) {
  var cmd = childProcess.spawn(command.cmd, command.args, {stdio: 'inherit', cwd: process.cwd()});
  cmd.on('close', function () {
    cb();
  });
}

function formatCommands (cmds) {
  return cmds.map(function (command) {
    return command.cmd + ' ' + command.args.join(' ');
  }).join(' && ');
}

function skipInstall () {
  return process.argv.slice(2).indexOf('--skip-install') >= 0;
}
