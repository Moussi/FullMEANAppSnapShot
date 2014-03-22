var express =       require('express')
    , http =        require('http'),
    mongoose = require('mongoose'); 
var app = module.exports = express();
var env = process.env.NODE_ENV = process.env.NODE_ENV || 'development';
var config = require('./server/config/config')[env];

require('./server/config/express')(app, config);


require('./server/config/mongoose')(config);
var User =        require('./server/models/User.js');

require('./server/config/passport')(User);
require('./server/routes.js')(app);
console.log("froooooooooooom   "+config.rootPath);



http.createServer(app).listen(config.port, function(){
    console.log("Express server listening on port " + config.port);
});