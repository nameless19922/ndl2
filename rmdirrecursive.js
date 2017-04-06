const 
    fs = require('fs');

let rmDirRecursive = (path, callback) => {
    fs.readdir(path, function(err, files) {
        if (err) {
            return callback(null, path);
        }

        let wait = files.length;
        let count = 0;
        let folderDone = function(err) {
            count++;
            if (count >= wait || err) {
                fs.rmdir(path, callback);
            }
        };

        if (!wait) {
            return folderDone();
        }

        files.forEach(function(file) {
            let curPath = path + '/' + file;

            fs.lstat(curPath, function(err, stats) {
                if (err) {
                    return callback(err, path);
                }
                if (stats.isDirectory()) {
                    rmDirRecursive(curPath, folderDone);
                } else {
                    fs.unlink(curPath, folderDone);
                }
            });
        });
    });
};

module.exports = rmDirRecursive;