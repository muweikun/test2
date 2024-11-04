// let fs = require('fs');
let fs = require("fs-extra");
let path = require('path');
let simpleGit = require('simple-git');
let request = require('request');
let parseString = require('xml2js').parseString;
let xml2js = require('xml2js');
let iconv = require('iconv-lite');

let LingMXTool = {};

let dep_libs = {};
let dep_modules = {};
let vehicle_list = [];

let dep_map = {};

let _token = '05402b1b191bc3cfa08f7be55f087b2240b69412';

let _clone_tasks = [];

let log_callback = () => {
    
};

let completed_callback = () => {

};

let params = {};

let custom_log = (m) => {
    // console.log(m);
    log_callback(m);
};

const git = simpleGit({
    progress({ method, stage, progress }) {
        custom_log(`git.${method} ${stage} ${progress}% complete`);
    },
});

LingMXTool.compare = function (c, items) {
    if (c === '>=') return LingMXTool.versionCompare(items.a.split('.'), items.b.split('.')) >= 0;
    if (c === '>') return LingMXTool.versionCompare(items.a.split('.'), items.b.split('.')) > 0;
    if (c === '==') return LingMXTool.versionCompare(items.a.split('.'), items.b.split('.')) == 0;
    if (c === '<=') return LingMXTool.versionCompare(items.a.split('.'), items.b.split('.')) <= 0;
    if (c === '<') return LingMXTool.versionCompare(items.a.split('.'), items.b.split('.')) < 0;
};

LingMXTool.versionCompare = function (v1_arr, v2_arr) {
    let cpr = 0;
    if (parseInt(v1_arr[0]) > parseInt(v2_arr[0])) {
        cpr = 1;
    }
    else if (parseInt(v1_arr[0]) < parseInt(v2_arr[0])) {
        cpr = -1;
    }
    else {
        if (parseInt(v1_arr[1]) > parseInt(v2_arr[1])) {
            cpr = 1;
        }
        else if (parseInt(v1_arr[1]) < parseInt(v2_arr[1])) {
            cpr = -1;
        }
        else {
            if (parseInt(v1_arr[2]) > parseInt(v2_arr[2])) {
                cpr = 1;
            }
            else if (parseInt(v1_arr[2]) < parseInt(v2_arr[2])) {
                cpr = -1;
            }
            else {
                cpr = 0;
            }
        }
    }
    return cpr;
};

LingMXTool.versionSelect = function (v1, v2) {
    let reg1 = /[<>=]{1,2}/g;
    let reg2 = /[0-9.]{5,10}/g;
    let v1_c = v1.match(reg1)[0];
    let v1_v = v1.match(reg2)[0];
    let v2_c = v2.match(reg1)[0];
    let v2_v = v2.match(reg2)[0];
    let v2_arr = v2_v.split('.');
    let v1_arr = v1_v.split('.');

    if (v1_c === '>=' && v2_c === '>=') {
        if (LingMXTool.versionCompare(v1_arr, v2_arr) >= 0) {
            return v1;
        }
        else return v2;
    }
    else if (v1_c === '>=' && v2_c === '>') {
        if (LingMXTool.versionCompare(v1_arr, v2_arr) > 0) {
            return v1;
        }
        else return v2;
    }
    else if (v1_c === '>' && v2_c === '>=') {
        if (LingMXTool.versionCompare(v1_arr, v2_arr) >= 0) {
            return v1;
        }
        else return v2;
    }
    else if (v1_c === '<=' && v2_c === '<=') {
        if (LingMXTool.versionCompare(v1_arr, v2_arr) <= 0) {
            return v1;
        }
        else return v2;
    }
    else if (v1_c === '<' && v2_c === '<=') {
        if (LingMXTool.versionCompare(v1_arr, v2_arr) <= 0) {
            return v1;
        }
        else return v2;
    }
    else if (v1_c === '<=' && v2_c === '<') {
        if (LingMXTool.versionCompare(v1_arr, v2_arr) < 0) {
            return v1;
        }
        else return v2;
    }
    else if (v1_c === '==' && v2_c === '==') {
        if (LingMXTool.versionCompare(v1_arr, v2_arr) === 0) {
            return v1;
        }
        else {
            Error('dep conflict!' + ' ' + v1 + ' ' + v2);
        }
    }
    else if (v1_c === '>=' && v2_c === '==') {
        if (LingMXTool.versionCompare(v1_arr, v2_arr) <= 0) {
            return v2;
        }
        else {
            Error('dep conflict!' + ' ' + v1 + ' ' + v2);
        }
    }
    else if (v1_c === '==' && v2_c === '>=') {
        if (LingMXTool.versionCompare(v2_arr, v1_arr) <= 0) {
            return v1;
        }
        else {
            Error('dep conflict!' + ' ' + v1 + ' ' + v2);
        }
    }
    else if (v1_c === '<=' && v2_c === '==') {
        if (LingMXTool.versionCompare(v1_arr, v2_arr) >= 0) {
            return v2;
        }
        else {
            Error('dep conflict!' + ' ' + v1 + ' ' + v2);
        }
    }
    else if (v1_c === '==' && v2_c === '<=') {
        if (LingMXTool.versionCompare(v2_arr, v1_arr) >= 0) {
            return v1;
        }
        else {
            Error('dep conflict!' + ' ' + v1 + ' ' + v2);
        }
    }
    else if (v1_c === '>=' && v2_c === '<=') {
        if (LingMXTool.versionCompare(v2_arr, v1_arr) >= 0) {
            return '==' + v2_v;
        }
        else {
            throw Error('dep conflict!' + ' ' + v1 + ' ' + v2);
        }
    }
    else if (v1_c === '<=' && v2_c === '>=') {
        if (LingMXTool.versionCompare(v1_arr, v2_arr) >= 0) {
            return '==' + v1_v;
        }
        else {
            Error('dep conflict!' + ' ' + v1 + ' ' + v2);
        }
    }
    Error('dep conflict!' + ' ' + v1 + ' ' + v2);
};

LingMXTool.generateProject = function (vehiclelist_path, git, out, custom_log, completed) {
    completed_callback = completed;
    vehicle_list = [];
    let fileObjs = fs.readdirSync(vehiclelist_path, { withFileTypes: true });

    log_callback = custom_log;

    try {
        fs.mkdirSync(out);
        fs.mkdirSync(path.join(out, 'Libraries'));
        fs.mkdirSync(path.join(out, 'Modules'));
        fs.mkdirSync(path.join(out, 'Vehicle'));
    }
    catch (e) {
        custom_log(e);
        completed(false);
        return;
    }

    custom_log(vehiclelist_path, out);

    params.out = out;
    
    fileObjs.forEach(file => {
        // custom_log(file.path);
        if (file.isDirectory()) {
            let jsonObjs = fs.readdirSync(path.join(vehiclelist_path, file.name), { withFileTypes: true });
            jsonObjs.forEach(json => {
                if (path.extname(json.name) === '.json') {
                    // custom_log(json);
                    let file1 = fs.readFileSync(path.join(vehiclelist_path, file.name, json.name), { encoding: 'utf8' });
                    let vehicle_obj = JSON.parse(file1);
                    vehicle_list.push(vehicle_obj);
                    for (let i = 0; i < vehicle_obj.dep_libs.length; i++) {
                        // custom_log(vehicle_obj.dep_libs[i].lib_name);
                        if (dep_libs.hasOwnProperty(vehicle_obj.dep_libs[i].lib_name)) {
                            try {
                                dep_libs[vehicle_obj.dep_libs[i].lib_name] = LingMXTool.versionSelect(dep_libs[vehicle_obj.dep_libs[i].lib_name], vehicle_obj.dep_libs[i].version);
                            }
                            catch (e) {
                                custom_log(e);
                                completed(false);
                            }
                        }
                        else {
                            dep_libs[vehicle_obj.dep_libs[i].lib_name] = vehicle_obj.dep_libs[i].version;

                        }
                    }

                    for (let i = 0; i < vehicle_obj.dep_modules.length; i++) {
                        // custom_log(vehicle_obj.dep_libs[i].lib_name);
                        if (dep_modules.hasOwnProperty(vehicle_obj.dep_modules[i].module_name)) {
                            try {
                                dep_modules[vehicle_obj.dep_modules[i].module_name] = LingMXTool.versionSelect(dep_modules[vehicle_obj.dep_modules[i].module_name], vehicle_obj.dep_modules[i].version);
                            }
                            catch (e) {
                                custom_log(e);
                                completed(false);
                            }
                        }
                        else {
                            dep_modules[vehicle_obj.dep_modules[i].module_name] = vehicle_obj.dep_modules[i].version;
                        }
                    }
                }
            });
        }
    });

    let load_lib_count = 0;
    let dep_lib_count = 0;
    let load_mod_count = 0;
    let dep_mod_count = 0;

    for (let lib in dep_libs) {
        if (dep_libs.hasOwnProperty(lib)) {
            dep_lib_count += 1;
            request('https://' + _token + '@bugit.pvhu.top/api/v1/repos/LingBug-embedded-group/ECLIB-' + lib + '/tags', function (error, response, body) {   //body为返回的数据
                if (!error && response.statusCode === 200) {
                    let items = JSON.parse(body);
                    items.sort((a, b) => {
                        return - LingMXTool.versionCompare(a.name.split('.'), b.name.split('.'));
                    });
                    // custom_log(body, response.statusCode) // 请求成功的处理逻辑
                    for (let item in items) {
                        let reg1 = /[<>=]{1,2}/g;
                        let reg2 = /[0-9.]{5,10}/g;
                        if (items.hasOwnProperty(item) && LingMXTool.compare(dep_libs[lib].match(reg1)[0], {
                            a: items[item].name,
                            b: dep_libs[lib].match(reg2)[0]
                        })) {
                            _clone_tasks.push([
                                'https://bugit.pvhu.top/LingBug-embedded-group/ECLIB-' + lib + '.git',
                                path.join(out, 'Libraries', lib),
                                {
                                    '--branch': items[item].name,
                                    '--progress': null
                                },
                                true
                            ]);
                            // custom_log(items[item].tarball_url);
                            // custom_log(`Cloning ECLIB-${lib} ${items[item].name} ...`);
                            // git.clone('https://bugit.pvhu.top/LingBug-embedded-group/ECLIB-' + lib + '.git',
                            //     path.join(out, 'Libraries', lib),
                            //     {
                            //         '--branch': items[item].name,
                            //         '--progress': null
                            //     }
                            // ).then(() => {
                            //     custom_log(`Clone ECLIB-${lib} ${items[item].name} success`);
                            // });
                            load_lib_count += 1;
                            if (load_mod_count + load_lib_count === dep_mod_count + dep_lib_count) LingMXTool.startCloneTasks(_clone_tasks.length);
                            // if(load_lib_count === dep_lib_count) LingMXTool.startCloneTasks(_clone_tasks.length);
                            break;
                        }
                    }
                }
            });
        }
    }


    for (let module in dep_modules) {
        if (dep_modules.hasOwnProperty(module)) {
            dep_mod_count += 1;
            request('https://' + _token + '@bugit.pvhu.top/api/v1/repos/LingBug-embedded-group/ECMOD-' + module + '/tags', function (error, response, body) {   //body为返回的数据
                if (!error && response.statusCode === 200) {
                    let items = JSON.parse(body);
                    items.sort((a, b) => {
                        return - LingMXTool.versionCompare(a.name.split('.'), b.name.split('.'));
                    });
                    // custom_log(body, response.statusCode) // 请求成功的处理逻辑
                    for (let item in items) {
                        let reg1 = /[<>=]{1,2}/g;
                        let reg2 = /[0-9.]{5,10}/g;
                        if (items.hasOwnProperty(item) && LingMXTool.compare(dep_modules[module].match(reg1)[0], {
                            a: items[item].name,
                            b: dep_modules[module].match(reg2)[0]
                        })) {
                            _clone_tasks.push([
                                'https://bugit.pvhu.top/LingBug-embedded-group/ECMOD-' + module + '.git',
                                path.join(out, 'Modules', module),
                                {
                                    '--branch': items[item].name,
                                    '--progress': null
                                },
                                false
                            ]);
                            // custom_log(items[item].tarball_url);
                            // custom_log(`Cloning ECLIB-${lib} ${items[item].name} ...`);
                            // git.clone('https://bugit.pvhu.top/LingBug-embedded-group/ECLIB-' + lib + '.git',
                            //     path.join(out, 'Libraries', lib),
                            //     {
                            //         '--branch': items[item].name,
                            //         '--progress': null
                            //     }
                            // ).then(() => {
                            //     custom_log(`Clone ECLIB-${lib} ${items[item].name} success`);
                            // });
                            load_mod_count += 1;
                            // custom_log(load_mod_count + load_lib_count, dep_mod_count + dep_lib_count)
                            if (load_mod_count + load_lib_count === dep_mod_count + dep_lib_count) LingMXTool.startCloneTasks(_clone_tasks.length);
                            break;
                        }
                    }
                }
            });
        }
    }

};

let asset_path = './assets/code/project';


LingMXTool.generateKeil = function (vehicle_obj_list) {
    custom_log('Generating keil project...');
    fs.copySync(path.join(asset_path, 'Core'), path.join(params.out, 'Core'));
    fs.copySync(path.join(asset_path, 'Drivers'), path.join(params.out, 'Drivers'));
    fs.copySync(path.join(asset_path, 'MDK-ARM'), path.join(params.out, 'MDK-ARM'));
    
    for (let i = 0; i < vehicle_obj_list.length; i++) {
        fs.copySync(path.join(asset_path, 'Robot'), path.join(params.out, 'Vehicle', vehicle_obj_list[i].vehicle_name, 'Robot'));
    }

    let maincpp = fs.readFileSync(path.join(asset_path, 'main.cpp'), {});
    maincpp = iconv.decode(maincpp, 'GB2312').toString();
    
    for (let i = 0; i < vehicle_obj_list.length; i++) {
        fs.writeFileSync(path.join(params.out, 'Vehicle', vehicle_obj_list[i].vehicle_name, 'Robot', 'main.cpp'), 
            eval(maincpp.toString()));
    }

    let data = fs.readFileSync(path.join(asset_path, 'MDK-ARM/robo_template.uvprojx'));

    let walk = function (dir, done) {
        let results = [];

        let list = fs.readdirSync(dir);

        let i = 0;

        (function next() {
            let file = list[i++];
            if (!file) return done(null, results);
            file = path.resolve(dir, file);
            let stat = fs.statSync(file);
            if (stat && stat.isDirectory()) {
                walk(file, function (err, res) {
                    results = results.concat(res);
                    next();
                });
            } else {
                results.push(file);
                next();
            }
        })();


        // fs.readdir(dir, function (err, list) {
        //     if (err) return done(err);
        //     let i = 0;
        //     (function next() {
        //         let file = list[i++];
        //         if (!file) return done(null, results);
        //         file = path.resolve(dir, file);
        //         fs.stat(file, function (err, stat) {
        //             if (stat && stat.isDirectory()) {
        //                 walk(file, function (err, res) {
        //                     results = results.concat(res);
        //                     next();
        //                 });
        //             } else {
        //                 results.push(file);
        //                 next();
        //             }
        //         });
        //     })();
        // });
    };

    let hasGroup = function (target, group_name) {
        for (let i = 0; i < target.Groups[0].Group.length; i++) {
            // custom_log(target.Groups[0].Group[i].GroupName[0], group_name);
            if (target.Groups[0].Group[i].GroupName[0] === group_name) {

                return true;
            }
        }
        return false;
    }

    let getFileListOfDep = function (dep, type_str, name) {
        let file_list = [];
        // let fileObjs = fs.readdirSync(_path, { withFileTypes: true });
        walk(path.join(params.out, type_str, name), function (err, results) {
            if (err) throw err;
            let myresults = [];
            // custom_log(results);
            for (let i = 0; i < results.length; i++) {
                // if(name === 'Math')custom_log(dep);
                let exclude = false;
                if (dep.hasOwnProperty('exclude_dir')) {
                    for (let j = 0; j < dep.exclude_dir.length; j++) {
                        let exclude_dir = path.join(params.out, type_str, name, dep.exclude_dir[j]);
                        if (exclude_dir === path.dirname(results[i])) {
                            // custom_log(results[i]);
                            exclude = true;
                            // break;
                        }
                        // custom_log(path.join(params.out, 'Libraries', name, dep.exclude_dir[j]));
                    }
                }
                // if(path.join(params.out, 'Libraries', ))
                if (!exclude && (path.extname(results[i]) === '.cpp' || path.extname(results[i]) === '.h' || path.extname(results[i]) === '.hpp' || path.extname(results[i]) === '.c' || path.extname(results[i]) === '.json')) {
                    // custom_log(results[i] + ' ' + exclude);
                    let relative = path.relative(path.join(params.out, 'MDK-ARM'), results[i]);
                    let relative_tmp = path.relative(path.join(params.out), results[i]);
                    myresults.push(path.relative(path.join(params.out, 'MDK-ARM'), results[i]));
                    if (file_list[path.dirname(relative_tmp).split(path.sep).join('/')] === undefined) file_list[path.dirname(relative_tmp).split(path.sep).join('/')] = [];
                    file_list[path.dirname(relative_tmp).split(path.sep).join('/')].push({
                        FileName: [path.basename(relative)],
                        FileType: (function () {
                            let map = {
                                '.cpp': '8',
                                '.h': '5',
                                '.c': '1',
                                // '.hpp' : '5',
                                '.json': '5'
                            };
                            return [map[path.extname(relative)]]
                        })(),
                        FilePath: [relative]
                    });

                }
            }

        });
        return file_list;
    };

    let group_option_xml = fs.readFileSync(path.join(asset_path, 'xml', 'group_option.xml'));

    xml2js.parseStringPromise(group_option_xml)
        .then((group_option) => {
            parseString(data, function (err, result) {

                let target_base = result.Project.Targets[0].Target[0];
                // custom_log(result.Project.Targets[0].Target);
                // console.dir(result.Project.RTE[0].components[0].component[0].targetInfos[0].targetInfo[0]['$']);
                // console.dir(result.Project.RTE[0].components[0].component[1].targetInfos[0].targetInfo[0]);
                result.Project.RTE[0].components[0].component[0].targetInfos[0].targetInfo.splice(0, 2);
                result.Project.RTE[0].components[0].component[1].targetInfos[0].targetInfo.splice(0, 2);
                result.Project.Targets[0].Target.splice(0, 2);
        
                for (let i = 0; i < vehicle_obj_list.length; i++) {
                    result.Project.RTE[0].components[0].component[0].targetInfos[0].targetInfo.push(
                        { '$': { name: vehicle_obj_list[i].vehicle_name } }
                    );
                    result.Project.RTE[0].components[0].component[1].targetInfos[0].targetInfo.push(
                        { '$': { name: vehicle_obj_list[i].vehicle_name } }
                    );
                    let target = JSON.parse(JSON.stringify(target_base));
                    target.TargetName = [vehicle_obj_list[i].vehicle_name];
                    for (let j = 0; j < target.Groups[0].Group.length; j++) {
                        // custom_log(target.Groups[0].Group[j].Files[0].File[0]);
                        let group = target.Groups[0].Group[j];
                        if (group.GroupName[0].split('/')[0] === 'Libraries' || group.GroupName[0].split('/')[0] === 'Vehicle' || group.GroupName[0].split('/')[0] === 'Modules') {
                            target.Groups[0].Group.splice(j, 1);
                            j -= 1;
                        }
                    }
        
                    for (let j = 0; j < vehicle_obj_list[i].dep_libs.length; j++) {
                        // custom_log(vehicle_obj_list[i].dep_libs[j]);
                        dep_map[vehicle_obj.dep_libs[j].lib_name] = JSON.parse(fs.readFileSync(path.join(params.out, 'Libraries', vehicle_obj_list[i].dep_libs[j].lib_name, 'module.json')));
                        let dep = dep_map[vehicle_obj_list[i].dep_libs[j].lib_name];
                        // dep.lib_name = dep_map[vehicle_obj_list[i].dep_libs[j].lib_name];
                        let file_list = getFileListOfDep(dep, 'Libraries', dep.lib_name);
                        for (let group in file_list) {
                            if (file_list.hasOwnProperty(group)) {
                                !hasGroup(target, group) &&
                                    target.Groups[0].Group.push({
                                        // GroupOption: 
                                        GroupName: group,//['Libraries/' + dep.lib_name],
                                        Files: [
                                            {
                                                File: file_list[group]
                                            }
                                        ]
                                    });
                            }
                        }
                    }
        
                    for (let j = 0; j < vehicle_obj_list[i].dep_modules.length; j++) {
                        // custom_log(vehicle_obj_list[i].dep_libs[j]);
                        dep_map[vehicle_obj.dep_modules[j].module_name] = JSON.parse(fs.readFileSync(path.join(params.out, 'Modules', vehicle_obj_list[i].dep_modules[j].module_name, 'module.json')));
                        let dep = dep_map[vehicle_obj_list[i].dep_modules[j].module_name];
                        // dep.lib_name = dep_map[vehicle_obj_list[i].dep_libs[j].lib_name];
                        let file_list = getFileListOfDep(dep, 'Modules', dep.module_name);
                        for (let group in file_list) {
                            if (file_list.hasOwnProperty(group)) {
                                !hasGroup(target, group) &&
                                    target.Groups[0].Group.push({
                                        GroupName: group,//['Libraries/' + dep.lib_name],
                                        Files: [
                                            {
                                                File: file_list[group]
                                            }
                                        ]
                                    });
                            }
                        }
        
                    }
        
                    let dep_vehicle = {
        
                    };

                    for(let k = 0; k < vehicle_obj_list.length; k ++) {
                        let file_list_vehicle = getFileListOfDep(dep_vehicle, 'Vehicle', vehicle_obj_list[k].vehicle_name);
                        for (let group in file_list_vehicle) {
                            if (file_list_vehicle.hasOwnProperty(group)) {
                                !hasGroup(target, group) &&
                                    target.Groups[0].Group.push(
                                        (group === 'Vehicle/' + vehicle_obj_list[i].vehicle_name + '/Robot') ? {
                                        GroupName: group,//['Libraries/' + dep.lib_name],
                                        Files: [
                                            {
                                                File: file_list_vehicle[group]
                                            }
                                        ]
                                    }
                                        : {
                                            GroupName: group,//['Libraries/' + dep.lib_name],
                                            GroupOption : group_option.GroupOption,
                                            Files: [
                                                {
                                                    File: file_list_vehicle[group]
                                                }
                                            ]
                                        });
                            }
                        }
                    } 
        
                    result.Project.Targets[0].Target.push(target);
                }
        
                var builder = new xml2js.Builder();
                var xml = builder.buildObject(result);
        
                // custom_log(result);
        
        
                fs.writeFileSync(path.join(params.out, 'MDK-ARM/robo_template.uvprojx'), xml);
        
                // custom_log(result.Project.Targets[0].Target[0]);
                // for(let i = 0; i < result.Project.Targets[0].Target[0].Groups[0].Group.length; i ++) {
                //     let group = result.Project.Targets[0].Target[0].Groups[0].Group[i];
                //     if(group.GroupName[0].split('/')[0] === 'Libraries' || group.GroupName[0].split('/')[0] === 'Vehicle' || group.GroupName[0].split('/')[0] === 'Modules') {
                //         result.Project.Targets[0].Target[0].Groups[0].Group.splice(i, 1);
                //         i -= 1;
                //     }
                // }
                // result.Project.Targets[0].Target[1].Groups[0].Group = [];
        
            });
        })
        .catch(() => {
            completed_callback(false);
        });
    completed_callback(true);
};

// let file = fs.readFileSync('G:/roborm/vehicle/Sentry_Gimbal/vehicle.json', { encoding: 'utf8' });
// let vehicle_obj = JSON.parse(file);
// let file1 = fs.readFileSync('G:/roborm/vehicle/Sentry_Chassis/vehicle.json', { encoding: 'utf8' });
// let vehicle_obj1 = JSON.parse(file1);

LingMXTool.startCloneTasks = function (length) {
    if (_clone_tasks.length === 0) {
        LingMXTool.generateKeil(vehicle_list);
        return;
    }
    let clone_task = _clone_tasks.pop();
    custom_log(`Cloning ${clone_task[0]} ${clone_task[2]['--branch']} to ${clone_task[1]} ${length - _clone_tasks.length}/${length}`);
    git.clone(clone_task[0], clone_task[1], clone_task[2]).then(() => {
        custom_log(`Clone success`);

        LingMXTool.startCloneTasks(length);
    });
};

LingMXTool.logCallback = function(func){
    log_callback = func;
};


// const arguments = process.argv.slice(2);

// const params = Object.fromEntries(
//     arguments.reduce((pre, item) => {
//         if (item.startsWith("--")) {
//             return [...pre, item.slice(2).split("=")];
//         }
//         return pre;
//     }, []),
// );

// custom_log(params);
// LingMXTool.startCloneTasks(0);
// LingMXTool.generateProject(params.path, simpleGit(), params.out);
// custom_log(dep_modules);
module.exports = {
    LingMXTool: LingMXTool
};
