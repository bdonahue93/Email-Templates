const fs = require('fs');
const gulp = require('gulp');
const merge = require('merge');
const map = require('map-stream');
const juice = require('juice');
const sass = require('gulp-sass');
const combineMq = require('gulp-group-css-media-queries');
const htmlMin = require('gulp-htmlmin');
const cheerio = require('gulp-cheerio');
const he = require('he');
const browserSync = require('browser-sync').create();
const declassify = require('declassify');
var log = require('fancy-log');


let config = {
  srcDir: 'src',
  distDir: 'dist'
}

if (fs.existsSync('./gulp-config.json')) {
  const overrides = JSON.parse(fs.readFileSync('./gulp-config.json'));
  config = merge(config, overrides);
}


//
// Helper functions
//

// BrowserSync reload function
function serverReload(done) {
  if (config.sync) {
    browserSync.reload();
  }
  done();
}

// BrowserSync serve function
function serverServe(done) {
  if (config.sync) {
    browserSync.init({
      proxy: {
        target: config.syncIndex
      }
    });
  }
  done();
}


//
// CSS Build Steps
//

// Compile scss files and combine media queries
gulp.task('scss', () => {
  return gulp.src(`${config.srcDir}/scss/**/*.scss`)
    .pipe(sass({
      outputStyle: "compact"
    })
      .on('error', sass.logError))
    .pipe(combineMq())
    .pipe(gulp.dest(`${config.srcDir}/css/`));
});

// Inline CSS into the email markup, then minify and encode special chars.
// Note: 'html-inline' depends on 'scss' finishing before it can be run.
gulp.task('html-inline', () => {
  return gulp.src(`${config.srcDir}/*.html`)
    .pipe(map(function (data, cb) {
      juice.juiceFile(data.path, config.juice, function (err, html) {
        data.contents = new Buffer.from(html);
        cb(null, data);
      });
    }))
    .pipe(htmlMin(config.htmlmin))
    .pipe(map(function (data, cb) {
      let html = declassify.process(data.contents.toString(), config.declassify);
      data.contents = new Buffer.from(html);
      cb(null, data);
    }))
    .pipe(cheerio({
      run: function ($, file) {
        // Each file will be run through cheerio and each corresponding `$` will be passed here.
        // `file` is the gulp file object
        $('body *').each(function () {
          $(this)
            .contents()
            .filter(function () {
              return this.nodeType === 3
                && /\S/.test(this.nodeValue)
                && ! ('data-skip-encoding' in this.parent.attribs);
            })
            .each(function () {
              // Decode everything first, to handle already-encoded
              // characters such as `&amp;`, then encode
              this.nodeValue = he.encode(he.decode(this.nodeValue));
            });
        });
      },
      parserOptions: {
        decodeEntities: false
      }
    }))
    .pipe(gulp.dest(config.distDir + '/'));
});

// All CSS-related tasks
gulp.task('default', gulp.series('scss', 'html-inline'));


//
// Rerun tasks when files change
//
gulp.task('watch', (done) => {
  serverServe(done);

  gulp.watch(
    [
      `${config.srcDir}/scss/**/*.scss`,
      `${config.srcDir}/*.html`
    ],
    gulp.series('default', serverReload)
  );
});
