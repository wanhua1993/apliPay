var express = require('express');
var router = express.Router();
var fs = require('fs');

// var connection = require("../utils/dbconfig");
var tradeNo = require("../utils/getCoupon");
var alipay = require('../aplipay/');

var WXPay = require('wxpay.js').WXPay;
var WXPayConstants = require('wxpay.js').WXPayConstants;
var WXPayUtil = require('wxpay.js').WXPayUtil;

try {
  var APPID = 'wx4c78d6d42759e4b1',
    MCHID = '1260599701',
    KEY = '75e2099c53f629bdf670c4e5bd218819',
    CERT_FILE_CONTENT = fs.readFileSync('./utils/apiclient_cert.p12'),
    CA_FILE_CONTENT = fs.readFileSync('./utils/rootca.pem'),
    TIMEOUT = 100000; // 毫秒
} catch (err) {
  console.log("--------异常----------");
  console.log(err.message);
  console.log("--------异常----------");
}

var wxpay = new WXPay({
  appId: APPID,
  mchId: MCHID,
  key: KEY,
  certFileContent: CERT_FILE_CONTENT,
  caFileContent: CA_FILE_CONTENT,
  timeout: TIMEOUT,
  signType: WXPayConstants.SIGN_TYPE_MD5, // 使用 HMAC-SHA256 签名，也可以选择  WXPayConstants.SIGN_TYPE_MD5
  useSandbox: false // 不使用沙箱环境
});

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: 'Express' });
});
// 支付宝支付
router.post('/aplipay', function (req, res, next) {
  var money = req.body.money;
  var out_trade_no = tradeNo.getout_trade_no();
  console.log(out_trade_no);
  let e = {
    out_trade_no: out_trade_no, //必须唯一
    subject: '拍得利平台-商品ID（zfb）：' + out_trade_no,
    //total_fee: price/100,
    total_fee: money, //测试用啊
    body: "测试",
    show_url: "http://localhost:3000/" //商品展示url，先写一个固定的
  };
  console.info('alipay create_direct_pay_by_user params:', e);
  alipay.create_direct_pay_by_user_phone(e, res);
});

// 微信支付
router.post('/wxPay', function (req, res, next) {
  var money = req.body.money;
  var out_trade_no = tradeNo.getout_trade_no();
  console.log(out_trade_no);

  var reqObj = {
    body: 'test-' + out_trade_no,
    out_trade_no: out_trade_no, //必须唯一
    total_fee: money, //记得改过来
    spbill_create_ip: '192.168.184.1', //上线记得改过来
    notify_url: 'http://wap.pdl.jsy86.com/wxpayNotify', //上线时记得改过来
    trade_type: 'APP',
    scene_info: '{"h5_info": {"type":"Wap","wap_url": "http://pdl.jsy86.com","wap_name": "Pdl平台充值"}}', //场景不用改
  };
  wxpay.unifiedOrder(reqObj).then(function (respObj) {
    console.log(respObj);
    res.send({
      value: respObj
    });
  }).catch(function (err) {
    console.log(err);
  });
});
module.exports = router;
