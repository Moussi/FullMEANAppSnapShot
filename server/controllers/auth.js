var passport =  require('passport')
    , User = require('../models/User.js');

module.exports = {
    register: function(req, res, next) {
        try {
            User.validate(req.body);
            console.log(req.body.username+' : User Validated');
        }
        catch(err) {
            return res.send(400, err.message);
        }
        console.log("Roleeeeeeeeeee "+JSON.stringify(req.body.role));
        User.addUser(req.body.username, req.body.password, req.body.role, function(err, user) {
            if(err === 'UserAlreadyExists') return res.send(403, "User already exists");
            else if(err)                    return res.send(500);
            console.log("Callback Received "+JSON.stringify(user));
            req.logIn(user, function(err) {
                if(err)     { 
console.log("error");
                    next(err); }
                else        { 
console.log("res.json");
                    res.json(200, { "role": user.role, "username": user.username }); }
            });
        });
    },

    login: function(req, res, next) {
        passport.authenticate('local', function(err, user) {

            if(err)     { return next(err); }
            if(!user)   { return res.send(400); }


            req.logIn(user, function(err) {
                if(err) {
                    return next(err);
                }

                if(req.body.rememberme) req.session.cookie.maxAge = 1000 * 60 * 60 * 24 * 7;
                res.json(200, { "role": user.role, "username": user.username });
            });
        })(req, res, next);
    },

    logout: function(req, res) {
        req.logout();
        res.send(200);
    }
};