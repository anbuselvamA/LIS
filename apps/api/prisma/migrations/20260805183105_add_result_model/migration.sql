-- CreateEnum
CREATE TYPE "ResultStatus" AS ENUM ('PENDING', 'ENTERED', 'VERIFIED');

-- CreateEnum
CREATE TYPE "EntryMode" AS ENUM ('MANUAL', 'AUTOMATIC');

-- CreateEnum
CREATE TYPE "AbnormalFlag" AS ENUM ('NORMAL', 'LOW', 'HIGH', 'CRITICAL');

-- CreateTable
CREATE TABLE "Result" (
    "id" TEXT NOT NULL,
    "sampleId" TEXT NOT NULL,
    "parameterCode" TEXT NOT NULL,
    "parameterName" TEXT NOT NULL,
    "resultValue" TEXT NOT NULL,
    "unit" TEXT NOT NULL,
    "referenceRange" TEXT NOT NULL,
    "abnormalFlag" "AbnormalFlag" NOT NULL DEFAULT 'NORMAL',
    "interpretation" TEXT,
    "resultStatus" "ResultStatus" NOT NULL DEFAULT 'ENTERED',
    "entryMode" "EntryMode" NOT NULL DEFAULT 'MANUAL',
    "enteredBy" TEXT,
    "enteredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "verifiedBy" TEXT,
    "verifiedAt" TIMESTAMP(3),
    "remarks" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Result_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Result" ADD CONSTRAINT "Result_sampleId_fkey" FOREIGN KEY ("sampleId") REFERENCES "Sample"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
