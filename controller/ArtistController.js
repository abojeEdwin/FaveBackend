import verifyJWT from "../utils/helper.js"
import Artist from "../data/models/Artist";
import Ed25519Keypair from "@mysten/sui.js/keypairs/ed25519";
import Role from "../enum/Role";
import Status from "../enum/Status";
import {generateSessionToken} from "../utils/helper";




export const login = async (req, res) => {
    try {
        const {idToken} = req.body;
        if (!idToken) {
            return res.status(400).json({error: "Missing idToken"});}
        const decodedToken = await verifyJWT.verifyJWT(idToken);
        const {sub: authProviderId, email, name, picture} = decodedToken;

        let foundArtist = await Artist.findOne({authProviderId});
        if (!foundArtist) {
            const keypair = new Ed25519Keypair();
            const suiAddress = keypair.getPublicKey().toSuiAddress();
            let artist = new Artist({
                suiAddress: suiAddress,
                authProviderId: authProviderId,
                authProvider: "google",
                profile: {name, email, picture},
                role: Role.ARTIST,
                distributorLink: "",
                nin: "",
                isVerified: false,
                verificationStatus: Status.PENDING,
                suiPrivateKey: keypair.getSecretKey().toString("base64"),
            });
            await artist.save();
        }else{
            foundArtist.lastLogin = new Date();
            await artist.save();
        }
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

}
