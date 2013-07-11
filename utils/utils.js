/**
 * Module dependencies.
 */

var http = require('http'),
	crypto = require('crypto'),
	Path = require('path'),	
	isWindows = process.platform === 'win32',//是否是windows
    fs = require('fs');




/**
 * Return md5 hash of the given string and optional encoding,
 * defaulting to hex.
 *
 *     utils.md5('wahoo');
 *     // => "e493298061761236c96b02ea6aa8a2ad"
 *
 * @param {String} str
 * @param {String} encoding
 * @return {String}
 * @api public
 */

exports.md5 = function(str, encoding){
  return crypto
    .createHash('md5')
    .update(str)
    .digest(encoding || 'hex');
};

/**
 * Merge object b with object a.
 *
 *     var a = { foo: 'bar' }
 *       , b = { bar: 'baz' };
 *     
 *     utils.merge(a, b);
 *     // => { foo: 'bar', bar: 'baz' }
 *
 * @param {Object} a
 * @param {Object} b
 * @return {Object}
 * @api private
 */

exports.merge = function(a, b){
  if (a && b) {
    for (var key in b) {
      a[key] = b[key];
    }
  }
  return a;
};


/*
object copy
*/
exports.copy = function(a){
	return JSON.parse(JSON.stringify(a));
}

exports.escape = function(html){
  return String(html)
    .replace(/&(?!\w+;)/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
};


exports.check_mobile = function(mobile){
  return /^[0-9]{11,11}$/.test(mobile)
};

exports.check_name = function(name){
  return /[^u4e00-u9fa5]{1,10}$/.test(name)
};

exports.format_mobile = function(mobile){
  for(i=3;i<8;i++){
      mobile[i] = '*';
  }
  return mobile
};

exports.format_name = function(name){
  var n = name.length;
  for(i=1;i<n;i++){
      name[i] = '*';
  }
  return name
};


exports.filter_models = function(model_str){

  try{
    var obj = JSON.parse(model_str)
  }
  catch(e){
    return false;
  }
  
  obj.forEach(function(objv){
      Object.keys(objv).forEach(function(v){
        if(objv[v] === '') {
          delete objv[v];
        }
      })
  })

  

  return obj;
};
exports.AddJsonResult = function(obj,istrue,err){
    var key1 = "ret"
    var key2 = "err"
    if(!obj.hasOwnProperty(key1)){
      obj[key1] = istrue ? 1 : 0;
    }
    if(!obj.hasOwnProperty(key2) && err){
      obj[key2] = err;
    }
     return obj;
}


exports.GetAgent = function(AgentHead){
  var u = AgentHead||''
  return {         //移动终端浏览器版本信息
            trident: u.indexOf('Trident') > -1, //IE内核
            presto: u.indexOf('Presto') > -1, //opera内核
            webKit: u.indexOf('AppleWebKit') > -1, //苹果、谷歌内核
            gecko: u.indexOf('Gecko') > -1 && u.indexOf('KHTML') == -1, //火狐内核
            mobile: !!u.match(/AppleWebKit.*Mobile.*/), //是否为移动终端
            ios: !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/), //ios终端
            android: u.indexOf('Android') > -1 || u.indexOf('Linux') > -1, //android终端或uc浏览器
            iPhone: u.indexOf('iPhone') > -1 , //是否为iPhone或者QQHD浏览器
            iPad: u.indexOf('iPad') > -1, //是否iPad
            webApp: u.indexOf('Safari') == -1 //是否web应该程序，没有头部与底部
         }

/*

document.writeln(" 是否为移动终端: "+browser.versions.mobile);
document.writeln(" ios终端: "+browser.versions.ios);
document.writeln(" android终端: "+browser.versions.android);
document.writeln(" 是否为iPhone: "+browser.versions.iPhone);
document.writeln(" 是否iPad: "+browser.versions.iPad);
document.writeln(navigator.userAgent);
*/

}







exports.fdate = function(format){//格式化时间
		var format = typeof format === 'undefined'?false:format.toLowerCase(),
			now = new Date(),
			time = now.getFullYear()+"-"+(now.getMonth()+1)+"-"+now.getDate();
		if(format === 'y-m-d h:m:s'){
			time += ' '+now.getHours()+":"+now.getMinutes()+":"+now.getSeconds(); 
		}
		return time;
	};




exports.normalize_query = function(p){
	var nor_path = Path.normalize(p);
	if(isWindows) return  nor_path.replace(/\\/g, '/');
	return nor_path;
}