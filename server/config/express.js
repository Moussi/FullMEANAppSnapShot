 var express = require('express'),
 passport = require('passport')
 path = require('path');

 

 module.exports = function(app,config) {
     
    app.set('views', config.rootPath + '/client/views');
app.set('view engine', 'jade');
app.use(express.logger('dev'))
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.static(path.join(config.rootPath, 'client')));
app.use(express.cookieParser());
app.use(express.cookieSession(
    {
        secret: process.env.COOKIE_SECRET || "Superdupersecret"
    }));

app.configure('development', 'production', function() {
    app.use(express.csrf());
    app.use(function(req, res, next) {
        res.cookie('XSRF-TOKEN', req.csrfToken());
        next();
    });
});

app.use(passport.initialize());
app.use(passport.session());
 }