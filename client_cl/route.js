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


var ClientRouteArray = [
	["get:/",function(req,res){res.redirect('/static/index.html')}],
	["post:/client/user/login", CheckDeveice, UserCl.Login],
	["get:/client/user/logout?token",CheckDeveice, GetUserByToken, UserCl.Logout],

	["get:/client/game/result?token",CheckDeveice, GetUserByToken, GameCl.Result],
	["get:/client/game/rank?token",CheckDeveice, GetUserByToken, GameCl.Rank],

	["get:/client/game/start?token",CheckDeveice, GetUserByToken, GameCl.Start],
	["post:/client/game/answer",CheckDeveice, GetUserByToken, GameCl.Answer],
]

module.exports = ClientRouteArray;