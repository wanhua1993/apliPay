//数据库配置
//全局数据库配置
var mysql = require('mysql');
var connection = mysql.createConnection({
	// 外网
    // host   : 'pdlmysqldb1.mysql.rds.aliyuncs.com',
    // user: 'pdl_db_user',
    // password: 'fuZaim3ur8Ie',
    // database: 'new_v3'
    
    // 内网
    host: '192.168.0.151',
    user: 'root',
    password: '123456',
    database: 'test_wdl'
});
connection.connect();

module.exports = connection;