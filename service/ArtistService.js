import jwt from "jsonwebtoken";
import  jwtDecode  from "jwt-decode";
import Ed25519Keypair  from "@mysten/sui.js/keypairs/ed25519";
import jwkToPem from "jwk-to-pem";
import dotenv from "dotenv";
import Artist from "../data/models/Artist";
import artist from "../data/models/Artist";
import Role from "../enum/Role";
import Status from "../enum/Status";
dotenv.config();

const GOOGLE_PUBLIC_KEYS_URL = "https://www.googleapis.com/oauth2/v3/certs";

let cachedGooglePublicKeys = null;
let keysLastFetched = 0;

async function getGooglePublicKeys() {
    if (cachedGooglePublicKeys && Date.now() - keysLastFetched < 3600000) {
        return cachedGooglePublicKeys;
    }

    try {
        const response = await fetch(GOOGLE_PUBLIC_KEYS_URL);
        const data = await response.json();
        cachedGooglePublicKeys = data;
        keysLastFetched = Date.now();
        return data;
    } catch (error) {
        console.error("Error fetching Google public keys:", error);
        throw new Error("Could not verify authentication token");
    }
}

async function verifyJWT(token) {
    try {
        const header = jwtDecode(token, { header: true });
        const publicKeys = await getGooglePublicKeys();

        const key = publicKeys.keys.find((k) => k.kid === header.kid);
        if (!key) {
            throw new Error("Invalid token: no matching key found");
        }

        const pem = jwkToPem(key);

        const decoded = jwt.verify(token, pem, {
            algorithms: ["RS256"],
            audience: process.env.GOOGLE_CLIENT_ID,
            issuer: ["https://accounts.google.com", "accounts.google.com"],
        });

        return decoded;
    } catch (error) {
        console.error("JWT verification failed:", error);
        throw new Error("Invalid authentication token");
    }
}

function generateSessionToken(userId) {
    return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "7d" });
}

export const login = async (req, res) => {
    try {
        const { idToken } = req.body;

        if (!idToken) {
            return res.status(400).json({ error: "Missing idToken" });
        }

        const decodedToken = await verifyJWT(idToken);

        const { sub: authProviderId, email, name, picture } = decodedToken;
        let foundArtist = await Artist.findOne({ authProviderId });

        if (!foundArtist) {
            const keypair = new Ed25519Keypair();
            const suiAddress = keypair.getPublicKey().toSuiAddress();
            artist = new Artist({
                suiAddress: suiAddress,
                authProviderId: authProviderId,
                authProvider: "google",
                profile: { name, email, picture },
                role: Role.ARTIST,
                distributorLink: "",
                nin: "",
                isVerified: false,
                verificationStatus: Status.PENDING,
                suiPrivateKey: keypair.getSecretKey().toString("base64"),
            });
            await Artist.save();
        } else {
            foundArtist.lastLogin = new Date();
            await Artist.save();
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
    } catch (error) {
        console.error("zkLogin authentication error:", error);
        res.status(401).json({ success: false, error: error.message });
    }
}