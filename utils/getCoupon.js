var crypto = require('crypto');
var http = require('http');
var request = require('request');
// var connection = require("../utils/dbconfig");
//发送短信
// const SMSClient = require('../node_modules/@alicloud/sms-sdk/index')
// ACCESS_KEY_ID/ACCESS_KEY_SECRET 根据实际申请的账号信息进行替换
const accessKeyId = 'LTAIer97Bb9Imu1v';
const secretAccessKey = 'KulgINpdbl8kTosoAr42RpVrX3rHR0';
//初始化sms_client
// let smsClient = new SMSClient({accessKeyId, secretAccessKey});

//获取优惠券码
function getUUID(){

}
getUUID.prototype.getuuid = function haha() {
        var s = [];
        var hexDigits = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        for (var i = 0; i <= 18; i++) {
            s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
        }
        //s[14] = "4";
        s[18] = hexDigits.substr((s[19] & 0x3) | 0x8, 1);
        s[4] = s[9] = s[15]  = "-";
        var uuid = s.join("");
        return uuid;
}
/**
 * 兑换券编号
 * @returns {string}
 */
getUUID.prototype.getorderid = function lala() {
    function S4() {
        return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
    }
    return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4());
}
/**
 * 平台游戏商品订单编号
 * @returns {string}
 */
getUUID.prototype.getout_trade_no = function haha() {
    var s = [];
    var hexDigits = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    for (var i = 0; i <= 30; i++) {
        s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
    }
    //s[14] = "4";
    s[18] = hexDigits.substr((s[19] & 0x3) | 0x8, 1);
    //s[4] = s[9] = s[15]  = "-";
    var uuid = s.join("");
    return uuid;
}

//发送短信－－shazhibao
getUUID.prototype.sendSMS = function sendSMS(mobile,code) {
    var data = {"code":code};
    smsClient.sendSMS({
        PhoneNumbers: mobile,
        SignName: '绿色沙漠社团',
        TemplateCode: 'SMS_91885001',
        TemplateParam: JSON.stringify(data)
    }).then(function (res) {
        let {Code}=res
        if (Code === 'OK') {
            //处理返回参数
            console.log("--短信验证码发送成功--");    return "SUCCESS";
        }
    }, function (err) {
        console.log(err);
        return "FAIL";
    })
}

//发送短信－－shipingtaitiao
getUUID.prototype.sendSMS2 = function sendSMS2(mobile,code) {
    var data = {"code":code};
    console.log(data);
    smsClient.sendSMS({
        PhoneNumbers: mobile,
        SignName: '及时及予',
        TemplateCode: 'SMS_113445517',
        TemplateParam: JSON.stringify(data)
    }).then(function (res) {
        let {Code}=res
        if (Code === 'OK') {
            //处理返回参数
            console.log("--短信验证码发送成功--");
            return "SUCCESS";
        }
    }, function (err) {
        console.log(err);
        return "FAIL";
    })
}




/**
 * 通知游戏商前往充值
 */
getUUID.prototype.notifyGameCompanyToRechargr =function notifyGameCompanyToRechargr(out_trade_no){
    //返回给游戏商appKey,timestamp,game_product_name,hash(appKey + game_product_name + timestamp)
    //更新下游戏交易记录状态（充值成功）
    connection.query("update w_game_recharge set state = 3 where out_trade_no = ?;",[out_trade_no],function (err,rows) {
        if(err) {
            console.log("---更新游戏交易记录状态失败---");
        }
        if(rows){
            console.log("更新下游戏交易记录状态成功，OK")
        }
    });

    var  sql = 'SELECT*FROM w_game_recharge WHERE out_trade_no = ?';
    connection.query(sql,[out_trade_no],function (err, result) {
        if(err){
            console.log('[SELECT ERROR] - ',err.message);
            return;
        }
        if(result.length != 1){
            console.log("数据错误。。。。,该商品订单不存在。。。");
            return;
        }
        var appKey = result[0].app_key;
        var game_product_id = result[0].game_product_id;
        var game_product_name = result[0].game_product_name;
        var recharge_money = result[0].recharge_money;
        var game_server_id =  result[0].game_server_id;
        var game_account =  result[0].game_account;
        //查询游戏服务器充值信息
        connection.query("SELECT*FROM w_game_server WHERE id = ?",[game_server_id],function (err, data) {
            if (err) {
                console.log('[SELECT ERROR] - ', err.message);
                return;
            }
            var game_name = data[0].game_name;
            var game_zone = data[0].game_zone;
            var game_server = data[0].game_server;
            var game_group = data[0].game_group;
            var timestamp = Date.parse(new Date());
            var signPass = md5(appKey + game_product_name + timestamp + game_account);
            var returnData = {appKey:appKey,gameName:game_name,productName:game_product_name,gameZone:game_zone,gameServer:game_server,gameGroup:game_group,timestamp:timestamp,gameAccount:game_account,signPass:signPass};
            console.log("发送参数："+returnData);
            //给游戏公司发送充值信息请求--先在w_game表查询充值接口的url（先用get请求，后期改为post请求）
            connection.query("SELECT*FROM w_game WHERE app_key = ? ",[appKey],function (err, data) {
                if (err) {
                    console.log('[SELECT ERROR] - ', err.message);
                    return;
                }
                var url = data[0].game_charge_url;
                if(url==undefined || url=="" || url == null ){
                    console.log("------游戏充值的url不存在-----")
                    console.log("不发送请求了。。。。结束");
                    return;
                }
                var gameRechargeUrl = url+"?appKey="+appKey+"&gameName="+game_name+"&productName="+game_product_name+"&gameZone="+game_zone+"&gameServer="+game_server+"&gameGroup="+game_group+
                    "&timestamp="+timestamp+"&signPass="+signPass;
                console.log("gameRechargeUrl:"+gameRechargeUrl)
                //好像不支持https请求
                /* http.get(gameRechargeUrl,function(req,res){
                     if(err){
                         throw err;
                         console.log("通知游戏商充值请求失败");
                         return;
                     }
                     console.log("通知游戏商充值请求发送成功");
                 });*/
                /*********************发送游戏充值请求Begin*****************************/
                console.log("********request发送请求*******");
                console.log("url:"+url);
                console.log(returnData);
                request({
                    url: url,
                    method: 'POST',
                    //json:true,
                    /*headers: {
                        "content-type": "application/json",
                    },*/
                    body: JSON.stringify(returnData)
                }, function (error, response, body) {
                    if(error) {
                        console.log(error.message);
                        console.log("-----请求出错-----");
                        return;
                    };
                    if (!error && response.statusCode == 200) {
                        console.log("返回的数据body:"+body);
                        if(body == "SUCCESS"){
                            //更新下数据库
                            connection.query("update w_game_recharge set recharge_state=1 where out_trade_no = ?",[out_trade_no],function (err,rs) {
                                if(err) console.log(err.message);
                                console.log("w_game_recharge表recharge_state状态更行成功");
                            })
                            console.log("相亲成功--SUCCESS");
                        }else{
                            /*************应该重新发送请求***********************************/
                            var i = 0;
                            var obj = setInterval(function(){
                                //查询数据库
                                connection.query("SELECT*FROM w_game_recharge WHERE out_trade_no = ?",[out_trade_no],function (err,rows) {
                                    if(err) throw console.log(err.message);
                                    if(rows[0].recharge_state == 1){
                                        clearInterval(obj);
                                        console.log("*****取消定时任务“***")
                                        return;
                                    }
                                    i++;
                                    if(i==30){
                                        clearInterval(obj);
                                        console.log("取消定时器");
                                        return;
                                    }
                                    console.log("------发送请求-----"+new Date()+"---"+i);
                                    //再次发送请求
                                    request({
                                        url: url,
                                        method: 'POST',
                                        //json:true,
                                        /*headers: {
                                            "content-type": "application/json",
                                        },*/
                                        body: JSON.stringify(returnData)
                                    },function (error, response, body) {
                                        if(body=="SUCCESS"){
                                            connection.query("update w_game_recharge set recharge_state=1 where out_trade_no = ?",[out_trade_no],function (err,rs) {
                                                if(err) console.log(err.message);
                                                console.log("w_game_recharge表recharge_state状态更行成功2");
                                            })
                                        }else{
                                            console.log("没有收到相应或者不是SUCCESS："+body);
                                        }
                                    });
                                });
                            },5000);
                            console.log("相应失败");
                        }
                        /*********************************************************************/
                    }else{
                        //console.log(" response.statusCode:"+ response.statusCode);
                        console.log("****未响应****"+new Date());
                    }
                })
                /********************发送请求游戏充值end******************************/
            });
        });
    });
}


function md5(str){
    var hash = crypto.createHash("md5");
    hash.update(new Buffer(str));
    var encode = hash.digest('hex');
    return encode.toUpperCase();
}

module.exports=new getUUID();


