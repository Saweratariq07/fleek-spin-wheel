import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  await prisma.prize.createMany({
    data: [
      { label: "10% OFF", value: 10, probability: 20 },
      { label: "Free Shipping", value: 0, probability: 15 },
      { label: "15% OFF", value: 15, probability: 15 },
      { label: "Try Again", value: 0, probability: 25 },
      { label: "20% OFF", value: 20, probability: 10 },
      { label: "$5 OFF", value: 5, probability: 10 },
      { label: "25% OFF", value: 25, probability: 5 },
    ],
  });
  console.log("✅ Prizes seeded!");
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
