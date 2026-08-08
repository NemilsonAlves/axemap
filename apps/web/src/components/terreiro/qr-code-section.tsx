'use client';

import { useRef } from 'react';
import { QRCodeCanvas } from 'qrcode.react';

export function QRCodeSection({ url, slug, nome }: { url: string; slug: string; nome: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handlePrint = () => {
    const dataUrl = canvasRef.current?.toDataURL('image/png');
    if (!dataUrl) return;
    const win = window.open('', '_blank');
    if (!win) return;
    win.document.write(`
      <html><head><title>QR Code - ${nome}</title>
      <style>body{display:flex;justify-content:center;align-items:center;min-height:100vh;margin:0;background:#fff;font-family:sans-serif}
      .container{text-align:center}.qr{margin:2rem auto;width:400px;height:400px}
      .url{font-size:1.2rem;color:#333;margin-top:1rem}
      .slug{font-size:0.9rem;color:#666;margin-top:0.5rem}
      @media print{body{padding:2cm}.qr{width:500px;height:500px}}
      </style></head><body>
      <div class="container">
        <img class="qr" src="${dataUrl}" />
        <div class="url">${url}</div>
        <div class="slug">AxéMap — ${nome}</div>
      </div>
      <script>window.print()</script>
      </body></html>
    `);
    win.document.close();
  };

  return (
    <section className="section-card" id="qrcode">
      <h2 className="section-title">QR Code Oficial</h2>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
        <div style={{ padding: '0.5rem', background: '#FFFFFF', borderRadius: '8px', border: '1px solid var(--color-gray-200)' }}>
          <QRCodeCanvas
            ref={canvasRef}
            value={url}
            size={240}
            level="M"
            fgColor="#2C1810"
            bgColor="#FFFFFF"
            includeMargin={false}
          />
        </div>
        <div style={{ fontSize: '0.8rem', color: 'var(--color-gray-300)', textAlign: 'center' }}>
          Escaneie para acessar o perfil
        </div>
        <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-accent)' }}>
          axemap.com.br/t/{slug}
        </div>
        <button onClick={handlePrint} className="btn btn-outline btn-sm">
          Imprimir QR Code
        </button>
      </div>
    </section>
  );
}
