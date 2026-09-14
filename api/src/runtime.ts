import { mkdirSync } from 'fs';
import { join } from 'path';

export function isVercel() {
  return Boolean(process.env.VERCEL);
}

export function uploadDir() {
  return process.env.UPLOAD_DIR || (isVercel() ? '/tmp/safenest-uploads' : join(process.cwd(), 'uploads'));
}

/** Must run before Nest/Prisma start so SQLite has a writable path on Vercel. */
export function configureRuntime() {
  if (isVercel()) {
    if (!process.env.DATABASE_URL || process.env.DATABASE_URL.startsWith('file:')) {
      process.env.DATABASE_URL = 'file:/tmp/safenest.db';
    }
    process.env.UPLOAD_DIR = process.env.UPLOAD_DIR || '/tmp/safenest-uploads';
    if (!process.env.JWT_SECRET) process.env.JWT_SECRET = 'safenest-hackathon-demo-secret';
    if (!process.env.EVIDENCE_KEY) process.env.EVIDENCE_KEY = 'safenest-evidence-key-change-me-32b';
  }
  mkdirSync(uploadDir(), { recursive: true });
}
