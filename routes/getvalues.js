import express from "express";
import { postRoomStatus } from "../controllers/getValues";

const router = express.Router();



// POST endpoint (IoT cihazlar buraya veri gönderecek)
router.post("/", postRoomStatus);

export default router;