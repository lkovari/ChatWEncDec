import * as express from 'express';
import * as http from 'http';
import * as WebSocket from 'ws';

const app = express();

// Initialize a simple http server
const server = http.createServer(app);

// Initialize the WebSocket server instance
const wss = new WebSocket.Server({ server });

interface ExtWebSocket extends WebSocket {
    isAlive: boolean;
}

function createMessage(content: string, isBroadcast = false, sender = 'NS'): string {
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

    const extWs = ws as ExtWebSocket;

    extWs.isAlive = true;

    ws.on('pong', () => {
        extWs.isAlive = true;
    });

    // Connection is up, let's add a simple simple event
    ws.on('message', (msg: string) => {

        const message = JSON.parse(msg) as Message;

        setTimeout(() => {
            if (message.isBroadcast) {

                // Send back the message to the other clients
                wss.clients
                    .forEach(client => {
                        if (client != ws) {
                            client.send(createMessage(message.content, true, message.sender));
                        }
                    });

            }

            ws.send(createMessage(`You sent : ${message.content}`, message.isBroadcast));

        }, 1000);

    });

    // Send immediatly a feedback to the incoming connection    
    ws.send(createMessage('Connected'));

    ws.on('error', (err) => {
        console.warn(`Client Disconnected - reason: ${err}`);
    })
});

setInterval(() => {
    wss.clients.forEach((ws: WebSocket) => {

        const extWs = ws as ExtWebSocket;

        if (!extWs.isAlive) return ws.terminate();

        extWs.isAlive = false;
        ws.ping(null, undefined);
    });
}, 10000);

// Server start
server.listen(process.env.PORT || 7777, () => {
    console.log(`WebSocket server started on port ${server.address().port} :)`);
});