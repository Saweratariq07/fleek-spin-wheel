import shopify from "../config/shopify.js";
import prisma from "../../prismaClient.js";


export function generateDiscountCode() {
  return "SPIN-" + Math.random().toString(36).substring(2, 8).toUpperCase();
}


export async function createRealShopifyDiscount(
  shopDomain,
  prizeData,
  email,
  campaignId,
) {
  const shop = await prisma.shop.findUnique({
    where: { domain: shopDomain },
  });

  if (!shop) {
    throw new Error(
      "Shop not connected. Please install the Shopify app first.",
    );
  }

  const code = generateDiscountCode();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7); 

  const isPercentage =
    prizeData.type === "percentage" || prizeData.label.includes("%");
  const isFreeShipping = prizeData.label
    .toLowerCase()
    .includes("free shipping");

  let discountValue = prizeData.value;
  if (isPercentage && discountValue > 1) {
    discountValue = discountValue / 100; 
  }

  const client = new shopify.clients.Graphql({
    session: { shop: shopDomain, accessToken: shop.accessToken },
  });

  if (isFreeShipping) {
    return await createFreeShippingDiscount(
      client,
      code,
      email,
      expiresAt,
      campaignId,
    );
  }

  const mutation = `
    mutation discountCodeBasicCreate($basicCodeDiscount: DiscountCodeBasicInput!) {
      discountCodeBasicCreate(basicCodeDiscount: $basicCodeDiscount) {
        codeDiscountNode {
          id
          codeDiscount {
            ... on DiscountCodeBasic {
              title
              codes(first: 1) {
                nodes {
                  code
                }
              }
              startsAt
              endsAt
              status
            }
          }
        }
        userErrors {
          field
          code
          message
        }
      }
    }
  `;

  const variables = {
    basicCodeDiscount: {
      title: `Spin Wheel - ${prizeData.label}`,
      code,
      startsAt: new Date().toISOString(),
      endsAt: expiresAt.toISOString(),
      usageLimit: 1,
      appliesOncePerCustomer: true,
      customerSelection: {
        all: true,
      },
      customerGets: {
        value: isPercentage
          ? { percentage: discountValue }
          : {
              discountAmount: {
                amount: String(discountValue),
                currencyCode: "USD",
              },
            },
        items: {
          all: true,
        },
      },
    },
  };

  try {
    const response = await client.query({
      data: { query: mutation, variables },
    });

    const result = response.body.data.discountCodeBasicCreate;

    if (result.userErrors && result.userErrors.length > 0) {
      console.error("Shopify discount creation errors:", result.userErrors);
      throw new Error(result.userErrors.map((e) => e.message).join(", "));
    }

    await prisma.discountCode.create({
      data: {
        code,
        email,
        campaignId,
        expiresAt,
        claimed: false,
      },
    });

    return {
      code,
      shopifyId: result.codeDiscountNode?.id,
      expiresAt,
      title: `Spin Wheel - ${prizeData.label}`,
    };
  } catch (error) {
    console.error("Error creating Shopify discount:", error);
    throw error;
  }
}

async function createFreeShippingDiscount(
  client,
  code,
  email,
  expiresAt,
  campaignId,
) {
  const mutation = `
    mutation discountCodeFreeShippingCreate($freeShippingCodeDiscount: DiscountCodeFreeShippingInput!) {
      discountCodeFreeShippingCreate(freeShippingCodeDiscount: $freeShippingCodeDiscount) {
        codeDiscountNode {
          id
          codeDiscount {
            ... on DiscountCodeFreeShipping {
              title
              codes(first: 1) {
                nodes {
                  code
                }
              }
              startsAt
              endsAt
              status
            }
          }
        }
        userErrors {
          field
          code
          message
        }
      }
    }
  `;

  const variables = {
    freeShippingCodeDiscount: {
      title: `Spin Wheel - Free Shipping`,
      code,
      startsAt: new Date().toISOString(),
      endsAt: expiresAt.toISOString(),
      usageLimit: 1,
      appliesOncePerCustomer: true,
      customerSelection: {
        all: true,
      },
      destination: {
        all: true,
      },
    },
  };

  try {
    const response = await client.query({
      data: { query: mutation, variables },
    });

    const result = response.body.data.discountCodeFreeShippingCreate;

    if (result.userErrors && result.userErrors.length > 0) {
      throw new Error(result.userErrors.map((e) => e.message).join(", "));
    }

    await prisma.discountCode.create({
      data: {
        code,
        email,
        campaignId,
        expiresAt,
        claimed: false,
      },
    });

    return {
      code,
      shopifyId: result.codeDiscountNode?.id,
      expiresAt,
      title: "Spin Wheel - Free Shipping",
    };
  } catch (error) {
    console.error("Error creating free shipping discount:", error);
    throw error;
  }
}


export async function hasExistingDiscount(email, campaignId) {
  const existingCode = await prisma.discountCode.findFirst({
    where: {
      email,
      campaignId,
      expiresAt: { gt: new Date() },
    },
  });
  return existingCode !== null;
}


export async function markDiscountClaimed(code) {
  return prisma.discountCode.update({
    where: { code },
    data: {
      claimed: true,
      claimedAt: new Date(),
    },
  });
}
