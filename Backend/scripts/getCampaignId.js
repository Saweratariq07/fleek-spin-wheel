import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

dotenv.config();
const prisma = new PrismaClient();

async function main() {
  console.log('Connecting to database...');

  const shopId = 'demo-shop';

  let shop = await prisma.shop.findUnique({ where: { id: shopId } });
  if (!shop) {
    shop = await prisma.shop.create({
      data: { id: shopId, domain: 'demo.shop', accessToken: 'demo-token' },
    });
    console.log('✓ Created demo shop');
  }

  const campaigns = await prisma.campaign.findMany({ where: { shopId } });

  if (campaigns.length > 0) {
    console.log('\n✓ Existing campaign found');
    console.log('👉 Campaign ID:', campaigns[0].id);
    return;
  }

  // 3. Create campaign
  const campaign = await prisma.campaign.create({
    data: {
      shopId,
      name: 'Demo Spin Campaign',
      active: true,
      settings: {},
      prizes: {
        create: [
          { label: '10% OFF', value: 10, type: 'percentage', probability: 20, color: '#FF6B6B' },
          { label: 'Free Shipping', value: 0, type: 'shipping', probability: 15, color: '#4ECDC4' },
          { label: '15% OFF', value: 15, type: 'percentage', probability: 15, color: '#FFD93D' },
          { label: 'Try Again', value: 0, type: 'none', probability: 25, color: '#95E1D3' },
          { label: '20% OFF', value: 20, type: 'percentage', probability: 10, color: '#F38181' },
          { label: '$5 OFF', value: 5, type: 'fixed', probability: 10, color: '#AA96DA' },
          { label: 'Try Again', value: 0, type: 'none', probability: 5, color: '#FCBAD3' },
        ],
      },
    },
  });

  console.log('\n✓ Campaign created');
  console.log('👉 Campaign ID:', campaign.id);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
