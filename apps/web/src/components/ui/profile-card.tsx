import * as React from 'react';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, ArrowUpRight } from 'lucide-react';
import { cn } from '@/lib/cn';

interface ProfileCardProps extends React.HTMLAttributes<HTMLDivElement> {
  name: string;
  role?: string;
  location?: string;
  image?: string;
  verified?: boolean;
  tagline?: string;
  actions?: React.ReactNode;
}

export function ProfileCard({
  name,
  role,
  location,
  image,
  verified,
  tagline,
  actions,
  className,
  ...props
}: ProfileCardProps) {
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <Card interactive className={cn('card-shine p-6', className)} {...props}>
      <div className="flex items-start justify-between gap-3">
        <Avatar className="size-14 border-2 border-copper/20">
          <AvatarImage src={image} alt={name} />
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
        {verified && <Badge variant="solid">Verificado</Badge>}
      </div>
      <div className="mt-4 flex flex-col gap-1">
        <h3 className="font-display text-lg font-semibold tracking-tight text-foreground">{name}</h3>
        {role && <p className="text-sm font-medium text-copper-strong">{role}</p>}
        {tagline && <p className="mt-1 text-sm text-muted-foreground">{tagline}</p>}
        {location && (
          <p className="mt-1 inline-flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="size-3.5" />
            {location}
          </p>
        )}
      </div>
      {actions && <div className="mt-5 flex items-center gap-2">{actions}</div>}
    </Card>
  );
}

interface MapCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  subtitle?: string;
  distance?: string;
  image?: string;
  verified?: boolean;
  children?: React.ReactNode;
}

export function MapCard({
  title,
  subtitle,
  distance,
  image,
  verified,
  children,
  className,
  ...props
}: MapCardProps) {
  return (
    <Card interactive className={cn('card-shine overflow-hidden', className)} {...props}>
      <div className="relative h-40 w-full overflow-hidden bg-hero">
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={image} alt={title} className="size-full object-cover" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="grid size-24 grid-cols-3 gap-1 opacity-60">
              {Array.from({ length: 9 }).map((_, i) => (
                <span key={i} className="rounded-[3px] bg-white/20" />
              ))}
            </div>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        {distance && (
          <span className="absolute right-3 top-3 rounded-full bg-card/90 px-2.5 py-1 text-xs font-semibold text-foreground shadow-sm backdrop-blur">
            {distance}
          </span>
        )}
      </div>
      <div className="p-5">
        <div className="flex items-center justify-between gap-3">
          <h3 className="font-display text-base font-semibold tracking-tight text-foreground">{title}</h3>
          {verified && <Badge variant="solid">Verificado</Badge>}
        </div>
        {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
        {children && <div className="mt-4">{children}</div>}
      </div>
    </Card>
  );
}

interface ActionRowProps {
  href?: string;
  label: string;
  className?: string;
}

export function CardAction({ href, label, className }: ActionRowProps) {
  return (
    <Button
      asChild
      variant="ghost"
      size="sm"
      className={cn('group px-0 text-copper-strong', className)}
    >
      <a href={href}>
        {label}
        <ArrowUpRight className="size-4 transition-transform duration-[var(--duration-base)] group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
      </a>
    </Button>
  );
}