import {generateSessionToken,verifyJWT} from "../utils/helper";
import Fan from "../data/models/Fan";
import {Ed25519Keypair} from "@mysten/sui.js/keypairs/ed25519";
import Role from "../enum/Role";

export const login = async (req, res) => {

    try{
        const {idToken} = req.body;
        if (!idToken) {
            return res.status(400).json({error: "Missing idToken"});}
        const decodedToken = await verifyJWT.verifyJWT(idToken);
        const {sub: authProviderId, email, name, picture} = decodedToken;

        let foundFan = await Fan.findOne({authProviderId});
        if (!foundFan) {
            const keyPair = new Ed25519Keypair();
            const suiAddress = keyPair.getPublicKey().toSuiAddress();
            const fan = new Fan({
                suiAddress: suiAddress,
                authProviderId: authProviderId,
                authProvider: "google",
                profile: { name, email, picture },
                role: Role.FAN,
                suiPrivateKey: keyPair.getSecretKey().toString("base64"),
            })
            await Fan.save();
        } else{
            foundFan.lastLogin = new Date();
            await Fan.save()
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
}catch (error) {
        console.error("zkLogin authentication error:", error);
        res.status(401).json({ success: false, error: error.message });
    }
}