const express = require('express');
const { createServer } = require('http');
const path = require("path");
const { Server } = require('socket.io');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
// Express app
const server = createServer(app);
// HTTP server
const io = new Server(server, {
    connectionStateRecovery: {},
});
//socket io
const pool = new Pool({
    user: process.env.PGUSER,       
    host: process.env.PGHOST,       
    database: process.env.PGDATABASE,
    password: process.env.PGPASSWORD,
    port: process.env.PGPORT || 5432, 
});

async function main() {
    await pool.query(`
        CREATE TABLE IF NOT EXISTS messages (
            id SERIAL PRIMARY KEY,
            client_offset TEXT UNIQUE,
            content TEXT
        );
    `);

    app.use(express.static(path.resolve("./public")));
    app.get('/', (req, res) => {
        res.sendFile(path.join(__dirname, 'index.html'));
    });

    io.on('connection', async (socket) => {
        socket.on('chat message', async (msg, clientOffset, callback) => {
            let result;
            try {
                result = await pool.query(
                    'INSERT INTO messages (content, client_offset) VALUES ($1, $2) RETURNING id',
                    [msg, clientOffset]
                );
            } catch (e) {
                if (e.code === '23505' /* postgress doc dekh */) {
                    // the message was already inserted, so we notify the client
                    callback();
                } else {
                    console.error("Error inserting message:", e);
                }
                return;
            }
            io.emit('chat message', msg, result.rows[0].id);
            callback();
        });

        if (!socket.recovered) {
            try {
                const serverOffset = socket.handshake.auth.serverOffset || 0;
                const { rows } = await pool.query(
                    'SELECT id, content FROM messages WHERE id > $1',
                    [serverOffset]
                );

                rows.forEach(row => {
                    socket.emit('chat message', row.content, row.id);
                });
            } catch (e) {
                console.error("Error retrieving messages:", e);
            }
        }
    });

    const port = process.env.PORT || 8081;
    server.listen(port, () => {
        console.log(`server running at port ${port}`);
    });
}

main();
