import express from "express";
import mongoose from "mongoose";
import seedAdmin from "./utils/seedAdmin.js";
import dotenv from "dotenv";
import artistRouter from "./route/ArtistRoute.js";
import fanRouter from "./route/FanRoute.js";
import cors from "cors";
dotenv.config();

app.use(express.json())

app.use(cors());
const app = express();

// Add CORS middleware to allow requests from http://localhost:5173
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:5173');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS'); // Include all allowed methods
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization'); // Include all allowed headers
    next();
});

//
// // Example login route
// app.post('/api/fan/login', (req, res) => {
//     // ... login logic ...
//     res.send('Login successful');
// });

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

const allowedOrigins = [
    process.env.FRONTEND_URL, // Your deployed frontend URL from Render
    'http://localhost:5174',  // Including both common dev ports
    'http://localhost:5173'
];

const corsOptions = {
    origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin || allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT','DELETE', 'PATCH', 'HEAD'],
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use('/api/artists', artistRouter)
app.use('/api/fan', fanRouter)


mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
 })
    .catch(err => console.error("MongoDB connection error:", err));
await seedAdmin();

app.listen(3000, () => {
    console.log("Server running on port 3000");
});

app.get('/', (_req, res) => res.send('🚀 Task Manager API is running...'));


