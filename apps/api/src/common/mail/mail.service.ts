import { Injectable, Logger } from '@nestjs/common';
import { createHash } from 'crypto';
import { ConfigService } from '@nestjs/config';

export type MailProvider = 'console' | 'smtp' | 'http';

export interface MailMessage {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

export interface MailProviderAdapter {
  send(message: MailMessage): Promise<void>;
}

@Injectable()
export class ConsoleMailProvider implements MailProviderAdapter {
  private logger = new Logger('MailProvider:console');

  async send(message: MailMessage): Promise<void> {
    this.logger.log(
      `[mail] to=${message.to} subject="${message.subject}"\n${message.text}`,
    );
  }
}

@Injectable()
export class HttpMailProvider implements MailProviderAdapter {
  private logger = new Logger('MailProvider:http');

  constructor(private config: ConfigService) {}

  async send(message: MailMessage): Promise<void> {
    const apiUrl = this.config.get<string>('MAIL_API_URL');
    const apiKey = this.config.get<string>('MAIL_API_KEY');
    if (!apiUrl || !apiKey) {
      this.logger.warn('MAIL_API_URL/MAIL_API_KEY ausentes — e-mail não enviado.');
      return;
    }
    try {
      const res = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          to: message.to,
          subject: message.subject,
          text: message.text,
          html: message.html,
        }),
      });
      if (!res.ok) {
        this.logger.error(`Provider HTTP respondeu ${res.status}`);
      }
    } catch (e) {
      this.logger.error(`Falha ao enviar e-mail via HTTP: ${(e as Error).message}`);
    }
  }
}

@Injectable()
export class MailService {
  private logger = new Logger('MailService');
  private provider: MailProviderAdapter;
  private providerName: MailProvider;

  constructor(
    config: ConfigService,
    consoleProvider: ConsoleMailProvider,
    httpProvider: HttpMailProvider,
  ) {
    const name = (config.get<string>('MAIL_PROVIDER') || 'console') as MailProvider;
    this.providerName = name;
    if (name === 'http') {
      this.provider = httpProvider;
    } else {
      this.provider = consoleProvider;
    }
  }

  getProviderName(): MailProvider {
    return this.providerName;
  }

  async send(message: MailMessage): Promise<void> {
    await this.provider.send(message);
  }

  async sendPasswordReset(to: string, nome: string, resetUrl: string): Promise<void> {
    await this.send({
      to,
      subject: 'AxéMap — Redefinição de senha',
      text: [
        `Olá, ${nome}!`,
        '',
        'Recebemos uma solicitação para redefinir a senha da sua conta AxéMap.',
        'Se não foi você, ignore este e-mail.',
        '',
        'Para redefinir sua senha, acesse o link abaixo (válido por 30 minutos):',
        resetUrl,
        '',
        'O AxéMap nunca pede sua senha por e-mail. Não compartilhe este link.',
      ].join('\n'),
      html: `
        <div style="font-family:system-ui,sans-serif;max-width:560px;margin:0 auto;padding:24px">
          <h2 style="color:#132849">AxéMap</h2>
          <p>Olá, <strong>${nome}</strong>!</p>
          <p>Recebemos uma solicitação para redefinir a senha da sua conta AxéMap.</p>
          <p>Se não foi você, ignore este e-mail.</p>
          <p style="margin:24px 0">
            <a href="${resetUrl}" style="background:#132849;color:#fff;padding:12px 20px;border-radius:8px;text-decoration:none;display:inline-block">
              Redefinir minha senha
            </a>
          </p>
          <p style="font-size:13px;color:#666">
            O link é válido por <strong>30 minutos</strong>. O AxéMap nunca pede sua senha por e-mail e não compartilhe este link.
          </p>
        </div>
      `,
    });
  }

  maskEmail(email: string): string {
    const [user, domain] = email.split('@');
    const maskedUser = user ? `${user.slice(0, 2)}***` : '***';
    return `${maskedUser}@${domain || '***'}`;
  }

  static hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }
}