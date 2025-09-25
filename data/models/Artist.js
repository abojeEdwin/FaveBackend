import mongoose from "mongoose";
import Role from "../../enum/Role.js";
import Status from "../../enum/Status.js";

const artistSchema = new mongoose.Schema(
    {

        suiAddress: {type: String, required: true, unique: true},
        role: {type: String , enum: Object.values(Role), default: Role.ARTIST},
        distributorLink: { type: String },
        stageName: { type: String },
        email: { type: String },
        isVerified: { type: Boolean, default: false },
        verificationStatus: {type: String, enum: Object.values(Status), default: Status.PENDING},
        createdAt: {type: Date, default: Date.now},
        lastLogin: {type: Date, default: Date.now},
    },

    { timestamps: true }
);

export default mongoose.model("Artist", artistSchema);