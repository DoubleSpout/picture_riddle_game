var RiddleBL = require('../bl/riddle.bl.js');
var ResultBL = require('../bl/result.bl.js');
var RankBL = require('../bl/rank.bl.js');
var async = require('async');
var utils = require('../utils/utils.js');

var game = {}

game.result = function(req,res){

	var token = req.query.token;

	ResultBL.GetRecordByTokenId(token, function(err, doc){
		if(err) return res.json( utils.AddJsonResult({},0,err) );
		res.json( utils.AddJsonResult(doc,1) )
	})

}

game.rank = function(req,res){

	RankBL.GetRank(function(err,doc){
		if(err) return res.json( utils.AddJsonResult({},0,err) );
		res.json( utils.AddJsonResult(doc,1) );
	})

}

game.start = function(req,res){

	var token = req.query.token;
	var ip = req.ip;
	RiddleBL.GetRiddle(token, ip, function(err, doc){
		if(err) return res.json( utils.AddJsonResult({},0,err) );
		res.json( utils.AddJsonResult(doc,1) );
	})

}


game.answer = function(req,res){

	var obj = {
		RId:req.body.rid,
		Answer:req.body.answer||'',
		Pos:req.body.pos||'',
		ResultId:req.body.resultid||'',
		TokenId:req.body.tokenid||''
	}

	RiddleBL.Answer(obj, function(err, doc){
		if(err) return res.json( utils.AddJsonResult({},0,err) );
		if("object" === typeof doc){
			res.json( utils.AddJsonResult({answer:true,result:doc},1) ); //如果是最后一题且全部回答正确
		}
		else{
			res.json( utils.AddJsonResult({answer:doc},1) ); //如果不是最后一题
		}	
	})

}


module.exports = game


