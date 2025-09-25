import express from 'express';
import {signup, verifyArtist, listSong} from "../controller/ArtistController.js";
const router = express.Router();

router.post('/signUp/Artist', signup)
router.post('/verifyArtist',verifyArtist)
router.post('/:artistId/listSong', listSong)

export default router;

