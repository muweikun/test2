let Panel = function(pannel_id, pannel_name) {
    let that = {};

    let _pannel_id = pannel_id;

    let _pannel_name = pannel_name;

    that.init = function() {
        $('#title-text').html(_pannel_name);
        $('#panel-' + _pannel_id).show();
        $('#btn-' + pannel_id).css("font-weight","bold");
    };

    that.update = function() { // 5Hz
        
    };

    that.uninit = function() {
        $('#panel-' + _pannel_id).hide();
        $('#btn-' + pannel_id).css("font-weight","500");
    };

    that.getName = function() {
        return _pannel_name;
    }

    return that;
};