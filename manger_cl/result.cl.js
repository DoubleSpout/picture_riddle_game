var ResultDL = require('../dl/result.dl.js');

var utils = require('../utils/utils.js')
var async = require('async');


var Result = {}


Result.list = function(req,res){
	res.render('result_list');	
}

Result.read = function(req,res){

	var isFilter = false
	var FilterObj = {}
	req.models.forEach(function(v){
		if(v.value){
			FilterObj[v.field] = v.value;
			isFilter = true;
		}
	})

if(isFilter){
	ResultDL.FindObj(FilterObj,function(err,doc){
			if(err){
				return res.json(500, { error: err })
			}
			res.json(doc);
		})
}
else{
		ResultDL.FindAll(function(err,doc){
			if(err){
				return res.json(500, { error: err })
			}
			res.json(doc);
		})
	}	
}


Result.update = function(req,res){
	if(!req.models[0]._id) return res.json(500, { error: "无效的_id" });
	var id = req.models[0]._id;
	delete req.models[0]._id;

	ResultDL.ModifyById(id, req.models[0], function(err, doc){
			if(err) res.json(500, { error: err });
			res.json(doc)		
	})

}

Result.destory = function(req,res){
	var id = req.body._id;
	if(id){
		ResultDL.DeleteById(id, function(err, doc){
			if(err) res.json(500, { error: err });
			res.json(doc)		
		})
	}
	else res.json({})
}







module.exports = Result;