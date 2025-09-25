import mongoose from "mongoose";
import Role from "../../enum/Role.js";

const fanSchema = new mongoose.Schema(
    {
        suiAddress: {type: String, required: true, unique: true},
        role: {type:String, enum: Object.values(Role), default: Role.FAN},
        createdAt: {type: Date, default: Date.now},
        lastLogin: {type: Date, default: Date.now},
    },
    { timestamps: true }
);

export default mongoose.model("Fan", fanSchema);
