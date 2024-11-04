const Graph = require("@dagrejs/graphlib").Graph;
const graphlib = require("@dagrejs/graphlib");
const simpleGit = require('simple-git');
let git = simpleGit();
let { LingMXTool } = require(process.cwd() + '/assets/js/api/mxtool');

// git.raw('push', '--progress');

let ProjectPanel = function (pannel_id) {
    let that = Panel(pannel_id, '工程管理');
    let panel_that = that;

    let _first_init = true;

    let _path = '';

    let _board_state = '';
    let _item_list = {};
    let _option_state = '';
    let _option_list = {};
    let _vis_id_map = {};
    let _vis_id_max = 0;
    let _cycles;

    let _deps_graph = new Graph({ directed: true });

    $('#project-open-btn').click(() => {
        ipc.send('open-directory-dialog', {
            title : '请选择工程文件夹',
            option : 'openDirectory',
            listen_to : 'selected-item'
        });
    });

    $('#project-create-btn').click(() => {
        ipc.send('open-directory-dialog', {
            title : '请选择Vehicle文件夹',
            option : 'openDirectory',
            listen_to : 'selected-item-to-create'
        });
    });

    let _popup_window = LingView.PopupWindow('popup-box');
    _popup_window.hide();

    let _libs_version = {};
    let _mods_version = {};

    let _libs_count = 0, _mods_count = 0, _vehicle_count = 0;

    let _vehicle_path, _out_path;

    that.vehiclePathCallback = (e, path) => {
        _vehicle_path = path;
        _popup_window
            .title('Generate Project')
            .confirmText('[下一步]')
            .confirm(() => {
                ipc.send('open-directory-dialog', {
                    title : '选择要生成的工程文件夹',
                    option : 'openDirectory',
                    listen_to : 'selected-item-to-create2'
                });
            })
            .content(`点击下一步选择要生成的工程文件夹`)
            .show();
    };

    // LingMXTool.logCallback((m) => {
    //     _popup_window.content(_popup_window.getContent() + '<br>' + m);
    // });

    that.vehiclePathCallback2 = (e, path) => {
        _out_path = path;
        LingMXTool.generateProject(_vehicle_path, simpleGit(), _out_path, (m) => {
            _popup_window.content(_popup_window.getContent() + '<br>' + m);
            console.log(m);
        }, (result) => {
            if(result) {
                _popup_window.content(_popup_window.getContent() + '<br>' + '生成完成')
                    .confirmText('[完成]')
                    .confirm(() => {
                        _popup_window.hide();
                    });
                shell.openPath(_out_path);
            }
            else {
                _popup_window.content(_popup_window.getContent() + '<br>' + '生成失败')
                    .confirmText('[取消]')
                    .confirm(() => {
                        _popup_window.hide();
                    });
            }
        });
        _popup_window
            .title('Generating Project')
            .confirmText('')
            .cancelText('')
            .confirm(() => {
                
            })
            .content(`生成中`);
    };

    that.pathCallback = (e, path) => {
        if (that.openProject(path)) {
            _deps_graph = new Graph({ directed: true });
            _libs_version = {};
            _mods_version = {};
            _board_state = '';
            _item_list = {};
            // _option_state = '';
            // _option_list = {};
            _vis_nodes = [];
            _vis_edges = [];
            _vis_id_map = {};
            _vis_id_max = 0;
            _libs_count = 0, _mods_count = 0, _vehicle_count = 0;
            _path = path + '';
            $('#project-path').val(path);
            $('#project-open-box').hide();
            // $('#springy-canvas').show();
            $('#tool-bar-project').show();
            $('#select-box-project-librarieslist').html('');
            $('#select-box-project-moduleslist').html('');
            $('#select-box-project-vehiclelist').html('');
            that.openLibraries();
            that.openModules();
            that.openVehicle();

            // return;
            _cycles = graphlib.alg.findCycles(_deps_graph);

            _data = {
                nodes: _vis_nodes,
                edges: _vis_edges
            };

            $('#robot-big').show();
            $('#robot-small').hide();
            $('#project-info').show();

            let err = 0;

            for (let item in _item_list) {
                if (_item_list.hasOwnProperty(item)) {
                    if (_item_list[item].isAllDepOK())
                        _item_list[item].getButton().css('border', '1px solid #323232');
                    else _item_list[item].getButton().css('border', '1px solid red'), err += 1;
                    // if(_board_state !== item && !_item_list[item].getMouseOn()) {
                    //     _item_list[item].getText().css('font-weight', '500');
                    //     _item_list[item].getText().css('font-size', '14px');
                    // }
                }
            }

            $('#project-info-1').html('项目目录:&nbsp;' + _path + '<br>'
                + `包含:&nbsp;${_libs_count}个库,&nbsp;${_mods_count}个模块,&nbsp;${_vehicle_count}个机器人<br>
           ${(_cycles && _cycles.length > 0) ? '<label style="color: red;">' : '<label style="color: green;">'} 检查到&nbsp;${_cycles ? _cycles.length : 0}&nbsp;个依赖回路</label>
            ${(_cycles && _cycles.length > 0) ? '&nbsp;<label class="text-btn3">[详情]</label>' : ''}<br>
            ${(err > 0) ? '<label style="color: red;">' : '<label style="color: green;">'} 检查到&nbsp;${err}&nbsp;个依赖错误</label>
            ${(err > 0) ? '&nbsp;<label class="text-btn3">[详情]</label>' : ''}`);


            // mylog(_cycles);

            $('.text-btn3').mouseenter(function (e) {
                $(e.target).css('font-weight', 'bold');
            });

            $('.text-btn3').mouseleave(function (e) {
                $(e.target).css('font-weight', '500');
            });

            //   _network = new vis.Network(_container, _data, options);

            //   $('#mynetwork').show();

            // mylog(_vis_id_map);
        }
        else {
            commonUtil.message('path is not a project!', 'danger');
        }

        if (_first_init) {
            _first_init = false;
            let opt = {
                persistent: true, // persistent <boolean> 指示如果文件已正被监视，进程是否应继续运行。默认值: true。
                recursive: true// recursive <boolean> 指示应该监视所有子目录，还是仅监视当前目录。 这适用于监视目录时，并且仅适用于受支持的平台（参见注意事项）。默认值: false。
            };
            // fs.watch(_path, opt, (eventType, filename) => {
            //     that.pathCallback(null, _path);
            // });
        }
    };

    $('#btn-project-graph').click(() => {
        ipc.send('openGraph', {
            initialize: {
                data: JSON.stringify(_data)
            }
        });
    });

    that.openProject = (path) => {
        let fileObjs = fs.readdirSync(path, { withFileTypes: true });

        let libs_ok = false;
        let mods_ok = false;
        let vehi_ok = false;

        fileObjs.forEach(file => {
            if (file.name === 'Libraries' && file.isDirectory()) {
                libs_ok = true;
            }
            else if (file.name === 'Modules' && file.isDirectory()) {
                mods_ok = true;
            }
            else if (file.name === 'Vehicle' && file.isDirectory()) {
                vehi_ok = true;
            }
        });

        if (libs_ok && mods_ok && vehi_ok) {
            return true;
        }
        else {
            return false;
        }
    };

    $('#robot-big').hide();
    $('#project-hud').hide();
    $('#mynetwork').hide();
    $('#project-info').hide();
    $('#select-box-project-moduleslist').hide();
    $('#select-box-project-vehiclelist').hide();
    // LingView.HorizonSplitResizeBox('project-split-horizon', 'tool-bar-project', 'project-body-box', { min: 0.1, max: 0.35 });


    let Option = function (option_id) {
        let that = {};

        let _button = $('#btn-project-' + option_id);
        let _div = $('#select-box-project-' + option_id + 'list');
        let _option_id = option_id;

        that.init = () => {
            if (_option_list.hasOwnProperty(_option_state)) {
                _option_list[_option_state].uninit();
            }
            _option_state = _option_id;
            _button.css("font-weight", "bold");
            _div.show();
        };

        that.uninit = () => {
            _button.css("font-weight", "500");
            _div.hide();
        };

        _button.click(() => {
            that.init();
        });

        return that;
    };

    _option_list['libraries'] = Option('libraries');
    _option_list['libraries'].init();
    _option_list['modules'] = Option('modules');
    _option_list['vehicle'] = Option('vehicle');


    let _container = document.getElementById("mynetwork");
    let _dot = "dinetwork {node[shape=circle]; ";
    let _data;
    let _vis_nodes = [];
    let _vis_edges = [];
    //   "dinetwork {node[shape=circle]; 1 -> 2; 2 -> 1; 1 -> 3; 3 -> 1; }";
    // let data = vis.parseDOTNetwork(dot);
    let _network;
    // let network = new vis.Network(_container, data);

    ipc.on('selected-item', that.pathCallback);
    ipc.on('selected-item-to-create', that.vehiclePathCallback);
    ipc.on('selected-item-to-create2', that.vehiclePathCallback2);

    $('#btn-project-refresh').click(() => {
        ipc.send('open-directory-dialog', {
            title : '请选择工程文件夹',
            option : 'openDirectory',
            listen_to : 'selected-item'
        });
    });

    let ItemTypeText = {
        'lib': '库',
        'module': '模块',
        'vehicle': '机器人'
    };

    let getGit = (mygit, git_path) => {
        return mygit.cwd(git_path).then(() => {
            if (system.getUser())
                mygit.addConfig('user.name', system.getUser().username, scope = 'global').then(
                    () => {
                        mygit.addConfig('user.email', system.getUser().email, scope = 'global').then(() => {
                            mygit.getConfig('user.name').then(
                                (c) => {
                                    mylog(c);
                                }
                            );;
                        });
                    }
                );
        });
    };

    let Item = function (module_name, parent_id) {
        let that = {};

        let _module_name = module_name;
        let _parent_id = parent_id;
        let _item_type = '';
        let _msg_btn_box, _button;
        let _cfg_ok = false;
        let _cfg;

        if (_parent_id === 'libraries') _item_type = 'lib';
        if (_parent_id === 'modules') _item_type = 'module';
        if (_parent_id === 'vehicle') _item_type = 'vehicle';

        that.getModuleName = () => {
            return _module_name;
        };

        that.getParentId = () => {
            return _parent_id;
        }

        that.getItemType = () => {
            return _item_type;
        };

        that.getVerision = () => {
            return _cfg.version;
        };

        that.load = function () {
            that.readModuleConfig((cfg) => {
                _cfg = cfg;
                // return;
                if (_button != undefined) {
                    let tip = '[unknown tag]&nbsp;' + cfg.version;

                    let git_path = path.join(that.getParentPath(), module_name);
                    let git = simpleGit();
                    getGit(git, git_path).then(
                        () => {
                            git.checkIsRepo().then((is_repo) => {
                                // console.log(git_path);
                                // console.log(is_repo);
                                if (is_repo) {
                                    // console.log(is_repo);
                                    git.tag().then((tag) => {
                                        // console.log(list.current);
                                        let arr = tag.split('\n');
                                        // console.log(arr);
                                        //list.current;
                                        if(arr.length > 1) {
                                            tip = arr[arr.length - 2];
                                        }
                                        else {
                                            tip = '[---]';
                                        }
                                        $('#btn-version-' + _parent_id + '-' + module_name).html('<label style="color: green;">'+ tip + '</label>&nbsp;' + cfg.version);
                                    });
                                }
                            });
                        }
                    );

                    $('#btn-version-' + _parent_id + '-' + module_name).html(tip);
                }
                if (_item_type === 'lib') {
                    _libs_version[module_name] = cfg.version;
                    _libs_count += 1;
                }
                else if (_item_type === 'module') {
                    _mods_version[module_name] = cfg.version;
                    _mods_count += 1;
                }
                else {
                    _vehicle_count += 1;
                }

                _deps_graph.setNode(_parent_id + '.' + module_name, that);

                if (!_vis_id_map.hasOwnProperty(_parent_id + '.' + module_name)) {
                    _vis_id_map[_parent_id + '.' + module_name] = _vis_id_max++;
                }

                _vis_nodes.push({
                    id: _vis_id_map[_parent_id + '.' + module_name],
                    label: _parent_id + '.' + module_name
                });

                if (_item_type === 'lib') {
                    for (let i = 0; i < cfg.dep_libs.length; i++) {
                        if (!_vis_id_map.hasOwnProperty('libraries.' + cfg.dep_libs[i].lib_name)) {
                            _vis_id_map['libraries.' + cfg.dep_libs[i].lib_name] = _vis_id_max++;
                        }
                        _deps_graph.setEdge(_parent_id + '.' + module_name, 'libraries.' + cfg.dep_libs[i].lib_name);

                        _vis_edges.push({
                            from: _vis_id_map[_parent_id + '.' + module_name],
                            to: _vis_id_map['libraries.' + cfg.dep_libs[i].lib_name],
                            value: 1,
                            arrows: "to",
                            color: { color: "green" }
                        });
                    }
                }
                if (_item_type === 'module' || _item_type === 'vehicle') {
                    for (let i = 0; i < cfg.dep_libs.length; i++) {
                        if (!_vis_id_map.hasOwnProperty('libraries.' + cfg.dep_libs[i].lib_name)) {
                            _vis_id_map['libraries.' + cfg.dep_libs[i].lib_name] = _vis_id_max++;
                        }
                        _deps_graph.setEdge(_parent_id + '.' + module_name, 'libraries.' + cfg.dep_libs[i].lib_name);

                        _vis_edges.push({
                            from: _vis_id_map[_parent_id + '.' + module_name],
                            to: _vis_id_map['libraries.' + cfg.dep_libs[i].lib_name],
                            value: 2,
                            arrows: "to",
                            color: { color: "orange" }
                        });
                    }
                    for (let i = 0; i < cfg.dep_modules.length; i++) {
                        if (!_vis_id_map.hasOwnProperty('modules.' + cfg.dep_modules[i].module_name)) {
                            _vis_id_map['modules.' + cfg.dep_modules[i].module_name] = _vis_id_max++;
                        }
                        _deps_graph.setEdge(_parent_id + '.' + module_name, 'modules.' + cfg.dep_modules[i].module_name);

                        _vis_edges.push({
                            from: _vis_id_map[_parent_id + '.' + module_name],
                            to: _vis_id_map['modules.' + cfg.dep_modules[i].module_name],
                            value: 4,
                            arrows: "to",
                            color: { color: "red" }
                        });
                    }
                }
            });
        }

        that.getParentPath = function () {
            let firstLetter = _parent_id.charAt(0)
            let firstLetterCap = firstLetter.toUpperCase()
            let remainingLetters = _parent_id.slice(1)
            let _parent_path = firstLetterCap + remainingLetters;

            return path.join(_path, _parent_path)
        };

        that.readModuleConfig = function (cfg_callback) {
            let cfg_path = path.join(that.getParentPath(), _module_name, (_item_type !== 'vehicle') ? 'module.json' : 'vehicle.json');
            // fs.readFile(cfg_path, (err, data) => {
            //     if (!err && data) {
            //         _cfg = JSON.parse(data);
            //         // console.log(_cfg);
            //         cfg_callback(_cfg);
            //         _cfg_ok = true;
            //     }
            // });
            if (fs.existsSync(cfg_path)) {
                let f = fs.readFileSync(cfg_path, { encoding: 'utf8' });
                // mylog(f);
                cfg_callback(JSON.parse(f));
                _cfg_ok = true;
            }
        };

        that.versionCompare = function (v1, v2) {
            let v1_arr = v1.split('.');
            let reg1 = /[<>=]{1,2}/g;
            let reg2 = /[0-9.]{5,10}/g;
            let v2_c = v2.match(reg1)[0];
            let v2_v = v2.match(reg2)[0];
            // console.log('v2: ' + v2);
            // console.log('v2_c: ' + v2_c);
            // console.log('v2_v: ' + v2_v);
            let v2_arr = v2_v.split('.');

            let cpr = 0;
            if (parseInt(v1_arr[0]) > parseInt(v2_arr[0])) {
                cpr = 1;
            }
            else if (parseInt(v1_arr[0]) < parseInt(v2_arr[0])) {
                cpr = -1;
            }
            else {
                if (parseInt(v1_arr[1]) > parseInt(v2_arr[1])) {
                    cpr = 1;
                }
                else if (parseInt(v1_arr[1]) < parseInt(v2_arr[1])) {
                    cpr = -1;
                }
                else {
                    if (parseInt(v1_arr[2]) > parseInt(v2_arr[2])) {
                        cpr = 1;
                    }
                    else if (parseInt(v1_arr[2]) < parseInt(v2_arr[2])) {
                        cpr = -1;
                    }
                    else {
                        cpr = 0;
                    }
                }
            }
            if (v2_c === '==') {
                return cpr === 0;
            }
            else if (v2_c === '>=') {
                return cpr === 1 || cpr === 0;
            }
            else if (v2_c === '>') {
                return cpr === 1;
            }
            else if (v2_c === '<=') {
                return cpr === -1 || cpr === 0;
            }
            else if (v2_c === '<') {
                return cpr === -1;
            }
            else return false;
        };

        that.deps2String = function (deps, dep_type) {
            let str = '';
            for (let i = 0; i < deps.length; i++) {
                str += '&nbsp;&nbsp;&nbsp;&nbsp;' + deps[i][dep_type + '_name'] + '&nbsp;' + deps[i]['version'] + (
                    function () {
                        let ok = '';

                        let dep_safe = false;
                        let version_safe = false;

                        if (dep_type === 'lib') {
                            dep_safe = (_libs_version.hasOwnProperty(deps[i][dep_type + '_name']));// ? 'ok' : 'miss';
                            if (dep_safe) version_safe = that.versionCompare(_libs_version[deps[i][dep_type + '_name']], deps[i]['version']);
                        }

                        if (dep_type === 'module') {
                            dep_safe = (_mods_version.hasOwnProperty(deps[i][dep_type + '_name']));// &&  !panel_that.isInCycle('modules.' + deps[i][dep_type + '_name']))) ? 'ok' : 'miss';
                            if (dep_safe) version_safe = that.versionCompare(_mods_version[deps[i][dep_type + '_name']], deps[i]['version']);
                        }


                        let cycle_safe = !panel_that.isInCycle('libraries.' + deps[i][dep_type + '_name']);

                        if (dep_safe && cycle_safe && version_safe) {
                            ok = '&nbsp;<label style="color: green;">ok</label>'
                        }

                        if (!dep_safe) {
                            ok = '&nbsp;<label style="color: red;">miss</label>'
                        }


                        if (dep_safe && !cycle_safe) {
                            ok = '&nbsp;<label style="color: red;">cycle</label>'
                        }
                        else if (dep_safe && !version_safe) {
                            ok = '&nbsp;<label style="color: red;">version invalid</label>'
                        }

                        return ok;
                    }
                )() + '<br>';
            }
            return str;
        };

        that.isDepOK = function (deps, dep_type) {
            for (let i = 0; i < deps.length; i++) {
                let dep_safe = false;
                let version_safe = false;

                if (dep_type === 'lib') {
                    dep_safe = (_libs_version.hasOwnProperty(deps[i][dep_type + '_name']));// ? 'ok' : 'miss';
                    if (dep_safe) version_safe = that.versionCompare(_libs_version[deps[i][dep_type + '_name']], deps[i]['version']);
                }

                if (dep_type === 'module') {
                    dep_safe = (_mods_version.hasOwnProperty(deps[i][dep_type + '_name']));// &&  !panel_that.isInCycle('modules.' + deps[i][dep_type + '_name']))) ? 'ok' : 'miss';
                    if (dep_safe) version_safe = that.versionCompare(_mods_version[deps[i][dep_type + '_name']], deps[i]['version']);
                }

                let cycle_safe = !panel_that.isInCycle('libraries.' + deps[i][dep_type + '_name']);

                if (!(dep_safe && cycle_safe && version_safe)) {
                    return false;
                }
            }
            return true;
        };

        let _all_dep_ok;

        that.isAllDepOK = function () {
            if (_all_dep_ok !== undefined) return _all_dep_ok;
            if (_item_type === 'lib') {
                _all_dep_ok = that.isDepOK(_cfg.dep_libs, 'lib');
            }
            if (_item_type === 'module') {
                _all_dep_ok = that.isDepOK(_cfg.dep_libs, 'lib') && that.isDepOK(_cfg.dep_modules, 'module');
            }
            if (_item_type === 'vehicle') {
                _all_dep_ok = that.isDepOK(_cfg.dep_libs, 'lib') && that.isDepOK(_cfg.dep_modules, 'module');
            }
            return _all_dep_ok;
        };

        that.showHUD = function () {
            if (!_cfg_ok || !_cfg || !_cfg.dep_libs) return;
            $('#project-hud').show();
            $('#project-hud-name').html(_module_name + '&nbsp;&nbsp;<label class="text-btn">' + ItemTypeText[_item_type] + '</label>');
            $('#project-hud-version').text('版本: ' + _cfg.version);
            $('#project-hud-source').text('来源: ');
            let git = simpleGit();
            let git_path = path.join(that.getParentPath(), that.getModuleName());
            getGit(git, git_path).then(
                () => {
                    git.checkIsRepo().then((is_repo) => {
                        if (is_repo) {
                            git.getRemotes(true).then((list) => {
                                // console.log(list);
                                for (let i = 0; i < list.length; i++) {
                                    let e = list[i];
                                    if (e.hasOwnProperty('name') && e['name'] === 'origin') {
                                        $('#project-hud-source').text('来源: ' + e['refs']['fetch']);
                                    }
                                }
                            });
                        }
                    });
                }
            );

            if (_item_type === 'lib') {
                $('#project-hud-dependencies').html('依赖库: <br>' + that.deps2String(_cfg.dep_libs, 'lib'));
            }
            if (_item_type === 'module') {
                $('#project-hud-dependencies').html('依赖库: <br>' + that.deps2String(_cfg.dep_libs, 'lib') +
                    '依赖模块: <br>' + that.deps2String(_cfg.dep_modules, 'module'));
            }
            if (_item_type === 'vehicle') {
                $('#project-hud-dependencies').html('依赖库: <br>' + that.deps2String(_cfg.dep_libs, 'lib') +
                    '依赖模块: <br>' + that.deps2String(_cfg.dep_modules, 'module'));
            }
        };

        that.hideHUD = function () {
            $('#project-hud').hide();
        };

        that.init = function () {
            // _dot += '}';
            // mylog(_dot);
            // _data = vis.parseDOTNetwork(_dot);
            // _network = new vis.Network(_container, _data);
            // $('#mynetwork').show();
            // mylog(_module_name + ' init');
            _board_state = _parent_id + '.' + _module_name;
            that.showHUD();
            if (_button !== undefined) {
                $('#btn-' + _parent_id + '-' + module_name).css("font-weight", "bold");
                $('#btn-' + _parent_id + '-' + module_name).css('font-size', '18px');
            }
        };

        that.uninit = function () {
            // mylog(_module_name + ' uninit');
            _board_state = '';
            that.hideHUD();
            if (_button !== undefined) {
                $('#btn-' + _parent_id + '-' + module_name).css("font-weight", "500");
                $('#btn-' + _parent_id + '-' + module_name).css('font-size', '14px');
            }
        };

        that.getButton = function () {
            return _button;
        };

        that.getText = function () {
            return $('#btn-' + _parent_id + '-' + module_name);
        }

        let mouse_on = false;

        that.getMouseOn = () => {
            return mouse_on;
        };

        that.drawElement = function () {
            let _select_box = $('#select-box-project-' + _parent_id + 'list');
            _select_box.append('<div style="padding-left: 4px; padding-right: 4px;" class="project-item-btn-box box-project-white text-btn" id="btn-box-project-' + _parent_id + '-' + module_name + '">\
                \
            </div>');

            _msg_btn_box = $('#btn-box-project-' + _parent_id + '-' + module_name);
            _msg_btn_box.append('<label class="btn-project-msglist" id="btn-' + _parent_id + '-' + module_name + '" style="background: rgba(0, 0, 0, 0.0); height: 100%;">' + module_name + '</label><label class="btn-project-msglist" id="btn-version-' + _parent_id + '-' + module_name + '" style="background: rgba(0, 0, 0, 0.0);font-size: 10px; height: 100%;">---</label>');

            _button = $('#btn-box-project-' + _parent_id + '-' + module_name);

            _button.click(function () {
                // mylog(_item_list);
                if (_board_state === _parent_id + '.' + module_name) {
                    that.uninit();
                    return;
                }
                if (_item_list.hasOwnProperty(_board_state)) {
                    _item_list[_board_state].uninit();
                };
                that.init();
            });

            _button.mouseenter(function (e) {
                mouse_on = true;
                $('#btn-' + _parent_id + '-' + module_name).css('font-weight', 'bold');
                $('#btn-' + _parent_id + '-' + module_name).css('font-size', '18px');
                if (_board_state === '')
                    that.showHUD();
            });

            _button.mouseleave(function (e) {
                mouse_on = false;
                if (_board_state !== _parent_id + '.' + _module_name) {
                    // mylog(_module_name + ' mouseout');
                    $('#btn-' + _parent_id + '-' + module_name).css('font-weight', '500');
                    $('#btn-' + _parent_id + '-' + module_name).css('font-size', '14px');
                    if (_board_state === '')
                        that.hideHUD();
                }
            });

            that.load();
        };

        return that;
    };

    that.openLibraries = () => {
        let fileObjs = fs.readdirSync(path.join(_path, 'Libraries'), { withFileTypes: true });

        let _select_box = $('#select-box-project-' + 'libraries' + 'list');

        _board_state = '';
        _item_list = {};

        _select_box.html('');

        fileObjs.forEach(file => {
            if (file.isDirectory()) {
                _item_list['libraries.' + file.name] = Item(file.name, 'libraries');
                _item_list['libraries.' + file.name].drawElement();
            }
        });
    };

    that.openModules = () => {
        let fileObjs = fs.readdirSync(path.join(_path, 'Modules'), { withFileTypes: true });

        let _select_box = $('#select-box-project-' + 'modules' + 'list');

        _board_state = '';

        _select_box.html('');

        fileObjs.forEach(file => {
            if (file.isDirectory()) {
                _item_list['modules.' + file.name] = Item(file.name, 'modules');
                _item_list['modules.' + file.name].drawElement();
            }
        });
    };

    that.openVehicle = () => {
        let fileObjs = fs.readdirSync(path.join(_path, 'Vehicle'), { withFileTypes: true });

        let _select_box = $('#select-box-project-' + 'vehicle' + 'list');

        _board_state = '';

        _select_box.html('');

        fileObjs.forEach(file => {
            if (file.isDirectory()) {
                _item_list['vehicle.' + file.name] = Item(file.name, 'vehicle');
                _item_list['vehicle.' + file.name].drawElement();
            }
        });
    };

    $('.text-btn').mouseenter(function (e) {
        $(e.target).css('font-weight', 'bold');
    });

    $('.text-btn').mouseleave(function (e) {
        $(e.target).css('font-weight', '500');
    });

    that.isInCycle = function (item_name) {
        if (!_cycles) return false;
        for (let i = 0; i < _cycles.length; i++) {
            for (let j = 0; j < _cycles[i].length; j++) {
                if (item_name === _cycles[i][j]) {
                    return true;
                }
            }
        }
        return false;
    };

    $('#prject-hud-push').click(() => {

        let git = simpleGit();

        if (!_item_list.hasOwnProperty(_board_state)) return;
        if (system.getToken() === undefined) {
            commonUtil.message('login first!', 'danger');
            return;
        }
        let item = _item_list[_board_state];
        if (item.isAllDepOK() === false) {
            commonUtil.message('check dependencies first!', 'danger');
            return;
        }
        // console.log(item.getModuleName());
        let git_path = path.join(item.getParentPath(), item.getModuleName());

        let git_push_func = () => {
            _popup_window
                .title('Push to BUGIT')
                .confirmText('[确认]')
                .content(`确定push ${item.getModuleName()} 至bugit远程仓库(若无将自动创建)?`)
                .confirm(function () {
                    let popup_this = this;
                    popup_this.confirm(() => { });
                    request.post(
                        'https://' + system.getToken() + '@bugit.pvhu.top/api/v1/user/repos',
                        { json: { private: true, name: item.getModuleName() } },
                        function (error, response, body) {
                            // console.log(error, response.statusCode, body);
                            if (!error && body && body.message) {
                                popup_this.content(popup_this.getContent() + '<br>' + body.message);
                            }
                            else if (!error && response.statusCode === 201) {
                                popup_this.content(popup_this.getContent() + '<br>' + 'Create repository success at ' + body.clone_url);
                            }
                            else {
                                _popup_window.confirmText('[重试]');
                                _popup_window.confirm(git_push_func);
                                return;
                            }

                            git.add('./*').then(() => {
                                popup_this.content(popup_this.getContent() + '<br>' + 'Files added!');
                                git.commit('Test commit').then(() => {
                                    popup_this.content(popup_this.getContent() + '<br>' + 'Committed!');
                                    let addr = `https://bugit.pvhu.top/${system.getUser().username}/${item.getModuleName()}.git`;
                                    git.addRemote('origin', addr).then(() => {
                                        popup_this.content(popup_this.getContent() + '<br>' + 'Pushing ...')
                                            .confirm(() => { });
                                        git.push('origin', 'main').then((body) => {
                                            popup_this.content(popup_this.getContent() + '<br>' + 'Push completed!');
                                            popup_this
                                                .confirm(() => { popup_this.hide(); that.pathCallback(null, _path) })
                                                .confirmText('[完成]');
                                        });

                                    }).catch((e) => {
                                        mylog(e);
                                        // popup_this.content(popup_this.getContent() + '<br>' + e.message);
                                        popup_this.content(popup_this.getContent() + '<br>' + 'Pushing ...')
                                            .confirm(() => { });
                                        git.push('origin', 'main').then((body) => {
                                            mylog(body);
                                            popup_this.content(popup_this.getContent() + '<br>' + 'Push completed!');
                                            popup_this
                                                .confirm(() => { popup_this.hide(); that.pathCallback(null, _path) })
                                                .confirmText('[完成]');
                                        });
                                    });
                                });
                            });
                        }
                    );
                })
                .show();

        };

        getGit(git, git_path).then((p) => {
            git.checkIsRepo().then((is_repo) => {
                // console.log(is_repo);
                if (!is_repo) {
                    _popup_window
                        .title('Push to BUGIT')
                        .content(`${ItemTypeText[item.getItemType()]} ${item.getModuleName()} 还未建立git仓库。确定创建新仓库并初始化?`)
                        .confirmText('[确认]')
                        .confirm(function () {
                            git.init().then(() => {
                                this.content(this.getContent() + '<br>' + 'Git repository initialized!');
                                git.checkoutLocalBranch('main').then(() => {
                                    git.add('./*').then(() => {
                                        this.content(this.getContent() + '<br>' + 'Files added!');
                                        git.commit('Initial commit').then(() => {
                                            this.content(this.getContent() + '<br>' + 'Committed!');
                                        });
                                    });
                                });
                            });
                            this
                                .confirm(() => {
                                    git_push_func();
                                })
                                .confirmText('[下一步]');
                            // this.hide();
                        })
                        .show();
                }
                else {
                    git_push_func();
                }
            });
        }).catch((e) => {
            commonUtil.message(e);
        });
    });

    $('#prject-hud-push-admin').click(() => {

        let git = simpleGit();

        if (!_item_list.hasOwnProperty(_board_state)) return;
        if (system.getToken() === undefined) {
            commonUtil.message('login first!', 'danger');
            return;
        }
        if (system.isAdmin() === false) {
            commonUtil.message('You are not admin!', 'danger');
            return;
        }
        let item = _item_list[_board_state];
        if (item.isAllDepOK() === false) {
            commonUtil.message('check dependencies first!', 'danger');
            return;
        }
        // console.log(item.getModuleName());
        let git_path = path.join(item.getParentPath(), item.getModuleName());

        let git_release_func = () => {
            _popup_window
                .title('Release to Embeded Group')
                .confirmText('[确认]')
                .content(`确定release ${item.getVerision()} 至Embeded Group?`)
                .confirm(() => {
                    let item_tag = 'ECLIB';
                    if (item.getItemType() === 'module') item_tag = 'ECMOD';
                    if (item.getItemType() === 'vehicle') item_tag = 'ECVEH';
                    _popup_window.content(_popup_window.getContent() + '<br>' + 'Sending release request ...');
                    request.post(
                        'https://' + system.getToken() + '@bugit.pvhu.top/api/v1/repos/LingBug-embedded-group/' + item_tag + '-' + item.getModuleName() + '/releases' ,
                        { json: { tag_name : item.getVerision(), name : item.getModuleName() + ' ' + item.getVerision() } },
                        function (error, response, body) {
                            // console.log(response, body);
                            if(response.statusCode === 201) {
                                _popup_window.content(_popup_window.getContent() + '<br>' + 'Release success');
                                _popup_window.confirmText('[完成]');
                                _popup_window.confirm(() => {
                                    _popup_window.hide();
                                });
                            }
                            else {
                                _popup_window.content(_popup_window.getContent() + '<br>' + 'Release failed');
                                _popup_window.confirmText('[重试]');
                            }
                        }
                    );
                });

        };

        let git_push_func = () => {
            _popup_window
                .title('Push to Embeded Group')
                .confirmText('[确认]')
                .content(`确定push ${item.getModuleName()} 至Embeded Group(若无将自动创建)?`)
                .confirm(function () {
                    let popup_this = this;
                    popup_this.confirm(() => { });
                    let item_tag = 'ECLIB';
                    if (item.getItemType() === 'module') item_tag = 'ECMOD';
                    if (item.getItemType() === 'vehicle') item_tag = 'ECVEH';
                    request.post(
                        'https://' + system.getToken() + '@bugit.pvhu.top/api/v1/orgs/LingBug-embedded-group/repos',
                        { json: { private: true, name: item_tag + '-' + item.getModuleName() } },
                        function (error, response, body) {
                            // console.log(error, response.statusCode, body);
                            if (!error && body && body.message) {
                                popup_this.content(popup_this.getContent() + '<br>' + body.message);
                            }
                            else if (!error && response.statusCode === 201) {
                                popup_this.content(popup_this.getContent() + '<br>' + 'Create repository success at ' + body.clone_url);
                            }
                            else {
                                _popup_window.confirmText('[重试]');
                                _popup_window.confirm(git_push_func);
                                return;
                            }

                            git.add('./*').then(() => {
                                popup_this.content(popup_this.getContent() + '<br>' + 'Files added!');
                                git.commit('Test commit').then(() => {
                                    popup_this.content(popup_this.getContent() + '<br>' + 'Committed!');
                                    let item_tag = 'ECLIB';
                                    if (item.getItemType() === 'module') item_tag = 'ECMOD';
                                    if (item.getItemType() === 'vehicle') item_tag = 'ECVEH';
                                    let addr = `https://bugit.pvhu.top/LingBug-embedded-group/${item_tag}-${item.getModuleName()}.git`;
                                    git.addRemote('origin', addr).then(() => {
                                        popup_this.content(popup_this.getContent() + '<br>' + 'Pushing ...')
                                            .confirm(() => { });
                                        git.push('origin', 'main').then(() => {
                                            popup_this.content(popup_this.getContent() + '<br>' + 'Push completed!');
                                            popup_this
                                                .confirm(git_release_func)
                                                .cancel(() => { that.pathCallback(null, _path); })
                                                .confirmText('[下一步]');
                                        });

                                    }).catch((e) => {
                                        // popup_this.content(popup_this.getContent() + '<br>' + e.message);
                                        popup_this.content(popup_this.getContent() + '<br>' + 'Pushing ...')
                                            .confirm(() => { });
                                        git.push('origin', 'main').then(() => {
                                            popup_this.content(popup_this.getContent() + '<br>' + 'Push completed!');
                                            popup_this
                                                .confirm(git_release_func)
                                                .cancel(() => { that.pathCallback(null, _path); })
                                                .confirmText('[下一步]');
                                        });
                                    });
                                });
                            });
                        }
                    );
                })
                .show();

        };

        getGit(git, git_path).then((p) => {
            git.checkIsRepo().then((is_repo) => {
                // console.log(is_repo);
                if (!is_repo) {
                    _popup_window
                        .title('Push to BUGIT')
                        .content(`${ItemTypeText[item.getItemType()]} ${item.getModuleName()} 还未建立git仓库。确定创建新仓库并初始化?`)
                        .confirmText('[确认]')
                        .confirm(function () {
                            git.init().then(() => {
                                this.content(this.getContent() + '<br>' + 'Git repository initialized!');
                                git.checkoutLocalBranch('main').then(() => {
                                    git.add('./*').then(() => {
                                        this.content(this.getContent() + '<br>' + 'Files added!');
                                        git.commit('Initial commit').then(() => {
                                            this.content(this.getContent() + '<br>' + 'Committed!');
                                        });
                                    });
                                });
                            });
                            this
                                .confirm(() => {
                                    git_push_func();
                                })
                                .confirmText('[下一步]');
                            // this.hide();
                        })
                        .show();
                }
                else {
                    git_push_func();
                }
            });
        }).catch((e) => {
            commonUtil.message(e);
        });
    });

    let _test_i = 0;

    that.update = function () {
        let err = 0;
        for (let item in _item_list) {
            if (_item_list.hasOwnProperty(item)) {
                if (_item_list[item].isAllDepOK())
                    _item_list[item].getButton().css('border', '1px solid #323232');
                else _item_list[item].getButton().css('border', '1px solid red'), err += 1;
                // if(_board_state !== item && !_item_list[item].getMouseOn()) {
                //     _item_list[item].getText().css('font-weight', '500');
                //     _item_list[item].getText().css('font-size', '14px');
                // }
                // let git_path = path.join(item.getParentPath(), item.getModuleName());
                //     simpleGit().cwd(git_path).then(
                //         () => {
                //             git.checkIsRepo().then((is_repo) => {
                //                 console.log(git_path);
                //                 console.log(is_repo);
                //                 if(is_repo)
                //                 {
                //                     // console.log(is_repo);
                //                     git.branch().then((list) => {
                //                         // console.log(list);
                //                         for(let i = 0; i < list.length;  i++) {
                //                             let e = list[i];
                //                             if(e.hasOwnProperty('name') && e['name'] === 'origin') {
                //                                 $('#project-hud-source').text('来源: ' + e['refs']['fetch']);
                //                             }
                //                         }
                //                     });
                //                 }
                //             });
                //         }
                //     );
            }
        }
        $('#project-info-1').html('项目目录:&nbsp;' + _path + '<br>'
            + `包含:&nbsp;${_libs_count}个库,&nbsp;${_mods_count}个模块,&nbsp;${_vehicle_count}个机器人<br>
           ${(_cycles && _cycles.length > 0) ? '<label style="color: red;">' : '<label style="color: green;">'} 检查到&nbsp;${_cycles ? _cycles.length : 0}&nbsp;个依赖回路</label>
            ${(_cycles && _cycles.length > 0) ? '&nbsp;<label class="text-btn3">[详情]</label>' : ''}
            <br>${(err > 0) ? '<label style="color: red;">' : '<label style="color: green;">'} 检查到&nbsp;${err}&nbsp;个依赖错误</label>
            ${(err > 0) ? '&nbsp;<label class="text-btn3">[详情]</label>' : ''}
            <label style="font-size:0px;">${_test_i++}</label>`);

        // for (let item in _item_list) {
        //     if (_item_list.hasOwnProperty(item)) {
        //         if (_item_list[item].isAllDepOK())
        //             _item_list[item].getButton().css('border', '1px solid #323232');
        //         else _item_list[item].getButton().css('border', '1px solid red');
        //         // if(_board_state !== item && !_item_list[item].getMouseOn()) {
        //         //     _item_list[item].getText().css('font-weight', '500');
        //         //     _item_list[item].getText().css('font-size', '14px');
        //         // }
        //     }
        // }
    };

    return that;
};
