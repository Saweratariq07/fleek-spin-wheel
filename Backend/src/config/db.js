import dotenv from "dotenv";

dotenv.config();

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const connectDB = async (retries = 3) => {
  for (let i = 0; i < retries; i++) {
    try {
      await prisma.$connect();
      console.log("Prisma connected");
      return;
    } catch (err) {
      console.error(
        `Prisma connection attempt ${i + 1}/${retries} failed:`,
        err.message,
      );

      if (i < retries - 1) {
        console.log(`Retrying in 3 seconds...`);
        await new Promise((resolve) => setTimeout(resolve, 3000));
      } else {
        console.error(
          "All connection attempts failed. Check your DATABASE_URL in .env",
        );
        console.error(
          "The Prisma Data Platform (db.prisma.io) might be down or your credentials expired.",
        );
        console.error("\nAlternatives:");
        console.error("1. Use Neon.tech (free): https://neon.tech");
        console.error("2. Use Supabase (free): https://supabase.com");
        console.error("3. Use local PostgreSQL");
      
      }
    }
  }
};

export { prisma };
export default connectDB;
