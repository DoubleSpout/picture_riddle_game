// JavaScript Document
var RIDDLE_INPUT = '<li ResultId="{1}"><div class="li_box"><div select="riddle-img" class="r_riddle_pic">'+
                    '<img src="{2}" onload="riddle_load()" name="riddle_img" /></div>'+
					'<p>{3}</p>'+
                	'<div r-data="answer-box">'+
                    '<input type="text" name="answer" class="ui-input-text ui-body-c ui-corner-all ui-shadow-inset" value="" placeholder="请输入答案"  />'+
                	'</div></div></li>';
					
var RIDDLE_SELECT_BOX = '<li ResultId="{1}"><div class="li_box"><div select="riddle-img" class="r_riddle_pic">'+
        			'<img  src="{2}" onload="riddle_load()" name="riddle_img"  /></div>'+
					'<p>{3}</p>'+
  					'<div r-data="answer-box"><div class="ui-controlgroup-controls">{4}</div></div></div></li>';
					
var RIDDLE_SELECT = '<a href="javascript:;" name="RiddleSelA" data-role="button" data-corners="true" data-shadow="true" data-iconshadow="true" data-wrapperels="span" data-theme="c" class="ui-btn ui-btn-inline ui-btn-up-c"><span class="ui-btn-inner"><span class="ui-btn-text">{1}</span></span></a>'			
			
var RIDDLE_RESULT = '<li><div class="li_box li_last_box"><h3 class="blue-t">恭喜您全部答题成功</h3>'+
        			'<h3>本次答题时间:<span id="r_result_score"></span>秒</h3>'+
					'<a href="result.html" data-ajax="false" data-role="button" data-corners="true" data-shadow="true" data-iconshadow="true" data-wrapperels="span" data-theme="c" class="ui-btn ui-corner-bottom ui-controlgroup-last ui-btn-up-c"><span class="ui-btn-inner ui-corner-bottom ui-controlgroup-last"><span class="ui-btn-text">查看我的答题记录</span></span></a>'+
          			'<a href="rank.html" data-ajax="false" data-role="button" data-corners="true" data-shadow="true" data-iconshadow="true" data-wrapperels="span" data-theme="c" class="ui-btn ui-corner-bottom ui-controlgroup-last ui-btn-up-c"><span class="ui-btn-inner ui-corner-bottom ui-controlgroup-last"><span class="ui-btn-text">查看答题排行榜</span></span></a>'
					//'<a href="javascript:;" data-role="button" data-corners="true" data-shadow="true" data-iconshadow="true" data-wrapperels="span" data-theme="b" class="ui-btn ui-corner-bottom ui-controlgroup-last ui-btn-up-b"><span class="ui-btn-inner ui-corner-bottom ui-controlgroup-last"><span class="ui-btn-text" id="riddle_weibo">分享到微博</span></span></div><a></li>'
 
window.hasLoadPic = false;
function riddle_load(that){
	

	if(!--window.r_num){
				
		$.mobile.hidePageLoadingMsg();
		$('#r_page').show();
		window.hasLoadPic = true;
	}
}	

$(function(){

	var isSliderIng = false;
	var SendResultId = 0;
	var Answer = 0;
	window.AnswerPos  = 0;
	var Riddle_Array = [];

	var $Li;
	
	var nextSlider = function(){
			if(isSliderIng) return false;
			isSliderIng = true;
			 $("#r_ul").animate({left: '-='+ $(window).width() +'px'}, 500,  function(){
				 	window.AnswerPos++;
				 	Riddle_init();
					isSliderIng = false; 
					
			});
	}

	var Riddle_init = function(){
		SendResultId = Riddle_Array[window.AnswerPos].ResultId;
		Answer = 0;
	}
	/*	
	$('#r_ul').delegate('div[select="riddle-img"]', 'click', function(){
			var that = $(this)
			var t_img = that.find('img');
			var src = t_img.attr('src');
			var t_img_h = t_img.height();
			var t_img_w = t_img.width();
			var whobj = CalulateWH(t_img_w, t_img_h);
			//console.log(whobj)
			
			$('#r_big_pic').css({'width':whobj.w+'px', 'height':whobj.h+'px'}).attr('src',src);
			$('#r_big_pic_box').show();
	})
	
	$('#r_big_pic_box').click(function(){
		$(this).hide();
		$('#r_big_pic').attr('src', '');
	})
	*/
	$('#r_next').click(function(){
		if(Riddle_Array[window.AnswerPos].Type == 1){
			Answer = $.trim($Li.eq(window.AnswerPos).find('input[name="answer"]').val());
		}
		else if(Riddle_Array[window.AnswerPos].Type == 2){
			Answer = $Li.eq(window.AnswerPos).find('a.ui-btn-up-b').find('.ui-btn-text').html() || 0;
		}
		else{
			Answer = 0;	
		}
				
		if(!Answer) {
			alert('回答错误，请重新答此题')
			return false;
		}
		
		ajax_send('post', '/client/game/answer', {answer:Answer, pos:window.AnswerPos, resultid:SendResultId, token:window.localStorage.token},
		function(err, d){
			if(err) return alert(err);
			
			if(d.result && d.result.Status == 1 && d.answer == true){
				$('#r_result_score').html(d.result.Score)
				$('#r_next').hide();
				nextSlider()
			}
			else if(d.ret == 1 && d.answer == true){
				nextSlider()				
			}
			else{
				alert('回答错误，请重新答此题')	
			}
		})
		return false;
	})
	
	
	
	
	var init = function(){		
		$.mobile.showPageLoadingMsg(); //打开loading
		ajax_send('get', '/client/game/start?token='+window.localStorage.token, {r:Math.random()}, function(err,d){
			if(err) return alert(err)
			var len = window.r_num = d.length;
			var riddle_li_str = '';
			Riddle_Array = d;
			
			for(var i=0;i<len;i++){
				var tmp = '';
				
				if(d[i].Type === 1){ //填空题
					tmp = RIDDLE_INPUT;
					tmp = tmp.replace('{1}', d[i].ResultId);
					tmp = tmp.replace('{2}', window.hostname+d[i].PicUrl);
					tmp = tmp.replace('{3}', d[i].Title);
					
				}
				else if(d[i].Type === 2){ //选择题
					try{
						var r_sel_array = JSON.parse(d[i].Content);
						var r_sel_array_len = r_sel_array.length;
					}
					catch(e){
						alert('题目获取失败')
						return location.href = 'main.html'	
					}
					
					var r_sel_str = '';
					for(var j=0;j<r_sel_array_len;j++){
						r_sel_str += RIDDLE_SELECT.replace('{1}', r_sel_array[j])
					}
					
				
					tmp = RIDDLE_SELECT_BOX;
					tmp = tmp.replace('{1}', d[i].ResultId);
					tmp = tmp.replace('{2}', window.hostname+d[i].PicUrl);
					tmp = tmp.replace('{3}', d[i].Title);
					tmp = tmp.replace('{4}',r_sel_str);					
				}	
				
				riddle_li_str += tmp;
			}
			$('#r_ul').html(riddle_li_str+RIDDLE_RESULT);
			
			var liLen = $('#r_ul li').css('width', $(window).width()+'px').length;
			
			$('#r_ul').css('width', liLen*2000+'px');
			$Li = $('#r_ul li');
			
			$('#r_ul a[name="RiddleSelA"]').click(function(){
				var that = $(this);
				that.parent().find('a[name="RiddleSelA"]').removeClass('ui-btn-up-b').addClass('ui-btn-up-c')
				that.removeClass('ui-btn-up-c').addClass('ui-btn-up-b');	
			})
			Riddle_init();
			
		})
		
		
		
	}()
	
	
	setTimeout(function(){
		if(!window.hasLoadPic){
			alert('网络不给力，图片加载失败');
			location.href = 'main.html';	
		}
	},1000*60)
})



function orientationChange(){

	$('#r_ul li').css('width',$(window).width()+'px').length;
	$('#r_ul').css('left', -1*$(window).width()* window.AnswerPos+ 'px')
	
}


addEventListener('load', function(){

    orientationChange();

    window.onorientationchange = orientationChange;

});