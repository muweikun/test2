const os = require('os');

let ProtocolPanel = function(pannel_id) {
    let _super = Panel(pannel_id, '协议管理');

    let that = {};
    that.init = _super.init;
    that.update = _super.update;
    that.uninit = _super.uninit;
    that.getName = _super.getName;
    
    let _state = '';
    let _items = {};
    let _func_id_count_map = {};
    
    let _gen_button = $('#gen-btn-' + pannel_id);
    let _gen_confirm_button = $('#gen-confirm-btn-' + pannel_id);
    let _gen_box = $('#box-' + pannel_id + '-gen-code');

    _gen_box.hide();

    let _gen_code_item = (function() {
        let that = {};

        let _version_select = $('#select-version-' + pannel_id + '-gen-code');
        let _platform_select = $('#select-platfrom-' + pannel_id + '-gen-code');
        let _structure_select = $('#select-structure-' + pannel_id + '-gen-code');

        that.init = function() {
            if(_items.hasOwnProperty(_state)) {
                _items[_state].uninit();
            }
            $('#header-protocol-box').text("输出设置");
            _gen_button.text("关闭设置");
            _gen_box.show();
            _state = 'GEN_MODE';

            for(let key in _items){  
                if (_items.hasOwnProperty(key) === true){ 
                    _items[key].getCheckbox().show();
                    _items[key].getCheckbox().prop("checked",true);
                }                
            }
        };

        
        let platform_last = '';

        that.update = function() {
            let settings = that.getSettings();
            if(settings.platform == 'mcu') {
                if(platform_last != settings.platform) {
                    $("#frame-from-input-protocol").attr("placeholder", "0xFF");
                    $("#frame-to-input-protocol").attr("placeholder", "0xEE");
                    $ ("#select-version-protocol-gen-code" ).empty(); 
                    $('#select-version-protocol-gen-code').append(`<option>v2.0</option>`);
                    // $('#select-version-protocol-gen-code').append(`<option>v1.0</option>`);
                }
            }
            else {
                if(platform_last != settings.platform) {
                    $("#frame-from-input-protocol").attr("placeholder", "0xEE");
                    $("#frame-to-input-protocol").attr("placeholder", "0xFF");
                    $ ("#select-version-protocol-gen-code" ).empty(); 
                    $('#select-version-protocol-gen-code').append(`<option>v1.0</option>`);
                }
            }
            platform_last = settings.platform;
        };

        that.getSettings = function() {
            let settings = {};

            settings.version = _version_select.val();
            settings.platform = _platform_select.val();
            settings.structure = _structure_select.val();

            return settings;
        };

        that.getGenList = function() {
            let list = [];

            for(let key in _items){  
                if (_items.hasOwnProperty(key) === true){ 
                    if(_items[key].getCheckbox().is(':checked')) {
                        list.push(_items[key].getMsgObj());
                    }
                }                
            }

            return list;
        };

        that.uninit = function() {
            $('#header-protocol-box').text("详细信息");
            _gen_button.text("输出设置");
            _gen_box.hide();
            _state = '';
            for(let key in _items){  
                if (_items.hasOwnProperty(key) === true){ 
                    _items[key].getCheckbox().hide();
                }                
            }
        };

        return that;
    })();

    _gen_button.click(function() {
        if(_state != 'GEN_MODE') {
            _gen_code_item.init();
        }
        else {
            _gen_code_item.uninit();
        }
    });

    // _gen_confirm_button.click(function() {
    //     let list = _gen_code_item.getGenList();
    //     let settings = _gen_code_item.getSettings();
        
    //     try{
    //         fs.mkdirSync(`./data`);
    //     }
    //     catch(e) {

    //     }

    //     try{
    //         fs.mkdirSync(`./data/${settings.platform}`);
    //     }
    //     catch(e) {
            
    //     }

    //     try{
    //         if(settings.platform == 'mcu') {
    //             fs.mkdirSync(`./data/${settings.platform}/queue_for_mcu`);
    //         }
    //     }
    //     catch(e) {}
     
    //     if(settings.platform == 'mcu') {
    //         try{
    //             fs.mkdirSync(`./data/${settings.platform}/msgs`);
    //         }
    //         catch(e) {}
    //         for(let i = 0; i < list.length; i ++) {
    //             let msg_obj = list[i];
    //             let msg_code = msg_obj.getExportMCUCppCode();
    //             fs.writeFileSync(`./data/${settings.platform}/msgs/${msg_obj.getStrId()}.h`, msg_code);
    //         }
            
    //         fs.writeFileSync(`./data/${settings.platform}/OffboardLink.h`, Offboardlink.getOffboardlinkCode(settings));
           
    //         fs.writeFileSync(`./data/${settings.platform}/MessageBase.h`, Offboardlink.getMessageBaseCode(settings));
    //         fs.copyFileSync('./assets/code/queue_for_mcu/queue.cpp', `./data/${settings.platform}/queue_for_mcu/queue.cpp`);
    //         if(settings.version == 'v2.0') {
    //            fs.copyFileSync('./assets/code/queue_for_mcu/queue.h.v2.0', `./data/${settings.platform}/queue_for_mcu/queue.h`);
    //         }
    //         else {
    //             fs.copyFileSync('./assets/code/queue_for_mcu/queue.h', `./data/${settings.platform}/queue_for_mcu/queue.h`);
    //         }
    //     }
        
    //     if(settings.platform == 'ros2') {
    //         try{
    //             fs.mkdirSync(`./data/${settings.platform}/ros2-robo-bridge`);
    //         }
    //         catch(e) {}
    //         try{
    //             fs.mkdirSync(`./data/${settings.platform}/ros2-robo-utils`);
    //         }
    //         catch(e) {}
    //         try{
    //             fs.mkdirSync(`./data/${settings.platform}/ros2-robo-utils/msg`);
    //         }
    //         catch(e) {}
    //         try{
    //             fs.mkdirSync(`./data/${settings.platform}/ros2-robo-bridge/include`);
    //         }
    //         catch(e) {}
    //         try{
    //             fs.mkdirSync(`./data/${settings.platform}/ros2-robo-bridge/include/robo_bridge`);
    //         }
    //         catch(e) {}
    //         try{
    //             fs.mkdirSync(`./data/${settings.platform}/ros2-robo-bridge/include/robo_bridge/msgs`);
    //         }
    //         catch(e) {}
    //         for(let i = 0; i < list.length; i ++) {
    //             let msg_obj = list[i];
    //             let msg_code = msg_obj.getExportMCUCppCode();
    //             fs.writeFileSync(`./data/${settings.platform}/ros2-robo-bridge/include/robo_bridge/msgs/${msg_obj.getStrId()}.h`, msg_code);
    //         }
            
    //         fs.writeFileSync(`./data/${settings.platform}/ros2-robo-bridge/include/robo_bridge/OffboardLink.h`, Offboardlink.getOffboardlinkCode(settings));
            
    //         let robo_utils_cmakelists = fs.readFileSync('./assets/code/ros2-robo-utils/CMakeLists.txt', 
    //         {encoding:'utf8', flag:'r'}); 

    //         let robo_utils_package_xml = fs.readFileSync('./assets/code/ros2-robo-utils/package.xml', 
    //         {encoding:'utf8', flag:'r'}); 

    //         // mylog('`' + robo_utils_cmakelists + '`');

    //         let robo_utils_cmakelists_gen = eval(
    //             '\`' + robo_utils_cmakelists + '\`'
    //         );

    //         for(let i = 0; i < list.length; i ++) {
    //             let msg = list[i];
    //             let msg_file = '';

    //             msg_file += 'Header header' + os.EOL;
                
    //             let data_list = msg.getDataList();
    //             if(!msg.getRosMsgGenerateEnable()) {
    //                 continue;
    //             }
    //             for(let j = 0; j < data_list.length; j ++) {
    //                 let data = data_list[j];
    //                 let type_target = '';
    //                 let var_target =  '';
    //                 if(data.hasOwnProperty('scale')) {
    //                     type_target = data.type.split('_scale_to_')[1];
    //                 }
    //                 else {
    //                     type_target = data.type;
    //                 }
                    
    //                 if(type_target.split('[').length == 2) {
    //                     type_target = type_target.split('[')[0] + '[]';
    //                 }
                    
    //                 var_target = data.data;
    //                 msg_file += '' + type_target + ' ' + var_target + os.EOL;
    //             }
                
    //             // mylog(msg_file);
    //             fs.writeFileSync(`./data/${settings.platform}/ros2-robo-utils/msg/${msg.getStrId()}.msg`, msg_file);
    //         }
            
    //         fs.writeFileSync(`./data/${settings.platform}/ros2-robo-utils/CMakeLists.txt`, robo_utils_cmakelists_gen);
    //         fs.writeFileSync(`./data/${settings.platform}/ros2-robo-utils/package.xml`, robo_utils_package_xml);

    //         let filenames = fs.readdirSync('./assets/code/ros2-robo-utils/msg'); 
    //         for(let i = 0; i < filenames.length; i ++) {
    //             let file = filenames[i];
    //             fs.copyFileSync(`./assets/code/ros2-robo-utils/msg/${file}`, `./data/${settings.platform}/ros2-robo-utils/msg/${file}`);
    //         }

    //         fs.copyFileSync(`./assets/code/ros2-robo-bridge/CMakeLists.txt`, `./data/${settings.platform}/ros2-robo-bridge/CMakeLists.txt`);
    //         fs.copyFileSync(`./assets/code/ros2-robo-bridge/package.xml`, `./data/${settings.platform}/ros2-robo-bridge/package.xml`);
    //     }

    //     commonUtil.message(`Save success ${list.length} messages to ./data/${settings.platform}`, 'success');
    //     // mylog(`Save success ${list.length} messages to ./data/${settings.platform}`);
    // });
    _gen_confirm_button.click(function() {
        let list = _gen_code_item.getGenList();
        let settings = _gen_code_item.getSettings();
        LingProtocol.generate(settings, list);
        commonUtil.message(`Save success ${list.length} messages to ./data/${settings.platform}`, 'success');
    });

    let Item = function(item_id, msg_obj) {
        let that = {};
        let _select_box = $('#select-box-' + pannel_id);
        let _item_box = $('#content-box-' + pannel_id);
        let _item_id = item_id;
        let _msg_obj = msg_obj;
        let _msg_btn_box, _button, _box, _func_id_16, _data_list, _data_len_16, _checkbox;

        that.getMsgObj = function() {
            return _msg_obj;
        };

        that.getCheckbox = function() {
            return _checkbox;
        };

        that.drawElement = function() {
            _item_box.append('<div class="protocol-msg-box" id="box-' + pannel_id + '-' + _item_id + '">\
                <div class="send-header"><label>变量列表</label></div>\
                <form>\
                    <div class="row mb-3">\
                        <label class="col-sm-3 col-form-label">变量名称</label>\
                        <div class="col-sm-2">\
                                <label class="col-form-label">变量类型</label>\
                        </div>\
                        <div class="col-sm-2">\
                                <label class="col-form-label">Scale</label>\
                        </div>\
                        <div class="col-sm-5">\
                                <label class="col-form-label">描述</label>\
                        </div>\
                    </div>\
                </form>\
            </div>');
            
            _select_box.append('<div class="protocol-msg-btn-box" id="btn-box-' + pannel_id + '-' + _item_id + '">\
                \
            </div>');

            _msg_btn_box = $('#btn-box-' + pannel_id + '-' + _item_id);
            _func_id_16 = _msg_obj.getFuncId().toString(16);
            _func_id_16 = '0'.concat(_func_id_16).slice(-2);

            _data_len_16 = _msg_obj.getDataLen().toString(16);
            _data_len_16 = '0'.concat(_data_len_16).slice(-2);
            
            if(_func_id_count_map[_msg_obj.getFuncId()] > 1) {
                _msg_btn_box.append('<input type="checkbox" id="checkbox-' + pannel_id + '-' + _item_id + '"><label class="btn-protocol-func-id text-warn">0x' + _func_id_16 + '</label>');
            }
            else {
                _msg_btn_box.append('<input type="checkbox" id="checkbox-' + pannel_id + '-' + _item_id + '"><label class="btn-protocol-func-id">0x' + _func_id_16 + '</label>');
            }
            _msg_btn_box.append('<button type="button" class="btn btn-protocol" id="btn-' + pannel_id + '-' + _item_id + '">' + _item_id + '</button>');

            _box = $('#box-' + pannel_id + '-' + _item_id);
            _button = $('#btn-' + pannel_id + '-' + _item_id);
            _checkbox = $('#checkbox-' + pannel_id + '-' + _item_id);

            _box.hide();
            _checkbox.hide();

            _data_list = _msg_obj.getDataList();

            for(let i = 0; i < _data_list.length; i ++) {
            //    _box.append(_data_list[i].type + '<br>');
                _box.append('<div class="row mb-3">\
                <label for="input-type-' + _item_id + '-' + _data_list[i].data +'" class="col-sm-3 col-form-label">' + _data_list[i].data 
                // + `${(!_data_list[i].hasOwnProperty('description')) ? '' : '&nbsp;&nbsp;<i class="bi bi-info-circle" title="' + _data_list[i].description + '"></i>'}`
                 + `</label>`
                + '<div class="col-sm-2">' + _data_list[i].type + '</div>\
                <div class="col-sm-2">' + (
                    _data_list[i].hasOwnProperty('scale') ? _data_list[i].scale : '---'
                ) + '</div>\
                <div class="col-sm-5">' + `${(!_data_list[i].hasOwnProperty('description')) ? '' : _data_list[i].description}` + '</div>\
                </div>');
            }

            _box.append('<div class="send-header"><label>输出格式</label></div>');
            
            _box.append('<div class="protocol-msg-output-box" id="output-box-' + pannel_id + '-' + _item_id + '"></div>');
            
            let _output_box = $('#output-box-' + pannel_id + '-' + _item_id);

            _output_box.append('<table class="table table-hover"><tr>\
                <th>帧头</th>\
                <th>目标地址</th>\
                <th>功能字</th>\
                <th>数据长度</th>\
                <th>数据</th>\
                <th>和校验</th>\
                <th>附加校验</th></tr>\
                <tr>\
                <td>0xAA</td>\
                <td>0xFF</td>\
                <td>0x' + _func_id_16 + '</td>\
                <td>0x' + _data_len_16 + '</td>\
                <td>' + _msg_obj.getOutputDataViz() + '</td>\
                <td>SUM CHECK</td>\
                <td>ADD CHECK</td>\
                </tr>\
                </table>');

            // _box.append('<div class="send-header"><label>代码生成</label></div>');
            
            _box.append('<div class="protocol-export-box" id="export-box' + '-' + pannel_id + '-' + _item_id +'"></div>');
            
            let _export_box = $('#export-box' + '-' + pannel_id + '-' + _item_id);

            _export_box.hide();
            
            _export_box.append('<select id="export' + '-' + pannel_id + '-' + _item_id + '" class="form-control"></select>');

            let _export_select = $('#export' + '-' + pannel_id + '-' + _item_id);
            _export_select.append('<option>MCU C++</option>');
            _export_select.append('<option>ROS Message</option>');
            
            _export_box.append('<br>');
            _export_box.append('<button type="button" class="btn btn-primary btn-block btn-submit" id="export-btn-' + pannel_id + '-' + _item_id + '">' + '生成' + '</button>');

            let _export_button = $('#export-btn' + '-' + pannel_id + '-' + _item_id);

            _export_button.click(function() {
                _msg_obj.getExportMCUCppCode();
            });

            _button.click(function() {
                if(_state == 'GEN_MODE') {
                    _gen_code_item.uninit(); 
                }
                else if(_items.hasOwnProperty(_state)) {
                    _items[_state].uninit();
                }
                
                that.init();
            });
        }

        // that.drawElement();

        that.getId = function() {
            return _item_id;
        }

        that.init = function() {
            // _super.init();
            _state = _item_id;
            _button.css("font-weight","bold");
            $('#header-protocol-box').text("详细信息 " + _item_id + ' - 数据长度 ' + _msg_obj.getDataLen());
            _box.show();
        }

        

        that.uninit = function() {
            // _super.uninit();
            _button.css("font-weight","500");
            _box.hide();
        }

        return that;
    }

    Offboardlink.listMsgsAsync(function(msg_obj) {
        let item = Item(msg_obj.getStrId(), msg_obj);
        _items[msg_obj.getStrId()] = item;
        if(_func_id_count_map.hasOwnProperty(msg_obj.getFuncId())) {
            _func_id_count_map[msg_obj.getFuncId()] += 1;
        }
        else {
            _func_id_count_map[msg_obj.getFuncId()] = 1;
        }
        return {
            item: item
        }
    }).then(function(item_list) {
        // mylog(item_list);
        // mylog(item_list.length);
        item_list.sort(function(a, b){return a.getMsgObj().getFuncId() - b.getMsgObj().getFuncId()});
        for(let i = 0; i < item_list.length; i ++) {
            let item = item_list[i];
            item.drawElement();
        }
    });

    that.update = function() {
        _gen_code_item.update();
    };

    // mylog(_item_list);
    // mylog(_item_list.length);
    // mylog(_func_id_count_map);
    // Item('IMUData');
    // Item('IMUData1');
    // Item('IMUData2');
    // Item('IMUData3');

    return that;
};