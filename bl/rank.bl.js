var RankDl = require('../dl/rank.dl.js');
var ResultDl = require('../dl/result.dl.js');
var async = require('async');
var utils = require('../utils/utils.js');

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

				doc.forEach(function(v){
					rank.push({
						Mobile:v.Mobile,
						Name:v.Name,
						Score:v.Score,
						Time:Date.parse(v.Time),
						InputTime:Date.parse(v.InputTime)
					})
				})
				
				cb(null, rank);
	})

}



/*
cb(err,rank)
*/
RankBL.DelRank = function(cb){

	RankDl.DeleteByTyepId(global.TypeId, function(err,res){
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

	var distinct_uid = []
	var result = [];
	async.series([function(callback){
			ResultDl.FindTop100(global.TypeId, function(err,doc){
				if(err){
					logger.error(err);
					return callback(ERR_DB);
				}			
				distinct_uid = doc
				callback();
			})
		},
		function(callback){

			var topResult = [];
			distinct_uid.forEach(function(v){
				topResult.push(function(res_v){

					return function(cb2){
						ResultDl.FindTopResultByUid(res_v, global.TypeId, function(err,doc){
							if(err) return cb2(err);
							result.push(doc);
							cb2();
						})
					}

				}(v))

			})


			async.series(topResult,function(err){

				if(err) return callback(err);
				callback();
			});

		},
		function(callback){
			var rankArray = []
			result.forEach(function(v){
				rankArray.push({
					ResultId:v._id,
					Mobile:utils.format_mobile(v.Mobile),
					Name:utils.format_name(v.Name),
					Score:v.Score,
					Time:new Date(v.EndTime),
					RTypeId:global.TypeId
				})
			})


			RankDl.AddAll(rankArray, function(err,doc1,doc2){
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
