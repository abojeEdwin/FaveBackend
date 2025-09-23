import jwt from "jsonwebtoken";
import jwt_decode from "jwt-decode";
import jwkToPem from "jwk-to-pem";
import dotenv from "dotenv";
dotenv.config();

const GOOGLE_PUBLIC_KEYS_URL = "https://www.googleapis.com/oauth2/v3/certs";

let cachedGooglePublicKeys = null;
let keysLastFetched = 0;

export function generateSessionToken(userId) {
    return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "1d" });
}

export async function getGooglePublicKeys() {
    if (cachedGooglePublicKeys && Date.now() - keysLastFetched < 3600000) {
        return cachedGooglePublicKeys;}
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

export async function verifyJWT(token) {
    try {
        const header = jwt_decode(token, { header: true });
        const publicKeys = await getGooglePublicKeys();

        const key = publicKeys.keys.find((k) => k.kid === header.kid);
        if (!key) {
            new Error("Invalid token: no matching key found");
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