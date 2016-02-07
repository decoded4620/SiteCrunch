
var FileSystem = require('../utils/filesystem.js').FileSystem;
var htmlminify = require("html-minifier").minify;

XMLMinifier.prototype.minify = XMLMinify;

function XMLMinifier(){
    this.compressorsOpen = 0;
}


function XMLMinify(fileIn, fileOut, callback) {
    var thisRef = this;
    thisRef.compressorsOpen++;

    console.log("XMLMinifier.XMLMinify(" + fileIn + " -> " + fileOut + ")");
    var fileSystem = new FileSystem();
    fileSystem.readFile(fileIn, 'utf8', function(err, data){
        console.log("\tread file: " + fileIn + ", data was: " + data.length +  "characters");
        
        thisRef.compressorsOpen--;
        // placeholder
        if(callback != null){
            callback(err, data);
        }
    });
};

module.exports.XMLMinifier = XMLMinifier;