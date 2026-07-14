import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { DatabaseModule } from './database/database.module';
import { HealthModule } from './health/health.module';
import { AuthModule } from './auth/auth.module';
import { TerreiroModule } from './terreiro/terreiro.module';
import { GeoModule } from './geo/geo.module';
import { EvolutionModule } from './evolution/evolution.module';
import { GrowthModule } from './growth/growth.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }]),
    DatabaseModule,
    HealthModule,
    AuthModule,
    TerreiroModule,
    GeoModule,
    EvolutionModule,
    GrowthModule,
  ],
})
export class AppModule {}
