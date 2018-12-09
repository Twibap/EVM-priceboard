const colors = require("./colors")

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

// handling EVM-clients
priceServer = require("./evm-server.js");

// Websocket for Upbit Api
const WebSocket = require('ws');
let ws = new WebSocket('wss://api.upbit.com/websocket/v1');

ws.on('open', ()=>{
	// https://dunamuhelp.zendesk.com/hc/ko/requests/388
	var askMsg = '[{"ticket":"test"},{"type":"trade","codes":["KRW-ETH"], "isOnlyRealtime":"true"}]';
	ws.send(askMsg);
	console.log( colors.info('Websocket open, Send - ') + colors.input(askMsg) );
});

ws.on('close',( code, reason )=>{
	console.log( colors.error("Websocket is disconnected" ) );
	console.log( colors.error("OnClose called "+ code) );
	console.log( colors.error("Reason is "+ reason) );

	// 연결 유지
	// not working
	return new WebSocket('wss://api.upbit.com/websocket/v1');
});

ws.on('error', (error)=>{
	console.log( colors.error( error.toString() ) );
})

// Upbit으로부터 데이터를 수신했을 때
var Price = require('../models/price');
var lastPrice = null;
ws.on('message', (data)=>{
	var dataUpbit = JSON.parse(data);
	//console.log( colors.debug( dataUpbit ) );

	var dataEVMprice = jsonToSchema(dataUpbit);
	var simpleEVMprice = schemaToSimple(dataEVMprice);


	if( lastPrice != null && dataUpbit.trade_price == lastPrice.trade_price){
		console.log( colors.debug( simpleEVMprice ) );
		return;	// 이전 가격과 수신한 가격이 같으면 저장하지 않는다.
	} else {
		console.log( colors.debug( simpleEVMprice ) + colors.info(" - save -") );
		lastPrice = dataUpbit;
	}

	// Save full data
	dataEVMprice.save((error)=>{
		if(error){
			console.log( colors.error(error) );
			return;
		}
	});

	// Broadcast simple data
	priceServer.broadcast( JSON.stringify( simpleEVMprice ) );
	// dataEVMprice
	//	{ _id: 5bed209ef89c00b6e130f18b,
	//  type: 'trade',
	//  code: 'KRW-ETH',
	//  timestamp: 2018-11-15T07:30:38.395Z,
	//  trade_date: '2018-11-15',
	//  trade_time: '07:30:38',
	//  trade_timestamp: 2018-11-15T07:30:38.000Z,
	//  trade_price: 211000,
	//  trade_volume: 1.35273559,
	//  ask_bid: 'BID',
	//  prev_closing_price: 214950,
	//  change: 'FALL',
	//  change_price: 3950,
	//  sequential_id: 1542267038000001,
	//  stream_type: 'REALTIME',
	//  evm_price: 232100 }

});

// --------- Functions ---------------------------------------
var schemaToSimple = (schema)=>{
	var jsonData = schema.toJSON();
	delete jsonData["type"];
	delete jsonData["code"];
	delete jsonData["timestamp"];
	delete jsonData["trade_date"];
	delete jsonData["trade_time"];
	delete jsonData["trade_timestamp"];
	delete jsonData["trade_price"];
	delete jsonData["trade_volume"];
	delete jsonData["ask_bid"];
	delete jsonData["prev_closing_price"];
	delete jsonData["change"];
	delete jsonData["change_price"];
	delete jsonData["sequential_id"];
	delete jsonData["stream_type"];

	return jsonData;
}

var jsonToSchema = (data)=>{	// data is JSON

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
