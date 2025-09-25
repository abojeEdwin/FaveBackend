// route/FanRoute.js
import express from "express";
import {signup, buySong} from "../controller/FanController.js";

const router = express.Router();

router.post("/signUp/Fan", signup);
router.post("/buySong", buySong);
export default router;