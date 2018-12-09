const colors = require('./colors');

// Database for price
const mongoose = require('mongoose');
const db = mongoose.connection;
var dbUrl = 'mongodb://localhost/';
var dbName = 'EVM';

db.on('error', console.error);
db.once('open', ()=>{
	console.log( colors.info("Datatbase is connected") );
});
mongoose.connect( dbUrl+dbName, {useNewUrlParser: true} );
