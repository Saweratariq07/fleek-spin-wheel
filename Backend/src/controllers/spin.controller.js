import {
  generateDiscountCode,
  createRealShopifyDiscount,
  hasExistingDiscount,
} from "../services/discount.service.js";
import { sendDiscountEmail } from "../services/email.service.js";
import { validateEmail } from "../utils/emailValidator.js";
import {
  hasEmailSpun,
  recordSpinAttempt,
  checkSuspiciousActivity,
} from "../utils/fraudPrevention.js";
import prisma from "../../prismaClient.js";

const defaultPrizes = [
  { label: "10% OFF", value: 10, type: "percentage", probability: 0.25 },
  {
    label: "Free Shipping",
    value: 0,
    type: "free_shipping",
    probability: 0.15,
  },
  { label: "15% OFF", value: 15, type: "percentage", probability: 0.2 },
  { label: "Try Again", value: 0, type: "none", probability: 0.15 },
  { label: "20% OFF", value: 20, type: "percentage", probability: 0.1 },
  { label: "$5 OFF", value: 5, type: "fixed_amount", probability: 0.1 },
  { label: "25% OFF", value: 25, type: "percentage", probability: 0.05 },
];


function selectPrizeByProbability(prizes) {
  const random = Math.random();
  let cumulative = 0;

  for (const prize of prizes) {
    cumulative += prize.probability;
    if (random <= cumulative) {
      return prize;
    }
  }

  return prizes[prizes.length - 1];
}


export async function spinWheel(req, res) {
  try {
    const { email, shopDomain, campaignId } = req.body;
    const clientIP = req.clientIP || req.ip;
    const userAgent = req.headers["user-agent"];

    if (!email) {
      return res
        .status(400)
        .json({ success: false, message: "Email is required" });
    }

    const emailValidation = validateEmail(email);
    if (!emailValidation.valid) {
      return res.status(400).json({
        success: false,
        message: emailValidation.reason,
      });
    }

    const suspiciousCheck = checkSuspiciousActivity(clientIP, email, userAgent);
    if (suspiciousCheck.suspicious) {
      console.warn(
        `[Fraud] Suspicious activity detected: ${suspiciousCheck.reason} - IP: ${clientIP}`,
      );
      return res.status(403).json({
        success: false,
        message: "Request blocked. Please try again later.",
      });
    }

    const alreadySpun = await hasEmailSpun(email, campaignId);
    if (alreadySpun) {
      return res.status(400).json({
        success: false,
        message: "You have already spun the wheel today. Come back tomorrow!",
      });
    }

    let prizes = defaultPrizes;
    let campaign = null;

    if (campaignId) {
      campaign = await prisma.campaign.findUnique({
        where: { id: campaignId },
        include: { prizes: true, shop: true },
      });

      if (campaign && campaign.prizes.length > 0) {
        prizes = campaign.prizes;
      }

   
      if (campaign) {
        const hasDiscount = await hasExistingDiscount(email, campaignId);
        if (hasDiscount) {
          return res.status(400).json({
            success: false,
            message:
              "You have already received a discount code. Check your email!",
          });
        }
      }
    }

    recordSpinAttempt(clientIP, email, campaignId);

    const selectedPrize = selectPrizeByProbability(prizes);

    if (selectedPrize.type === "none" || selectedPrize.label === "Try Again") {
      if (campaignId) {
        await prisma.spin.create({
          data: {
            email,
            prizeWon: selectedPrize.label,
            code: null,
            campaignId,
          },
        });
      }

      return res.status(200).json({
        success: true,
        prizeWon: selectedPrize.label,
        prizeValue: 0,
        discountCode: null,
        message: "Better luck next time!",
      });
    }

  
    const shopToUse = campaign?.shop?.domain || shopDomain;

    if (!shopToUse) {
   
      const dummyCode = generateDiscountCode();

      sendDiscountEmail(email, dummyCode, selectedPrize.label).catch((err) =>
        console.error("Email send failed:", err),
      );

      return res.status(200).json({
        success: true,
        prizeWon: selectedPrize.label,
        prizeValue: selectedPrize.value,
        discountCode: dummyCode,
        message: "Discount code sent to your email!",
        isRealDiscount: false,
      });
    }

    
    const discountResult = await createRealShopifyDiscount(
      shopToUse,
      selectedPrize,
      email,
      campaignId,
    );


    if (campaignId) {
      await prisma.spin.create({
        data: {
          email,
          prizeWon: selectedPrize.label,
          code: discountResult.code,
          campaignId,
        },
      });
    }

   
    sendDiscountEmail(email, discountResult.code, selectedPrize.label).catch(
      (err) => console.error("Email send failed:", err),
    );


    res.status(200).json({
      success: true,
      prizeWon: selectedPrize.label,
      prizeValue: selectedPrize.value,
      discountCode: null, 
      message:
        "🎉 Congratulations! Your discount code has been sent to your email!",
      isRealDiscount: true,
      expiresAt: discountResult.expiresAt,
    });
  } catch (error) {
    console.error("Spin wheel error:", error);

   
    if (error.message.includes("Shop not connected")) {
      return res.status(400).json({
        success: false,
        message: "Store not configured. Please contact support.",
      });
    }

    res.status(500).json({
      success: false,
      message: "Something went wrong. Please try again later.",
    });
  }
}


export async function getCampaignPrizes(req, res) {
  try {
    const { campaignId } = req.params;

    if (!campaignId) {
      return res.status(200).json({ prizes: defaultPrizes });
    }

    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
      include: { prizes: true },
    });

    if (!campaign || !campaign.active) {
      return res
        .status(404)
        .json({ message: "Campaign not found or inactive" });
    }

    res.status(200).json({
      success: true,
      campaignName: campaign.name,
      prizes: campaign.prizes,
    });
  } catch (error) {
    console.error("Get prizes error:", error);
    res.status(500).json({ message: "Server error" });
  }
}
