import fs from 'node:fs';
import fsp from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import { Subscriber } from '../types/index.js';

const resolveDataDir = (): string => {
  const inBackend = path.resolve(process.cwd(), 'backend', 'data');
  if (fs.existsSync(inBackend)) {
    return inBackend;
  }
  return path.resolve(process.cwd(), 'data');
};

const DATA_DIR = resolveDataDir();
const SUBS_FILE = path.join(DATA_DIR, 'subscribers.json');

const writeQueues = new Map<string, Promise<void>>();

function writeJSONAtomic<T>(file: string, value: T): Promise<void> {
  const data = JSON.stringify(value, null, 2);
  const run = async () => {
    const tmp = `${file}.${crypto.randomBytes(6).toString('hex')}.tmp`;
    await fsp.writeFile(tmp, data, 'utf8');
    await fsp.rename(tmp, file);
  };
  const next = (writeQueues.get(file) || Promise.resolve()).catch(() => {}).then(run);
  writeQueues.set(file, next);
  return next;
}

export class SubscribersRepository {
  private subscribers: Subscriber[] = [];

  constructor() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (fs.existsSync(SUBS_FILE)) {
      try {
        this.subscribers = JSON.parse(fs.readFileSync(SUBS_FILE, 'utf8')) as Subscriber[];
      } catch (err) {
        console.error('Failed to parse subscribers.json:', err);
        this.subscribers = [];
      }
    }
  }

  public getSubscribers(): Subscriber[] {
    return this.subscribers;
  }

  public hasEmail(email: string): boolean {
    const normalized = email.trim().toLowerCase();
    return this.subscribers.some((s) => s.email.toLowerCase() === normalized);
  }

  public async addSubscriber(email: string): Promise<Subscriber> {
    const normalized = email.trim().toLowerCase();
    const entry: Subscriber = {
      email: normalized,
      at: new Date().toISOString(),
    };
    if (!this.hasEmail(normalized)) {
      this.subscribers.push(entry);
      await writeJSONAtomic(SUBS_FILE, this.subscribers);
    }
    return entry;
  }
}

export const subscribersRepository = new SubscribersRepository();
