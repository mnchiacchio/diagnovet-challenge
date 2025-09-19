import { prisma } from '../index';
import { CreateReportDto, UpdateReportDto } from '../models/ReportDto';
import { ProcessingStatus } from '@prisma/client';

export class ReportService {
  // Obtener todos los reportes con paginación y filtros
  async getAllReports(options: {
    page: number;
    limit: number;
    status?: string;
    search?: string;
  }) {
    const { page, limit, status, search } = options;
    const skip = (page - 1) * limit;

    const where: any = {};

    // Filtrar por estado
    if (status) {
      where.status = status as ProcessingStatus;
    }

    // Buscar en texto extraído, diagnóstico, hallazgos, etc.
    if (search) {
      where.OR = [
        { extractedText: { contains: search, mode: 'insensitive' } },
        { diagnosis: { contains: search, mode: 'insensitive' } },
        { findings: { contains: search, mode: 'insensitive' } },
        { patient: { name: { contains: search, mode: 'insensitive' } } },
        { veterinarian: { name: { contains: search, mode: 'insensitive' } } }
      ];
    }

    const [reports, total] = await Promise.all([
      prisma.veterinaryReport.findMany({
        where,
        skip,
        take: limit,
        include: {
          patient: true,
          veterinarian: true,
          study: true
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.veterinaryReport.count({ where })
    ]);

    return {
      reports,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  // Obtener un reporte por ID
  async getReportById(id: string) {
    return prisma.veterinaryReport.findUnique({
      where: { id },
      include: {
        patient: true,
        veterinarian: true,
        study: true
      }
    });
  }

  // Crear un nuevo reporte
  async createReport(data: CreateReportDto) {
    // Crear o encontrar paciente
    const patient = await prisma.patient.upsert({
      where: {
        name_species_owner: {
          name: data.patient.name,
          species: data.patient.species,
          owner: data.patient.owner
        }
      },
      update: {
        breed: data.patient.breed,
        age: data.patient.age,
        weight: data.patient.weight
      },
      create: {
        name: data.patient.name,
        species: data.patient.species,
        breed: data.patient.breed,
        age: data.patient.age,
        weight: data.patient.weight,
        owner: data.patient.owner
      }
    });

    // Crear o encontrar veterinario
    const veterinarian = await prisma.veterinarian.upsert({
      where: {
        name_license: {
          name: data.veterinarian.name,
          license: data.veterinarian.license || ''
        }
      },
      update: {
        title: data.veterinarian.title,
        clinic: data.veterinarian.clinic,
        contact: data.veterinarian.contact,
        referredBy: data.veterinarian.referredBy
      },
      create: {
        name: data.veterinarian.name,
        license: data.veterinarian.license,
        title: data.veterinarian.title,
        clinic: data.veterinarian.clinic,
        contact: data.veterinarian.contact,
        referredBy: data.veterinarian.referredBy
      }
    });

    // Crear estudio
    const study = await prisma.study.create({
      data: {
        type: data.study.type,
        date: new Date(data.study.date),
        technique: data.study.technique,
        bodyRegion: data.study.bodyRegion,
        incidences: data.study.incidences,
        equipment: data.study.equipment,
        echoData: data.study.echoData
      }
    });

    // Crear reporte
    return prisma.veterinaryReport.create({
      data: {
        filename: data.filename,
        fileUrl: data.fileUrl,
        findings: data.findings,
        diagnosis: data.diagnosis,
        differentials: data.differentials,
        recommendations: data.recommendations,
        measurements: data.measurements,
        images: data.images,
        extractedText: data.extractedText,
        patientId: patient.id,
        veterinarianId: veterinarian.id,
        studyId: study.id
      },
      include: {
        patient: true,
        veterinarian: true,
        study: true
      }
    });
  }

  // Actualizar un reporte
  async updateReport(id: string, data: UpdateReportDto) {
    const updateData: any = {};

    // Actualizar campos del reporte
    if (data.findings !== undefined) updateData.findings = data.findings;
    if (data.diagnosis !== undefined) updateData.diagnosis = data.diagnosis;
    if (data.differentials !== undefined) updateData.differentials = data.differentials;
    if (data.recommendations !== undefined) updateData.recommendations = data.recommendations;
    if (data.measurements !== undefined) updateData.measurements = data.measurements;
    if (data.images !== undefined) updateData.images = data.images;
    if (data.extractedText !== undefined) updateData.extractedText = data.extractedText;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.confidence !== undefined) updateData.confidence = data.confidence;

    return prisma.veterinaryReport.update({
      where: { id },
      data: updateData,
      include: {
        patient: true,
        veterinarian: true,
        study: true
      }
    });
  }

  // Eliminar un reporte
  async deleteReport(id: string) {
    return prisma.veterinaryReport.delete({
      where: { id }
    });
  }

  // Buscar reportes
  async searchReports(query: string, options: { page: number; limit: number }) {
    const { page, limit } = options;
    const skip = (page - 1) * limit;

    const where = {
      OR: [
        { extractedText: { contains: query, mode: 'insensitive' } },
        { diagnosis: { contains: query, mode: 'insensitive' } },
        { findings: { contains: query, mode: 'insensitive' } },
        { patient: { name: { contains: query, mode: 'insensitive' } } },
        { veterinarian: { name: { contains: query, mode: 'insensitive' } } }
      ]
    };

    const [reports, total] = await Promise.all([
      prisma.veterinaryReport.findMany({
        where,
        skip,
        take: limit,
        include: {
          patient: true,
          veterinarian: true,
          study: true
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.veterinaryReport.count({ where })
    ]);

    return {
      reports,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  // Obtener estadísticas
  async getStats() {
    const [
      totalReports,
      completedReports,
      processingReports,
      errorReports,
      needsReviewReports,
      totalPatients,
      totalVeterinarians
    ] = await Promise.all([
      prisma.veterinaryReport.count(),
      prisma.veterinaryReport.count({ where: { status: 'COMPLETED' } }),
      prisma.veterinaryReport.count({ where: { status: 'PROCESSING' } }),
      prisma.veterinaryReport.count({ where: { status: 'ERROR' } }),
      prisma.veterinaryReport.count({ where: { status: 'NEEDS_REVIEW' } }),
      prisma.patient.count(),
      prisma.veterinarian.count()
    ]);

    return {
      totalReports,
      completedReports,
      processingReports,
      errorReports,
      needsReviewReports,
      totalPatients,
      totalVeterinarians,
      completionRate: totalReports > 0 ? (completedReports / totalReports) * 100 : 0
    };
  }
}
