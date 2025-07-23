import axios, { AxiosError } from 'axios';
import { PrismaClient } from '@prisma/client';
import { RPOCompany } from '../types/rpo';


const MAX_RETRIES = 5;
const INITIAL_DELAY_MS = 1000;

export async function fetchAndStore(city: string, prisma: PrismaClient) {
  let attempt = 0;
  let delay = INITIAL_DELAY_MS;
  while (attempt < MAX_RETRIES) {
    try {
      const params = {
        addressMunicipality: city,
        establishmentAfter: '2016-01-01',
        establishmentBefore: '2016-12-31'
      };
      const response = await axios.get('https://api.statistics.sk/rpo/v1/search', { params });
      const companies = response.data.results as RPOCompany[];

      for (const c of companies) {
        const rpoId = c.id as number;
        const icoEntry = c.identifiers?.[0];
        const nameEntry = c.fullNames?.[0];
        const addrEntry =
            c.addresses?.find((a: any) => a.municipality.value.includes(city))
            ?? c.addresses?.[0];
        if (!icoEntry || !nameEntry || !addrEntry) continue;

        const ico = icoEntry.value as string;
        const name = nameEntry.value as string;
        const municipality = addrEntry.municipality.value as string;
        const establishment = new Date(c.establishment as string);
        const termination = c.termination ? new Date(c.termination as string) : null;

        await prisma.company.upsert({
          where: { ico },
          update: { rpoId, name, municipality, establishment, termination },
          create: { rpoId, ico, name, municipality, establishment, termination }
        });
      }
      // ak úspešné, prerušíme cyklus retry
      return;
    } catch (err) {
      const error = err as AxiosError;
      if (error.response?.status === 429) {
        const retryAfter = error.response.headers['retry-after'];
        const waitSec = retryAfter ? parseInt(retryAfter, 10) : delay / 1000;
        console.warn(`Rate limited. Čakám ${waitSec}s pred ďalším pokusom...`);
        await new Promise(res => setTimeout(res, waitSec * 1000));
        attempt++;
        delay *= 2;
        continue;
      }
      // pri iných chybách hádžeme
      throw err;
    }
  }
  throw new Error(`Nepodarilo sa načítať dáta pre mesto ${city} po ${MAX_RETRIES} pokusoch.`);
}