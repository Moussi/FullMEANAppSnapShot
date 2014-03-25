var mongoose = require('mongoose'),
    bcrypt   = require('bcrypt-nodejs');;

//connect To database
module.exports = function(config) {
    mongoose.connect(config.db);
    var db = mongoose.connection;
    db.on('error', console.error.bind(console, 'connection error ...'));
    db.once('open', function callback() {
        console.log('multivision db conected');
    });
   


    var userSchema = mongoose.Schema({

        username        : String,
        password     : String,
        role : 
            {"bitMask":Number,"title":String}
        
});

       var facebookuserSchema = mongoose.Schema({
        id           : String,
        token        : String,
        email        : String,
        name         : String,
        location     : String,
        birthday     : String,  
        username        : String,
        role : 
            {"bitMask":Number,"title":String},
            socialtype:String,
            avatar:String
        
});


   // generating a hash
userSchema.methods.generateHash = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

// checking if password is valid
userSchema.methods.validPassword = function(password) {
    return bcrypt.compareSync(password, this.password);
};

    var User=mongoose.model('User',userSchema);
    var FacebookUser=mongoose.model('FacebookUser',facebookuserSchema);
 
}

/*function createSalt () {
    return crypto.randomBytes(128).toString('base64');
}

//create hashed password
function hashPWD (salt,pwd) {
   var hmac = crypto.createHmac('sha1',salt);
   return hmac.update(pwd).digest('hex');  
}*/