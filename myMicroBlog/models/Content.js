/*
 * 定义博客内容的模型类，使用它来操作数据
 * */
var mongoose = require('mongoose');
var contentSchema = require('../schemas/content');

module.exports = mongoose.model('Content', contentSchema);