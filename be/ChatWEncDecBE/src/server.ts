import * as express from 'express';
import * as http from 'http';
import * as WebSocket from 'ws';

const app = express();

// Initialize a simple http server
const server = http.createServer(app);

// Initialize the WebSocket server instance
const wss = new WebSocket.Server({ server });

interface CustomWebSocket extends WebSocket {
    isAlive: boolean;
}

function createMessage(content: string, isBroadcast = false, sender = 'WS'): string {
    return JSON.stringify(new Message(content, isBroadcast, sender));
}

export class Message {
    constructor(
        public content: string,
        public isBroadcast = true,
        public sender: string
    ) { }
}

wss.on('connection', (ws: WebSocket) => {
    const customtWs = ws as CustomWebSocket;
    customtWs.isAlive = true;

    // https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API/Writing_WebSocket_servers#pings_and_pongs_the_heartbeat_of_websockets
    ws.on('pong', () => {
        customtWs.isAlive = true;
    });

    // Connection is up, let's add a simple simple event
    ws.on('message', (msg: string) => {

        const message = JSON.parse(msg) as Message;

        setTimeout(() => {
            if (message.isBroadcast) {

                // Send back the message to the other clients
                wss.clients.forEach(client => {
                        if (client != ws) {
                            client.send(createMessage(message.content, true, message.sender));
                        }
                    });
            }
        }, 1000);

    });

    // Send a feedback immediatly to the incoming connection    
    ws.send(createMessage('Connected'));

    ws.on('error', (err) => {
        console.warn(`Client Disconnected - reason: ${err}`);
    })
});

setInterval(() => {
    wss.clients.forEach((ws: WebSocket) => {
        const customtWs = ws as CustomWebSocket;
        if (!customtWs.isAlive) {
            return ws.terminate();
        }
        customtWs.isAlive = false;
        ws.ping(null, undefined);
    });
}, 10000);

// Server start
server.listen(process.env.PORT || 7777, () => {
    console.log(`WebSocket server started on port ${server.address().port} :)`);
});