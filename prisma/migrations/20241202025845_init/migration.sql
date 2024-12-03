-- CreateTable
CREATE TABLE "VastraSevaBooking" (
    "id" SERIAL NOT NULL,
    "deity" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "specialDay" BOOLEAN NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "gotram" TEXT NOT NULL,
    "requests" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "orderId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VastraSevaBooking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VastraSevaOrder" (
    "id" SERIAL NOT NULL,
    "totalAmount" DOUBLE PRECISION NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VastraSevaOrder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AI_Booking" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "pujaName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AI_Booking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SevaBooking" (
    "id" SERIAL NOT NULL,
    "sevaType" TEXT NOT NULL,
    "poojaDetails" TEXT,
    "date" TIMESTAMP(3) NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
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
    "serviceDate" TIMESTAMP(3) NOT NULL,
    "timeWindow" TEXT,
    "venueAddress" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "orderId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SevaBooking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SevaOrder" (
    "id" SERIAL NOT NULL,
    "totalAmount" DOUBLE PRECISION NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SevaOrder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SpecialDate" (
    "id" SERIAL NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "festivalName" TEXT,
    "price" DOUBLE PRECISION NOT NULL DEFAULT 100.00,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SpecialDate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Manager" (
    "id" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,

    CONSTRAINT "Manager_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SpecialDate_date_key" ON "SpecialDate"("date");

-- CreateIndex
CREATE UNIQUE INDEX "Manager_username_key" ON "Manager"("username");

-- AddForeignKey
ALTER TABLE "VastraSevaBooking" ADD CONSTRAINT "VastraSevaBooking_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "VastraSevaOrder"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SevaBooking" ADD CONSTRAINT "SevaBooking_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "SevaOrder"("id") ON DELETE SET NULL ON UPDATE CASCADE;
