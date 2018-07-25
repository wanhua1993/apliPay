var express = require('express');
var router = express.Router();
var fs = require('fs');
var path = require('path');
var moment = require('moment');
var jsonToXml = require('jsontoxml');

// var connection = require("../utils/dbconfig");
var tradeNo = require("../utils/getCoupon");
// 支付宝H5支付
var alipay = require('../alipay/');
// 微信H5支付
var WXPay = require('wxpay.js').WXPay;
var WXPayConstants = require('wxpay.js').WXPayConstants;
var WXPayUtil = require('wxpay.js').WXPayUtil;
// 支付宝扫码支付
var AliPay = require('../alipay_1/aliPay/ES6_alipay');
var Url = require('../config/config').Url;
var ali_Pay = require('../config/config').aliPay;
// 微信扫码支付
var Pay = require('../alipay_1/ES6_weiChatPay');

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

var ali = new AliPay({
  appId: ali_Pay.appId,
  rsaPrivate: path.resolve('./alipay_1/aliPay/rsa_private_key.pem'),// 商户私钥
  rsaPublic: path.resolve('./alipay_1/aliPay/rsa_public_key.pem'),
  sandbox: ali_Pay.sandbox,
  signType: 'RSA2',
  notifyUrl: Url + '/paymentCallback',
  returnUrl: Url + '/payCallback'
});
function _get_date_string() {
  var date = moment().format('YYYY MM DD HH mm ss');
  return date.split(' ').join('');
}
function _get_out_trade_no() {
  return _get_date_string() + "" + Math.random().toString().substr(2, 10);
}

router.post('/alipay_app', function (req, res) {
  var value = req.body;

  var outTradeId = _get_out_trade_no();

  var urlPar = ali.pay({
    body: 111,
    subject: 'buy',
    outTradeId: outTradeId,
    timeout: '90m',
    amount: value.money,
    product_code: 'FAST_INSTANT_TRADE_PAY',
    goods_type: '1',
    sellerId: ali_Pay.sellerId,
    passbackParams: '', // 公用回传参数
    promoParams: '', // 优惠参数
    extendParams: '', //业务扩展参数 
    enablePayChannels: '', // 可用渠道
    disablePayChannels: '', // 禁用参数
    storeId: '' //商户门店编号
  });

  // var html = '<form id="alipaysubmit" name="alipaysubmit" action="' + ali_Pay.aliUrl + '" method="POST">';
  // for (var key in urlPar) {
  //   html += "<input type='hidden' name='" + key + "' value='" + urlPar[key] + "'/>";
  // }
  // html += '<input type="submit" value="ok" style="display:none;"></form>';
  // html += '<script>document.forms["alipaysubmit"].submit();</script>';

  res.send({
    code: '200',
    html: urlPar
  });
});
// 支付宝扫码支付
router.post('/alipay_qrcode', function (req, res) {
  var value = req.body;
  var outTradeId = _get_out_trade_no();
  var money = Number(value.money);

  if (money) {
    var urlPar = ali.webPay({
      body: 111,
      subject: 'buy',
      outTradeId: outTradeId,
      timeout: '90m',
      amount: value.money,
      product_code: 'FAST_INSTANT_TRADE_PAY',
      goods_type: '1',
      sellerId: ali_Pay.sellerId
    });

    var html = '<form id="alipaysubmit" name="alipaysubmit" action="' + ali_Pay.aliUrl + '" method="POST">';
    for (var key in urlPar) {
      html += "<input type='hidden' name='" + key + "' value='" + urlPar[key] + "'/>";
    }
    html += '<input type="submit" value="ok" style="display:none;"></form>';
    html += '<script>document.forms["alipaysubmit"].submit();</script>';

    res.send({
      status: '200',
      html: html
    });
  } else {
    res.send({
      stauts: 0,
      error: '请输入合法的数字！'
    });
  }
});

// 异步回掉页面
router.post('/paymentCallback', function (req, res) {
  /*
   * { gmt_create: '2017-10-24 16:35:31', 交易创建时间
   charset: 'GBK',
   gmt_payment: '2017-10-24 16:35:37',  交易付款时间
   notify_time: '2017-10-24 16:35:38',
   subject: 'abcd',
   sign: 'eM59Jg2OO0aSQ1dP8s2GReOW6p1TN2IEHQivl9tXgBCXFoC3HFrM3hcq32mw3SOAUFEIiz8NPNEVTuu1CmlO+Lb+IUUeXNq/nYda1IEtSuhO3dOPRxk6T8lGZFL9z        /TmEBAleArGdx9A6uNNo/bySN5pdresrpr06ySkefYD/18ZcG94Ahsl0fNojZXxLZyU3uhY2M4hGgrWwcJtPGhWmlih+SgKUxZny576dC9                       /rdPeX5DAycRcMxwtcj6yL9vZKZXLTyjAmyWh8oATGd/Js9W+r3XIKpUbDBJh299QkbCJwXsHVDoZp8mIlCKat+6qqRSZ0yNgcyUriEepgcmB7A==',
   buyer_id: '2088102174830118',  买家支付宝用户号
   body: 'abcd',
   invoice_amount: '1.00',  开票金额
   version: '1.0',
   notify_id: 'fb96638020079f0eed44d2b351ce13egum',
   fund_bill_list: '[{"amount":"1.00","fundChannel":"ALIPAYACCOUNT"}]',
   notify_type: 'trade_status_sync',
   out_trade_no: '201703200101010233',
   total_amount: '1.00', 订单金额
   trade_status: 'TRADE_SUCCESS',  交易状态
   trade_no: '2017102421001004110200255877',
   auth_app_id: '2016081600256718',
   receipt_amount: '1.00', 实收金额
   point_amount: '0.00',
   app_id: '2016081600256718',
   buyer_pay_amount: '1.00',
   sign_type: 'RSA2',
   seller_id: '2088102171389015' }    卖家支付宝用户号
   * */
  var params = req.body;
  console.log('异步回调参数');
  console.log(params);
  var signV = ali.signVerify(params);
  console.log(signV);
  if (signV) {
    // 验签成功以后

    res.send('success');

  } else {
    // 验签失败
  }
});

// 同步回调
router.get('/payCallback', function (req, res) {
  var params = req.query;
  // console.log('同步回调参数');
  // console.log(params);
  res.redirect('http://zhenxing.frpgz1.idcfengye.com/paySuccess.html');
});
// 微信 扫码支付
router.post('/wxPay_qrcode', function (req, res, next) {
  // console.log(req.body);
  let pay = new Pay();
  pay.pay(req, res, function (err, opts) {
    if (err) {
      console.log(err);
      res.send({
        code: '300201',
        msg: err,
        result: '与微信接口连接发生错误！'
      });
    } else {
      // console.log(opts);
      var elem = require('../bin/www').elem;
      elem.emit("event");
      res.send({
        status: 200,
        opts: opts
      });
    }
  });
});

// 微信异步回调 接收通知参数 并进行验签
router.post('/weiPayWeb', function (req, res) {
  /*
   appid: 'wx2849cbd612f93e67', // 公众账号ID
   attach: 'dianYinPay', //
   bank_type: 'CFT', 付款银行
   cash_fee: '1', 现金支付金额
   fee_type: 'CNY', 货币种类
   is_subscribe: 'Y', // 是否关注公众账号
   mch_id: '1484174532',
   nonce_str: 'JRTSi56zZrj5inWAKrDfCepAaW5KsiZb',
   openid: 'o4ZUUv6nvct17b3g3csPxgmqazqs',
   out_trade_no: '201711020957293382453598',
   result_code: 'SUCCESS',
   return_code: 'SUCCESS',
   sign: 'B4331E582804B66B4AA783D93C767CD6',
   time_end: '20171102095741',
   total_fee: '1',
   trade_type: 'NATIVE',
   transaction_id: '4200000004201711021871332720' 微信支付订单号
   * */
  var params = req.body.xml;
  var sureSign = pay.sureSign(params, params.sign);
  var out_trade_no = params.out_trade_no;
  var transaction_id = params.transaction_id;
  if (sureSign) {
    console.log(sureSign);
    // 成功支付并签名验证 成功 并确认订单
    var resxml = {
      return_code: 'SUCCESS',
      return_msg: 'OK'
    };
    var body = jsonToXml(resxml);
    body = '<xml>' + body + '</xml>';

    // 建立连接
    var users = [];
    io.on('connection', function (socket) {
      socket.on('success', function (data) {
        users.push({
          id: data.id,
          socket: socket
        });

      });
      socket.emit('news', 'success pay!');
      // 用户离线
      socket.on('disconnect', function () {

      });
      res.end(body);
    });


  } else {
    res.send({
      code: '100202',
      msg: '微信发送异步请求出现错误，可能是验签出现错误！'
    });
  }
});


module.exports = router;
