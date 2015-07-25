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
app.get("/", routes.index.get);
app.get("/user", routes.user.listing.get);
app.get("/user/:uid", routes.user.get);
app.get("/question", routes.question.listing.get);
app.get("/question/:qid", routes.question.get);
app.get("/question/:qid/answer", routes.question.answer.listing.get);
app.get("/question/:qid/answer/:aid", routes.question.answer.get);
app.get("/question/:qid/answer/:aid/comment/:cid", routes.question.answer.comment.get);
app.get("/question/:qid/answer/:aid/comment", routes.question.answer.comment.listing.get);
app.get("/question/:qid/comment", routes.question.comment.listing.get);
app.get("/question/:qid/comment/:cid", routes.question.comment.get);

/* POST routes */
app.post("/user", routes.user.post);
app.post("/question", routes.question.post);
app.post("/question/:qid/answer", routes.question.answer.post);
app.post("/question/:qid/answer/:aid/comment", routes.question.answer.comment.post);
app.post("/question/:qid/comment", routes.question.comment.post);

/* PUT routes */
app.put("/user/:uid", routes.user.put);
app.put("/question/:qid", routes.question.put);
app.put("/question/:qid/answer/:aid", routes.question.answer.put);
app.put("/question/:qid/answer/:aid/comment/:cid", routes.question.answer.comment.put);
app.put("/question/:qid/comment/:cid", routes.question.comment.put);

/* DELETE routes */
app.delete("/user/:uid", routes.user.delete);
app.delete("/question/:qid", routes.question.delete);
app.delete("/question/:qid/answer/:aid", routes.question.answer.delete);
app.delete("/question/:qid/answer/:aid/comment/:cid", routes.question.answer.comment.delete);
app.delete("/question/:qid/comment/:cid", routes.question.comment.delete);

/* Initialise server */
http.createServer(app).listen(app.get('port'), function () {
    console.log('Express server listening on port ' + app.get('port'));
});