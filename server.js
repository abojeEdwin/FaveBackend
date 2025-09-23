import express from "express";
import mongoose from "mongoose";
import seedAdmin from "./utils/seedAdmin.js";
import dotenv from "dotenv";
import artistRouter from "./route/ArtistRoute.js";
import fanRouter from "./route/FanRoute.js";
import cors from "cors";
import session from "express-session";
import authRouter from "./route/AuthRoute.js";
import passport from "./config/passport.js";

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
  "http://localhost:3001", // Local development frontend
  // Add your production frontend URL when you have it
  process.env.FRONTEND_URL // Any custom frontend URL from environment variables
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
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/artists", artistRouter);
app.use("/api/fan", fanRouter);
app.use("/auth", authRouter);

app.get("/", (_req, res) => res.send("🚀 Fave Backend API is running..."));

const PORT = process.env.PORT || 3000;

// Add detailed error handling for MongoDB connection
mongoose.connection.on('error', err => {
  console.error('❌ MongoDB connection error:', err);
  console.error('Make sure MongoDB is running on your machine and the MONGO_URI in .env is correct');
});

mongoose.connection.on('disconnected', () => {
  console.log('❌ MongoDB disconnected');
  console.log('Check if MongoDB service is running on your machine');
});

// Log successful connection events
mongoose.connection.on('connected', () => {
  console.log('✅ MongoDB connected successfully');
});

mongoose.connection.on('reconnected', () => {
  console.log('✅ MongoDB reconnected');
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
    console.error('Check your MONGO_URI in .env file and ensure MongoDB is running on your machine');
    process.exit(1); // Exit if can't connect to database
  });

// Error handling middleware for unhandled errors
app.use((err, req, res, next) => {
  console.error('❌ Unhandled error:', err);
  
  // Default error response
  const errorResponse = {
    error: 'Internal Server Error',
    message: 'An unexpected error occurred'
  };
  
  // Add more specific error information in development mode
  if (process.env.NODE_ENV === 'development') {
    errorResponse.message = err.message;
    errorResponse.stack = err.stack;
    errorResponse.details = err.toString();
  }
  
  // Set status code (use err.status if available, otherwise 500)
  const statusCode = err.status || 500;
  res.status(statusCode).json(errorResponse);
});

// Handle 404 routes
app.use((req, res, next) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.method} ${req.url} not found`
  });
});