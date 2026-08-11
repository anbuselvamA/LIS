import { ApiProperty } from '@nestjs/swagger';

export class DashboardSummaryDto {
  @ApiProperty({ description: 'Data for today' })
  today: Record<string, any>;

  @ApiProperty({ description: 'Data for this week' })
  thisWeek: Record<string, any>;

  @ApiProperty({ description: 'Data for this month' })
  thisMonth: Record<string, any>;
}

export class DashboardStatisticsDto {
  @ApiProperty({ description: 'Chart-ready aggregate data' })
  chartReadyData: Record<string, any>;
}

export class BaseDashboardDto<T> {
  @ApiProperty({ description: 'Dashboard Summary metrics' })
  summary: DashboardSummaryDto;

  @ApiProperty({ description: 'Dashboard Statistics metrics' })
  statistics: DashboardStatisticsDto;

  @ApiProperty({ description: 'Recent activity feed relevant to the role', isArray: true })
  recentActivity: T[];

  @ApiProperty({ description: 'Dashboard notifications for the role', isArray: true })
  notifications: string[];
}
