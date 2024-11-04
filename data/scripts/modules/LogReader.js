(function() {
    let that = LingAPI.Common.createScript();

    let interactive_label = LingAPI.Common.createLabel('interactive_label', '日志查看');

    that.getScriptName = function() {
        return '日志查看';
    };

    that.onReferenceDataSuperFunc = function(data) {
        
    };

    that.init = function() {
        that.onReferenceDataSuper = that.onReferenceDataSuperFunc;
    };

    that.uninit = function() {
        that.onReferenceDataSuper = () => {};
    };

    that.drawElement = function(box) {
        box.append(interactive_label.getHTMLDOM());
    };

    return that;
})();