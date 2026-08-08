interface HeroProps {
  titulo: string;
  subtitulo: string;
  totalTerreiro: number;
  totalVerificados: number;
}

export function LandingHero({ titulo, subtitulo, totalTerreiro, totalVerificados }: HeroProps) {
  return (
    <section className="bg-gradient-to-br from-primary/10 via-primary/5 to-background border-b rounded-lg mb-8">
      <div className="container mx-auto px-4 py-12 md:py-16">
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
          {titulo}
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mb-6">
          {subtitulo}
        </p>
        <div className="flex flex-wrap gap-6 text-sm">
          <div className="bg-card border rounded-lg px-4 py-3">
            <span className="block text-2xl font-bold text-primary">{totalTerreiro}</span>
            <span className="text-muted-foreground">Terreiros cadastrados</span>
          </div>
          <div className="bg-card border rounded-lg px-4 py-3">
            <span className="block text-2xl font-bold text-green-600">{totalVerificados}</span>
            <span className="text-muted-foreground">Terreiros verificados</span>
          </div>
        </div>
      </div>
    </section>
  );
}
