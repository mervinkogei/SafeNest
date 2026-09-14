import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

export const KENYA_RESOURCES = [
  {
    name: 'National Child Helpline 116',
    country: 'Kenya',
    riskTypes: 'cyberbullying,harassment,threat,grooming_indicator,sexual_harassment,coercion,hate_abuse,impersonation,other',
    description:
      'Kenya’s 24-hour toll-free child helpline, run with the State Department for Children Services. Children and caregivers can report distress, get counselling, and be referred to protection services.',
    website: 'https://childlinekenya.co.ke/',
    phone: '116',
    emergency: true,
    source: 'https://childlinekenya.co.ke/contact-us.html',
  },
  {
    name: 'Kenya Police / Ambulance emergency',
    country: 'Kenya',
    riskTypes: 'threat,grooming_indicator,sexual_harassment,coercion',
    description:
      'Use if a child is in immediate physical danger. Call 999 or 112 from any phone in Kenya.',
    website: 'https://www.nationalpolice.go.ke/',
    phone: '999 / 112',
    emergency: true,
    source: 'National Police Service emergency numbers',
  },
  {
    name: 'National GBV Helpline 1195',
    country: 'Kenya',
    riskTypes: 'sexual_harassment,coercion,grooming_indicator,threat,hate_abuse',
    description:
      'Toll-free 24/7 gender-based violence helpline operated with Healthcare Assistance Kenya. Offers confidential counselling and referrals to medical, shelter, and legal support.',
    website: 'https://hakgbv1195.org/',
    phone: '1195',
    emergency: true,
    source: 'https://www.migecah.go.ke/index.php/gbv-prevention-and-response',
  },
  {
    name: 'National KE-CIRT/CC',
    country: 'Kenya',
    riskTypes: 'cyberbullying,harassment,impersonation,other,hate_abuse',
    description:
      'Kenya’s national computer incident response team at the Communications Authority. Use the child online abuse reporting form for platform-related cyber incidents.',
    website: 'https://ke-cirt.go.ke/',
    phone: '+254 703 042700',
    emergency: false,
    source: 'https://ke-cirt.go.ke/contact-us/',
  },
  {
    name: 'Fichua kwa DCI',
    country: 'Kenya',
    riskTypes: 'threat,grooming_indicator,sexual_harassment,impersonation,coercion',
    description:
      'Directorate of Criminal Investigations anonymous crime reporting line for cases that may need police investigation.',
    website: 'https://www.dci.go.ke/',
    phone: '0800 722 203',
    emergency: false,
    source: 'Directorate of Criminal Investigations public reporting line',
  },
  {
    name: 'WhatsApp Safety Centre',
    country: 'Global',
    riskTypes: 'cyberbullying,harassment,threat,sexual_harassment,grooming_indicator,impersonation',
    description:
      'Official steps to block, report, and restrict accounts on WhatsApp. Use this instead of asking a child for their password.',
    website: 'https://www.whatsapp.com/safety',
    phone: null as string | null,
    emergency: false,
    source: 'https://www.whatsapp.com/safety',
  },
  {
    name: 'Department of Children Services',
    country: 'Kenya',
    riskTypes: 'cyberbullying,harassment,grooming_indicator,sexual_harassment,other',
    description:
      'Government child protection offices that work with Helpline 116 to coordinate county and sub-county responses.',
    website: 'https://www.childrenservices.go.ke/child-helpline-116',
    phone: '116',
    emergency: false,
    source: 'https://www.childrenservices.go.ke/child-helpline-116',
  },
];

const SCHEMA_SQL = [
  `CREATE TABLE IF NOT EXISTS "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "resetCodeHash" TEXT,
    "resetExpires" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS "Child" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "guardianId" TEXT NOT NULL,
    "userId" TEXT,
    "displayName" TEXT NOT NULL,
    "ageRange" TEXT NOT NULL,
    "inviteCode" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Child_guardianId_fkey" FOREIGN KEY ("guardianId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Child_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
  )`,
  `CREATE TABLE IF NOT EXISTS "Incident" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "childId" TEXT NOT NULL,
    "reportedBy" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "riskType" TEXT,
    "severity" TEXT,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Incident_childId_fkey" FOREIGN KEY ("childId") REFERENCES "Child" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Incident_reportedBy_fkey" FOREIGN KEY ("reportedBy") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
  )`,
  `CREATE TABLE IF NOT EXISTS "Evidence" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "incidentId" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "fileType" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Evidence_incidentId_fkey" FOREIGN KEY ("incidentId") REFERENCES "Incident" ("id") ON DELETE CASCADE ON UPDATE CASCADE
  )`,
  `CREATE TABLE IF NOT EXISTS "AiAssessment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "incidentId" TEXT NOT NULL,
    "riskType" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "confidence" REAL NOT NULL,
    "indicators" TEXT NOT NULL,
    "explanation" TEXT NOT NULL,
    "immediateSafetyConcern" BOOLEAN NOT NULL DEFAULT false,
    "recommendedActions" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AiAssessment_incidentId_fkey" FOREIGN KEY ("incidentId") REFERENCES "Incident" ("id") ON DELETE CASCADE ON UPDATE CASCADE
  )`,
  `CREATE TABLE IF NOT EXISTS "Resource" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "riskTypes" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "website" TEXT NOT NULL,
    "phone" TEXT,
    "emergency" BOOLEAN NOT NULL DEFAULT false,
    "verifiedAt" DATETIME NOT NULL,
    "source" TEXT NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS "Notification" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
  )`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "User_email_key" ON "User"("email")`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "Child_userId_key" ON "Child"("userId")`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "Child_inviteCode_key" ON "Child"("inviteCode")`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "AiAssessment_incidentId_key" ON "AiAssessment"("incidentId")`,
];

async function exec(prisma: PrismaClient, sql: string) {
  try {
    await prisma.$executeRawUnsafe(sql);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (!/duplicate column|already exists/i.test(message)) throw error;
  }
}

export async function ensureSqliteSchema(prisma: PrismaClient) {
  await prisma.$executeRawUnsafe('PRAGMA foreign_keys = ON');
  for (const sql of SCHEMA_SQL) await exec(prisma, sql);
  await exec(prisma, 'ALTER TABLE "User" ADD COLUMN "resetCodeHash" TEXT');
  await exec(prisma, 'ALTER TABLE "User" ADD COLUMN "resetExpires" DATETIME');
}

export async function seedAppData(prisma: PrismaClient) {
  if ((await prisma.resource.count()) === 0) {
    for (const resource of KENYA_RESOURCES) {
      await prisma.resource.create({
        data: { ...resource, verifiedAt: new Date('2026-09-14') },
      });
    }
  }

  const existing = await prisma.user.findUnique({ where: { email: 'amani@safenest.ke' } });
  if (existing) return;

  const passwordHash = await bcrypt.hash('Safeguard123', 10);
  const parent = await prisma.user.create({
    data: {
      name: 'Amani Wanjiku',
      email: 'amani@safenest.ke',
      passwordHash,
      role: 'PARENT',
    },
  });
  const childUser = await prisma.user.create({
    data: {
      name: 'Kito',
      email: 'kito@safenest.ke',
      passwordHash,
      role: 'CHILD',
    },
  });
  await prisma.child.create({
    data: {
      guardianId: parent.id,
      userId: childUser.id,
      displayName: 'Kito',
      ageRange: '13-15',
      inviteCode: 'NEST42',
    },
  });
}
