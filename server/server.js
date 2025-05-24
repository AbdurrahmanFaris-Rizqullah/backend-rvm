const express = require('express');
const cors = require('cors');
const WebSocket = require('ws');
const http = require('http');
const userRoutes = require('./routes/userRoute');
const loginRoutes = require('./routes/loginRoute');
const cookieParser = require('cookie-parser');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });
const PORT = 3000;

// Middleware
app.use(cors({
  credentials: true,
  origin: process.env.CLIENT_URL || 'http://localhost:5173' // sesuaikan dengan URL frontend
}));
app.use(cookieParser());
app.use(express.json());

// WebSocket connections
let connections = new Set();

wss.on('connection', (ws) => {
  connections.add(ws);
  console.log('Client terhubung');

  ws.on('close', () => {
    connections.delete(ws);
    console.log('Client terputus');
  });
});

// Fungsi untuk broadcast update ke semua client
function broadcastUpdate(type, data) {
  connections.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({ type, data }));
    }
  });
}

// Tambahkan broadcastUpdate ke global untuk diakses controller
global.broadcastUpdate = broadcastUpdate;

// Routes
app.use('/api/auth', loginRoutes);
app.use('/api', userRoutes);

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: 'Internal Server Error',
    message: 'Terjadi kesalahan pada server'
  });
});

// Start server
server.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
  console.log(`WebSocket server berjalan di ws://localhost:${PORT}`);
});
