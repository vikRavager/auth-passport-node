var express = require('express');
var router = express.Router();
var passport = require('passport');
var localStrategy = require('passport-local').Strategy;

var nodemailer = require('nodemailer');

var User = require('../models/users.model');

router.get('/',function(req,res){
        res.render('index');
});

function loggedIn(req,res,next){
        if(req.isAuthenticated()){
                return next();
        }
        else{
                res.redirect('/login');
        }
}
function loggedOut(req,res,next){
        if(!req.isAuthenticated()){
                return next();
        }
        else{
                res.redirect('/dashboard');
        }
}

router.get('/login',loggedOut,function(req,res){

        res.render('users/login');
});

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

                console.log('userId: '+user._id);
                done(null, user._id);
        });
        
        passport.deserializeUser(function(id, done) {
                User.getUserById(id, function(err, user) {
                done(err, user);
                });
        });

router.post('/login',passport.authenticate('local',
        { successRedirect: '/dashboard',
        failureRedirect: '/login',
        failureFlash : true }),
        function(req,res){
        res.redirect('/dashboard');
});

router.get('/registration',loggedOut,function(req,res){
        res.render('users/registration');
});

router.post('/registration',function(req,res){
      
        if(!User.findOne({email : req.body.email})){
                req.flash('error','Sorry please take another email . ');
                res.redirect('/registration');
        }

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

        //cv upload to public/cv 
        // as nameDateToString.pdf
        var sampleCV = req.files.cv;
        var currentDate = new Date();
        var idPath = name;
        idPath += currentDate.toUTCString();
        idPath+='.pdf'
        var dest = './public/cv/'+idPath;
        console.log('dest : '+dest);
        // Use the mv() method to place the file somewhere on your server
        sampleCV.mv(dest, function(err) {
        if (err) throw err;
        });

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
                        cv : idPath
                });

                User.createUser(newUser,function(err,user){
                        if(err) throw err;
                        
                });

                //email verification
                var transporter = nodemailer.createTransport({
                        service: 'gmail',
                        auth: {
                               user: 'finitefringe@gmail.com',
                               pass: '123finite456'
                           }
                       });
                const mailOptions = {
                from: 'finitefringe@gmail.com', // sender address
                to: email, // list of receivers
                subject: 'Verify Your Account', // Subject line
                html: `<p> 
                <form action="/mailVerified" method="post">
                <input type="hidden" name="user" value="{{req.body.email}}">
                <input type="submit" value="Click here to verify">
                </form></p>`// plain text body
                };
                console.log('My user : '+req.body.email);
                transporter.sendMail(mailOptions, function (err, info) {
                        if(err)
                          console.log(err)
                        else
                          console.log(info);
                     });
               

                req.flash('success_msg', 'You are registered ..');
                res.redirect('/login');
        }

});


//route to /mailVerified
router.post('/mailVerified',loggedIn,function(req,res){

        var mailEmail = req.body.user;
        if(req.user.email == mailEmail){
                User.findOneAndUpdate({
                        email : mailEmail
                }, {
                        isEmailVerified : true
                },function(err,doc){
                        if(!err){
                                res.redirect('/dashboard');
                        }
                        else throw err;
                });
        }
});



router.get('/dashboard',loggedIn,function(req,res){
      
        User.findOne({email : req.user.email},function(err,doc){
                if(!err){
                        if(doc.isEmailVerified == false) {
                                res.render('users/emailNotVerified');
                        }
                        else{
                                res.render('users/home',{
                                        output : req.user
                                });
                        }
                }
                else{
                        throw err;
                }
        });
        
});

router.get('/logout',loggedIn,function(req,res){
        req.logout();
        req.flash('success_msg','You are logged out');
        user = null;
        res.redirect('/login');
});



module.exports = router;