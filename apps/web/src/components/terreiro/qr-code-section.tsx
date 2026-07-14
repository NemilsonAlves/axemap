'use client';

import { useEffect, useRef } from 'react';

function generateQR(text: string, size: number): string {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  const bg = '#FFFFFF';
  const fg = '#2C1810';

  const segments = text.split('').map((c) => c.charCodeAt(0));
  const totalBits = segments.length * 8;
  const dim = Math.ceil(Math.sqrt(totalBits + 4)) + 2;
  const cell = Math.floor(size / dim);

  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, size, size);
  ctx.fillStyle = fg;

  let bitIdx = 0;
  for (let row = 0; row < dim - 2; row++) {
    for (let col = 0; col < dim - 2; col++) {
      if (bitIdx < totalBits) {
        const byteIdx = Math.floor(bitIdx / 8);
        const bitOffset = 7 - (bitIdx % 8);
        const bit = (segments[byteIdx] >> bitOffset) & 1;
        if (bit) {
          ctx.fillRect((col + 1) * cell, (row + 1) * cell, cell, cell);
        }
        bitIdx++;
      }
    }
  }

  const finderSize = 7;
  ctx.fillStyle = fg;
  for (const [fr, fc] of [[0, 0], [0, dim - finderSize], [dim - finderSize, 0]]) {
    for (let r = 0; r < finderSize; r++) {
      for (let c = 0; c < finderSize; c++) {
        if (r === 0 || r === finderSize - 1 || c === 0 || c === finderSize - 1 ||
            (r >= 2 && r <= finderSize - 3 && c >= 2 && c <= finderSize - 3)) {
          ctx.fillRect((fr + r + 1) * cell, (fc + c + 1) * cell, cell, cell);
        }
      }
    }
  }

  return canvas.toDataURL('image/png');
}

export function QRCodeSection({ url, slug, nome }: { url: string; slug: string; nome: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const qrSize = 240;

  useEffect(() => {
    const dataUrl = generateQR(url, qrSize);
    const img = new Image();
    img.onload = () => {
      const ctx = canvasRef.current?.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0);
      }
    };
    img.src = dataUrl;
  }, [url]);

  const handlePrint = () => {
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
        <img class="qr" src="${canvasRef.current?.toDataURL('image/png')}" />
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
        <canvas
          ref={canvasRef}
          width={qrSize}
          height={qrSize}
          style={{ borderRadius: '8px', border: '1px solid var(--color-gray-200)' }}
        />
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
