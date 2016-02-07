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

// FileSystem.createFile(filePath, encoding, callback)
//      @param filePath
//      @param encoding  (default 'utf8')
//      @param callback
FileSystem.prototype.readFile = FSReadFile;

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

function FileSystem() {

    this.config = {
        isWin : /^win/.test(process.platform),
        isOsX : process.platform === 'darwin',
        isNix : (process.platform === 'linux'),
        pathSep : path.sep
    };

}

function FSReadDir(dirPath, callback){
    console.log("FileSystem.readDir (" + dirPath + ")");
    
    fs.readdir(dirPath, function(err, files) {
        if (err) {
            console.log("Error: " + err);
        }

        if (callback != null) {
            callback(err, files);
        }
    });
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
    //    console.log("FileSystem.readFile(" + filePath + ", " + encoding + ")");

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
        return false;
    }
    else {
        if (this.config.isWin) {
            if (filePath.length > 2) {

                // check to see if there is a drive letter and colon
                var drive = filePath.substring(0, 3);
                var pathSep = this.getPathSep();

                if (drive.charAt(1) === ':' && drive.charAt(2) === pathSep) {
                    //test it
                    if (this.dirExists(drive)) {
                        return false;
                    }
                }
                else {
                    return true;
                }
            }
        }
        if (filePath === this.getPathSep()) {
            return false;
        }
        else {
            var firstChar = filePath.charAt(0);
            if (firstChar === '\\' || firstChar === '/') {
                return false;
            }

            return true;
        }
    }
}
/**
 * 
 */
function FSGetPathSeparator() {
    if (this.config.isWin) {
        return '\\';
    }
    else if (this.config.isOsx || this.config.isNix) {
        return '/';
    }

    // default to *nix system.
    return '/';
}

/**
 * 
 */
function FSGetFileType(filePath, includeDelimiter) {
    var ext = path.extname(filePath);
    if (!includeDelimiter) {
        ext = ext.substring(1, ext.length);
    }
    //    console.log("FileSystem.getFileType(" + filePath + ") - " + ext);
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
    //    console.log("FileSystem.getFileDir(" + filePath + ") - " + dirPath);
    return dirPath;
}

/**
 * Returns true if filePath exists
 */
function FSFileExists(filePath) {
    // Query the entry
    stats = fs.lstatSync(filePath);
    // Is it a directory?
    var exists = statis.isFile() && !stats.isDirectory();
    //    console.log("FileSystem.fileExists(" + filePath + ") - " + exists);
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
    //    console.log("FileSystem.dirExists(" + dirPath + ") - " + exists);
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

    //    console.log("FScreateFile(" + filePath + ") - directory: " + dirPath);
    try {
        // Query the entry
        stats = fs.lstatSync(filePath);
        // Is it a directory?
        makeDir = !stats.isDirectory();
    }
    catch (e) {
        makeDir = true;
    }

    if (makeDir) {
        fsExtra.mkdirp(dirPath, function(err) {
            if (!err) {
                var fd = fs.openSync(filePath, 'w');

                fs.writeFile(filePath, fileContent, function(err) {
                    if (callback != null) {
                        callback(err, filePath);
                    }
                });
            }
            else {
                if (callback != null) {
                    callback(err, filePath);
                }
            }
        });
    }
    else {
        fs.writeFile(filePath, fileContent, function(err) {
            if (callback != null) {
                callback(err, filePath);
            }
        });
    }
}

// Export this so it can be require()'d.
module.exports.FileSystem = FileSystem;
