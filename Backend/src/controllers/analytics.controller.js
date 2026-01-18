import { prisma } from "../config/db.js";

export async function getCampaignAnalytics(req, res) {
  try {
    const { campaignId } = req.params;
    const { days = 30 } = req.query;

    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
    });

    if (!campaign) {
      return res.status(404).json({ success: false, message: "Campaign not found" });
    }

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    const spins = await prisma.spin.findMany({
      where: {
        campaignId,
        createdAt: { gte: startDate },
      },
      orderBy: { createdAt: "asc" },
    });

  
    const discountCodes = await prisma.discountCode.findMany({
      where: {
        campaignId,
        claimedAt: { gte: startDate },
      },
    });

    const totalSpins = spins.length;
    const uniqueEmails = new Set(spins.map((s) => s.email)).size;
    const claimedCodes = discountCodes.length;
    const conversionRate =
      totalSpins > 0 ? ((claimedCodes / totalSpins) * 100).toFixed(2) : 0;

    // Group spins by day
    const spinsByDay = {};
    spins.forEach((spin) => {
      const date = spin.createdAt.toISOString().split("T")[0];
      spinsByDay[date] = (spinsByDay[date] || 0) + 1;
    });

    // Most won prizes
    const prizeStats = {};
    spins.forEach((spin) => {
      prizeStats[spin.prizeWon] = (prizeStats[spin.prizeWon] || 0) + 1;
    });

    const topPrizes = Object.entries(prizeStats)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    res.status(200).json({
      success: true,
      data: {
        metrics: {
          totalSpins,
          uniqueEmails,
          claimedCodes,
          conversionRate: `${conversionRate}%`,
          dateRange: {
            from: startDate.toISOString().split("T")[0],
            to: new Date().toISOString().split("T")[0],
          },
        },
        spinsByDay,
        topPrizes,
      },
    });
  } catch (error) {
    console.error("Get analytics error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function getShopAnalytics(req, res) {
  try {
    const { shopId } = req.params;

    const campaigns = await prisma.campaign.findMany({
      where: { shopId },
      select: { id: true },
    });

    const campaignIds = campaigns.map((c) => c.id);

    if (campaignIds.length === 0) {
      return res.status(200).json({
        success: true,
        data: {
          totalSpins: 0,
          totalCampaigns: 0,
          totalRevenue: 0,
          campaignMetrics: [],
        },
      });
    }

    const totalSpins = await prisma.spin.count({
      where: { campaignId: { in: campaignIds } },
    });

    const totalCodes = await prisma.discountCode.count({
      where: { campaignId: { in: campaignIds } },
    });

    const claimedCodes = await prisma.discountCode.count({
      where: {
        campaignId: { in: campaignIds },
        claimed: true,
      },
    });

    const campaignMetrics = await Promise.all(
      campaigns.map(async (campaign) => {
        const spins = await prisma.spin.count({
          where: { campaignId: campaign.id },
        });
        const codes = await prisma.discountCode.count({
          where: { campaignId: campaign.id },
        });
        return {
          campaignId: campaign.id,
          spins,
          codes,
        };
      })
    );

    res.status(200).json({
      success: true,
      data: {
        totalSpins,
        totalCodes,
        claimedCodes,
        conversionRate: totalSpins > 0 ? ((claimedCodes / totalSpins) * 100).toFixed(2) : 0,
        totalCampaigns: campaigns.length,
        campaignMetrics,
      },
    });
  } catch (error) {
    console.error("Get shop analytics error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
}
