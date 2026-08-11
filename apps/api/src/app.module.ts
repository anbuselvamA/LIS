import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { envValidationSchema } from './config/env.validation';
import { PrismaModule } from './database/prisma.module';
import { UserModule } from './modules/user/user.module';
import { PatientModule } from './modules/patient/patient.module';
import { TestModule } from './modules/test/test.module';
import { TestOrderModule } from './modules/test-order/test-order.module';
import { SampleModule } from './modules/sample/sample.module';
import { BarcodeModule } from './modules/barcode/barcode.module';
import { ResultModule } from './modules/result/result.module';
import { HealthModule } from './modules/health/health.module';
import { StorageModule } from './modules/storage/storage.module';
import { ReferralHospitalModule } from './modules/referral-hospital/referral-hospital.module';
import { ReferralDoctorModule } from './modules/referral-doctor/referral-doctor.module';
import { ReferralRequestModule } from './modules/referral-request/referral-request.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { SettingsModule } from './modules/settings/settings.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: envValidationSchema,
    }),
    PrismaModule,
    UserModule,
    PatientModule,
    TestModule,
    TestOrderModule,
    SampleModule,
    BarcodeModule,
    ResultModule,
    HealthModule,
    StorageModule,
    ReferralHospitalModule,
    ReferralDoctorModule,
    ReferralRequestModule,
    DashboardModule,
    SettingsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
