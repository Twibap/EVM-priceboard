const WebSocket = require('ws');

/*
 * 소켓 비정상 종료 시 재연결 가능한 Client
 * https://github.com/websockets/ws/wiki/Websocket-client-implementation-for-auto-reconnect
 */

function WebSocketClient(url){
	this.number = 0;	// Message number
	this.autoReconnectInterval = 5*1000;	// ms
	this.open(url);
}

WebSocketClient.prototype.open = function(url){
	this.url = url;
	this.instance = new WebSocket(this.url);
	this.instance.on('open',()=>{
		this.onopen();
	});
	this.instance.on('message',(data,flags)=>{
		this.number++;
		this.onmessage(data,flags,this.number);
	});
	this.instance.on('close',(e)=>{
		switch (e.code){
		case 1000:	// CLOSE_NORMAL
			console.log("WebSocket: closed");
			break;
		default:	// Abnormal closure
			this.reconnect(e);
			break;
		}
		this.onclose(e);
	});
	this.instance.on('error',(e)=>{
		switch (e.code){
		case 'ECONNREFUSED':
			this.reconnect(e);
			break;
		default:
			this.onerror(e);
			break;
		}
	});
}

WebSocketClient.prototype.send = function(data,option){
	try{
		this.instance.send(data,option);
	}catch (e){
		this.instance.emit('error',e);
	}
}

const Reconnect = require("../models/reconnect.js");
WebSocketClient.prototype.reconnect = function(e){
	console.log(`WebSocketClient: retry in ${this.autoReconnectInterval}ms`,e);
        this.instance.removeAllListeners();
	var that = this;
	setTimeout(function(){
		console.log("WebSocketClient: reconnecting...");

		const reconnect = new Reconnect();
		reconnect.err_code = e.code;
		reconnect.err_data = e.toString();
		reconnect.save();

		that.open(that.url);
	},this.autoReconnectInterval);
}

WebSocketClient.prototype.onopen = function(e){	
	console.log("WebSocketClient: open",arguments);	
}
WebSocketClient.prototype.onmessage = function(data,flags,number){	
	console.log("WebSocketClient: message",arguments);	
}
WebSocketClient.prototype.onerror = function(e){	
	console.log("WebSocketClient: error",arguments);	
}
WebSocketClient.prototype.onclose = function(e){	
	console.log("WebSocketClient: closed",arguments);	
}

module.exports = WebSocketClient;
