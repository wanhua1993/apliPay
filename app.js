var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
require('body-parser-xml')(bodyParser);
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(function (req, res, next) {
  if (req.headers['content-type'] && req.headers['content-type'].indexOf('GBK') > -1) {
      req.headers['content-type'] = req.headers['content-type'].replace('GBK', 'UTF-8');
  }
  next();
});

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// app.all('*', function (req, res, next) {
//   res.header('Access-Control-Allow-Headers', 'Content-Type, Content-Length, Authorization, Accept, X-Requested-With , yourHeaderFeild');
//   res.header('Access-Control-Allow-Methods', 'PUT, POST, GET, DELETE, OPTIONS');
//   res.header("Access-Control-Allow-Credentials", "true");
//   res.header("Access-Control-Allow-Origin", "http://zhenxing.frpgz1.idcfengye.com/");//配置客户端
//   if (req.method == 'OPTIONS') {
//     /*让options请求快速返回*/
//     res.send(200);
//   }
//   else {
//     /*防止异步造成多次响应，出现错误*/
//     var _send = res.send;
//     var sent = false;
//     res.send = function (data) {
//       if (sent) return;
//       _send.bind(res)(data);
//       sent = true;
//     };
//     next();
//   }
// });
app.use(function (req, res, next) {
  if (req.url === '/paymentCallback') {
    req.headers['content-type'] = 'application/x-www-form-urlencoded';
  }
  next();
});

app.use(bodyParser.xml({
  limit: "2MB",
  xmlParseOptions: {
    normalize: true,
    normalizeTags: true,
    explicitArray: false
  },
  verify: function (req, res, buf, encoding) {
    if (buf && buf.length) {
      req.rawBody = buf.toString(encoding || "utf8");
    }
  }
}));
app.use('/', indexRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
