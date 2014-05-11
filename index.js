'use strict';
var through2 = require('through2'),
    gutil = require('gulp-util'),
    path = require('path'),
    childProcess = require('child_process'),
    commandRunner = require('./lib/' + (isTest() ? 'test_' : '') + 'commandRunner'),
    cmdMap = {
      'bower.json': {cmd: 'bower', args: ['install']},
      'package.json': {cmd: 'npm', args: ['install']}
    };

module.exports = exports = function install () {
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
        cmd.cwd = path.dirname(file.path);
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
          commandRunner.run(command, function (err) {
            if (err) {
              gutil.log(err.message, 'Run `' + gutil.colors.yellow(formatCommand(command)) + '` manually');
            }
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

function formatCommands (cmds) {
  return cmds.map(formatCommand).join(' && ');
}

function formatCommand (command) {
  return command.cmd + ' ' + command.args.join(' ');
}

function skipInstall () {
  return process.argv.slice(2).indexOf('--skip-install') >= 0;
}

function isTest () {
  return process.env.NODE_ENV === 'test';
}
