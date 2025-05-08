import express from "express";
import { createRequests, deleteRequest, getOffersByRequestId, getRequests } from "../controllers/customerController.js";

const router = express.Router();

router.post("/get-requests",getRequests)
router.post("/create-request",createRequests)
router.post("/delete-request",deleteRequest)
router.get("/get-offer/:request_id",getOffersByRequestId)



export default router;