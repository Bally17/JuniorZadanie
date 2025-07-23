-- CreateTable
CREATE TABLE "Company" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "rpoId" INTEGER NOT NULL,
    "ico" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "municipality" TEXT NOT NULL,
    "establishment" DATETIME NOT NULL,
    "termination" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Company_rpoId_key" ON "Company"("rpoId");

-- CreateIndex
CREATE UNIQUE INDEX "Company_ico_key" ON "Company"("ico");
