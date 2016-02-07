var FileSystem = require('../utils/filesystem.js').FileSystem;
//======================================================================================================================
//Crawler implementation
//======================================================================================================================

Crawler.prototype.crawl = crawl;
Crawler.verbose = false;
function Crawler(fileTypes, ignorePatterns) {
    this.fileTypes      = null;
    this.ignorePatterns = null;
    
    if(Crawler.verbose) console.log("Crawler.Construct(" + fileTypes + ", " + ignorePatterns + ")");
    
    if(fileTypes !== null){
        if(typeof fileTypes === 'string'){
            this.fileTypes  = [fileTypes];
        }
        else if(typeof fileTypes === 'object'){
            this.fileTypes  = fileTypes;
        }
        else{
            this.fileTypes  = [];
        }
    }
    
    
    if(ignorePatterns !== null){
        if(typeof ignorePatterns === 'string'){
            this.ignorePatterns  = [ignorePatterns];
        }
        else if(typeof ignorePatterns === 'object'){
            this.ignorePatterns  = ignorePatterns;
        }
        else{
            this.ignorePatterns  = [];
        }
    }
    
    if(Crawler.verbose) console.log("Crawler.Construct( includes: " + this.fileTypes + ", ignores: " + this.ignorePatterns + ")");
    this.depth          = 0;
    this.crawlersOpen   = 0;
    
    // reusable object to read information about
    // files we're crawling.
    this.fileSystem     = new FileSystem();
}

/**
* Crawl a directory and get a list of all file urls within
*/
function crawl(d, capture, callback) {
 var thisRef = this;
 
 if(this.crawlersOpen == 0){
     if(Crawler.verbose) console.log("Crawler.crawl() - capturing files in and below > " + d);
 }
 thisRef.crawlersOpen++;

 this.fileSystem.readDir(d, function(err, files) {
     if (err) {
         if(Crawler.verbose) console.log("Error: " + err);
         thisRef.crawlersOpen--;

         if (thisRef.crawlersOpen == 0) {
             if (callback != null) {
                 callback();
             }
         }
         throw err;
     }

     // fix any directory sadness
     if(d.charAt(d.length-1) !== '/'){
         d = d + '/';
     }
     
     var ftLen = thisRef.fileTypes == null ? 0 : thisRef.fileTypes.length;
     var fLen = files === null ? 0 : files.length;
     
     if(Crawler.verbose) console.log("\tchecking " + fLen + " files for capture");
     for (var i = 0; i < fLen; ++i) {
         var f = files[i];
         
         // fix any filename sadness
         if(f.charAt(0) === '/'){
             f = f.substring(1, f.length);
         }
         
         // get the file type including the delimiter
         var currPath = d + f;
         var isDir = thisRef.fileSystem.dirExists(currPath);
         if(isDir == true){
             if(Crawler.verbose) console.log("\tdirectory found, crawling children...");
             thisRef.crawl(currPath, capture, callback);
         }
         else {
             if(Crawler.verbose) console.log("\tfile found, capturing: " + currPath);
             
             var fileType = thisRef.fileSystem.getFileType(currPath, true);
             
             if(Crawler.verbose) console.log("\t\t type is: " + fileType + ", check file types: " + thisRef.fileTypes + ", ignorePatterns: " + thisRef.ignorePatterns + "("+thisRef.ignorePatterns+")" );
             // if file types were included
             // insure that we support this time for the crawl.
             if(thisRef.ignorePatterns != null){
                 for(var j = 0; j < thisRef.ignorePatterns.length; ++j){
                     var p = thisRef.ignorePatterns[j];
                     
                     if(currPath.indexOf(p) != -1){
                         if(Crawler.verbose) console.log("\tignore pattern " + p + " matched " + currPath + " so skipping file!");
                         continue;
                     }
                 }
             }
             
             if(ftLen > 0){
                 if(thisRef.fileTypes != null && thisRef.fileTypes.indexOf(fileType) == -1){
                     if(Crawler.verbose) console.log("\ttype: " + fileType + "not supported for this crawler");
                     continue;
                 }
             }
             
             capture[capture.length] = currPath;
         }
     }

     thisRef.crawlersOpen--;

     if(Crawler.verbose) console.log("\tcaptured: " + capture.length + " files, crawlers open: " + thisRef.crawlersOpen);
     if (thisRef.crawlersOpen == 0) {
         if (callback != null) {
             callback();
         }
     }
 });
};

module.exports.Crawler = Crawler;