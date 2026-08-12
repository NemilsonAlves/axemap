import type { Metadata } from 'next';
import { Inter, Plus_Jakarta_Sans, IBM_Plex_Mono } from 'next/font/google';
import './globals.css';
import './busca/page.css';
import { I18nProvider } from '@/lib/i18n/i18n-context';
import { AuthProvider } from '@/lib/auth/auth-context';
import { AnalyticsProvider } from '@/lib/analytics/analytics-context';
import { FeatureFlagsProvider } from '@/lib/feature-flags/feature-flags-context';
import { ThemeProvider } from '@/components/theme/theme-provider';
import { ThemeScript } from '@/components/theme/theme-script';
import { AppHeader } from '@/components/layout/app-header';
import { AppFooter } from '@/components/layout/app-footer';
import { MobileBottomNav } from '@/components/layout/mobile-bottom-nav';
import { FeedbackWidget } from '@/components/feedback-widget';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-plus-jakarta',
  display: 'swap',
});

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-ibm-plex-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'AxéMap — Mapa · Memória · Ancestralidade · Conexão',
    template: '%s | AxéMap',
  },
  description:
    'Infraestrutura digital global para tradições africanas e afro-diaspóricas. Mapa vivo, memória cultural, comunidades, conhecimento e conexão — da África para o mundo.',
  metadataBase: new URL('https://axemap.com.br'),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <ThemeScript />
      </head>
      <body
        className={`${inter.variable} ${plusJakarta.variable} ${ibmPlexMono.variable}`}
        suppressHydrationWarning
      >
        <ThemeProvider>
          <I18nProvider>
          <AuthProvider>
            <AnalyticsProvider>
              <FeatureFlagsProvider>
                <TooltipProvider delayDuration={300}>
                  <div className="flex min-h-dvh flex-col pb-[calc(4.5rem+env(safe-area-inset-bottom))] lg:pb-0">
                    <AppHeader />
                    <main className="flex-1">{children}</main>
                    <AppFooter />
                  </div>
                  <MobileBottomNav />
                  <FeedbackWidget />
                  <Toaster />
                </TooltipProvider>
              </FeatureFlagsProvider>
            </AnalyticsProvider>
          </AuthProvider>
          </I18nProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
