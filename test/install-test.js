/* jshint camelcase: false */
/* global describe, beforeEach, afterEach, it */
'use strict';
const path = require('path');
const chai = require('chai');
const gutil = require('gulp-util');
const commandRunner = require('../lib/command-runner');
const install = require('../.');

const should = chai.should();
const args = process.argv.slice();

function fixture(file) {
  const filepath = path.join(__dirname, file);
  return new gutil.File({
    path: filepath,
    cwd: __dirname,
    base: path.join(__dirname, path.dirname(file)),
    contents: null
  });
}

let originalRun;

describe('gulp-install', () => {
  beforeEach(() => {
    originalRun = commandRunner.run;
    commandRunner.run = mockRunner();
    process.argv = args;
  });

  afterEach(() => {
    commandRunner.run = originalRun;
  });

  it('should run `npm install` if stream contains `package.json`', done => {
    const file = fixture('package.json');

    const stream = install();

    stream.on('error', err => {
      should.exist(err);
      done(err);
    });

    stream.on('data', () => {});

    stream.on('end', () => {
      commandRunner.run.called.should.equal(1);
      commandRunner.run.commands[0].cmd.should.equal('npm');
      commandRunner.run.commands[0].args.should.eql(['install']);
      done();
    });

    stream.write(file);

    stream.end();
  });

  it('should run `npm install --production` if stream contains `package.json` and `production` option is set', done => {
    const file = fixture('package.json');

    const stream = install({production: true});

    stream.on('error', err => {
      should.exist(err);
      done(err);
    });

    stream.on('data', () => {});

    stream.on('end', () => {
      commandRunner.run.called.should.equal(1);
      commandRunner.run.commands[0].cmd.should.equal('npm');
      commandRunner.run.commands[0].args.should.eql(['install', '--production']);
      done();
    });

    stream.write(file);

    stream.end();
  });

  it('should run `npm install --ignore-scripts` if stream contains `package.json` and `ignoreScripts` option is set', done => {
    const file = fixture('package.json');

    const stream = install({ignoreScripts: true});

    stream.on('error', err => {
      should.exist(err);
      done(err);
    });

    stream.on('data', () => {});

    stream.on('end', () => {
      commandRunner.run.called.should.equal(1);
      commandRunner.run.commands[0].cmd.should.equal('npm');
      commandRunner.run.commands[0].args.should.eql(['install', '--ignore-scripts']);
      done();
    });

    stream.write(file);

    stream.end();
  });

  it('should run `bower install --config.interactive=false` if stream contains `bower.json`', done => {
    const file = fixture('bower.json');

    const stream = install();

    stream.on('error', err => {
      should.exist(err);
      done(err);
    });

    stream.on('data', () => {});

    stream.on('end', () => {
      commandRunner.run.called.should.equal(1);
      commandRunner.run.commands[0].cmd.should.equal('bower');
      commandRunner.run.commands[0].args.should.eql(['install', '--config.interactive=false']);
      done();
    });

    stream.write(file);

    stream.end();
  });

  it('should run `bower install --production --config.interactive=false` if stream contains `bower.json`', done => {
    const file = fixture('bower.json');

    const stream = install({production: true});

    stream.on('error', err => {
      should.exist(err);
      done(err);
    });

    stream.on('data', () => {});

    stream.on('end', () => {
      commandRunner.run.called.should.equal(1);
      commandRunner.run.commands[0].cmd.should.equal('bower');
      commandRunner.run.commands[0].args.should.eql(['install', '--config.interactive=false', '--production']);
      done();
    });

    stream.write(file);

    stream.end();
  });

  it('should run both `npm install` and `bower install --config.interactive=false` if stream contains both `package.json` and `bower.json`', done => {
    const files = [
      fixture('package.json'),
      fixture('bower.json')
    ];

    const stream = install();

    stream.on('error', err => {
      should.exist(err);
      done(err);
    });

    stream.on('data', () => {});

    stream.on('end', () => {
      commandRunner.run.called.should.equal(2);
      commandRunner.run.commands[0].cmd.should.equal('npm');
      commandRunner.run.commands[0].args.should.eql(['install']);
      commandRunner.run.commands[1].cmd.should.equal('bower');
      commandRunner.run.commands[1].args.should.eql(['install', '--config.interactive=false']);
      done();
    });

    files.forEach(file => stream.write(file));

    stream.end();
  });

  it('should run both `npm install --production` and `bower install --production --config.interactive=false` if stream contains both `package.json` and `bower.json`', done => {
    const files = [
      fixture('package.json'),
      fixture('bower.json')
    ];

    const stream = install({production: true});

    stream.on('error', err => {
      should.exist(err);
      done(err);
    });

    stream.on('data', () => {});

    stream.on('end', () => {
      commandRunner.run.called.should.equal(2);
      commandRunner.run.commands[0].cmd.should.equal('npm');
      commandRunner.run.commands[0].args.should.eql(['install', '--production']);
      commandRunner.run.commands[1].cmd.should.equal('bower');
      commandRunner.run.commands[1].args.should.eql(['install', '--config.interactive=false', '--production']);
      done();
    });

    files.forEach(file => stream.write(file));

    stream.end();
  });

  it('should run `bower install --allow-root --config.interactive=false` if stream contains `bower.json`', done => {
    const files = [
      fixture('bower.json')
    ];

    const stream = install({allowRoot: true});

    stream.on('error', err => {
      should.exist(err);
      done(err);
    });

    stream.on('data', () => {});

    stream.on('end', () => {
      commandRunner.run.called.should.equal(1);
      commandRunner.run.commands[0].cmd.should.equal('bower');
      commandRunner.run.commands[0].args.should.eql(['install', '--config.interactive=false', '--allow-root']);
      done();
    });

    files.forEach(file => stream.write(file));

    stream.end();
  });

  it('should run `tsd reinstall --save` if stream contains `tsd.json`', done => {
    const file = fixture('tsd.json');

    const stream = install();

    stream.on('error', err => {
      should.exist(err);
      done(err);
    });

    stream.on('data', () => {});

    stream.on('end', () => {
      commandRunner.run.called.should.equal(1);
      commandRunner.run.commands[0].cmd.should.equal('tsd');
      commandRunner.run.commands[0].args.should.eql(['reinstall', '--save']);
      done();
    });

    stream.write(file);

    stream.end();
  });

  it('should run `pip install -r requirements.txt` if stream contains `requirements.txt`', done => {
    const file = fixture('requirements.txt');

    const stream = install();

    stream.on('error', err => {
      should.exist(err);
      done(err);
    });

    stream.on('data', () => {});

    stream.on('end', () => {
      commandRunner.run.called.should.equal(1);
      commandRunner.run.commands[0].cmd.should.equal('pip');
      commandRunner.run.commands[0].args.should.eql(['install', '-r', 'requirements.txt']);
      done();
    });

    stream.write(file);

    stream.end();
  });

  it('should run `npm install --no-optional` if `noOptional` option is set', done => {
    const files = [
      fixture('package.json')
    ];

    const stream = install({noOptional: true});

    stream.on('error', err => {
      should.exist(err);
      done(err);
    });

    stream.on('data', () => {});

    stream.on('end', () => {
      commandRunner.run.called.should.equal(1);
      commandRunner.run.commands[0].cmd.should.equal('npm');
      commandRunner.run.commands[0].args.should.eql(['install', '--no-optional']);
      done();
    });

    files.forEach(file => stream.write(file));

    stream.end();
  });

  it('should run `npm install --dev --no-shrinkwrap` if args option is the appropriate array', done => {
    const files = [
      fixture('package.json')
    ];

    const stream = install({
      args: ['--dev', '--no-shrinkwrap']
    });

    stream.on('error', err => {
      should.exist(err);
      done(err);
    });

    stream.on('data', () => {});

    stream.on('end', () => {
      commandRunner.run.called.should.equal(1);
      commandRunner.run.commands[0].cmd.should.equal('npm');
      commandRunner.run.commands[0].args.should.eql(['install', '--dev', '--no-shrinkwrap']);
      done();
    });

    files.forEach(file => stream.write(file));

    stream.end();
  });

  it('should run `npm install --dev` if args option is \'--dev\'', done => {
    const files = [
      fixture('package.json')
    ];

    const stream = install({
      args: '--dev'
    });

    stream.on('error', err => {
      should.exist(err);
      done(err);
    });

    stream.on('data', () => {});

    stream.on('end', () => {
      commandRunner.run.called.should.equal(1);
      commandRunner.run.commands[0].cmd.should.equal('npm');
      commandRunner.run.commands[0].args.should.eql(['install', '--dev']);
      done();
    });

    files.forEach(file => stream.write(file));

    stream.end();
  });

  it('should run `npm install` even if args option is in an invalid format', done => {
    const files = [
      fixture('package.json')
    ];

    const stream = install({
      args: 42
    });

    stream.on('error', err => {
      should.exist(err);
      done(err);
    });

    stream.on('data', () => {});

    stream.on('end', () => {
      commandRunner.run.called.should.equal(1);
      commandRunner.run.commands[0].cmd.should.equal('npm');
      commandRunner.run.commands[0].args.should.eql(['install', '42']);
      done();
    });

    files.forEach(file => stream.write(file));

    stream.end();
  });

  it('should not run any installs when `--skip-install` CLI option is provided', done => {
    process.argv = args.slice().concat('--skip-install');

    const files = [
      fixture('tsd.json'),
      fixture('package.json'),
      fixture('bower.json')
    ];

    const stream = install();

    stream.on('error', err => {
      should.exist(err);
      done(err);
    });

    stream.on('data', () => {});

    stream.on('end', () => {
      commandRunner.run.called.should.equal(0);
      done();
    });

    files.forEach(file => stream.write(file));

    stream.end();
  });

  it('should set `cwd` correctly to be able to run the same command in multiple folders', done => {
    const files = [
      fixture('dir1/package.json'),
      fixture('dir2/package.json')
    ];

    const stream = install();

    stream.on('error', err => {
      should.exist(err);
      done(err);
    });

    stream.on('data', () => {});

    stream.on('end', () => {
      commandRunner.run.called.should.equal(2);
      commandRunner.run.commands[0].cmd.should.equal('npm');
      commandRunner.run.commands[0].args.should.eql(['install']);
      commandRunner.run.commands[0].cwd.should.equal(path.join(__dirname, 'dir1'));
      commandRunner.run.commands[1].cmd.should.equal('npm');
      commandRunner.run.commands[1].args.should.eql(['install']);
      commandRunner.run.commands[1].cwd.should.equal(path.join(__dirname, 'dir2'));
      done();
    });

    files.forEach(file => stream.write(file));

    stream.end();
  });
});

function mockRunner() {
  const mock = cmd => {
    mock.called += 1;
    mock.commands.push(cmd);
    return Promise.resolve();
  };
  mock.called = 0;
  mock.commands = [];
  return mock;
}
