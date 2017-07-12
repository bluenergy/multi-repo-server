const path = require('path');
const fs = require('fs');
const { execInPromise } = require('./exec');
const { workspacePath, projectPath } = require('./config');
const { pathStatus, rmdirSync, copyDir } = require('./fs');

function deployRepository(repository, address, branch, env, buildDirName) {
    // 对应的项目目录
    const workspaceProjectPath = path.resolve(__dirname, '../', './workspace/' + repository);
    // 项目的依赖目录
    const workspaceProjectNodeModulesPath = path.resolve(__dirname, '../', './workspace/' + repository + '/node_modules');

    pathStatus(workspacePath).then(
        function (stat) {
            if (stat.isDirectory()) {
                pathStatus(workspaceProjectPath).then(
                    function (stat) {
                        if (stat.isDirectory()) {
                            //  项目目录存在
                            pull(workspaceProjectPath).then(
                                () => {
                                    return checkBranch(workspaceProjectPath, branch);
                                }
                            ).then(
                                () => {
                                    return pathStatus(workspaceProjectNodeModulesPath).then(
                                        function (stat) {
                                            if (stat.isDirectory()) {
                                                return build(workspaceProjectPath);
                                            }
                                        },
                                        function () {
                                            return install(workspaceProjectPath).then(
                                                () => {
                                                    return build(workspaceProjectPath);
                                                }
                                            );
                                        }
                                    )
                                }
                            ).then(
                                () => {
                                    return deploy(workspaceProjectPath, buildDirName);
                                }
                            )
                        }
                    },
                    function () {
                        // 根目录存在，项目目录不存在
                        clone(workspacePath, address).then(
                            () => {
                                return checkBranch(workspaceProjectPath, branch);
                            }
                        ).then(
                            () => {
                                return install(workspaceProjectPath);
                            }
                        ).then(
                            () => {
                                return build(workspaceProjectPath);
                            }
                        ).then(
                            () => {
                                return deploy(workspaceProjectPath, buildDirName);
                            }
                        )
                    }
                )
            }
        },
        function () {
            // 根目录不存在
            fs.mkdir(workspacePath, function (err) {
                    if (err) {
                        throw err;
                    }
                    clone(workspacePath, address).then(
                        () => {
                            return checkBranch(workspaceProjectPath, branch);
                        }
                    ).then(
                        () => {
                            return install(workspaceProjectPath);
                        }
                    ).then(
                        () => {
                            return build(workspaceProjectPath);
                        }
                    ).then(
                        () => {
                            return deploy(workspaceProjectPath, buildDirName);
                        }
                    )
                }
            );
        }
    )
}

function clone(path, address) {
    console.log('开始clone项目');
    return execInPromise(`cd ${path} && git clone ${address}`);
}
function checkBranch(path, branch) {
    console.log(`开始切换分支,切换到${branch}分支`);
    return execInPromise(`cd ${path} && git checkout ${branch}`);
}
function install(path) {
    console.log('开始安装项目依赖');
    return execInPromise(`cd ${path} && npm install`);
}
function pull(path) {
    console.log('项目存在，开始更新项目');
    return execInPromise(`cd ${path} && git pull`);
}
function build(path, stage) {
    console.log('开始打包');
    const stageArgue = stage ? `:${stage}` : '';
    return execInPromise(`cd ${path} && npm run build${stageArgue}`);
}
function deploy(workspaceProjectPath, buildDirName) {
    console.log('开始部署');

    const buildSrcPath = path.resolve(workspaceProjectPath, `./${buildDirName}`);
    const buildDistPath = path.resolve(projectPath, `./${buildDirName}`);

    return pathStatus(projectPath).then(
        function (stat) {
            if (stat.isDirectory()) {
                pathStatus(buildDistPath).then(
                    function (stat) {
                        if (stat.isDirectory()) {
                            rmdirSync(buildDistPath, function(err) {
                                if (err) throw err;
                                copyDir(buildSrcPath, buildDistPath);
                            })
                        }
                    },
                    function () {
                        copyDir(buildSrcPath, buildDistPath);
                    }
                );
            }
        },
        function () {
            fs.mkdir(projectPath, function (err) {
                if (err) {
                    console.log(err);
                }
                copyDir(buildSrcPath, buildDistPath);
            })
        }
    ).then(
        function () {
            console.log('部署成功');
        }
    );
}

module.exports = {
    deployRepository
};