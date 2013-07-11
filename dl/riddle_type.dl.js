
var mongoose =require('./db_conn.js'),
	Schema = mongoose.Schema;

var Riddle_Type = new Schema({ //定义结构
  Name: { type: String, default: ''}, //题目名称
  Desc: { type: String, default: '' } //题目描述
})




Riddle_Type.statics.Add = function (obj,cb) {//插入一条题目类型
  return this.create(obj,cb);	
}

Riddle_Type.statics.ModifyById = function (id,obj,cb) { //根据题目id，修改一条题目类型
  return this.update({"_id":id}, obj, {"safe":true}, cb);	
}

Riddle_Type.statics.FindAll = function (cb) {//查找所有题目类型
  return this.find({}, cb);
}

Riddle_Type.statics.DeleteById = function (id, cb) { //根据id，删除一条题目类型
  return this.remove({"_id":id}, cb);
}

Riddle_Type.statics.FindObj = function(obj,cb){ //根据对象查找信息后台用
  return this.find(obj)
             .limit(10000)
             .exec(cb); 
}

Riddle_Type.statics.FindAll = function(cb){
  return this.find({})
             .limit(20000)
             .sort({"_id":-1})
             .exec(cb);
}


module.exports = mongoose.model('Riddle_Type', Riddle_Type);


