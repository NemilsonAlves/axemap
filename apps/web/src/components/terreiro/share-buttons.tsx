'use client';

export function ShareButtons({ url, title }: { url: string; title: string }) {
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  const shareLinks = [
    {
      name: 'WhatsApp',
      href: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
      label: 'Compartilhar no WhatsApp',
    },
    {
      name: 'Telegram',
      href: `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`,
      label: 'Compartilhar no Telegram',
    },
    {
      name: 'X',
      href: `https://x.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`,
      label: 'Compartilhar no X',
    },
    {
      name: 'Facebook',
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      label: 'Compartilhar no Facebook',
    },
    {
      name: 'LinkedIn',
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      label: 'Compartilhar no LinkedIn',
    },
  ];

  return (
    <div className="share-buttons">
      <span className="share-label">Compartilhar</span>
      <div className="share-icons">
        {shareLinks.map((link) => (
          <a
            key={link.name}
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            className="share-icon-btn"
            title={link.label}
          >
            {link.name}
          </a>
        ))}
      </div>
    </div>
  );
}
