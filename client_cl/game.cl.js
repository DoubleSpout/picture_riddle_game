var RiddleBL = require('../bl/riddle.bl.js');
var ResultBL = require('../bl/result.bl.js');
var RankBL = require('../bl/rank.bl.js');
var async = require('async');
var utils = require('../utils/utils.js');

var game = {}

game.Result = function(req,res){

	var token = req.query.token;

	ResultBL.GetRecordByTokenId(token, function(err, doc){
		if(err) return res.json( utils.AddJsonResult({},0,err) );
		res.json( utils.AddJsonResult(doc,1) )
	})

}

game.Rank = function(req,res){

	RankBL.GetRank(function(err,doc){
		if(err) return res.json( utils.AddJsonResult({},0,err) );
		res.json( utils.AddJsonResult(doc,1) );
	})

}

game.Start = function(req,res){

	var token = req.query.token;
	var ip = req.ip;
	RiddleBL.GetRiddle(token, ip, function(err, doc){
		if(err) return res.json( utils.AddJsonResult({},0,err) );
		res.json( utils.AddJsonResult(doc,1) );
	})

}


game.Answer = function(req,res){

	var obj = {
		Answer:req.body.answer||'',
		Pos:req.body.pos||'',
		ResultId:req.body.resultid||'',
		TokenId:req.body.token||''
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


var loop = function(){
	RankBL.DelRank(function(err, res){
		if(err) return logger.error(err);
		logger.info('clear rank done')
		RankBL.Update(function(err){
			if(err) return logger.error(err);
			logger.info('update rank done')
		})
	})
	return arguments.callee;
}

setTimeout(function(){ //可能typeid还没准备好，过1分钟之后再执行排行
	
	loop();
},1000*30)

setInterval(function(){
	loop();
},1000*60*60)