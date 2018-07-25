'use strict';

let env = process.env.NODE_ENV || 'development';
let config = {
	partner: '2088102176160699', //合作身份者id，以2088开头的16位纯数字
	key: '1djzxvce4nc2gavnyf3472tummbz21dp', //安全检验码，以数字和字母组成的32位字符
	seller_email: 'nyjhds7128@sandbox.com', //卖家支付宝帐户 必填
	host: 'http://zhenxing.frpgz1.idcfengye.com' //域名  ？？上线后换过来
}

var Alipay = require('./alipay').Alipay;
var alipay = new Alipay(config);

alipay.on('verify_fail', function() {
		console.log('index emit verify_fail')
	})
	.on('create_direct_pay_by_user_trade_success', function(out_trade_no, trade_no,callback) {
		console.log('test： callback: create_direct_pay_by_user_trade_success')
		return callback();
	})
	.on('refund_fastpay_by_platform_pwd_success', function(batch_no, success_num, result_details,callback) {
		console.log('test： callback: refund_fastpay_by_platform_pwd_success')
		return callback();
	})

module.exports = alipay;