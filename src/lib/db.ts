import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

// Check if we are using SQLite and need to copy it to /tmp for Vercel write-support
const databaseUrl = process.env.DATABASE_URL || '';
if (databaseUrl.startsWith('file:')) {
  // If we are in Vercel/Serverless environment, copy SQLite file to /tmp
  const isVercel = process.env.VERCEL || process.env.NOW_BUILDER || process.env.NODE_ENV === 'production';
  if (isVercel) {
    const dbName = 'dev.db';
    const sourcePath = path.join(process.cwd(), 'prisma', dbName);
    const destPath = path.join('/tmp', dbName);

    try {
      if (fs.existsSync(sourcePath)) {
        // Ensure /tmp directory exists
        const tmpDir = path.dirname(destPath);
        if (!fs.existsSync(tmpDir)) {
          fs.mkdirSync(tmpDir, { recursive: true });
        }
        
        // Copy the file to /tmp if it doesn't exist yet
        if (!fs.existsSync(destPath)) {
          fs.copyFileSync(sourcePath, destPath);
          console.log(`Successfully copied SQLite DB from ${sourcePath} to ${destPath}`);
        } else {
          console.log(`SQLite DB already exists at ${destPath}`);
        }
        
        // Override process.env.DATABASE_URL for the prisma client
        process.env.DATABASE_URL = `file:${destPath}`;
      } else {
        console.error(`SQLite DB source file not found at ${sourcePath}`);
      }
    } catch (err) {
      console.error('Error copying SQLite database to /tmp:', err);
    }
  }
}

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

