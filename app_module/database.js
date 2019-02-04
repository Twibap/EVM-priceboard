const colors = require('./colors');

// Database for price
const mongoose = require('mongoose');
const db = mongoose.connection;

// 실행 매개변수로부터 Database 주소와 Port를 가져온다.
const command = process.argv;

let database_ip;
let database_port;
process.argv.forEach(function (item, index){
	switch( item ){
		case '--database':
		case '-d':
			database_ip = process.argv[ index +1 ];
			break;
		case '--port':
		case '-p':
			database_port = process.argv[ index +1 ];
			break;
	}

	if( database_ip == null ){
		database_ip = '127.0.0.1';
	}
	
	if( database_port == null ){
		database_port = '27017';
	}
});

var dbUrl = 'mongodb://'+database_ip+':'+database_port;
var dbName = '/EVM';

var error_count = 0;
db.on('error', (error)=>{
	// If transient error, retry the whole transaction
	// https://docs.mongodb.com/manual/core/transactions/#retry-transaction
	//
	// Shell script로 실행 시 TransientTransactionError가 발생한다.
	// autoReconnect 옵션이 작동하지 않아 재 연결을 구현한다.
	
	if (error.errorLabels && error.errorLabels.indexOf('TransientTransactionError') >= 0) {
		error_count++;
		console.log('TransientTransactionError, retrying transaction '+ error_count +' ...');
		mongoose.connect( dbUrl+dbName, {useNewUrlParser: true} );
	} else {
		throw error;
	}
});
db.once('open', ()=>{
	console.log( colors.info( dbUrl+" is opened") );
});
mongoose.connect( dbUrl+dbName, { useNewUrlParser: true } );
