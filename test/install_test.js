/* jshint camelcase: false, strict: false */
/* global describe, beforeEach, it */

process.env.NODE_ENV='test';

var chai = require('chai'),
    should = chai.should(),
    util = require('util'),
    gutil = require('gulp-util'),
    path = require('path'),
    commandRunner = require('../lib/test_commandRunner'),
    install = require('../.'),
    args = process.argv.slice();

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
    commandRunner.reset();
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
      commandRunner.commandsThatHasRun.length.should.equal(1);
      commandRunner.commandsThatHasRun[0].cmd.should.equal('npm');
      commandRunner.commandsThatHasRun[0].args.should.eql(['install']);
      done();
    });

    stream.write(file);

    stream.end();
  });

  it('should run `npm install --production` if stream contains `package.json` and `production` option is set', function (done) {
    var file = fixture('package.json');

    var stream = install({production:true});

    stream.on('error', function(err) {
      should.exist(err);
      done(err);
    });

    stream.on('data', function () {
    });

    stream.on('end', function () {
      commandRunner.commandsThatHasRun.length.should.equal(1);
      commandRunner.commandsThatHasRun[0].cmd.should.equal('npm');
      commandRunner.commandsThatHasRun[0].args.should.eql(['install', '--production']);
      done();
    });

    stream.write(file);

    stream.end();
  });


  it('should run `bower install --config.interactive=false` if stream contains `bower.json`', function (done) {
    var file = fixture('bower.json');

    var stream = install();

    stream.on('error', function(err) {
      should.exist(err);
      done(err);
    });

    stream.on('data', function () {
    });

    stream.on('end', function () {
      commandRunner.commandsThatHasRun.length.should.equal(1);
      commandRunner.commandsThatHasRun[0].cmd.should.equal('bower');
      commandRunner.commandsThatHasRun[0].args.should.eql(['install', '--config.interactive=false']);
      done();
    });

    stream.write(file);

    stream.end();

  });

   it('should run `bower install --production --config.interactive=false` if stream contains `bower.json`', function (done) {
    var file = fixture('bower.json');

    var stream = install({production:true});

    stream.on('error', function(err) {
      should.exist(err);
      done(err);
    });

    stream.on('data', function () {
    });

    stream.on('end', function () {
      commandRunner.commandsThatHasRun.length.should.equal(1);
      commandRunner.commandsThatHasRun[0].cmd.should.equal('bower');
      commandRunner.commandsThatHasRun[0].args.should.eql(['install', '--config.interactive=false', '--production']);
      done();
    });

    stream.write(file);

    stream.end();

  });

  it('should run both `npm install` and `bower install --config.interactive=false` if stream contains both `package.json` and `bower.json`', function (done) {
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
      commandRunner.commandsThatHasRun.length.should.equal(2);
      commandRunner.commandsThatHasRun[0].cmd.should.equal('npm');
      commandRunner.commandsThatHasRun[0].args.should.eql(['install']);
      commandRunner.commandsThatHasRun[1].cmd.should.equal('bower');
      commandRunner.commandsThatHasRun[1].args.should.eql(['install', '--config.interactive=false']);
      done();
    });

    files.forEach(function (file) {
      stream.write(file);
    });

    stream.end();
  });

  it('should run both `npm install --production` and `bower install --production --config.interactive=false` if stream contains both `package.json` and `bower.json`', function (done) {
    var files = [
      fixture('package.json'),
      fixture('bower.json')
    ];

    var stream = install({production:true});

    stream.on('error', function(err) {
      should.exist(err);
      done(err);
    });

    stream.on('data', function () {
    });

    stream.on('end', function () {
      commandRunner.commandsThatHasRun.length.should.equal(2);
      commandRunner.commandsThatHasRun[0].cmd.should.equal('npm');
      commandRunner.commandsThatHasRun[0].args.should.eql(['install', '--production']);
      commandRunner.commandsThatHasRun[1].cmd.should.equal('bower');
      commandRunner.commandsThatHasRun[1].args.should.eql(['install', '--config.interactive=false', '--production']);
      done();
    });

    files.forEach(function (file) {
      stream.write(file);
    });

    stream.end();
  });

  it('should run `tsd reinstall --save` if stream contains `tsd.json`', function (done) {
    var file = fixture('tsd.json');

    var stream = install();

    stream.on('error', function(err) {
      should.exist(err);
      done(err);
    });

    stream.on('data', function () {
    });

    stream.on('end', function () {
      commandRunner.commandsThatHasRun.length.should.equal(1);
      commandRunner.commandsThatHasRun[0].cmd.should.equal('tsd');
      commandRunner.commandsThatHasRun[0].args.should.eql(['reinstall', '--save']);
      done();
    });

    stream.write(file);

    stream.end();

  });

  it('should not run any installs when `--skip-install` CLI option is provided', function (done) {
    var newArgs = args.slice();
    newArgs.push('--skip-install');
    process.argv = newArgs;

    var files = [
      fixture('tsd.json'),
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
      commandRunner.commandsThatHasRun.length.should.equal(0);
      done();
    });

    files.forEach(function (file) {
      stream.write(file);
    });

    stream.end();
  });

  it('should set `cwd` correctly to be able to run the same command in multiple folders', function (done) {
    var files = [
      fixture('dir1/package.json'),
      fixture('dir2/package.json')
    ];

    var stream = install();

    stream.on('error', function(err) {
      should.exist(err);
      done(err);
    });

    stream.on('data', function () {
    });

    stream.on('end', function () {
      commandRunner.commandsThatHasRun.length.should.equal(2);
      commandRunner.commandsThatHasRun[0].cmd.should.equal('npm');
      commandRunner.commandsThatHasRun[0].args.should.eql(['install']);
      commandRunner.commandsThatHasRun[0].cwd.should.equal(path.join(__dirname, 'dir1'));
      commandRunner.commandsThatHasRun[1].cmd.should.equal('npm');
      commandRunner.commandsThatHasRun[1].args.should.eql(['install']);
      commandRunner.commandsThatHasRun[1].cwd.should.equal(path.join(__dirname, 'dir2'));
      done();
    });

    files.forEach(function (file) {
      stream.write(file);
    });

    stream.end();
  });
});
