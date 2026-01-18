import express from "express";
import {
  spinWheel,
  getCampaignPrizes,
} from "../controllers/spin.controller.js";
import { spinLimiter } from "../utils/rateLimiter.js";

const router = express.Router();

router.post("/spin", spinWheel);

router.get("/prizes/:campaignId", getCampaignPrizes);
router.get("/prizes", getCampaignPrizes);

export default router;
