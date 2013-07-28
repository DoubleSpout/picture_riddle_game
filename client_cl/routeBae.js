var UserCl = require('./user.cl.js');
var GameCl = require('./game.cl.js');
var UserBl = require('../bl/user.bl.js');
var utils = require('../utils/utils.js');



var CheckDeveice = function(req, res, next){ //判断请求头的设备


	//res.setHeader("Access-Control-Allow-Origin", "*");
	//res.setHeader("Access-Control-Allow-Methods", "*");
	//res.setHeader("Access-Control-Allow-Headers", "*");
	
	next();
}


var GetUserByToken = function(req, res, next){ //根据token获得用户id
	var token = req.query.token || req.body.token 
	if(token){
		if(token.length !== 24) return res.json( utils.AddJsonResult({tokenerr:1},0, "invalid token length") );
		if(!/^[0-9a-zA-Z]+$/.test(token)) return res.json( utils.AddJsonResult({tokenerr:1},0, "invalid format token") );

		UserBl.GetUserByTokenId(token, function(err, doc){
			if(err) return res.json( utils.AddJsonResult({tokenerr:1},0,err) );
			if(!doc._id) return res.json( utils.AddJsonResult({tokenerr:1},0, "invalid token") );
			req.userobj = doc;
			next();
		})
	}
	else next();
}


var addroute = function(app){

	app.get('/', function(req,res){res.redirect('/static/index.html')})
	app.post('/client/user/login', CheckDeveice, UserCl.Login)
	app.get('/client/user/logout', CheckDeveice, GetUserByToken, UserCl.Logout)

	app.get('/client/game/result', CheckDeveice, GetUserByToken, GameCl.Result)	
	app.get('/client/game/rank', CheckDeveice, GetUserByToken, GameCl.Rank)

	app.get('/client/game/start', CheckDeveice, GetUserByToken, GameCl.Start)	
	app.post('/client/game/answer', CheckDeveice, GetUserByToken, GameCl.Answer)


}


module.exports = function(app){
	addroute(app);
}