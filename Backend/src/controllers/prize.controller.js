import { prisma } from "../config/db.js";

const defaultPrizes = [
  {
    label: "10% OFF",
    value: 10,
    type: "percentage",
    probability: 0.25,
    color: "#FF6B6B",
  },
  {
    label: "Free Shipping",
    value: 0,
    type: "free_shipping",
    probability: 0.15,
    color: "#4ECDC4",
  },
  {
    label: "15% OFF",
    value: 15,
    type: "percentage",
    probability: 0.2,
    color: "#FFD93D",
  },
  {
    label: "Try Again",
    value: 0,
    type: "none",
    probability: 0.15,
    color: "#95E1D3",
  },
  {
    label: "20% OFF",
    value: 20,
    type: "percentage",
    probability: 0.1,
    color: "#F38181",
  },
  {
    label: "$5 OFF",
    value: 5,
    type: "fixed_amount",
    probability: 0.1,
    color: "#AA96DA",
  },
  {
    label: "25% OFF",
    value: 25,
    type: "percentage",
    probability: 0.05,
    color: "#A8E6CF",
  },
];

// Get prizes for a campaign
export async function getPrizes(req, res) {
  try {
    const { campaignId } = req.params;

    if (!campaignId) {
      return res.status(200).json({ success: true, prizes: defaultPrizes });
    }

    const prizes = await prisma.prize.findMany({
      where: { campaignId },
      orderBy: { probability: "desc" },
    });

    if (prizes.length === 0) {
      return res.status(200).json({ success: true, prizes: defaultPrizes });
    }

    res.status(200).json({ success: true, prizes });
  } catch (error) {
    console.error("Get prizes error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
}


export async function createPrize(req, res) {
  try {
    const { campaignId } = req.params;
    const { label, value, type, probability, color } = req.body;

    if (!label || probability === undefined) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: label, probability",
      });
    }


    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
    });

    if (!campaign) {
      return res
        .status(404)
        .json({ success: false, message: "Campaign not found" });
    }

    const prize = await prisma.prize.create({
      data: {
        campaignId,
        label,
        value: parseFloat(value) || 0,
        type: type || "percentage",
        probability: parseFloat(probability),
        color: color || "#667eea",
      },
    });

    res.status(201).json({ success: true, data: prize });
  } catch (error) {
    console.error("Create prize error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
}


export async function updatePrize(req, res) {
  try {
    const { prizeId } = req.params;
    const { label, value, type, probability, color } = req.body;

    const existingPrize = await prisma.prize.findUnique({
      where: { id: prizeId },
    });

    if (!existingPrize) {
      return res
        .status(404)
        .json({ success: false, message: "Prize not found" });
    }

    const prize = await prisma.prize.update({
      where: { id: prizeId },
      data: {
        label: label ?? existingPrize.label,
        value: value !== undefined ? parseFloat(value) : existingPrize.value,
        type: type ?? existingPrize.type,
        probability:
          probability !== undefined
            ? parseFloat(probability)
            : existingPrize.probability,
        color: color ?? existingPrize.color,
      },
    });

    res.status(200).json({ success: true, data: prize });
  } catch (error) {
    console.error("Update prize error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function deletePrize(req, res) {
  try {
    const { prizeId } = req.params;

    const existingPrize = await prisma.prize.findUnique({
      where: { id: prizeId },
    });

    if (!existingPrize) {
      return res
        .status(404)
        .json({ success: false, message: "Prize not found" });
    }

    await prisma.prize.delete({
      where: { id: prizeId },
    });

    res
      .status(200)
      .json({ success: true, message: "Prize deleted successfully" });
  } catch (error) {
    console.error("Delete prize error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function bulkUpdatePrizes(req, res) {
  try {
    const { campaignId } = req.params;
    const { prizes } = req.body;

    if (!Array.isArray(prizes)) {
      return res.status(400).json({
        success: false,
        message: "prizes must be an array",
      });
    }

    const totalProbability = prizes.reduce(
      (sum, p) => sum + (p.probability || 0),
      0,
    );
    if (Math.abs(totalProbability - 1) > 0.01) {
      return res.status(400).json({
        success: false,
        message: `Total probability must equal 1.0 (100%). Current: ${totalProbability}`,
      });
    }

  
    await prisma.prize.deleteMany({
      where: { campaignId },
    });

  
    const createdPrizes = await prisma.prize.createMany({
      data: prizes.map((p) => ({
        campaignId,
        label: p.label,
        value: parseFloat(p.value) || 0,
        type: p.type || "percentage",
        probability: parseFloat(p.probability),
        color: p.color || "#667eea",
      })),
    });

    res.status(200).json({
      success: true,
      message: `${createdPrizes.count} prizes updated`,
    });
  } catch (error) {
    console.error("Bulk update prizes error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
}
