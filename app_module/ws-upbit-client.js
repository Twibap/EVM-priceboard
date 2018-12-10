const colors = require("./colors")

// handling EVM-clients
priceServer = require("./evm-server.js");

// Websocket for Upbit Api
const WebSocketClient = require('./ws-client.js');
const upbitClient = new WebSocketClient('wss://api.upbit.com/websocket/v1');

upbitClient.onopen = ()=>{
	console.log( colors.info('Upbit api is connected'));
	// https://dunamuhelp.zendesk.com/hc/ko/requests/388
	var askMsg = '[{"ticket":"test"},{"type":"trade","codes":["KRW-ETH"], "isOnlyRealtime":"true"}]';
	upbitClient.send(askMsg);
	console.log( colors.info('Send - ') + colors.input(askMsg) );
};

upbitClient.onclose = ( code )=>{
	console.log( colors.error("Websocket is disconnected" ) );
	console.log( colors.error("OnClose called "+ code) );
};

upbitClient.onerror = (error)=>{
	console.log( colors.error( error.toString() ) );
};

// Upbit으로부터 데이터를 수신했을 때
const schema = require("./schema");
var lastPrice = null;
upbitClient.onmessage = (data)=>{
	var dataUpbit = JSON.parse(data);
	//console.log( colors.debug( dataUpbit ) );

	var dataEVMprice = schema.fromJSON(dataUpbit);
	var simpleEVMprice = schema.toSimple(dataEVMprice);


	if( lastPrice != null && dataUpbit.trade_price == lastPrice.trade_price){
		console.log( colors.debug( simpleEVMprice ) );
		return;	// 이전 가격과 수신한 가격이 같으면 저장하지 않는다.
	}

	// Save full data
	dataEVMprice.save((error)=>{
		if(error){
			console.log( colors.error(error) );
			return;
		}
	});

	console.log( colors.debug( simpleEVMprice ) + colors.info(" - save -") );
	lastPrice = dataUpbit;

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

};

