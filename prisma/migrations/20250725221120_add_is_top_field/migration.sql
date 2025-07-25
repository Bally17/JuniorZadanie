-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Advertisement" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "companyId" INTEGER NOT NULL,
    "adText" TEXT NOT NULL,
    "logoPath" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isTop" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "Advertisement_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Advertisement" ("adText", "companyId", "createdAt", "id", "logoPath") SELECT "adText", "companyId", "createdAt", "id", "logoPath" FROM "Advertisement";
DROP TABLE "Advertisement";
ALTER TABLE "new_Advertisement" RENAME TO "Advertisement";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
