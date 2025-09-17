import {verifyJWT,generateSessionToken} from "../utils/helper.js"
import Fan from "../data/models/Fan.js";
import {Ed25519Keypair} from "@mysten/sui.js/keypairs/ed25519";
import  Role from "../enum/Role.js";



export const login = async (req, res) => {
    try {
        const {idToken} = req.body;
        if (!idToken) {
            return res.status(400).json({error: "Missing idToken"});}
        const decodedToken = await verifyJWT(idToken);
        const {sub: authProviderId, email, name, picture} = decodedToken;

        let foundFan = await Fan.findOne({ authProviderId });
        if (!foundFan) {
            const keypair = new Ed25519Keypair();
            const suiAddress = keypair.getPublicKey().toSuiAddress();

            foundFan = new Fan({
                authProviderId,
                providerId: authProviderId,
                provider: decodedToken.iss,
                profile: { name, email, picture },
                role: Role.FAN,
                suiAddress,
                suiPrivateKey: keypair.getSecretKey().toString("base64"),
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

