const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/auth',{useNewUrlParser : true},function(err){

        if(!err)
                console.log('MongoDB connected');
        else
                console.log('Error found : '+err);
});