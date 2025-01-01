const express = require('express')
const { createServer } = require('http')
const path = require("path");
const { Server } = require('socket.io');
const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
// const { availableParallelism } = require('node:os');
// const cluster = require('node:cluster');
const { createAdapter, setupPrimary } = require('@socket.io/cluster-adapter');
require('dotenv').config();

// if (cluster.isPrimary) {
//     const numCPUs = availableParallelism();
//     // create one worker per available core
//     for (let i = 0; i < numCPUs; i++) {
//         cluster.fork({
//             PORT: port + i
//         });
//     }

//     // set up the adapter on the primary thread
//     return setupPrimary();
// }
const app = express()
//express app
const server = createServer(app)
//http server
const io = new Server(server, {
    connectionStateRecovery: {},
    //  adapter: createAdapter()
});
//integrating socket.io

async function main() {
    // open the database file
    const db = await open({
        filename: 'chat.db',
        driver: sqlite3.Database
    });

    // create our 'messages' table
    await db.exec(`
      CREATE TABLE IF NOT EXISTS messages (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          client_offset TEXT UNIQUE,
          content TEXT
      );
    `);

    app.use(express.static(path.resolve("./public")));
    app.get('/', (req, res) => {
        res.sendFile("/public/index.html");
    })
    io.on('connection', async (socket) => {
        socket.on('chat message', async (msg, clientOffset, callback) => {
            let result;
            try {
                result = await db.run('INSERT INTO messages (content, client_offset) VALUES (?, ?)', msg, clientOffset);
            } catch (e) {
                if (e.errno === 19 /* SQLITE_CONSTRAINT */) {
                    // the message was already inserted, so we notify the client
                    callback();
                } else {
                    //let the client retry
                }
                return;
            }
            io.emit('chat message', msg, result.lastID);
            callback();
        });

        if (!socket.recovered) {
            try {
                await db.each('SELECT id, content FROM messages WHERE id > ?',
                    [socket.handshake.auth.serverOffset || 0],
                    (_err, row) => {
                        socket.emit('chat message', row.content, row.id);
                    }
                )
            } catch (e) {
                console.error("message cant be send from server to client")
            }
        }
    });

    const port = process.env.PORT || 8081
    server.listen(port, () => {
        console.log(`server running at port ${port}`);
    });
}
main();