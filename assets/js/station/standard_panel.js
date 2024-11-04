const { SerialPort } = require('serialport');

let StandardPanel = function(pannel_id) {
    let _super = Panel(pannel_id, '基础串口');

    let State = {
        IDLE : 0,
        COM_OPEN : 1
    };

    let _state = State.IDLE;
    let _port = null;
    
    let that = {};
    that.init = _super.init;
    that.update = _super.update;
    that.uninit = _super.uninit;
    that.getName = _super.getName;

    
    $('#com-open-btn').click((data) => {
        let COM = $('#disabledSelect option:selected').attr('id');
        let BaudRate = $('#BaudRate').val();

        if(_state === State.IDLE) {
            try {
                if(COM.length <= 0) {
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
                    // mylog(data);
                    $('.receive-windows').append(SerialBuffer2HexString(data));
                });
    
                $('#com-open-btn').text('关闭');
                _state = State.COM_OPEN;
            } catch (error) {
                commonUtil.message(error.toString(), 'danger');
            }
            
        }
        else {
            _port.close(function(){
                if(_state === State.COM_OPEN)
                {
                    delete _port;
                    _port = null;
                    $('#com-open-btn').text('打开');
                    _state = State.IDLE;
                }
            });
        }
        
    });

    $('#com-send-btn').click((data) => {
        let val = $('#com-input-data').val();
        let hex_str_list = val.split(' ');
        let hex_list = new Uint8Array(hex_str_list.length);
        for(let i = 0; i < hex_str_list.length; i ++) {
            hex_list[i] = parseInt(hex_str_list[i], 16);
        }
        // let tmp = new TextDecoder().decode(hex_list);
        // mylog(tmp);
        if(_port && _port.isOpen)
            _port.write(hex_list);
        else {
            commonUtil.message('Open serial com first!', 'danger');
        }
    });

    $('#com-clear-btn').click(() => {
        $('.receive-windows').text('');
    });

    $('#com-clear-input-btn').click(() => {
        $('.input-send-data').val('');
    });

    let _listSerialPorts = async function() {
        await SerialPort.list().then((ports, err) => {

            if (ports.length === 0) {
                
            }
            
            
            for (let item of ports) {
                let has = false;
                $ (".com option" ). each(function () {
                    let text = $(this).attr('id');
                    if(text === item.path){
                        has = true;
                        return;
                    }                             
                });
                if(has === false){
                    $('.com').append(`<option id="${item.path}">${item.path} | ${item.friendlyName}</option>`);
                }
           }

            $ (".com option" ). each(function () {
                let has = false;
                let text = $(this).attr('id');
                for (let item of ports) {
                    if(text === item.path){
                        has = true;
                        break;
                    }       
                }     
                // mylog($(".com option[text='COM5']").text() + ' ' + has)
                if(has === false){
                    $ (".com" ).empty(); 
                //     $('.com option[text=\'' + text + '\']').text();
                }                        
            });
    
             
        });
    };

    that.init = function() {
        _super.init();
        _state = State.IDLE;
        _port = null;
        $('#com-open-btn').text('打开');
    };
    
    that.update = function() {
        _super.update();
        _listSerialPorts();
    };

    that.uninit = function() {
        _super.uninit();
        if(_port && _port.isOpen) {
            _port.close(function(){
                if(_state === State.COM_OPEN)
                {
                    delete _port;
                    _port = null;
                    _state = State.IDLE;
                }
            });
        }
    };

    return that;
};