// JavaScript Document
window.DataHost = ''

$(function(){

	var local_uri = location.pathname;
	$('.nav-list a').each(function(){
		var that = $(this)
		if(that.attr('href').indexOf(local_uri) === 0){
			that.parent().addClass('active')
		}
	})


})