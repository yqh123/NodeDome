$(function() {
    var $menuTab = $('#menuTab');
    var $loginBox = $('#loginBox');
    var $registerBox = $('#registerBox');
    var $userInfo = $('#userInfo');
    var $btnRequire = $('#btnRequire');

    // 页面加载完成后显示"模态框"
    $('#myModal').modal('show');

    // 头部分类数据tab切换添加active效果
    $menuTab.find('a').click(function(){
        console.log( $(this).html() )
    });

    //切换到登录面板
    $registerBox.find('a.colMint').on('click', function() {
        $loginBox.show();
        $registerBox.hide();
        $loginBox.find('.colWarning').html('');
        $loginBox.find('[name="username"]').val('');
        $loginBox.find('[name="password"]').val('');
    });

    //切换到注册面板
    $loginBox.find('a.colMint').on('click', function() {
        $loginBox.hide();
        $registerBox.show();
        $registerBox.find('.colWarning').html('');
        $registerBox.find('[name="username"]').val('');
        $registerBox.find('[name="password"]').val('');
        $registerBox.find('[name="repassword"]').val('');
    });

    //注册
    $registerBox.find('button').on('click', function() {
        //通过ajax提交请求
        $.ajax({
            type: 'post',
            url: '/api/user/register',
            data: {
                username: $registerBox.find('[name="username"]').val(),
                password: $registerBox.find('[name="password"]').val(),
                repassword: $registerBox.find('[name="repassword"]').val()
            },
            dataType: 'json',
            success: function(result) {
                $registerBox.find('.colWarning').html(result.message);
                if (!result.code) {
                    //注册成功
                    $registerBox.find('[name="username"]').val('');
                    $registerBox.find('[name="password"]').val('');
                    $registerBox.find('[name="repassword"]').val('');
                    $registerBox.find('.colWarning').html('');

                    $('#myDialog').modal('show');
                    $('#modal-body').html(result.message);
                    setTimeout(function() {
                        $('#myDialog').modal('hide');
                        $('#modal-body').html('');
                        $loginBox.show();
                        $registerBox.hide();
                    }, 2000);
                }
            }
        });
    });

    //登录
    $loginBox.find('button').on('click', function() {
        //通过ajax提交请求
        $.ajax({
            type: 'post',
            url: '/api/user/login',
            data: {
                username: $loginBox.find('[name="username"]').val(),
                password: $loginBox.find('[name="password"]').val()
            },
            dataType: 'json',
            success: function(result) {
                $loginBox.find('.colWarning').html(result.message);
                if (!result.code) {
                    $('#myDialog').modal('show');
                    $('#modal-body').html(result.message);
                    setTimeout(function() {
                        window.location.reload()
                    }, 2000);
                }
            }
        })
    });

    //退出
    $btnRequire.on('click', function() {
        $('#myReturn').modal('hide');
        $.ajax({
            url: '/api/user/logout',
            success: function(result) {
                if (!result.code) {
                    $('#myDialog').modal('show');
                    $('#modal-body').html(result.message);
                    setTimeout(function() {
                        window.location.reload()
                    }, 2000);
                }
            }
        });
    })
});




























