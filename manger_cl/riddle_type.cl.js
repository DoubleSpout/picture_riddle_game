var RiddleTypeDL = require('../dl/riddle_type.dl.js');

var utils = require('../utils/utils.js')
var async = require('async');


var RiddleType = {}


RiddleType.list = function(req,res){
	res.render('riddle_type_list');	
}

RiddleType.read = function(req,res){

	var isFilter = false
	var FilterObj = {}
	req.models.forEach(function(v){
		if(v.value){
			FilterObj[v.field] = v.value;
			isFilter = true;
		}
	})

if(isFilter){
	RiddleTypeDL.FindObj(FilterObj,function(err,doc){
			if(err){
				return res.json(500, { error: err })
			}
			res.json(doc);
		})
}
else{
		RiddleTypeDL.FindAll(function(err,doc){
			if(err){
				return res.json(500, { error: err })
			}
			res.json(doc);
		})
	}	
}


RiddleType.update = function(req,res){
	if(!req.models[0]._id) return res.json(500, { error: "无效的_id" });
	var id = req.models[0]._id;
	delete req.models[0]._id;

	RiddleTypeDL.ModifyById(id, req.models[0], function(err, doc){
			if(err) res.json(500, { error: err });
			res.json(doc)		
	})

}

RiddleType.destory = function(req,res){
	var id = req.body._id;
	if(id){
		RiddleTypeDL.DeleteById(id, function(err, doc){
			if(err) res.json(500, { error: err });
			res.json(doc)		
		})
	}
	else res.json({})
}

RiddleType.create = function(req,res){


		
	req.models = req.models.filter(function(v){
		v.RegIp = req.ip
		return !v._id
	})	
	if(req.models.length<1) return RiddleType.read(req,res);

	RiddleTypeDL.Add(req.models, function(err, doc){
		if(err) res.json(500, { error: err });
		var ary = [].slice.call(arguments,1);
		res.json(ary)		
	})
	
}


module.exports = RiddleType;