var compressor = require('node-minify');

// ======================================================================================================================
// JSMinifier implementation
// ======================================================================================================================
JSMinifier.prototype.minify = JSminify;
function JSMinifier() {
    this.compressorsOpen = 0;
}

function JSminify(filesIn, fileOut, callback) {
    var thisRef = this;
    thisRef.compressorsOpen++;

    if (typeof filesIn === 'string') {
        console.log("JSMinifier.minify(" + filesIn + " -> " + fileOut + ")");
    }
    else {
        console.log("JSMinifier.minify( " + filesIn.length + " files, -> " + fileOut + ")");
    }
    // Array
    new compressor.minify({
        type : 'gcc',
        fileIn : filesIn,
        fileOut : fileOut,
        callback : function(err, min) {

            thisRef.compressorsOpen--;

            if (err) {
                console.log(err);
            }
            else if (thisRef.compressorsOpen > 0) {
                console.log("\tminify complete, " + thisRef.compressorsOpen + " still in progress");
            }
            else {
                if (callback != null) {
                    callback();
                }
            }
        }
    });
};

module.exports.JSMinifier = JSMinifier;