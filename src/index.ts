import { fetchAndStore } from './services/fetchAndStore';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
console.log('▶️ Starting RPO import…');

async function main() {
  const cities = ['Košice', 'Prešov', 'Bardejov'];
  for (const city of cities) {
    console.log(`Fetching data for city: ${city}`);
    await fetchAndStore(city, prisma);
  }
  console.log('✅ Import completed.');
}

main()
  .then(() => console.log('🎉 Script finished successfully.'))
  .catch(e => {
    console.error('❌ Error during import:', e instanceof Error ? e.message : e);
    if (e instanceof Error && e.stack) console.error(e.stack);
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect();
  });
