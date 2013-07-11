var mongoose = require('mongoose');
var connstr = require('../config/config.js').db_connection1;
var poolsize =  require('../config/config.js').poolsize;

//console.log(connstr)
mongoose.connect(connstr,{server:{poolSize:poolsize}});

module.exports = mongoose;
