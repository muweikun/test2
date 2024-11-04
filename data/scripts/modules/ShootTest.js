(function() {
    let that = LingAPI.Common.createScript();

    let interactive_label = LingAPI.Common.createLabel('interactive_label', '发弹延迟测试')
    let single_shoot_button = LingAPI.Common.createButton('single_shoot_button', '单发测试');
    let positive_rot_button = LingAPI.Common.createButton('positive_rot_button', '正微调');
    let negative_rot_button = LingAPI.Common.createButton('negative_rot_button', '反微调');
    let parameter_label = LingAPI.Common.createLabel('interactive_label', '参数设置')
    let rpm_trigger_input = LingAPI.Common.createInput('rpm_trigger_input', 'rpm触发', '20.0');

    let last_shoot_stamp = null;

    that.getScriptName = function() {
        return '发射测试';
    };

    that.onAmmoDebugFunc = function(data) {
        if(Number.isNaN(parseFloat(rpm_trigger_input.getHTMLObject().val()))) {
            return;
        }
        
        let rpm = (data.rpm1 + data.rpm2) * 0.5;
        if(rpm < LingAPI.Common.parseFloat(rpm_trigger_input.getHTMLObject().val()) && last_shoot_stamp) {
            let shoot_delay_ms = (data.stamp - last_shoot_stamp) / 1000.0;
            single_shoot_button.getHTMLObject().text('单发测试' + ' ' + '延迟: ' + (shoot_delay_ms) + 'ms');
            last_shoot_stamp = null;
        }
    };

    that.onShootDebugFunc = function(data) {
        last_shoot_stamp = data.stamp;
    };

    that.init = function() {
        // 订阅消息
        that.onAmmoDebug = that.onAmmoDebugFunc;
        that.onShootDebug = that.onShootDebugFunc;
    };

    that.uninit = function() {
        that.onAmmoDebug = () => {};
        that.onShootDebug = () => {};
    };

    that.drawElement = function(box) {
        box.append(interactive_label.getHTMLDOM());
        box.append(single_shoot_button.getHTMLDOM());
        box.append(positive_rot_button.getHTMLDOM());
        box.append(negative_rot_button.getHTMLDOM());
        box.append(parameter_label.getHTMLDOM());
        box.append(rpm_trigger_input.getHTMLDOM());
        single_shoot_button.getHTMLObject().click(function() {
            Message[0x06].sendManual({
                seq : 1,
                stamp : 0,
                x : 0,
                y : 0,
                z : 1,
                frame : 0
            });
        });
        positive_rot_button.getHTMLObject().click(function() {
            Message[0x06].sendManual({
                seq : 1,
                stamp : 0,
                x : 0.1,
                y : 0,
                z : -1,
                frame : 0
            });
        });
        negative_rot_button.getHTMLObject().click(function() {
            Message[0x06].sendManual({
                seq : 1,
                stamp : 0,
                x : -0.1,
                y : 0,
                z : -1,
                frame : 0
            });
        });
    };

    return that;
})();