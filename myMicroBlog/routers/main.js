/*
* 项目主页面路由
* */
var express = require('express');
var router = express.Router();
var User = require('../models/user');
var Content = require('../models/content');
var Category = require('../models/Category');

// 处理主页面通用数据
var data = {};
router.use(function(req, res, next){
    data = {
        userInfo: req.userInfo,
        categories: []
    };
    Category.find().sort({_id: 1}).then(function(categories){
        data.categories = categories;
        next()
    })
});

// 渲染导航栏分类和博客内容数据
router.get('/', function(req, res){
    data.category = req.query.category || '';
    data.count = 0;
    data.limit = 3;
    data.pages = 0;
    data.page = Number(req.query.page) || 1;
    var where = {};
    if(data.category){
        where.category = data.category
    }
    Content.where(where).count().then(function(count){
        if(!count){
            res.render('main/index', {
                userInfo: req.userInfo,
                categories: data.categories
            });
            return;
        }
        data.count = count;
        data.pages = Math.ceil( data.count/data.limit );
        data.page = Math.max(1, data.page);
        data.page = Math.min(data.pages, data.page);
        var skips = (data.page-1) * data.limit;
        var usersArray = [];
        usersArray.length= data.pages;
        Content.where(where).find().limit(data.limit).skip(skips).populate(['category','user']).sort({_id: -1}).then(function(contents){
            res.render('main/index', {
                userInfo: req.userInfo,
                categories: data.categories,
                contents: contents,
                categoryid: data.category,
                paths: '',
                usersArray: usersArray,
                count: data.count,
                limit: data.limit,
                pages: data.pages,
                page: data.page
            })
        })
    })
});

// 阅读全文
router.get('/view', function(req, res){
    var id = req.query.contentid || '';
    Content.findOne({
        _id: id
    }).populate(['category','user']).then(function(contents){
        if(!contents){
            res.render('admin/error', {
                userInfo: req.userInfo,
                message: '你要查看的博客内容不存在!'
            })
        }else{
            contents.views++;
            contents.save();
            res.render('main/view', {
                userInfo: req.userInfo,
                categories: data.categories,
                contents: contents
            })
        }
    })
});

module.exports = router;