// This gulpfile.js which can be altered and used for various frontend compilation of assets.
// Author: m0chael

// Below are the imports that can be used or commented out for compiling all frontend assets for a client side app
// This includes:

// CSS - which will use rev and revReplace for custom css files per compilation for cache busting
// Images/extras - simply copy over existing images, so it is currently necessary to adjust images independantly
// JS - which includes rev and revReplace for cache busting, as well as an obfuscation library if required
// Html - Using 'critical' and replacing inline links and sources with the revReplaced ones

import gulp from 'gulp';
import uglify from 'gulp-uglify';
import cleancss from 'gulp-clean-css';
import htmlmin from 'gulp-htmlmin';
import gutil from 'gulp-util';
import minifyInline from 'gulp-minify-inline';
import { stream as critical } from 'critical';
import inlinesource from 'gulp-inline-source';
import rev from 'gulp-rev';
import revReplace from 'gulp-rev-replace';
import gulpRemoveLogging from 'gulp-remove-logging';
import gCallback from 'gulp-callback';
import javascriptObfuscator from 'gulp-javascript-obfuscator';

// Global variables which handle folder and directory structure of the script
let FRONT = ""; // Directory in front of everything, default is ""
let MAIN = ""; // Directory in front of JS files if there is a preceding folder base
let EXPORT = "export"; // Export directory name for exported bundle
let MANIFESTS = "export/rev-manifest.json"; // Rev manifest file location for the to-be-created manifest for linking file names with revReplace

// The CSS Files construct, which handles rev-ing and outputs the css files to the exported directory
let cssIN = MAIN + 'css/*.css';
let cssOUT = EXPORT + '/css/';

gulp.task('css', function () {
  return gulp.src(cssIN)
    .pipe(rev())
    .pipe(cleancss())
    .pipe(gulp.dest(cssOUT))
    .pipe(rev.manifest('rev-manifest.json'))
    .pipe(gulp.dest(EXPORT + "/"))
});

// Contains an optional seperate array for different image types to go into it's own directory
let COPYS = {
  index: 0,
  files: [
    ['images/*.{ico,json,png,svg,xml}', 'export/images/'],
    ['images/*.{png,webp,gif,jpg,jpeg,svg}', 'export/images/'],
  ]
};

// The images task which handles images movement
gulp.task('images', function (done) {
  console.log("images");
  callImageItems(done);
});

// The following function is used by the images task to copy over the images, and this would be where it could be possible to add image processing
function callImageItems(done) {
  console.log("Making item: " + COPYS.index);
  copyFile({ "input": COPYS.files[COPYS.index][0], "output": COPYS.files[COPYS.index][1] }, function () {
    if (COPYS.index < COPYS.files.length - 1) {
      COPYS.index++;
      callImageItems(done);
    } else { done(); }
  });
};

// The copyFile function
function copyFile(entry, myCallback) {
  process.setMaxListeners(0);
  gulp.src(entry.input).pipe(gulp.dest(entry.output))
    .pipe(gCallback(function () {
        myCallback();
      })
    );
};

// The javascript configuration and following with the javascript file processors
let JSS = {
  index: 0,
  files: [
    [MAIN + "js/*.js", EXPORT + "/js/"],
  ]
};

// The actual gulp task for js files
gulp.task('js', function (done) {
  callJavacriptItems();
  done();
});

// Call the javascript items for processing which builds the JS file
function callJavacriptItems() {
  console.log("Length: " + JSS.files.length);
  console.log(JSS.index);
  console.log("Making current Javascript Item: " + JSS.files[JSS.index]);

  buildJsFile({ "input": JSS.files[JSS.index][0], "output": JSS.files[JSS.index][1] }, function () {
    if (JSS.index < JSS.files.length - 1) {
      JSS.index++;
      callJavacriptItems();
    } else {
      console.log("**** Full Complete ****");
    }
  });
};

 // gulpRemoveLogging may be ommitted as occasionally there was some issues if console logs are not on their own seperate line
function buildJsFile(entry, myCallback) {
  process.setMaxListeners(0);
  gulp.src(entry.input)
    .pipe(javascriptObfuscator())
    .pipe(gulpRemoveLogging({}))
    .pipe(rev())
    .pipe(gulp.dest(entry.output))
    .pipe(rev.manifest(MANIFESTS, { base: process.cwd() + '/export', merge: true }))
    .pipe(gulp.dest(EXPORT + "/"))
    .pipe(gCallback(function () {
        myCallback();
      })
    );
};

// Js Revs which rev the Js files for cache busting of seperately specially named js files
let JS_REVS = {
  index: 0,
  files: [
    [EXPORT + "js/*.js", EXPORT + "/js/"],
  ]
};

// The gulp task to revAll which happens after the first Js command
gulp.task('revAll', function (done) {
  callJavacriptRevItems();
  done();
});

// This calls the revving and and processes the Js Rev File.
function callJavacriptRevItems() {
  console.log("Length: " + JS_REVS.files.length);
  console.log(JS_REVS.index);
  console.log("Making current Rev JS Item: " + JS_REVS.files[JS_REVS.index]);

  buildJsRevfile({ "input": JS_REVS.files[JS_REVS.index][0], "output": JS_REVS.files[JS_REVS.index][1] }, function () {
    if (JS_REVS.index < JS_REVS.files.length - 1) {
      JS_REVS.index++;
      callJavacriptRevItems();
    } else {
      console.log("**** Full Complete ****");
    }
  });
};

// Building the Js Rev file. This is where the processing happens for the js revving
function buildJsRevfile(entry, myCallback) {
  process.setMaxListeners(0);
  let manifest = gulp.src(MANIFESTS);

  gulp.src(entry.input)
    .pipe(revReplace({ manifest: manifest }))
    .pipe(uglify())
    .pipe(javascriptObfuscator())
    .pipe(gulp.dest(entry.output))
    .pipe(gCallback(function () {
        myCallback();
      })
    );
};

let HTMLS = {
  mainIndex: 0,
  mainOutputs: EXPORT + "/",
  mainFiles: [
    "index", "about", "etc"
  ],
  /*
    This may be used with a seperate callNextSetOfHtmls that would need to be built to handle a seperate directory of html files
    setsIndex: 0,
    setsOutput: EXPORT + "/",
    setsFiles: []
  */
};

// The last task which is for the html files
gulp.task('htmls', function (done) {
  callMainHtmls();
  done();
});

// Call the main htmls which builds the html files using processing with critical
function callMainHtmls() {
  console.log("Length: " + HTMLS.mainFiles.length);
  console.log(HTMLS.mainIndex);
  console.log("Making current Html Items: " + HTMLS.mainFiles[HTMLS.mainIndex]);

  buildHtmlFile({ "input": FRONT + HTMLS.mainFiles[HTMLS.mainIndex] + ".html", "output": HTMLS.mainOutputs }, function () {
    if (HTMLS.mainIndex < HTMLS.mainFiles.length - 1) {
      HTMLS.mainIndex++;
      callMainHtmls();
    } else {
      console.log("**** (OPTIONAL) Seperate directory for html files properly ****");
      setTimeout(function () {
        callSetsHtmls();
      }, 999);
    }
  });
};

// Building the html files where the processing happens for htmls
function buildHtmlFile(entry, myCallback) {
  process.setMaxListeners(0);
  let manifest = gulp.src(MANIFESTS);

  gulp.src(entry.input)
    .pipe(inlinesource())
    .pipe(critical({ base: '.', inline: true, penthouse: { timeout: 60000, pageLoadSkipTimeout: 25000 }}))
    .on('error', function (err) { gutil.log(gutil.colors.red(err.message)); })
    .pipe(inlinesource())
    .pipe(minifyInline())
    .pipe(revReplace({ manifest: manifest }))
    .pipe(htmlmin({ collapseWhitespace: true }))
    .pipe(gulp.dest(entry.output))
    .pipe(gCallback(function () {
      myCallback();
    }));
};

// The final ending task for the first section
gulp.task('ending', function (done) {
  console.log("GulpJS frontend builder | Now run \n'js'\n'revAll'\n'htmls'");
  done();
});

// The initial default task which is run by gulp
gulp.task('default',
  gulp.series(
    "css",
    "images",
    "ending"
  )
);