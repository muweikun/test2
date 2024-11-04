(function() {
    let that = LingAPI.Common.createScript();

    let data_buf = [];
    let div_id = 0;
    let keep_bottom = false;

    let receive_window = LingAPI.Common.createReceiveWindow('serial_receive_window', '串口接收');

    that.getScriptName = function() {
        return '串口查看';
    };

    that.onComDataFunc = function(data) {
        data_buf.push(data);
    };

    that.init = function() {
        that.onComData = that.onComDataFunc;

        receive_window.getTopButton().click(() => {
            if (keep_bottom == false) {
                keep_bottom = true;
                receive_window.getTopButton().html('取消置底');
            }
            else if (keep_bottom == true) {
                keep_bottom = false;
                receive_window.getTopButton().html('置底');
            }
        });
    };

    that.uninit = function() {
        that.onComData = () => {};
    };

    that.update = function() {
        if(data_buf.length > 0)
        {
            let str = '<p id="serial-reader-update-' + div_id + '" class="receive-windows-pin">';
            for(let i = 0; i < data_buf.length; i ++)
            {
                let ch = data_buf[i].toString(16);
                ch = '0'.concat(ch).slice(-2);
                str = str.concat(ch);
                str = str.concat(' ');
            }
            str = str.concat('</p>');
            receive_window.getHTMLObject().append(str);
            data_buf.length = 0;
            data_buf = [];
            div_id += 1;
        }
        let height = receive_window.getHTMLObject()[0].scrollHeight;

        // let nScrollHight = 0; //滚动距离总长(注意不是滚动条的长度)
        // let nScrollTop = 0;   //滚动到的当前位置
        // let nDivHight = receive_window.getHTMLObject().height();
        // receive_window.getHTMLObject().scroll(function(){
        //  nScrollHight = LingAPI.Common.$(this)[0].scrollHeight;
        //  nScrollTop = LingAPI.Common.$(this)[0].scrollTop;
        //  let paddingBottom = parseInt( LingAPI.Common.$(this).css('padding-bottom') ),paddingTop = parseInt( LingAPI.Common.$(this).css('padding-top') );
        //  if(nScrollTop + paddingBottom + paddingTop + nDivHight >= nScrollHight)
        //     keep_bottom = true;
        // //    alert("滚动条到底部了");
        //  });

        if(keep_bottom)
        {
            receive_window.getHTMLObject().scrollTop(height);
        }
        for(let i = 0; i < div_id - 5; i ++)
        {
            LingAPI.Common.$('#serial-reader-update-' + i).text('');
        }
    };

    that.drawElement = function(box) {
        box.append(receive_window.getHTMLDOM());
        receive_window.getHTMLObject().show();
    };

    return that;
})();