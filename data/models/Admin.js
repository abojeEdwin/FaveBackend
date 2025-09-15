const mongoose = require("mongoose");

const adminSchema = new mongoose.Schema({
    email: { type: String, unique: true, required: true },
    firstName: { type: String },
    lastName: { type: String },
    locale: { type: String },
    oauthProvider: { type: String },
    role: { type: String, default: "admin" },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Admin", adminSchema);
