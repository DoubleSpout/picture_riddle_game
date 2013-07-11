
var UserLogin = {}
var admin = require('../config/config.js').admin
var password = require('../config/config.js').password




UserLogin.Login = function(req,res){

	res.render('login', {error:''})
	
}

UserLogin.UserLogin = function(req,res){

	if(req.body.admin !== admin || req.body.password !== password){
		return	res.render('login', {error:'用户名或密码错误'})
	}


	req.session.admin = admin;
	res.redirect('/manger/main/')
	
}


UserLogin.Logout = function(req,res){

	req.session = null;
	res.redirect('/manger/login/')
	
}



UserLogin.Main = function(req,res){
	res.render('main', {pos:''})
}



module.exports = UserLogin;