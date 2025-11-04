import Artist from "../data/models/Artist.js";
import Song from "../data/models/Song.js";
import Fan from "../data/models/Fan.js";
import { TransactionBlock } from "@mysten/sui.js/transactions";
import { provider, signer } from "./client";

export const login = async (req, res) => {
    try {
        const { address, role } = req.body;
        if (!address || !role) {
            return res.status(400).json({ error: "Missing authentication information" });
        }

        const artistExists = await Artist.findOne({ suiAddress: address });
        const fanExists = await Fan.findOne({ suiAddress: address });

        if (artistExists && fanExists) {
            return res.status(400).json({ error: "Address already exists as both fan and artist" });}

        let user = undefined;

        if (role === "ARTIST") {
            if (fanExists) {
                return res.status(400).json({ error: "This wallet is already registered as a fan" });
            }
            user = artistExists
                ? artistExists
                : await Artist.create({ suiAddress: address });
        } else if (role === "FAN") {
            if (artistExists) {
                return res.status(400).json({ error: "This wallet is already registered as an artist" });
            }
            user = fanExists
                ? fanExists
                : await Fan.create({ suiAddress: address });
        } else {
            return res.status(400).json({ error: "Invalid role" });
        }
        return res.status(200).json({
            message: "Login successful",
            role,
            user,
        });
    } catch (err) {
        console.error("Login error:", err);
        return res.status(500).json({ error: "Internal server error" });
    }
};
//
// export const verifyArtist = async (req, res) => {
//     try {
//
//         const {artistId,email,stageName,distributorLink} = req.body;
//
//         if (!email || !distributorLink || !email.includes("@") || !stageName) {
//             return res.status(400).json({error: "These fields are required"});
//         }
//         const artist = await Artist.findById(artistId);
//         if (!artist) {
//             return res.status(404).json({error: "Artist not found"});}
//         if (artist.verificationStatus === Status.APPROVED) {
//             return res.status(400).json({error: "Artist is already verified"});}
//         if (artist.verificationStatus === Status.PENDING) {
//             artist.distributorLink = distributorLink;
//             artist.verificationStatus = Status.PENDING;
//             await artist.save();
//             res.json({success: true, message: "Verification submitted successfully",artist});
//         }else{
//             return res.status(400).json({error: "Artist is already verified"});}
//     } catch (error) {
//         console.error("Error verifying artist:", error);
//         res.status(500).json({success: false, error: "Internal server error"});
//     }
// };
export const listSong = async (req, res) => {
    try {
        const { artistId, percentage } = req.body;

        // Check artist
        const artist = await Artist.findById(artistId);
        if (!artist) {
            return res.status(404).json({ error: "Artist not found" });
        }

        // Validate percentage
        if (percentage < 1 || percentage > 100) {
            return res.status(400).json({ error: "Percentage must be between 1 and 100" });
        }

        // Create a new song document in MongoDB
        const newSong = new Song({
            royaltyPercentage: percentage,
            artistId: artistId,
        });
        await newSong.save();

        // Create Move call
        const tx = new TransactionBlock();
        tx.moveCall({
            target: "0xYourPackage::songtoken::create_artist_token", // update with correct package + module
            arguments: [
                tx.object("0xTreasuryCapObjectId"), // <-- replace with your actual TreasuryCap<SONGTOKEN> object ID
                tx.pure(percentage, "u64"),
            ],
        });

        const result = await signer.signAndExecuteTransactionBlock({
            transactionBlock: tx,
            options: { showEffects: true, showObjectChanges: true },
        });

        return res.json({
            success: true,
            message: "Song listed successfully",
            newSong,
            txResult: result,
        });
    } catch (err) {
        console.error("Error listing song:", err);
        return res.status(500).json({ success: false, error: "Internal server error" });
    }
};
export default {login, listSong};