
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
  , http = require('http')
  , path = require('path');

var app = express();

app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

app.get('/admin', routes.admin);
app.get('/admin/:organisation', routes.organisation);
app.get('/admin/:organisation/:key', routes.edit);
app.post('/api/test', routes.test);
app.get('/api/:organisation/:key', routes.serve);
app.post('/api/:organisation/:key', routes.save);
app.post('/add/organisation', routes.addOrganisation);
app.post('/add/scrape/to/:organisation', routes.addScrape);

http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});
