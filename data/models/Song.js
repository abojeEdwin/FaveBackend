import mongoose from "mongoose";

import SongStatus from "../../enum/SongStatus";

const songSchema = new mongoose.Schema(
    {
        artistId: { type: mongoose.Schema.Types.ObjectId, ref: "Artist", required: true },

        songName: { type: String, required: true },
        genre: { type: String },
        description: { type: String },
        releaseDate: { type: Date },
        coverArtUrl: { type: String },
        audioFileUrl: { type: String },
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
