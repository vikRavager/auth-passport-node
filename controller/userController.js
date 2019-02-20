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


// passport.use(new LocalStrategy(
//         function(username, password, done) {
//           User.findOne({ username: username }, function(err, user) {
//             if (err) { return done(err); }
//             if (!user) {
//               return done(null, false, { message: 'Incorrect username.' });
//             }
//             if (!user.validPassword(password)) {
//               return done(null, false, { message: 'Incorrect password.' });
//             }
//             return done(null, user);
//           });
//         }
//       ));


// passport.serializeUser(function(user, done) {
//         done(null, user.id);
// });

// passport.deserializeUser(function(id, done) {
//         User.findById(id, function(err, user) {
//                 done(err, user);
// });
// });

// router.post('/login',passport.authenticate('local',{
//         successRedirect : '/dashboard',
//         failureRedirect : '/login',
//         failureFlash : true
// }),function(req,res){
//         res.redirect('/dashboard');
// });


passport.use(new localStrategy(function(username,password,done){
        console.log('username : '+username);
        User.getUserByUsername(username,function(err,user){
                if(err) throw err;
                if(!user){
                        return done(null,false,{message : 'Unknown User'});

                }

                User.comparedPassword(password,user.password,function(err,isMatch){
                        if(err) throw err;
                        if(isMatch){
                                console.log('sadUser : '+user); //user is traced..
                                
                                return done(null,user);
                                
                        }
                        else{
                                return done(null,false,{message : 'Invalid passpword'})
                        }
                });
        });
}));
        passport.serializeUser(function(user, done) {

                console.log('userId: '+user._id);
                done(null, user._id);
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
        console.log('req.user : '+user);
        res.redirect('/dashboard',{
                output : req.user
        });
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


function loggedIn(req,res,next){
        if(req.user){
                next(); 
        }
        else{
                req.flash('error','You are not logged in');
                res.redirect('/login');
        }
}

router.get('/dashboard',loggedIn,function(req,res){
        console.log('user : '+req.user);
        res.render('users/home',{
                output : req.user
        });
});

router.get('/logout',function(req,res){
        req.logout();
        req.flash('success_msg','You are logged out');
        res.redirect('/login');
});



module.exports = router;