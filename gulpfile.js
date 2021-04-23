const { src, dest, watch, parallel, series } = require('gulp'),
  pug = require('gulp-pug'),
  sass = require('gulp-sass'),
  sourcemaps = require('gulp-sourcemaps'),
  autoprefixer = require('gulp-autoprefixer'),
  concat = require('gulp-concat'),
  uglify = require('gulp-uglify'),
  rename = require('gulp-rename'),
  notify = require('gulp-notify'),
  cleanCSS = require('gulp-clean-css'),
  htmlmin = require('gulp-htmlmin'),
  imagemin = require('gulp-imagemin'),
  plumber = require('gulp-plumber'),
  del = require('del'),
  browserSync = require('browser-sync').create();


const pugToHTML = (cb) => {
  src('./src/pug/pages/*.pug')
    .pipe(plumber())
    .pipe(pug({ pretty: true }))
    .pipe(dest('./src'));
  cb();
};

const sassToCSS = (cb) => {
  src('./src/sass/*.{sass,scss}')
    .pipe(sourcemaps.init())
    .pipe(sass().on('error', notify.onError()))
    .pipe(autoprefixer({ overrideBrowserslist: ['last 10 versions'] }))
    .pipe(dest('./src/css'))
    .pipe(cleanCSS())
    .pipe(rename({ suffix: '.min' }))
    .pipe(sourcemaps.write('.'))
    .pipe(dest('./src/css'));
  cb();
};

const scripts = (cb) => {
  src('./src/scripts/modules/*.js')
    .pipe(sourcemaps.init())
    .pipe(concat('main.js'))
    .pipe(uglify())
    .pipe(rename({ suffix: '.min' }))
    .pipe(sourcemaps.write('.'))
    .pipe(dest('./src/scripts'));
  cb();
};

const server = () => {
  browserSync.init({
    server: { baseDir: './src' },
    notify: false,
  });

  watch('./src/sass/**/*.{sass,scss}', sassToCSS).on('change', browserSync.reload);
  watch('./src/pug/**/*.pug', pugToHTML).on('change', browserSync.reload);
};

const deleteFolder = async () => await del.sync(['./dist']);

const buildHTML = (cb) => {
  src('./src/*.html')
    .pipe(htmlmin({ collapseWhitespace: true }))
    .pipe(dest('./dist'));
  cb();
};

const buildCSS = (cb) => {
  src('./src/css/*.min.css')
    .pipe(dest('./dist/css'));
  cb();
};

const buildScripts = (cb) => {
  src('./src/scripts/*.min.js')
    .pipe(dest('./dist/scripts'));
  cb();
};

const buildImages = (cb) => {
  src('./src/images/**/*')
    .pipe(imagemin([
      imagemin.gifsicle({ interlaced: true }),
      imagemin.mozjpeg({ quality: 75, progressive: true }),
      imagemin.optipng({ optimizationLevel: 5 }),
      imagemin.svgo({
        plugins: [
          { removeViewBox: true },
          { cleanupIDs: false }
        ]
      })
    ]))
    .pipe(dest('./dist/images'));
  cb();
};

const buildFonts = (cb) => {
  src('./src/fonts/**/*')
    .pipe(dest('./dist/fonts'));
  cb();
}


exports.start = series(parallel(pugToHTML, sassToCSS, scripts), server);
exports.build = series(deleteFolder, parallel(pugToHTML, sassToCSS, scripts), parallel(buildHTML, buildCSS, buildImages, buildScripts, buildFonts));
