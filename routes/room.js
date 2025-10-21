import express from "express";
import { createRequests, deleteRequest, getOffersByRequestId, getRequests, getRoomStatusById } from "../controllers/roomController.js";

const router = express.Router();

router.post("/getRoomStatus/:user_id",getRoomStatusById)
router.post("/create-request",createRequests)
router.post("/delete-request",deleteRequest)
router.get("/get-offer/:request_id",getOffersByRequestId)



export default router;