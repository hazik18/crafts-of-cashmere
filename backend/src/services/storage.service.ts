import fsp from 'node:fs/promises';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { v2 as cloudinary } from 'cloudinary';

export interface IStorageService {
  saveImage(dataUrl: string, originalFilename?: string): Promise<{ path: string }>;
  saveImages(items: Array<{ data: string; filename?: string }>): Promise<{ paths: string[] }>;
  deleteImage(pathOrUrl: string): Promise<boolean>;
  deleteImages(pathsOrUrls: string[]): Promise<void>;
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

  public async deleteImage(pathOrUrl: string): Promise<boolean> {
    if (!pathOrUrl || typeof pathOrUrl !== 'string') return false;

    // Only delete uploaded files, not bundled static assets (e.g. images/pashmina/1.jpg)
    if (!pathOrUrl.includes('images/uploads/')) {
      return false;
    }

    try {
      const filename = path.basename(pathOrUrl);
      const targetPath = path.resolve(this.uploadDir, filename);

      // Prevent directory traversal
      if (!targetPath.startsWith(this.uploadDir)) {
        return false;
      }

      if (fs.existsSync(targetPath)) {
        await fsp.unlink(targetPath);
        return true;
      }
    } catch (err) {
      console.error(`Failed to delete local image ${pathOrUrl}:`, err);
    }
    return false;
  }

  public async deleteImages(pathsOrUrls: string[]): Promise<void> {
    if (!Array.isArray(pathsOrUrls) || pathsOrUrls.length === 0) return;
    await Promise.allSettled(pathsOrUrls.map((p) => this.deleteImage(p)));
  }
}

export class CloudinaryStorageService implements IStorageService {
  constructor() {
    if (process.env.CLOUDINARY_URL) {
      cloudinary.config();
    } else {
      cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
        secure: true,
      });
    }
  }

  public async saveImage(dataUrl: string, originalFilename = 'photo'): Promise<{ path: string }> {
    const match = dataUrl.match(/^data:image\/(jpeg|jpg|png|webp);base64,(.+)$/);
    if (!match) {
      throw new Error('expected data URL (jpeg/png/webp)');
    }

    const cleanBase = originalFilename
      .replace(/\.[^.]*$/, '')
      .replace(/[^\w-]+/g, '-')
      .slice(0, 40) || 'photo';

    const uploadResult = await cloudinary.uploader.upload(dataUrl, {
      folder: 'crafts-of-cashmere',
      public_id: `${Date.now().toString(36)}-${cleanBase}`,
      resource_type: 'image',
    });

    return { path: uploadResult.secure_url };
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

  public async deleteImage(pathOrUrl: string): Promise<boolean> {
    if (!pathOrUrl || typeof pathOrUrl !== 'string') return false;

    // Cloudinary URL handling
    if (pathOrUrl.includes('res.cloudinary.com')) {
      try {
        // Match path after /upload/(v1234/)? and before file extension
        const match = pathOrUrl.match(/\/upload\/(?:v\d+\/)?(.+)\.[a-zA-Z0-9]+$/);
        const publicId = match ? match[1] : null;
        if (publicId) {
          await cloudinary.uploader.destroy(publicId);
          return true;
        }
      } catch (err) {
        console.error(`Failed to delete Cloudinary asset ${pathOrUrl}:`, err);
        return false;
      }
    }

    // Fallback: local uploaded file if migrating or mixed
    if (pathOrUrl.includes('images/uploads/')) {
      try {
        const uploadDir = path.resolve(process.cwd(), 'uploads');
        const filename = path.basename(pathOrUrl);
        const targetPath = path.resolve(uploadDir, filename);
        if (targetPath.startsWith(uploadDir) && fs.existsSync(targetPath)) {
          await fsp.unlink(targetPath);
          return true;
        }
      } catch {
        // ignore
      }
    }

    return false;
  }

  public async deleteImages(pathsOrUrls: string[]): Promise<void> {
    if (!Array.isArray(pathsOrUrls) || pathsOrUrls.length === 0) return;
    await Promise.allSettled(pathsOrUrls.map((p) => this.deleteImage(p)));
  }
}

const isCloudinaryConfigured = Boolean(
  process.env.CLOUDINARY_URL ||
  (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET)
);

export const storageService: IStorageService = isCloudinaryConfigured
  ? new CloudinaryStorageService()
  : new LocalStorageService();
