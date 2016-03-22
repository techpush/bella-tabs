/**
 * Common scenario for Gulp
 * @ndaidong at Twitter
 **/

 /* eslint no-console: 0*/

'use strict'; // enable strict mode to use "let" in node.js 4.x

var traceur = require('traceur');
traceur.require.makeDefault((filename) => {
  return !filename.includes('node_modules');
});

var pkg = require('./package');
var builder = require('./workers/builder');

var gulp = require('gulp');
var bella = require('bellajs');

var fs = require('fs');

var mkdirp = require('mkdirp').sync;

var fixPath = (p) => {
  if (!p) {
    return '';
  }
  if (p.endsWith('/')) {
    return p;
  }
  return p + '/';
};

var bConfig = pkg.builder;
var distDir = fixPath(bConfig.distDir);
var js3rdDir = fixPath(bConfig.jsDir) + 'vendor';
var css3rdDir = fixPath(bConfig.cssDir) + 'vendor';
var verDir = 'v' + pkg.version;

gulp.task('dir', () => {
  builder.createDir([ distDir, js3rdDir, css3rdDir ]);
});

gulp.task('prepare', () => {
  let dir = distDir + verDir;
  builder.removeDir(dir);
  builder.createDir(dir);
  builder.createDir(dir + '/src');
});

gulp.task('move', () => {
  let dir = fixPath(distDir + verDir);
  let copyFile = builder.copyFile;
  fs.readdir('src/', (err, files) => {
    if (err) {
      console.trace(err);
    }
    if (files && files.length) {
      files.forEach((o) => {
        let f = 'src/' + o;
        let stat = fs.statSync(f);
        if (stat.isFile()) {
          copyFile(f, dir + f);
        }
      });
    }
    return false;
  });
});

gulp.task('download', () => {
  var download = builder.download;
  let jsFiles = bConfig.javascript || {};
  let cssFiles = bConfig.css || {};
  if (bella.isObject(jsFiles)) {
    let rd = fixPath(js3rdDir);
    if (!fs.existsSync(rd)) {
      mkdirp(rd);
    }
    for (let alias in jsFiles) {
      if (bella.hasProperty(jsFiles, alias)) {
        let src = jsFiles[alias];
        let dest = rd + alias + '.js';
        if (!fs.existsSync(dest)) {
          download(src, dest);
        }
      }
    }
  }
  if (bella.isObject(cssFiles)) {
    let rd = fixPath(css3rdDir);
    if (!fs.existsSync(rd)) {
      mkdirp(rd);
    }
    for (let alias in cssFiles) {
      if (bella.hasProperty(cssFiles, alias)) {
        let src = cssFiles[alias];
        let dest = rd + alias + '.css';
        if (!fs.existsSync(dest)) {
          download(src, dest);
        }
      }
    }
  }
});

gulp.task('setup', [ 'dir', 'download' ]);
gulp.task('build', [ 'prepare', 'move' ]);
