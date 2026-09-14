import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const resources = [
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
    phone: null,
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

async function main() {
  await prisma.resource.deleteMany();
  for (const resource of resources) {
    await prisma.resource.create({
      data: {
        ...resource,
        verifiedAt: new Date('2026-09-14'),
      },
    });
  }

  const passwordHash = await bcrypt.hash('Safeguard123', 10);
  const parent = await prisma.user.upsert({
    where: { email: 'amani@safenest.ke' },
    update: {},
    create: {
      name: 'Amani Wanjiku',
      email: 'amani@safenest.ke',
      passwordHash,
      role: 'PARENT',
    },
  });

  const childUser = await prisma.user.upsert({
    where: { email: 'kito@safenest.ke' },
    update: {},
    create: {
      name: 'Kito',
      email: 'kito@safenest.ke',
      passwordHash,
      role: 'CHILD',
    },
  });

  await prisma.child.upsert({
    where: { inviteCode: 'NEST42' },
    update: { userId: childUser.id },
    create: {
      guardianId: parent.id,
      userId: childUser.id,
      displayName: 'Kito',
      ageRange: '13-15',
      inviteCode: 'NEST42',
    },
  });

  console.log('SafeNest seed complete.');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
