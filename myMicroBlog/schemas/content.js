/*
 * 定义博客内容的数据结构
 * */
var mongoose = require('mongoose');
module.exports = new mongoose.Schema({
    // 博客所属分类
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category'
    },
    // 用户信息
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    // 时间
    addTime: {
        type: Date,
        default: new Date()
    },
    // 阅读量
    views: {
        type: Number,
        default: 0
    },
    // 博客标题
    title: String,
    // 博客简介
    description: {
        type: String,
        default: ''
    },
    // 博客内容
    content: {
        type: String,
        default: ''
    },
    // 评论内容
    comments: {
        type: Array,
        default: []
    }
});