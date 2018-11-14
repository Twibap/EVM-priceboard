// color for debug
const colors = require('colors/safe');
// set theme
colors.setTheme({
  silly: 'rainbow',
  input: 'grey',
  verbose: 'cyan',
  prompt: 'grey',
  info: 'green',
  data: 'grey',
  help: 'cyan',
  warn: 'yellow',
  debug: 'blue',
  error: 'red'
});

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

// Websocket to get Ethereum Price data from Upbit api
const WebSocket = require('ws');
var ws = new WebSocket('wss://api.upbit.com/websocket/v1');

ws.on('open', ()=>{
	// TODO ticket field 문의사항 확인하기 
	// https://dunamuhelp.zendesk.com/hc/ko/requests/388
	var askMsg = '[{"ticket":"test"},{"type":"trade","codes":["KRW-ETH"], "isOnlyRealtime":"true"}]';
	ws.send(askMsg);
	console.log( colors.info('Websocket open, Send - ') + colors.input(askMsg) );
});

ws.on('close',()=>{
	console.log( colors.error("Websocket is disconnected" ) );

	// 연결 유지
	// not working
	ws = new WebSocket('wss://api.upbit.com/websocket/v1');
});

var Price = require('./models/price');
ws.on('message', (data)=>{
	var dataUpbit = JSON.parse(data);
	//console.log( colors.debug( dataUpbit ) );

	var dataEVMprice = dataToSchema(dataUpbit);
	dataEVMprice.save((error)=>{
		if(error){
			console.log( colors.error(error) );
			return;
		}
	});

	console.log( colors.debug(dataEVMprice.toJSON() ) );

});

var dataToSchema = (data)=>{	// data is JSON
	var schema = new Price();
	schema.type = data.type;
	schema.code = data.code;
	schema.timestamp = data.timestamp;
	schema.trade_date = data.trade_date;
	schema.trade_time = data.trade_time;
	schema.trade_timestamp = data.trade_timestamp;
	schema.trade_price = data.trade_price;
	schema.trade_volume = data.trade_volume;
	schema.ask_bid = data.ask_bid;
	schema.prev_closing_price = data.prev_closing_price;
	schema.change = data.change;
	schema.change_price = data.change_price;
	schema.sequential_id = data.sequential_id;
	schema.stream_type = data.stream_type;
	schema.evm_price = (data.trade_price * 1.1).toFixed(0);
	
	schema.set('toJSON', { getters: true, virtuals: false });

	return schema;
};
