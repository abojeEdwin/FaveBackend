import express from 'express';
import {login, verifyArtist} from "../controller/ArtistController.js";
const router = express.Router();

router.post('/login',login);
router.post('/verifyArtist',verifyArtist)

export default router;
