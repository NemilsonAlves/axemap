interface PanoramaProps {
  panorama: string;
  perfilComunidade: string;
}

function BookOpenIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
    </svg>
  );
}

function UsersIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

export function LandingPanorama({ panorama, perfilComunidade }: PanoramaProps) {
  if (!panorama && !perfilComunidade) return null;

  return (
    <section className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
      {panorama && (
        <div className="bg-card border rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <BookOpenIcon />
            </div>
            <h3 className="text-lg font-semibold text-foreground">Panorama</h3>
          </div>
          <p className="text-muted-foreground leading-relaxed">{panorama}</p>
        </div>
      )}
      {perfilComunidade && (
        <div className="bg-card border rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <UsersIcon />
            </div>
            <h3 className="text-lg font-semibold text-foreground">Perfil da Comunidade</h3>
          </div>
          <p className="text-muted-foreground leading-relaxed">{perfilComunidade}</p>
        </div>
      )}
    </section>
  );
}
