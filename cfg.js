var config = require('./config.json');
console.log(config[process.argv[2]].replace(/\//g, '\\'));