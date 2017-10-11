$(function(){
    // 计算底部栏目的位置
    var documentHeight = $(window).height();
    var headerHeight = $('#header').outerHeight();
    var navHeight = $('#nav').outerHeight();
    var copyrightHeight = $('#copyright').outerHeight();
    var number = documentHeight - (headerHeight + navHeight + copyrightHeight);
    $('#content').css({
        'min-height': number - 35
    })
});