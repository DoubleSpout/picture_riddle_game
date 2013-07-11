var RankDL = require('../dl/rank.dl.js');

var utils = require('../utils/utils.js')
var async = require('async');


var Rank = {}


Rank.list = function(req,res){
	res.render('rank_list');	
}

Rank.read = function(req,res){

	var isFilter = false
	var FilterObj = {}
	req.models.forEach(function(v){
		if(v.value){
			FilterObj[v.field] = v.value;
			isFilter = true;
		}
	})

if(isFilter){
	RankDL.FindObj(FilterObj,function(err,doc){
			if(err){
				return res.json(500, { error: err })
			}
			res.json(doc);
		})
}
else{
		RankDL.FindAll(function(err,doc){
			if(err){
				return res.json(500, { error: err })
			}
			res.json(doc);
		})
	}	
}


Rank.update = function(req,res){
	if(!req.models[0]._id) return res.json(500, { error: "无效的_id" });
	var id = req.models[0]._id;
	delete req.models[0]._id;

	RankDL.ModifyById(id, req.models[0], function(err, doc){
			if(err) res.json(500, { error: err });
			res.json(doc)		
	})

}

Rank.destory = function(req,res){
	var id = req.body._id;
	if(id){
		RankDL.DeleteById(id, function(err, doc){
			if(err) res.json(500, { error: err });
			res.json(doc)		
		})
	}
	else res.json({})
}







module.exports = Rank;