import { BadRequestException } from '@nestjs/common';

const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/avif',
  'image/gif',
  'video/mp4',
  'video/webm',
  'video/quicktime',
]);

const AVATAR_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);

function mimeFileFilter(
  _req: any,
  file: { mimetype: string },
  callback: (error: Error | null, accept?: boolean) => void,
) {
  if (ALLOWED_MIME_TYPES.has(file.mimetype)) {
    callback(null, true);
  } else {
    callback(new BadRequestException('Formato não suportado. Use JPEG, PNG, WebP, AVIF, GIF, MP4, WebM ou MOV.'));
  }
}

function avatarFileFilter(
  _req: any,
  file: { mimetype: string },
  callback: (error: Error | null, accept?: boolean) => void,
) {
  if (AVATAR_MIME_TYPES.has(file.mimetype)) {
    callback(null, true);
  } else {
    callback(new BadRequestException('Formato inválido. Use JPEG, PNG ou WebP.'));
  }
}

describe('Upload fileFilter', () => {
  describe('mimeFileFilter (upload genérico)', () => {
    const callback = jest.fn();

    beforeEach(() => {
      callback.mockClear();
    });

    it('aceita image/jpeg', () => {
      mimeFileFilter({}, { mimetype: 'image/jpeg' }, callback);
      expect(callback).toHaveBeenCalledWith(null, true);
    });

    it('aceita image/png', () => {
      mimeFileFilter({}, { mimetype: 'image/png' }, callback);
      expect(callback).toHaveBeenCalledWith(null, true);
    });

    it('aceita image/webp', () => {
      mimeFileFilter({}, { mimetype: 'image/webp' }, callback);
      expect(callback).toHaveBeenCalledWith(null, true);
    });

    it('aceita image/avif', () => {
      mimeFileFilter({}, { mimetype: 'image/avif' }, callback);
      expect(callback).toHaveBeenCalledWith(null, true);
    });

    it('aceita image/gif', () => {
      mimeFileFilter({}, { mimetype: 'image/gif' }, callback);
      expect(callback).toHaveBeenCalledWith(null, true);
    });

    it('aceita video/mp4', () => {
      mimeFileFilter({}, { mimetype: 'video/mp4' }, callback);
      expect(callback).toHaveBeenCalledWith(null, true);
    });

    it('aceita video/webm', () => {
      mimeFileFilter({}, { mimetype: 'video/webm' }, callback);
      expect(callback).toHaveBeenCalledWith(null, true);
    });

    it('aceita video/quicktime', () => {
      mimeFileFilter({}, { mimetype: 'video/quicktime' }, callback);
      expect(callback).toHaveBeenCalledWith(null, true);
    });

    it('rejeita application/x-executable', () => {
      mimeFileFilter({}, { mimetype: 'application/x-executable' }, callback);
      expect(callback).toHaveBeenCalledWith(expect.any(BadRequestException));
    });

    it('rejeita text/html', () => {
      mimeFileFilter({}, { mimetype: 'text/html' }, callback);
      expect(callback).toHaveBeenCalledWith(expect.any(BadRequestException));
    });

    it('rejeita application/javascript', () => {
      mimeFileFilter({}, { mimetype: 'application/javascript' }, callback);
      expect(callback).toHaveBeenCalledWith(expect.any(BadRequestException));
    });

    it('rejeita application/pdf', () => {
      mimeFileFilter({}, { mimetype: 'application/pdf' }, callback);
      expect(callback).toHaveBeenCalledWith(expect.any(BadRequestException));
    });

    it('rejeita MIME arbitrário', () => {
      mimeFileFilter({}, { mimetype: 'x-custom/anything' }, callback);
      expect(callback).toHaveBeenCalledWith(expect.any(BadRequestException));
    });
  });

  describe('avatarFileFilter (avatar)', () => {
    const callback = jest.fn();

    beforeEach(() => {
      callback.mockClear();
    });

    it('aceita image/jpeg', () => {
      avatarFileFilter({}, { mimetype: 'image/jpeg' }, callback);
      expect(callback).toHaveBeenCalledWith(null, true);
    });

    it('aceita image/png', () => {
      avatarFileFilter({}, { mimetype: 'image/png' }, callback);
      expect(callback).toHaveBeenCalledWith(null, true);
    });

    it('aceita image/webp', () => {
      avatarFileFilter({}, { mimetype: 'image/webp' }, callback);
      expect(callback).toHaveBeenCalledWith(null, true);
    });

    it('rejeita image/avif', () => {
      avatarFileFilter({}, { mimetype: 'image/avif' }, callback);
      expect(callback).toHaveBeenCalledWith(expect.any(BadRequestException));
    });

    it('rejeita image/gif', () => {
      avatarFileFilter({}, { mimetype: 'image/gif' }, callback);
      expect(callback).toHaveBeenCalledWith(expect.any(BadRequestException));
    });

    it('rejeita video/mp4', () => {
      avatarFileFilter({}, { mimetype: 'video/mp4' }, callback);
      expect(callback).toHaveBeenCalledWith(expect.any(BadRequestException));
    });

    it('rejeita text/html', () => {
      avatarFileFilter({}, { mimetype: 'text/html' }, callback);
      expect(callback).toHaveBeenCalledWith(expect.any(BadRequestException));
    });
  });
});
