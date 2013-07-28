
	module.exports = function(app){
		require('./manger_cl/routeBae.js')(app);
		require('./client_cl/routeBae.js')(app);
	}