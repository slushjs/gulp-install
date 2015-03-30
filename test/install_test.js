/* jshint camelcase: false, strict: false */
/* global describe, beforeEach, it */

var chai = require('chai'),
    should = chai.should(),
    util = require('util'),
    gutil = require('gulp-util'),
    path = require('path'),
    commandRunner = require('../lib/commandRunner'),
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

var originalRun;

describe('gulp-install', function () {
  beforeEach(function () {
    originalRun = commandRunner.run;
    commandRunner.run = mockRunner();
    process.argv = args;
  });

  afterEach(function () {
    commandRunner.run = originalRun;
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
      commandRunner.run.called.should.equal(1);
      commandRunner.run.commands[0].cmd.should.equal('npm');
      commandRunner.run.commands[0].args.should.eql(['install']);
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
      commandRunner.run.called.should.equal(1);
      commandRunner.run.commands[0].cmd.should.equal('npm');
      commandRunner.run.commands[0].args.should.eql(['install', '--production']);
      done();
    });

    stream.write(file);

    stream.end();
  });

  it('should run `npm install --ignore-scripts` if stream contains `package.json` and `ignoreScripts` option is set', function (done) {
    var file = fixture('package.json');

    var stream = install({ignoreScripts:true});

    stream.on('error', function(err) {
      should.exist(err);
      done(err);
    });

    stream.on('data', function () {
    });

    stream.on('end', function () {
      commandRunner.run.called.should.equal(1);
      commandRunner.run.commands[0].cmd.should.equal('npm');
      commandRunner.run.commands[0].args.should.eql(['install', '--ignore-scripts']);
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
      commandRunner.run.called.should.equal(1);
      commandRunner.run.commands[0].cmd.should.equal('bower');
      commandRunner.run.commands[0].args.should.eql(['install', '--config.interactive=false']);
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
      commandRunner.run.called.should.equal(1);
      commandRunner.run.commands[0].cmd.should.equal('bower');
      commandRunner.run.commands[0].args.should.eql(['install', '--config.interactive=false', '--production']);
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
      commandRunner.run.called.should.equal(2);
      commandRunner.run.commands[0].cmd.should.equal('npm');
      commandRunner.run.commands[0].args.should.eql(['install']);
      commandRunner.run.commands[1].cmd.should.equal('bower');
      commandRunner.run.commands[1].args.should.eql(['install', '--config.interactive=false']);
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
      commandRunner.run.called.should.equal(2);
      commandRunner.run.commands[0].cmd.should.equal('npm');
      commandRunner.run.commands[0].args.should.eql(['install', '--production']);
      commandRunner.run.commands[1].cmd.should.equal('bower');
      commandRunner.run.commands[1].args.should.eql(['install', '--config.interactive=false', '--production']);
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
      commandRunner.run.called.should.equal(1);
      commandRunner.run.commands[0].cmd.should.equal('tsd');
      commandRunner.run.commands[0].args.should.eql(['reinstall', '--save']);
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
      commandRunner.run.called.should.equal(0);
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
      commandRunner.run.called.should.equal(2);
      commandRunner.run.commands[0].cmd.should.equal('npm');
      commandRunner.run.commands[0].args.should.eql(['install']);
      commandRunner.run.commands[0].cwd.should.equal(path.join(__dirname, 'dir1'));
      commandRunner.run.commands[1].cmd.should.equal('npm');
      commandRunner.run.commands[1].args.should.eql(['install']);
      commandRunner.run.commands[1].cwd.should.equal(path.join(__dirname, 'dir2'));
      done();
    });

    files.forEach(function (file) {
      stream.write(file);
    });

    stream.end();
  });
});

function mockRunner () {
  var mock = function mock (cmd, cb) {
    mock.called += 1;
    mock.commands.push(cmd);
    cb();
  };
  mock.called = 0;
  mock.commands = [];
  return mock;
}
