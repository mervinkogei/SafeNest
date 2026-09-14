import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from 'crypto';
import { mkdirSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { User } from '@prisma/client';
import { PrismaService } from '../prisma.service';
import { AiService } from '../ai/ai.service';
import { ChildrenService } from '../children/children.service';

const UPLOAD_DIR = join(process.cwd(), 'uploads');

@Injectable()
export class IncidentsService {
  constructor(
    private prisma: PrismaService,
    private ai: AiService,
    private children: ChildrenService,
  ) {
    mkdirSync(UPLOAD_DIR, { recursive: true });
  }

  private async assertAccess(user: User, incidentId: string) {
    const incident = await this.prisma.incident.findUnique({
      where: { id: incidentId },
      include: {
        child: true,
        evidence: { orderBy: { createdAt: 'asc' } },
        assessment: true,
        reporter: { select: { id: true, name: true, role: true } },
      },
    });
    if (!incident) throw new NotFoundException('Incident not found.');
    const allowed =
      incident.reportedBy === user.id ||
      incident.child.guardianId === user.id ||
      incident.child.userId === user.id;
    if (!allowed) throw new ForbiddenException();
    return incident;
  }

  async create(
    user: User,
    body: { childId?: string; platform: string; description: string; category: string },
  ) {
    let childId = body.childId;
    if (user.role === 'CHILD') {
      const linked = await this.children.getLinkedChild(user);
      if (!linked) throw new BadRequestException('This account is not linked to a family profile yet.');
      childId = linked.id;
    }
    if (!childId) throw new BadRequestException('Choose which child this incident is about.');

    const child = await this.prisma.child.findUnique({ where: { id: childId } });
    if (!child) throw new NotFoundException('Child profile not found.');
    if (user.role === 'PARENT' && child.guardianId !== user.id) throw new ForbiddenException();

    const incident = await this.prisma.incident.create({
      data: {
        childId,
        reportedBy: user.id,
        platform: body.platform,
        description: body.description,
        category: body.category,
        status: 'OPEN',
      },
    });

    if (user.role === 'CHILD') {
      await this.prisma.notification.create({
        data: {
          userId: child.guardianId,
          title: `${child.displayName} asked for help`,
          body: 'A young person used SafeNest to say something happened online. Open the incident when you can.',
        },
      });
    }

    return incident;
  }

  async list(user: User) {
    const where =
      user.role === 'PARENT'
        ? { child: { guardianId: user.id } }
        : { OR: [{ reportedBy: user.id }, { child: { userId: user.id } }] };
    return this.prisma.incident.findMany({
      where,
      include: { child: true, assessment: true, evidence: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async get(user: User, id: string) {
    const incident = await this.assertAccess(user, id);
    const resources = incident.assessment
      ? await this.prisma.resource.findMany({
          where: {
            OR: [
              { riskTypes: { contains: incident.assessment.riskType } },
              { emergency: true },
            ],
          },
        })
      : [];
    return {
      ...incident,
      assessment: incident.assessment
        ? {
            ...incident.assessment,
            indicators: JSON.parse(incident.assessment.indicators),
            recommendedActions: JSON.parse(incident.assessment.recommendedActions),
          }
        : null,
      resources: this.uniqueResources(resources, incident.assessment?.riskType),
    };
  }

  async addEvidence(user: User, id: string, file?: Express.Multer.File, note?: string, platform?: string) {
    const incident = await this.assertAccess(user, id);
    if (!file && !note) throw new BadRequestException('Upload a screenshot or write what happened.');

    if (note || platform) {
      await this.prisma.incident.update({
        where: { id: incident.id },
        data: {
          description: note ? [incident.description, note].filter(Boolean).join('\n\n') : incident.description,
          platform: platform || incident.platform,
        },
      });
    }

    if (!file) return this.get(user, id);

    const encrypted = this.encrypt(file.buffer);
    const filename = `${id}-${Date.now()}.enc`;
    writeFileSync(join(UPLOAD_DIR, filename), encrypted);

    await this.prisma.evidence.create({
      data: {
        incidentId: id,
        fileUrl: `/uploads/${filename}`,
        fileType: file.mimetype || 'image/jpeg',
      },
    });
    return this.get(user, id);
  }

  decryptFile(filename: string) {
    const buf = readFileSync(join(UPLOAD_DIR, filename));
    return this.decrypt(buf);
  }

  async analyze(user: User, id: string) {
    const incident = await this.assertAccess(user, id);
    const assessment = await this.ai.analyze({
      description: incident.description,
      category: incident.category,
    });
    const saved = await this.prisma.aiAssessment.upsert({
      where: { incidentId: id },
      update: {
        riskType: assessment.riskType,
        severity: assessment.severity,
        confidence: assessment.confidence,
        indicators: JSON.stringify(assessment.indicators),
        explanation: assessment.explanation,
        immediateSafetyConcern: assessment.immediateSafetyConcern,
        recommendedActions: JSON.stringify(assessment.recommendedActions),
      },
      create: {
        incidentId: id,
        riskType: assessment.riskType,
        severity: assessment.severity,
        confidence: assessment.confidence,
        indicators: JSON.stringify(assessment.indicators),
        explanation: assessment.explanation,
        immediateSafetyConcern: assessment.immediateSafetyConcern,
        recommendedActions: JSON.stringify(assessment.recommendedActions),
      },
    });
    await this.prisma.incident.update({
      where: { id },
      data: {
        riskType: assessment.riskType,
        severity: assessment.severity,
        status: assessment.immediateSafetyConcern ? 'NEEDS_ATTENTION' : 'OPEN',
      },
    });
    return {
      ...saved,
      indicators: assessment.indicators,
      recommendedActions: assessment.recommendedActions,
    };
  }

  async actionPlan(user: User, id: string) {
    const incident = await this.get(user, id);
    if (!incident.assessment) throw new BadRequestException('Analyse the incident first.');
    return {
      severity: incident.assessment.severity,
      immediateSafetyConcern: incident.assessment.immediateSafetyConcern,
      steps: incident.assessment.recommendedActions,
      explanation: incident.assessment.explanation,
    };
  }

  async remove(user: User, id: string) {
    await this.assertAccess(user, id);
    await this.prisma.incident.delete({ where: { id } });
    return { ok: true };
  }

  async removeEvidence(user: User, incidentId: string, evidenceId: string) {
    await this.assertAccess(user, incidentId);
    await this.prisma.evidence.delete({ where: { id: evidenceId } });
    return { ok: true };
  }

  async dashboard(user: User) {
    const incidents = await this.list(user);
    return {
      open: incidents.filter((item) => item.status === 'OPEN').length,
      needsAttention: incidents.filter((item) => item.status === 'NEEDS_ATTENTION').length,
      resolved: incidents.filter((item) => item.status === 'RESOLVED').length,
      recent: incidents.slice(0, 6),
    };
  }

  private uniqueResources(resources: { id: string; riskTypes: string; emergency: boolean }[], riskType?: string) {
    const matched = resources.filter((item) => riskType && item.riskTypes.split(',').includes(riskType));
    const emergencies = resources.filter((item) => item.emergency);
    const map = new Map();
    [...emergencies, ...matched].forEach((item) => map.set(item.id, item));
    return [...map.values()].slice(0, 5);
  }

  private key() {
    return scryptSync(process.env.EVIDENCE_KEY || 'safenest-evidence-key-change-me-32b', 'safenest', 32);
  }

  private encrypt(buffer: Buffer) {
    const iv = randomBytes(12);
    const cipher = createCipheriv('aes-256-gcm', this.key(), iv);
    const encrypted = Buffer.concat([cipher.update(buffer), cipher.final()]);
    const tag = cipher.getAuthTag();
    return Buffer.concat([iv, tag, encrypted]);
  }

  private decrypt(buffer: Buffer) {
    const iv = buffer.subarray(0, 12);
    const tag = buffer.subarray(12, 28);
    const encrypted = buffer.subarray(28);
    const decipher = createDecipheriv('aes-256-gcm', this.key(), iv);
    decipher.setAuthTag(tag);
    return Buffer.concat([decipher.update(encrypted), decipher.final()]);
  }
}
