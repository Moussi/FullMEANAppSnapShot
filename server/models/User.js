var  _ =               require('underscore')
    , passport =        require('passport')
    , LocalStrategy =   require('passport-local').Strategy
    , TwitterStrategy = require('passport-twitter').Strategy
    , FacebookStrategy = require('passport-facebook').Strategy
    , GoogleStrategy = require('passport-google').Strategy
    , LinkedInStrategy = require('passport-linkedin').Strategy
    , check =           require('validator').check
    , userRoles =       require('../../client/js/routingConfig').userRoles,
    mongoose = require('mongoose'),
  User = mongoose.model('User'),
  FacebookUser = mongoose.model('FacebookUser');


var configAuth = require('./auth');

module.exports = {
    addUser: function(username, password, role, callback) {
        

        // find a user whose email is the same as the forms email
    // we are checking to see if the user trying to login already exists
        User.findOne({ 'username' :  username }, function(err, user) {
            // if there are any errors, return the error
            if (err)
                return  callback("Error Occured");

            // check to see if theres already a user with that email
            if (user) {
                return  callback("UserAlreadyExists");
            } else {

        // if there is no user with that email
                // create the user
                console.log('This a new User');
                var newUser            = new User();

                // set the user's local credentials
                newUser.username    = username;
                newUser.password = newUser.generateHash(password);
                newUser.role = role;
                console.log("New User Created with Role "+ JSON.stringify(role));
        // save the user
                newUser.save(function(err) {
                    if (err)
                    {
                        throw err;
                    }
                    {
                        console.log("Callback New User "+JSON.stringify(newUser));
                    return callback(null, newUser);
                    }
                });
            }

        });


        
    },

    findOrCreateOauthUser: function(provider, providerId) {
       var user = module.exports.findByProviderId(provider, providerId);
        if(!user) {
            user = {
                id: _.max(users, function(user) { return user.id; }).id + 1,
                username: provider + '_user', // Should keep Oauth users anonymous on demo site
                role: userRoles.user,
                provider: provider
            };
            user[provider] = providerId;
            users.push(user);
        }

        return user;
    },
/*
    findAll: function() {
        return _.map(users, function(user) { return _.clone(user); });
    },

    findById: function(id) {
        return _.clone(_.find(users, function(user) { return user.id === id }));
    },

    findByUsername: function(username) {
        return _.clone(_.find(users, function(user) { return user.username === username; }));
    },

    findByProviderId: function(provider, id) {
        return _.find(users, function(user) { return user[provider] === id; });
    },*/

    validate: function(user) {
        check(user.username, 'Username must be 1-20 characters long').len(1, 20);
        check(user.password, 'Password must be 5-60 characters long').len(5, 60);
        check(user.username, 'Invalid username').not(/((([A-Za-z]{3,9}:(?:\/\/)?)(?:[-;:&=\+\$,\w]+@)?[A-Za-z0-9.-]+|(?:www.|[-;:&=\+\$,\w]+@)[A-Za-z0-9.-]+)((?:\/[\+~%\/.\w-_]*)?\??(?:[-\+=&;%@.\w_]*)#?(?:[\w]*))?)/);

        // TODO: Seems node-validator's isIn function doesn't handle Number arrays very well...
        // Till this is rectified Number arrays must be converted to string arrays
        // https://github.com/chriso/node-validator/issues/185
        var stringArr = _.map(_.values(userRoles), function(val) { return val.toString() });
        check(user.role, 'Invalid user role given').isIn(stringArr);
    },

    localStrategy: new LocalStrategy(
        function(username, password, done) {

            
            User.findOne({ 'username' :  username }, function(err, user)
            {
            if(!user) {
                console.log('User NOTTTT Founddddddd');
                done(null, false, { message: 'Incorrect username.' });
            }
            else if(!user.validPassword(password)) {
                console.log('User/Pass Failed');
                done(null, false, { message: 'Incorrect username.' });
            }
            else {
                console.log('User Founddddddd'+JSON.stringify(user));
                return done(null, user);
            }
        });
        }
    ),

    twitterStrategy: function() {
        if(!process.env.TWITTER_CONSUMER_KEY)    throw new Error('A Twitter Consumer Key is required if you want to enable login via Twitter.');
        if(!process.env.TWITTER_CONSUMER_SECRET) throw new Error('A Twitter Consumer Secret is required if you want to enable login via Twitter.');

        return new TwitterStrategy({
            consumerKey: process.env.TWITTER_CONSUMER_KEY,
            consumerSecret: process.env.TWITTER_CONSUMER_SECRET,
            callbackURL: process.env.TWITTER_CALLBACK_URL || 'http://localhost:8000/auth/twitter/callback'
        },
        function(token, tokenSecret, profile, done) {

            var user = module.exports.findOrCreateOauthUser(profile.provider, profile.id);
            done(null, user);
        });
    },

    facebookStrategy: function() {
        if(!configAuth.facebookAuth.clientID)     throw new Error('A Facebook App ID is required if you want to enable login via Facebook.');
        if(!configAuth.facebookAuth.clientSecret) throw new Error('A Facebook App Secret is required if you want to enable login via Facebook.');

        return new FacebookStrategy({

        clientID        : configAuth.facebookAuth.clientID,
        clientSecret    : configAuth.facebookAuth.clientSecret,
        callbackURL     : configAuth.facebookAuth.callbackURL,
        passReqToCallback : true, // allows us to pass in the req from our route (lets us check if a user is logged in or not)
        profileFields: ['id','token','name', 'displayName', 'link', 'about_me', 'photos', 'emails']
    },
    function(req, token, refreshToken, profile, done) {

        // asynchronous
        process.nextTick(function() {
            console.log('profileeeeeeeeeeeeeeeeeeeeeeeeeee');
            console.log(JSON.stringify(profile));
            console.log('***************************');
            // check if the user is already logged in
            if (!req.user) {

                FacebookUser.findOne({ 'id' : profile.id }, function(err, user) {
                    if (err)
                        return done(err);

                    if (user) {

                        // if there is a user id already but no token (user was linked at one point and then removed)
                        if (!user.token) {
                            user.token = token;
                            user.name  = profile.name.givenName + ' ' + profile.name.familyName;
                            user.username = profile.name.givenName + ' ' + profile.name.familyName;
                            user.email = profile.emails[0].value;
                            user.birthday=profile.birthday;
                            user.socialtype = 'facebook';
                            user.role= {"bitMask":2,"title":"user"};
                            user.avatar= profile.photos[0].value;
                            user.save(function(err) {
                                if (err)
                                    throw err;
                                return done(null, user);
                            });
                        }

                        return done(null, user); // user found, return that user
                    } else {
                        // if there is no user, create them
                        var newUser            = new FacebookUser();

                        newUser.id    = profile.id;
                        newUser.token = token;
                        newUser.name  = profile.name.givenName + ' ' + profile.name.familyName;
                        newUser.username = profile.name.givenName + ' ' + profile.name.familyName;
                        newUser.email = profile.emails[0].value;
                        newUser.birthday= profile._json.birthday;
                        newUser.socialtype = 'facebook';
                        newUser.role= {"bitMask":2,"title":"user"};
                         newUser.avatar= profile.photos[0].value;
                        newUser.save(function(err) {
                            if (err)
                                throw err;
                            return done(null, newUser);
                        });
                    }
                });

            } else {
                // user already exists and is logged in, we have to link accounts
                var user            = req.user; // pull the user out of the session

                user.id    = profile.id;
                user.token = token;
                user.name  = profile.name.givenName + ' ' + profile.name.familyName;
                user.username = profile.name.givenName + ' ' + profile.name.familyName;
                user.email = profile.emails[0].value;
                user.birthday=profile.birthday;
                user.socialtype = 'facebook';
                user.role= {"bitMask":2,"title":"user"};
                 user.avatar= profile.photos[0].value;
                user.save(function(err) {
                    if (err)
                        throw err;
                    return done(null, user);
                });

            }
        });

    });
    },

    googleStrategy: function() {

        return new GoogleStrategy({
            returnURL: process.env.GOOGLE_RETURN_URL || "http://localhost:8000/auth/google/return",
            realm: process.env.GOOGLE_REALM || "http://localhost:8000/"
        },
        function(identifier, profile, done) {
            var user = module.exports.findOrCreateOauthUser('google', identifier);
            done(null, user);
        });
    },

    linkedInStrategy: function() {
        if(!process.env.LINKED_IN_KEY)     throw new Error('A LinkedIn App Key is required if you want to enable login via LinkedIn.');
        if(!process.env.LINKED_IN_SECRET) throw new Error('A LinkedIn App Secret is required if you want to enable login via LinkedIn.');

        return new LinkedInStrategy({
            consumerKey: process.env.LINKED_IN_KEY,
            consumerSecret: process.env.LINKED_IN_SECRET,
            callbackURL: process.env.LINKED_IN_CALLBACK_URL || "http://localhost:8000/auth/linkedin/callback"
          },
           function(token, tokenSecret, profile, done) {
            var user = module.exports.findOrCreateOauthUser('linkedin', profile.id);
            done(null,user); 
          }
        );
    },
    serializeUser: function(user, done) {
        console.log("Serialize "+JSON.stringify(user));
        done(null, user.id);
    },

    deserializeUser: function(id, done) {

        console.log("IDDDDDDD "+id);
        User.findOne({_id:id}).exec(function(err, user) {
      if(user) {
        console.log("DESerialize "+JSON.stringify(user));
        return done(null, user);
      } else {
        FacebookUser.findOne({id:id}).exec(function(err, user) {
      if(user) {
        console.log("DESerialize facebook User "+JSON.stringify(user));
        return done(null, user);
      } else {
        return done(null, false);
    }});
      }
    })
    }
};