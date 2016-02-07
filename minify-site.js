// Sleep Between operations
var sleep = require('sleep');

// Powerful Fun with Command Line Arguments.
var ArguMints = require('argumints').ArguMints;
//var ArguMints = require('Z:\\workspaces\\github\\argumints\\argumints.js').ArguMints;

// Crawls the file system and captures files.
var Crawler = require('./utils/crawler.js').Crawler;

// Reads and Writes to the FileSystem
var FileSystem = require('./utils/filesystem.js').FileSystem;

// Dump Object Contents
var Dumper = require('./utils/dump.js').Dumper;

// Minifiers
var JSMinifier = require('./minifiers/jsminifier.js').JSMinifier;
var JSONMinifier = require('./minifiers/jsonminifier.js').JSONMinifier;
var CSSMinifier = require('./minifiers/cssminifier.js').CSSMinifier;
var HTMLMinifier = require('./minifiers/htmlminifier.js').HTMLMinifier;
var XMLMinifier = require('./minifiers/xmlminifier.js').XMLMinifier;


//This is shared throughout the component
//so that all objects can benefit from 
//input configuration by the user.
commandArgs = {
      
  // built in functions
  isVerbose:function(){
      console.log("IS VERBOSE: " + this + ", " + this['verbose'] + ", " + this['v']);
      return this.v === true || this.verbose === true;
  }
};

ArguMints.verbose = true;

// yummy, ArguMints!
var arguMints = new ArguMints({
    treatBoolStringsAsBoolean:true,     // input args like x=true will result in x being 'true ( boolean )' rather than "true" (string)
    treatNullStringsAsNull:true,        // input args like x=null will result in x being NULL (the value type) rather than "null" (string)
    treatRegExStringsAsRegEx:true,      // input args like x=/*.js/ will result in x being an instance of RegExp (i.e. new RegExp(/*.js/))
    parseJsonStrings:true
})
    // build the table
    .retort()
    // copy all input arguments and merge them into the
    // commandArgs table.
    .copyTo(commandArgs, true);

var isVerbose = commandArgs.isVerbose();

FileSystem.verbose = isVerbose;
Crawler.verbose = isVerbose;
MinifySite.verbose = isVerbose;
XMLMinify.verbose = isVerbose;
HTMLMinify.verbose = isVerbose;
JSONMinify.verbose = isVerbose;
JSMinify.verbose = isVerbose;

if(isVerbose) console.log("Starting Site Minifier Tool");
// first two args
var scriptArgs = arguMints.getScriptArgs(); //process.argv.slice(0, 2);

// any additional args
var userArgs = arguMints.getUserArgs(); //process.argv.slice(2);

// root file system
var rootFs = new FileSystem();

// path to this script
var scriptPath = scriptArgs[1];

// directory containing this script
var scriptDir = rootFs.getFileDir(scriptPath);

console.log(new Dumper().dump(commandArgs));

// default script
var script = scriptDir + 'runner.json';

// can be overridden using cmd line args
if (commandArgs.runner != null) {
    if (rootFs.isRelativePath(commandArgs.runner)) {
        script = scriptDir + commandArgs.runner;
    }
    else {
        script = commandArgs.runner;
    }
}

//closure to start us off

rootFs.readFile(script, 'utf8', function(err, jsonData) {
    if (err) {
        return;
    }
    jsonObj = JSON.parse(jsonData);
    if (jsonObj != null) {
        var mainQueue = [];
        for ( var mapping in jsonObj) {
            var mappingObj = jsonObj[mapping];
            var queue = mappingObj.queue;

            mainQueue = mainQueue.concat(queue);
        }
    }
    // run this bad boy
    var minifysite = new MinifySite(mainQueue);
    minifysite.run();
});

XMLMinify.verbose = false;
// helper prototypes
XMLMinify.prototype.minifyEachAndEveryXml = minifyEachAndEveryXml;
HTMLMinify.prototype.minifyEachAndEveryHtml = minifyEachAndEveryHtml;
JSONMinify.prototype.minifyEachAndEveryJson = minifyEachAndEveryJson;
JSMinify.prototype.minifyEachAndEveryJs = minifyEachAndEveryJs;
JSMinify.prototype.minifyAsOneJs = minifyAsOneJs;

// main prototype
MinifySite.verbose = false;
MinifySite.prototype.run = MSRun;
MinifySite.prototype.runRecursive = MSRunRecursive;
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
    if(MinifySite.verbose) console.log("MinifySite::Construct() - " + (q == null ? 0 : q.length) + " items in the queue, directory is: "
                + process.cwd());
    this.queue = q;
}


function MSMinifyCss(src, dest, fileTypes, ignorePatterns, callback) {
    if(MinifySite.verbose) console.log("MinifySite.MSMinifyCss(" + src + ", " + dest + ")");
    
    var thisRef = this;
    new CSSMinifier(fileTypes, ignorePatterns).minifyEachAndEveryCss(src, dest, function(newFile) {
        if(MinifySite.verbose) console.log("\tcompleted: " + newFile);
    }, function() {
        if (callback != null) {
            callback(null, null);
        }
    });
}

function MSMinifyAndConcatCss(src, destFile, fileTypes, ignorePatterns, callback) {
    if(MinifySite.verbose) console.log("MinifySite.MSMinifyAndConcatCss(" + src + ", " + destFile + ")");
    var thisRef = this;
    new CSSMinifier(fileTypes, ignorePatterns).minifyAsOneCss(src, destFile, function() {
        if (callback != null) {
            callback(null, null);
        }
    });
}

function MSMinifyJs(src, dest, fileTypes, ignorePatterns, callback) {
    if(MinifySite.verbose) console.log("MinifySite.MSMinifyJs(" + src + ", " + dest + ")");
    var thisRef = this;
    new JSMinify(fileTypes, ignorePatterns).minifyEachAndEveryJs(src, dest, function(err, input, output) {
    }, function() {
        if (callback != null) {
            callback(null, null);
        }
    });
}

function MSMinifyAndConcatJs(src, dest, fileTypes, ignorePatterns, callback) {
    if(MinifySite.verbose) console.log("MinifySite.MSMinifyAndConcatJs(" + src + ", " + dest + ")");
    var thisRef = this;
    new JSMinify(fileTypes, ignorePatterns).minifyAsOneJs(src, dest, function() {
        if (callback != null) {
            callback(null, null);
        }
    });
}

function MSMinifyJson(src, dest, fileTypes, ignorePatterns, callback) {
    if(MinifySite.verbose) console.log("MinifySite.MSMinifyJson(" + src + ", " + dest + ")");
    new JSONMinify(fileTypes, ignorePatterns).minifyEachAndEveryJson(src, dest, function(err, input, output) {
    }, function() {
        if (callback != null) {
            callback(null, null);
        }
    });
}

function MSMinifyHtml(src, dest, fileTypes, ignorePatterns, callback) {
    if(MinifySite.verbose) console.log("MinifySite.MSMinifyHtml(" + src + ", " + dest + ")");
    new HTMLMinify(fileTypes, ignorePatterns).minifyEachAndEveryHtml(src, dest, function(err, input, output) {
    }, function() {
        if (callback != null) {
            callback(null, null);
        }
    });

}

function MSMinifyXml(src, dest, fileTypes, ignorePatterns, callback) {
    if(MinifySite.verbose) console.log("MinifySite.MSMinifyXml(" + src + ", " + dest + ")");
    new XMLMinify(fileTypes, ignorePatterns).minifyEachAndEveryXml(src, dest, function(err, input, output) {
    }, function() {
        if (callback != null) {
            callback(null, null);
        }
    });

}

/**
 * Recalls itself until the run queue has been fully processed.
 */
function MSRunRecursive() {
    if (this.queue !== null && this.queue.length > 0) {
        // sleep for 1 second.
        sleep.usleep(1000000);
        var thisRef = this;
        var nextItem = this.queue.pop();

        if (nextItem) {
            
            if(MinifySite.verbose) console.log(nextItem.src + "->" + nextItem.dest + ", format: " + nextItem.format + ", type: "
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

                var fileTypes = null;
                var ignorePatterns = null;

                ignorePatterns = nextItem.ignore;
                fileTypes = nextItem.include;

                methodToRun(nextItem.src, nextItem.dest, fileTypes, ignorePatterns, function(err, result) {
                    if (thisRef.queue.length > 0) {
                        thisRef.run();
                    }
                });
            }
            else {
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

/**
 * Runs MinifySite
 */
function MSRun() {
    if(MinifySite.verbose) console.log("MinifySite.run() - processing " + this.queue.length + " entries from runner configuration...");
    this.runRecursive();
}

//======================================================================================================================
// XMLMinify implementation
//======================================================================================================================

function XMLMinify(fileTypes, ignorePatterns) {
    
    if (typeof fileTypes !== 'undefined') {
        this.fileTypes = fileTypes;
    }
    else {
        this.fileTypes = '.xml';
    }
    if (typeof ignorePatterns !== 'undefined') {
        this.ignorePatterns = ignorePatterns;
    }
    else {
        this.ignorePatterns = null;
    }

    if(XMLMinify.verbose) console.log("XMLMinify.Construct( includes: " + this.fileTypes + ", ignores: " + this.ignorePatterns + ")");
}
function minifyEachAndEveryXml(src, dist, cbEachOne, cbComplete) {
    if(XMLMinify.verbose) console.log("XMLMinify.minifyEachAndEveryXml(src: " + src + " => dist: " + dist + ")");
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
                    
                    if(XMLMinify.verbose) console.log("\tminifyEachAndEveryXml finished!");
                    
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
    
    if (typeof fileTypes !== 'undefined') {
        this.fileTypes = fileTypes;
    }
    else {
        this.fileTypes = '.html';
    }
    if (typeof ignorePatterns !== 'undefined') {
        this.ignorePatterns = ignorePatterns;
    }
    else {
        this.ignorePatterns = null;
    }

    if(HTMLMinify.verbose) console.log("HTMLMinify.Construct( includes: " + this.fileTypes + ", ignores: " + this.ignorePatterns + ")");
}
function minifyEachAndEveryHtml(src, dist, cbEachOne, cbComplete) {

    if(HTMLMinify.verbose) console.log("JSONMinify.minifyEachAndEveryHtml(src: " + src + " => dist: " + dist + ")");
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
                    if(HTMLMinify.verbose) console.log("\tminifyEachAndEveryHtml finished!");
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
    
    if (typeof fileTypes !== 'undefined') {
        this.fileTypes = fileTypes;
    }
    else {
        this.fileTypes = '.json';
    }
    if (typeof ignorePatterns !== 'undefined') {
        this.ignorePatterns = ignorePatterns;
    }
    else {
        this.ignorePatterns = null;
    }

    if(JSONMinify.verbose) console.log("JSONMinify.Construct(" + this.fileTypes + ", " + this.ignorePatterns + ")");
}
function minifyEachAndEveryJson(src, dist, cbEachOne, cbComplete) {

    if(JSONMinify.verbose) console.log("JSONMinify.minifyEachAndEveryJson(src: " + src + " => dist: " + dist + ")");
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
                    if(JSONMinify.verbose) console.log("\tminifyEachAndEveryJson finished!");
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

    if (typeof fileTypes !== 'undefined') {
        this.fileTypes = fileTypes;
    }
    else {
        this.fileTypes = '.js';
    }
    if (typeof ignorePatterns !== 'undefined') {
        this.ignorePatterns = ignorePatterns;
    }
    else {
        this.ignorePatterns = null;
    }

    if(JSMinify.verbose) console.log("JSMinify.Construct(" + this.fileTypes + ", " + this.ignorePatterns + ")");
}
function minifyAsOneJs(src, distFile, callback) {
    if(JSMinify.verbose) console.log("JSMinify.minifyAsOneJs(" + src + " => " + distFile + ")");
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

    if(JSMinify.verbose) console.log("JSMinify.minifyEachAndEveryJs(src: " + src + " => dist: " + dist + ")");
    
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

                if(JSMinify.verbose) console.log("\tfinished file: " + capture[i]);
                if (cbEachOne != null) {
                    cbEachOne(null, template, mangled);
                }

                if (asyncScope.inFlight == 0) {
                    if(JSMinify.verbose) console.log("\tminifyEachAndEveryJs finished!");
                    if (cbComplete != null) {
                        cbComplete();
                    }
                }
            });
        }
    });
}
