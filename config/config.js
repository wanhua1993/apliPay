/**
 * Created by huiyu on 2017/7/27.
 */
module.exports = {
    Url: "http://zhenxing.frpgz1.idcfengye.com",

    // 微信
    weiPay: {
        "appId": 'wx2849cbd612f93e67',
        "mch_id": '1484174532',
        "partner_key": 'B08A33EC802A0C2E4E1D06ECADF5CDCF'// 商户平台密钥
    },

    // 支付宝
    aliPay: {
        // 沙箱测试
        appId: '2016091800538768',
        sandbox: true,
        sellerId: '2088102176160699',
        aliUrl: 'https://openapi.alipaydev.com/gateway.do'
        // appId: '2018072060719628',
        // sandbox: false,
        // sellerId: '2088231007252716',
        // aliUrl: 'https://openapi.alipay.com/gateway.do'
    }
};