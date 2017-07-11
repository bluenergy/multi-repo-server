const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const app = express();
const scripts = require('./backend/index');

app.use(express.static(__dirname));
app.use(bodyParser.json());

// 登陆页面
app.get('/', function (req, res) {
    res.sendFile( __dirname + '/entry/index.html');
});

// 部署请求
app.post('/deploy', function (req, res) {
    if (req.body.project === '阿里b版') {
        scripts.deployRepository('gulp-AngularJS1.x-seed' , 'https://github.com/hjzheng/gulp-AngularJS1.x-seed.git', req.body.branch, req.body.env, 'build');
        res.status(200).end();
    }
});

app.listen(9527, function () {
    console.log('test app listening on port 9527!')
});