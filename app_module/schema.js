const Price = require('../models/price');

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

module.exports = {
	Price : Price,
	toSimple : schemaToSimple,
	fromJSON : jsonToSchema
};
