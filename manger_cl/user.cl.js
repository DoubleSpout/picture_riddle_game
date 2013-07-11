var UserDL = require('../dl/user.dl.js');
var TokenDL = require('../dl/token.dl.js')
var utils = require('../utils/utils.js')
var async = require('async');


var User = {}


User.list = function(req,res){
	res.render('user_list');	
}

User.read = function(req,res){

	var isFilter = false
	var FilterObj = {}
	req.models.forEach(function(v){
		if(v.value){
			FilterObj[v.field] = v.value;
			isFilter = true;
		}
	})

if(isFilter){
	UserDL.FindObj(FilterObj,function(err,doc){
			if(err){
				return res.json(500, { error: err })
			}
			res.json(doc);
		})
}
else{
		UserDL.FindAll(function(err,doc){
			if(err){
				return res.json(500, { error: err })
			}
			res.json(doc);
		})
	}	
}


User.update = function(req,res){
	if(!req.models[0]._id) return res.json(500, { error: "无效的_id" });
	var id = req.models[0]._id;
	delete req.models[0]._id;

	UserDL.UpdateById(id, req.models[0], function(err, doc){
			if(err) res.json(500, { error: err });
			res.json(doc)		
	})

}

User.destory = function(req,res){
	var id = req.body._id;
	if(id){
		UserDL.DeleteById(id, function(err, doc){
			if(err) res.json(500, { error: err });
			res.json(doc)		
		})
	}
	else res.json({})
}

User.create = function(req,res){

	req.models=req.models.filter(function(v){
		v.RegIp = req.ip
		return !v._id
	})	
	if(req.models.length<1) return  User.read(req,res);

	UserDL.Regist(req.models, function(err, doc){
		if(err) res.json(500, { error: err });
		var ary = [].slice.call(arguments,1);
		res.json(ary)		
	})
	
}

User.TokenList = function(req,res){
	res.render('token_list');	
}


User.TokenRead = function(req,res){
		
var isFilter = false
var FilterObj = {}
req.models.forEach(function(v){
	if(v.value){
		FilterObj[v.field] = v.value;
		isFilter = true;
	}
})

if(isFilter){
	TokenDL.FindObj(FilterObj,function(err,doc){
			if(err){
				return res.json(500, { error: err })
			}
			res.json(doc);
		})
}
else{
		TokenDL.FindAll(function(err,doc){
			if(err){
				return res.json(500, { error: err })
			}
			res.json(doc);
		})
	}
		
}


User.TokenDestory = function(req,res){
	var id = req.body._id;
	if(id){
		TokenDL.DeleteById(id, function(err, doc){
			if(err) res.json(500, { error: err });
			res.json(doc)		
		})
	}
	else res.json({})	
}



module.exports = User;