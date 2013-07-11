
var RankDl = require('../dl/rank.dl.js');
var ResultDl = require('../dl/result.dl.js');
var async = require('async');

var RankBL = {};

ERR_DB = '数据库异常'
ERR_TOKEN = '登录超时，请重新登录'
ERR_USER_DATA = '获取用户数据失败，请重新登陆'


/*
cb(err,rank)
*/
RankBL.GetRank = function(cb){

	var rank = []
	RankDl.FindByTypeId(global.TypeId, function(err,doc){
				if(err){
					logger.error(err);
					return callback(ERR_DB);
				}
				rank = doc
				rank.forEach(function(v){
					delete v.RTypeId
					delete v.IsCheet
					delete v.ResultId
				})
				cb(null, rank);
	})

}



/*
cb(err,rank)
*/
RankBL.DelRank = function(cb){

	RankDl.FindAllByTypeId(global.TypeId, function(err,res){
				if(err){
					logger.error(err);
					return callback(ERR_DB);
				}
				cb(null, res);
	})

}


/*
cb(err)
*/
RankBL.Update = function(cb){

	var result = [];
	async.series([function(callback){
			ResultDl.FindTop100(global.TypeId, function(err,doc){
				if(err){
					logger.error(err);
					return callback(ERR_DB);
				}			
				result = doc
				callback();
			})
		},
		function(callback){
			RankDl.AddAll(result, function(err,doc1,doc2){
				if(err){
					logger.error(err);
					return callback(ERR_DB);
				}
				callback();
			})
		}
	],function(err,res){
		if(err){
			return cb(err);
		}
		cb(null, 1);
	})
}

module.exports = RankBL;
