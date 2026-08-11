-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "action" TEXT NOT NULL,
    "entity" TEXT NOT NULL,
    "entityId" TEXT,
    "oldValue" JSONB,
    "newValue" JSONB,
    "ipAddress" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HospitalSettings" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" JSONB NOT NULL,
    "description" TEXT,
    "updatedBy" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HospitalSettings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AuditLog_userId_idx" ON "AuditLog"("userId");

-- CreateIndex
CREATE INDEX "AuditLog_entity_entityId_idx" ON "AuditLog"("entity", "entityId");

-- CreateIndex
CREATE UNIQUE INDEX "HospitalSettings_key_key" ON "HospitalSettings"("key");

-- CreateIndex
CREATE INDEX "OrderItem_testOrderId_idx" ON "OrderItem"("testOrderId");

-- CreateIndex
CREATE INDEX "OrderItem_testId_idx" ON "OrderItem"("testId");

-- CreateIndex
CREATE INDEX "Result_sampleId_idx" ON "Result"("sampleId");

-- CreateIndex
CREATE INDEX "Sample_testOrderId_idx" ON "Sample"("testOrderId");

-- CreateIndex
CREATE INDEX "Sample_orderItemId_idx" ON "Sample"("orderItemId");

-- CreateIndex
CREATE INDEX "TestOrder_patientId_idx" ON "TestOrder"("patientId");

-- CreateIndex
CREATE INDEX "TestOrder_referringDoctorId_idx" ON "TestOrder"("referringDoctorId");
