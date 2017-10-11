/*
 * 用户注册和登录主页面api请求
 * */
var express = require('express');
var router = express.Router();
var User = require('../models/User');
var Content = require('../models/content');

// 设置用户登录和注册请求的返回信息
var returnResponseData;
router.use(function(req, res, next){
    returnResponseData = {
        code: 0,
        message: ''
    };
    next()
});

// 用户注册
router.post('/user/register', function(req, res){
    var username = req.body.username || '';
    var password = req.body.password || '';
    var repassword = req.body.repassword || '';

    // 使用用户模型类User去查询用户是否已经存在
    User.findOne({
        username: username
    }).then(function(userInfo){
        if(userInfo){
            returnResponseData.code = 4;
            returnResponseData.message = '该用户名已经注册!';
            res.json(returnResponseData);
            return;
        }
        // 判断用户提交过来的注册用户数据，并进行处理
        if(!username.trim()){
            returnResponseData.code = 1;
            returnResponseData.message = '用户不能为空!';
            res.json(returnResponseData);
            return;
        }
        if(!password.trim()){
            returnResponseData.code = 2;
            returnResponseData.message = '密码不能为空!';
            res.json(returnResponseData);
            return;
        }
        if( password != repassword ){
            returnResponseData.code = 3;
            returnResponseData.message = '两次密码输入不一致!';
            res.json(returnResponseData);
            return;
        }

        // 注册成功 做以下处理
        var user = new User({
            username: username,
            password: password
        });
        return user.save()
    }).then(function(newUserInfo){
        returnResponseData.message = '恭喜你，注册成功!';
        res.json(returnResponseData);
    })
});

// 用户登录
router.post('/user/login', function(req, res){
    var username = req.body.username || '';
    var password = req.body.password || '';

    // 判断用户提交过来的注册用户数据，并进行处理
    if(!username.trim() || !password.trim()){
        returnResponseData.code = 1;
        returnResponseData.message = '用户名和密码不能为空!';
        res.json(returnResponseData);
        return;
    }
    // 查询用户名和密码是否在数据库中，如果存在则返回数据给前端页面
    User.findOne({
        username: username,
        password: password
    }).then(function(userInfo){
        // 用户名和密码和数据库匹配 不成功
        if(!userInfo){
            returnResponseData.code = 2;
            returnResponseData.message = '用户名或密码错误!';
            res.json(returnResponseData);
            return
        }
        // 登录成功设置cookies
        req.cookies.set('userInfo', JSON.stringify({
            _id: userInfo._id,
            username: userInfo.username
        }));
        returnResponseData.userInfo = {
            _id: userInfo._id,
            username: userInfo.username
        };
        returnResponseData.message = '登录成功!';
        res.json(returnResponseData);
    })
});

// 用户退出
router.get('/user/logout', function(req, res){
    req.cookies.set('userInfo', null);
    returnResponseData.message = '退出成功!';
    res.json(returnResponseData);
});

// 用户评论提交
router.post('/comment/post', function(req, res){
    var id = req.body.contentid || '';
    var postData = {
        contentid: id,
        username: req.userInfo.username,
        addTime: new Date(),
        content: req.body.content
    };
    if(!postData.content.trim()){
        returnResponseData.message = '评论内容不能为空!';
        res.json(returnResponseData);
        return
    }
    // 查询这篇博客内容
    Content.findOne({
        _id: id
    }).populate(['category','user']).then(function(contents){
        contents.comments.push(postData);
        return contents.save()
    }).then(function(newContent){
        returnResponseData.message = '评论提交成功!';
        returnResponseData.commentList = newContent.comments;
        res.json(returnResponseData);
    })
});

// 获取用户评论数据
router.get('/comment/loder', function(req, res){
    var id = req.query.contentid || '';
    // 查询这篇博客内容
    Content.findOne({
        _id: id
    }).populate(['category','user']).then(function(contents){
        returnResponseData.message = '评论内容获取成功!';
        returnResponseData.commentList = contents;
        res.json(returnResponseData);
    })
});


module.exports = router;