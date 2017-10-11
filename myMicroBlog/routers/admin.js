/*
 * 项目后台管理模块
 * */
var express = require('express');
var router = express.Router();
var User = require('../models/User');
var Category = require('../models/Category');
var Content = require('../models/content');

// 验证进入这个后台页面的用户信息 验证失败
router.use(function(req, res, next){
    if(!req.userInfo.isAdmin){
        res.send('<h2>对不起你不是管理员，请联系：13786140206</h2><a href="/" style="display:inline-block; padding: 5px 10px; background:#286090; text-decoration:none; color:#fff; border-radius:3px;">返回首页</a>')
    }
    next()
});

// 验证成功 渲染欢迎页面
router.get('/', function(req, res){
    res.render('admin/index',{
        userInfo: req.userInfo
    })
});

// 用户管理页面(显示所有注册用户)
router.get('/user', function(req, res){
    var count = 0,      // 总数据量
        limit = 5,      // 每页显示数据量
        pages = 0,      // 总页数
        page = Number(req.query.page) || 1;     // 当前页

    User.count().then(function(count){
        count = count;
        pages = Math.ceil( count/limit );
        page = Math.max(1, page);
        page = Math.min(pages, page);
        var skips = (page-1) * limit;
        var usersArray = [];
        usersArray.length= pages;
        User.find().limit(limit).skip(skips).sort({_id: -1}).then(function(users){
            res.render('admin/user_index',{
                userInfo: req.userInfo,
                users: users,
                paths: 'user',
                usersArray: usersArray,
                count: count,
                limit: limit,
                pages: pages,
                page: page
            })
        });
    })
});

/*-------------------------------------------------------------------*/

// 分类管理首页
router.get('/category', function(req, res){
    var count = 0,      // 总数据量
        limit = 20,     // 每页显示数据量
        pages = 0,      // 总页数
        page = Number(req.query.page) || 1;     // 当前页

    Category.count().then(function(count){
        if(!count){
            res.render('admin/category_index', {
                userInfo: req.userInfo,
                users: 0
            });
            return;
        }
        count = count;
        pages = Math.ceil( count/limit );
        page = Math.max(1, page);
        page = Math.min(pages, page);
        var skips = (page-1) * limit;
        var usersArray = [];
        usersArray.length= pages;
        Category.find().limit(limit).skip(skips).then(function(users){
            res.render('admin/category_index', {
                userInfo: req.userInfo,
                users: users,
                paths: 'category',
                usersArray: usersArray,
                count: count,
                limit: limit,
                pages: pages,
                page: page
            })
        });
    })
});

// 分类添加
router.get('/category/add', function(req, res){
    res.render('admin/category_add', {
        userInfo: req.userInfo
    })
});

// 添加分类页面post提交
router.post('/category/add', function(req, res){
    var name = req.body.name.trim() || '';
    if(!name){
        res.render('admin/error', {
            userInfo: req.userInfo,
            message: '分类名称不能为空!'
        });
    }
    //数据库中查询是否有已经注册的分类名称
    Category.findOne({
        name: name
    }).then(function(category){
        if(category){
            res.render('admin/error', {
                userInfo: req.userInfo,
                message: '该分类名称已经被注册，请重新填写!'
            });
            return Promise.reject()
        }else{
            return new Category({
                name: name
            }).save();
        }
    }).then(function(newCategory){
        res.render('admin/success', {
            userInfo: req.userInfo,
            url: '/admin/category/add',
            message: '分类添加成功!'
        });
    })
});

// 分类的修改页面
router.get('/category/edit', function(req, res){
    var id = req.query.id || '';
    Category.findOne({
        _id: id
    }).then(function(category){
        if(!category){
            res.render('admin/error', {
                userInfo: req.userInfo,
                message: '该分类信息不存在!'
            })
        }else{
            res.render('admin/category_edit', {
                userInfo: req.userInfo,
                category: category
            })
        }
    });
});

// 分类的删除
router.get('/category/delete', function(req, res){
    var id = req.query.id || '';
    // 要删除的分类id在数据库中是否存在
    Category.findOne({
        _id: id
    }).then(function(rs){
        if(!rs){
            res.render('admin/error',{
                userInfo: req.userInfo,
                message:'分类信息不存在，无法删除这个分类'
            });
            return Promise.reject();
        }else{
            return Category.remove({
                _id: id
            })
        }
    }).then(function(){
        res.render('admin/success',{
            userInfo: req.userInfo,
            message:'分类名称删除成功',
            url:'/admin/category'
        });
    })
});

// 保存分类的修改
router.post('/category/edit', function(req, res){
    var name = req.body.name.trim() || '';
    var id = req.query.id || '';
    if(!name){
        res.render('admin/error',{
            userInfo: req.userInfo,
            message:'修改后的分类名称不能为空!'
        });
        return;
    }
    Category.findOne({
        _id: id
    }).then(function(category){
        if(!category){                      // 该分类信息不存在
            res.render('admin/error',{
                userInfo: req.userInfo,
                message:'该分类信息不存在!'
            });
            return Promise.reject();
        }else{                                // 该分类信息存在
            if(category.name === name){       // 修改后的分类名称和原来的一样
                res.render('admin/success',{
                    userInfo: req.userInfo,
                    message:'分类修改成功!',
                    url: '/admin/category'
                });
                return Promise.reject()
            }else{       // 修改后的分类名称和原来不一样,但和其他分类的数据重名了
                return Category.findOne({
                    _id: {$ne: id},
                    name: name
                })
            }
        }
    }).then(function(sameCategory){
        if(sameCategory){       // 有同名数据
            res.render('admin/error',{
                userInfo: req.userInfo,
                message:'该名称已被使用，请重新输入'
            });
            return Promise.reject()
        }else{                  // 没有同名数据
            return Category.update({
                _id: id
            },{
                name: name
            })
        }
    }).then(function(smallCategory){
        res.render('admin/success',{
            userInfo: req.userInfo,
            message:'分类修改成功!',
            url: '/admin/category'
        });
    })
});

/*-------------------------------------------------------------------*/

// 内容首页
router.get('/content', function(req, res){
    var count = 0,      // 总数据量
        limit = 5,      // 每页显示数据量
        pages = 0,      // 总页数
        page = Number(req.query.page) || 1;     // 当前页

    Content.count().then(function(count){
        if(!count){
            res.render('admin/content_index', {
                userInfo: req.userInfo,
                users: 0
            });
            return;
        }
        count = count;
        pages = Math.ceil( count/limit );
        page = Math.max(1, page);
        page = Math.min(pages, page);
        var skips = (page-1) * limit;
        var usersArray = [];
        usersArray.length= pages;
        Content.find().limit(limit).skip(skips).populate(['category','user']).sort({_id: -1}).then(function(contents){
            res.render('admin/content_index', {
                userInfo: req.userInfo,
                contents: contents,
                paths: 'content',
                usersArray: usersArray,
                count: count,
                limit: limit,
                pages: pages,
                page: page
            })
        });
    })
});

// 内容添加页面
router.get('/content/add', function(req, res){
    Category.find().then(function(category){
        res.render('admin/content_add', {
            userInfo: req.userInfo,
            categories: category
        })
    });
});

// 内容添加页面post提交
router.post('/content/add', function(req, res){
    if(req.body.category ===''){
        res.render('admin/error',{
            userInfo: req.userInfo,
            message:'博客内容分类不能为空'
        });
        return;
    }
    if(req.body.title ===''){
        res.render('admin/error',{
            userInfo: req.userInfo,
            message:'博客标题不能为空'
        });
        return;
    }
    if(req.body.description ===''){
        res.render('admin/error',{
            userInfo: req.userInfo,
            message:'博客简介不能为空'
        });
        return;
    }
    if(req.body.content ===''){
        res.render('admin/error',{
            userInfo: req.userInfo,
            message:'博客内容不能为空'
        });
        return;
    }

    // 保存数据到数据库
    new Content({
        category: req.body.category,
        title: req.body.title,
        description: req.body.description,
        content: req.body.content,
        user: req.userInfo._id.toString()
    }).save().then(function(){
        res.render('admin/success',{
            userInfo: req.userInfo,
            message:'博客内容添加成功',
            url:'/admin/content'
        });
    })
});

// 内容修改页面
router.get('/content/edit', function(req, res){
    var id = req.query.id || '';
    Category.find().then(function(category){
        Content.findOne({
            _id: id
        }).populate('category').then(function(content){
            if(!content){
                res.render('admin/error', {
                    userInfo: req.userInfo,
                    message: '该博客内容不存在!'
                })
            }else{
                res.render('admin/content_edit', {
                    userInfo: req.userInfo,
                    categories: category,
                    content: content
                })
            }
        });
    });
});

// 内容修改页面post提交
router.post('/content/edit', function(req, res){
    var id = req.query.id || '';
    var data = {
        category: req.body.category,
        title: req.body.title,
        description: req.body.description,
        content: req.body.content
    };
    if(data.category ===''){
        res.render('admin/error',{
            userInfo: req.userInfo,
            message:'博客内容分类不能为空'
        });
        return;
    }
    if(data.title ===''){
        res.render('admin/error',{
            userInfo: req.userInfo,
            message:'博客标题不能为空'
        });
        return;
    }
    if(data.description ===''){
        res.render('admin/error',{
            userInfo: req.userInfo,
            message:'博客简介不能为空'
        });
        return;
    }
    if(data.content ===''){
        res.render('admin/error',{
            userInfo: req.userInfo,
            message:'博客内容不能为空'
        });
        return;
    }

    // 修改数据库中的博客内容数据
    Content.update({
        _id: id
    },data).then(function(){
        res.render('admin/success',{
            userInfo: req.userInfo,
            message:'博客内容修改成功',
            url:'/admin/content'
        });
    })
});

// 内容的删除
router.get('/content/delete', function(req, res){
    var id = req.query.id || '';
    // 要删除的分类id在数据库中是否存在
    Content.findOne({
        _id: id
    }).then(function(rs){
        if(!rs){
            res.render('admin/error',{
                userInfo: req.userInfo,
                message:'博客内容不存在，无法删除这个内容'
            });
            return Promise.reject();
        }else{
            return Content.remove({
                _id: id
            })
        }
    }).then(function(){
        res.render('admin/success',{
            userInfo: req.userInfo,
            message:'分类名称删除成功',
            url:'/admin/content'
        });
    })
});


/*-------------------------------------------------------------------*/

module.exports = router;