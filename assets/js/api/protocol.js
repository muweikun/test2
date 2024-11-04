// const os = require('os');
let fs = require('fs');
let path = require('path');
let { Offboardlink } = require(process.cwd() + '/assets/js/api/offboardlink');

let LingProtocol = {};
LingProtocol.generate = function(settings, list)
{
    try{
        fs.mkdirSync(`./data`);
    }
    catch(e) {

    }

    try{
        fs.mkdirSync(`./data/${settings.platform}`);
    }
    catch(e) {
        
    }

    try{
        if(settings.platform == 'mcu') {
            fs.mkdirSync(`./data/${settings.platform}/queue_for_mcu`);
        }
    }
    catch(e) {}
 
    if(settings.platform == 'mcu') {
        try{
            fs.mkdirSync(`./data/${settings.platform}/msgs`);
        }
        catch(e) {}
        for(let i = 0; i < list.length; i ++) {
            let msg_obj = list[i];
            let msg_code = msg_obj.getExportMCUCppCode();
            fs.writeFileSync(`./data/${settings.platform}/msgs/${msg_obj.getStrId()}.h`, msg_code);
        }
        
        fs.writeFileSync(`./data/${settings.platform}/OffboardLink.h`, Offboardlink.getOffboardlinkCode(settings));
       
        fs.writeFileSync(`./data/${settings.platform}/MessageBase.h`, Offboardlink.getMessageBaseCode(settings));
        fs.copyFileSync('./assets/code/queue_for_mcu/queue.cpp', `./data/${settings.platform}/queue_for_mcu/queue.cpp`);
        if(settings.version == 'v2.0') {
           fs.copyFileSync('./assets/code/queue_for_mcu/queue.h.v2.0', `./data/${settings.platform}/queue_for_mcu/queue.h`);
        }
        else {
            fs.copyFileSync('./assets/code/queue_for_mcu/queue.h', `./data/${settings.platform}/queue_for_mcu/queue.h`);
        }
    }
    
    if(settings.platform == 'ros2') {
        try{
            fs.mkdirSync(`./data/${settings.platform}/ros2-robo-bridge`);
        }
        catch(e) {}
        try{
            fs.mkdirSync(`./data/${settings.platform}/ros2-robo-utils`);
        }
        catch(e) {}
        try{
            fs.mkdirSync(`./data/${settings.platform}/ros2-robo-utils/msg`);
        }
        catch(e) {}
        try{
            fs.mkdirSync(`./data/${settings.platform}/ros2-robo-bridge/include`);
        }
        catch(e) {}
        try{
            fs.mkdirSync(`./data/${settings.platform}/ros2-robo-bridge/include/robo_bridge`);
        }
        catch(e) {}
        try{
            fs.mkdirSync(`./data/${settings.platform}/ros2-robo-bridge/include/robo_bridge/msgs`);
        }
        catch(e) {}
        for(let i = 0; i < list.length; i ++) {
            let msg_obj = list[i];
            let msg_code = msg_obj.getExportMCUCppCode();
            fs.writeFileSync(`./data/${settings.platform}/ros2-robo-bridge/include/robo_bridge/msgs/${msg_obj.getStrId()}.h`, msg_code);
        }
        
        fs.writeFileSync(`./data/${settings.platform}/ros2-robo-bridge/include/robo_bridge/OffboardLink.h`, Offboardlink.getOffboardlinkCode(settings));
        
        let robo_utils_cmakelists = fs.readFileSync('./assets/code/ros2-robo-utils/CMakeLists.txt', 
        {encoding:'utf8', flag:'r'}); 

        let robo_utils_package_xml = fs.readFileSync('./assets/code/ros2-robo-utils/package.xml', 
        {encoding:'utf8', flag:'r'}); 

        // mylog('`' + robo_utils_cmakelists + '`');

        let robo_utils_cmakelists_gen = eval(
            '\`' + robo_utils_cmakelists + '\`'
        );

        for(let i = 0; i < list.length; i ++) {
            let msg = list[i];
            let msg_file = '';

            msg_file += 'Header header' + os.EOL;
            
            let data_list = msg.getDataList();
            if(!msg.getRosMsgGenerateEnable()) {
                continue;
            }
            for(let j = 0; j < data_list.length; j ++) {
                let data = data_list[j];
                let type_target = '';
                let var_target =  '';
                if(data.hasOwnProperty('scale')) {
                    type_target = data.type.split('_scale_to_')[1];
                }
                else {
                    type_target = data.type;
                }
                
                if(type_target.split('[').length == 2) {
                    type_target = type_target.split('[')[0] + '[]';
                }
                
                var_target = data.data;
                msg_file += '' + type_target + ' ' + var_target + os.EOL;
            }
            
            // mylog(msg_file);
            fs.writeFileSync(`./data/${settings.platform}/ros2-robo-utils/msg/${msg.getStrId()}.msg`, msg_file);
        }
        
        fs.writeFileSync(`./data/${settings.platform}/ros2-robo-utils/CMakeLists.txt`, robo_utils_cmakelists_gen);
        fs.writeFileSync(`./data/${settings.platform}/ros2-robo-utils/package.xml`, robo_utils_package_xml);

        let filenames = fs.readdirSync('./assets/code/ros2-robo-utils/msg'); 
        for(let i = 0; i < filenames.length; i ++) {
            let file = filenames[i];
            fs.copyFileSync(`./assets/code/ros2-robo-utils/msg/${file}`, `./data/${settings.platform}/ros2-robo-utils/msg/${file}`);
        }

        fs.copyFileSync(`./assets/code/ros2-robo-bridge/CMakeLists.txt`, `./data/${settings.platform}/ros2-robo-bridge/CMakeLists.txt`);
        fs.copyFileSync(`./assets/code/ros2-robo-bridge/package.xml`, `./data/${settings.platform}/ros2-robo-bridge/package.xml`);
    }
    
    console.log(`Save success ${list.length} messages to ./data/${settings.platform}`);
};

module.exports = {
    LingProtocol: LingProtocol
};
