import mongoose from "mongoose";
import Role from "../../enum/Role.js";
import Status from "../../enum/Status";

const artistSchema = new mongoose.Schema(
    {

        firstName: { type: String },
        lastName: { type: String },
        email: { type: String, required: true, unique: true },
        locale: { type: String },
        picture: { type: String },
        provider: { type: String, enum: ["google", "facebook", "zklogin"], required: true },
        providerId: { type: String, required: true },
        suiAddress: {type: String, required: true, unique: true},
        suiPrivateKey: {type: String, required: true,},
        role: {type: String , enum: Object.values(Role), default: Role.ARTIST},
        distributorLink: { type: String },
        nin: { type: String, unique: true, sparse: true },
        isVerified: { type: Boolean, default: false },
        verificationStatus: {type: String, enum: Object.values(Status), default: Status.PENDING,},
    },

    { timestamps: true }
);

export default mongoose.model("Artist", artistSchema);