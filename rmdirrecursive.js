const fs = require('fs');

let rmDirRecursive = (path, callback) => {
    fs.readdir(path, (err, files) => {
        if (err) {
            return callback(null, path);
        }

        let length = files.length;
        let count = 0;
        let folderDone = err => {
            if (++count >= length || err) {
                fs.rmdir(path, callback);
            }
        };

        if (!length) {
            folderDone();
        } else {
            for (file of files) {
                let curPath = path + '/' + file;               
                fs.lstat(curPath, (err, stats) => {
                    if (err) {
                        return callback(err, path);
                    }
                    stats.isDirectory() ? rmDirRecursive(curPath, folderDone) : fs.unlink(curPath, folderDone);
                });
            }
        }
    });
};

module.exports = rmDirRecursive;