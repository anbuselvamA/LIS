-- CreateEnum
CREATE TYPE "SpecimenType" AS ENUM ('BLOOD', 'URINE', 'CSF', 'SWAB');

-- CreateEnum
CREATE TYPE "ContainerType" AS ENUM ('EDTA_LAVENDER', 'SST_YELLOW', 'FLUORIDE_GREY', 'STERILE_CONTAINER');

-- CreateTable
CREATE TABLE "Test" (
    "id" TEXT NOT NULL,
    "testCode" TEXT NOT NULL,
    "testName" TEXT NOT NULL,
    "description" TEXT,
    "specimenType" "SpecimenType" NOT NULL,
    "containerType" "ContainerType" NOT NULL,
    "fastingRequired" BOOLEAN NOT NULL DEFAULT false,
    "turnaroundTimeHours" INTEGER NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Test_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Test_testCode_key" ON "Test"("testCode");
