var express = require('express');
var app = express();
var iroute = require("iroute");
var ifile = require("ifile");
var route_array = require('./route.js');
var config = require('./config/config.js');


  app.set('views', __dirname + '/manger');
  app.set('view engine', 'ejs');


  app.use(ifile.connect([
	  	["/c_skin", __dirname+'/client'],
	  	["/m_skin", __dirname+'/manger']
  	]));


 app.use(express.bodyParser({ keepExtensions: true, uploadDir: __dirname+'/upload/' }));

 app.use(express.cookieParser());
 app.use(express.cookieSession({ secret: 'szhouse', cookie: { maxAge: 60 * 60 * 1000 }}));

 app.use(iroute.connect(route_array))

  app.listen(config.listen_port);

  logger.info('server start on ' + config.listen_port)