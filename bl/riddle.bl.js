
var RiddleDl = require('../dl/riddle.dl.js');
var RiddleTypeDl = require('../dl/riddle_type.dl.js');
var ResultDl = require('../dl/result.dl.js');
var UserDl = require('../dl/user.dl.js');
var TokenDl = require('../dl/token.dl.js');
var utils = require('../utils/utils.js')

var async = require('async');

var RiddleBL = {};

ERR_DB = '数据库异常'
ERR_TOKEN = '登录超时，请重新登录'
ERR_USER_DATA = '获取用户数据失败，请重新登陆'
ERR_RIDDLE_COUNT = '当天题目回答次数过多'
ERR_GENERROR = '生成题库失败'


/*
tokenid, ip
cb(err,rank)
*/
RiddleBL.GetRiddle = function(tokenid, ip, cb){ //根据tokenid获取一次答题的题目

	var RidArray = [];
	var ChoseRidArray = [];
	var ChoseRiddle = [];
	var user = {}
	var token = {}
	var result = {}
	var ip = ip || '';

	async.series([
		function(callback){
			
			ResultDl.CountIpOneDay(ip, function(err,num){ //根据ip地址查询此ip24小时内回答题目数
				if(err){
					logger.error(err);
					return callback(ERR_DB);
				}
				if(num >= global.IpMaxResult){ //如果超过最大回答数，则报错
					logger.error(ERR_RIDDLE_COUNT);	
					return callback(ERR_RIDDLE_COUNT);
				}
				callback();
			})
		},
		function(callback){
			
			TokenDl.FindById(tokenid, function(err,doc){ //根据tokenid查找到用户id
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
			
			UserDl.FindById(token.UserId, function(err,doc){ //根据用户id查找到用户信息
				if(err){
					logger.error(err);
					return callback(ERR_DB);
				}
				if(!doc){
					logger.error(err);
					return callback(ERR_USER_DATA);
				}
				user = doc;
				callback();
			})
		},
		function(callback){

			RiddleDl.FindAllIdByTypeId(global.TypeId, function(err,doc){ //获取此typeid下所有题目id的数组
				if(err){
					logger.error(err);
					return callback(ERR_DB);
				}		
				
				RidArray = doc
				callback();
			})
		},
		function(callback){ //根据所有题目id,随机抽取出n道题目的id

			var n = global.RiddleNumber;

			while(n--){
				var len = RidArray.length;
				var r = Math.floor(Math.random()*len);
				ChoseRidArray.push(RidArray.splice(r,1)[0]['_id']);

			}
			callback()
		},
		function(callback){ //根据将抽取出的n道题目的id，找到这些题目的信息
			
			RiddleDl.FindByIdArray(ChoseRidArray, function(err, doc){
				if(err){
					logger.error(err);
					return callback(ERR_DB);
				}
				var doc_tmp_array = [];
				ChoseRidArray.forEach(function(v_Rid){
					doc.forEach(function(v_doc){
						if(v_Rid == v_doc._id+''){
							doc_tmp_array.push(v_doc)
						}
					})
				})
				ChoseRiddle = doc_tmp_array;
				callback()
			})
		},
		function(callback){ //将信息插入到答题记录集合,表示此用户开始答题了
			
			var ResultObj = {
				Mobile:utils.format_mobile(user.Mobile),
				Name:utils.format_name(user.Name),
				UserId:user._id,
				Ip:ip,
				RTypeId:global.TypeId,
			}
			var DetailArray = [];
			ChoseRidArray.forEach(function(v){
				DetailArray.push({RId:v,Res:0});			
			})
			ResultObj.Detail = DetailArray

			ResultDl.Add(ResultObj, function(err, doc){
				if(err){
					logger.error(err);
					return callback(ERR_DB);
				}
				result = doc;
				callback()
			})
		},
	],function(err,res){//将n道题目去除答案等信息返回给用户
		
		if(err){
			return cb(err);
		}
		var RiddleAry = []
		if(!ChoseRiddle){
			return cb(ERR_GENERROR);
		}
		ChoseRiddle.forEach(function(v){
			RiddleAry.push({
				PicUrl:v.PicUrl,
				Title:v.Title,
				Content:v.Content,
				ResultId:result._id,
				Type:v.QType
			})
		})
		
		cb(null, RiddleAry);
	})
	
}


/*
obj={
		Rid:obj.Rid || '',
		Answer:objAnswer||'',
		Pos:obj.Pos||'',
		ResultId:obj.ResultId||'',
		TokenId:obj.TokenId||''
}
cb(err, IsAnswerTrue)

*/
ERR_BAD_ANSWER = '无效的答题'
ERR_BAD_ANSWER_RESID = '无效的答题,答题ID错误'
ERR_BAD_ANSWER_USER = '无效的答题,用户ID错误'
ERR_BAD_ANSWER_REPEAT = '无效的答题,重复答题'
ERR_BAD_ANSWER_RID = '无效的答题,题目ID错误'
ERR_BAD_ANSWER_STATUS = '无效的答题,答题状态错误'
ERR_BAD_ANSWER_ORDER = '无效的答题,答题顺序错误'

RiddleBL.Answer = function(obj,cb){
	var AnswerObj = {
		//RId:obj.RId || '',
		Answer:obj.Answer||'',
		Pos:obj.Pos||'',
		ResultId:obj.ResultId||'',
		TokenId:obj.TokenId||''
	}
	if( !AnswerObj.Answer || (AnswerObj.Pos<0 || AnswerObj.Pos>= global.RiddleNumber) 
		|| !AnswerObj.ResultId || !AnswerObj.TokenId){

		return cb(ERR_BAD_ANSWER)
	}



	var token = {}
	var result = {}
	var IsAnswerTrue = false;

	async.series([
		function(callback){
			TokenDl.FindById(AnswerObj.TokenId, function(err,doc){ //根据tokenid查找到用户id

				if(err){
					logger.error(err);
					return callback(ERR_DB);
				}
				if(!doc){   //如果没找到token
					return callback(ERR_TOKEN);
				}
				token = doc
				callback();
			})
		},
		function(callback){
			ResultDl.FindById(AnswerObj.ResultId, function(err,doc){ //查找答题记录id的信息
				if(err){
					logger.error(err);
					return callback(ERR_DB);
				}
				if(!doc){ //如果没找到答题记录
					logger.error(ERR_BAD_ANSWER_RESID);
					return callback(ERR_BAD_ANSWER_RESID);				
				}
				if(doc.UserId !== token.UserId){ //如果此答题记录不是token的这个人
					logger.error(ERR_BAD_ANSWER_USER);
					return callback(ERR_BAD_ANSWER_USER);
				}
				if(doc.Detail[AnswerObj.Pos].Res !== 0){ //如果此题已经答过了
					logger.error(ERR_BAD_ANSWER_REPEAT);
					return callback(ERR_BAD_ANSWER_REPEAT);
				}

				if(doc.Status !== 0){ //如果整个答题记录已经答过了
					logger.error(ERR_BAD_ANSWER_STATUS);
					return callback(ERR_BAD_ANSWER_STATUS);
				}
				result = doc;
				callback();
			})
		},
		function(callback){ 
			RiddleDl.FindById(result.Detail[AnswerObj.Pos].RId, function(err, doc){ //根据id找到题目的详细信息
				if(err){
					logger.error(err);
					return callback(ERR_DB);
				}

				if(AnswerObj.Answer === doc.Answer){ //匹配答案是否正确
					IsAnswerTrue = true;
				}
				callback()
			})
		},
		function(callback){ 
			if(!IsAnswerTrue){ //如果回答错误，则返回
				return callback();
			}
			//回答正确更新答题记录集合
			var ResultObj = {
				Detail:result.Detail
			}
			ResultObj.Detail[AnswerObj.Pos].Res = 1; //将此题的状态改为1

			ResultDl.ModifyById(AnswerObj.ResultId, ResultObj, function(err,doc){
				if(err){
					logger.error(err);
					return callback(ERR_DB);
				}
				callback();
			})


		},
	],function(err,res){//将n道题目去除答案等信息返回给用户
		if(err){
			return cb(err);
		}
		if(!IsAnswerTrue) {
			return cb(null, false);
		}


		if(AnswerObj.Pos - 0 === global.RiddleNumber - 1){ //如果是回答最后一题

			var CheckPrevWrong = false
			result.Detail.forEach(function(v,i){ //如果企图跳过前面直接答最后一题,发现前面没答,则报错
				if(v.Res !== 1) CheckPrevWrong = true;
			})
			if(CheckPrevWrong){
				logger.error(ERR_BAD_ANSWER_ORDER);
				return cb(ERR_BAD_ANSWER_ORDER);
			}
			
			var s_ts = Date.parse(result.StartTime);
			var e_ts = Date.now();
			console.log(result._id)
			console.log(s_ts)
			console.log(e_ts)

			var ResultObj = {
				EndTime:e_ts,
				Status:1,
				Score: ((e_ts - s_ts)/1000).toFixed(2)
			}

			ResultDl.ModifyById(AnswerObj.ResultId, ResultObj, function(err,doc){ 
			//答完最后一题，将答题记录相关状态更新
				if(err){
					logger.error(err);
					return callback(ERR_DB);
				}
				cb(null, ResultObj);
			})

		}
		else{//如果不是答最后一题,则告诉用户回答正确			
			cb(null, true);
		}
		
	})

	
}


//初始化type类型id
if(!global.TypeId){ //如果没指定global.typeid

	RiddleTypeDl.GetFirstTypeId(function(err,doc){
		if(err){
			return logger.error(err);
		}
		
		if(!doc || doc.length == 0){
			RiddleTypeDl.Add({Name:'题库类型auto', Desc:'题库类型自动加入'}, function(err, doc){
					if(err){
						return logger.error(err);
					}

					global.TypeId = doc._id
			})
		}
		else{
			global.TypeId = doc._id
		}

	})

}



module.exports = RiddleBL;
