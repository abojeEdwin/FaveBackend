import express from 'express';
import {login, verifyArtist, listSong} from "../controller/ArtistController.js";
const router = express.Router();

// Google (or any OAuth provider) will redirect here after login
// Example redirect URI: https://your-domain.com/oauth/callback
router.get("/callback", async (req, res) => {
    try {
        // Providers usually send token in query or hash fragment
        // e.g., https://your-domain.com/oauth/callback?idToken=XYZ
        const { idToken } = req.query;

        if (!idToken) {
            return res.status(400).json({ error: "Missing idToken from provider" });
        }

        // Forward the idToken to your login controller
        // Wrap in a fake req/res to reuse your login function
        req.body = { idToken }; // adjust depending on your login controller
        return login(req, res);

    } catch (err) {
        console.error("OAuth callback error:", err);
        res.status(500).json({ error: "OAuth callback failed" });
    }
});


router.post('/verifyArtist',verifyArtist)
router.post('/:artistId/listSong', listSong)

export default router;