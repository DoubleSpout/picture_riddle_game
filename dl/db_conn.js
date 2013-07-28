var mongoose = require('mongoose');
var connstr = require('../config/config.js').db_connection1;
var poolsize =  require('../config/config.js').poolsize;

if(process.env.BAE_ENV_APPID){
 	mongoose.connect(connstr);
}
else{
	mongoose.connect(connstr,{server:{poolSize:poolsize}});
}

module.exports = mongoose;
