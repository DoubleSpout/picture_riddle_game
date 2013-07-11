var UserModel = require('./dl/user.dl.js')


var cb = function(err,doc){
	console.log(err)
	console.log(doc)
};

/*
UserModel.Regist({
	Mobile:13771711621,
	Name:"11"
},cb)

var n =100
while(--n){
UserModel.FindById('51d6ddcd812f3c200b000001',cb)
}
*/