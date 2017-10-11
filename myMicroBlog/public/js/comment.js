var prepage = 5;
var page = 1;
var pages = 0;
var commentList = [];

// 页面加载时直接渲染评论列表
$.ajax({
    type: 'GET',
    url: '/api/comment/loder',
    data: { contentid: $('#contentId').val() },
    success: function(responseData) {
        // 前端渲染评论数据
        commentList = responseData.commentList.comments;
        renderComment(commentList.reverse())
    }
});

//提交评论
$('#messageBtn').on('click', function() {
    var cont = $('#messageContent').val();
    if(cont.trim()){
        $.ajax({
            type: 'POST',
            url: '/api/comment/post',
            data: {
                contentid: $('#contentId').val(),
                content: cont
            },
            success: function(responseData) {
                $('#myModalContent').modal('show');
                $('#myModalContent').find('.modal-body').html(responseData.message);
                $('#messageContent').val('');
                setTimeout(function(){
                    $('#myModalContent').modal('hide');
                    window.location.reload()
                },1500);
                // 前端渲染评论数据
                renderComment(responseData.commentList.reverse())
            }
        })
    }else{
        $('#myModalContent').modal('show');
        $('#myModalContent').find('.modal-body').html('博客评论内容不能为空，请输入评论内容!');
        setTimeout(function(){
            $('#myModalContent').modal('hide');
        },1500);
    }
});

// 点击上一页和下一页分页按钮
$('.pager').delegate('a', 'click', function() {
    if ($(this).parent().hasClass('previous')) {
        page--;
    } else {
        page++;
    }
    renderComment(commentList);
});

// 渲染评论数据
function renderComment(comments) {
    var html = '';

    // 渲染分页信息
    var $list = $('.pages');
    var $previous = $('.previous');
    var $next = $('.next');
    pages = Math.max(Math.ceil(comments.length / prepage), 1);
    if(page<=1){
        page = 1;
        $previous.html('<span>没有上一页</span>')
    }else{
        $previous.html('<a href="javascript:;">上一页</a>')
    }
    if(page>=pages){
        page = pages;
        $next.html('<span>没有下一页</span>')
    }else{
        $next.html('<a href="javascript:;">下一页</a>')
    }
    $list.html(page+'/'+pages);
    var start = Math.max(0, (page-1) * prepage);
    var end = Math.min(start + prepage, comments.length);

    // 渲染评论列表
    $('#messageCount').html(comments.length);
    $('.cloInofPL').html(comments.length);
    for(var i=start,len=end; i<len; i++){
        html += '<div class="messageBox">'+
                '<p class="name clear"><span class="fl">'+comments[i].username+'</span><span class="fr">2016年10月1日</span></p>' +
                '<p style="padding:10px 0;">'+comments[i].content+'</p>'+
            '</div>';
    }
    $('.messageList').html(html)
}

// 格式化时间数据
function formatDate(d) {
    var date1 = new Date(d);
    return date1.getFullYear() + '年' + (date1.getMonth()+1) + '月' + date1.getDate() + '日 ' + date1.getHours() + ':' + date1.getMinutes() + ':' + date1.getSeconds();
}