# GulpJs client side frontend builder

This is my gulp file which I use for **client side frontends (HTML, CSS, IMAGES, JAVASCRIPT)**. It is fairly easily modifiable to adjust for various outputs desired. It took me a while to build this gulpfile so I'm sharing it here to save the difficulty in setting up and learning how to use Gulp for client side frontends. It handles the following:

- **CSS** - Which will use rev and revReplace for custom css files per compilation for cache busting
- **Images/Extras** - Simply copies over existing images, so it is currently necessary to adjust images independantly
- **JS** - Which includes rev and revReplace for cache busting, as well as an obfuscation library if required
- **Html** - Using 'critical' and replacing inline links and sources with the revReplaced ones

## Installation

```
npm install gulp gulp-uglify gulp-clean-css gulp-htmlmin gulp-util gulp-minify-inline critical gulp-inline-source gulp-rev gulp-rev-replace gulp-remove-logging gulp-callback gulp-javascript-obfuscator
```

## Running this gulp file

Start with:

```
gulp
```

Then following the output prompts at the end of each task. This must be done in order while waiting for all the processing to finish:

```
gulp js
gulp revAll
gulp htmls
```

## Supports the following

It supports cache busting for CSS and JS files with nice file names. It also handles rev and revReplace for html files to rename all the locations for the css and js files necessary. This works also if CSS are placed inside html files directly from Javascript as well. **Note:** It can handle removal of logging as well, although if there are any non-new-line logging then it won't work. The logging needs to be on it's own new line for the removal of logging to work.

## Improvement

This needs seperate functions for seperate html directories, so this is a place for potential improvement. Feel free to make a PR if you add this!
