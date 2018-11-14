const WebSocket = require('ws');
const ws = new WebSocket('wss://api.upbit.com/websocket/v1');

ws.on('open', ()=>{
	var askMsg = '[{"ticket":"test"},{"type":"ticker","codes":["KRW-ETH"]}]';
	ws.send(askMsg);
	console.log('Websocket open - '+askMsg);
});

ws.on('close',()=>{
	console.log("disconnected");
})

ws.on('message', (data)=>{
	console.log( JSON.parse(data) );
})

