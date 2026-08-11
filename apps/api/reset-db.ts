import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function resetDatabase() {
  console.log('Starting Database Reset...');

  try {
    // 1. ReportViews
    const resReportViews = await prisma.reportView.deleteMany();
    console.log(`Deleted ${resReportViews.count} ReportViews`);

    // 2. Results
    const resResults = await prisma.result.deleteMany();
    console.log(`Deleted ${resResults.count} Results`);

    // 3. Samples
    const resSamples = await prisma.sample.deleteMany();
    console.log(`Deleted ${resSamples.count} Samples`);

    // 4. OrderItems
    const resOrderItems = await prisma.orderItem.deleteMany();
    console.log(`Deleted ${resOrderItems.count} OrderItems`);

    // 5. TestOrders
    const resTestOrders = await prisma.testOrder.deleteMany();
    console.log(`Deleted ${resTestOrders.count} TestOrders`);

    // 6. ReferralRequests
    const resReferrals = await prisma.referralRequest.deleteMany();
    console.log(`Deleted ${resReferrals.count} ReferralRequests`);

    // 7. AuditLogs
    const resAuditLogs = await prisma.auditLog.deleteMany();
    console.log(`Deleted ${resAuditLogs.count} AuditLogs`);

    // 8. Patients
    const resPatients = await prisma.patient.deleteMany();
    console.log(`Deleted ${resPatients.count} Patients`);

    // 9. Non-admin Users
    const resUsers = await prisma.user.deleteMany({
      where: {
        role: {
          not: 'ADMIN'
        }
      }
    });
    console.log(`Deleted ${resUsers.count} Non-Admin Users`);

    console.log('Database Reset Successfully Completed!');
  } catch (error) {
    console.error('Error during database reset:', error);
  } finally {
    await prisma.$disconnect();
  }
}

resetDatabase();
