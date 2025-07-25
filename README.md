# Projekt: Správa firemných inzerátov

Tento fullstack projekt umožňuje:

- Import firiem z RPO API do SQLite databázy.
- Vyhľadávanie firiem podľa názvu alebo IČO pomocou autocomplete.
- Pridávanie pracovných inzerátov pre vybrané firmy vrátane nahrávania loga.
- Zobrazenie zoznamu inzerátov s možnosťou stiahnutia údajov vo forme PDF.
- Vymazávanie inzerátov (vrátane loga z disku).
- Validáciu obrázka podľa typu a veľkosti.
- Základné testovanie backend endpointu.

---

## Použité technológie

- **Frontend**:
  - [React](https://reactjs.org/) + [TypeScript](https://www.typescriptlang.org/)
  - [Material UI (MUI)](https://mui.com/)
  - Autocomplete, Dialog, Tooltip
- **Backend**:
  - [Node.js](https://nodejs.org/) + [Express](https://expressjs.com/)
  - [Prisma ORM](https://www.prisma.io/)
  - [Axios](https://axios-http.com/)
  - [Multer](https://github.com/expressjs/multer) pre nahrávanie súborov
  - [PDF-lib](https://pdf-lib.js.org/) pre generovanie PDF
  - [Jest](https://jestjs.io/) a [Supertest](https://github.com/ladjs/supertest) pre testy
- **Databáza**:
  - [SQLite](https://sqlite.org/)

---

## Funkcionalita

✅ Import firiem z RPO API a ich uloženie do databázy\
✅ Vyhľadávanie firiem cez autocomplete (podľa názvu alebo IČO)\
✅ Pridanie inzerátu cez dialog (názov firmy, IČO, adresa, text inzerátu, logo)\
✅ Uloženie inzerátu do databázy\
✅ Validácia nahratého loga (formát JPG/PNG, max. veľkosť 5 MB)\
✅ Zobrazenie zoznamu inzerátov vrátane dátumu vytvorenia\
✅ Zobrazenie počtu inzerátov\
✅ Generovanie PDF pre každý inzerát (vrátane loga)\
✅ Vymazanie inzerátu vrátane fyzického obrázka z disku\
✅ Indikátor načítavania pri generovaní PDF\
✅ Jednoduché testy pre `/api/search` endpoint\
✅ .env konfigurácia s `DANGEROUSLY_DISABLE_HOST_CHECK=true` pre riešenie problému s `allowedHosts`

---

## Schéma databázy (Prisma)

```ts
model Company {
  id            Int           @id @default(autoincrement())
  rpoId         Int           @unique
  ico           String
  name          String
  municipality  String
  establishment DateTime
  termination   DateTime?
  createdAt     DateTime      @default(now())
  updatedAt     DateTime      @updatedAt
  ads           Advertisement[]
}

model Advertisement {
  id         Int      @id @default(autoincrement())
  companyId  Int
  adText     String
  logoPath   String?
  createdAt  DateTime @default(now())
  company    Company  @relation(fields: [companyId], references: [id])
}
```

---

## Spustenie projektu

### Backend

```bash
npm install
npx prisma generate
npx prisma migrate dev --name init
npm run dev
```

### Frontend

```bash
cd frontend
npm install
echo DANGEROUSLY_DISABLE_HOST_CHECK=true > .env
npm start
```

---

## Testovanie

```bash
npm test
```

Spúšťa testy pomocou `jest`, vrátane testov pre `/api/search`.

---

## Príklady

- Zoznam inzerátov obsahuje počet záznamov, dátum pridania a logo.
- PDF obsahuje všetky údaje vrátane obrázka loga a je možné ho stiahnuť.
- Validácia zamedzuje nahraniu nesprávnych formátov súborov alebo príliš veľkých log.

