/* jshint camelcase: false, strict: false */
/* global describe, beforeEach, it */
var chai = require('chai'),
    should = chai.should(),
    util = require('util'),
    gutil = require('gulp-util'),
    path = require('path'),
    child_process = require('child_process'),
    install = require('../.'),
    spawns = [],
    args = process.argv.slice();

function SpawnMock () {
  setTimeout(function () {
    this.emit('close');
  }.bind(this), 5);
}
var EventEmitter = require('events').EventEmitter;
util.inherits(SpawnMock, EventEmitter);

child_process.spawn = function () {
  var mock = new SpawnMock();
  spawns.push({args: Array.prototype.slice.call(arguments), mock: mock});
  return mock;
};

function fixture (file) {
  var filepath = path.join(__dirname, file);
  return new gutil.File({
    path: filepath,
    cwd: __dirname,
    base: path.join(__dirname, path.dirname(file)),
    contents: null
  });
}

describe('gulp-install', function () {
  beforeEach(function () {
    spawns = [];
    process.argv = args;
  });

  it('should run `npm install` if stream contains `package.json`', function (done) {
    var file = fixture('package.json');

    var stream = install();

    stream.on('error', function(err) {
      should.exist(err);
      done(err);
    });

    stream.on('data', function () {
    });

    stream.on('end', function () {
      spawns.length.should.equal(1);
      spawns[0].args[0].should.match(/[\/\\]npm$/);
      spawns[0].args[1].should.eql(['install']);
      done();
    });

    stream.write(file);

    stream.end();
  });

  it('should run `bower install` if stream contains `bower.json`', function (done) {
    var file = fixture('bower.json');

    var stream = install();

    stream.on('error', function(err) {
      should.exist(err);
      done(err);
    });

    stream.on('data', function () {
    });

    stream.on('end', function () {
      spawns.length.should.equal(1);
      spawns[0].args[0].should.match(/[\/\\]bower$/);
      spawns[0].args[1].should.eql(['install']);
      done();
    });

    stream.write(file);

    stream.end();
  });

  it('should run both `npm install` and `bower install` if stream contains both `package.json` and `bower.json`', function (done) {
    var files = [
      fixture('package.json'),
      fixture('bower.json')
    ];

    var stream = install();

    stream.on('error', function(err) {
      should.exist(err);
      done(err);
    });

    stream.on('data', function () {
    });

    stream.on('end', function () {
      spawns.length.should.equal(2);
      spawns[0].args[0].should.match(/[\/\\]npm$/);
      spawns[0].args[1].should.eql(['install']);
      spawns[1].args[0].should.match(/[\/\\]bower$/);
      spawns[1].args[1].should.eql(['install']);
      done();
    });

    files.forEach(function (file) {
      stream.write(file);
    });

    stream.end();
  });

  it('should not run any installs when `--skip-install` CLI option is provided', function (done) {
    var newArgs = args.slice();
    newArgs.push('--skip-install');
    process.argv = newArgs;

    var files = [
      fixture('package.json'),
      fixture('bower.json')
    ];

    var stream = install();

    stream.on('error', function(err) {
      should.exist(err);
      done(err);
    });

    stream.on('data', function () {
    });

    stream.on('end', function () {
      spawns.length.should.equal(0);
      done();
    });

    files.forEach(function (file) {
      stream.write(file);
    });

    stream.end();
  });
});