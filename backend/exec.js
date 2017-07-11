const { exec } = require('child_process');

function execInPromise(cmdLine) {
    return new Promise((resolve, reject) => {
        exec(cmdLine, (error, stdout, stderr) => {
            if (error) {
                reject(stderr);
            } else {
                resolve(stdout);
            }
        });
    });
}

module.exports = {
    execInPromise
};