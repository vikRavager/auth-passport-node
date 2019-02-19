var express = require('express');
var router = express.Router();
const { check, validationResult } = require('express-validator/check');

router.get('/',function(req,res){
        res.render('index');
});

router.get('/login',function(req,res){
        res.render('users/login');
});

router.post('/login',function(req,res){
        //todo
});

router.get('/registration',function(req,res){
        res.render('users/registration');
});

router.post('/registration',[
        check('name').exists(),

        check('email').isEmail(),
        check('pass1').exists(),
        check('pass2').exists(),
        check('dept').exists()
],function(req,res){
        var name = req.body.name;
        var email = req.body.email;
        var pass = req.body.pass2;
        var dept = req.body.dept;
        console.log(name);
        console.log(email);
        console.log(pass);
        console.log(dept);

        

        const errors = validationResult(req);
        if(errors){
                res.render('/registration',{
                        errors: errors
                })
        }
        else {
                console.log('passed');
        }
        // ...rest of the initial code omitted for simplicity.       
        // app.post('/user', [
        // // username must be an email
        // check('username').isEmail(),
        // // password must be at least 5 chars long
        // check('password').isLength({ min: 5 })
        // ], (req, res) => {
        // // Finds the validation errors in this request and wraps them in an object with handy functions
        // const errors = validationResult(req);
        // if (!errors.isEmpty()) {
        // return res.status(422).json({ errors: errors.array() });
        // }

        // User.create({
        // username: req.body.username,
        // password: req.body.password
        // }).then(user => res.json(user));
        // });

});

router.get('/dashboard',function(req,res){
        res.render('users/home');
});

module.exports = router;