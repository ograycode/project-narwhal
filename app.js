/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
  , http = require('http')
  , path = require('path')
  , data = require('./data.js')
  , cronJob = require('cron').CronJob
  , cDeploy = require('./cron/cron-jobs.js')
  , SendGrid = require('sendgrid-nodejs').SendGrid;

var app = express();

var db = data();

app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'ejs');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser('your secret here'));
  app.use(express.session());
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

app.get('/', routes.index);
app.get('/test', function (req, res) {
  cDeploy['start'](function(err, response){
    if (err) {
      console.log(err);
      res.json(500, {'success': false});
    } else {
      console.log(response);
      res.json(200, {'success': true});
    }
  });
});

app.post('/git', function (req, res) {
  db.save('git-server', {
    'name' : req.body.name,
    'server' : req.body.url
  }, function (err, result) {
    if (err) {
      console.log(err);
      res.json(500, {'success': false});
    } else {
      console.log(result);
      res.json(200, {'success': true});
    }
  });
});

app.post('/settings', function(req, res){
  db.save('settings', {
    'isAutoDeployOn' : req.body.isAutoDeployOn,
    'folderOne' : req.body.folderOne,
    'folderTwo' : req.body.folderTwo
  }, function (err, result) {
    if (err) {
      console.log(err);
      res.json(500, {'success': false});
    } else {
      console.log(result);
      res.json(200, {'success': true});
    }
  });
});


var sendgrid = new SendGrid('username', 'password');


app.get('/sendgrid', function(req, res){
  sendgrid.send({
    to: 'jason.alan.gray@gmail.com',
    from: 'audit@somethingelse.com',
    subject: 'Narwhal App',
    text: 'Jason O\'Gray'
  }, function(success, message) {
    if (!success) {
      console.log(message);
    }
  });
});

http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});

new cronJob('* * * * *', function(){
    //cDeploy['start']();
}, null, true, null);
