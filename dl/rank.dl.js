
var mongoose =require('./db_conn.js'),
	Schema = mongoose.Schema;

var Rank = new Schema({ //定义结构
  ResultId: { type: String, required:true},     //答题的_id
  Mobile: { type: String, required:true}, 		//答题用户的手机号,带**例如137****1621
  Name:{type: String, required:true},  			//答题用户的姓名,带**例如王**
  Score:{type: Number, required:true},          //答题的秒数
  Time:{ type: Date, required:true},            //此次答题的时间
  RTypeId:{type: String, required:true},     //这个排行榜的类型id
  IsCheet:{type: Number, default:0},			    //是否作弊0表示未作弊，1表示作弊
  InputTime:{type: Date, default: function(){return Date.now()} }  //插入数据的时间
})


Rank.statics.AddAll = function (array,cb) {//批量插入排行数据
  return this.create(array,cb);	
}

Rank.statics.ModifyById = function (id,cb) { //根据排行榜某一个id修改它
  return  this.update({"_id":id}, obj, {"safe":true}, cb);	
}


Rank.statics.DeleteById = function (id, cb) { //根据id，删除一条题目记录
  return this.remove({"_id":id}, cb);
}

Rank.statics.DeleteByTyepId = function (TypeId, cb) { //查询出排行榜最近100个不同用户的最快记录
   return this.remove({"RTypeId":TypeId}, cb);
}


Rank.statics.DeleteAll = function (cb) { //查询出排行榜最近100个不同用户的最快记录
	 return this.remove({}, cb);
}

Rank.statics.FindByTypeId = function (TypeId,cb) {//批量插入排行数据
  return this.find({"RTypeId":TypeId})
  			 .limit(20)
  			 .where("IsCheet").equals(0)
  			 .sort({Score:1})
  			 .exec(cb);	
}

Rank.statics.FindObj = function(obj,cb){ //根据对象查找信息后台用
  return this.find(obj)
             .sort({"Score":-1})
             .limit(10000)
             .exec(cb); 
}

Rank.statics.FindAll = function(cb){
  return this.find({})
             .limit(20000)
             .sort({"Score":-1})
             .exec(cb);
}



module.exports = mongoose.model('Rank', Rank);


