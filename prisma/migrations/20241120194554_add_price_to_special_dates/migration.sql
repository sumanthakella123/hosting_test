-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_SpecialDate" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "date" DATETIME NOT NULL,
    "festivalName" TEXT,
    "price" REAL NOT NULL DEFAULT 100.00,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_SpecialDate" ("createdAt", "date", "festivalName", "id", "updatedAt") SELECT "createdAt", "date", "festivalName", "id", "updatedAt" FROM "SpecialDate";
DROP TABLE "SpecialDate";
ALTER TABLE "new_SpecialDate" RENAME TO "SpecialDate";
CREATE UNIQUE INDEX "SpecialDate_date_key" ON "SpecialDate"("date");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
