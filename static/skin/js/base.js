


$(function(){
	window.hostname = '';
	window.screen_h = $(window).height();
	window.screen_w = $(window).width();
	
	var localStorage = window.localStorage
	
	if(!localStorage){
	 	alert('This browser not supports localStorage');
	}
	
	
	$('#r_page').css('height', screen_h+'px')	
	
	if(screen_h<600){
		$('div[select="riddle-img"]').each(function(){
			$(this).addClass('r_riddle_pic_lower')	
		})
	}
	
	
	$('div[select="riddle-img"]').click(function(){
			var that = $(this)
			var src = that.find('img').attr('src');			
			$('#r_big_pic').attr('src',src);
			$('#r_big_pic_box').show();
	})
	$('#r_big_pic_box').click(function(){
		$(this).hide();
		$('#r_big_pic').attr('src', '');
	})
	$('#r_big_pic').load(function(){
		var that = $(this)
		var img_h = that.height();
		var img_w = that.width();
		var wide = img_w > img_h ? 1 : 0;
		if(wide){
			var _img_w = img_w > screen_w ? screen_w : img_w;
		
			that.css('width', _img_w+'px')
			that.parent().css('line-height', screen_h+'px')
	
		}
		else{
			var _img_h = img_h > screen_h ? screen_h : img_h;
			that.css('height', _img_h+'px')
		}
	})
	
	//login
	if($('#login').length>0){
	
		if(localStorage.id != 0 && typeof localStorage.id != 'undefined'){
			location.href = 'main.html'
			return;	
		}

		var inp_mobile = $('#mobile')
		var inp_name = $('#name')
		$('#login, #r_login2').click(function(){
				var m_v = $.trim(inp_mobile.val());
				var n_v = $.trim(inp_name.val());
				if(!/^[0-9]{11,11}$/.test(m_v)){
					alert('手机号格式错误');
					return false;	
				}
				if(!/[^u4e00-u9fa5]{1,10}$/.test(n_v)){
					alert('姓名格式错误');
					return false;	
				}
				ajax_send('post', '/client/user/login',{mobile:m_v, name:n_v},function(err, d){
					if(err) return alert(err);

					localStorage.id = d.id;
					localStorage.token = d.token;
					localStorage.mobile = d.mobile;
					localStorage.name = d.name;
					localStorage.lastlogintime = d.lastlogintime;
					location.href = 'slider.html'
				})			
		})			
	}
	
	//main
	if($('#main_name').length>0){

		$('#main_name').html(localStorage.name);
		$('#main_mobile').html(localStorage.mobile)	
		$('#r_logout').click(function(){		
			ajax_send('get','/client/user/logout?token='+localStorage.token+'&r='+Date.now(), {}, function(err,d){
					clearlocalStorage();
					location.href = window.hostname + '/'						
			})
		})
	}
	
	//rank
	if($('#r_rank_table').length>0){
		ajax_send('get', '/client/game/rank?token='+localStorage.token+'&r='+Date.now(), {}, function(err,d){
				if(err){
					return alert(err)
				}

				var len = d.length;
				var tb_str = ""
				for(var i=0;i<len;i++){
						tb_str += "<tr><td>"+(i+1)+"</td><td>"+d[i].Mobile+"</td><td>"+d[i].Name+"</td><td>"+new Date(d[i].Time).Format("yyyy-MM-dd")+"</td><td>"+d[i].Score+"秒</td></tr>"
				}
				$('#r_rank_table').append(tb_str);
				try{
					var update_time =new Date(d[0].InputTime).Format("yyyy-MM-dd hh:mm:ss") 	
				}
				catch(e){
					var update_time = "暂无"
				}
				$('#updatetime').html(update_time)
		})		
	}
	
	//result
	if($('#r_result_table').length>0){
		ajax_send('get', '/client/game/result?token='+localStorage.token+'&r='+Date.now(), {}, function(err,d){
				if(err){
					return alert(err)
				}

				var len = d.length;
				var tb_str = ""
				for(var i=0;i<len;i++){
						tb_str += "<tr><td>"+(i+1)+"</td><td>"+d[i].Mobile+"</td><td>"+new Date(d[i].EndTime).Format("yyyy-MM-dd hh:mm:ss")+"</td><td>"+d[i].Score+"秒</td></tr>"
				}
				$('#r_result_table').append(tb_str);
		})	
		
	}
	
	
	
	
})

var ajax_send = function(method, url, obj, cb){
	var cb = cb || function(){}
	if(!method || !url || !obj) return cb('js error');
	$[method](window.hostname + url, obj, function(d){
		
		if(d.ret == 0 && d.tokenerr ==1){
			clearlocalStorage()
			alert('登录超时，请重新登录!');			
			location.href = window.hostname + '/'
			return;
		}
		if(d.ret == 0){		
			cb(d.err)
			return;
		}	
		cb(null, d);			
	},'json')
	
}

var clearlocalStorage = function(){
	var localStorage = window.localStorage
	
	localStorage.id = 0;
	localStorage.token = 0;
	localStorage.mobile = 0;
	localStorage.name = 0;
	localStorage.lastlogintime = 0;
	
}

function CalulateWH(w , h, max_w, max_h){

	var max_h = max_h || $(window).height();
	var max_w = max_w || $(window).width();
	
	var fit_h = (max_w/w)*h;
	
	var fit_w = (max_h/h)*w;
	
	if(fit_h>max_h){
		fit_h = max_h;
		fit_w = (max_h/h)*w;
	}
	else if(fit_w>max_w){
		fit_w = max_w;
		fit_h = (max_w/w)*h;
	}
	
	return {h:fit_h, w:fit_w}
	
}



// 对Date的扩展，将 Date 转化为指定格式的String
// 月(M)、日(d)、小时(h)、分(m)、秒(s)、季度(q) 可以用 1-2 个占位符， 
// 年(y)可以用 1-4 个占位符，毫秒(S)只能用 1 个占位符(是 1-3 位的数字) 
// 例子： 
// (new Date()).Format("yyyy-MM-dd hh:mm:ss.S") ==> 2006-07-02 08:09:04.423 
// (new Date()).Format("yyyy-M-d h:m:s.S")      ==> 2006-7-2 8:9:4.18 
Date.prototype.Format = function (fmt) { //author: meizz 
    var o = {
        "M+": this.getMonth() + 1, //月份 
        "d+": this.getDate(), //日 
        "h+": this.getHours(), //小时 
        "m+": this.getMinutes(), //分 
        "s+": this.getSeconds(), //秒 
        "q+": Math.floor((this.getMonth() + 3) / 3), //季度 
        "S": this.getMilliseconds() //毫秒 
    };
    if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o)
    if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    return fmt;
}