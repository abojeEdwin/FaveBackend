import express from "express";
import mongoose from "mongoose";
import seedAdmin from "./utils/seedAdmin.js";
import dotenv from "dotenv";
import ArtistController from "passport/lib/http/request.js";
dotenv.config();

export const app = express();

mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
 })
    .catch(err => console.error("MongoDB connection error:", err));
await seedAdmin();

app.listen(3000, () => {
    console.log("Server running on port 3000");
});
app.post("/login", ArtistController.login);

