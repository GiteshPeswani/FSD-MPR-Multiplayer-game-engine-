// server.js - UPDATED

require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const connectDB = require('./config/db');
const authRoutes = require('./routes/auth');
const gameRoutes = require('./routes/games');
const assetRoutes = require('./routes/assets'); 
const inventoryRoutes = require('./routes/inventory'); // 🔑 NEW: Import Inventory Router
const errorHandler = require('./middleware/errorHandler');
const initWebSocket = require('./utils/websocket');

const app = express();
const server = http.createServer(app);

// ✅ Initialize Socket.IO
const io = new Server(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST'],
    },
});

// ✅ Start Server Function
const startServer = async () => {
    try {
        await connectDB();
        console.log('✅ MongoDB connected successfully');

        // Security Middleware
        app.use(helmet());

        // CORS Configuration
        app.use(
            cors({
                origin: '*', 
                methods: ['GET', 'POST', 'PUT', 'DELETE'],
                credentials: true,
            })
        );

        // 🛑 Body Parser - Essential for POST/PUT requests
        app.use(express.json());

        // Logging (only in dev)
        if (process.env.NODE_ENV === 'development') {
            app.use(morgan('dev'));
        }

        // Rate Limiting 
        const limiter = rateLimit({
            windowMs: 10 * 60 * 1000,
            max: 100,
            message: { error: 'Too many requests, please try again later.' },
        });
        app.use(limiter);

        // =========================================================================
        // ✅ ROUTES INTEGRATION
        // =========================================================================
        app.use('/api/auth', authRoutes);
        app.use('/api/games', gameRoutes);
        app.use('/api/assets', assetRoutes); 
        app.use('/api/inventory', inventoryRoutes); // 🔑 NEW: Integrate Inventory Router
        // =========================================================================


        // ✅ 404 Route - This catches any route not defined above
        app.use((req, res) => {
            res.status(404).json({ error: 'Route not found' });
        });

        // ✅ Centralized Error Handler
        app.use(errorHandler);

        // ✅ Initialize WebSocket
        initWebSocket(io);

        // ✅ Start HTTP + WebSocket Server
        const PORT = process.env.PORT || 4000;
        server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
    } catch (err) {
        console.error('❌ Failed to start server:', err);
        process.exit(1);
    }
};

startServer();