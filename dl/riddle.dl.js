
var mongoose =require('./db_conn.js'),
	Schema = mongoose.Schema;

var Riddle = new Schema({ //定义结构
  TypeId: { type: String, required:true}, //题目大类id
  PicUrl:{type: String, default: ''},  //题目图片存放的url地址不带host，例如"/riddle/typeid/xxxx.jpg"
  QType:{type: Number, required:true},  //题目类型,1为填空题,2位选择题
  Title:{type:String, required:true},    //题目的问题标题或问题
  Content:{type:String, default: '[]'},    //如果是填空题,这里为空,如果是选择题则是json字符串["答案1"，"答案2",...]
  Answer: { type: String, required:true}, //题目描述
  InputTime:{type: Date,  default: function(){return Date.now()} }  //题目录入时间
})


Riddle.statics.Add = function (obj,cb) {//插入一条题目
  return this.create(obj,cb);	
}

Riddle.statics.FindAllIdByTypeId = function (typeid, cb) {//根据题目类型id，查找所有题目的id
  return this.find({"TypeId":typeid}, '_id', cb);
}

Riddle.statics.FindAllByTypeId = function (typeid, cb) {//根据题目类型id，查找所有题目的信息
  return this.find({"TypeId":typeid},  cb);
}

Riddle.statics.FindById = function (id, cb) {  //根据id查找某一道题目的信息
  return this.findOne({"_id":id}, cb);
}

Riddle.statics.FindByIdArray = function (idArray, cb) {  //根据id查找某一道题目的信息
  return this.find({"_id":{$in:idArray}}, cb);
}

Riddle.statics.ModifyById = function (id,obj,cb) { //根据题目id，修改一条题目
  return this.update({"_id":id}, obj, {"safe":true}, cb);	
}

Riddle.statics.DeleteById = function (id, cb) { //根据id，删除一条题目
  return this.remove({"_id":id}, cb);
}

Riddle.statics.FindObj = function(obj,cb){ //根据对象查找信息后台用
  return this.find(obj)
             .limit(10000)
             .exec(cb); 
}

Riddle.statics.FindAll = function(cb){
  return this.find({})
             .limit(20000)
             .sort({"_id":-1})
             .exec(cb);
}

Riddle.statics.FindAllNoPicUrl = function(cb){
  return this.find({PicUrl:''})
             .limit(20000)
             .sort({"_id":-1})
             .exec(cb);
}


module.exports = mongoose.model('Riddle', Riddle);


