
var mongoose =require('./db_conn.js'),
	Schema = mongoose.Schema;

var DetailSchema = new Schema({
	  RId:{ type: String, required:true}, //对应题库中的题目_id
  	Res:{type: Number, default:0}  //如果还未答或者打错则为0,已经回答过了,并且答对了为1
})

var Result = new Schema({ //定义结构
      Mobile: { type: String, required:true}, 		//答题用户的手机号,带**例如137****1621
      Name:{type: String, required:true},  			//答题用户的姓名,带**例如王**
      UserId:{type:String, required:true},   		 //答题用户的_id号
      Ip:{type:String,default: '0.0.0.0'},   		 //答题用户此次答题ip地址
      Status: { type: Number, default:0}, 			//此次答题的状态0表示还未答完,1表示已经答完
      StartTime:{type: Date, default: function(){return Date.now()} },  //开始答题时间
      EndTime:{type: Date, default: ''},            //结束答题时间
      Score:{type: Number, default:0},              //答题的秒数
      Detail:[DetailSchema],                         //此次答题的详细信息,那些答过,那些未答
      RTypeId:{type: String, required:true}			 //此次答题所属题库类型id
})


Result.statics.Add = function (obj,cb) {//插入一条答题信息
  return this.create(obj,cb);	
}

Result.statics.FindById = function (id, cb) {  //根据id查找某一次题目的答题信息
  return this.findOne({"_id":id}, cb);
}

Result.statics.ModifyById = function (id,obj,cb) { //根据答题信息id，修改它
  return  this.update({"_id":id}, obj, {"safe":true}, cb);	
}


Result.statics.FindByUserId = function (uid, cb) {//根据题目类型id，查找所有题目的信息
  return this.find({"UserId":uid})
  			 .limit(10)
  			 .where("Status").equals(1)
  			 .sort({StartTime:-1})
  			 .exec(cb);
}




Result.statics.DeleteById = function (id, cb) { //根据id，删除一条题目记录
  return this.remove({"_id":id}, cb);
}

Result.statics.FindAllByTypeId = function (typeid, cb) {//查询所有最多10000万条的答题记录
  return this.find({"RTypeId":typeid})
  			 .limit(10000)
  			 .sort({StartTime:-1})
  			 .exec(cb);
}

Result.statics.FindTop100 = function (typeid, cb) { //查询出排行榜最近100个不同用户的最快记录
  return this.distinct('UserId',{ "RTypeId": typeid})
  			 .limit(100)
  			 .where("Status").equals(1)
  			 .sort({Score:1})
  			 .exec(cb);	
}

Result.statics.FindTopResultByUid= function(uid,typeid,cb){
  return this.findOne({"UserId":uid, "RTypeId": typeid})
         .where("Status").equals(1)
         .sort({Score:1})
         .exec(cb);

}


Result.statics.CountIpOneDay = function (ip, cb) { //查询出排行榜最近100个不同用户的最快记录
  var ts = Date.now() - 1000*60*60*24;
  return this.count({Ip:ip, StartTime:{"$gt": ts}}, cb);
}

Result.statics.CountAll = function(cb){
  return this.count({},cb);
}

Result.statics.FindObj = function(obj,cb){ //根据对象查找信息后台用
  return this.find(obj)
             .limit(10000)
             .exec(cb); 
}

Result.statics.FindAll = function(cb){
  return this.find({})
             .limit(20000)
             .sort({"_id":-1})
             .exec(cb);
}

module.exports = mongoose.model('Result', Result);


