import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { DatabaseModule } from './database/database.module';
import { LoggerModule } from './common/logger/logger.module';
import { SystemModule } from './system/system.module';
import { HealthModule } from './health/health.module';
import { AuthModule } from './auth/auth.module';
import { TerreiroModule } from './terreiro/terreiro.module';
import { GeoModule } from './geo/geo.module';
import { EvolutionModule } from './evolution/evolution.module';
import { GrowthModule } from './growth/growth.module';
import { OnboardingModule } from './onboarding/onboarding.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { FeedbackModule } from './feedback/feedback.module';
import { FeatureFlagsModule } from './feature-flags/feature-flags.module';
import { StorageModule } from './common/storage/storage.module';
import { LandingModule } from './landing/landing.module';
import { RecommendationModule } from './recommendation/recommendation.module';
import { DiscoveryModule } from './discovery/discovery.module';
import { RankingModule } from './ranking/ranking.module';
import { AvaliacoesModule } from './avaliacoes/avaliacoes.module';
import { EventosModule } from './eventos/eventos.module';
import { AdminModule } from './admin/admin.module';
import { UploadModule } from './upload/upload.module';
import { TrustScoreModule } from './trust-score/trust-score.module';
import { CursosModule } from './cursos/cursos.module';
import { AcoesSociaisModule } from './acoes-sociais/acoes-sociais.module';
import { NotificacoesModule } from './notificacoes/notificacoes.module';
import { AuditLogsModule } from './audit-logs/audit-logs.module';
import { ModerationModule } from './moderation/moderation.module';
import { VerificacaoModule } from './verificacao/verificacao.module';
import { CampanhasModule } from './campanhas/campanhas.module';
import { CampanhasAdminModule } from './campanhas-admin/campanhas-admin.module';
import { TrustEcosystemModule } from './trust-ecosystem/trust-ecosystem.module';
import { AppController } from './app.controller';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }]),
    LoggerModule,
    DatabaseModule,
    SystemModule,
    HealthModule,
    AuthModule,
    TerreiroModule,
    GeoModule,
    EvolutionModule,
    GrowthModule,
    OnboardingModule,
    AnalyticsModule,
    FeedbackModule,
    FeatureFlagsModule,
    StorageModule,
    LandingModule,
    RecommendationModule,
    DiscoveryModule,
    RankingModule,
    AvaliacoesModule,
    EventosModule,
    AdminModule,
    UploadModule,
    TrustScoreModule,
    CursosModule,
    AcoesSociaisModule,
    NotificacoesModule,
    AuditLogsModule,
    ModerationModule,
    VerificacaoModule,
    CampanhasModule,
    CampanhasAdminModule,
    TrustEcosystemModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
