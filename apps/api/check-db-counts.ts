import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkCounts() {
  const users = await prisma.user.count();
  const admins = await prisma.user.count({ where: { role: 'ADMIN' } });
  const nonAdmins = users - admins;

  const patients = await prisma.patient.count();
  const testOrders = await prisma.testOrder.count();
  const orderItems = await prisma.orderItem.count();
  const samples = await prisma.sample.count();
  const results = await prisma.result.count();
  const reportViews = await prisma.reportView.count();
  const auditLogs = await prisma.auditLog.count();
  const referralRequests = await prisma.referralRequest.count();
  const testCatalogue = await prisma.test.count();

  const counts = {
    UsersTotal: users,
    Admins: admins,
    NonAdmins: nonAdmins,
    Patients: patients,
    TestOrders: testOrders,
    OrderItems: orderItems,
    Samples: samples,
    Results: results,
    ReportViews: reportViews,
    AuditLogs: auditLogs,
    ReferralRequests: referralRequests,
    TestCatalogue: testCatalogue,
  };

  console.log(JSON.stringify(counts, null, 2));
  await prisma.$disconnect();
}

checkCounts();
