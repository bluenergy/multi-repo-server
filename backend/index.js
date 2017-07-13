const path = require('path');
const fs = require('fs');
const { execInPromise } = require('./exec');
const { workspacePath, projectPath } = require('./config');
const { pathStatus, rmdirSync, copyDir } = require('./fs');

function Repository(repository, address, branch, env, buildDirName) {
    this.repository = repository;
    this.address = address;
    this.branch = branch;
    this.env = env;
    this.buildDirName = buildDirName;
    this.status = '尚未开始';

    this.init();
}

Repository.prototype.init = function() {
    const repository = this.repository;
    const address = this.address;
    const branch = this.branch;
    const env = this.env;
    const buildDirName = this.buildDirName;

    // 对应的项目主目录
    const workspaceProjectPath = path.resolve(__dirname, '../', './workspace/' + repository);
    // 分支目录
    const workspaceProjectBranchPath = path.resolve(workspaceProjectPath, `./${branch}`);
    //  分支仓库目录
    const workspaceProjectBranchGitPath = path.resolve(workspaceProjectBranchPath, `./${repository}`);
    // 项目的依赖目录
    const workspaceProjectNodeModulesPath = path.resolve(workspaceProjectBranchGitPath, './node_modules');

    pathStatus(workspacePath).then(
        (stat) => {
            if (stat.isDirectory()) {
                //  根目录存在
                pathStatus(workspaceProjectPath).then(
                    (stat) => {
                        if (stat.isDirectory()) {
                            //  项目主目录存在
                            pathStatus(workspaceProjectBranchPath).then(
                                (stat) => {
                                    if (stat.isDirectory()) {
                                        // 分支目录存在
                                        this.pull(workspaceProjectBranchGitPath).then(
                                            () => {
                                                return this.checkBranch(workspaceProjectBranchGitPath, branch);
                                            }
                                        ).then(
                                            () => {
                                                return pathStatus(workspaceProjectNodeModulesPath).then(
                                                    (stat) => {
                                                        if (stat.isDirectory()) {
                                                            return this.build(workspaceProjectBranchGitPath);
                                                        }
                                                    },
                                                    () =>{
                                                        return this.install(workspaceProjectBranchGitPath).then(
                                                            () => {
                                                                return this.build(workspaceProjectBranchGitPath);
                                                            }
                                                        );
                                                    }
                                                )
                                            }
                                        ).then(
                                            () => {
                                                return this.deploy(workspaceProjectBranchGitPath, repository, branch, buildDirName);
                                            }
                                        )
                                    }
                                },
                                ()  => {
                                    //  项目目录存在，分支目录不存在
                                    fs.mkdir(workspaceProjectBranchPath, (err) => {
                                            if (err) {
                                                throw err;
                                            }
                                            this.clone(workspaceProjectBranchPath, address).then(
                                                () => {
                                                    return this.checkBranch(workspaceProjectBranchGitPath, branch);
                                                }
                                            ).then(
                                                () => {
                                                    return this.install(workspaceProjectBranchGitPath);
                                                }
                                            ).then(
                                                () => {
                                                    return this.build(workspaceProjectBranchGitPath);
                                                }
                                            ).then(
                                                () => {
                                                    return this.deploy(workspaceProjectBranchGitPath, repository, branch, buildDirName);
                                                }
                                            )
                                        }
                                    );
                                }
                            )
                        }
                    },
                    () => {
                        // 根目录存在，项目目录不存在
                        fs.mkdir(workspaceProjectPath, (err) => {
                            if (err) {
                                throw err;
                            }
                            fs.mkdir(workspaceProjectBranchPath, (err) => {
                                if (err) {
                                    throw err;
                                }
                                this.clone(workspaceProjectBranchPath, address).then(
                                    () => {
                                        return this.checkBranch(workspaceProjectBranchGitPath, branch);
                                    }
                                ).then(
                                    () => {
                                        return this.install(workspaceProjectBranchGitPath);
                                    }
                                ).then(
                                    () => {
                                        return this.build(workspaceProjectBranchGitPath);
                                    }
                                ).then(
                                    () => {
                                        return this.deploy(workspaceProjectBranchGitPath, repository, branch, buildDirName);
                                    }
                                )
                            })
                        })
                    }
                )
            }
        },
        () => {
            // 根目录不存在
            fs.mkdir(workspacePath, (err) => {
                    if (err) {
                        throw err;
                    }
                    fs.mkdir(workspaceProjectPath, (err) => {
                        if (err) {
                            throw err;
                        }
                        fs.mkdir(workspaceProjectBranchPath, (err) => {
                            if (err) {
                                throw err;
                            }
                            this.clone(workspaceProjectBranchPath, address).then(
                                () => {
                                    return this.checkBranch(workspaceProjectBranchGitPath, branch);
                                }
                            ).then(
                                () => {
                                    return this.install(workspaceProjectBranchGitPath);
                                }
                            ).then(
                                () => {
                                    return this.build(workspaceProjectBranchGitPath);
                                }
                            ).then(
                                () => {
                                    return this.deploy(workspaceProjectBranchGitPath, repository, branch, buildDirName);
                                }
                            )
                        })
                    })
                }
            );
        }
    )
}

Repository.prototype.clone = function(path, address) {
    console.log('开始clone项目');
    this.status = '开始clone项目';
    return execInPromise(`cd ${path} && git clone ${address}`);
}
Repository.prototype.checkBranch = function(path, branch) {
    console.log(`开始切换分支,切换到${branch}分支`);
    this.status = `开始切换分支,切换到${branch}分支`;
    return execInPromise(`cd ${path} && git checkout ${branch}`);
}
Repository.prototype.install = function(path) {
    console.log('开始安装项目依赖');
    this.status = '开始安装项目依赖';
    return execInPromise(`cd ${path} && npm install`);
}
Repository.prototype.pull = function(path) {
    console.log('项目存在，开始更新项目');
    this.status = '项目存在，开始更新项目';
    return execInPromise(`cd ${path} && git pull`);
}
Repository.prototype.build = function(path, stage) {
    console.log('开始打包');
    this.status = '开始打包';
    const stageArgue = stage ? `:${stage}` : '';
    return execInPromise(`cd ${path} && npm run build${stageArgue}`);
}
Repository.prototype.deploy = function(workspaceProjectBranchGitPath, repository, branch, buildDirName) {
    console.log('开始部署');
    this.status = '开始部署';
    const buildSrcPath = path.resolve(workspaceProjectBranchGitPath, `./${buildDirName}`);
    const buildDistPath = path.resolve(projectPath, `./${repository}`);
    const buildDistBranchPath = path.resolve(buildDistPath, `./${branch}`);
    const buildDistDirPath = path.resolve(buildDistBranchPath, `./${buildDirName}`);

    return pathStatus(projectPath).then(
        function (stat) {
            if (stat.isDirectory()) {
                //  服务地址存在
                pathStatus(buildDistPath).then(
                    function (stat) {
                        if (stat.isDirectory()) {
                            //  服务项目存在
                            pathStatus(buildDistBranchPath).then(
                                function (stat) {
                                    if (stat.isDirectory()) {
                                        rmdirSync(buildDistDirPath, function(err) {
                                            if (err) throw err;
                                            copyDir(buildSrcPath, buildDistDirPath);
                                        })
                                    }
                                },
                                function () {
                                    fs.mkdir(buildDistBranchPath, function(err) {
                                        if (err) throw err;
                                        copyDir(buildSrcPath, buildDistDirPath);
                                    })
                                }
                            );
                        }
                    },
                    function () {
                        //  服务项目不存在
                        fs.mkdir(buildDistPath, function(err) {
                            if (err) throw err;
                            fs.mkdir(buildDistBranchPath, function(err) {
                                if (err) throw err;
                                copyDir(buildSrcPath, buildDistDirPath);
                            })
                        })
                    }
                );
            }
        },
        function () {
            fs.mkdir(projectPath, function (err) {
                if (err) {
                    console.log(err);
                }
                fs.mkdir(buildDistPath, function(err) {
                    if (err) throw err;
                    fs.mkdir(buildDistBranchPath, function(err) {
                        if (err) throw err;
                        copyDir(buildSrcPath, buildDistDirPath);
                    })
                })
            })
        }
    ).then(
        () => {
            console.log('部署成功');
            this.status = '部署成功';
        }
    );
}

module.exports = {
    Repository
};