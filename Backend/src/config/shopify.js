import "@shopify/shopify-api/adapters/node";
import { shopifyApi, ApiVersion } from "@shopify/shopify-api";
import dotenv from "dotenv";

dotenv.config();

const shopify = shopifyApi({
  apiKey: process.env.SHOPIFY_API_KEY,
  apiSecretKey: process.env.SHOPIFY_API_SECRET,
  scopes: process.env.SHOPIFY_SCOPES?.split(",") || [
    "read_products",
    "write_discounts",
    "read_discounts",
  ],
  hostName: process.env.SHOPIFY_HOST || "localhost:5000",
  apiVersion: ApiVersion.January25,
  isEmbeddedApp: true,
});

export default shopify;
