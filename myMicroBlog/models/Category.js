/*
 * 定义分类名的模型类，使用它来操作数据
 * */
var mongoose = require('mongoose');
var categorySchema = require('../schemas/category');

module.exports = mongoose.model('Category', categorySchema);