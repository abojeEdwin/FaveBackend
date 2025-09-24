import Artist from "../data/models/Artist.js";
import Status from "../enum/Status.js";


export const adminVerifyArtist = async (req, res) => {
    try {
        const { artistId } = req.params;
        const artist = await Artist.findById(artistId);
        if (!artist) return res.status(404).json({ error: "Artist not found" });
        if (artist.verificationStatus !== Status.PENDING) {
            return res.status(400).json({ error: "Artist is not pending verification" });
        }
        artist.verificationStatus = Status.APPROVED;
        await artist.save();
        res.json({ success: true, message: "Artist verified successfully", artist });
    } catch (error) {
        console.error("Error verifying artist:", error);
        res.status(500).json({success: false, error: "Internal server error"});
    }
}

export const getPendingArtists = async (req, res) => {
    try {
        const artists = await Artist.find({ verificationStatus: Status.PENDING });
        res.json({ success: true, artists });
    } catch (error) {
        console.error("Error fetching pending artists:", error);
        res.status(500).json({ success: false, error: "Internal server error" });
    }
};

export const adminRejectArtist = async (req, res) => {
    try {
        const { artistId } = req.params;
        const artist = await Artist.findById(artistId);
        if (!artist) return res.status(404).json({ error: "Artist not found" });
        if (artist.verificationStatus !== Status.PENDING) {
            return res.status(400).json({ error: "Artist is not pending verification" });
        }

        artist.verificationStatus = Status.REJECTED;
        await artist.save();
        res.json({ success: true, message: "Artist rejected successfully", artist });
    } catch (error) {
        console.error("Error rejecting artist:", error);
        res.status(500).json({ success: false, error: "Internal server error" });
    }
};

