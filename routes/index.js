var express = require('express');
var router = express.Router();
var path = require('path');
var Alipay = require('../lib/alipay');
var utl = require('../lib/utl');
var request = require('request');
var outTradeId = Date.now().toString();


var ali = new Alipay({
  appId: '2018042802605241',
  notify_url: 'http://127.0.0.1:3000/notify_url',
  rsaPrivate: path.resolve('./routes/pem/app_private_key.pem'),
  rsaPublic: path.resolve('./routes/pem/app_public_key.pem'),
  sandbox: true,
  signType: 'RSA2'
});
/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});
router.get('/return_url', function(req, res) {
  console.log('-----------');
  res.send('success')
})
router.get('/notify_url', function(req, res) {
  console.log('+++++++++++++++');
  res.send('success')
})
router.post('/pay', function(req, res, next) {
  var formData = {};
  var token = req.body.token;
  var order_id = req.body.order_id;
  var mobile = req.body.mobile;
  if (!token || !order_id || !mobile) {
    return res.send({
      result: -1,
      message: "Missing parameters"
    })
  }
  formData.token = token;
  formData.order_id = order_id;
  formData.mobile = mobile;
  console.log(formData);
  request.post({url: 'http://47.100.24.146:8003/api/order/get_by_orderid', formData: formData}, function(err, httpResponse, body) {
    var orderInfo = JSON.parse(body);
    if(orderInfo.result != 0) {
      return res.send({
        result: -1,
        message: orderInfo.message
      })
    }
    try {
      var order = orderInfo.data;
      var url = ali.webPay({
        body: order.mobile+ 'order',
        subject: "租车",
        outTradeId: order.id,
        timeout: '90m',
        amount: "0.01",
        sellerId: '',
        product_code: 'QUICK_MSECURITY_PAY',
        goods_type: "1",
        return_url: "www.jufengchaopao.com"
      })
    } catch (e) {
      return res.send({
        result: -1,
        message: e
      })
    }

    var url_API = 'https://openapi.alipay.com/gateway.do?' + url;
    //res.send(url);
    console.log(url_API);
    return res.send({
      result: 0,
      url: url_API
    });
  })
});

module.exports = router;
