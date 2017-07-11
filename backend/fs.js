const fs = require('fs');
// 检测文件信息
function pathStatus(path) {
    return new Promise((resolve, reject) => {
        fs.stat((path), function (err, stat) {
            if (err) {
                reject(err);
            } else {
                resolve(stat);
            }
        });
    });
}
// 删除目录
function rmdirSync(dir,cb){
    cb = cb || function(){};
    let dirs = [];

    try{
        _iterator(dir,dirs);
        for(let i = 0, el ; el = dirs[i++];){
            fs.rmdirSync(el);//一次性删除所有收集到的目录
        }
        cb()
    }catch(e){//如果文件或目录本来就不存在，fs.statSync会报错，不过我们还是当成没有异常发生
        e.code === "ENOENT" ? cb() : cb(e);
    }
    function _iterator(url,dirs){
        let stat = fs.statSync(url);
        if(stat.isDirectory()){
            dirs.unshift(url);//收集目录
            _inner(url,dirs);
        }else if(stat.isFile()){
            fs.unlinkSync(url);//直接删除文件
        }
    }
    function _inner(path,dirs){
        let arr = fs.readdirSync(path);
        for(let i = 0, el ; el = arr[i++];){
            _iterator(path+"/"+el,dirs);
        }
    }
}
// 复制目录
function copyDir(src, dist, callback) {
    fs.access(dist, function(err){
        if(err){
            // 目录不存在时创建目录
            fs.mkdirSync(dist);
        }
        _copy(null, src, dist);
    });

    function _copy(err, src, dist) {
        if(err){
            callback(err);
        } else {
            fs.readdir(src, function(err, paths) {
                if(err){
                    callback(err)
                } else {
                    paths.forEach(function(path) {
                        let _src = src + '/' +path;
                        let _dist = dist + '/' +path;
                        fs.stat(_src, function(err, stat) {
                            if(err){
                                callback(err);
                            } else {
                                // 判断是文件还是目录
                                if(stat.isFile()) {
                                    fs.writeFileSync(_dist, fs.readFileSync(_src));
                                } else if(stat.isDirectory()) {
                                    // 当是目录是，递归复制
                                    copyDir(_src, _dist, callback)
                                }
                            }
                        })
                    })
                }
            })
        }
    }
}
module.exports = {
    copyDir,
    rmdirSync,
    pathStatus
};