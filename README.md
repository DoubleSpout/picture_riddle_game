# picture riddle game
# 安装方法：
	npm install riddle
#配置
修改 pic_riddle_game/config/config.js 大约36行的mongodb连接代码

	//这里修改为你自己的数据库连接字符串
	"db_connection1":"mongodb://root:123456@127.0.0.1:27017/riddle", 

#运行

	require('riddle');

或者
	
	node app.js

#访问
浏览器打开：127.0.0.1:8000

后台打开：http://127.0.0.1:8000/manger/login/

用户名：admin

密码：admin

想要玩看图猜词游戏需要往数据库里先录入题目~