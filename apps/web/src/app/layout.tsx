import type { Metadata } from 'next';
import { Inter, Plus_Jakarta_Sans, IBM_Plex_Mono } from 'next/font/google';
import './globals.css';
import './busca/page.css';
import { AuthProvider } from '@/lib/auth/auth-context';
import { AnalyticsProvider } from '@/lib/analytics/analytics-context';
import { FeatureFlagsProvider } from '@/lib/feature-flags/feature-flags-context';
import { ThemeProvider } from '@/components/theme/theme-provider';
import { ThemeScript } from '@/components/theme/theme-script';
import { AppHeader } from '@/components/layout/app-header';
import { AppFooter } from '@/components/layout/app-footer';
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
  title: 'AxéMap - Plataforma de Religiões Afro-Brasileiras',
  description:
    'Conecte-se com terreiros, eventos e comunidade de religiões afro-brasileiras. A tecnologia a serviço da tradição.',
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
          <AuthProvider>
            <AnalyticsProvider>
              <FeatureFlagsProvider>
                <TooltipProvider delayDuration={300}>
                  <div className="flex min-h-dvh flex-col">
                    <AppHeader />
                    <main className="flex-1">{children}</main>
                    <AppFooter />
                  </div>
                  <FeedbackWidget />
                  <Toaster />
                </TooltipProvider>
              </FeatureFlagsProvider>
            </AnalyticsProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}