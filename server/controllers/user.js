var _ =           require('underscore')
   //, User =      require('../models/User.js')
    , userRoles = require('../../client/js/routingConfig').userRoles,
    mongoose = require('mongoose'),
  User = mongoose.model('User');;

module.exports = {
    index: function(req, res) {
        var users = User.find(
            {},
            function(err, users) {
            if (!err){ 
               _.each(users, function(user) {

            delete user.password;
        });
             
             res.json(users);
            
               
                      }
            else { throw err;}

            }
    );

        
        
    }
};