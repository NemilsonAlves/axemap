import * as React from 'react';
import { ChevronRight, MoreHorizontal } from 'lucide-react';
import { cn } from '@/lib/cn';
import { Slot } from '@radix-ui/react-slot';

const Breadcrumb = React.forwardRef<
  HTMLElement,
  React.HTMLAttributes<HTMLElement> & { separator?: React.ReactNode }
>(({ className, ...props }, ref) => (
  <nav ref={ref} aria-label="breadcrumb" className={cn('flex items-center gap-1 text-sm', className)} {...props} />
));
Breadcrumb.displayName = 'Breadcrumb';

const BreadcrumbList = React.forwardRef<HTMLOListElement, React.OlHTMLAttributes<HTMLOListElement>>(
  ({ className, ...props }, ref) => (
    <ol className={cn('flex flex-wrap items-center gap-1.5 break-words', className)} ref={ref} {...props} />
  ),
);
BreadcrumbList.displayName = 'BreadcrumbList';

const BreadcrumbItem = React.forwardRef<HTMLLIElement, React.LiHTMLAttributes<HTMLLIElement>>(
  ({ className, ...props }, ref) => (
    <li className={cn('inline-flex items-center gap-1.5', className)} ref={ref} {...props} />
  ),
);
BreadcrumbItem.displayName = 'BreadcrumbItem';

const BreadcrumbLink = React.forwardRef<
  HTMLAnchorElement,
  React.AnchorHTMLAttributes<HTMLAnchorElement> & { asChild?: boolean }
>(({ className, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'a';
  return (
    <Comp
      ref={ref}
      className={cn(
        'font-medium text-muted-foreground transition-colors duration-[var(--duration-fast)] hover:text-copper-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40',
        className,
      )}
      {...props}
    />
  );
});
BreadcrumbLink.displayName = 'BreadcrumbLink';

const BreadcrumbPage = React.forwardRef<HTMLSpanElement, React.HTMLAttributes<HTMLSpanElement>>(
  ({ className, ...props }, ref) => (
    <span
      ref={ref}
      aria-current="page"
      className={cn('font-semibold text-foreground', className)}
      {...props}
    />
  ),
);
BreadcrumbPage.displayName = 'BreadcrumbPage';

const BreadcrumbSeparator = ({ className, ...props }: React.ComponentProps<'li'>) => (
  <li
    role="presentation"
    aria-hidden="true"
    className={cn('[&>svg]:size-3.5 text-muted-foreground/60', className)}
    {...props}
  >
    <ChevronRight />
  </li>
);
BreadcrumbSeparator.displayName = 'BreadcrumbSeparator';

const BreadcrumbEllipsis = ({ className, ...props }: React.ComponentProps<'span'>) => (
  <span
    role="presentation"
    aria-hidden="true"
    className={cn('flex h-9 w-9 items-center justify-center', className)}
    {...props}
  >
    <MoreHorizontal className="size-4" />
    <span className="sr-only">Mais</span>
  </span>
);
BreadcrumbEllipsis.displayName = 'BreadcrumbElipssis';

export {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbEllipsis,
};