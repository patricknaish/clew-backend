/* Module dependencies */
var express = require('express');
var routes = require('./routes');
var http = require('http');
var path = require('path');
var models = require('./models');

var orm = require('orm');
var app = express();

/* All environments */
app.set('port', process.env.PORT || 8000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
/* Secret for session management */
app.use(express.cookieParser('clew'));
/* Body parser for handling HTTP POST */
app.use(express.bodyParser());
app.use(express.session());

models.define(app);

app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

/* Development only */
if ('development' === app.get('env')) {
    app.use(express.errorHandler());
}

/* GET routes */
app.get("/location", routes.location.listing.get);
app.get("/location/:lid", routes.location.get);
app.get("/location/:lid/path", routes.location.path.listing.get);
app.get("/location/:lid/path/:pid", routes.location.path.get);
app.get("/location/:lid/path/:pid/segment", routes.location.path.segment.listing.get);
app.get("/location/:lid/path/:pid/segment/:sid", routes.location.path.segment.get);
app.get("/location/:lid/path/:pid/annotation", routes.location.path.annotation.listing.get);
app.get("/location/:lid/path/:pid/annotation/:aid", routes.location.path.annotation.get);

/* POST routes */
app.post("/location", routes.location.post);
app.post("/location/:lid/path", routes.location.path.post);
app.post("/location/:lid/path/:pid/segment", routes.location.path.segment.post);
app.post("/location/:lid/path/:pid/annotation", routes.location.path.annotation.post);

/* PUT routes */
app.put("/location/:lid", routes.location.put);
app.put("/location/:lid/path/:pid", routes.location.path.put);

/* DELETE routes */
app.delete("/location/:lid", routes.location.delete);
app.delete("/location/:lid/path/:pid", routes.location.path.delete);

/* Initialise server */
http.createServer(app).listen(app.get('port'), function () {
    console.log('Express server listening on port ' + app.get('port'));
});