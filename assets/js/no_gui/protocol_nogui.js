const ling = require('../api/protocol');
let { Offboardlink } = require(process.cwd() + '/assets/js/api/offboardlink.js');

(function() {
    const arguments = process.argv.slice(2);
    const params = Object.fromEntries(
    arguments.reduce((pre, item) => {
        if (item.startsWith("--")) {
        return [...pre, item.slice(2).split("=")];
        }
        return pre;
    }, []),
    );
    // console.log(params)
    let list = [];

    Offboardlink.listMsgsAsync(function(msg_obj) {
        list.push(msg_obj);
        return {
            item: {}
        }
    }).then(function(item_list) {
        let protocol_tool = ling.LingProtocol.generate(
            {
                platform : params.platform,
                version : params.version
            },
            list
        );
    });

}());