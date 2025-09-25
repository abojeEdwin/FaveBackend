import express from 'express';
import {login, verifyArtist, listSong} from "../controller/ArtistController.js";
const router = express.Router();

router.post('/login/Artist', login)
router.post('/verifyArtist',verifyArtist)
router.post('/:artistId/listSong', listSong)

export default router;

