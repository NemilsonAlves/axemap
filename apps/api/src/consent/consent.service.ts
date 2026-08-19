import { Injectable } from '@nestjs/common';
import { createHash } from 'crypto';
import { PrismaService } from '../database/prisma.service';

const CONSENT_VERSION = '1';

export interface RecordConsentDto {
  userId?: string;
  sessionId?: string;
  essential: boolean;
  analytics: boolean;
  marketing: boolean;
  preferences: boolean;
  source: 'banner' | 'settings' | 'api';
  rawIp?: string;
  rawUserAgent?: string;
}

@Injectable()
export class ConsentService {
  constructor(private prisma: PrismaService) {}

  /**
   * Registra ou atualiza o consentimento de um titular.
   * IPs e User-Agents são hashados (SHA-256) antes de persistir — NUNCA dados brutos.
   */
  async registrar(dto: RecordConsentDto) {
    const ipHash = dto.rawIp
      ? createHash('sha256').update(dto.rawIp).digest('hex')
      : undefined;
    const userAgentHash = dto.rawUserAgent
      ? createHash('sha256').update(dto.rawUserAgent).digest('hex')
      : undefined;

    // Cast necessário até `prisma generate` ser executado após migration ConsentRecord
    return (this.prisma as any).consentRecord.create({
      data: {
        userId: dto.userId ?? null,
        sessionId: dto.sessionId ?? null,
        consentVersion: CONSENT_VERSION,
        essential: true, // sempre true
        analytics: dto.analytics,
        marketing: dto.marketing,
        preferences: dto.preferences,
        source: dto.source,
        ipHash: ipHash ?? null,
        userAgentHash: userAgentHash ?? null,
      },
    });
  }

  /** Revoga todos os consentimentos de um usuário (marca revokedAt). */
  async revogarPorUsuario(userId: string) {
    await (this.prisma as any).consentRecord.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
    return { message: 'Consentimentos revogados.' };
  }

  /** Lista registros de consentimento de um usuário (para auditoria). */
  async listarPorUsuario(userId: string) {
    return (this.prisma as any).consentRecord.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        consentVersion: true,
        essential: true,
        analytics: true,
        marketing: true,
        preferences: true,
        source: true,
        createdAt: true,
        revokedAt: true,
      },
    });
  }
}
