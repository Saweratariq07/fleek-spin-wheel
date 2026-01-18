import shopify from "../config/shopify.js";

export async function createShopifyDiscount(shop, accessToken, discountData) {
  const {
    code,
    discountType = "percentage", 
    discountValue,
    title,
    startsAt = new Date().toISOString(),
    endsAt = null,
    usageLimit = 1,
    appliesOncePerCustomer = true,
  } = discountData;

  const client = new shopify.clients.Graphql({
    session: { shop, accessToken },
  });

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
      title: title || `Spin Wheel - ${code}`,
      code,
      startsAt,
      endsAt,
      usageLimit,
      appliesOncePerCustomer,
      customerSelection: {
        all: true,
      },
      customerGets: {
        value:
          discountType === "percentage"
            ? { percentage: discountValue / 100 }
            : {
                discountAmount: { amount: discountValue, currencyCode: "USD" },
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
      throw new Error(result.userErrors.map((e) => e.message).join(", "));
    }

    return result.codeDiscountNode;
  } catch (error) {
    console.error("Error creating Shopify discount:", error);
    throw error;
  }
}


export async function verifyShopifyWebhook(rawBody, hmacHeader) {
  const crypto = (await import("crypto")).default;
  const hash = crypto
    .createHmac("sha256", process.env.SHOPIFY_API_SECRET)
    .update(rawBody, "utf8")
    .digest("base64");

  return hash === hmacHeader;
}


export async function getShopInfo(shop, accessToken) {
  const client = new shopify.clients.Rest({ session: { shop, accessToken } });

  try {
    const response = await client.get({ path: "shop" });
    return response.body.shop;
  } catch (error) {
    console.error("Error fetching shop info:", error);
    throw error;
  }
}


export async function listDiscounts(shop, accessToken) {
  const client = new shopify.clients.Graphql({
    session: { shop, accessToken },
  });

  const query = `
    query {
      codeDiscountNodes(first: 50) {
        nodes {
          id
          codeDiscount {
            ... on DiscountCodeBasic {
              title
              status
              codes(first: 1) {
                nodes {
                  code
                }
              }
              startsAt
              endsAt
            }
          }
        }
      }
    }
  `;

  try {
    const response = await client.query({ data: query });
    return response.body.data.codeDiscountNodes.nodes;
  } catch (error) {
    console.error("Error listing discounts:", error);
    throw error;
  }
}

export default {
  createShopifyDiscount,
  verifyShopifyWebhook,
  getShopInfo,
  listDiscounts,
};
