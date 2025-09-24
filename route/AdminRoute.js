import express from "express";
import {adminVerifyArtist, adminRejectArtist, getPendingArtists} from "../controller/AdminController.js";

const router = express.Router();

router.get("/artists/pending", getPendingArtists);

router.put("/artists/:artistId/verify", adminVerifyArtist);

router.put("/artists/:artistId/reject", adminRejectArtist);

export default router;