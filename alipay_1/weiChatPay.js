/**
 * Created by wanhua on 2017/7/6.
 */
// 签名加密算法
var crypto = require('crypto');
var moment = require('moment');
var request = require('request');
var Url = require('../config/config').Url;
var weiPay = require('../config/config').weiPay;
// 生成签名
function paySign(appid, attach, body, mch_id, notify_url, time_stamp, nonce_str, product_id, out_trade_no, total_fee, trade_type) {
    var ret = {
        appid: appid,
        attach: attach,
        body: body,
        mch_id: mch_id,
        nonce_str: nonce_str,
        product_id: product_id,
        out_trade_no: out_trade_no,
        total_fee: total_fee,
        trade_type: trade_type,
        notify_url: notify_url,
        time_stamp: time_stamp
    };
    var string = raw(ret);
    var key = weiPay.partner_key; // 密钥
    string = string + '&key=' + key;  //key为在微信商户平台(pay.weixin.qq.com)-->账户设置-->API安全-->密钥设置
    return crypto.createHash('md5').update(string, 'utf8').digest('hex').toUpperCase();
}
// 对签名进行验证
function sureSign(options, sign) {
    delete options.sign;
    var string = raw(options);
    var key = weiPay.partner_key; // 密钥
    string = string + '&key=' + key;  //key为在微信商户平台(pay.weixin.qq.com)-->账户设置-->API安全-->密钥设置
    var sureSign = crypto.createHash('md5').update(string, 'utf8').digest('hex').toUpperCase();
    if(sign == sureSign) {
        console.log('验签成功');
        return true;
    }else {
        console.log('验签失败');
        return false;
    }
}
function raw(args) {
    var keys = Object.keys(args);
    keys = keys.sort();
    var newArgs = {};
    keys.forEach(function (key) {
        newArgs[key.toLowerCase()] = args[key];
    });

    var string = '';
    for (var k in newArgs) {
        string += '&' + k + '=' + newArgs[k];
    }
    string = string.substr(1);
    return string;
}
// 随机字符串生成
function getRandomString(len) {
    len = len || 32;
    var $chars = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678'; // 默认去掉了容易混淆的字符oOLl,9gq,Vv,Uu,I1  
    var maxPos = $chars.length;
    var pwd = '';
    for (i = 0; i < len; i++) {
        pwd += $chars.charAt(Math.floor(Math.random() * maxPos));
    }
    return pwd;
}
// 获取时间字符串
function _get_date_string() {
    var date = moment().format('YYYY MM DD HH mm ss');
    return date.split(' ').join('');
}

function _get_out_trade_no() {
    return _get_date_string() + "" + Math.random().toString().substr(2, 10);
}
// 解析XML
function getXMLNodeValue(node_name, xml) {
    var tmp = xml.split("<" + node_name + ">");
    var _tmp = tmp[1].split("</" + node_name + ">");
    return _tmp[0];
}
exports.pay = function (req, res, callback) {
    var number = req.body.money;
    var type = req.body.type;
    var _out_trade_no = _get_out_trade_no();
    var _attach = 'dianYinPay';
    var _body = type;
    var _nonce_str = getRandomString(32);
    var urlPost = "https://api.mch.weixin.qq.com/pay/unifiedorder";
    var appid = weiPay.appId; // 公众账号ID
    var mch_id = weiPay.mch_id; // 商户号
    var notify_url = Url + '/website/show/myWalletVoucher/weiPayWeb'; // 通知地址
    var out_trade_no = _out_trade_no; // 商户订单号
    var total_fee = number * 100; // 标价金额
    var attach = _attach; // 附加数据
    var body = _body; // 商品描述
    var nonce_str = _nonce_str; // 随机字符串
    var trade_type = 'NATIVE';
    var product_id = '12235413214070356458059';
    var time_stamp = _get_date_string();
    var formData = "<xml>";
    formData += "<appid>" + appid + "</appid>"; //appid
    formData += "<attach>" + attach + "</attach>"; //附加数据
    formData += "<body>" + body + "</body>"; //商品或支付单简要描述
    formData += "<mch_id>" + mch_id + "</mch_id>"; //商户号
    formData += "<notify_url>" + notify_url + "</notify_url>";
    formData += "<time_stamp>" + time_stamp + "</time_stamp>";
    formData += "<nonce_str>" + nonce_str + "</nonce_str>"; //随机字符串，不长于32位
    formData += "<product_id>" + product_id + "</product_id>";
    formData += "<out_trade_no>" + out_trade_no + "</out_trade_no>"; //订单号
    formData += "<total_fee>" + total_fee + "</total_fee>"; //金额
    formData += "<trade_type>NATIVE</trade_type>"; //NATIVE会返回code_url ，JSAPI不会返回
    formData += "<sign>" + paySign(appid, attach, body, mch_id, notify_url, time_stamp, nonce_str, product_id, out_trade_no, total_fee, 'NATIVE') + "</sign>";
    formData += "</xml>";
    var options = {
        url: urlPost,
        method: 'POST',
        body: formData,
        encoding: 'utf8',
    };
    request(options, function (err, response, body) {
            if (!err && response.statusCode == 200) {
                var prepay_id = getXMLNodeValue('prepay_id', body.toString("utf-8"));// 生成预支付ID
                var tmpPre = prepay_id.split('[');
                var tmp1 = tmpPre[2].split(']');
                var code_url = getXMLNodeValue('code_url', body.toString("utf-8"));// 二维码链接
                var tmpUrl = code_url.split('[');
                var tmp3 = tmpUrl[2].split(']');
                var sign = getXMLNodeValue('sign', body.toString('utf-8')).split('[')[2].split(']')[0];
                // 将预支付ID 和 二维码链接 返回到客户端
                // code_url = tmp3[0]+ '&appid=' + appid + '&muc_id=' + mch_id + '&nonce_str=' + nonce_str + '&product_id=' + product_id + '&time_stamp=' + time_stamp + '&sign=' + sign;
                var opts = {
                    tmp: tmp1[0],
                    code_url: tmp3[0],
                    out_trade_no: out_trade_no,
                    _body: _body,
                    sign: sign,
                    nonce_str: nonce_str
                }
                callback(err, opts);
            }else {
                callback(err);
            }
        }
    );
};
exports.sureSign = sureSign;
function closeSign(appid, mch_id, nonce_str, out_trade_no){
    var ret = {
        appid: appid,
        mch_id: mch_id,
        nonce_str: nonce_str,
        out_trade_no: out_trade_no,
    };
    var string = raw(ret);
    var key = weiPay.partner_key; // 密钥
    string = string + '&key=' + key;  //key为在微信商户平台(pay.weixin.qq.com)-->账户设置-->API安全-->密钥设置
    return crypto.createHash('md5').update(string, 'utf8').digest('hex').toUpperCase();
}
exports.closeOrder = function (req, res, callback){
    var appId = weiPay.appId;
    var mch_id = weiPay.mch_id;
    var out_trade_no = req.query.out_trade_no;
    var nonce_str = req.query.nonce_str.split(',')[0];
    var sign = req.query.sign.split(',')[0];
    var urlPost = 'https://api.mch.weixin.qq.com/pay/closeorder';
    var formData = "<xml>";
    formData += "<appid>" + appId + "</appid>"; //appid
    formData += "<mch_id>" + mch_id + "</mch_id>"; //商户号
    formData += "<nonce_str>" + nonce_str + "</nonce_str>"; //随机字符串，不长于32位
    formData += "<out_trade_no>" + out_trade_no + "</out_trade_no>"; //订单号
    formData += "<sign>" + closeSign(appId, mch_id, nonce_str, out_trade_no) + "</sign>";
    formData += "</xml>";
    var options = {
        url: urlPost,
        method: 'POST',
        body: formData,
        encoding: 'utf8',
    };
    request(options, function (err, response, body) {
            if (!err && response.statusCode == 200) {
                var result_code = getXMLNodeValue('result_code', body.toString("utf-8"));
                var tmp = result_code.split('[');
                var code = tmp[2].split(']')[0];
                if(code == 'SUCCESS') {
                    var result = '关闭订单成功';
                    callback(err, result, code);
                }else {
                    result = '关闭订单失败';
                    callback(err, result, code);
                }
            }else {
                callback(err);
            }
        }
    );
};
