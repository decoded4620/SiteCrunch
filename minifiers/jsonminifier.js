
var FileSystem = require('../utils/filesystem.js').FileSystem;
var jsonminifyFunc = require("jsonminify");

JSONMinifier.prototype.minify = JSONminify;

function JSONMinifier(){
    this.compressorsOpen = 0;
}


function JSONminify(fileIn, fileOut, callback) {
    var thisRef = this;
    thisRef.compressorsOpen++;

    console.log("JSONMinifier.JSONminify(" + fileIn + " -> " + fileOut + ")");
    var fileSystem = new FileSystem();
    fileSystem.readFile(fileIn, 'utf-8', function(err, data){
        console.log("\tread file: " + fileIn + ", data was: " + data.length + " chars");
        var minifiedJson = jsonminifyFunc(data);
        
        if(minifiedJson != null && minifiedJson != ''){
            fileSystem.createFile(fileOut, minifiedJson, function(err, file){
                thisRef.compressorsOpen--;
                
                if(callback != null){
                    callback(err, minifiedJson);
                }
            });
        }
        else{
            console.log("\tcouldn't minify: " + fileIn);
        }
    });
};

module.exports.JSONMinifier = JSONMinifier;