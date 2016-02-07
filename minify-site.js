var sleep   = require('sleep');

var Crawler = require('./utils/crawler.js').Crawler;
var FileSystem = require('./utils/filesystem.js').FileSystem;
var Dump = require('./utils/dump.js').Dump;
var JSMinifier = require('./minifiers/jsminifier.js').JSMinifier;
var JSONMinifier = require('./minifiers/jsonminifier.js').JSONMinifier;
var CSSMinifier = require('./minifiers/cssminifier.js').CSSMinifier;
var HTMLMinifier = require('./minifiers/htmlminifier.js').HTMLMinifier;
var XMLMinifier = require('./minifiers/xmlminifier.js').XMLMinifier;

// first two args
var scriptArgs = process.argv.slice(0,2);

// any additional args
var userArgs = process.argv.slice(2);

// root file system
var rootFs = new FileSystem();

// path to this script
var scriptPath = scriptArgs[1];

// directory containing this script
var scriptDir = rootFs.getFileDir(scriptPath);

var userArgTable = {};
if( userArgs.length > 0){
    // userArgs are split on '=' to avoid forcing order
    for(var i = 0; i < userArgs.length; ++i){
        var argAt = userArgs[i];
        
        if(argAt.indexOf('=') == -1){
            console.log("skipping invalid argument format at: " + i + ", argument: " + argAt);
            continue;
        }

        // split and store the values
        var pts = argAt.split('=');
        userArgTable[pts[0]] = pts[1];
    }
}

// default script
var script = scriptDir + 'runner.json';

// can be overridden using cmd line args
if( userArgTable.runner != null){
    if(rootFs.isRelativePath(userArgTable.runner)){
        script = scriptDir + userArgTable.runner;
    }else{
        script = userArgTable.runner;
    }
}
//closure to start us off

 rootFs.readFile(script, 'utf8', function(err, jsonData){
     if(err){
         return;
     }
     jsonObj = JSON.parse(jsonData);
     if(jsonObj != null){
         var mainQueue = [];
         for(var mapping in jsonObj){
             var mappingObj = jsonObj[mapping];
             var queue = mappingObj.queue;
             
             mainQueue = mainQueue.concat(queue);
         }
     }
 // run this bad boy
     new MinifySite(mainQueue).run();
 });



// helper prototypes
XMLMinify.prototype.minifyEachAndEveryXml = minifyEachAndEveryXml;
HTMLMinify.prototype.minifyEachAndEveryHtml = minifyEachAndEveryHtml;
JSONMinify.prototype.minifyEachAndEveryJson = minifyEachAndEveryJson;
JSMinify.prototype.minifyEachAndEveryJs = minifyEachAndEveryJs;
JSMinify.prototype.minifyAsOneJs = minifyAsOneJs;

// main prototype
MinifySite.prototype.run = MSRun;
MinifySite.prototype.minifyAndConcatCss = MSMinifyAndConcatCss;
MinifySite.prototype.minifyCss = MSMinifyCss;
MinifySite.prototype.minifyJs = MSMinifyJs;
MinifySite.prototype.minifyJson = MSMinifyJson;
MinifySite.prototype.minifyAndConcatJs = MSMinifyAndConcatJs;
MinifySite.prototype.minifyHtml = MSMinifyHtml;
MinifySite.prototype.minifyXml = MSMinifyXml;


// ======================================================================================================================
// MinifySite implementation
// ======================================================================================================================
function MinifySite(q) {
    console.log("MinifySite::Construct() - " + (q == null ? 0 : q.length) + " items in the queue, directory is: "
            + process.cwd());
    this.queue = q;
}

function MSMinifyCss(src, dest, fileTypes, ignorePatterns,callback) {
    console.log("MinifySite.MSMinifyCss(" + src + ", " + dest + ")");
    var thisRef = this;
    new CSSMinifier(fileTypes, ignorePatterns).minifyEachAndEveryCss(src, dest, function(newFile) {
        console.log("\tcompleted: " + newFile);
    }, function() {
        if (callback != null) {
            callback(null, null);
        }
    });
}

function MSMinifyAndConcatCss(src, destFile,fileTypes, ignorePatterns, callback) {
    console.log("MinifySite.MSMinifyAndConcatCss(" + src + ", " + destFile + ")");
    var thisRef = this;
    new CSSMinifier(fileTypes, ignorePatterns).minifyAsOneCss(src, destFile, function() {
        if (callback != null) {
            callback(null, null);
        }
    });
}

function MSMinifyJs(src, dest, fileTypes, ignorePatterns, callback) {

    console.log("MinifySite.MSMinifyJs(" + src + ", " + dest + ")");
    var thisRef = this;
    new JSMinify(fileTypes, ignorePatterns ).minifyEachAndEveryJs(src, dest, function(err, input, output) {
    }, function() {
        if (callback != null) {
            callback(null, null);
        }
    });
}

function MSMinifyAndConcatJs(src, dest, fileTypes, ignorePatterns, callback) {
    console.log("MinifySite.MSMinifyAndConcatJs(" + src + ", " + dest + ")");

    var thisRef = this;
    new JSMinify(fileTypes, ignorePatterns ).minifyAsOneJs(src, dest, function() {
        if (callback != null) {
            callback(null, null);
        }
    });
}

function MSMinifyJson(src, dest, fileTypes, ignorePatterns, callback) {

    console.log("MinifySite.MSMinifyJson(" + src + ", " + dest + ")");
    new JSONMinify(fileTypes, ignorePatterns).minifyEachAndEveryJson(src, dest, function(err, input, output) {
    }, function() {
        if (callback != null) {
            callback(null, null);
        }
    });
}

function MSMinifyHtml(src, dest, fileTypes, ignorePatterns, callback) {

    console.log("MinifySite.MSMinifyHtml(" + src + ", " + dest + ")");
    new HTMLMinify(fileTypes, ignorePatterns).minifyEachAndEveryHtml(src, dest, function(err, input, output) {
    }, function() {
        if (callback != null) {
            callback(null, null);
        }
    });

}

function MSMinifyXml(src, dest, fileTypes, ignorePatterns,  callback) {

    console.log("MinifySite.MSMinifyXml(" + src + ", " + dest + ")");
    new XMLMinify(fileTypes, ignorePatterns).minifyEachAndEveryXml(src, dest, function(err, input, output) {
    }, function() {
        if (callback != null) {
            callback(null, null);
        }
    });

}
function MSRun() {
    if (this.queue !== null && this.queue.length > 0) {
        console.log("MinifySite.run() - " + this.queue.length);
        // sleep for 1/2 second.
        sleep.usleep(1000000/2);
        var thisRef = this;
        var nextItem = this.queue.pop();

        if (nextItem) {
            console.log(nextItem.src + "->" + nextItem.dest + ", format: " + nextItem.format + ", type: "
                    + nextItem.type);
            // map methods to the current item type
            if (this.methods == null) {
                this.methods = {
                    json : {
                        'concat' : null,
                        'mapped' : this.minifyJson
                    },
                    css : {
                        'concat' : this.minifyAndConcatCss,
                        'mapped' : this.minifyCss
                    },
                    js : {
                        'concat' : this.minifyAndConcatJs,
                        'mapped' : this.minifyJs
                    },
                    html : {
                        'concat' : null,
                        'mapped' : this.minifyHtml
                    },
                    xml : {
                        'concat' : null,
                        'mapped' : this.minifyXml
                    }
                };
            }

            var methodToRun = null;
            try {
                methodToRun = this.methods[nextItem.format][nextItem.type];
            }
            catch (e) {
                console.log(e);
            }
            if (methodToRun != null) {
                
                var fileTypes   = null;
                var ignorePatterns  = null;
                
                ignorePatterns  = nextItem.ignore;
                fileTypes       = nextItem.include;
                
                console.log("INCLUDES: " + fileTypes + " INGORES: " + ignorePatterns);
                
                methodToRun(nextItem.src, nextItem.dest, fileTypes, ignorePatterns, function(err, result) {
                    if (thisRef.queue.length > 0) {
                        thisRef.run();
                    }
                });
            }
            else {
                console.log("\tno method for : " + nextItem.format + "/" + nextItem.type);
                if (this.queue.length > 0) {
                    thisRef.run();
                }
            }
        }
    }
    else {
        console.log("All Finished, Exiting!");
    }
}

//======================================================================================================================
// XMLMinify implementation
//======================================================================================================================

function XMLMinify(fileTypes, ignorePatterns) {
    console.log(typeof fileTypes + ", " + typeof ignorePatterns);
    if(typeof fileTypes !== 'undefined'){
        this.fileTypes = fileTypes;
    }
    else{
        this.fileTypes = '.xml';
    }
    if(typeof ignorePatterns !== 'undefined'){
        this.ignorePatterns = ignorePatterns;
    }
    else{
        this.ignorePatterns = null;
    }
    
    console.log("XMLMinify.Construct( includes: " + this.fileTypes + ", ignores: " + this.ignorePatterns + ")");
}
function minifyEachAndEveryXml(src, dist, cbEachOne, cbComplete) {
    console.log("XMLMinify.minifyEachAndEveryXml(src: " + src + " => dist: " + dist + ")");
    capture = [];

    new Crawler(this.fileTypes, this.ignorePatterns).crawl(src, capture, function() {

        var asyncScope = {
            inFlight : 0
        };
        var cLen = capture.length;

        for (var i = 0; i < cLen; i++) {
            asyncScope.inFlight++;

            var template = capture[i];
            var mangled = capture[i].replace(src, dist);

            new XMLMinifier().minify(template, mangled, function(err, minifiedXml) {
                asyncScope.inFlight--;

                if (cbEachOne != null) {
                    cbEachOne(null, template, mangled);
                }

                if (asyncScope.inFlight == 0) {
                    console.log("\tminifyEachAndEveryXml finished!");
                    if (cbComplete != null) {
                        cbComplete();
                    }
                }
            });
        }
    });
}

//======================================================================================================================
//HTMLMinify implementation
//======================================================================================================================
function HTMLMinify(fileTypes, ignorePatterns) {
    console.log(typeof fileTypes + ", " + typeof ignorePatterns);
    if(typeof fileTypes !== 'undefined'){
        this.fileTypes = fileTypes;
    }
    else{
        this.fileTypes = '.html';
    }
    if(typeof ignorePatterns !== 'undefined'){
        this.ignorePatterns = ignorePatterns;
    }
    else{
        this.ignorePatterns = null;
    }
    
    console.log("HTMLMinify.Construct( includes: " + this.fileTypes + ", ignores: " + this.ignorePatterns + ")");
}
function minifyEachAndEveryHtml(src, dist, cbEachOne, cbComplete) {

    console.log("JSONMinify.minifyEachAndEveryHtml(src: " + src + " => dist: " + dist + ")");
    capture = [];

    new Crawler(this.fileTypes, this.ignorePatterns).crawl(src, capture, function() {

        var asyncScope = {
            inFlight : 0
        };
        var cLen = capture.length;
        for (var i = 0; i < cLen; i++) {
            asyncScope.inFlight++;

            var template = capture[i];
            var mangled = capture[i].replace(src, dist);

            new HTMLMinifier().minify(template, mangled, function(err, minifiedHtml) {
                asyncScope.inFlight--;

                if (cbEachOne != null) {
                    cbEachOne(null, template, mangled);
                }

                if (asyncScope.inFlight == 0) {
                    console.log("\tminifyEachAndEveryHtml finished!");
                    if (cbComplete != null) {
                        cbComplete();
                    }
                }
            });
        }
    });
}

// ======================================================================================================================
// JSONMinify implementation
// ======================================================================================================================
function JSONMinify(fileTypes, ignorePatterns) {
    console.log(typeof fileTypes + ", " + typeof ignorePatterns);
    if(typeof fileTypes !== 'undefined'){
        this.fileTypes = fileTypes;
    }
    else{
        this.fileTypes = '.json';
    }
    if(typeof ignorePatterns !== 'undefined'){
        this.ignorePatterns = ignorePatterns;
    }
    else{
        this.ignorePatterns = null;
    }
    
    console.log("JSONMinify.Construct(" + this.fileTypes + ", " + this.ignorePatterns + ")");
}
function minifyEachAndEveryJson(src, dist, cbEachOne, cbComplete) {

    console.log("JSONMinify.minifyEachAndEveryJson(src: " + src + " => dist: " + dist + ")");
    capture = [];

    new Crawler(this.fileTypes, this.ignorePatterns).crawl(src, capture, function() {

        var asyncScope = {
            inFlight : 0
        };
        var cLen = capture.length;

        for (var i = 0; i < cLen; i++) {
            asyncScope.inFlight++;

            var template = capture[i];
            var mangled = capture[i].replace(src, dist).replace('.json', '.min.json');

            new JSONMinifier().minify(template, mangled, function(err, minifiedJson) {
                asyncScope.inFlight--;

                if (cbEachOne != null) {
                    cbEachOne(null, template, mangled);
                }

                if (asyncScope.inFlight == 0) {
                    console.log("\tminifyEachAndEveryJson finished!");
                    if (cbComplete != null) {
                        cbComplete();
                    }
                }
            });
        }
    });
}
// ======================================================================================================================
// JSMinify implementation
// ======================================================================================================================

function JSMinify(fileTypes, ignorePatterns) {
    
    console.log(typeof fileTypes + ", " + typeof ignorePatterns);
    if(typeof fileTypes !== 'undefined'){
        this.fileTypes = fileTypes;
    }
    else{
        this.fileTypes = '.js';
    }
    if(typeof ignorePatterns !== 'undefined'){
        this.ignorePatterns = ignorePatterns;
    }
    else{
        this.ignorePatterns = null;
    }
    
    console.log("JSMinify.Construct(" + this.fileTypes + ", " + this.ignorePatterns + ")");
}
function minifyAsOneJs(src, distFile, callback) {
    console.log("JSMinify.minifyAsOneJs(" + src + " => " + distFile + ")");
    capture = [];

    // crawl asynchronously
    new Crawler(this.fileTypes, this.ignorePatterns).crawl(src, capture, function() {
        new JSMinifier().minify(capture, distFile, function() {
            if (callback != null) {
                callback();
            }
        });
    });
}

/**
 * @param src
 * @param dist
 * @param cbEachOne
 * @param cbComplete
 */
function minifyEachAndEveryJs(src, dist, cbEachOne, cbComplete) {

    console.log("JSMinify.minifyEachAndEveryJs(src: " + src + " => dist: " + dist + ")");
    capture = [];

    new Crawler(this.fileTypes, this.ignorePatterns).crawl(src, capture, function() {

        var asyncScope = {
            inFlight : 0
        };
        var cLen = capture.length;

        for (var i = 0; i < cLen; i++) {
            asyncScope.inFlight++;

            var template = capture[i];
            var mangled = capture[i].replace(src, dist).replace('.js', '.min.js');

            new JSMinifier().minify(template, mangled,

            function() {
                asyncScope.inFlight--;

                if (cbEachOne != null) {
                    cbEachOne(null, template, mangled);
                }

                if (asyncScope.inFlight == 0) {
                    console.log("\tminifyEachAndEveryJs finished!");
                    if (cbComplete != null) {
                        cbComplete();
                    }
                }
            });
        }
    });
}


