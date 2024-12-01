-- CreateTable
CREATE TABLE "VastraSevaBooking" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "deity" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "specialDay" BOOLEAN NOT NULL,
    "amount" REAL NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "gotram" TEXT NOT NULL,
    "requests" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "orderId" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "VastraSevaBooking_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "VastraSevaOrder" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "VastraSevaOrder" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "totalAmount" REAL NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "AI_Booking" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "pujaName" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "SevaBooking" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "sevaType" TEXT NOT NULL,
    "poojaDetails" TEXT,
    "date" DATETIME NOT NULL,
    "amount" REAL NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "gotram" TEXT,
    "requests" TEXT,
    "location" TEXT NOT NULL,
    "priestPreference" TEXT NOT NULL,
    "muhuratRequired" BOOLEAN NOT NULL,
    "namesAndNakshatras" TEXT,
    "serviceDate" DATETIME NOT NULL,
    "timeWindow" TEXT,
    "venueAddress" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "orderId" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "SevaBooking_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "SevaOrder" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SevaOrder" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "totalAmount" REAL NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "SpecialDate" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "date" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Manager" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "SpecialDate_date_key" ON "SpecialDate"("date");

-- CreateIndex
CREATE UNIQUE INDEX "Manager_username_key" ON "Manager"("username");
