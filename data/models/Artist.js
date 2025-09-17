import mongoose from "mongoose";
import Role from "../../enum/Role.js";
import Status from "../../enum/Status.js";

const artistSchema = new mongoose.Schema(
    {

        profile: {
            name: {
                type: String,
                required: true,
            },
            email: {
                type: String,
                required: true,
                minlength: 5,
                maxlength: 100,
                trim: true,
                lowercase: true,
                unique: true,
                index: true,
            },
            picture: {
                type: String,
                required: true,
                trim: true
            },
        },
        provider: { type: String, enum: ["google", "facebook", "zklogin"], required: true },
        providerId: { type: String, required: true },
        suiAddress: {type: String, required: true, unique: true},
        suiPrivateKey: {type: String, required: true},
        role: {type: String , enum: Object.values(Role), default: Role.ARTIST},
        distributorLink: { type: String },
        nin: { type: String, unique: true, sparse: true },
        isVerified: { type: Boolean, default: false },
        verificationStatus: {type: String, enum: Object.values(Status), default: Status.PENDING},
        createdAt: {type: Date, default: Date.now},
        lastLogin: {type: Date, default: Date.now},
    },

    { timestamps: true }
);

export default mongoose.model("Artist", artistSchema);