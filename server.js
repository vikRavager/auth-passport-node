
var express = require('express');
var morgan = require('morgan');
var bodyParser = require('body-parser');
var path = require('path');
var exhbs = require('express-handlebars');
var flash = require('connect-flash');
var session = require('express-session');
var passport = require('passport');
var localStrategy = require('passport-local');
var cookieParser = require('cookie-parser');
var expressValidator = require('express-validator');

require('./models/db');


var app = express();

app.use(morgan('combined'));

app.use(bodyParser.urlencoded({
        extended : true
}));
app.use(bodyParser.json());
app.use(cookieParser());

//extention handlebars to hbs
app.set('views',path.join(__dirname+'/views/'));
app.engine('hbs',exhbs({
        extname : 'hbs',
        defaultLayout : 'mainLayout',
        layoutsDir :__dirname+'/views/default'
}));
app.set('view engine', 'hbs');


app.use(cookieParser('foo'));
//express Session
app.use(session({
        secret : 'secret',
        saveUninitialized : true,
        resave : true
}));
//passport init
app.use(passport.initialize());
app.use(passport.session());


//static folder
app.use(express.static(path.join(__dirname,'public')));



//use express-validator
app.use(expressValidator({
        errorFormatter: function(param, msg, value) {
            var namespace = param.split('.')
            , root    = namespace.shift()
            , formParam = root;
       
          while(namespace.length) {
            formParam += '[' + namespace.shift() + ']';
          }
          return {
            param : formParam,
            msg   : msg,
            value : value
          };
        }
      }));

//use flash
app.use(flash());

//global variables
app.use(function(req,res,next){
        res.locals.success_msg = req.flash('success_msg');
        res.locals.error_msg = req.flash('error_msg');
        res.locals.error = req.flash('error');
        res.locals.user = req.user || null;
        next();
});

var userController = require('./controller/userController');

app.use('/',userController);


app.listen(8050,function(){
        console.log('listening to port : 8050');
});