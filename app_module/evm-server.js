const colors = require("./colors")

// Websocket for broadcast EVM Price data
const WebSocket = require('ws');
const priceServer = new WebSocket.Server({ port : 8080});
//
// Broadcast to all.
priceServer.broadcast = function broadcast(data) {
  priceServer.clients.forEach(function each(client) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(data);
    }
  });
};

// Client가 연결되었을 때
const schema = require("./schema");
priceServer.on('connection', function connection(ws) {
	// ws == 연결된 Client
  ws.on('message', function incoming(data) {
		console.log( colors.info( "A client is connected" ) );
		// 저장된 가격 보내기
		schema.Price
			.find()
			.sort({ "_id": -1 })
			.limit(1)
			.exec((err, price)=>{
				if(err) console.log( colors.error( err ) );
				var latestPrice = schema.toSimple(  price[0]  );
				ws.send( JSON.stringify( latestPrice ) );
				console.log( colors.info( "Serve latest price") );
				console.log( colors.info( latestPrice ) );
		});
//		ws.send(" Connection OK!!! ")
//		ws.send(" Echo - "+data);
  });
});

module.exports = priceServer;
