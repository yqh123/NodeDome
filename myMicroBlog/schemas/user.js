/*
* 定义用户注册和登录的数据结构
* */
var mongoose = require('mongoose');
module.exports = new mongoose.Schema({
    username: String,
    password: String,
    isAdmin: {              // 用户是否为管理员
        type: Boolean,
        default: false
    }
});