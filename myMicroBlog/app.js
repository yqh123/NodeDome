/*
* 项目启动的入口文件
*   通过express注册的中间件方法启动和设置我们的web应用，比如use、get、post、set等
* */
var express = require('express');
var swig = require('swig');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var Cookies = require('cookies');
var User = require('./models/User');

var app = express();

// 配置静态文件,让页面正常加载项目中public文件夹下面的所有资源文件
app.use('/public', express.static(__dirname+'/public'));

// 设置bodyParser（设置body-parser，用来处理用户提交过来的数据
app.use(bodyParser.urlencoded({extended:true}));

// 设置cookies
app.use(function(req, res, next){
    req.cookies = new Cookies(req, res);
    req.userInfo = {};
    if( req.cookies.get('userInfo') ){
        try {
            req.userInfo = JSON.parse(req.cookies.get('userInfo'));
            User.findById(req.userInfo._id).then(function(users){
                req.userInfo.isAdmin = Boolean(users.isAdmin);
                next();
            })
        }catch (error){ next()}
    }else{
        next()
    }
});

// 设置模板引擎
app.engine('html', swig.renderFile);
app.set('views', './views');
app.set('view engine', 'html');
swig.setDefaults({cache: false});

// 分模块开发项目
app.use('/', require('./routers/main'));        // 项目主页面模块
app.use('/api', require('./routers/api'));      // 项目所有api请求
app.use('/admin', require('./routers/admin'));  // 项目后台管理模块

// 借助mongoose链接mongodb数据库
mongoose.connect('mongodb://localhost:27017/microBlog', function(err){
    if(err){
        console.log('数据库链接失败')
    }else{
        console.log('数据库链接成功');
        app.listen(8080);   // 设置请求端口
    }
});