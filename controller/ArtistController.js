// controller/ArtistController.js

import {verifyJWT,generateSessionToken} from "../utils/helper.js"
import Artist from "../data/models/Artist.js";
import {Ed25519Keypair} from "@mysten/sui.js/keypairs/ed25519";
import Role from "../enum/Role.js";
import Status from "../enum/Status.js";
import Song from "../data/models/Song.js";
import Fan from "../data/models/Fan.js";

//
// export const signup = async (req, res) => {
//     try {
//         const { address, role } = req.body;
//         if (!address || !role) {
//             return res.status(400).json({ error: "Missing signup information" });}
//         const existingArtist = await Artist.findOne({ suiAddress: address });
//         if (existingArtist) {
//             return res.status(409).json({ error: "Artist already registered" });}
//         const newArtist = new Artist({
//             suiAddress: address,
//             role: Role.ARTIST,
//             lastLogin: new Date(),
//         });
//         await newArtist.save();
//         return res.status(201).json({
//             success: true,
//             artist: {
//                 id: newArtist._id,
//                 suiAddress: newArtist.suiAddress,
//                 role: newArtist.role,
//                 lastLogin: newArtist.lastLogin,
//             },
//         });
//     } catch (error) {
//         console.error("Signup failed:", error);
//         res.status(500).json({ success: false, error: error.message });
//     }
// };
export const login = async (req, res) => {
    try {
        const { address, role } = req.body;
        if (!address || !role) {
            return res.status(400).json({ error: "Missing authentication information" });
        }

        //const normalizedAddress = address.toLowerCase();

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

export const verifyArtist = async (req, res) => {
    try {
        const {artistId} = req.params;
        const {email,stageName,distributorLink} = req.body;

        if (!email || !distributorLink || !email.includes("@") || !stageName) {
            return res.status(400).json({error: "These fields are required"});
        }
        const artist = await Artist.findById(artistId);
        if (!artist) {
            return res.status(404).json({error: "Artist not found"});}
        if (artist.verificationStatus === Status.APPROVED) {
            return res.status(400).json({error: "Artist is already verified"});}
        if (artist.verificationStatus === Status.PENDING) {
            artist.nin = nin;
            artist.distributorLink = distributorLink;
            artist.verificationStatus = Status.PENDING;
            await artist.save();

            res.json({success: true, message: "Verification submitted successfully"});
        }else{
            return res.status(400).json({error: "Artist is already verified"});}
    } catch (error) {
        console.error("Error verifying artist:", error);
        res.status(500).json({success: false, error: "Internal server error"});
    }
};


export const listSong = async (req, res) =>{
    try{
        const{artistId} = req.params;
        const{song}= req.body;

        const artist = await Artist.findById(artistId);
        if (!artist) {
            return res.status(404).json({error: "Artist not found"});
        }
        if(artist.isVerified === false){
            return res.status(400).json({error: "Artist is not verified"});
        }

        const foundSong  = await Song.findOne({title: song.songName});
        if (!foundSong) {
            const newSong = new Song({
                title: song.songName,
                releaseDate: song.releaseDate,
                royaltyPercentage: song.royaltyPercentage,
                artistId: artistId,
                description: song.description,
                genre: song.genre,
                image: song.coverArtUrl,
                audio: song.audioFileUrl,
            })
            if(newSong.royaltyPercentage < 1 || newSong.royaltyPercentage > 100){
                return res.status(400).json({error: "Percentage should not exceed 100 or less than 1 "});
            }

            await newSong.save();
            res.json({success: true, message: "Song listed successfully", songId: newSong._id});
        }
        else{
            return res.status(400).json({error: "Song already exists, Try listing another song"});
        }
    }catch (err){
        console.error("Error listing song:", err);
        res.status(500).json({success: false, error: "Internal server error"});
    }
};

export default {login, verifyArtist, listSong};