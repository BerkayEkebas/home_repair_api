import express from "express";
import { createOffer, getRequests, createDetails, getOneExpertDetails } from "../controllers/expertController.js";


const router = express.Router();

router.get("/get-requests",getRequests)
router.post("/get-expert-details",getOneExpertDetails)
router.post("/create-offer",createOffer)
router.post("/create-details",createDetails)


export default router;