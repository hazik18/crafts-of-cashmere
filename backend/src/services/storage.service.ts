import fsp from 'node:fs/promises';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

export interface IStorageService {
  saveImage(dataUrl: string, originalFilename?: string): Promise<{ path: string }>;
  saveImages(items: Array<{ data: string; filename?: string }>): Promise<{ paths: string[] }>;
}

export class LocalStorageService implements IStorageService {
  private uploadDir: string;

  constructor() {
    this.uploadDir = path.resolve(process.cwd(), 'uploads');
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  private looksLikeImage(buf: Buffer, ext: string): boolean {
    if (buf.length < 12) return false;
    if (ext === 'jpg') return buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff;
    if (ext === 'png') return buf.readUInt32BE(0) === 0x89504e47;
    if (ext === 'webp') {
      return (
        buf.toString('ascii', 0, 4) === 'RIFF' &&
        buf.toString('ascii', 8, 12) === 'WEBP'
      );
    }
    return false;
  }

  public async saveImage(dataUrl: string, originalFilename = 'photo'): Promise<{ path: string }> {
    const match = dataUrl.match(/^data:image\/(jpeg|jpg|png|webp);base64,(.+)$/);
    if (!match) {
      throw new Error('expected data URL (jpeg/png/webp)');
    }

    const rawExt = match[1];
    const ext = rawExt === 'jpeg' ? 'jpg' : rawExt;
    const base64Data = match[2];
    const buffer = Buffer.from(base64Data, 'base64');

    if (buffer.length > 8 * 1024 * 1024) {
      throw new Error('image too large (8MB max)');
    }

    if (!this.looksLikeImage(buffer, ext)) {
      throw new Error('file content is not a valid image');
    }

    const cleanBase = originalFilename
      .replace(/\.[^.]*$/, '')
      .replace(/[^\w-]+/g, '-')
      .slice(0, 40) || 'photo';

    const uid = `${Date.now().toString(36)}${crypto.randomBytes(3).toString('hex')}`;
    const filename = `${uid}-${cleanBase}.${ext}`;
    const destination = path.join(this.uploadDir, filename);

    await fsp.writeFile(destination, buffer);

    return { path: `images/uploads/${filename}` };
  }

  public async saveImages(
    items: Array<{ data: string; filename?: string }>
  ): Promise<{ paths: string[] }> {
    if (!items.length) return { paths: [] };
    if (items.length > 20) throw new Error('max 20 images per batch');

    const results = await Promise.all(
      items.map((item) => this.saveImage(item.data, item.filename || 'photo'))
    );
    return { paths: results.map((r) => r.path) };
  }
}

export const storageService: IStorageService = new LocalStorageService();
