// controller/FanController.js

import {verifyJWT,generateSessionToken} from "../utils/helper.js"
import Fan from "../data/models/Fan.js";
import Song from "../data/models/Song.js";
import Artist from "../data/models/Artist.js";
import {Ed25519Keypair} from "@mysten/sui.js/keypairs/ed25519";
import Role from "../enum/Role.js";
import { TransactionBlock } from '@mysten/sui.js/transactions';
import { SuiClient } from '@mysten/sui.js/client';
import { genAddressSeed, getZkLoginSignature } from "@mysten/sui/zklogin";

//
// export const signup = async (req, res) => {
//     try {
//         const { address, role } = req.body;
//         if (!address || !role) {
//             return res.status(400).json({ error: "Missing signup information" });}
//         const existingFan = await Fan.findOne({ suiAddress: address });
//         if (existingFan) {
//             return res.status(409).json({ error: "Fan already registered" });}
//         const newFan = new Fan({
//             suiAddress: address,
//             role: Role.FAN,
//             lastLogin: new Date(),
//         });
//         await newFan.save();
//         return res.status(201).json({
//             success: true,
//             fan: {
//                 id: newFan._id,
//                 suiAddress: newFan.suiAddress,
//                 role: newFan.role,
//                 lastLogin: newFan.lastLogin,
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
export const buySong = async (req, res) => {
    try {
        const { songId } = req.params;
        const { buyerAddress, userSalt, decodedJwt, partialZkLoginSignature, maxEpoch, paymentCoinId } = req.body;

        const song = await Song.findById(songId);
        if (!song) {
            return res.status(404).json({ error: "Song not found" });
        }

        const artist = await Artist.findById(song.artistId);
        if (!artist || artist.isVerified === false) {
            return res.status(400).json({ error: "Invalid or unverified artist" });
        }

        const txb = new TransactionBlock();

        txb.moveCall({
            target: "0xYourPackage::marketplace::buy_song",
            arguments: [
                txb.object(paymentCoinId),
                txb.pure(song._id.toBytes()),
                txb.pure(artist._id.toString()),
            ],
        });

    } catch (err) {
        console.error("Error buying song:", err);
        res.status(500).json({ success: false, error: "Internal server error" });
    }
};



