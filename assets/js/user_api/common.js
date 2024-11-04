let LingAPI = {};

LingAPI.Common = {};

LingAPI.Common.generateVoice = function (str, rate) {
    speechSynthesis.cancel();
    let speechInstance = new SpeechSynthesisUtterance(str);
    speechInstance.rate = rate;
    speechSynthesis.speak(speechInstance);
};

LingAPI.Common.log = function (str) {
    console.log(str);
};

LingAPI.Common.toast = function(str) {
    commonUtil.message(str);
};

LingAPI.Common.getTime = function() {
    return Date.now();
};

LingAPI.Common.parseFloat = parseFloat;

LingAPI.Common.createButton = function(str_id, str_name) {
    let button = {};

    button.getHTMLDOM = function() {
        return '<button type="button" class="btn btn-robot-msglist" id="btn-' + 'api' + '-' + str_id + '">' + str_name + '</button>';
    };

    button.getHTMLObject = function() {
        return $('#' + 'btn-' + 'api' + '-' + str_id);
    };

    return button;
};

LingAPI.Common.createLabel = function(str_id, str_name) {
    let label = {};

    label.getHTMLDOM = function() {
        return '<label id="label-api-' + str_id + '">' + str_name + '</label>';
    }

    label.getHTMLObject = function() {
        return $('#' + 'label-' + 'api' + '-' + str_id);
    };

    return label;
};

LingAPI.Common.createInput = function(str_id, str_name, default_value) {
    let input = {};

    input.getHTMLDOM = function() {
        return '<label>' + str_name + '</label><input type="text" class="form-control" id="input-api-' + str_id + '" style="height: 20px;border:1px solid #898989;box-shadow: none;\
                    outline:0;" value="' + default_value + '"></div>';
    }

    input.getHTMLObject = function() {
        return $('#' + 'input-' + 'api' + '-' + str_id);
    };

    return input;
};

LingAPI.Common.createReceiveWindow = function(str_id, str_name) {
    let rec_win = {};

    rec_win.getHTMLDOM = function() {
        return '<div class="send-header-plot"><label>' + str_name + '</label><button type="button" class="btn btn-pause" id="rec-win-' + str_id +'-api-pin" title="置底/取消置底">置底</button></div><div id="rec-win-api-' + str_id + '" class="receive-windows-border"></div>';
    }

    rec_win.getHTMLObject = function() {
        return $('#' + 'rec-win-' + 'api' + '-' + str_id);
    };

    rec_win.getTopButton = function() {
        return $('#' + 'rec-win-' + str_id + '-api-pin');
    };
    

    return rec_win;
};

LingAPI.Common.createScript = function() {
    let that = {};

    that.getScriptName = function() {
        return '';
    };

    that.init = function() {

    };

    that.update = function() {
        
    };

    that.uninit = function() {

    };

    that.drawElement = function(box) {

    };

    return that;
};

LingAPI.Common.$ = function(str) {
    return $(str);
};
