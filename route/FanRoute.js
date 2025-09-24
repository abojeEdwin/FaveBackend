// route/FanRoute.js
import express from "express";
import {login, buySong} from "../controller/FanController.js";

const router = express.Router();

router.post("/login", login);
//router.post("/buySong", buySong);
export default router;