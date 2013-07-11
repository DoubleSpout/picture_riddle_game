
var mongoose =require('./db_conn.js'),
	Schema = mongoose.Schema;

var UserToken = new Schema({ //定义结构
  UserId: { type: String, required:true},     //用户id
  InputTime:{type: Date, default: Date.now()}  //写入时间
})


UserToken.statics.add = function (obj,cb) {//插入token信息
  return this.create(obj,cb);	
}

UserToken.statics.FindById = function (id, cb) {  //根据id查找Token信息

  return this.findOne({"_id":id}, cb);
}

UserToken.statics.DeleteById = function (id, cb) { //根据id，删除一条Token
  return this.findOneAndRemove({"_id":id}, cb);
}

UserToken.statics.FindByUserId = function (uid, cb) {  //根据id查找Token信息
  return this.findOne({"UserId":uid}, cb);
}

UserToken.statics.DeleteByUserId = function (uid, cb) { //根据id，删除一条Token
  return this.findOneAndRemove({"UserId":uid}, cb);
}
UserToken.statics.CountAll = function(cb){
  return this.count({},cb);
}

UserToken.statics.FindObj = function(obj,cb){ //根据对象查找信息后台用
  return this.find(obj)
             .limit(10000)
             .exec(cb); 
}

UserToken.statics.FindAll = function(cb){
  return this.find({})
             .limit(20000)
             .sort({"_id":-1})
             .exec(cb);
}


module.exports = mongoose.model('UserToken', UserToken);


