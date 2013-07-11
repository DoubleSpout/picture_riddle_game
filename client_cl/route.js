var UserCl = require('./user.cl.js');
var GameCl = require('./game.cl.js');
var UserBl = require('../bl/user.bl.js');
var utils = require('../utils/utils.js');



var CheckDeveice = function(req, res, next){ //判断请求头的设备

	next();
}


var GetUserByToken = function(req, res, next){ //根据token获得用户id
	var token = req.query.token
	if(token){
		UserBl.GetUserByTokenId(token, function(err, doc){
			if(err) return res.json( utils.AddJsonResult({},0,err) );
			if(!doc._id) return res.json( utils.AddJsonResult({},0, "invalid token") );
			req.userobj = doc;
			next();
		})
	}
	else next();
}


var ClientRouteArray = [
	["get:/",function(req,res){res.send('hello')}],
	["post:/client/user/login", CheckDeveice, UserCl.Login],
	["get:/client/user/logout?token",CheckDeveice, GetUserByToken, UserCl.Logout],

	["get:/client/game/result?token",CheckDeveice, GetUserByToken, GameCl.Result],
	["get:/client/game/rank?token",CheckDeveice, GetUserByToken, GameCl.Rank],

	["get:/client/game/start?token",CheckDeveice, GetUserByToken, GameCl.Start],
	["post:/client/game/answer",CheckDeveice, GetUserByToken, GameCl.Answer],
]

module.exports = ClientRouteArray;