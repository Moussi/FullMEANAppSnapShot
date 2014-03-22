var path = require('path');
var rootPath=path.normalize(__dirname+'/../../')
console.log(rootPath);

module.exports = 
{
	development : {
		db: 'mongodb://moussi:moussi@localhost/multivision',
		rootPath: rootPath,
		port : process.env.PORT || 8000
	},
	production : {
		db: 'mongodb://moussi:moussi@ds033669.mongolab.com:33669/moussimultivision',
		rootPath: rootPath,
		port : process.env.PORT || 80
	}
}