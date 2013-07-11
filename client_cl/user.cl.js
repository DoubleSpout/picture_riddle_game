var UserBL = require('../bl/user.bl.js');
var async = require('async')
var utils = require('../utils/utils.js');

var user = {}

/*
post
mobile&name
*/
user.Login = function(req,res){ //用户登录控制器

	var uobj = {
		mobile:req.body.mobile,
		name:req.body.name,
		ip:req.ip
	}

	var isRegist = true;
	var udoc={}
	async.series([
		function(cb){
			UserBL.CountByMobile(uobj.mobile, function(err,count){
				if(err) return cb(err)
				if(count>0) isRegist = false;
				cb();
			})
		},
		function(cb){

			if(isRegist){//如果是注册
				var dev = utils.GetAgent(req.headers['User-Agent'])
				if(dev.ios) uobj.agent = 'ios'
				else if(dev.android) uobj.agent = 'android'

				UserBL.regist(uobj, function(err, doc){
					if(err) return cb(err)
					udoc = doc;
					cb()
				})
			}
			else{//如果是登录
				UserBL.Login(uobj, function(err, doc){
					if(err) return cb(err)
					udoc = doc;
					cb()
				})
			}
		},
		],function(err,result){

			if(err) return res.json( utils.AddJsonResult({},0,err) );
			res.json(utils.AddJsonResult(udoc,1))

		})

}

user.Logout = function(req,res){ //退出登录控制器

	var token = req.query.token
	UserBL.Logout(token, function(err){
		if(err) return res.json( utils.AddJsonResult({},0,err) );
		res.json( utils.AddJsonResult({},1)	)
	})
}


module.exports = user

