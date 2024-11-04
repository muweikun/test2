const { exec } = require('child_process');
const iconv = require('iconv-lite');
const { send } = require('process');
const { Random } = require("random-js");
const random = new Random(); // uses the nativeMath engine
// const { ipcRenderer } = require('electron');
const ipc = require('electron').ipcRenderer;
const { shell } = require('electron');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const WebSocket = require('ws');

const script_context = {};
vm.createContext(script_context);

script_context['LingAPI'] = LingAPI;
script_context['Message'] = {};

let RobotPanel = function (pannel_id, isrender) {
    let _super = Panel(pannel_id, '机器人');

    let that = {};

    let getDateTime = function() {
        // let date = new Date();
        // let t = date.getTime();
        // delete date;
        // date = null;
        // return t;
        return Date.now();
    };

    that.init = _super.init;
    
    that.uninit = _super.uninit;
    that.getName = _super.getName;
    let _chart_range_s_setting = 0.5;

    let _ethernet_enable = false;

    let _log_start_t;
    let _log_header = {};
    let _log_data = {};
    //  = [
    //     {
    //         id : 'stamp',
    //         title : 'stamp'
    //     }
    // ];

    let _interval_id;

    let csvWriter;

    let _sub_id = -1;
    let _serial_queue = [];

    let _top_flag = false;
    let _is_sending = false;
    let _is_recording = false;
    let _sending_hz = 0;
    let _sending_cnt = 0;

    if (isrender === undefined) isrender = robot_is_render;

    let State = {
        IDLE: 0,
        CONNECTING: 1,
        CONNECTED: 2
    };

    let GUI = {
        MSGLIST: 0,
        DASHBOARD: 1,
        SENDLIST: 2,
        TEST: 3
    };

    let html_id_list = [
        {
            board: 'select-box-robot-msglist',
            btn: 'btn-robot-msglist'
        },
        {
            board: 'vehicleview-robot',
            btn: 'btn-robot-vehicleview'
        },
        {
            board: 'select-box-robot-sendlist',
            btn: 'btn-robot-sendlist'
        },
        {
            board: 'select-box-robot-test',
            btn: 'btn-robot-test'
        }
    ];

    let _gui = GUI.MSGLIST;
    let _last_gui = _gui;

    let _state = State.IDLE;
    if (isrender) _state = State.CONNECTED;
    let _board_state = -1;
    let _send_state = -1;
    let _script_state = -1;
    let _msg_list_loaded = false;
    let _port = null;
    let _ws = null;
    let _msg_list = {};
    let _send_list = {};
    let _script_list = {};
    let _rec_buffer = [];
    let _index = 0;
    let _heartbeat_count = 0;
    let _start_connect_stamp = 0;
    let _last_heartbeat_send_stamp = 0;
    let _last_heartbeat_receive_stamp = 0;
    let _rtt_ms = 0, _rtt_ms_aver = 0, _stamp_err;


    let chart_canvas = document.getElementById("chart-robot-plot");
    // let dashboard_canvas = document.getElementById("vehicleview-robot");
    // new Chart(chart_canvas, {
    //     type: 'bar',
    //     data: {
    //       labels: ['Red', 'Blue', 'Yellow', 'Green', 'Purple', 'Orange'],
    //       datasets: [{
    //         label: '# of Votes',
    //         data: [12, 19, 3, 5, 2, 3],
    //         borderWidth: 1
    //       }]
    //     },
    //     options: {
    //       scales: {
    //         y: {
    //           beginAtZero: true
    //         }
    //       }
    //     }
    //   });
    const labels = [1, 2, 3, 4, 5, 6];  // 设置 X 轴上对应的标签
    const data = {
        labels: labels,
        datasets: [{
            label: '---',
            data: [1, 2, 3, 4, 5, 6],
            fill: false,
            borderColor: 'rgb(75, 192, 192)', // 设置线的颜色
            tension: 0.1,
        }]
    };
    const config = {
        type: 'line',
        data: {
            labels: [],
            // datasets: [{
            //     label: '---',
            //     data: [{x: 1, y: 20}, {x: 2, y: 2}, {x: 3, y: 10}, {x: 6, y: 12}],
            //     fill: false,
            //     borderColor: 'rgb(75, 192, 192)', // 设置线的颜色
            //     tension: 0.1
            // }],
            datasets: []
        },
        options: {
            // responsive: false,
            maintainAspectRatio: true,
            animation: false,
            aspectRatio: 1.5,
            events: ['mousemove', 'mouseout', 'click', 'touchstart', 'touchmove'],
            plugins: {
                tooltip: {
                    // Tooltip will only receive click events
                    events: ['mousemove', 'mouseout', 'click', 'touchstart', 'touchmove']
                }
            }
        }

        // (width / height)调整大小时，不保持原始画布的宽高比
        //   maintainAspectRatio: false,
        //   aspectRatio: 1,
    };

    const dash_config = {
        type: 'line',
        data: {
            labels: [],
            // datasets: [{
            //     label: '---',
            //     data: [{x: 1, y: 20}, {x: 2, y: 2}, {x: 3, y: 10}, {x: 6, y: 12}],
            //     fill: false,
            //     borderColor: 'rgb(75, 192, 192)', // 设置线的颜色
            //     tension: 0.1
            // }],
            datasets: []
        },
        options: {
            // responsive: false,
            maintainAspectRatio: true,
            animation: false,
            aspectRatio: 1.5,
            events: ['mousemove', 'mouseout', 'click', 'touchstart', 'touchmove'],
            plugins: {
                tooltip: {
                    // Tooltip will only receive click events
                    events: ['mousemove', 'mouseout', 'click', 'touchstart', 'touchmove']
                }
            }
        }

        // (width / height)调整大小时，不保持原始画布的宽高比
        //   maintainAspectRatio: false,
        //   aspectRatio: 1,
    };
    const myChart = new Chart(chart_canvas, config);
    // const dashChart = new Chart(dashboard_canvas, dash_config);

    function addData(chart, label, newData) {
        chart.data.labels.push(label);
        mylog(chart.data.labels);
        let s = chart.data.labels.shift();
        mylog(chart.data.labels);
        chart.data.datasets.push({
            label: '???',
            data: [{ x: 1, y: 1 }, { x: 2, y: 5 }, { x: 3, y: 6 }, { x: 6, y: 0 }],
            fill: false,
            borderColor: 'rgb(75, 192, 0)', // 设置线的颜色
            tension: 0.1
        });
        chart.data.datasets.forEach((dataset) => {
            dataset.data.push(newData);
            dataset.data.sort((a, b) => {
                return a.x - b.x;
            });
            for (let i = 0; i < dataset.data.length; i++) {
                if (dataset.data[i].x <= s) {
                    dataset.data.shift();
                    i -= 1;
                }
                else break;
            }
            mylog(dataset.data);
        });

        chart.update('none');
    }

    let Message = function (item_id, msg_obj) {
        let that = {};

        let _hz = 0;
        let _count = 0, _count_stamp = 0, _stamp = 0;


        _log_header[msg_obj.getStrId()] = [{
            id: 'log_stamp',
            title: 'log_stamp'
        }];
        _log_data[msg_obj.getStrId()] = [];

        let _item_id = item_id;
        let _msg_obj = msg_obj;
        let _data_len = _msg_obj.getDataLen();

        let _script, _script_obj;

        let _script_path = './data/scripts/msgs/' + _msg_obj.getStrId() + '.js';

        // user_script
        // if (fs.existsSync(_script_path)) {
        //     _script = fs.readFileSync(_script_path, { encoding: 'utf8' });
        //     try {
        //         _script_obj = vm.runInContext(_script, script_context);
        //     }
        //     catch (e) {
        //         alert(e);
        //     }
        //     // mylog(_script_path);
        //     // mylog(_script);
        // }


        fs.readFile(_script_path, (err, data) => {
            if (!err && data) {
                try {
                    _script_obj = vm.runInContext(data, script_context);
                }
                catch (e) {
                    alert(e);
                }
            }
        });

        let _miss_count = 0;
        let _abs_count = 0;

        that.getMsgObj = function () {
            return _msg_obj;
        };

        that.getId = function () {
            return _item_id;
        };

        that.getDataLen = function () {
            return _data_len;
        };

        that.getStamp = function () {
            return _stamp;
        };

        that.verify = function (buf) {
            let ver = that.calVerify(buf);
            // mylog(ver.sum_verify + " " + buf[_data_len + 4]);
            if (ver.sum_verify === buf[_data_len + 4] || ver.sum_sum_verify === buf[_data_len + 5]) {
                return true;
            }
            return false;
        };

        that.getHZ = function () {
            return _hz;
        };

        that.calVerify = function (buf) {
            let sum_verify = 0;
            let sum_sum_verify = 0;
            for (let i = 0; i < _data_len + 4; i++) {
                sum_verify += buf[i];
                sum_sum_verify += sum_verify;
                sum_verify &= 0xFF;
                sum_sum_verify &= 0xFF;
            }
            return {
                sum_verify: sum_verify,
                sum_sum_verify: sum_sum_verify
            };
        };

        let _msg_btn_box, _button, _box;
        let _drew = false;


        that.init = function () {
            // if(_board_state >= 0 && _msg_list.hasOwnProperty(_board_state)) {
            //     _msg_list[_board_state].uninit();
            // }
            if (!_drew) return;
            _send_state = -1;
            _script_state = -1;
            _miss_count = 0;
            _abs_count = 0;
            _board_state = _item_id;
            if (_button != undefined) _button.css("font-weight", "bold");
            if (_box != undefined) _box.show();
            $('#send-header-pause').show();
            // $('#send-header-record').show();
            $('#header-robot-box').text("详细信息 " + _msg_obj.getStrId());
        };

        that.uninit = function () {
            if (!_drew) return;
            // _miss_count = 0;
            // _abs_count = 0;
            if (_button != undefined) _button.css("font-weight", "500");
            if (_box != undefined) _box.hide();
            $('#send-header-pause').hide();
            // $('#send-header-record').hide();
        };

        let _data = {};

        that.getData = function () {
            return _data;
        };

        let hexToSingle = function (b) {
            var s = (b & 0x80000000) ? -1 : 1;
            var e = (b & 0x7f800000) / 0x800000 - 127;
            var c = (b & 0x7fffff) / 0x800000;
            var re = s * (1 + c) * Math.pow(2, e);
            return re;
        }

        let _decode_data = function (buf, buf_index, var_type) {
            if (var_type === 'uint8') {
                return {
                    result: buf[buf_index],
                    buf_index: buf_index + 1
                }
            }
            if (var_type === 'uint16') {
                return {
                    result: (buf[buf_index + 1] << 8) | buf[buf_index],
                    buf_index: buf_index + 2
                }
            }
            if (var_type === 'uint32') {
                let f1 = (buf[buf_index + 1] << 8) | buf[buf_index];
                let f2 = (buf[buf_index + 3] << 8) | buf[buf_index + 2];
                let f = (f2 << 16) | f1;
                let b = new Uint32Array([f]);
                f = b[0];
                return {
                    result: f,
                    buf_index: buf_index + 4
                }
            }
            if (var_type === 'int16') {
                let r = (buf[buf_index + 1] << 8) | buf[buf_index];
                // if(r > )
                let b = new Uint16Array([r]);
                r = new Int16Array(b.buffer)[0];
                // mylog(r);
                return {
                    result: r,//(buf[buf_index + 1] << 8) | buf[buf_index],
                    buf_index: buf_index + 2
                }
            }
            if (var_type === 'float32') {
                let f1 = (buf[buf_index + 1] << 8) | buf[buf_index];
                let f2 = (buf[buf_index + 3] << 8) | buf[buf_index + 2];
                let f = (f2 << 16) | f1;
                return {
                    result: hexToSingle(f),
                    buf_index: buf_index + 4
                }
            }
        };

        that.pack = function (data_pkg) {
            let _data_list = msg_obj.getDataList();
            let send_buf = new Uint8Array(_data_len + 6);
            send_buf[0] = 0xaa;
            send_buf[1] = 0xee;
            send_buf[2] = _msg_obj.getFuncId();
            send_buf[3] = _data_len;
            let send_index = 4;
            for (let i = 0; i < _data_list.length; i++) {
                let element = _data_list[i];
                if (element.type === 'uint8') {
                    send_buf[send_index++] = data_pkg[element.data];
                }
                if (element.type === 'uint16') {
                    send_buf[send_index++] = data_pkg[element.data] || 0xff;
                    send_buf[send_index++] = data_pkg[element.data] >> 8;
                }
                if (element.type === 'float32') {
                    let f1 = new Float32Array(1);
                    f1[0] = data_pkg[element.data];
                    let u4 = new Uint8Array(f1.buffer);
                    send_buf[send_index++] = u4[0];
                    send_buf[send_index++] = u4[1];
                    send_buf[send_index++] = u4[2];
                    send_buf[send_index++] = u4[3];
                }
                if (element.type === 'float32_scale_to_uint16') {
                    send_buf[send_index++] = 0;
                    send_buf[send_index++] = 0;
                }
                if (element.type === 'uint32') {
                    send_buf[send_index++] = 0;
                    send_buf[send_index++] = 0;
                    send_buf[send_index++] = 0;
                    send_buf[send_index++] = 0;
                }
            }
            let ver = that.calVerify(send_buf);
            send_buf[send_index++] = ver.sum_verify;
            send_buf[send_index++] = ver.sum_sum_verify;
            // mylog(Array.apply([], send_buf).join(","));
            return send_buf;
        };

        let _plot_list = [];

        that.getPlotList = function () {
            return _plot_list;
        };

        that.unpack = function (buf) {
            if (that.verify(buf)) {
                let _data_list = msg_obj.getDataList();
                let _buf_index = 4;
                let _last_seq;
                if (that.getData().hasOwnProperty('seq'))
                    _last_seq = that.getData().seq;

                if (msg_obj.getStrId() === 'Heartbeat') {
                    _heartbeat_count += 1;
                }

                if (msg_obj.getStrId() === 'HeartbeatReply' && !isrender) {
                    _rtt_ms = Number((process.hrtime.bigint() - _last_heartbeat_send_stamp) / 100000n) / 10.0;
                    if (_rtt_ms_aver === 0) _rtt_ms_aver = _rtt_ms;
                    else _rtt_ms_aver = _rtt_ms_aver * 0.98 + _rtt_ms * 0.02;
                }
                // mylog(_rtt_ms);

                for (let i = 0; i < _data_list.length; i += 1) {
                    let var_type = _data_list[i].type;
                    let var_name = _data_list[i].data;
                    let var_type_cvt;

                    if (var_type.split('_scale_to_').length == 2) {
                        var_type = var_type.split('_scale_to_')[1];
                        var_type_cvt = var_type.split('_scale_to_')[0];
                    }
                    // else {
                    if (var_type.split('[').length == 2) {
                        _data[var_name] = [];
                        let tmp = var_type.split('[')[1];
                        for (let k = 0; k < parseInt(tmp.split(']')[0]); k++) {
                            let r = _decode_data(buf, _buf_index, var_type.split('[')[0]);
                            // _data[var_name] = r.result;
                            _buf_index = r.buf_index;
                            if (var_type_cvt !== undefined) {
                                r.result *= 1.00 / _data_list[i].scale;
                            }
                            // r.result = r.result.toFixed(4);
                            _data[var_name][k] = r.result;
                        }
                    }
                    else {
                        let r = _decode_data(buf, _buf_index, var_type);
                        if (var_type_cvt !== undefined) {
                            r.result *= 1.00 / _data_list[i].scale;
                        }
                        // r.result = r.result.toFixed(4);
                        _data[var_name] = r.result;
                        _buf_index = r.buf_index;
                        if ((typeof r.result) === 'number' && _plot_list.length > i &&/* _board_state === _msg_obj.getFuncId() && */_data.hasOwnProperty('stamp'))
                            _plot_list[i].update(r.result);
                    }
                    // }

                    var_type = var_type_cvt;
                }
                _stamp = getDateTime();
                if (_is_recording && _log_header.hasOwnProperty(msg_obj.getStrId()) && _log_data.hasOwnProperty(msg_obj.getStrId()) && _data.hasOwnProperty('stamp')) {
                    let log_frame = {};
                    // mylog(_log_header[msg_obj.getStrId()].length);
                    for (let k = 1; k < _log_header[msg_obj.getStrId()].length; k++) {
                        let head = _log_header[msg_obj.getStrId()][k].id;
                        log_frame[head] = _data[head];
                    }
                    // log_frame['log_stamp'] = _stamp;
                    log_frame['log_stamp'] = _data['stamp'] / 1000000.0;
                    // mylog(log_frame);
                    // mylog(_log_header[msg_obj.getStrId()]);
                    _log_data[msg_obj.getStrId()].push(log_frame);
                }
                
                for(let script_item in _script_list) {
                    if(_script_list.hasOwnProperty(script_item)) {
                        if(_script_list[script_item].getScriptObj().hasOwnProperty('on' + msg_obj.getStrId())) {
                            _script_list[script_item].getScriptObj()['on' + msg_obj.getStrId()](_data);
                        }
                    }
                }

                // user_script
                if (_script_obj !== undefined) {
                    try {
                        if (_script_obj.hasOwnProperty('onData')) {
                            _script_obj.onData(_data);
                        }
                    }
                    catch (e) {
                        alert(e);
                    }
                }

                _count += 1;
                _abs_count += 1;

                if (msg_obj.getStrId() === 'Heartbeat') {
                    _heartbeat_count += 1;
                    _stamp_err = _stamp - _data['stamp'] * 0.001;
                    _last_heartbeat_receive_stamp = _stamp;
                }

                if (_last_seq !== undefined) {
                    if (_data['seq'] - _last_seq > 1) {
                        _miss_count += _data['seq'] - _last_seq - 1;
                        // mylog('last: ' + _last_seq + ' now: ' + _data['seq']);
                    }
                }
                // if(_last_seq !== undefined) mylog('last: ' + _last_seq + ' now: ' + _data['seq']);
                if (!_drew) {
                    that.drawElement();
                }
                return true;
            }
            return false;
        };

        that.update = function () {
            if (getDateTime() - _count_stamp > 1000.0) {
                _count_stamp = getDateTime();
                _hz = _count;
                _count = 0;
                if (_data.hasOwnProperty('seq')) {
                    if (_abs_count >= 10) {
                        $('#label-msglist-' + _item_id).text('' + _hz + 'hz' + '/' + ("" + ((_miss_count / _abs_count) * 100.0).toFixed(2) + "%"));
                    }
                    else
                        $('#label-msglist-' + _item_id).text('' + _hz + 'hz' + '/-');

                }
                else {
                    $('#label-msglist-' + _item_id).text('' + _hz + 'hz');
                }
            }
            if (_board_state === _item_id) {
                let _data_list = msg_obj.getDataList();
                for (let i = 0; i < _data_list.length; i++) {
                    let v = _data.hasOwnProperty(_data_list[i].data) ? _data[_data_list[i].data] : 0;
                    // if((typeof v) === 'number') _plot_list[i].update(v);
                    if ((typeof v) === 'number' && String(v).indexOf('.') > -1) v = v.toFixed(6);
                    if (!_data_pause_flag) $("#msg-value-" + _item_id + '-' + _data_list[i].data).text(v);
                }
                if (_data.hasOwnProperty('seq')) {
                    if (_abs_count >= 10) {
                        if (!_data_pause_flag) $('#header-robot-box').text("详细信息 " + _msg_obj.getStrId() + " - " + _stamp + (" - " + ((_miss_count / _abs_count) * 100.0).toFixed(2) + "%"));
                    }
                    else {
                        if (!_data_pause_flag) $('#header-robot-box').text("详细信息 " + _msg_obj.getStrId() + " - " + _stamp + " - 采样中");
                    }
                }

                else {
                    if (!_data_pause_flag) $('#header-robot-box').text("详细信息 " + _msg_obj.getStrId() + " - " + _stamp);//  + (" - " + ((1.0 - _miss_count / _abs_count) * 100.0).toFixed(2) + "%"));
                }
            }
        };

        let DataPlot = function (pannel_id, _item_id, i) {
            let that = {};
            let _data_list = msg_obj.getDataList();
            let _index = i;
            let _plot_flag = false;
            let _unplot_flag = false;
            let _str_id = '';

            _str_id = msg_obj.getStrId() + '.' + _data_list[_index].data;

            // mylog('#checkbox-' + pannel_id + '-' + _item_id + '-' + i);
            $('#checkbox-' + pannel_id + '-' + _item_id + '-' + i).change(function () {
                if ($('#checkbox-' + pannel_id + '-' + _item_id + '-' + i).is(':checked')) {
                    that.plot();
                }
                else {
                    that.unplot();
                }
            });
            that.plot = function () {
                _plot_flag = true;
                $('#checkbox-' + pannel_id + '-' + _item_id + '-' + i).prop("checked", true);
            };
            that.unplot = function () {
                _unplot_flag = true;
                $('#checkbox-' + pannel_id + '-' + _item_id + '-' + i).prop("checked", false);
                // myChart.update('none');
            };
            that.getStrId = function () {
                return _str_id;
            };
            that.update = function (v) {
                let t = getDateTime() * 0.001;
                let stamp = _data.stamp * 0.001;
                let push_flag = true;
                if (myChart === undefined) return;

                if (_plot_flag) {
                    _plot_flag = false;
                    config.data.datasets.push({
                        data: [],
                        pointRadius: 1.0,
                        borderWidth: 1.0,
                        label: msg_obj.getStrId() + '.' + _data_list[_index].data,
                        borderColor: 'rgb(' + random.integer(5, 250) + ', ' + random.integer(5, 250) + ', ' + random.integer(5, 250) + ')',
                    });
                    _log_header[msg_obj.getStrId()].push({
                        id: _data_list[_index].data,
                        title: msg_obj.getStrId() + '.' + _data_list[_index].data
                    });
                    return;
                    // console.log(config.data.datasets);
                }

                if (_unplot_flag) {
                    _unplot_flag = false;
                    // delete _log_header[msg_obj.getStrId()];
                    for (let i = 0; i < config.data.datasets.length; i++) {
                        if (config.data.datasets[i].label === msg_obj.getStrId() + '.' + _data_list[_index].data) {
                            let dl = config.data.datasets.splice(i, 1);
                            // console.log(config.data.datasets);
                            // console.log(dl);
                            break;
                        }
                    }
                    for (let i = 0; i < _log_header[msg_obj.getStrId()].length; i++) {
                        if (_log_header[msg_obj.getStrId()][i].id === msg_obj.getStrId() + '.' + _data_list[_index].data) {
                            let dl = _log_header[msg_obj.getStrId()].splice(i, 1);
                            break;
                        }
                    }
                    return;
                    // console.log(config.data.datasets);
                }

                for (let i = 0; i < config.data.labels.length; i++) {
                    if (Math.abs(config.data.labels[i] - stamp) < 0.0003) {
                        stamp = config.data.labels[i];
                        push_flag = false;
                        break;
                    }
                }

                for (let i = 0; i < config.data.datasets.length; i++) {
                    // console.log(i + ' ' + config.data.datasets[i]);
                    if ((config && config.data.datasets[i] !== undefined) && config.data.datasets[i].label === msg_obj.getStrId() + '.' + _data_list[_index].data) {
                        config.data.datasets[i].data[config.data.datasets[i].data.length] = {
                            x: stamp,
                            y: v,
                            t: t
                        };
                        if (push_flag) config.data.labels.push(stamp);
                        break;
                    }
                }
            };
            return that;
        };

        that.drawElement = function () {
            let _select_box = $('#select-box-robot-msglist');
            _select_box.append('<div class="robot-msg-btn-box" id="btn-box-' + 'robot-msglist' + '-' + _item_id + '">\
                \
            </div>');
            _func_id_16 = _msg_obj.getFuncId().toString(16);
            _func_id_16 = '0'.concat(_func_id_16).slice(-2);
            _msg_btn_box = $('#btn-box-' + 'robot-msglist' + '-' + _item_id);
            _msg_btn_box.append('<button type="button" class="btn btn-robot-msglist" id="btn-' + 'msglist' + '-' + _item_id + '">' + _msg_obj.getStrId() + '</button>');
            _msg_btn_box.append('<label id="label-' + 'msglist' + '-' + _item_id + '" class=".btn-robot-hz">' + '0hz</label>');

            _button = $('#btn-' + 'msglist' + '-' + _item_id);
            let _content = $('#content-box-robot');
            let _data_list = msg_obj.getDataList();
            // <div class="send-header"><label>变量列表</label></div>\
            _content.append('<div class="protocol-msg-box" id="box-' + pannel_id + '-' + _item_id + '">\
                <form>\
                    <div class="row mb-3">\
                        <label class="col-sm-2 col-form-label">变量名称</label>\
                        <div class="col-sm-3">\
                                <label class="col-form-label">变量类型</label>\
                        </div>\
                        <div class="col-sm-3">\
                                <label class="col-form-label">变量值</label>\
                        </div>\
                        <div class="col-sm-3">\
                                <label class="col-form-label">描述</label>\
                        </div>\
                        <div class="col-sm-1">\
                                <label class="col-form-label">&nbsp;&nbsp;<i class="bi bi-graph-up"></i></label>\
                        </div>\
                    </div>\
                </form>\
            </div>');
            // _content.append('');

            _box = $('#box-' + pannel_id + '-' + _item_id);
            _box.hide();

            for (let i = 0; i < _data_list.length; i++) {
                let type_str = _data_list[i].type;
                if (type_str.split('_scale_to_').length >= 2) {
                    type_str = type_str.split('_scale_to_')[0];
                }

                let value_str = _data.hasOwnProperty(_data_list[i].data) ? _data[_data_list[i].data] : 0;

                if (value_str.hasOwnProperty('toFixed'))
                    value_str = value_str.toFixed(4);
                // mylog(value_str);
                _box.append('<div class="row mb-3">\
                <label for="input-type-' + _item_id + '-' + _data_list[i].data + '" class="col-sm-2 col-form-label">' + _data_list[i].data
                    // + `${(!_data_list[i].hasOwnProperty('description')) ? '' : '&nbsp;&nbsp;<i class="bi bi-info-circle" title="' + _data_list[i].description + '"></i>'}`
                    + `</label>`
                    + '<div class="col-sm-3">' + type_str + '</div>\
                <div class="col-sm-3" id="' + "msg-value-" + _item_id + '-' + _data_list[i].data + '">' + (
                        value_str  // _data.hasOwnProperty(_data_list[i].data) ? _data[_data_list[i].data] : '---'
                    ) + '</div>\
                <div class="col-sm-3">' + `${(!_data_list[i].hasOwnProperty('description')) ? '' : _data_list[i].description}` + '</div>'
                    + '<input class="col-sm-1" type="checkbox" id="checkbox-' + pannel_id + '-' + _item_id + '-' + i + '"></input></div>');

                _plot_list[i] = DataPlot(pannel_id, _item_id, i);
            }

            _button.click(function () {
                if (_send_state >= 0 && _send_list.hasOwnProperty(_send_state)) {
                    _send_list[_send_state].uninit();
                }
                if (_board_state >= 0 && _msg_list.hasOwnProperty(_board_state)) {
                    _msg_list[_board_state].uninit();
                }
                if (_script_list.hasOwnProperty(_script_state)) {
                    _script_list[_script_state].uninit();
                }
                that.init();
            });

            $('#label-msglist-' + _item_id).css('font-size', '10px');

            _drew = true;
        };

        return that;
    };

    script_context['Message'] = _send_list;

    let MessageToSend = function (item_id, msg_obj) {
        let that = Message(item_id, msg_obj);

        let _msg_obj = msg_obj;
        let _item_id = item_id;
        let _data_len = _msg_obj.getDataLen();
        let _button, _box;

        that.init = function () {
            _send_state = _item_id;
            _board_state = -1;
            _script_state = -1;
            if (_button != undefined) _button.css("font-weight", "bold");
            if (_box != undefined) _box.show();
            $('#send-header-send').show();
            $('#send-header-send-option').show();
            $('#header-robot-box').text("详细信息 " + _msg_obj.getStrId());
        };

        that.uninit = function () {
            if (_button != undefined) _button.css("font-weight", "500");
            if (_box != undefined) _box.hide();
            $('#send-header-send').hide();
            $('#send-header-send-option').hide();

            _send_list[_send_state].unsetReadonly();
            _is_sending = false;
            $('#send-header-send').text('开始发送');
            that.endSend();
        };

        that.drawElement = function () {
            let _select_box = $('#select-box-robot-sendlist');
            _select_box.append('<div class="robot-msg-btn-box" id="btn-box-' + 'robot-sendlist' + '-' + _item_id + '">\
                \
            </div>');

            _msg_btn_box = $('#btn-box-' + 'robot-sendlist' + '-' + _item_id);
            _msg_btn_box.append('<button type="button" class="btn btn-robot-msglist" id="btn-' + 'sendlist' + '-' + _item_id + '">' + _msg_obj.getStrId() + '</button>');

            _button = $('#btn-' + 'sendlist' + '-' + _item_id);

            _button.click(function () {
                if (_send_state >= 0 && _send_list.hasOwnProperty(_send_state)) {
                    _send_list[_send_state].uninit();
                }
                if (_board_state >= 0 && _msg_list.hasOwnProperty(_board_state)) {
                    _msg_list[_board_state].uninit();
                }
                if (_script_list.hasOwnProperty(_script_state)) {
                    _script_list[_script_state].uninit();
                }
                that.init();
            });

            let _content = $('#content-box-robot');

            let _data_list = msg_obj.getDataList();

            _content.append('<div class="protocol-msg-box" id="box-send-' + pannel_id + '-' + _item_id + '">\
                <form>\
                    <div class="row mb-3">\
                        <label class="col-sm-3 col-form-label">变量名称</label>\
                        <div class="col-sm-3">\
                                <label class="col-form-label">变量类型</label>\
                        </div>\
                        <div class="col-sm-3">\
                                <label class="col-form-label">变量值</label>\
                        </div>\
                        <div class="col-sm-3">\
                                <label class="col-form-label">描述</label>\
                        </div>\
                    </div>\
                </form>\
            </div>');

            _box = $('#box-send-' + pannel_id + '-' + _item_id);
            _box.hide();

            for (let i = 0; i < _data_list.length; i++) {
                let type_str = _data_list[i].type;
                if (type_str.split('_scale_to_').length >= 2) {
                    type_str = type_str.split('_scale_to_')[0];
                }

                // mylog(value_str);
                _box.append('<div class="row mb-3">\
                <label for="input-type-send-' + _item_id + '-' + _data_list[i].data + '" class="col-sm-3 col-form-label">' + _data_list[i].data +
                    '</label>' +
                    '<div class="col-sm-3">' + type_str + '</div>\
                    <div class="col-sm-3" style="display: flex;padding: 2px;"><input type="text" class="form-control" id="send-input' + _item_id + '-' + _data_list[i].data + '" style="width: 80%;height: 20px;border:1px solid #898989;box-shadow: none;\
                    outline:0;" value=""></div>\
                <div class="col-sm-3">' + `${(!_data_list[i].hasOwnProperty('description')) ? '---' : _data_list[i].description}` + '</div>');
            }

            _box.append('<br>');
        };

        that.checkInput = function () {
            let _data_list = msg_obj.getDataList();
            let input_ok = true;
            for (let i = 0; i < _data_list.length; i++) {
                let input = $('#send-input' + _item_id + '-' + _data_list[i].data).val();
                if (Number.isNaN(parseFloat(input))) {
                    input_ok = false;
                    break;
                }
            }
            if (Number.isNaN(parseFloat($('#send-freq-input').val())) || Number.isNaN(parseFloat($('#send-count-input').val()))) {
                input_ok = false;
            }

            if (parseFloat($('#send-freq-input').val()) <= 0 || parseInt($('#send-count-input').val()) <= 0) {
                input_ok = false;
            }

            return input_ok;
        };

        that.setReadonly = function () {
            let _data_list = msg_obj.getDataList();
            for (let i = 0; i < _data_list.length; i++) {
                let input = $('#send-input' + _item_id + '-' + _data_list[i].data);
                input.attr('readonly', 'readonly');
            }
            $('#send-freq-input').attr('readonly', 'readonly');
            $('#send-count-input').attr('readonly', 'readonly');
        };

        that.unsetReadonly = function () {
            let _data_list = msg_obj.getDataList();
            for (let i = 0; i < _data_list.length; i++) {
                let input = $('#send-input' + _item_id + '-' + _data_list[i].data);
                input.removeAttr('readonly');
            }
            $('#send-freq-input').removeAttr('readonly');
            $('#send-count-input').removeAttr('readonly');
        };

        let _interval_id;
        let _pkg = {};

        that.sendManual = function (pkg) {
            if (true) {
                // SEND
                if (!isrender) {
                    _serial_queue.push({
                        data: that.pack(pkg),
                        callback: () => {

                        }
                    });
                }
                else {
                    ipc.send('com-send', {
                        data: {
                            data: that.pack(pkg)
                        }
                    });
                }
            }
            $('#send-count-input').val(_sending_cnt);
        };

        that.send = function () {
            if (_sending_cnt >= 1) {
                // SEND
                if (!isrender) {
                    _serial_queue.push({
                        data: that.pack(_pkg),
                        callback: () => {

                        }
                    });
                }
                else {
                    ipc.send('com-send', {
                        data: {
                            data: that.pack(_pkg)
                        }
                    });
                }

                _sending_cnt -= 1;
            }
            $('#send-count-input').val(_sending_cnt);
        };

        that.startSend = function () {
            let _data_list = msg_obj.getDataList();

            for (let i = 0; i < _data_list.length; i++) {
                _pkg[_data_list[i].data] = parseFloat($('#send-input' + _item_id + '-' + _data_list[i].data).val());
            }

            // mylog(_pkg);

            _sending_hz = parseFloat($('#send-freq-input').val());
            _sending_cnt = parseInt($('#send-count-input').val());
            _interval_id = setInterval(that.send, 1.0 / _sending_hz * 1000.0);
        };

        that.endSend = function () {
            if (_interval_id !== undefined) clearInterval(_interval_id);
        };

        return that;
    };

    let TestScript = function(script_id) {
        let that = {};

        let dir = './data/scripts/modules/';

        let _script_id = script_id;
        let _button, _box;
        let _script_obj;

        let _script_path = path.join(dir, _script_id + '.js');

        fs.readFile(_script_path, (err, data) => {
            if (!err && data) {
                try {
                    _script_obj = vm.runInContext(data, script_context);
                    _script_list[_script_id] = that;
                    that.drawElement();
                }
                catch (e) {
                    alert(e);
                }
            }
        });

        that.getScriptObj = function(){
            return _script_obj;
        }

        that.init = function() {
            if(!_script_obj) return;
            _script_state = _script_id;
            _board_state = -1;
            _send_state = -1;
            _script_obj.init();
            if (_button != undefined) _button.css("font-weight", "bold");
            if (_box != undefined) _box.show();
            $('#header-robot-box').text("详细信息 " + _script_obj.getScriptName());
        };

        that.update = function() {
            if(!_script_obj) return;
            _script_obj.update();
        };

        that.uninit = function() {
            if(!_script_obj) return;
            _script_obj.uninit();
            if (_button != undefined) _button.css("font-weight", "500");
            if (_box != undefined) _box.hide();
        };

        that.drawElement = function() {
            let _select_box = $('#select-box-robot-test');
            _select_box.append('<div class="robot-msg-btn-box" id="btn-box-' + 'robot-test' + '-' + _script_id + '">\
                \
            </div>');

            _msg_btn_box = $('#btn-box-' + 'robot-test' + '-' + _script_id);
            _msg_btn_box.append('<button type="button" class="btn btn-robot-msglist" id="btn-' + 'test' + '-' + _script_id + '">' + _script_obj.getScriptName() + '</button>');

            _button = $('#btn-' + 'test' + '-' + _script_id);

            _button.click(function () {
                if (_send_state >= 0 && _send_list.hasOwnProperty(_send_state)) {
                    _send_list[_send_state].uninit();
                }
                if (_board_state >= 0 && _msg_list.hasOwnProperty(_board_state)) {
                    _msg_list[_board_state].uninit();
                }
                if (_script_list.hasOwnProperty(_script_state)) {
                    _script_list[_script_state].uninit();
                }
                that.init();
            });
            
            let _content = $('#content-box-robot');

            _content.append('<div class="protocol-msg-box" id="box-test-' + pannel_id + '-' + _script_id + '">\
            </div>');

            _box = $('#box-test-' + pannel_id + '-' + _script_id);
            _box.hide();

            _script_obj.drawElement(_box);
        };

        return that;
    };

    let _clean_flag;
    let _pause_flag = false;
    let _data_pause_flag = false;

    $('#chart-robot-plot').on("mousewheel DOMMouseScroll", function (event) {

        var delta = (event.originalEvent.wheelDelta && (event.originalEvent.wheelDelta > 0 ? 1 : -1)) ||  // chrome & ie
            (event.originalEvent.detail && (event.originalEvent.detail > 0 ? -1 : 1));              // firefox

        if (delta > 0) {
            // 向上滚
            if (_chart_range_s_setting <= 5.0) _chart_range_s_setting *= 1.2;
            //do somthing
        } else if (delta < 0) {
            // 向下滚
            if (_chart_range_s_setting >= 0.2) _chart_range_s_setting /= 1.2;
            //do somthing
        }
    });

    LingView.VerticalSplitResizeBox('robot-split-vertial', 'content-box-robot', 'plot-robot', { min: 0.2, max: 0.8 });
    LingView.HorizonSplitResizeBox('robot-split-horizon', 'tool-bar-robot', 'robot-body-box', { min: 0.1, max: 0.35 });
    // LingView.DashboardUnit('dashboard-unit1');

    let _dashboard_unit_list = [];

    for (let i = 0; i < 6; i++) {
        _dashboard_unit_list.push(LingViewFactory.createDashboardUnit('vehicleview-robot', i));
    }

    $('#btn-robot-screen').click(() => {
        if (!isrender) {
            ipc.send('openWindow', {
                initialize: {
                    title: '机器人'
                }
            });
        }
    });

    $('#send-header-plot-clear').click(() => {
        _clean_flag = true;
    });

    $('#send-header-plot-pause').click(() => {
        if (_pause_flag == false) {
            _pause_flag = true;
            _data_pause_flag = true;
            $('#send-header-plot-pause').html('<i class="glyphicon glyphicon-play"></i>');
            $('#send-header-pause').html('<i class="glyphicon glyphicon-play"></i>');
        }
        else if (_pause_flag == true) {
            _pause_flag = false;
            _data_pause_flag = false;
            $('#send-header-plot-pause').html('<i class="glyphicon glyphicon-pause"></i>');
            $('#send-header-pause').html('<i class="glyphicon glyphicon-pause"></i>');
        }
    });

    $('#send-header-pause').click(() => {
        if (_data_pause_flag == false) {
            _pause_flag = true;
            _data_pause_flag = true;
            $('#send-header-plot-pause').html('<i class="glyphicon glyphicon-play"></i>');
            $('#send-header-pause').html('<i class="glyphicon glyphicon-play"></i>');
        }
        else if (_data_pause_flag == true) {
            _pause_flag = false;
            _data_pause_flag = false;
            $('#send-header-plot-pause').html('<i class="glyphicon glyphicon-pause"></i>');
            $('#send-header-pause').html('<i class="glyphicon glyphicon-pause"></i>');
        }
    });

    $('#my-title-close').click(() => {
        if (_sub_id >= 0) {
            ipc.send('close-app' + _sub_id);
        }
        else {
            ipc.send('close-app');
        }
    });

    $('#my-title-minus').click(() => {
        if (_sub_id >= 0) {
            ipc.send('minus-app' + _sub_id);
        }
        else {
            ipc.send('minus-app');
        }
    });

    $('#my-title-resize').click(() => {
        if (_sub_id >= 0) {
            ipc.send('resize-app' + _sub_id);
        }
        else {
            ipc.send('resize-app');
        }
    });

    $('#btn-robot-msglist').css("font-weight", "bold");

    $('#btn-robot-msglist').click(() => {
        _gui = GUI.MSGLIST;
    });

    $('#btn-robot-vehicleview').click(() => {
        _gui = GUI.DASHBOARD;
    });

    $('#btn-robot-test').click(() => {
        _gui = GUI.TEST;
    });

    $('#btn-robot-sendlist').click(() => {
        _gui = GUI.SENDLIST;
    });

    $('#my-title-top').click(() => {
        if (_top_flag) {
            _top_flag = false;
            $('#my-title-top').html('<i class="bi bi-arrow-up-square"></i>');
            ipc.send('untop-app' + ((_sub_id < 0) ? '' : _sub_id));
        }
        else {
            _top_flag = true;
            $('#my-title-top').html('<i class="bi bi-arrow-up-square-fill"></i>');
            ipc.send('top-app' + ((_sub_id < 0) ? '' : _sub_id));
        }
    });

    $('#send-header-send').click(() => {
        if (getDateTime() - _last_heartbeat_receive_stamp > 1000) {
            commonUtil.message('Com port unavailuable!', 'danger');
            return;
        }
        if (_is_sending) {
            _send_list[_send_state].unsetReadonly();
            _is_sending = false;
            $('#send-header-send').text('开始发送');

            if (_send_state >= 0) _send_list[_send_state].endSend();
        }
        else {
            if (_send_state >= 0 && _send_list[_send_state].checkInput()) {
                _send_list[_send_state].setReadonly();
                _is_sending = true;
                $('#send-header-send').text('停止发送');
                if (_send_state >= 0) _send_list[_send_state].startSend();
            }
            else {
                commonUtil.message('Check input value!', 'danger');
            }
        }
    });

    $('#send-header-record').click(() => {
        if (_is_recording) {
            _is_recording = false;

            let date_str = '';
            let now = _log_start_t;

            let year = now.getFullYear();
            let month = ('0' + (now.getMonth() + 1)).slice(-2);
            let day = ('0' + now.getDate()).slice(-2);
            let hours = ('0' + now.getHours()).slice(-2);
            let minutes = ('0' + now.getMinutes()).slice(-2);
            let seconds = ('0' + now.getSeconds()).slice(-2);

            date_str = year + '-' + month + '-' + day + '-' + hours + '-' + minutes + '-' + seconds;

            for (let data in _log_header) {
                if (_log_header.hasOwnProperty(data) && _log_header[data].length > 1) {
                    fs.writeFileSync('./data/logs/' + data + '-' + date_str + '.csv', '');
                    csvWriter = createCsvWriter({
                        path: './data/logs/' + data + '-' + date_str + '.csv',
                        header: _log_header[data]
                    });
                    csvWriter
                        .writeRecords(_log_data[data])
                        .then(() => {
                            commonUtil.message('log save success.');
                        });
                    mylog(_log_header[data]);
                }
            }

            // const data = [
            //     {
            //       name: 'John',
            //       surname: 'Snow',
            //       age: 26,
            //       gender: 'M'
            //     }, {
            //       name: 'Clair',
            //       surname: 'White',
            //       age: 33,
            //       gender: 'F',
            //     }, {
            //       name: 'Fancy',
            //       surname: 'Brown',
            //       age: 78,
            //       gender: 'F'
            //     }
            //   ];
            $('#send-header-record').html('<i class="bi bi-record-fill"></i>');
        }
        else {
            _is_recording = true;
            _log_start_t = new Date();

            $('#send-header-record').html('<i class="bi bi-record2"></i>');
        }
    });

    $('#vehicleview-robot').hide();

    // let _frame_len_to_func_id_map = {};

    let canvas, engine;
    if (!isrender) {
        canvas = document.getElementById("renderCanvas"); // Get the canvas element
        engine = new BABYLON.Engine(canvas, true); // Generate the BABYLON 3D engine
    }
    let createScene = function () {
        // Creates a basic Babylon Scene object
        const scene = new BABYLON.Scene(engine);
        scene.clearColor = BABYLON.Color3(0, 0, 0);
        // Creates and positions a free camera
        const camera = new BABYLON.FreeCamera("camera1",
            new BABYLON.Vector3(0, 0, -10), scene);
        // Targets the camera to scene origin
        // camera.detachControl();
        // camera.setTarget(BABYLON.Vector3.Zero());
        // This attaches the camera to the canvas
        camera.attachControl(canvas, true);
        // camera.inputs.clear();
        // camera.lowerBetaLimit = camera.beta;
        // camera.upperBetaLimit = camera.beta;
        // camera.lowerRadiusLimit = camera.radius;
        // camera.upperRadiusLimit = camera.radius;
        // Creates a light, aiming 0,1,0 - to the sky
        const light = new BABYLON.HemisphericLight("light",
            new BABYLON.Vector3(0, 1, 0), scene);
        // // Dim the light a small amount - 0 to 1
        light.intensity = 0.7;
        // // Built-in 'sphere' shape.
        // const sphere = BABYLON.MeshBuilder.CreateSphere("sphere",
        // { diameter: 2, segments: 32 }, scene);
        // // Move the sphere upward 1/2 its height
        // sphere.position.y = 1;
        // // Built-in 'ground' shape.
        // const ground = BABYLON.MeshBuilder.CreateGround("ground",
        //     { width: 6, height: 6 }, scene);
        BABYLON.SceneLoader.ImportMesh("", "./", "./model/fc.glb", scene, function (meshes) {
            // Create a default arc rotate camera and light.
            scene.createDefaultCameraOrLight(true, true, true);

            // The default camera looks at the back of the asset.
            // Rotate the camera by 180 degrees to the front of the asset.
            scene.activeCamera.alpha += Math.PI;
            scene.activeCamera.inputs.clear();

        });
        return scene;
    };
    let scene;
    if (!isrender) {
        scene = createScene(); //Call the createScene function
        // Register a render loop to repeatedly render the scene
        engine.runRenderLoop(function () {
            scene.render();
        });
        // Watch for browser/canvas resize events
        window.addEventListener("resize", function () {
            engine.resize();
        });
    }

    if (isrender) {
        ipc.on('initialize', (e, arg) => {
            // alert(arg);
            document.title = arg.title;
            _sub_id = arg.id;
        });

        ipc.on('com', (e, arg) => {
            for (let i = 0; i < arg.data.length; i++) {
                _processByte(arg.data[i]);
            }
            // console.log(arg);
        });
    }

    let _voice_timer = 0;
    let _text_timer = 0;
    let _text_visible = true;

    let generateVoice = function (str) {
        exec(`powershell.exe Add-Type -AssemblyName System.speech; $speak = New-Object System.Speech.Synthesis.SpeechSynthesizer; $speak.Rate = 1; $speak.Speak([Console]::In.ReadLine()); exit`)
            .stdin.end(iconv.encode(str, 'utf-8'));
    };

    let _debug_text_item = (function () {
        let that = {};

        let _timer_factor = 0.15;
        // let _state = 'IDLE';
        let _voice_timer = 0.0;
        let _index = 0;
        let _text_queue = [];

        that.voice = function (txt) {
            _text_queue.push({
                text: txt,
                spend: txt.length * _timer_factor
            });
        };

        that.update = function (dT_s) {
            _voice_timer += dT_s;
            if (_text_queue.length > _index) {
                let _text = _text_queue[_index];
                if (_voice_timer >= _text.spend) {
                    _voice_timer = 0;
                    generateVoice(_text.text);
                    _index++;
                }
            }
        };

        return that;
    })();

    that.init = function () {
        _super.init();
        if (!isrender) {
            _state = State.IDLE;
        }
        else {
            _state = State.CONNECTED;
        }
        $('#robot-com-btn').text('连接');
        $('#robot-com-id').show();

        if (!isrender)
            that.updateSerial();
        // _interval_id = setInterval(updateSerial, 1);
        _heartbeat_count = 0;
    };

    that.uninit = function () {
        _super.uninit();
        if (!isrender && _port && _port.isOpen) {
            _port.close(function () {
                if (_state === State.CONNECTING || _state === State.CONNECTED) {
                    delete _port;
                    _port = null;
                    _state = State.IDLE;
                }
            });
        }
        _heartbeat_count = 0;
        // if(_interval_id !== undefined) {
        //     clearInterval(_interval_id);
        // }
        $('#robot-com-id').hide();
    };

    let _listSerialPorts = async function () {
        await SerialPort.list().then((ports, err) => {

            if (ports.length === 0) {

            }


            for (let item of ports) {
                let has = false;
                $("#robot-disabledSelect option").each(function () {
                    let text = $(this).attr('id');
                    if (text === item.path) {
                        has = true;
                        return;
                    }
                });
                if (has === false) {
                    $('#robot-disabledSelect').append(`<option id="${item.path}">${item.path} | ${item.friendlyName}</option>`);
                }
            }

            $("#robot-disabledSelect option").each(function () {
                let has = false;
                let text = $(this).attr('id');
                for (let item of ports) {
                    if (text === item.path) {
                        has = true;
                        break;
                    }
                }
                // mylog($(".com option[text='COM5']").text() + ' ' + has)
                if (has === false) {
                    $("#robot-disabledSelect").empty();
                    //     $('.com option[text=\'' + text + '\']').text();
                }
            });


        });
    };

    $('#robot-com-btn').click((data) => {
        let COM = $('#robot-disabledSelect option:selected').attr('id');
        let BaudRate = $('#robot-BaudRate').val();

        if (isrender) return;
        if ($('#robot-Ethernet-enable').is(':checked'))
        {
            _ethernet_enable = true;
        }
        else 
        {
            _ethernet_enable = false;
        }
        if (_state === State.IDLE && !_ethernet_enable) {
            try {
                if (COM.length <= 0) {
                    throw new ComError('Com is null!');
                }
                _port = new SerialPort({
                    path: COM,
                    baudRate: parseInt(BaudRate),
                    autoOpen: false,
                });
                _port.open();
                // $('.receive-windows').append(`打开串口: ${COM}, 波特率: ${BaudRate}`);
                // $('.receive-windows').append('<br/>=======================================<br/>');
                _port.on('data', data => {
                    for (let i = 0; i < data.length; i++) {
                        _processByte(data[i]);
                        for(let script_item in _script_list) {
                            if(_script_list.hasOwnProperty(script_item)) {
                                if(_script_list[script_item].getScriptObj().hasOwnProperty('onComData')) {
                                    _script_list[script_item].getScriptObj()['onComData'](data[i]);
                                }
                            }
                        }
                    }
                    if (!isrender) {
                        ipc.send('com', {
                            data: data
                        });
                    }
                    // mylog(SerialBuffer2HexString(data));
                    // $('.receive-windows').append(SerialBuffer2HexString(data));
                });
                _start_connect_stamp = getDateTime();
                $('#robot-com-btn').text('连接中');
                _state = State.CONNECTING;
            } catch (error) {
                commonUtil.message(error.toString(), 'danger');
            }

        }
        else if (_state == State.CONNECTED && !_ethernet_enable) {
            _port.close(function () {
                if (_state === State.CONNECTED) {
                    delete _port;
                    _port = null;
                    $('#robot-com-btn').text('连接');
                    _state = State.IDLE;
                }
            });
        }
        else if (_state === State.IDLE && _ethernet_enable)
        {
            try {
                _ws && _ws.close();
                delete _ws;
                _ws = null;
                _ws = new WebSocket($('#robot-Ethernet').val());
                _ws.on('open', function open() {
                    _ws.send('Hi Server');
                });
                _ws.on('message', function incoming(data) {
                    // console.log('received: %s', SerialBuffer2HexString(data));
                    // if(file !== '') fs.appendFileSync(file, data);
                    for (let i = 0; i < data.length; i++) {
                        _processByte(data[i]);
                        for(let script_item in _script_list) {
                            if(_script_list.hasOwnProperty(script_item)) {
                                if(_script_list[script_item].getScriptObj().hasOwnProperty('onComData')) {
                                    _script_list[script_item].getScriptObj()['onComData'](data[i]);
                                }
                            }
                        }
                    }
                    if (!isrender) {
                        ipc.send('com', {
                            data: data
                        });
                    }
                });
                _start_connect_stamp = getDateTime();
                $('#robot-com-btn').text('连接中');
                _state = State.CONNECTING;
            }
            catch (error) {
                commonUtil.message(error.toString(), 'danger');
            }
        }
        else if (_state === State.CONNECTED && _ethernet_enable)
        {
            _ws.close();
            delete _ws;
            _ws = null;
            $('#robot-com-btn').text('连接');
            _state = State.IDLE;
        }

    });

    Offboardlink.listScriptsAsync().then(function (scripts) {
        for(let i = 0; i < scripts.length; i ++) {
            TestScript(scripts[i]);
        }
    });

    Offboardlink.listMsgsAsync(function (msg_obj) {
        let item = Message(msg_obj.getFuncId(), msg_obj);
        let item_send = MessageToSend(msg_obj.getFuncId(), msg_obj);
        item_send.drawElement();
        _msg_list[msg_obj.getFuncId()] = item;
        _send_list[msg_obj.getFuncId()] = item_send;

        return {
            item: item
        }
    }).then(function (item_list) {
        _msg_list_loaded = true;
        // let _select_box = $('#select-box-robot-sendlist');
        // for(o in _msg_list) {
        //     if(_msg_list.hasOwnProperty(o))
        //     _select_box.append('<div class="robot-msg-btn-box" id="btn-box-' + 'robot-sendlist' + '-' + o + '">\
        //         '+ _msg_list[o].getMsgObj().getStrId() +'\
        //     </div>');
        // }
    });

    let _processByte = function (data) {
        _rec_buffer[_index] = data;
        _index += 1;
        if (_index >= 2 && _rec_buffer[_index - 2] === 0xaa && data === 0xff) {
            _index = 2;
            _rec_buffer[0] = 0xaa;
            _rec_buffer[1] = 0Xff;
            // mylog(_index);
            return;
        }

        if (_index >= 3 && !_msg_list.hasOwnProperty(_rec_buffer[2])) {
            _index = 0;
            // mylog(_index);
            return;
        }

        if (_index >= 4 && _rec_buffer[3] !== _msg_list[_rec_buffer[2]].getDataLen()) {
            _index = 0;
            // mylog(_index);
            return;
        }
        if (_index === _rec_buffer[3] + 6) {
            _msg_list[_rec_buffer[2]].unpack(_rec_buffer);
            // mylog(_msg_list[_rec_buffer[2]].getMsgObj().getFuncId().toString(16));
        }
    };

    let _text_delta_t = 1.0;
    let _heartbeat_send_flag = 0;

    that.update = function () {
        _super.update();
        if (true) {
            let debug_text = $('#debug-text-robot');

            _text_timer += 0.02;
            if (_text_timer > _text_delta_t) {
                if (_text_visible) {
                    debug_text.hide();
                    _text_visible = false;
                    _text_timer = 0.4 * _text_delta_t;
                }
                else {
                    debug_text.show();
                    _text_visible = true;
                    _text_timer = 0;
                }
            }

            if (!isrender) {
                if (_state !== State.CONNECTED) {
                    debug_text.html('<label style="font-size: ' + $('#renderCanvas').width() * 0.1 + 'px;">[WARNING]</label><label style="font-size: ' + $('#renderCanvas').width() * 0.1 + 'px;">DISCONNECTED</label>');
                    debug_text.css("color", "red");
                    _text_delta_t = 1.0;
                }
                else {
                    debug_text.html('<label style="font-size: ' + $('#renderCanvas').width() * 0.1 + 'px;">[INFO]</label><label style="font-size: ' + $('#renderCanvas').width() * 0.1 + 'px;">CONNECTED</label><label style="font-size: ' + $('#renderCanvas').width() * 0.05 + 'px;">aver rtt ' + _rtt_ms_aver.toFixed(1) + 'ms</label><label style="font-size: ' + $('#renderCanvas').width() * 0.05 + 'px;">render fps ' + engine.getFps().toFixed() + '</label>');
                    debug_text.css("color", "green");
                    _text_delta_t = 0.0;
                    _text_visible = true;
                    debug_text.show();
                    _text_timer = 0;
                }
            }

            _debug_text_item.update(0.02);

            _voice_timer += 0.02;
            if (_voice_timer > 3.0) {
                // _debug_text_item.voice('WARNING!!!NOT CONNECTED');
                // generateVoice('WARNING!!!NOT CONNECTED');
                // generateVoice('警告！！！未连接');
                _voice_timer = 0.0;
            }

            try {
                // scene.getMeshByName('__root__').rotation.y += 0.01;
                if (_msg_list.hasOwnProperty(0x01) && _msg_list[0x01].getData().hasOwnProperty('z') && _state === State.CONNECTED) {
                    // mylog(_msg_list[0x01].getData());
                    let d = _msg_list[0x01].getData();
                    scene.getMeshByName('__root__').rotationQuaternion.w = d.w;
                    scene.getMeshByName('__root__').rotationQuaternion.x = -d.y;
                    scene.getMeshByName('__root__').rotationQuaternion.y = -d.x;// = null;
                    scene.getMeshByName('__root__').rotationQuaternion.z = -d.z;
                    // scene.getMeshByName('__root__').rotate(BABYLON.Axis.Z, -Math.PI, BABYLON.Space.LOCAL);
                    // scene.getMeshByName('__root__').rotationQuaternion.addRotation(0, 0, Math.PI);
                    // scene.getMeshByName('__root__').rotationQuaternion.w = _msg_list[0x01].getData().w;
                    // scene.getMeshByName('__root__').rotationQuaternion.x = _msg_list[0x01].getData().x;
                    // scene.getMeshByName('__root__').rotationQuaternion.y = _msg_list[0x01].getData().y;
                    // scene.getMeshByName('__root__').rotationQuaternion.z = _msg_list[0x01].getData().z;
                }
                else {
                    scene.getMeshByName('__root__').rotationQuaternion.w = 1.0;
                    scene.getMeshByName('__root__').rotationQuaternion.x = 0.0;
                    scene.getMeshByName('__root__').rotationQuaternion.y = 0.0;// = null;
                    scene.getMeshByName('__root__').rotationQuaternion.z = 0.0;
                }
                // scene.getMeshByName('__root__').rotation.x = Math.PI / 2.0;
                // scene.getMeshByName('__root__').rotation.y += Math.PI / 3.0;
                // scene.meshes.forEach(element => {
                // scene.getMeshByName('__root__').position.z += Math.PI / 8.0;
                // scene.getMeshByName('__root__').position.x += Math.PI / 8.0;
                // scene.getMeshByName('__root__').position.y += Math.PI / 8.0;
                //     });
                //     } catch (err) {
                //     mylog('error!', err)
                //     }
                // scene.getMeshByName('__root__').scaling.set(0.03, 0.03, 0.03);
                // mylog(scene.getMeshByName('__root__').rotation);
            }
            catch (e) {

            }

            _listSerialPorts();
            // mylog(_msg_list);

            if (_state == State.CONNECTED) {
                for (let i = 0; i < 255; i += 1) {
                    if (_msg_list.hasOwnProperty(i)) {
                        _msg_list[i].update();
                        // mylog(i);
                    }
                }
            }

            if (!isrender) {
                if (_state === State.IDLE) {
                    _heartbeat_count = 0;
                }
                if (_state === State.CONNECTING && _msg_list_loaded && _heartbeat_count >= 5) {
                    _state = State.CONNECTED;
                    $('#robot-com-btn').text('断开');

                    // addData(myChart, 7, {x: 4, y: 15});
                    commonUtil.message('Connection success', 'success');
                }

                if (_state === State.CONNECTING && _msg_list_loaded && _heartbeat_count < 5) {
                    if (getDateTime() - _start_connect_stamp > 1000) {
                        _state = State.IDLE;
                        $('#robot-com-btn').text('连接');
                        that.uninit();
                        that.init();
                        commonUtil.message('Connection failed timeout', 'danger');
                    }
                }

                if (_state == State.CONNECTED) {
                    if (getDateTime() - _start_connect_stamp > 3000 && _msg_list.hasOwnProperty(0X51) && _msg_list[0X51].getHZ() < 1) {
                        // mylog(_msg_list);
                        commonUtil.message('Connection failed timeout', 'danger');
                        that.uninit();
                        that.init();
                    }
                    let heartbeat_pkg = {
                        from_device: 2,
                        to_device: 0,
                        seq: 0
                    };
                    if (_heartbeat_send_flag === 80) {
                        _heartbeat_send_flag = 0;
                        _serial_queue.push({
                            data: _msg_list[0x51].pack(heartbeat_pkg),
                            callback: () => {
                                _last_heartbeat_send_stamp = process.hrtime.bigint();
                            }
                        });
                        // _port.write(_msg_list[0x51].pack(heartbeat_pkg), (err) => {
                        //     if (!err) {
                        //         _last_heartbeat_send_stamp = process.hrtime.bigint();
                        //     }
                        // });
                    }
                    else {
                        _heartbeat_send_flag += 1;
                    }
                }
            }

            if (_is_sending && getDateTime() - _last_heartbeat_receive_stamp > 1000) {
                commonUtil.message('Message send reject!', 'danger');
                _send_list[_send_state].unsetReadonly();
                _is_sending = false;
                $('#send-header-send').text('开始发送');
                if (_send_state >= 0) _send_list[_send_state].endSend();
            }

            let _chart_range_s = _chart_range_s_setting;
            if (_clean_flag) {
                _clean_flag = false;
                _chart_range_s = -0.01;
            }
            myChart.data.datasets.forEach((dataset) => {
                if (dataset.data !== undefined) {
                    dataset.data.sort((a, b) => {
                        return a.x - b.x;
                    });

                    myChart.data.labels.sort((a, b) => {
                        return a - b;
                    });

                    let _label_guard;
                    for (let i = 0; i < dataset.data.length; i++) {
                        if (dataset.data[i].t <= getDateTime() * 0.001 - _chart_range_s) {
                            _label_guard = dataset.data[i].x;
                            dataset.data.shift();
                            i -= 1;
                        }
                        else break;
                    }
                    for (let i = 0; i < myChart.data.labels.length; i++) {
                        if (_label_guard && myChart.data.labels[i] <= _label_guard) {
                            myChart.data.labels.shift();
                            i -= 1;
                        }
                        // else break;
                    }
                }
            });

            if (!_pause_flag) {
                myChart.update('none');
                dash_config.data = config.data;
                for (let i = 0; i < _dashboard_unit_list.length; i++) {
                    _dashboard_unit_list[i].update(_msg_list, myChart, _stamp_err);
                }
                // dashChart.update('none');
            }
        }

        if (_last_gui != _gui) {
            $('#' + html_id_list[_last_gui].board).hide();
            $('#' + html_id_list[_gui].board).show();
            $('#' + html_id_list[_last_gui].btn).css("font-weight", "500");
            $('#' + html_id_list[_gui].btn).css("font-weight", "bold");
        }

        
        for(let script_item in _script_list) {
            if(_script_list.hasOwnProperty(script_item)) {
                if(_script_list[script_item].getScriptObj().hasOwnProperty('update')) {
                    _script_list[script_item].getScriptObj()['update']();
                }
            }
        }

        _last_gui = _gui;
    };

    if (!isrender) {
        ipc.on('com-send', (e, arg) => {
            // mylog(arg.data);
            _serial_queue.push(arg.data);
        });
    }

    that.updateSerial = function () {
        if (_serial_queue.length > 0 && _port && _port.isOpen) {
            let data = _serial_queue.splice(0, 1);
            // console.log(data[0].data);
            _port.write(data[0].data, (err) => {
                if (!err) {
                    if (data[0].callback !== undefined) data[0].callback();
                }
                // setTimeout(that.updateSerial, 1);
                that.updateSerial();
            });
        }
        else {
            setTimeout(that.updateSerial, 1);
        }
    };


    return that;
};