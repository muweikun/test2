const crypto = require('crypto');
const data = 'jlsxhcgm';
const md5 = crypto.createHash('md5');
md5.update(data);
const result = md5.digest('hex');
console.log(result);
