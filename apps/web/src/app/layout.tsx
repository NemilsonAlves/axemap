import type { Metadata } from 'next';
import { Inter, Plus_Jakarta_Sans, IBM_Plex_Mono } from 'next/font/google';
import './globals.css';
import './busca/page.css';
import { I18nProvider } from '@/lib/i18n/i18n-context';
import { HtmlLang } from '@/components/i18n/html-lang';
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
import { CookieConsent } from '@/components/cookies/cookie-consent';
import { QueryProvider } from '@/lib/query-provider';

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
    'O mapa vivo das tradições de matriz africana no Brasil. Candomblé, Umbanda, Batuque, Tambor de Mina, Xangô, Jurema e muito mais — acesso gratuito para a comunidade.',
  metadataBase: new URL('https://axemap.com.br'),
  alternates: {
    canonical: '/',
    languages: {
      'pt-BR': '/',
      'pt-PT': '/',
      'en': '/',
      'es': '/',
      'fr': '/',
      'yo': '/',
    },
  },
  icons: {
    icon: [
      { url: '/favicon-32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-48.png', sizes: '48x48', type: 'image/png' },
    ],
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
  },
  openGraph: {
    title: 'AxéMap — Mapa · Memória · Ancestralidade · Conexão',
    description:
      'O mapa vivo das tradições de matriz africana no Brasil. Descubra terreiros, comunidades, eventos e cultura afro-brasileira — acesso gratuito.',
    url: 'https://axemap.com.br',
    siteName: 'AxéMap',
    images: [{ url: '/og-default.png', width: 1200, height: 630, alt: 'AxéMap — O mapa vivo das tradições de matriz africana no Brasil' }],
    locale: 'pt_BR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AxéMap — Mapa · Memória · Ancestralidade · Conexão',
    description:
      'O mapa vivo das tradições de matriz africana no Brasil. Acesso gratuito para a comunidade.',
    images: ['/og-default.png'],
  },
  manifest: '/manifest.webmanifest',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning data-scroll-behavior="smooth">
      <head>
        <ThemeScript />
      </head>
      <body
        className={`${inter.variable} ${plusJakarta.variable} ${ibmPlexMono.variable}`}
        suppressHydrationWarning
      >
        <ThemeProvider>
          <I18nProvider>
            <HtmlLang />
          <QueryProvider>
          <AuthProvider>
            <AnalyticsProvider>
              <FeatureFlagsProvider>
                <TooltipProvider delayDuration={300}>
                  <a
                    href="#conteudo"
                    className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground focus:shadow-lg"
                  >
                    Pular para o conteúdo principal
                  </a>
                  <div className="flex min-h-dvh flex-col pb-[calc(4.5rem+env(safe-area-inset-bottom))] lg:pb-0 overflow-x-hidden">
                    <AppHeader />
                    <main id="conteudo" className="flex-1 min-w-0 overflow-x-hidden">{children}</main>
                    <AppFooter />
                  </div>
                  <MobileBottomNav />
                  <FeedbackWidget />
                  <CookieConsent />
                  <Toaster />
                </TooltipProvider>
              </FeatureFlagsProvider>
            </AnalyticsProvider>
          </AuthProvider>
          </QueryProvider>
          </I18nProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
