const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const app = express();
const { Repository } = require('./backend/index');
const exec = require('./backend/exec');

const deployQueue = [];

app.use(express.static(__dirname));
app.use(bodyParser.json());

// 登陆页面
app.get('/', function (req, res) {
    res.sendFile( __dirname + '/entry/index.html');
});

// 部署请求
app.post('/deploy', function (req, res) {
    if (req.body.project === 'gulp-AngularJS1.x-seed') {
    	const target = deployQueue.find(
    		(repository) => {
    			return repository.repository === 'gulp-AngularJS1.x-seed'
    		}
		);
		console.log(target); 
    	if (target && target.status !== '部署成功') {
    		res.json({message: '正在部署，请稍后'});
    	}
    	if (target && target.status === '部署成功') {
    		const index = deployQueue.findIndex(
	    		(repository) => {
	    			repository.repository === 'gulp-AngularJS1.x-seed'
	    		}
			);
			deployQueue.splice(index, 1);
    		deployQueue.push(new Repository('gulp-AngularJS1.x-seed' , 'https://github.com/hjzheng/gulp-AngularJS1.x-seed.git', req.body.branch, req.body.env, 'build'));
			res.json({message: '上次已经部署成功，开始重新部署'});
    	}
    	if (!target) {
    		deployQueue.push(new Repository('gulp-AngularJS1.x-seed' , 'https://github.com/hjzheng/gulp-AngularJS1.x-seed.git', req.body.branch, req.body.env, 'build'));
			res.json({message: '开始重新部署'});
    	}
    }
});
// 获取部署状态
app.get('/deploy', function (req, res) {
	res.json(deployQueue.map(
		(repository) => {
    		return {
    			url: `localhost:9527/projects/${repository.repository}/${repository.branch}/${repository.buildDirName}`,
    			status: repository.status
    		}
		}
	));
});
app.listen(9527, function () {
    console.log('test app listening on port 9527!')
});