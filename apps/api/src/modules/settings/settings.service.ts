import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class SettingsService {
  constructor(private prisma: PrismaService) {}

  async getAllSettings() {
    const settings = await this.prisma.hospitalSettings.findMany();
    // Convert array to an object keyed by `key`
    const settingsMap: Record<string, any> = {};
    settings.forEach((setting) => {
      settingsMap[setting.key] = setting.value;
    });
    return settingsMap;
  }

  async getSettingsByKey(key: string) {
    const setting = await this.prisma.hospitalSettings.findUnique({
      where: { key },
    });
    return setting?.value || null;
  }

  async updateSettings(key: string, value: any, user: any) {
    const validKeys = ['HOSPITAL_PROFILE', 'REPORT_BRANDING', 'NOTIFICATIONS', 'SECURITY', 'BACKUP_CONFIG'];
    if (!validKeys.includes(key)) {
      throw new NotFoundException(`Unknown settings category: ${key}`);
    }

    const existing = await this.prisma.hospitalSettings.findUnique({ where: { key } });

    const result = await this.prisma.hospitalSettings.upsert({
      where: { key },
      update: {
        value,
        updatedBy: user.id,
      },
      create: {
        key,
        value,
        updatedBy: user.id,
        description: `Configuration for ${key}`,
      },
    });

    // Create Audit Log
    await this.prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'SETTINGS_UPDATED',
        entity: 'HospitalSettings',
        entityId: key,
        oldValue: existing?.value ? existing.value : undefined,
        newValue: value,
        ipAddress: null, // Depending on if we extract IP from request
      },
    });

    return result.value;
  }

  async getAuditLogs(page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;
    
    const [items, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where: { action: 'SETTINGS_UPDATED' },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.auditLog.count({
        where: { action: 'SETTINGS_UPDATED' },
      }),
    ]);

    // Enhance audit logs with user information
    const userIds = items.map(log => log.userId).filter(Boolean) as string[];
    const uniqueUserIds = [...new Set(userIds)];
    const users = await this.prisma.user.findMany({
      where: { id: { in: uniqueUserIds } },
      select: { id: true, email: true, role: true }
    });

    const enrichedItems = items.map(log => {
      const user = users.find(u => u.id === log.userId);
      return {
        ...log,
        userEmail: user?.email || 'System',
        userRole: user?.role || 'SYSTEM',
        // Omit oldValue/newValue to prevent exposing huge objects or sensitive data
        oldValue: undefined,
        newValue: undefined,
      };
    });

    return {
      items: enrichedItems,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}
