var express = require('express');
var app = express();
var config = require('./config/config.js');


  app.set('views', __dirname + '/manger');
  app.set('view engine', 'ejs');

if(process.env.BAE_ENV_APPID){
	//app.use('/static', express.static(__dirname + '/static'));
	//app.use('/riddle', express.static(__dirname + '/upload/riddle'));
	app.use('/m_skin', express.static(__dirname + '/manger/m_skin'));
	
}
else{
	var iroute = require("iroute");
	var ifile = require("ifile");
	var route_array = require('./route.js');
	app.use(ifile.connect([
	  	["/static", __dirname],
	  	["/riddle", __dirname+'/upload'],
	  	["/m_skin", __dirname+'/manger']
  	]));
}

 app.use(express.bodyParser({ keepExtensions: true, uploadDir: __dirname+'/upload/' }));

 app.use(express.cookieParser());
 app.use(express.cookieSession({ secret: 'szhouse', cookie: { maxAge: 60 * 60 * 1000 }}));

if(process.env.BAE_ENV_APPID){
	require('./routeBae.js')(app)
}
else{
	app.use(iroute.connect(route_array))
}

  app.listen(config.listen_port);

  logger.info('server start on ' + config.listen_port)