Projekt na import firiem z RPO API do SQLite databázy pomocou Prisma a TypeScriptu.

# Použité technológie

- [TypeScript](https://www.typescriptlang.org/)
- [Prisma ORM](https://www.prisma.io/)
- [Axios](https://axios-http.com/)
- [SQLite](https://sqlite.org/)
- [Node.js](https://nodejs.org/)

# Schéma databázy

Model Company:
- rpoId (unikátny identifikátor z RPO)
- ico (IČO)
- name (názov firmy)
- unicipality (obec)
- establishment (dátum vzniku)
- termination (dátum zániku)