import express from "express";
import {login, buySong, viewListedSongs, viewArtistProfile} from "../controller/FanController.js";

const router = express.Router();

router.post("/login", login);
router.post("/buySong", buySong);
router.get("/listedSongs", viewListedSongs);
router.get("/artistProfile/:artistId", viewArtistProfile);

export default router;