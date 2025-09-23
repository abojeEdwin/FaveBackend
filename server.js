import express from "express";
import mongoose from "mongoose";
import seedAdmin from "./utils/seedAdmin.js";
import dotenv from "dotenv";
import artistRouter from "./route/ArtistRoute.js";
import fanRouter from "./route/FanRoute.js";
import cors from "cors";
import session from "express-session";
import authRouter from "./route/AuthRoute.js";
import passport from "./config/passport.js"; // Import our configured passport

// Load environment variables
dotenv.config();

// Initialize app FIRST
const app = express();

// Session middleware
app.use(session({
  secret: process.env.JWT_SECRET || 'fallback_secret_key',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false } // Set to true if using HTTPS
}));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Allowed origins for CORS
const allowedOrigins = [
    "http://localhost:3001"  // Add frontend development server
];

const corsOptions = {
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
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

mongoose
    .connect(process.env.MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(async () => {
        console.log("✅ MongoDB connected");
        await seedAdmin();
        app.listen(PORT, () =>
            console.log(`🚀 Server running on http://localhost:${PORT}`)
        );
    })
    .catch((err) => console.error("❌ MongoDB connection error:", err));