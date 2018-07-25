                                                                                                           /**
 * Created by wanhua on 2017/7/6.
 */

var WXPay = require('weixin-pay');
var moment = require('moment');
var fs = require('fs');
var url = require('../config/config').Url;
var weiPay = require('../config/config').weiPay;
function _get_date_string() {
    var date = moment().format('YYYY MM DD HH mm ss');
    return date.split(' ').join('');
}
function _get_out_trade_no() {
    return _get_date_string() + "" + Math.random().toString().substr(2, 10);
}
// 微信支付相关参数
var wxpay = WXPay({
    appid: weiPay.appId,
    mch_id: weiPay.mch_id,
    partner_key: weiPay.partner_key, //微信商户平台API密钥
    pfx: fs.readFileSync('../weiPay/apiclient_cert.p12') //微信商户平台证书
});
// 创建订单
var createPay = function (req, res, callback) {
    var number = parseInt(req.body.number);
    var out_trade_no = _get_out_trade_no();
    wxpay.createUnifiedOrder({
        body: '扫码支付',
        out_trade_no: out_trade_no,
        total_fee: 1,
        spbill_create_ip: '192.168.1.165',
        notify_url: url + '/website/show/myWalletVoucher/weiPayWeb',
        trade_type: 'NATIVE',
        product_id: '1234567890'
    }, function (err, result) {
        callback(err, result, out_trade_no);
    });
};
// 查询订单
var queryOrder = function (req, res, callback) {
    var out_trade_no = req.query.out_trade_no;
    wxpay.queryOrder({
        out_trade_no: out_trade_no
    }, function (err, result) {
        callback(err, result);
    });
    /*  查询结果：
     return_code: 'SUCCESS',
     return_msg: 'OK',
     appid: 'wx2849cbd612f93e67',
     mch_id: '1484174532',
     nonce_str: 'CaKrtYDTyYIq1i7g',
     sign: '58ED9FD4ED3744912514B4803F229246',
     result_code: 'SUCCESS',
     openid: 'o4ZUUv6nvct17b3g3csPxgmqazqs',
     is_subscribe: 'Y',
     trade_type: 'NATIVE',
     bank_type: 'CFT',
     total_fee: '1',
     fee_type: 'CNY',
     transaction_id: '4005852001201707109903959208',
     out_trade_no: '201407034816349286',
     attach: '',
     time_end: '20170710114738',
     trade_state: 'SUCCESS',
     cash_fee: '1' }
     */
};
// 关闭订单
var closeOrder = function (req, res) {
    var out_trade_no = req.query.out_trade_no;
    wxpay.closeOrder({
        out_trade_no: out_trade_no
    }, function (err, result) {
        console.log(result);
        res.send({
            code: '1',
            result: result
        });
    });
};
module.exports = {
    createPay: createPay,
    queryOrder: queryOrder,
    closeOrder: closeOrder
};