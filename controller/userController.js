var express = require('express');
var router = express.Router();
var passport = require('passport');
var localStrategy = require('passport-local').Strategy;

var User = require('../models/users.model');

router.get('/',function(req,res){
        res.render('index');
});

router.get('/login',function(req,res){
        res.render('users/login');
});

//localStrategy
passport.use(new localStrategy(function(username,password,done){

        User.getUserByUsername(username,function(err,user){
                if(err) throw err;
                if(!user){
                        return done(null,false,{message : 'Unknown User'});

                }

                User.comparedPassword(password,user.password,function(err,isMatch){
                        if(err) throw err;
                        if(isMatch){
                                return done(null,user);
                                
                        }
                        else{
                                return done(null,false,{message : 'Invalid passpword'})
                        }
                });
        });
}));
        passport.serializeUser(function(user, done) {
                done(null, user.id);
        });
        
        passport.deserializeUser(function(id, done) {
                User.getUserById(id, function(err, user) {
                done(err, user);
                });
        });

router.post('/login',passport.authenticate('local',{
        successRedirect : '/dashboard',
        failureRedirect : '/login',
        failureFlash : true
}),function(req,res){
        res.redirect('/dashboard');
});

router.get('/registration',function(req,res){
        res.render('users/registration');
});

router.post('/registration',function(req,res){
        
       
        req.checkBody('name','Name is required').notEmpty();
        req.checkBody('email','Email is required').isEmail();
        req.checkBody('pass1','Password 1 required').notEmpty();
        req.checkBody('pass2','Password 2 is required').notEmpty();
        req.checkBody('dept','Department is required').notEmpty();
        req.checkBody('pass2','password do not match').equals(req.body.pass1);

        var name = req.body.name;
        var email = req.body.email;
        var pass = req.body.pass2;
        var dept = req.body.dept;

        var errors = req.validationErrors();

        if(errors){
                res.render('users/registration',{
                        errors : errors
                });
        }
        else{
                var newUser = new User({
                        name : name,
                        email : email,
                        password : pass,
                        dept : dept,
                        cv : 'random-txt'
                });

                User.createUser(newUser,function(err,user){
                        if(err) throw err;
                        console.log(err);
                });

                req.flash('success_msg', 'You are registered ..');
                res.redirect('/login');
        }

});

router.get('/dashboard',function(req,res){
        res.render('users/home');
});

module.exports = router;