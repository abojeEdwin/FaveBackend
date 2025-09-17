import {verifyJWT,generateSessionToken} from "../utils/helper.js"
import Artist from "../data/models/Artist.js";
import {Ed25519Keypair} from "@mysten/sui.js/keypairs/ed25519";
import  Role from "../enum/Role.js";
import Status from "../enum/Status.js";


export const login = async (req, res) => {
    try {
        const {idToken} = req.body;
        if (!idToken) {
            return res.status(400).json({error: "Missing idToken"});}
        const decodedToken = await verifyJWT(idToken);
        const {sub: authProviderId, email, name, picture} = decodedToken;

        let foundArtist = await Artist.findOne({ authProviderId });
        if (!foundArtist) {
            const keypair = new Ed25519Keypair();
            const suiAddress = keypair.getPublicKey().toSuiAddress();

            foundArtist = new Artist({
                authProviderId,
                providerId: authProviderId,
                provider: decodedToken.iss,
                profile: { name, email, picture },
                role: Role.ARTIST,
                distributorLink: "",
                nin: "",
                isVerified: false,
                verificationStatus: Status.PENDING,
                suiAddress,
                suiPrivateKey: keypair.getSecretKey().toString("base64"),
                createdAt: new Date(),
            });
            await foundArtist.save();
        } else {
            foundArtist.lastLogin = new Date();
            await foundArtist.save();}
        const sessionToken = generateSessionToken(foundArtist._id);
        res.json({
            success: true,
            sessionToken,
            artist: {
                id: foundArtist._id,
                suiAddress: foundArtist.suiAddress,
                profile: foundArtist.profile,
            },
        });
    }catch(error){
        console.error("zkLogin authentication error:", error);
        res.status(401).json({success: false, error: error.message});
    }
};

export const verifyArtist = async (req, res) => {
    try {
        const {artistId} = req.params;
        const {nin, distributorLink} = req.body;

        if (!nin || !distributorLink) {
            return res.status(400).json({error: "NIN and distributor link are required"});
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

}

export default {login, verifyArtist};

