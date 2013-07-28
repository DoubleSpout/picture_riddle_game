
var mongoose =require('./db_conn.js'),
	Schema = mongoose.Schema;

var UserSchema = new Schema({ //定义结构
  Mobile: { type: String, required:true, unique: true},   //用户手机号码
  Name: { type: String, required:true},     //用户真实姓名
  RegTime: { type: Date, default: function(){return Date.now()} },    //用户注册时间
  RegIp:{type: String, default: '0.0.0.0' },        //用户注册ip地址
  LoginTimes: { type: Number, default: 1 },        //登录次数
  Agent:{type: String, default: 'other'},           //用户登录设备
  LastLoginTime: { type: Date, default: function(){return Date.now()} }    //上一次登录时间
})



UserSchema.statics.Regist = function (obj,cb) { //插入用户注册信息
  
  return this.create(obj,cb);	
}

UserSchema.statics.Login = function (id,cb) {    //用户登录成功修改登录信息
  return this.update({"_id":id}, {LastLoginTIme:Date.now(), "$inc":{"LoginTimes":1}}, {"safe":true}, cb);	
}

UserSchema.statics.FindById = function (id, cb) {  //根据id查找用户信息
  return this.findOne({"_id":id}, cb);
}

UserSchema.statics.FindByMobile = function (mobile,cb) { //根据mobile查找用户信息
  return this.findOne({"Mobile":mobile}, cb);
}

UserSchema.statics.ModifyById = function (id,obj,cb) {  //根据id修改用户信息
  return this.update({"_id":id}, obj, {"safe":true}, cb);
}

UserSchema.statics.DeleteById = function (id, cb) {  //根据id删除用户信息
  return this.remove({"_id":id}, cb);
}

UserSchema.statics.CountByMobile = function(mobile, cb){ //根据mobile获取用户数量

  return this.count({"Mobile":mobile}, cb);
}

UserSchema.statics.CountIpOneDay = function(ip, cb){ //根据mobile获取用户数量
  var ts = Date.now() - 1000*60*60*24;
  return this.count({RegIp:ip, RegTime:{"$gt": ts}}, cb);
}

UserSchema.statics.CountAll = function(cb){
  return this.count({},cb);
}

UserSchema.statics.UpdateById = function(id,obj,cb){ //根据mobile获取用户数量
  return this.update({"_id":id}, obj, {"safe":true}, cb); 
}


UserSchema.statics.FindObj = function(obj,cb){ //根据对象查找信息后台用
  return this.find(obj)
             .limit(10000)
             .exec(cb); 
}

UserSchema.statics.FindAll = function(cb){
  return this.find({})
             .limit(20000)
             .sort({"_id":-1})
             .exec(cb);
}


module.exports = mongoose.model('User', UserSchema);


