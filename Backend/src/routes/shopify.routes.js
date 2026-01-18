import express from "express";
import shopify from "../config/shopify.js";
import {
  createShopifyDiscount,
  getShopInfo,
} from "../services/shopify.service.js";
import prisma from "../../prismaClient.js";

const router = express.Router();

const sessions = new Map();


router.get("/auth", async (req, res) => {
  const { shop } = req.query;

  if (!shop) {
    return res.status(400).json({ error: "Missing shop parameter" });
  }

  try {
    const authRoute = await shopify.auth.begin({
      shop,
      callbackPath: "/api/shopify/auth/callback",
      isOnline: false,
      rawRequest: req,
      rawResponse: res,
    });
  } catch (error) {
    console.error("Auth error:", error);
    res.status(500).json({ error: "Failed to start authentication" });
  }
});


router.get("/auth/callback", async (req, res) => {
  try {
    const callback = await shopify.auth.callback({
      rawRequest: req,
      rawResponse: res,
    });

    const { session } = callback;

    sessions.set(session.shop, session);

    await prisma.shop.upsert({
      where: { domain: session.shop },
      update: {
        accessToken: session.accessToken,
        updatedAt: new Date(),
      },
      create: {
        id: session.shop,
        domain: session.shop,
        accessToken: session.accessToken,
      },
    });

    res.redirect(`/api/shopify/success?shop=${session.shop}`);
  } catch (error) {
    console.error("Callback error:", error);
    res.status(500).json({ error: "Failed to complete authentication" });
  }
});

router.get("/success", async (req, res) => {
  const { shop } = req.query;

  try {
    const shopRecord = await prisma.shop.findUnique({
      where: { domain: shop },
    });

    if (!shopRecord) {
      return res.status(404).json({ error: "Shop not found" });
    }

    const shopInfo = await getShopInfo(shop, shopRecord.accessToken);

    res.json({
      success: true,
      message: "Shopify app installed successfully!",
      shop: {
        name: shopInfo.name,
        domain: shopInfo.domain,
        email: shopInfo.email,
      },
    });
  } catch (error) {
    console.error("Error fetching shop info:", error);
    res.json({
      success: true,
      message:
        "App installed! Configure your spin wheel in the admin dashboard.",
    });
  }
});


router.post("/discount", async (req, res) => {
  const { shop, code, discountType, discountValue, title } = req.body;

  if (!shop || !code || !discountValue) {
    return res.status(400).json({
      error: "Missing required fields: shop, code, discountValue",
    });
  }

  try {
    const shopRecord = await prisma.shop.findUnique({
      where: { domain: shop },
    });

    if (!shopRecord) {
      return res
        .status(404)
        .json({ error: "Shop not connected. Please install the app first." });
    }

    const discount = await createShopifyDiscount(shop, shopRecord.accessToken, {
      code,
      discountType: discountType || "percentage",
      discountValue: parseFloat(discountValue),
      title,
    });

    res.json({
      success: true,
      discount,
    });
  } catch (error) {
    console.error("Error creating discount:", error);
    res.status(500).json({ error: error.message });
  }
});


router.get("/shop/:domain", async (req, res) => {
  const { domain } = req.params;

  try {
    const shopRecord = await prisma.shop.findUnique({
      where: { domain: domain },
    });

    if (!shopRecord) {
      return res.status(404).json({ error: "Shop not found" });
    }

    const shopInfo = await getShopInfo(domain, shopRecord.accessToken);

    res.json({
      success: true,
      shop: shopInfo,
    });
  } catch (error) {
    console.error("Error fetching shop:", error);
    res.status(500).json({ error: error.message });
  }
});


router.post(
  "/webhooks/app-uninstalled",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    const hmac = req.get("X-Shopify-Hmac-SHA256");
    const shop = req.get("X-Shopify-Shop-Domain");

   
    try {
      await prisma.shop.delete({
        where: { domain: shop },
      });

      console.log(`Shop ${shop} uninstalled the app`);
      res.status(200).send("OK");
    } catch (error) {
      console.error("Error handling uninstall webhook:", error);
      res.status(500).send("Error");
    }
  },
);

export default router;
