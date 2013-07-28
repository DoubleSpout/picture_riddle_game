var utils = require('../utils/utils.js');


if(process.env.BAE_ENV_APPID){ //如果是bae则使用console
	global.logger = {}
	logger.trace = logger.debug = logger.info = logger.warn =  logger.fatal = function(msg){
		console.info(msg)
	}
	logger.error = function(msg){
		console.warn(msg)
	}
}
else{ //不是bae使用log4js
		var log4js = require('log4js');
		log4js.configure({
		  appenders: [
		    { type: 'console' },
		    { type: 'file', filename: 'logs/cheese.log', category: 'cheese' }
		  ]
		});
		global.logger = log4js.getLogger('cheese');
}


global.Md5Key = utils.md5('szhouse');
//global.TypeId = '制定typeid,否则自动获取'
global.RiddleNumber = 3;
global.IpMaxResult = 100;
global.IpMaxReg = 1000;


var config_obj = {
	"listen_port":process.env.APP_PORT || 8000,
	"admin":"admin",
	"password":"2138ab8894026ad0cb6107f807cf6e2b",
	"db_connection1":"mongodb://root:123456@127.0.0.1:27017/riddle",
	"db_connection2":"mongodb://root:123456@127.0.0.1:27017/riddle",
	"poolsize":5

}
if(process.env.BAE_ENV_APPID){  //bae support
	config_obj["db_connection1"]="mongodb://"+process.env.BAE_ENV_AK+":"+process.env.BAE_ENV_SK+"@"+process.env.BAE_ENV_ADDR_MONGO_IP+":"+process.env.BAE_ENV_ADDR_MONGO_PORT+"/tDFUzvSmJbNKeDalwLbc"
}


module.exports = config_obj;