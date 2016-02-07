var fs = require('fs');
var fsExtra = require('fs-extra');
var path = require('path');

// =====================================================================================================================
// FileSystem implementation
// =====================================================================================================================

// FileSystem.createFile(filePath, fileContent, callback)
//      @param filePath
//      @param fileContent
//      @param callback
FileSystem.prototype.createFile = FSCreateFile;

// FileSystem.readFile(filePath, encoding, callback)
//      @param filePath
//      @param encoding  (default 'utf8')
//      @param callback
FileSystem.prototype.readFile = FSReadFile;

// FileSystem.readFileSync(filePath, encoding)
//      @param filePath
//      @param encoding  (default 'utf8')
FileSystem.prototype.readFileSync = FSReadFileSync;

// FileSystem.createFile(filePath, encoding, callback)
//      @param dirPath
//      @param callback
FileSystem.prototype.readDir = FSReadDir;

// FileSystem.getFileDir(filePath)
//      @param filePath
FileSystem.prototype.getFileDir = FSGetFileDir;

// FileSystem.getFileType(filePath, includeDelimiter)
//      @param filePath
//      @param includeDelimiter
FileSystem.prototype.getFileType = FSGetFileType;

// FileSystem.fileExists(filePath)
//      @param filePath
FileSystem.prototype.fileExists = FSFileExists;

// FileSystem.dirExists(dirPath)
//      @param dirPath
FileSystem.prototype.dirExists = FSDirectoryExists;

// FileSystem.getPathSep()
FileSystem.prototype.getPathSep = FSGetPathSeparator;

// FileSystem.isRelativePath(dirPath)
//      @param filePath
FileSystem.prototype.isRelativePath = FSIsRelativePath;

// Used for console logging.
FileSystem.verbose = false;

/**
 * Constructor
 */
function FileSystem() {

    if(FileSystem.verbose) console.log("FileSystem.Construct()");
    
    this.config = {
        isWin : /^win/.test(process.platform),
        isOsX : process.platform === 'darwin',
        isNix : (process.platform === 'linux'),
        pathSep : path.sep
    };

}

function FSReadDir(dirPath, callback){
    if(FileSystem.verbose) console.log("FileSystem.readDir (" + dirPath + ")");
    
    fs.readdir(dirPath, function(err, files) {
        if (err) {
            console.log("Error: " + err);
        }

        if (callback != null) {
            callback(err, files);
        }
    });
}

function FSReadFileSync(filePath, encoding){
    if(FileSystem.verbose) console.log("FileSystem.readFile(" + filePath + ", " + encoding + ")");

    encoding = encoding || 'utf8';

    return fs.readFileSync(filePath, encoding);
}

/**
 * Read a File Contents from the file system.
 * 
 * @param filePath
 * @param encoding
 * @param callback
 * @returns
 */
function FSReadFile(filePath, encoding, callback) {
    if(FileSystem.verbose) console.log("FileSystem.readFile(" + filePath + ", " + encoding + ")");

    encoding = encoding || 'utf8';

    fs.readFile(filePath, encoding, function(err, data) {
        if (callback != null) {
            if (err) {
                console.log(err);
            }
            callback(err, data);
        }
    });
}

function FSIsRelativePath(filePath) {
    if (filePath === '' || filePath === null) {
        if(FileSystem.verbose) console.log("FileSystem.isRelativePath(" + filePath + ") - no path");
        return false;
    }
    else {
        if(FileSystem.verbose) console.log("FileSystem.isRelativePath(" + filePath + ")");
        
        if (this.config.isWin) {
            if (filePath.length > 2) {

                // check to see if there is a drive letter and colon
                var drive = filePath.substring(0, 3);
                var pathSep = this.getPathSep();

                // if the drive letter is valid
                if (drive.charAt(1) === ':' && drive.charAt(2) === pathSep) {
                    //test it
                    if (this.dirExists(drive)) {
                        if(FileSystem.verbose) console.log("\tdrive is valid: " + drive);
                        return false;
                    }
                }
                
                // on windows, if you type cd '/', it will go to the root of the current drive automatically
                // so we can keep going if we reach this point and do the checks below.
            }
        }
        
        if (filePath === this.getPathSep()) {
            if(FileSystem.verbose) console.log("\troot path!");
            return false;
        }
        else {
            var firstChar = filePath.charAt(0);
            if ( firstChar === '/') {
                if(FileSystem.verbose) console.log("*nix absolute path");
                return false;
            }

            return true;
        }
    }
}
/**
 * Returns the proper separator for the current platform.
 */
function FSGetPathSeparator() {
    // default to *nix system.
    var sep = '/';
    if (this.config.isWin) {
        sep = '\\';
    }
    else if (this.config.isOsx || this.config.isNix) {
        sep = '/';
    }
    if(FileSystem.verbose) console.log("FileSystem.getPathSep() - " + sep);
    return sep;
}

/**
 * 
 */
function FSGetFileType(filePath, includeDelimiter) {
    var ext = path.extname(filePath);
    if (!includeDelimiter) {
        ext = ext.substring(1, ext.length);
    }
    if(FileSystem.verbose) console.log("FileSystem.getFileType(" + filePath + ") - " + ext);
    return ext;
}

/**
 * Returns the parent directory of filePath
 */
function FSGetFileDir(filePath) {

    var dirPath = null;
    //note this is cross platform
    var sepIndex = filePath.lastIndexOf('/');

    if (sepIndex == -1) {
        sepIndex = filePath.lastIndexOf('\\');
    }

    if (sepIndex > -1) {
        dirPath = filePath.substring(0, sepIndex + 1);
    }
    else {
        dirPath = this.getPathSep();
    }
    if(FileSystem.verbose) console.log("FileSystem.getFileDir(" + filePath + ") - " + dirPath);
    return dirPath;
}

/**
 * Returns true if filePath exists
 */
function FSFileExists(filePath) {
    // Query the entry
    stats = fs.lstatSync(filePath);
    // Is it a directory?
    var exists = stats.isFile() && !stats.isDirectory();
    if(FileSystem.verbose) console.log("FileSystem.fileExists(" + filePath + ") - " + exists);
    return exists;
}

/**
 * Returns true if the directory at dirPath exists
 */
function FSDirectoryExists(dirPath) {
    // Query the entry
    stats = fs.lstatSync(dirPath);
    // Is it a directory?
    var exists = stats.isDirectory();
    if(FileSystem.verbose) console.log("FileSystem.dirExists(" + dirPath + ") - " + exists);
    return exists;
}

/**
 * Async Create File
 * 
 * @param filePath
 * @param fileContent
 * @param callback
 */
function FSCreateFile(filePath, fileContent, callback) {
    var dirPath = this.getFileDir(filePath);
    var makeDir = false;

    if(FileSystem.verbose) console.log("FileSystem.createFile(" + filePath + ") - directory: " + dirPath);
    try {
        // Query the entry
        stats = fs.lstatSync(filePath);
        // Is it a directory?
        makeDir = !stats.isDirectory();
        
        if(FileSystem.verbose) console.log("\tneeds to make directory? " + (makeDir ? 'true' : 'false'));
    }
    catch (e) {
        makeDir = true;
    }

    if (makeDir) {
        fsExtra.mkdirp(dirPath, function(err) {
            if (!err) {
                var fd = fs.openSync(filePath, 'w');

                fs.writeFile(filePath, fileContent, function(err) {
                    
                    if(FileSystem.verbose) console.log("\tfile " + filePath + " created!");
                    
                    if (callback != null) {
                        callback(err, filePath);
                    }
                });
            }
            else {
                
                if(FileSystem.verbose) console.log("\tfailed to create directory: " + dirPath);
                
                if (callback != null) {
                    callback(err, filePath);
                }
            }
        });
    }
    else {
        fs.writeFile(filePath, fileContent, function(err) { 
            if(!err){
                if(FileSystem.verbose) console.log("\tfile " + filePath + " created!");
            }
            else{
                console.log(err);
            }
            if (callback != null) {
                callback(err, filePath);
            }
        });
    }
}

// Export this so it can be require()'d.
module.exports.FileSystem = FileSystem;
