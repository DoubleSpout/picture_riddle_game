var UserCl = require('./user.cl.js')
var LoginCl = require('./login.cl.js')
var RankCl = require('./rank.cl.js')
var ResultCl = require('./result.cl.js')
var RiddleTypeCl = require('./riddle_type.cl.js')
var RiddleCl = require('./riddle.cl.js')

var utils = require('../utils/utils.js')




var CheckLogin = function(req, res, next){ //中间件

	if(!req.session.admin){ //判断是否登录
		return res.redirect('/manger/login');
	}

	if(req.body.models){ //如果有models则将model解析为json对象
		req.models = utils.filter_models(req.body.models);
		if(!req.models) return res.json(500, { error: 'models parse error' });
	}
	
	next();
}





var MangerRouteArray = [
	//登录路由
	["get:/manger/login/", LoginCl.Login],
	["get:/manger/logout/", LoginCl.Logout],
	["post:/manger/login/", LoginCl.UserLogin],
	["get:/manger/main/", CheckLogin, LoginCl.Main],


	//用户信息及token
	["get:/manger/user/list", CheckLogin, UserCl.list],
	["post:/manger/user/read/", CheckLogin, UserCl.read],
	["post:/manger/user/update/", CheckLogin, UserCl.update],
	["post:/manger/user/destory/", CheckLogin, UserCl.destory],
	["post:/manger/user/create/", CheckLogin, UserCl.create],
	["get:/manger/token/list", CheckLogin, UserCl.TokenList],
	["post:/manger/token/read", CheckLogin, UserCl.TokenRead],
	["post:/manger/token/destory", CheckLogin, UserCl.TokenDestory],


	//排行榜
	["get:/manger/rank/list", CheckLogin, RankCl.list],
	["post:/manger/rank/read/", CheckLogin, RankCl.read],
	["post:/manger/rank/update/", CheckLogin, RankCl.update],
	["post:/manger/rank/destory/", CheckLogin, RankCl.destory],


	//答题成绩
	["get:/manger/result/list", CheckLogin, ResultCl.list],
	["post:/manger/result/read/", CheckLogin, ResultCl.read],
	["post:/manger/result/update/", CheckLogin, ResultCl.update],
	["post:/manger/result/destory/", CheckLogin, ResultCl.destory],


	//题库分类
	["get:/manger/riddle_type/list", CheckLogin, RiddleTypeCl.list],
	["post:/manger/riddle_type/read/", CheckLogin, RiddleTypeCl.read],
	["post:/manger/riddle_type/update/", CheckLogin, RiddleTypeCl.update],
	["post:/manger/riddle_type/destory/", CheckLogin, RiddleTypeCl.destory],
	["post:/manger/riddle_type/create/", CheckLogin, RiddleTypeCl.create],


	//题库内容
	["get:/manger/riddle/list", CheckLogin, RiddleCl.list],
	["post:/manger/riddle/read/", CheckLogin, RiddleCl.read],
	["post:/manger/riddle/update/", CheckLogin, RiddleCl.update],
	["post:/manger/riddle/destory/", CheckLogin, RiddleCl.destory],
	["post:/manger/riddle/create/", CheckLogin, RiddleCl.create],
	["post:/manger/riddle/upload", CheckLogin, RiddleCl.upload],
]



module.exports = MangerRouteArray;