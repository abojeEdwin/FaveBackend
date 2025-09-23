import express from "express";
import mongoose from "mongoose";
import seedAdmin from "./utils/seedAdmin.js";
import dotenv from "dotenv";
import artistRouter from "./route/ArtistRoute.js";
import fanRouter from "./route/FanRoute.js";
import cors from "cors";
import authRouter from "./route/AuthRoute.js";
import passport from "./config/passport.js";
import session from "express-session";

// Load environment variables
dotenv.config();

// Initialize app FIRST
const app = express();

// Session middleware
app.use(session({
    secret: process.env.JWT_SECRET || 'fallback_secret_key',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
    }
}));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Configure CORS for both development and production
const allowedOrigins = [
    "http://localhost:3000", // Local development frontend
    process.env.FRONTEND_URL, // Deployed frontend URL from environment variable
].filter(Boolean); // Remove any falsy values

const corsOptions = {
    origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);

        // Check if origin is in allowed list
        if (allowedOrigins.some(allowedOrigin => origin.startsWith(allowedOrigin))) {
            callback(null, true);
        } else {
            callback(new Error("Not allowed by CORS"));
        }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "HEAD", "DELETE"],
};

app.use(cors(corsOptions));
app.options(/.*/, cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/artists", artistRouter);
app.use("/api/fan", fanRouter);
app.use("/auth", authRouter);

app.get("/", (_req, res) => res.send("🚀 Fave Backend API is running..."));

const PORT = process.env.PORT || 3000;

// Add error handling for MongoDB connection
mongoose.connection.on('error', err => {
    console.error('❌ MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
    console.log(' MongoDB disconnected');
});

// Handle process termination
process.on('SIGINT', async () => {
    await mongoose.connection.close();
    console.log(' MongoDB connection closed through app termination');
    process.exit(0);
});

mongoose
    .connect(process.env.MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(async () => {
        console.log("✅ MongoDB connected");
        await seedAdmin();
        const server = app.listen(PORT, () => {
            console.log(`🚀 Server running on http://localhost:${PORT}`);
        });

        // Handle server errors
        server.on('error', (err) => {
            console.error('❌ Server error:', err);
        });
    })
    .catch((err) => {
        console.error("❌ MongoDB connection error:", err);
        process.exit(1); // Exit if can't connect to database
    });