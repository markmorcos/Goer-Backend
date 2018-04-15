var fs = require('fs')

exports.delete = function(file) {
    if (fs.existsSync(file)) fs.unlink(file)
}

exports.move = function(oldPath, newPath) {
    fs.renameSync(oldPath, newPath)
}

exports.mkdir = function(path) {
    path.split('/').reduce(function(currentPath, folder) {
        currentPath += folder + '/'
        if (!fs.existsSync(currentPath)) fs.mkdirSync(currentPath)
        return currentPath
    }, '')
}

exports.rmdir = function(path) {
    if (fs.existsSync(path)) {
        fs.readdirSync(path).forEach(function(file, index) {
            var curPath = path + '/' + file
            if (fs.lstatSync(curPath).isDirectory()) {
                deleteFolderRecursive(curPath)
            } else {
                fs.unlinkSync(curPath)
            }
        })
        fs.rmdirSync(path)
    }
}
