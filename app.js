var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
require('dotenv').config();
const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/reigningcities' , 
                { useNewUrlParser: true , useUnifiedTopology: true, 'useFindAndModify': false})
       .then(() => {
         console.log('Database connection successful')
       })
       .catch(err => {
         console.error('Database connection error')
       });

//ALL ROUTES REFRENCES
var indexRouter = require('./routes/index');
var loginRouter = require('./routes/login');
var postsRouter = require('./routes/posts');
var pingRouter = require('./routes/ping');
var testRouter  = require('./routes/test')
var newAccesRoute = require('./routes/getNewAccess');
var gameConfigRoute = require('./routes/gameConfig');
var assetbundleRoute = require('./routes/assetBundle');
var webViewRoute = require('./routes/rcmaps');
var updateEntityRoute = require('./routes/updateEntities');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
//app.use('/login' , loginRouter);
//app.use('/posts' , postsRouter);
app.use('/ping' , pingRouter);
//app.use('/getNewAccess' , newAccesRoute);
app.use('/gameConfig' , gameConfigRoute );
app.use('/downloads/bundles' , assetbundleRoute);
app.use('/rcmap' , webViewRoute);
app.use('/updateEntities' , updateEntityRoute);

//TEST ROUTE
app.use('/test' , testRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
