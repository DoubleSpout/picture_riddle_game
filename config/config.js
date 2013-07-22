var log4js = require('log4js');
var utils = require('../utils/utils.js');


log4js.configure({
  appenders: [
    { type: 'console' },
    { type: 'file', filename: 'logs/cheese.log', category: 'cheese' }
  ]
});

global.logger = log4js.getLogger('cheese');
global.Md5Key = utils.md5('szhouse');
global.TypeId = '51dea3927bf3003c0b000002';
global.RiddleNumber = 1;
global.IpMaxResult = 100;
global.IpMaxReg = 1000;

if(!global.TypeId){//如果没定义类型id
	setTimeout(function(){
		var RiddleTypeDl = require('../dl/riddle_type.dl.js');
			RiddleTypeDl.FindAll(function(err, doc){
				if(err) return console.log('please start mongodb first');
				if(!doc[0]) return console.log('please add one riddle type first');
				global.TypeId = doc[0]._id
			})

	},3000)
}


module.exports = {
	"listen_port":8000,
	"admin":"admin",
	"password":"admin",
	"db_connection1":"mongodb://root:123456@127.0.0.1:27017/riddle",
	"db_connection2":"mongodb://root:123456@127.0.0.1:27017/riddle",
	"poolsize":5

}