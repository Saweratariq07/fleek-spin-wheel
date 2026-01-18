import { prisma } from "../config/db.js";


export async function getCampaigns(req, res) {
  try {
    const { shopId } = req.params;

    const campaigns = await prisma.campaign.findMany({
      where: { shopId },
      include: {
        prizes: true,
        _count: {
          select: { spins: true, discountCodes: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    res.status(200).json({ success: true, data: campaigns });
  } catch (error) {
    console.error("Get campaigns error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
}


export async function getCampaignDetail(req, res) {
  try {
    const { campaignId } = req.params;

    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
      include: {
        prizes: true,
        spins: {
          take: 50,
          orderBy: { createdAt: "desc" },
        },
        discountCodes: {
          take: 50,
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!campaign) {
      return res.status(404).json({ success: false, message: "Campaign not found" });
    }


    const stats = {
      totalSpins: await prisma.spin.count({ where: { campaignId } }),
      totalCodesGenerated: await prisma.discountCode.count({ where: { campaignId } }),
      claimedCodes: await prisma.discountCode.count({
        where: { campaignId, claimed: true },
      }),
      conversionRate: 0,
    };

    stats.conversionRate =
      stats.totalSpins > 0
        ? ((stats.claimedCodes / stats.totalSpins) * 100).toFixed(2)
        : 0;

    res.status(200).json({
      success: true,
      data: campaign,
      stats,
    });
  } catch (error) {
    console.error("Get campaign detail error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
}


export async function createCampaign(req, res) {
  try {
    const { shopId, name, settings } = req.body;

    if (!shopId || !name) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: shopId, name",
      });
    }

    const campaign = await prisma.campaign.create({
      data: {
        shopId,
        name,
        active: true,
        settings: settings || {
          colors: {
            wheelBg: "#667eea",
            textColor: "#ffffff",
          },
          animations: {
            spinDuration: 5,
            confetti: true,
          },
        },
      },
    });

    res.status(201).json({ success: true, data: campaign });
  } catch (error) {
    console.error("Create campaign error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
}


export async function updateCampaign(req, res) {
  try {
    const { campaignId } = req.params;
    const { name, active, settings } = req.body;

    const campaign = await prisma.campaign.update({
      where: { id: campaignId },
      data: {
        ...(name && { name }),
        ...(active !== undefined && { active }),
        ...(settings && { settings }),
      },
    });

    res.status(200).json({ success: true, data: campaign });
  } catch (error) {
    console.error("Update campaign error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
}


export async function deleteCampaign(req, res) {
  try {
    const { campaignId } = req.params;

   
    await prisma.prize.deleteMany({ where: { campaignId } });
    await prisma.discountCode.deleteMany({ where: { campaignId } });
    await prisma.spin.deleteMany({ where: { campaignId } });

    await prisma.campaign.delete({ where: { id: campaignId } });

    res.status(200).json({
      success: true,
      message: "Campaign deleted successfully",
    });
  } catch (error) {
    console.error("Delete campaign error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
}
