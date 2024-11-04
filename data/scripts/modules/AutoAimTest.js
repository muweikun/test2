(function() {
    let that = LingAPI.Common.createScript();

    let interactive_label = LingAPI.Common.createLabel('interactive_label', '命中率测试')
    let test_start_button = LingAPI.Common.createButton('test_start_button', '开始统计');
    let parameter_label = LingAPI.Common.createLabel('interactive_label', '参数设置')
    let enermy_hp_input = LingAPI.Common.createInput('enermy_hp_input', '靶车剩余血量', '0.0');
    let my_bullet_input = LingAPI.Common.createInput('my_bullet_input', '剩余弹量', '0');
    let result_label = LingAPI.Common.createLabel('result_label', '测试结果')

    let _test_start = false;
    let _hp_start = 0;
    let _bullet_start = 0;

    that.getScriptName = function() {
        return '自瞄测试';
    };

    that.onReferenceDataSuperFunc = function(data) {
        my_bullet_input.getHTMLObject().val('' + data.remaining_bullet);
    };

    that.init = function() {
        that.onReferenceDataSuper = that.onReferenceDataSuperFunc;
    };

    that.uninit = function() {
        that.onReferenceDataSuper = () => {};
    };

    that.calResult = function() {
        let _hp_end = LingAPI.Common.parseFloat(enermy_hp_input.getHTMLObject().val());
        let _bullet_end = LingAPI.Common.parseFloat(my_bullet_input.getHTMLObject().val());
        result_label.getHTMLObject().html('测试结果:<br>' + '造成伤害: ' + (-_hp_end + _hp_start) + '<br>发射弹丸数: ' + (-_bullet_end + _bullet_start) + '<br>估算命中率: ' + (-_hp_end + _hp_start) / ((-_bullet_end + _bullet_start) * 10.0) * 100.0 + '%');
    };

    that.drawElement = function(box) {
        box.append(interactive_label.getHTMLDOM());
        box.append(test_start_button.getHTMLDOM());
        box.append(parameter_label.getHTMLDOM());
        box.append(enermy_hp_input.getHTMLDOM());
        box.append(my_bullet_input.getHTMLDOM());
        box.append(result_label.getHTMLDOM());

        test_start_button.getHTMLObject().click(function() {
            _test_start = !_test_start;
            if(_test_start) {
                test_start_button.getHTMLObject().text('停止统计');
                // enermy_hp_input.getHTMLObject().attr('readonly', 'readonly');
                // my_bullet_input.getHTMLObject().attr('readonly', 'readonly');
                _hp_start = LingAPI.Common.parseFloat(enermy_hp_input.getHTMLObject().val());
                _bullet_start = LingAPI.Common.parseFloat(my_bullet_input.getHTMLObject().val());
            }
            else {
                that.calResult();
                test_start_button.getHTMLObject().text('开始统计');
                enermy_hp_input.getHTMLObject().removeAttr('readonly');
                my_bullet_input.getHTMLObject().removeAttr('readonly');
            }
        });
    };

    return that;
})();