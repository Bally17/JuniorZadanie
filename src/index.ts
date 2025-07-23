import { fetchAndStore } from './services/fetchAndStore';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
console.log('▶️ Spúšťam import RPO …');

async function main() {
  const cities = ['Košice', 'Prešov', 'Bardejov'];
  for (const city of cities) {
    console.log(`Fetching for city: ${city}`);
    await fetchAndStore(city, prisma);
  }
  console.log('Import dokončený.');
}

main()
  .then(() => console.log('🎉 Skript dokončený.'))
  .catch(e => {
    console.error('❌ Chyba pri importe:', e instanceof Error ? e.message : e);
    if (e instanceof Error && e.stack) console.error(e.stack);
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect();
  });

