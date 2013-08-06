var RiddleDL = require('../dl/riddle.dl.js');
var RiddleTypeDL = require('../dl/riddle_type.dl.js');
var path = require('path');
var fs = require('fs');

var utils = require('../utils/utils.js')
var async = require('async');


var Riddle = {}


Riddle.list = function(req,res){

	RiddleTypeDL.FindAll(function(err,doc){
		if(err) return res.send(500);

		res.render('riddle_list', {RiddleTypeArray:doc});
	})

		
}

Riddle.read = function(req,res){

	var isFilter = false
	var FilterObj = {}
	req.models.forEach(function(v){
		if(v.value){
			FilterObj[v.field] = v.value;
			isFilter = true;
		}
	})

if(isFilter){
	RiddleDL.FindObj(FilterObj,function(err,doc){
			if(err){
				return res.json(500, { error: err })
			}
			res.json(doc);
		})
}
else{
		RiddleDL.FindAll(function(err,doc){
			if(err){
				return res.json(500, { error: err })
			}
			res.json(doc);
		})
	}	
}


Riddle.update = function(req,res){
	if(!req.models[0]._id) return res.json(500, { error: "无效的_id" });
	var id = req.models[0]._id;
	delete req.models[0]._id;

	RiddleDL.ModifyById(id, req.models[0], function(err, doc){
			if(err) res.json(500, { error: err });
			res.json(doc)		
	})

}

Riddle.destory = function(req,res){
	var id = req.body._id;
	if(id){
		RiddleDL.DeleteById(id, function(err, doc){
			if(err) return res.json(500, { error: err });
			res.json(doc)		
		})
	}
	else res.json({})
}

Riddle.create = function(req,res){
	
	var ModelArray = req.models
	var updateArray = [];

	req.models = ModelArray.filter(function(v){
		v.RegIp = req.ip
		if(v._id) updateArray.push(v)
		return !v._id
	})	

	if(req.models.length<1 && updateArray.length<1) return Riddle.read(req,res);



if(req.models.length>0){

	var isLoadPicUrl = req.models.PicUrl ? 1:0;

	RiddleDL.Add(req.models, function(err, doc){
		if(err) res.json(500, { error: err });

		if(!isLoadPicUrl) return Riddle.read(req,res);
		
		var ary = [].slice.call(arguments,1);

		var update_func = function(v){
			var v = v;
			var ary = v.PicUrl.split('.');
			var suffix = ary.length>1 ? ary[ary.length-1] : '';
			return function(callback){
				var buf;
				var picpath = path.join(__dirname,'..','upload','riddle',v._id+'.'+suffix);

				async.series([
						function(cb){

							var is = fs.createReadStream(v.PicUrl);
							var os = fs.createWriteStream(picpath);
							is.pipe(os);
							is.on('end',function() {
							    fs.unlinkSync(v.PicUrl);
							    cb()
							});
							is.on('error',function() {
							    fs.unlinkSync(v.PicUrl);
							    cb(err)

							});
						},
						function(cb){
							RiddleDL.ModifyById(v._id, {PicUrl:'/riddle/'+v._id+'.'+suffix}, function(err){
								cb(err)
							})		
						},
					],function(err){
						if(err) callback(err)
						callback();
						})
			}
		}
		var async_array = [];
		ary.forEach(function(v){
			async_array.push(update_func(v));
		})

		async.series(async_array, function(err,result){
			if(err) return res.json(500, { error: err });

			Riddle.read(req,res);
		})
			
	})
}
else if(updateArray.length>0){
console.log(updateArray)


	var async_update_array = [];

	updateArray.forEach(function(v){

		async_update_array.push(
			(function(mod){
				var id = mod._id
				delete mod._id;
				delete mod.InputTime
				return function(callback){
					RiddleDL.ModifyById(id, mod, function(err){
								callback(err)
					})
				}
			})(v)
		);

	})

	async.series(async_update_array,function(err){
		if(err) return res.json(500, { error: err });
		Riddle.read(req,res);
	})


}


	
}

Riddle.upload = function(req,res){
	
	try{
		var p = req.files.file.path;
		if(!p) throw('err')
	}
	catch(e){
		res.send('top.upload_func("上传失败,请重试")')
	}

	p = p.split(path.sep).join('/')
	res.send('<script>top.upload_func(false,"'+p+'");</script>')	
}

Riddle.list_test = function(req, res){

	res.render('pic_test', {});
}

Riddle.test = function(req, res){

	RiddleDL.FindAllIdByTypeId(global.TypeId,function(err,doc){
		if(err) return res.json(500, { error: err });
		res.json(doc)
	})
}



module.exports = Riddle;