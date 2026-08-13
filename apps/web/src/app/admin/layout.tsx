'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  LayoutDashboard,
  Users,
  Map,
  ShieldCheck,
  Cable,
  ListChecks,
  Network,
  BarChart3,
  Eye,
  Server,
  Menu,
} from 'lucide-react';
import { useAuth } from '@/lib/auth/auth-context';
import { Sidebar, MobileSidebar, type SidebarGroup } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

const ADMIN_ROLES = ['ADMIN', 'SUPER_ADMIN'];

function AdminSidebar({ pathname }: { pathname: string }) {
  const item = (label: string, href: string, icon: any) => ({
    label,
    href,
    icon,
    active: pathname === href || (href !== '/admin' && pathname.startsWith(href)),
  });

  const groups: SidebarGroup[] = [
    {
      label: 'Principal',
      items: [
        item('Dashboard', '/admin', LayoutDashboard),
        item('Usuários', '/admin/usuarios', Users),
        item('Mapa', '/admin/mapa', Map),
        item('Auditoria', '/admin/auditoria', ShieldCheck),
        item('Integrações', '/admin/integracoes', Cable),
        item('Jobs', '/admin/jobs', ListChecks),
      ],
    },
    {
      label: 'Conteúdo',
      items: [
        item('Central', '/admin/central', LayoutDashboard),
        item('Axé Graph', '/admin/axegraph', Network),
        item('Impacto', '/admin/impacto', BarChart3),
        item('Transparência', '/admin/transparencia', Eye),
      ],
    },
    {
      label: 'Sistema',
      items: [item('System', '/admin/system', Server)],
    },
  ];

  return (
    <Sidebar
      groups={groups}
      ariaLabel="Navegação administrativa"
      className="max-h-[calc(100dvh-8rem)]"
    />
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const isAdmin = !!user && ADMIN_ROLES.includes(user.role);

  useEffect(() => {
    if (!loading && !isAdmin) {
      router.replace('/');
    }
  }, [loading, isAdmin, router]);

  if (loading) {
    return (
      <div className="flex min-h-[50dvh] items-center justify-center">
        <Loader2 className="size-6 animate-spin text-copper" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center">
        <h1 className="font-display text-2xl font-semibold">Acesso restrito</h1>
        <p className="mt-2 text-muted-foreground">
          Você precisa ser administrador para acessar o console.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-[1440px] gap-6 px-4 py-6 lg:px-6">
      <aside className="hidden w-64 shrink-0 lg:block">
        <div className="sticky top-24 rounded-2xl border border-border bg-card p-2 shadow-sm">
          <div className="px-3 pb-2 pt-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-copper">
              AxéMap Admin
            </p>
          </div>
          <AdminSidebar pathname={pathname} />
        </div>
      </aside>

      <div className="min-w-0 flex-1">
        <div className="mb-4 flex items-center gap-2 lg:hidden">
          <MobileSidebar
            groups={(() => {
              const g: SidebarGroup[] = [
                {
                  label: 'Principal',
                  items: [
                    { label: 'Dashboard', href: '/admin', icon: LayoutDashboard, active: pathname === '/admin' },
                    { label: 'Usuários', href: '/admin/usuarios', icon: Users, active: pathname.startsWith('/admin/usuarios') },
                    { label: 'Mapa', href: '/admin/mapa', icon: Map, active: pathname.startsWith('/admin/mapa') },
                    { label: 'Auditoria', href: '/admin/auditoria', icon: ShieldCheck, active: pathname.startsWith('/admin/auditoria') },
                    { label: 'Integrações', href: '/admin/integracoes', icon: Cable, active: pathname.startsWith('/admin/integracoes') },
                    { label: 'Jobs', href: '/admin/jobs', icon: ListChecks, active: pathname.startsWith('/admin/jobs') },
                  ],
                },
                {
                  label: 'Conteúdo',
                  items: [
                    { label: 'Central', href: '/admin/central', icon: LayoutDashboard, active: pathname.startsWith('/admin/central') },
                    { label: 'Axé Graph', href: '/admin/axegraph', icon: Network, active: pathname.startsWith('/admin/axegraph') },
                    { label: 'Impacto', href: '/admin/impacto', icon: BarChart3, active: pathname.startsWith('/admin/impacto') },
                    { label: 'Transparência', href: '/admin/transparencia', icon: Eye, active: pathname.startsWith('/admin/transparencia') },
                  ],
                },
                {
                  label: 'Sistema',
                  items: [{ label: 'System', href: '/admin/system', icon: Server, active: pathname.startsWith('/admin/system') }],
                },
              ];
              return g;
            })()}
            ariaLabel="Navegação administrativa"
          >
            <Button variant="outline" size="icon-sm" type="button" aria-label="Abrir menu admin">
              <Menu className="size-4" />
            </Button>
          </MobileSidebar>
          <span className="text-sm font-semibold text-muted-foreground">
            <Link href="/admin" className="text-copper">AxéMap Admin</Link>
          </span>
        </div>

        <main>{children}</main>
      </div>
    </div>
  );
}
