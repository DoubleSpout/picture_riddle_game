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

var addroute = function(app){

	//登录
	app.get('/manger/login', LoginCl.Login)
	app.get('/manger/logout', LoginCl.Logout)
	app.post('/manger/login', LoginCl.UserLogin)
	app.get('/manger/main', CheckLogin, LoginCl.Main)



	//用户信息及token
	app.get('/manger/user/list', CheckLogin, UserCl.list)
	app.post('/manger/user/read', CheckLogin, UserCl.read)
	app.post('/manger/user/update', CheckLogin, UserCl.update)
	app.post('/manger/user/destory', CheckLogin, UserCl.destory)
	app.post('/manger/user/create', CheckLogin, UserCl.create)
	app.get('/manger/token/list', CheckLogin, UserCl.TokenList)
	app.post('/manger/token/read', CheckLogin, UserCl.TokenRead)
	app.post('/manger/token/destory', CheckLogin, UserCl.TokenDestory)


	//排行榜
	app.get('/manger/rank/list', CheckLogin, RankCl.list)
	app.post('/manger/rank/read', CheckLogin, RankCl.read)
	app.post('/manger/rank/update', CheckLogin, RankCl.update)
	app.post('/manger/rank/destory', CheckLogin, RankCl.destory)

	//答题成绩
	app.get('/manger/result/list', CheckLogin, ResultCl.list)
	app.post('/manger/result/read', CheckLogin, ResultCl.read)
	app.post('/manger/result/update', CheckLogin, ResultCl.update)
	app.post('/manger/result/destory', CheckLogin, ResultCl.destory)

	//题库分类
	app.get('/manger/riddle_type/list', CheckLogin, RiddleTypeCl.list)
	app.post('/manger/riddle_type/read', CheckLogin, RiddleTypeCl.read)
	app.post('/manger/riddle_type/update', CheckLogin, RiddleTypeCl.update)
	app.post('/manger/riddle_type/destory', CheckLogin, RiddleTypeCl.destory)
	app.post('/manger/riddle_type/create', CheckLogin, RiddleTypeCl.create)

	//题库内容
	app.get('/manger/riddles/list', CheckLogin, RiddleCl.list)
	app.post('/manger/riddles/read', CheckLogin, RiddleCl.read)
	app.post('/manger/riddles/update', CheckLogin, RiddleCl.update)
	app.post('/manger/riddles/destory', CheckLogin, RiddleCl.destory)
	app.post('/manger/riddles/create', CheckLogin, RiddleCl.create)
	app.post('/manger/riddles/upload', CheckLogin, RiddleCl.upload)

	//检查题库图片是否正常显示
	app.get('/manger/pic/test', CheckLogin, RiddleCl.test)
	app.get('/manger/pic/list', CheckLogin, RiddleCl.list_test)


}


module.exports = function(app){
	addroute(app);
}