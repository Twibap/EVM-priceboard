var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var reconnectSchema = new Schema({

	err_code: Number,
	err_data: { type: String, default: null },
	date: { type: Date, default: Date.now }

}, { versionKey: false});

module.exports = mongoose.model('reconnect', reconnectSchema);
