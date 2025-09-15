import mongoose from "mongoose";
import Role from "../../Enum/Role";

const fanSchema = new mongoose.Schema(
    {
        firstName: { type: String },
        lastName: { type: String },
        email: { type: String, required: true, unique: true },
        locale: { type: String },
        picture: { type: String },
        provider: {
            type: String,
            enum: ["google", "facebook", "zklogin"],
            required: true,
        },
        providerId: { type: String, required: true },
        zkAddress: { type: String },
        role: {type:String, enum: Object.values(Role), default: Role.FAN}
    },
    { timestamps: true }
);

export default mongoose.model("Fan", fanSchema);
