import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { HealthService } from '../health/health.service';

@Injectable()
export class DashboardService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly healthService: HealthService,
  ) {}

  // Date utilities
  private getStartOfDay() {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }

  // --- ADMIN DASHBOARD ---
  async getAdminDashboard() {
    const today = this.getStartOfDay();
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    // Run independent aggregates in parallel
    const [
      totalPatients,
      todaysRegistrations,
      totalOrders,
      todaysOrders,
      pendingSamples,
      processingSamples,
      pendingResults,
      verifiedToday,
      reportsReadyToday,
      activeUsers,
      recentAuditLogs
    ] = await Promise.all([
      this.prisma.patient.count(),
      this.prisma.patient.count({ where: { createdAt: { gte: today } } }),
      this.prisma.testOrder.count(),
      this.prisma.testOrder.count({ where: { createdAt: { gte: twentyFourHoursAgo } } }),
      this.prisma.sample.count({ where: { status: 'PENDING' } }),
      this.prisma.sample.count({ where: { status: 'PROCESSING' } }),
      this.prisma.result.count({ where: { resultStatus: 'ENTERED' } }),
      this.prisma.result.count({ where: { resultStatus: 'VERIFIED', verifiedAt: { gte: twentyFourHoursAgo } } }),
      // Reports ready today: Orders that have at least one item, and all items are APPROVED/REPORTED, and updated today (since order items are approved when verified)
      this.prisma.testOrder.count({
        where: {
          updatedAt: { gte: today },
          items: {
            some: {},
            every: { status: { in: ['APPROVED', 'REPORTED'] } }
          }
        }
      }),
      this.prisma.user.count({ where: { isActive: true } }),
      this.prisma.auditLog.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
      })
    ]);

    // System Health Integration
    const healthCheck = this.healthService.check();

    // Map audit logs to a friendly format
    const recentActivity = recentAuditLogs.map(log => ({
      id: log.id,
      action: log.action,
      entity: log.entity,
      entityId: log.entityId,
      createdAt: log.createdAt,
      user: log.userId ? 'System User' : 'System',
    }));

    return {
      summary: {
        today: {
          totalPatients,
          todaysRegistrations,
          totalOrders,
          todaysOrders,
          pendingSamples,
          processingSamples,
          pendingResults,
          verifiedToday,
          reportsReadyToday,
          activeUsers
        },
        thisWeek: {},
        thisMonth: {},
      },
      statistics: {
        chartReadyData: {}
      },
      recentActivity,
      notifications: [
        healthCheck.status === 'ok' ? 'System is healthy.' : 'System health warning.',
        `${pendingResults} results pending verification.`
      ],
      systemHealth: healthCheck
    };
  }

  // --- RECEPTION DASHBOARD ---
  async getReceptionDashboard() {
    const today = this.getStartOfDay();

    const [
      todaysRegistrations,
      walkInPatients,
      referralPatients,
      pendingRegistrations
    ] = await Promise.all([
      this.prisma.patient.count({ where: { createdAt: { gte: today } } }),
      this.prisma.testOrder.count({ where: { createdAt: { gte: today }, referralRequestId: null } }),
      this.prisma.testOrder.count({ where: { createdAt: { gte: today }, referralRequestId: { not: null } } }),
      this.prisma.testOrder.count({ where: { orderStatus: 'REGISTERED' } })
    ]);

    return {
      summary: {
        today: { todaysRegistrations, walkInPatients, referralPatients, pendingRegistrations },
        thisWeek: {},
        thisMonth: {},
      },
      statistics: {
        chartReadyData: {}
      },
      recentActivity: await this.prisma.testOrder.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: { patient: { select: { firstName: true, lastName: true } } }
      }),
      notifications: []
    };
  }

  // --- LAB TECHNICIAN DASHBOARD ---
  async getLabDashboard() {
    const [
      pendingSamples,
      receivedSamples,
      samplesInProcessing,
      pendingResultEntry
    ] = await Promise.all([
      this.prisma.sample.count({ where: { status: 'PENDING' } }),
      this.prisma.sample.count({ where: { status: { in: ['COLLECTED', 'RECEIVED'] } } }),
      this.prisma.sample.count({ where: { status: 'PROCESSING' } }),
      this.prisma.result.count({ where: { resultStatus: 'PENDING' } })
    ]);

    return {
      summary: {
        today: { pendingSamples, receivedSamples, samplesInProcessing, pendingResultEntry },
        thisWeek: {},
        thisMonth: {},
      },
      statistics: {
        chartReadyData: {}
      },
      recentActivity: await this.prisma.sample.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
      }),
      notifications: []
    };
  }

  // --- INTERNAL DOCTOR DASHBOARD ---
  async getDoctorDashboard() {
    const today = this.getStartOfDay();
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const [
      pendingVerifications,
      verifiedToday,
      rejectedResults,
      reportsReady
    ] = await Promise.all([
      this.prisma.result.count({ where: { resultStatus: 'ENTERED' } }),
      this.prisma.result.count({ where: { resultStatus: 'VERIFIED', verifiedAt: { gte: twentyFourHoursAgo } } }),
      this.prisma.result.count({ where: { remarks: { contains: 'Doctor:' } } }),
      this.prisma.result.count({ where: { resultStatus: 'VERIFIED', sample: { testOrder: { referralRequestId: null } } } })
    ]);

    return {
      summary: {
        today: { pendingVerifications, verifiedToday, rejectedResults, reportsReady },
        thisWeek: {},
        thisMonth: {},
      },
      statistics: {
        chartReadyData: {}
      },
      recentActivity: await this.prisma.result.findMany({
        take: 5,
        where: { resultStatus: 'ENTERED' }, // Doctor's actionable queue
        orderBy: { createdAt: 'desc' },
        include: { sample: { include: { testOrder: { include: { patient: true } } } } }
      }),
      notifications: []
    };
  }

  // --- REFERRAL DOCTOR DASHBOARD ---
  async getReferralDashboard(userId: string) {
    const profile = await this.prisma.referralDoctorProfile.findUnique({
      where: { userId }
    });

    if (!profile) {
      return {
        summary: { today: {}, thisWeek: {}, thisMonth: {} },
        statistics: { chartReadyData: {} },
        recentActivity: [],
        notifications: ['No referral doctor profile found for this user.']
      };
    }

    const [
      totalReferrals,
      pendingReferrals,
      completedReferrals,
      sharedReports
    ] = await Promise.all([
      this.prisma.referralRequest.count({ where: { referralDoctorId: profile.id } }),
      this.prisma.referralRequest.count({ where: { referralDoctorId: profile.id, status: { not: 'CLOSED' } } }),
      this.prisma.referralRequest.count({ where: { referralDoctorId: profile.id, status: 'CLOSED' } }),
      this.prisma.referralRequest.count({ where: { referralDoctorId: profile.id, status: 'REPORT_SHARED' } }),
    ]);

    // Unique patients referred
    const distinctPatients = await this.prisma.referralRequest.findMany({
      where: { referralDoctorId: profile.id },
      distinct: ['patientId'],
      select: { patientId: true }
    });

    return {
      summary: {
        today: { totalReferrals, pendingReferrals, completedReferrals, sharedReports, myPatients: distinctPatients.length },
        thisWeek: {},
        thisMonth: {},
      },
      statistics: {
        chartReadyData: {}
      },
      recentActivity: await this.prisma.referralRequest.findMany({
        take: 5,
        where: { referralDoctorId: profile.id },
        orderBy: { createdAt: 'desc' },
        include: { patient: true }
      }),
      notifications: []
    };
  }
}
