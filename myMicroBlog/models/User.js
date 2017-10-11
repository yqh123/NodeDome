/*
* 定义用户登录和注册的模型类，使用它来操作数据
* */
var mongoose = require('mongoose');
var userSchema = require('../schemas/user');

module.exports = mongoose.model('User', userSchema);