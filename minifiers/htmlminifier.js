
var FileSystem = require('../utils/filesystem.js').FileSystem;
var htmlminify = require("html-minifier").minify;

HTMLMinifier.prototype.minify = HTMLMinify;

function HTMLMinifier(){
    this.compressorsOpen = 0;
}


function HTMLMinify(fileIn, fileOut, callback) {
    var thisRef = this;
    thisRef.compressorsOpen++;

    console.log("HTMLMinifier.HTMLMinify(" + fileIn + " -> " + fileOut + ")");
    var fileSystem = new FileSystem();
    fileSystem.readFile(fileIn, 'utf8', function(err, data){
        console.log("\tread file: " + fileIn + ", data was: " + data.length + " chars");
        
        var options = {
                removeComments:true,
                removeCommentsFromCDATA:false,
                removeCDATASectionsFromCDATA:false,
                collapseWhitespace:true,
                conservativeCollapse:true,
                preserveLineBreaks:false,
                collapseBooleanAttributes:false,
                removeAttributeQuotes:false,
                removeRedundantAttributes:true,
                preventAttributesEscaping:false,
                useShortDoctype:true,
                removeEmptyAttributes:true,
                removeScriptTypeAttributes:true,
                removeStyleLinkTypeAttributes:true,
                removeOptionalTags:true,
                removeEmptyElements:false,
                keepClosingSlash:true,
                caseSensitive:true,
                minifyJS:true,
                minifyCSS:true,
                minifyURLs:false,
        }
        var minifiedHtml = htmlminify(data, options);
        
        if(minifiedHtml != null && minifiedHtml != ''){
            fileSystem.createFile(fileOut, minifiedHtml, function(err, file){
                console.log("\tcreated file: " + fileOut);
                thisRef.compressorsOpen--;
                
                if(callback != null){
                    callback(err, minifiedHtml);
                }
            });
        }
        else{
            console.log("\tcouldn't minify: " + fileIn);
        }
    });
};

module.exports.HTMLMinifier = HTMLMinifier;