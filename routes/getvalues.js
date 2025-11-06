import express from "express";
import { postRoomStatus, postRoomStatusTest } from "../controllers/getValues.js";

const router = express.Router();



// POST endpoint (IoT cihazlar buraya veri gönderecek)
router.post("/", postRoomStatusTest);
router.post("/save", postRoomStatus);

export default router;