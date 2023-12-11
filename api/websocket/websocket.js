const ws = require('ws')
const jwt = require('jsonwebtoken')
const url = require('url');
const fs = require('fs')
const path = require('path')

const messageController = require('../controller/message.controller');

function setupWebSocket(server) {
    const wss = new ws.WebSocketServer({ server });
    wss.on('connection', (connection, req) => {

        function notifyAboutOnlinePeople() {
            [...wss.clients].forEach(client => {
                client.send(JSON.stringify({
                    online: [...wss.clients].map(c => ({ userId: c.userId, username: c.username, fullname: c.fullname })),
                }));
            });
        }

        connection.isAlive = true;

        connection.timer = setInterval(() => {
            connection.ping();
            connection.deathTimer = setTimeout(() => {
                connection.isAlive = false;
                clearInterval(connection.timer);
                connection.terminate();
                notifyAboutOnlinePeople();

            }, 1000);
        }, 5000);

        connection.on('pong', () => {
            clearTimeout(connection.deathTimer);
        });

        // read username and id
        const query = url.parse(req.url, true).query;
        const token = query.token;
        jwt.verify(token, process.env.SECRET_KEY, {}, (err, userData) => {
            if (err) throw err
            const { id, username, fullname } = userData
            connection.userId = id
            connection.username = username
            connection.fullname = fullname
        })

        // send message
        connection.on('message', async message => {
            const messageData = JSON.parse(message.toString())
            const { receiver, text, file } = messageData.message

            if (file) {
                const rootPath = path.resolve(__dirname, '..')
                const uploadsPath = path.join(rootPath, 'uploads');

                const filePath = path.join(uploadsPath, file.name);
                const bufferData = Buffer.from(file.data.split(',')[1], 'base64');

                fs.writeFile(filePath, bufferData, (err) => {
                    if (err) {
                        console.error('Error saving the file:', err);
                    }
                });
            }
            if (receiver) {
                const id = await messageController.newMessage({ sender: connection.userId, receiver, text, file: file?.name });

                [...wss.clients]
                    .filter(c => c.userId === receiver)
                    .forEach(c => c.send(JSON.stringify({
                        text,
                        sender: connection?.userId,
                        receiver,
                        file: file?.name,
                        id,
                    })))
            }
        });
        notifyAboutOnlinePeople()
    })


}

module.exports = setupWebSocket;