const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '.env') });

const express = require('express');
const cors = require('cors');

const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const aiRoutes = require('./routes/aiRoutes');

// Validate required environment variables
const requiredEnvVars = ['MONGO_URI', 'JWT_SECRET', 'GROQ_API_KEY', 'EMAIL_USER', 'EMAIL_PASS'];
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
    console.error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
    process.exit(1);
}

// Connect to MongoDB
connectDB();

const app = express();

app.use(cors({
    origin: process.env.FRONTEND_URL || true,
    credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));



app.use('/api/auth', authRoutes);
app.use('/api/ai', aiRoutes);

// Absolute path to client build folder
const clientBuildPath = path.join(__dirname, '..', 'frontend', 'GenAI', 'dist');

// Serve static files
app.use(express.static(clientBuildPath));

// Serve the frontend entry point for client-side routes such as /signup.
app.use((req, res, next) => {
    if (req.method !== 'GET' || req.path.startsWith('/api/')) {
        return next();
    }

    res.sendFile(path.join(clientBuildPath, 'index.html'), (error) => {
        if (error) next(error);
    });
});


app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Server Error', error: err.message });
});

const PORT = process.env.PORT || 6000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});