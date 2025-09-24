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




export const login = async (req, res) => {
    try {
        const {idToken, suiAddress, suiPrivateKey} = req.body;
        if (!idToken || !suiAddress || !suiPrivateKey) {
            return res.status(400).json({error: "Missing authentication information"});}
        const decodedToken = await verifyJWT(idToken);
        const {sub: authProviderId, email, name, picture} = decodedToken;

        let foundFan = await Fan.findOne({ providerId: authProviderId });
        if (!foundFan) {
            foundFan = new Fan({
                authProviderId,
                providerId: authProviderId,
                provider: decodedToken.iss,
                profile: { name, email, picture },
                role: Role.FAN,
                suiAddress,
                suiPrivateKey,
                createdAt: new Date(),
            });
            await foundFan.save();
        } else {
            foundFan.lastLogin = new Date();
            await foundFan.save();
        }
        const sessionToken = generateSessionToken(foundFan._id);
        res.json({
            success: true,
            sessionToken,
            artist: {
                id: foundFan._id,
                suiAddress: foundFan.suiAddress,
                profile: foundFan.profile,
            },
        });
    }catch(error){
        console.error("zkLogin authentication error:", error);
        res.status(401).json({success: false, error: error.message});
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
                txb.pure(song._id.toString()),
                txb.pure(artist._id.toString()),
            ],
        });

    } catch (err) {
        console.error("Error buying song:", err);
        res.status(500).json({ success: false, error: "Internal server error" });
    }
};



