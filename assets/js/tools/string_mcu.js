let SerialBuffer2HexString = function(buf) {
    let str_out = '';
    for(let i = 0; i < buf.length; i ++)
    {
        let ch = buf[i].toString(16);
        ch = '0'.concat(ch).slice(-2);
        str_out = str_out.concat(ch);
        str_out = str_out.concat(' ');
    }
    str_out = str_out.concat('<br>');

    return str_out;
}