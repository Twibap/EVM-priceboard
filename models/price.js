var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var priceSchema = new Schema({

	type: String,								//	type: 'trade',
	code: String,								//  code: 'KRW-ETH',
	timestamp: Date,						//  timestamp: 1542183156040,
	trade_date: String,					//  trade_date: '2018-11-14',
	trade_time: String,					//  trade_time: '08:12:35',
	trade_timestamp: Date,			//  trade_timestamp: 1542183155000,
	trade_price: Number,				//  trade_price: 235450,
	trade_volume: Number,				//  trade_volume: 5.14229317,
	ask_bid: String,						//  ask_bid: 'BID',
	prev_closing_price: Number,	//  prev_closing_price: 235950,
	change: String,							//  change: 'FALL',
	change_price: Number,				//  change_price: 500,
	sequential_id: Number,			//  sequential_id: 1542183155000000,
	stream_type: String,				//  stream_type: 'REALTIME',
	evm_price: Number						//  evm_price: 258995.00000000003 

}, { versionKey: false});

module.exports = mongoose.model('price', priceSchema);
