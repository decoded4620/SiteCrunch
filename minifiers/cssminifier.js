var Crawler = require('../utils/crawler.js').Crawler;
var FileSystem = require('../utils/filesystem.js').FileSystem;

var cleancss = require('clean-css');
// ======================================================================================================================
// CSSMinifier implementation
// ======================================================================================================================

CSSMinifier.prototype.minifyEachAndEveryCss = minifyEachAndEveryCss;
CSSMinifier.prototype.minifyAsOneCss = minifyAsOneCss;
CSSMinifier.prototype.cleanCss = cleanCss;
CSSMinifier.prototype.__helper_checkComplete = __helper_checkComplete;

function CSSMinifier(fileTypes, ignorePatterns) {
    this.compressorsOpen = 0;
    
    if(typeof fileTypes !== 'undefined'){
        this.fileTypes = fileTypes;
    }
    else{
        this.fileTypes = '.css';
    }
    if(typeof ignorePatterns !== 'undefined'){
        this.ignorePatterns = ignorePatterns;
    }
    else{
        this.ignorePatterns = null;
    }
    
}

function __helper_checkComplete(cbComplete) {
    var retVal = false;
    if(this.compressorsOpen > 0){
        this.compressorsOpen --;
        if (this.compressorsOpen == 0) {
    
            if (cbComplete != null) {
                cbComplete();
                return retVal;
            }
        }
    }

    return retVal;
}



/**
 * Clean and minify css
 */
function cleanCss(filesIn, fileOut, cbEachOne, cbComplete) {
    var thisRef = this;
    thisRef.compressorsOpen++;
    if (typeof filesIn === 'string') {
        console.log("CSSMinifier.cleanCss(" + filesIn + ", " + fileOut + ")");
        input = ('@import url(' + filesIn + ');');
    }
    else if (typeof filesIn === 'object') {
        console.log("CSSMinifier.cleanCss(" + filesIn.length + " files, " + fileOut + ")");
        // array
        input = filesIn;
    }

    /**
     * minify
     */
    new cleancss({
        rebase : false
    }).minify(input, function(errors, minified) {

        if (undefined !== minified.styles) {

            console.log("minify success.. " + minified.styles.length);
            
            // crete the file and write the minified styles content to it.
            new FileSystem().createFile(fileOut, minified.styles, function(err, file){

                console.log(" tried to create: " + fileOut);
                
                if (err) {
                    console.log(file + " NOT saved!");
                    console.log(err);
                }
                
                if (cbEachOne != null) {
                    cbEachOne(file);
                }

                thisRef.__helper_checkComplete(cbComplete);
            });
        }
    });
};

function minifyAsOneCss(src, dist, cbComplete) {
    console.log("CSSMinifier.minifyAsOneCss(" + src + ", " + dist + ")");

    var capture = [];
    var thisRef = this;
    new Crawler(this.fileTypes, this.ignorePatterns).crawl(src, capture, function() {
        thisRef.cleanCss(capture, dist, null, cbComplete);
    });
}

function minifyEachAndEveryCss(src, dist, cbEachOne, cbComplete) {
    console.log("CSSMinifier.minifyEachAndEveryCss(" + src + ", " + dist + ")");

    var capture = [];
    var thisRef = this;
    new Crawler(this.fileTypes, this.ignorePatterns).crawl(src, capture, function() {
        for (var i = 0; i < capture.length; i++) {
            thisRef.cleanCss(capture[i], capture[i].replace(src, dist), cbEachOne, cbComplete);
        }
    });
}

module.exports.CSSMinifier = CSSMinifier;