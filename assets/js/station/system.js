const request = require('request');
// const { default: simpleGit } = require('simple-git');

// let simpleGit = require('simple-git');

let System = function (update_interval) {
    let that = {};

    let _update_interval = update_interval;

    let _state = 'standard';

    let _token;
    let _team, _user;
    let _is_admin = false;

    let pannel_map = {};

    let _update_timer = function () {
        that.update();
        setTimeout(_update_timer, update_interval);
    };

    that.getToken = function () {
        return _token;
    };

    that.isAdmin = function() {
        return _is_admin;
    }

    that.getUser = function() {
        return _user;
    }

    that.register = function (pannel_id, panel) {
        pannel_map[pannel_id] = panel;
        $('#btn-' + pannel_id).click(() => {
            that.changePanel(pannel_id);
        });
        $('#panel-' + pannel_id).hide();
    };

    that.update = function () {
        if (pannel_map.hasOwnProperty(_state)) {
            pannel_map[_state].update();
            // console.log(pannel_map[_state].update);
        }
    };

    that.changePanel = function (pannel_id) {
        if (pannel_map.hasOwnProperty(_state)) {
            pannel_map[_state].uninit();
        }

        if (pannel_map.hasOwnProperty(pannel_id)) {
            pannel_map[pannel_id].init();
            _state = pannel_id;
        }

    };

    _update_timer();


    $('#login-confirm-btn').click(() => {
        
        request.delete(
            'https://' + $('#login-username').val() + ':' + $('#login-password').val() + '@bugit.pvhu.top/api/v1/users/' + $('#login-username').val() + '/tokens/' + os.hostname() + '-' + os.type(),
            { json: {} },
            function (error, response, body) {
                request.post(
                    'https://' + $('#login-username').val() + ':' + $('#login-password').val() + '@bugit.pvhu.top/api/v1/users/' + $('#login-username').val() + '/tokens',
                    { json: { name: os.hostname() + '-' + os.type() } },
                    function (error, response, body) {
                        if (!error && response.statusCode == 201) {
                            console.log(body);
                            _token = body['sha1'];
                            $('#login-box').fadeOut("fast");
                            _login_box_display = false;
                            $('#login-btn').css('background-color', '#fff');
                            $('#login-btn').css('color', '#000');
                            commonUtil.message('login success', 'success');
                            request('https://' + _token + '@bugit.pvhu.top/api/v1/user/teams', function (error, response, body) {   //body为返回的数据
                                if (!error) {
                                    // console.log(body) // 请求成功的处理逻辑
                                    _team = JSON.parse(body);
                                    if (_team)
                                        $('#user-text').text('您已加入 ' + _team.length + ' 个团队');
                                    else {
                                        $('#user-text').text('您还未加入团队');
                                    }

                                    request('https://' + _token + '@bugit.pvhu.top/api/v1/admin/orgs', function (error, response, body) {
                                        if (!error) {
                                            if(response.statusCode === 200) {
                                                console.log(body, response);
                                                _is_admin = true;
                                                $('#prject-hud-push-admin').show();
                                                commonUtil.message('you are admin', 'success');
                                                $('#user-title').text('管理员');
                                            }
                                        }
                                    });
                                }
                            });
                            request('https://' + _token + '@bugit.pvhu.top/api/v1/user', function (error, response, body) {   //body为返回的数据
                                if (!error) {
                                    _user = JSON.parse(body); // 请求成功的处理逻辑
                                    
                                    // simpleGit().addConfig('user.name', _user.username, scope = 'global').then(
                                    //     () => {
                                    //         simpleGit().addConfig('user.email', _user.email, scope = 'global').then(() => {
                                    //             simpleGit().getConfig('user.name').then(
                                    //                 (c) => {
                                    //                     mylog(c);
                                    //                 }
                                    //             );;
                                    //         });
                                    //     }
                                    // );
                                    
                                    exec(`git config --global user.name ${_user.username}`);
                                    exec(`git config --global user.email ${_user.email}`);
                                    // mylog(typeof body);
                                    mylog(_user);
                                    // request(body['avatar_url'], {}, function(error, response, body) {
                                    //     if (!error) {
                                    //         mylog(body);
                                    //     }
                                    // });
                                    $('#login-btn').text(_user['username']);
                                    $('#user-avatar').attr('src', _user['avatar_url']);
                                    // mylog(_user['avatar_url']);
                                    _user_box_display = true;
                                    $('#login-btn').css('background-color', '#898989');
                                    $('#login-btn').css('color', '#fff');
                                    $('#user-box').css('left', ($('#login-btn').offset().left - 100) + 'px');
                                    $('#user-box').css('top', ($('#login-btn').offset().top + 15) + 'px');
                                    $('#user-box').fadeIn("fast");
                                }
                            });
                        }
                        else {
                            if (response === undefined) {
                                commonUtil.message('check your internet!', 'danger');
                            }
                            else commonUtil.message('check your username or password!', 'danger');
                        }
                    }
                );
            }
        );
    });

    $('#user-unlogin').click(() => {
        $('#login-btn').css('background-color', '#fff');
        $('#login-btn').css('color', '#000');
        _user_box_display = false;
        $('#user-box').fadeOut("fast");
        _login_box_display = false;
        $('#login-box').fadeOut("fast");
        $('#login-btn').text('登录');
        $('#user-avatar').attr('src', './img/R.gif');
        _token = undefined;
        _is_admin = false;
        _team = undefined;
        simpleGit().addConfig('user.name', '' );
        $('#prject-hud-push-admin').hide();
        _user = undefined;
        $('#user-title').text('欢迎使用BUGIT');
    });


    let _login_box_display = false;
    let _user_box_display = false;

    $('#user-box').hide();

    let onTapLoginBoxBlank = function (e) {
        let pop = $('#login-box');
        let btn = $('#login-btn');
        if (!pop.is(e.target) && pop.has(e.target).length === 0 && !btn.is(e.target) && btn.has(e.target).length === 0) {
            $('#login-btn').css('background-color', '#fff');
            $('#login-btn').css('color', '#000');
            _login_box_display = false;
            $('#login-box').fadeOut("fast");
        }
    };

    let onTapUserBoxBlank = function (e) {
        let pop = $('#user-box');
        let btn = $('#login-btn');
        if (!pop.is(e.target) && pop.has(e.target).length === 0 && !btn.is(e.target) && btn.has(e.target).length === 0) {
            $('#login-btn').css('background-color', '#fff');
            $('#login-btn').css('color', '#000');
            _user_box_display = false;
            $('#user-box').fadeOut("fast");
        }
    };

    $('#login-btn').click(function (e) {
        if (_token !== undefined) {
            if (!_user_box_display) {
                _user_box_display = true;
                $('#login-btn').css('background-color', '#898989');
                $('#login-btn').css('color', '#fff');
                $('#user-box').css('left', (e.pageX - 100) + 'px');
                $('#user-box').css('top', (e.pageY + 15) + 'px');
                $('#user-box').fadeIn("fast");
                $(document).bind('mousedown', onTapUserBoxBlank);
            }
            else {
                $('#login-btn').css('background-color', '#fff');
                $('#login-btn').css('color', '#000');
                _user_box_display = false;
                $('#user-box').fadeOut("fast");
                $(document).unbind('mousedown', onTapUserBoxBlank);
            }
            return;
        }
        if (!_login_box_display) {
            _login_box_display = true;
            $('#login-btn').css('background-color', '#898989');
            $('#login-btn').css('color', '#fff');
            $('#login-box').css('left', (e.pageX - 100) + 'px');
            $('#login-box').css('top', (e.pageY + 15) + 'px');
            $('#login-box').fadeIn("fast");
            $(document).bind('mousedown', onTapLoginBoxBlank);
        }
        else {
            $('#login-btn').css('background-color', '#fff');
            $('#login-btn').css('color', '#000');
            _login_box_display = false;
            $('#login-box').fadeOut("fast");
            $(document).unbind('mousedown', onTapLoginBoxBlank);
        }
        // shell.openExternal('http://bugit.pvhu.top/LingBug-embedded-group/ling-robomx.git');
    }
    );

    let frameCount = 0;
    let startTime = null;
    let fpsElement = document.getElementById("fps");
    let last_frame_t = 0;
    let currentFps = 0;

    function loop(timestamp) {
        if (!startTime) startTime = timestamp;
        if(timestamp - last_frame_t > 500) {
            last_frame_t = timestamp;
            fpsElement.textContent = `${currentFps}`;
            frameCount = 0;
            startTime = timestamp;
        }
        // last_frame_t = Date.now();
        // console.log(last_frame_t);
        const elapsedTime = timestamp - startTime;
        currentFps = Math.round((frameCount / elapsedTime) * 1000);
        frameCount++;
        
        requestAnimationFrame(loop);
    }

    requestAnimationFrame(loop);


    $(document).ready(function () {
        console.log('ready');
    });

    return that;
};


