const crypto = require('crypto');
const moment = require('moment');
const request = require('request');
const Url = require('../config/config').Url;
const weiPay = require('../config/config').weiPay;

class WxPay {
    constructor() {
        
    }
    // 随机字符串生成 32位
    getRandomString(len) {
        len = len || 32;
        let $chars = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678'; // 默认去掉了容易混淆的字符oOLl,9gq,Vv,Uu,I1 
        let maxPos = $chars.length;
        var pwd = '';
        for (let i = 0; i < len; i++) {
            pwd += $chars.charAt(Math.floor(Math.random() * maxPos));
        }
        return pwd;
    }
    // 获取时间字符串
    _get_date_string() {

        let date = moment().format('YYYY MM DD HH mm ss');
        return date.split(' ').join('');
    }
    // 生成订单号
    _get_out_trade_no() {
        return this._get_date_string() + "" + Math.random().toString().substr(2, 10);
    }
    // 解析XML
    getXMLNodeValue(node_name, xml) {
        let tmp = xml.split("<" + node_name + ">");
        let _tmp = tmp[1].split("</" + node_name + ">");
        return _tmp[0];
    }
    // 对字符串进行拼接
    raw(args) {
        let keys = Object.keys(args);
        console.log(keys)
        keys = keys.sort();
        let newArgs = {};
        keys.forEach(function (key) {
            newArgs[key.toLowerCase()] = args[key];
        });

        let string = '';
        for (let k in newArgs) {
            string += '&' + k + '=' + newArgs[k];
        }
        string = string.substr(1);
        return string;
    }
    // 生成签名
    paySign(ret) {
        let string = this.raw(ret);
        let key = weiPay.partner_key; // 密钥
        string = string + '&key=' + key;  //key为在微信商户平台(pay.weixin.qq.com)-->账户设置-->API安全-->密钥设置
        return crypto.createHash('md5').update(string, 'utf8').digest('hex').toUpperCase();
    }
    // 对签名进行验证
    sureSign(options, sign) {
        delete options.sign;
        let string = this.raw(options);
        let key = weiPay.partner_key; // 密钥
        string = string + '&key=' + key;  //key为在微信商户平台(pay.weixin.qq.com)-->账户设置-->API安全-->密钥设置
        let sureSign = crypto.createHash('md5').update(string, 'utf8').digest('hex').toUpperCase();
        if (sign == sureSign) {
            console.log('验签成功');
            return true;
        } else {
            console.log('验签失败');
            return false;
        }
    }
    // 微信统一下单接口
    pay(req, res, callback) {
        let money = Number(req.body.money);
        let type = req.body.type;
        let urlPost = 'https://api.mch.weixin.qq.com/pay/unifiedorder';
        let opts = {
            total_fee: money * 100,
            attach: 'weixinzhifu',
            body: type,
            nonce_str: this.getRandomString(32),
            appid: weiPay.appId,
            mch_id: weiPay.mch_id,
            notify_url: Url + '/wxPayWeb',
            out_trade_no: this._get_out_trade_no(),
            trade_type: 'NATIVE',
            product_id: '12235413214070356458059',
            time_stamp: this._get_date_string()
        };
        let formData = "<xml>";
        formData += "<appid>" + opts.appid + "</appid>"; //appid
        formData += "<attach>" + opts.attach + "</attach>"; //附加数据
        formData += "<body>" + opts.body + "</body>"; //商品或支付单简要描述
        formData += "<mch_id>" + opts.mch_id + "</mch_id>"; //商户号
        formData += "<notify_url>" + opts.notify_url + "</notify_url>";
        formData += "<time_stamp>" + opts.time_stamp + "</time_stamp>";
        formData += "<nonce_str>" + opts.nonce_str + "</nonce_str>"; //随机字符串，不长于32位
        formData += "<product_id>" + opts.product_id + "</product_id>";
        formData += "<out_trade_no>" + opts.out_trade_no + "</out_trade_no>"; //订单号
        formData += "<total_fee>" + opts.total_fee + "</total_fee>"; //金额
        formData += "<trade_type>NATIVE</trade_type>"; //NATIVE会返回code_url ，JSAPI不会返回
        formData += "<sign>" + this.paySign(opts) + "</sign>";
        formData += "</xml>";
        var options = {
            url: urlPost,
            method: 'POST',
            body: formData,
            encoding: 'utf8',
        };
        var that = this;
        request(options, function (err, response, body) {
            if (!err && response.statusCode == 200) {
                var prepay_id = that.getXMLNodeValue('prepay_id', body.toString("utf-8"));// 生成预支付ID
                var tmpPre = prepay_id.split('[');
                var tmp1 = tmpPre[2].split(']');
                var code_url = that.getXMLNodeValue('code_url', body.toString("utf-8"));// 二维码链接
                var tmpUrl = code_url.split('[');
                var tmp3 = tmpUrl[2].split(']');
                var sign = that.getXMLNodeValue('sign', body.toString('utf-8')).split('[')[2].split(']')[0];
                // 将预支付ID 和 二维码链接 返回到客户端
                // code_url = tmp3[0]+ '&appid=' + appid + '&muc_id=' + mch_id + '&nonce_str=' + nonce_str + '&product_id=' + product_id + '&time_stamp=' + time_stamp + '&sign=' + sign;
                var data = {
                    tmp: tmp1[0],
                    code_url: tmp3[0],
                    out_trade_no: opts.out_trade_no,
                    _body: opts.body,
                    sign: sign,
                    nonce_str: opts.nonce_str
                }
                callback(err, data);
            } else {
                callback(err);
            }
        }
        );
    }
    // 关闭订单接口
    closeOrder() {
        let sign = req.query.sign.split(',')[0];
        let urlPost = 'https://api.mch.weixin.qq.com/pay/closeorder';
        let opts = {
            appId: weiPay.appId,
            muc_id: weiPay.mch_id,
            out_trade_no: req.query.out_trade_no,
            nonce_str: req.query.nonce_str.split(',')[0],
        }
        let formData = "<xml>";
        formData += "<appid>" + opts.appId + "</appid>"; //appid
        formData += "<mch_id>" + opts.mch_id + "</mch_id>"; //商户号
        formData += "<nonce_str>" + opts.nonce_str + "</nonce_str>"; //随机字符串，不长于32位
        formData += "<out_trade_no>" + opts.out_trade_no + "</out_trade_no>"; //订单号
        formData += "<sign>" + this.paySign(opts) + "</sign>";
        formData += "</xml>";
        var options = {
            url: urlPost,
            method: 'POST',
            body: formData,
            encoding: 'utf8',
        };
        var that = this;
        request(options, function (err, response, body) {
            if (!err && response.statusCode == 200) {
                var result_code = that.getXMLNodeValue('result_code', body.toString("utf-8"));
                var tmp = result_code.split('[');
                var code = tmp[2].split(']')[0];
                if (code == 'SUCCESS') {
                    var result = '关闭订单成功';
                    callback(err, result, code);
                } else {
                    result = '关闭订单失败';
                    callback(err, result, code);
                }
            } else {
                callback(err);
            }
        }
        );
    }
}

module.exports = WxPay;