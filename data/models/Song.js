import mongoose from "mongoose";

import SongStatus from "../../enum/SongStatus.js";

const songSchema = new mongoose.Schema(
    {
        artistId: { type: mongoose.Schema.Types.ObjectId, ref: "Artist", required: true },

        name: { type: String, required: true },
        description: { type: String ,required: true},
        image_url: { type: Date , required: true},
        percentage: { type: String , required: false},
        audioFileUrl: { type: String , required: false},
        royaltyPercentage: { type: Number, required: true },
    },
    { timestamps: true }
);

export default mongoose.model("Song", songSchema);
