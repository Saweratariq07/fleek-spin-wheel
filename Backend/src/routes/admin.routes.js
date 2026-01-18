import express from "express";
import {
  getCampaigns,
  getCampaignDetail,
  createCampaign,
  updateCampaign,
  deleteCampaign,
} from "../controllers/campaign.controller.js";
import {
  getPrizes,
  createPrize,
  updatePrize,
  deletePrize,
  bulkUpdatePrizes,
} from "../controllers/prize.controller.js";

import {
  getCampaignAnalytics,
  getShopAnalytics,
} from "../controllers/analytics.controller.js";

import prisma from "../../prismaClient.js";

const router = express.Router();


router.post("/shops/register", async (req, res) => {
  try {
    const { domain, accessToken } = req.body;

    if (!domain || !accessToken) {
      return res.status(400).json({
        success: false,
        message: "domain and accessToken are required",
      });
    }

    const normalizedDomain = domain.replace("https://", "").replace("http://", "").replace(/\/$/, "");

    const testResponse = await fetch(`https://${normalizedDomain}/admin/api/2024-01/shop.json`, {
      headers: {
        "X-Shopify-Access-Token": accessToken,
        "Content-Type": "application/json",
      },
    });

    if (!testResponse.ok) {
      const errorText = await testResponse.text();
      return res.status(400).json({
        success: false,
        message: "Invalid access token or domain",
        error: errorText,
      });
    }

    const shopData = await testResponse.json();

    const shop = await prisma.shop.upsert({
      where: { domain: normalizedDomain },
      update: { accessToken },
      create: {
        id: normalizedDomain,
        domain: normalizedDomain,
        accessToken,
      },
    });

    res.json({
      success: true,
      message: "Shop registered successfully!",
      shop: {
        id: shop.id,
        domain: shop.domain,
        name: shopData.shop?.name,
        email: shopData.shop?.email,
      },
    });
  } catch (error) {
    console.error("Shop registration error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});


router.get("/shops", async (req, res) => {
  try {
    const shops = await prisma.shop.findMany({
      select: {
        id: true,
        domain: true,
        plan: true,
        createdAt: true,
        _count: { select: { campaigns: true } },
      },
    });
    res.json({ success: true, shops });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get("/shops/:shopId/campaigns", getCampaigns);
router.post("/shops/:shopId/campaigns", createCampaign);
router.get("/campaigns/:campaignId", getCampaignDetail);
router.put("/campaigns/:campaignId", updateCampaign);
router.delete("/campaigns/:campaignId", deleteCampaign);

router.get("/campaigns/:campaignId/prizes", getPrizes);
router.post("/campaigns/:campaignId/prizes", createPrize);
router.put("/campaigns/:campaignId/prizes/bulk", bulkUpdatePrizes);
router.put("/prizes/:prizeId", updatePrize);
router.delete("/prizes/:prizeId", deletePrize);

router.get("/campaigns/:campaignId/analytics", getCampaignAnalytics);
router.get("/shops/:shopId/analytics", getShopAnalytics);

export default router;
