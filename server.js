import express from "express";
import mongoose from "mongoose";
import seedAdmin from "./utils/seedAdmin.js";
import dotenv from "dotenv";
import artistRouter from "./route/ArtistRoute.js";
import fanRouter from "./route/FanRoute.js";
dotenv.config();


export const app = express();
app.use(express.json())


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


