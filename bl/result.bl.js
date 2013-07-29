var UserDl = require('../dl/user.dl.js');
var ResultDl = require('../dl/result.dl.js')
var TokenDl = require('../dl/token.dl.js');
var utils = require('../utils/utils.js')
var async = require('async');

var md5_key = utils.md5('szhouse');

var ResultBL = {};

ERR_DB = '数据库异常'
ERR_TOKEN = '登录超时，请重新登录'
ERR_USER_DATA = '获取用户数据失败，请重新登陆'

/*
tokenid
cb(err,uobj)
*/
ResultBL.GetRecordByTokenId = function(tokenid, cb){

	var token = {}
	var result = []
	async.series([function(callback){
			TokenDl.FindById(tokenid, function(err,doc){
				if(err){
					logger.error(err);
					return callback(ERR_DB);
				}
				if(!doc){
					return callback(ERR_TOKEN);
				}
				token = doc
				callback();
			})
		},
		function(callback){
			ResultDl.FindByUserId(token.UserId, function(err,doc){
				if(err){
					logger.error(err);
					return callback(ERR_DB);
				} 
				result = doc;
				callback();
			})
		}
	],function(err,res){
		if(err){
			return cb(err);
		}
		var resultArray = []
		result.forEach(function(v){
			resultArray.push(
				{
					Score:v.Score,
					EndTime:Date.parse(v.EndTime),
					Mobile:utils.format_mobile(v.Mobile),
					Name:utils.format_name(v.Name)				
				}
			)
		})
		cb(null, resultArray);
	})
}


//删除过期的超过4小时答题记录
ResultBL.DelExpire = function(cb){
	ResultDl.DelExpire(cb);
}	


module.exports = ResultBL;
