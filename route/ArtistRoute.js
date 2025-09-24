// route/ArtistRoute.js
import express from 'express';
import {login, verifyArtist, listSong} from "../controller/ArtistController.js";
const router = express.Router();

router.post('/verifyArtist',verifyArtist)
router.post('/:artistId/listSong', listSong)

export default router;