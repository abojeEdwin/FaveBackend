import mongoose from "mongoose";

import SongStatus from "../../enum/SongStatus.js";

const songSchema = new mongoose.Schema(
    {
        artistId: { type: mongoose.Schema.Types.ObjectId, ref: "Artist", required: true },

        songName: { type: String, required: true },
        genre: { type: String , required: true},
        description: { type: String ,required: true},
        releaseDate: { type: Date , required: true},
        coverArtUrl: { type: String , required: false},
        audioFileUrl: { type: String , required: false},
        royaltyPercentage: { type: Number, required: true },
        status: {
            type: String,
            enum: Object.values(SongStatus),
            default: SongStatus.PENDING,
        },
    },
    { timestamps: true }
);

export default mongoose.model("Song", songSchema);
