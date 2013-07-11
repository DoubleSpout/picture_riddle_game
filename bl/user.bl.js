var UserDl = require('../dl/user.dl.js');
var TokenDl = require('../dl/token.dl.js');
var utils = require('../utils/utils.js')
var async = require('async');
var UserBL = {};



ERR_MOBILE= '手机号码错误'
ERR_NAME = '真实姓名有误'
ERR_EXIST = '手机号码已经存在'
ERR_NO_EXIST = '手机号码不存在'
ERR_NOT_MATCH = '手机号码和用户名不匹配'
ERR_DB = '数据库异常'
ERR_LOGOUT = '退出失败'
ERR_TOKEN = '登录超时，请重新登录'
ERR_USER_DATA = '获取用户数据失败，请重新登陆'
ERR_USER_MAX = '用户注册失败'


/*
uobj = {
	Mobile
	Name
	RegIp
}
cb(err,uobj)
*/
UserBL.regist = function(uobj, cb){

	var obj = {
		Mobile:uobj.mobile || '',
		Name:uobj.name || '',
	}
	if(uobj.ip){
		obj.RegIp = uobj.ip
	}
	if(uobj.agent){
		obj.Agent = uobj.agent
	}


	if(!utils.check_mobile(obj.Mobile)){
		return cb(ERR_MOBILE);
	}
	if(!utils.check_name(obj.Name)){
		return cb(ERR_NAME)
	}

	var user = {}
	var token = {}

	async.series([
		function(callback){ //判断此ip最近24小时内是否超过最大注册用户数，防止数据库被刷
			UserDl.CountIpOneDay(obj.RegIp, function(err,num){ //根据ip地址查询此ip24小时内注册用户数

				if(err){
					logger.error(err);
					return callback(ERR_DB);
				}
				if(num >= global.IpMaxReg){ //如果超过24小时最大注册数
					logger.error(ERR_USER_MAX);				
					return callback(ERR_USER_MAX);
				}
				callback();
			})
		},
		function(callback){
			UserDl.Regist(obj,function(err,doc){
				if(err){
					logger.error(err);
					return callback(ERR_EXIST);
				} 
				user = doc;
				callback();
			})
		},
		function(callback){
			TokenDl.add({UserId:user._id}, function(err,doc){
				if(err){
					logger.error(err);
					return callback(ERR_DB);
				} 
				token = doc;
				callback();
			})
		}
	],function(err,res){
		if(err){
			return cb(err);
		}
		user.token = token._id;
		cb(null, {
			id:user._id,
			token:token._id,
			mobile:user.Mobile,
			name:user.Name,
			lastlogintime:user.LastLoginTIme
		});
	})
}




/*
uobj = {
	Mobile
	Name
}
cb(err,uobj)
*/
UserBL.Login = function(uobj, cb){
	var obj = {
		Mobile:uobj.mobile || '',
		Name:uobj.name || ''
	}
	if(!utils.check_mobile(obj.Mobile)){
		return cb(ERR_MOBILE);
	}
	if(!utils.check_name(obj.Name)){
		return cb(ERR_NAME)
	}

	var user = {}
	var token = {}

	async.series([
		function(callback){
			UserDl.FindByMobile(obj.Mobile, function(err,doc){
				if(err){
					logger.error(err);
					return callback(ERR_DB);
				}
				if(!doc){
					return callback(ERR_NO_EXIST);
				}
				if(doc.Name !== obj.Name){
					return callback(ERR_NOT_MATCH)
				}
				user = doc
				callback();
			})
		},
		function(callback){
			UserDl.Login(user._id, function(err,doc){
				if(err){
					logger.error(err);
					return callback(ERR_DB);
				} 
				callback();
			})
		},
		function(callback){
			TokenDl.DeleteByUserId(user._id, function(err,doc){
				if(err){
					logger.error(err);
					return callback(ERR_DB);
				} 
				callback();
			})
		},
		function(callback){
			TokenDl.add({UserId:user._id}, function(err,doc){
				if(err){
					logger.error(err);
					return callback(ERR_DB);
				} 
				token = doc;
				callback();
			})
		}
	],function(err,res){
		if(err){
			return cb(err);
		}
		user.token = token._id;

		cb(null, {
			id:user._id,
			token:token._id,
			mobile:user.Mobile,
			name:user.Name,
			lastlogintime:user.LastLoginTIme
		});
	})
}




/*
Mobile
cb(err,count)
*/
UserBL.CountByMobile = function(Mobile, cb){

	var Mobile = Mobile || ''
	if(!utils.check_mobile(Mobile)){
		return cb(ERR_MOBILE);
	}

	UserDl.CountByMobile(Mobile, function(err, count){
		if(err){
			logger.error(err);
			return cb(ERR_DB);
		}
		return cb(null, count, ERR_EXIST)
	})
}

/*
tokenid
cb(err)
*/
UserBL.Logout = function(tokenid, cb){
	TokenDl.DeleteById(tokenid, function(err, count){
		if(err){
			logger.error(err);
			return cb(ERR_LOGOUT);
		}
		else if(count==0){
			return cb(ERR_LOGOUT);
		}
		return cb(null)
	})

}


/*
tokenid
cb(err,uobj)
*/
UserBL.GetUserByTokenId = function(tokenid, cb){

	var token = {}
	var user = {}
	async.series([
		function(callback){
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
			UserDl.FindById(token.UserId, function(err,doc){
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
		}
	],function(err,res){
		if(err){
			return cb(err);
		}
		user.token = token._id;
		cb(null, user);
	})

}


module.exports = UserBL;