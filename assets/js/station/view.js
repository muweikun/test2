const vm = require('vm');

const vm_context = {};
vm.createContext(vm_context);

// const result = vm.runInContext('a + 1', contextObject);

// console.log(result);

let LingView = {};

LingView.ResizeBox = function(html_id) {
    let that = {};

    let _element = $('#' + html_id);

    _element.mouseenter(function(){
        _element.css("background-color", "#878787");
    });

    _element.mouseleave(function(){
        _element.css("background-color", "#efefef");
    });

    return that;
};

LingView.VerticalSplitResizeBox = function(html_id, id1, id2, limit) {
    let that = LingView.ResizeBox(html_id);

    let _element = $('#' + html_id);

    let _resize_start = false;
    let _resize_start_pos = 0;
    let _id1_h_start = 0, _id2_h_start = 0;

    _element.mousedown(function(e){
        // console.log($('#' + id1).height() + ' ' + $('#' + id2).height());
        _resize_start = true;
        _resize_start_pos = e.clientY;
        _id1_h_start = $('#' + id1).height();
        _id2_h_start = $('#' + id2).height();
        $(document).bind('mousemove', _on_mouse_move);
    });

    $(document).mouseup(function(e){
        // console.log('unbind: ' + _resize_start_pos + ' ' + e.clientY);
        if(_resize_start) $(document).unbind('mousemove', _on_mouse_move);
        _resize_start = false;
    });

    let _on_mouse_move = function(e) {
        // console.log(_id1_h_start + _id2_h_start - (_id1_h_start + e.clientY - _resize_start_pos));
        // if(e.clientY < $('#' + id1).offset ().top + 100) e.clientY = $('#' + id1).offset ().top + 100;
        let h1 = _id1_h_start + e.clientY - _resize_start_pos;
        if(h1 < (_id1_h_start + _id2_h_start) * limit.min) h1 = (_id1_h_start + _id2_h_start) * limit.min;
        if(h1 > (_id1_h_start + _id2_h_start) * limit.max) h1 = (_id1_h_start + _id2_h_start) * limit.max;
        
        $('#' + id1).height(h1);
        $('#' + id2).height(_id1_h_start + _id2_h_start - h1);
    };

    return that;
};

LingView.HorizonSplitResizeBox = function(html_id, id1, id2, limit) {
    let that = LingView.ResizeBox(html_id);

    let _element = $('#' + html_id);

    let _resize_start = false;
    let _resize_start_pos = 0;
    let _id1_w_start = 0, _id2_w_start = 0;

    _element.mousedown(function(e){
        // console.log($('#' + id1).width() + ' ' + $('#' + id2).width());
        _resize_start = true;
        _resize_start_pos = e.clientX;
        _id1_w_start = $('#' + id1).width();
        _id2_w_start = $('#' + id2).width();
        $(document).bind('mousemove', _on_mouse_move);
    });

    $(document).mouseup(function(e){
        // console.log('unbind: ' + _resize_start_pos + ' ' + e.clientY);
        if(_resize_start) $(document).unbind('mousemove', _on_mouse_move);
        _resize_start = false;
    });

    let _on_mouse_move = function(e) {
        // console.log(e.clientY);
        let w1 = _id1_w_start + e.clientX - _resize_start_pos;
        if(w1 < (_id1_w_start + _id2_w_start) * limit.min) w1 = (_id1_w_start + _id2_w_start) * limit.min;
        if(w1 > (_id1_w_start + _id2_w_start) * limit.max) w1 = (_id1_w_start + _id2_w_start) * limit.max;
        
        $('#' + id1).width(w1);
        $('#' + id2).width(_id1_w_start + _id2_w_start - w1);
    };

    return that;
};

LingView.PopupWindow = function(html_id) {
    let that = {};

    let _element = $('#' + html_id);
    let _element_title = $('#' + html_id + '-title');
    let _element_confirm = $('#' + html_id + '-confirm');
    let _element_cancel = $('#' + html_id + '-cancel');
    let _element_bg = $('#' + html_id + '-bg');
    let _element_content = $('#' + html_id + '-content');
    let onConfirm = null, onCancel = null;

    that.hide = function() {
        _element_bg.hide();
        _element.hide();
        onConfirm = null;
        return that;
    };

    that.show = function() {
        _element_bg.css('visibility', 'visible');
        _element.css('visibility', 'visible');
        _element_bg.show();
        _element.show();

        return that;
    };

    that.title = function(title) {
        _element_title.text(title);
        return that;
    };

    that.content = function(content) {
        _element_content.html(content);
        return that;
    };

    that.getContent = function() {
        return _element_content.html();
    };


    that.confirm = function(func) {
        onConfirm = func;
        return that;
    };

    that.cancel = function(func) {
        onCancel = func;
        return that;
    };

    that.confirmText = function(text) {
        _element_confirm.text(text);
        return that;
    };

    that.cancelText = function(text) {
        _element_cancel.text(text);
        return that;
    };

    _element_cancel.click(() => {
        if(onCancel !== null) {
            onCancel.apply(that, null);
        }
        that.hide();
    });

    _element_confirm.click(() => {
        if(onConfirm !== null) {
            onConfirm.apply(that, null);
        }
    });

    return that;
};

LingView.DashboardUnit = function(html_id) {
    let that = {};

    let _element = $('#' + html_id);

    let _input = $('#' + html_id + '-input');
    let _text = $('#' + html_id + '-text');
    let _edit_btn = $('#' + html_id + '-edit');
    let _graph_btn = $('#' + html_id + '-graph');

    let _edit_mode = false;
    let _graph_mode = false;

    let _plot_flag = false;
    let _unplot_flag = false;

    let _cutsom_flag = false;

    _input.css('text-align', 'center');
    _edit_btn.css("opacity","0.5");
    _graph_btn.css("opacity","0.5");
    _input.css('background-color', '#ffffff');

    _edit_btn.mouseenter(function() {
        _edit_btn.css("opacity","1.0");
    });

    _edit_btn.mouseleave(function() {
        if(!_edit_mode)
            _edit_btn.css("opacity","0.5");
    });

    _graph_btn.mouseenter(function() {
        _graph_btn.css("opacity","1.0");
    });

    _graph_btn.mouseleave(function() {
        if(!_graph_mode)
            _graph_btn.css("opacity","0.5");
    });

    _graph_btn.mousedown(function() {
        if(_edit_mode) return;
        
        if(_graph_mode) {
            _unplot_flag = true;
        }
        else {
            _plot_flag = true;
        }
    });

    _edit_btn.mousedown(function() {
        _edit_mode = !_edit_mode;
        if(_edit_mode) {
            _input.removeAttr('readonly');
            _input.css('border', '1px solid #898989');
            _input.css('text-align', 'left');
            _edit_btn.css("opacity","1.0");
        }
        else {
            _input.attr('readonly', 'readonly');
            _input.css('text-align', 'center');
            _input.css('border', '0px solid #898989');
        }
    }); 

    that.setGraph = function(data, chart) {
        _graph_mode = true;
        _graph_btn.css("opacity","1.0");
        if(data !== undefined) {
            chart.data.datasets.push({
                data: [],
                pointRadius: 1.0,
                borderWidth: 1.0,
                label: _input.val(),
                borderColor: 'rgb(' + random.integer(5, 250) + ', ' + random.integer(5, 250) + ', ' + random.integer(5, 250) + ')',
            });
            _cutsom_flag = true;
        }
    };

    that.unsetGraph = function(chart) {
        _graph_mode = false;
        _graph_btn.css("opacity","0.5");
        if(chart !== undefined) {
            _cutsom_flag = false;
            for(let i = 0; i < chart.data.datasets.length; i ++) {
                if(chart.data.datasets[i].label === _input.val()) {
                    let dl = chart.data.datasets.splice(i, 1);
                    // console.log(config.data.datasets);
                    // console.log(dl);
                    break;
                }
            }
        }
    };

    that.update = function(msg_list, chart, _stamp_err) {
        if(_edit_mode && _graph_mode) {
            that.unsetGraph(chart);
        }
        if(!_edit_mode) {
            for(let o in msg_list) {
                if(msg_list.hasOwnProperty(o)) {
                    vm_context[msg_list[o].getMsgObj().getStrId()] = msg_list[o].getData();
                }
            }

            let v, v_str, stamp, t;

            try{
                t = new Date().getTime() * 0.001;
                stamp = (t * 1000.0 - _stamp_err);
                v = vm.runInContext(_input.val(), vm_context);
                if((typeof v) === 'number' && String(v).indexOf('.') > -1) v_str = v.toFixed(3);
                else v_str = v;
                _text.text(v_str);
            }
            catch(e) {
                _edit_mode = true;
                _input.removeAttr('readonly');
                _input.css('border', '1px solid #898989');
                _input.css('text-align', 'left');
                _edit_btn.css("opacity","1.0");
                // mylog(e);
            }

            
            if(!_edit_mode) {
                if(_cutsom_flag) {
                    let push_flag = true;
                    for(let i = 0; i < chart.data.labels.length; i ++) {
                        if(Math.abs(chart.data.labels[i] - stamp) < 0.0003) {
                            stamp = chart.data.labels[i];
                            push_flag = false;    
                            break;
                        }
                    }

                    for(let i = 0; i < chart.data.datasets.length; i ++) {
                        // console.log(i + ' ' + config.data.datasets[i]);
                        if((chart && chart.data.datasets[i] !== undefined) && chart.data.datasets[i].label === _input.val()) {
                            chart.data.datasets[i].data[chart.data.datasets[i].data.length] = {
                                x: stamp,
                                y: v,
                                t: t
                            };
                            // console.log(t + ' ' + stamp);
                            if(push_flag) chart.data.labels.push(stamp);
                            break;
                        }
                    }
                }

                if(_unplot_flag) {
                    // console.log(_unplot_flag);
                    for(let o in msg_list) {
                        if(msg_list.hasOwnProperty(o)) {
                            let plot_list = msg_list[o].getPlotList();
                            for(let i = 0; i < plot_list.length; i ++) {
                                if( plot_list[i].getStrId() === _input.val()) {
                                    plot_list[i].unplot();
                                    that.unsetGraph();
                                    _unplot_flag = false;
                                    return;
                                }
                                if(i === plot_list.length - 1) {
                                    that.unsetGraph(chart);
                                    _unplot_flag = false;
                                    return;
                                }
                            }
                        }
                        
                    }
                }

                if(_plot_flag) {
                    
                    for(let o in msg_list) {
                        if(msg_list.hasOwnProperty(o)) {
                            let plot_list = msg_list[o].getPlotList();
                            // console.log(plot_list);
                            for(let i = 0; i < plot_list.length; i ++) {
                                // console.log(plot_list[i].getStrId() );
                                if( plot_list[i].getStrId() === _input.val()) {
                                    plot_list[i].plot();
                                    that.setGraph();
                                    _plot_flag = false;
                                    return;
                                }
                                if(i === plot_list.length - 1) {
                                    that.setGraph(v, chart);
                                    _plot_flag = false;
                                    return;
                                }
                            }
                        }
                        
                    }
                }

                for(let i = 0; i < chart.data.datasets.length; i ++) {
                    if(chart.data.datasets[i].label === _input.val()) {
                        
                        // console.log(graph_mode + ' ' + chart.data.datasets[i].label);
                        that.setGraph();
                        break;
                    }
                    if(i === chart.data.datasets.length - 1) {
                        // console.log(chart.data.datasets[i].label);
                        that.unsetGraph();
                    }
                }
                if(chart.data.datasets.length === 0) {
                    that.unsetGraph();
                }
            }

            // let input_split = _input.val().split('.');
            // if(input_split.length <= 1) return;
            // let msg_valid = false;
            // let msg_func_id;
            // for(let o in msg_list) {
            //     if(!msg_list.hasOwnProperty(o)) continue;
            //     // console.log(o.getMsgObj().getStrId());
            //     if(msg_list[o].getMsgObj().getStrId() === input_split[0]) {
            //         msg_valid = true;
            //         msg_func_id = o;
            //         break;
            //     }
            // }
            // if(msg_valid) {
            //     if(msg_list[msg_func_id].getData().hasOwnProperty(input_split[1])) {
            //         let v = msg_list[msg_func_id].getData()[input_split[1]];
            //         if((typeof v) === 'number' && String(v).indexOf('.') > -1) v = v.toFixed(3);
            //         _text.text(v);
            //     }
            //     else {
            //         _text.text('property not found');
            //     }
            // }
            // else {
            //     _text.text('property not found');
            // }
        }
    };

    return that;
};

let LingViewFactory = {};

LingViewFactory.createDashboardUnit = function(dashboard_html_id, unit_id, default_input) {
    let _element = $('#' + dashboard_html_id);
    if(default_input === undefined) default_input = 'unit ' + unit_id;
    _element.append('<div class="item" id="dashboard-unit' + unit_id +'">\
        <input type="text" class="form-control" id="dashboard-unit' + unit_id +'-input" style="width: 95%; height: 10%;border:0;box-shadow: none;\
        outline:0;" readonly="readonly" value="' + default_input + '">\
        <label id="dashboard-unit' + unit_id +'-text">---</label>\
        <div style="position: absolute; right: 0; top: 0; display: flex; flex-direction: row-reverse;">\
            <div id="dashboard-unit' + unit_id +'-graph" style="font-size: 0.66em; cursor: pointer;padding: 3px;">\
                <i class="bi bi-graph-up"></i>\
            </div>\
            <div id="dashboard-unit' + unit_id +'-edit" style="font-size: 0.66em; cursor: pointer;padding: 3px;">\
                <i class="bi bi-pencil-square"></i>\
            </div>\
        </div>\
    </div>');
    return LingView.DashboardUnit('dashboard-unit' + unit_id);
};

