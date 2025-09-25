import express from "express";
import {login, buySong} from "../controller/FanController.js";

const router = express.Router();

router.post("/signUp/Fan", login);
router.post("/buySong", buySong);
export default router;