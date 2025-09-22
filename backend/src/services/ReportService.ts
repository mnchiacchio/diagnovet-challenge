import { prisma } from '../index';
import { CreateReportDto, UpdateReportDto } from '../models/ReportDto';
// import { ProcessingStatus } from '@prisma/client';
import { ReportFilters, ReportQueryParams, PaginatedResponse, ReportStats, VeterinaryReportWithRelations, ProcessingStatus } from '../types/prisma';
import { logger } from '../utils/Logger';

export class ReportService {
  // Validar y convertir query parameters
  public validateQueryParams(params: ReportQueryParams): ReportFilters {
    const page = params.page ? Math.max(1, parseInt(params.page, 10)) : 1;
    const limit = params.limit ? Math.min(100, Math.max(1, parseInt(params.limit, 10))) : 10;
    
    return {
      page,
      limit,
      status: params.status || undefined,
      search: params.search || undefined,
      dateFrom: params.dateFrom || undefined,
      dateTo: params.dateTo || undefined,
      species: params.species || undefined,
      veterinarian: params.veterinarian || undefined
    };
  }

  // Obtener todos los reportes con paginación y filtros
  async getAllReports(options: ReportFilters): Promise<PaginatedResponse<VeterinaryReportWithRelations>> {
    try {
      const { page, limit, status, search, dateFrom, dateTo, species, veterinarian } = options;
      const skip = (page - 1) * limit;

      logger.debug('ReportService getAllReports called with:', options);

      const where: any = {};

      // Filtrar por estado
      if (status) {
        where.status = status as ProcessingStatus;
      }

      // Buscar en texto extraído, diagnóstico, hallazgos, etc.
      if (search) {
        where.OR = [
          { extractedText: { contains: search, mode: 'insensitive' as const } },
          { diagnosis: { contains: search, mode: 'insensitive' as const } },
          { findings: { contains: search, mode: 'insensitive' as const } },
          { filename: { contains: search, mode: 'insensitive' as const } },
          { patient: { name: { contains: search, mode: 'insensitive' as const } } },
          { veterinarian: { name: { contains: search, mode: 'insensitive' as const } } }
        ];
      }

      // Filtrar por fecha
      if (dateFrom) {
        where.createdAt = { gte: dateFrom };
      }

      // Filtrar por fecha
      if (dateTo) {
        where.createdAt = { lte: dateTo };
      }

      // Filtrar por especie
      if (species) {
        where.patient = { species: {contains: species, mode: 'insensitive' as const} };
      }

      // Filtrar por veterinario
      if (veterinarian) {
        where.veterinarian = { name: {contains: veterinarian, mode: 'insensitive' as const} };
      }

      logger.debug('Where clause:', where);

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

      logger.debug('Found reports:', reports.length, 'Total:', total);

      return {
        data: reports as VeterinaryReportWithRelations[],
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      logger.error('Error in getAllReports:', error);
      throw error;
    }
  }

  // Obtener un reporte por ID
  async getReportById(id: string): Promise<VeterinaryReportWithRelations | null> {
    if (!id || typeof id !== 'string') {
      throw new Error('ID de reporte inválido');
    }

    try {
      return await prisma.veterinaryReport.findUnique({
        where: { id },
        include: {
          patient: true,
          veterinarian: true,
          study: true
        }
      });
    } catch (error) {
      logger.error('Error al obtener reporte por ID:', error);
      throw new Error('Error al obtener el reporte');
    }
  }

  // Crear un nuevo reporte
  async createReport(data: CreateReportDto): Promise<VeterinaryReportWithRelations> {
    // Validar que los datos requeridos estén presentes
    if (!data.filename || !data.fileUrl || !data.patient || !data.veterinarian || !data.study) {
      throw new Error('Datos requeridos faltantes para crear el reporte');
    }
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
        breed: data.patient.breed || null,
        age: data.patient.age || null,
        weight: data.patient.weight || null
      },
      create: {
        name: data.patient.name,
        species: data.patient.species,
        breed: data.patient.breed || null,
        age: data.patient.age || null,
        weight: data.patient.weight || null,
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
        title: data.veterinarian.title || null,
        clinic: data.veterinarian.clinic || null,
        contact: data.veterinarian.contact || null,
        referredBy: data.veterinarian.referredBy || null
      },
      create: {
        name: data.veterinarian.name,
        license: data.veterinarian.license || null,
        title: data.veterinarian.title || null,
        clinic: data.veterinarian.clinic || null,
        contact: data.veterinarian.contact || null,
        referredBy: data.veterinarian.referredBy || null
      }
    });

      // Crear estudio
      const study = await prisma.study.create({
        data: {
          type: data.study.type,
          date: this.parseDateForDatabase(data.study.date),
          technique: data.study.technique || null,
          bodyRegion: data.study.bodyRegion || null,
          incidences: data.study.incidences || [],
          equipment: data.study.equipment || null,
          echoData: data.study.echoData || null
        }
      });

    // Crear reporte
    return prisma.veterinaryReport.create({
      data: {
        filename: data.filename,
        fileUrl: data.fileUrl,
        findings: data.findings || null,
        diagnosis: data.diagnosis || null,
        differentials: data.differentials || [],
        recommendations: data.recommendations || [],
        measurements: data.measurements || null,
        images: data.images || [],
        extractedText: data.extractedText || null,
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
  async updateReport(id: string, data: UpdateReportDto): Promise<VeterinaryReportWithRelations> {
    if (!id || typeof id !== 'string') {
      throw new Error('ID de reporte inválido');
    }

    if (!data || Object.keys(data).length === 0) {
      throw new Error('No hay datos para actualizar');
    }

    try {
      // Obtener el reporte actual
      const currentReport = await prisma.veterinaryReport.findUnique({
        where: { id },
        include: { patient: true, veterinarian: true, study: true }
      });

      if (!currentReport) {
        throw new Error('Reporte no encontrado');
      }

      // Actualizar entidades relacionadas si se proporcionan
      let patientId = currentReport.patientId;
      let veterinarianId = currentReport.veterinarianId;
      let studyId = currentReport.studyId;

      // Actualizar o crear paciente
      if (data.patient) {
        const patient = await prisma.patient.upsert({
          where: {
            name_species_owner: {
              name: data.patient.name || currentReport.patient.name,
              species: data.patient.species || currentReport.patient.species,
              owner: data.patient.owner || currentReport.patient.owner
            }
          },
          update: {
            breed: data.patient.breed || currentReport.patient.breed,
            age: data.patient.age || currentReport.patient.age,
            weight: data.patient.weight || currentReport.patient.weight
          },
          create: {
            name: data.patient.name || currentReport.patient.name,
            species: data.patient.species || currentReport.patient.species,
            breed: data.patient.breed || null,
            age: data.patient.age || null,
            weight: data.patient.weight || null,
            owner: data.patient.owner || currentReport.patient.owner
          }
        });
        patientId = patient.id;
      }

      // Actualizar o crear veterinario
      if (data.veterinarian) {
        const veterinarian = await prisma.veterinarian.upsert({
          where: {
            name_license: {
              name: data.veterinarian.name || currentReport.veterinarian.name,
              license: data.veterinarian.license || currentReport.veterinarian.license || ''
            }
          },
          update: {
            title: data.veterinarian.title || currentReport.veterinarian.title,
            clinic: data.veterinarian.clinic || currentReport.veterinarian.clinic,
            contact: data.veterinarian.contact || currentReport.veterinarian.contact,
            referredBy: data.veterinarian.referredBy || currentReport.veterinarian.referredBy
          },
          create: {
            name: data.veterinarian.name || currentReport.veterinarian.name,
            license: data.veterinarian.license || null,
            title: data.veterinarian.title || null,
            clinic: data.veterinarian.clinic || null,
            contact: data.veterinarian.contact || null,
            referredBy: data.veterinarian.referredBy || null
          }
        });
        veterinarianId = veterinarian.id;
      }

      // Actualizar o crear estudio
      if (data.study) {
        const study = await prisma.study.create({
          data: {
            type: data.study.type || currentReport.study.type,
            date: data.study.date ? this.parseDateForDatabase(data.study.date) : currentReport.study.date,
            technique: data.study.technique || currentReport.study.technique,
            bodyRegion: data.study.bodyRegion || currentReport.study.bodyRegion,
            incidences: data.study.incidences || currentReport.study.incidences,
            equipment: data.study.equipment || currentReport.study.equipment,
            echoData: data.study.echoData || currentReport.study.echoData
          }
        });
        studyId = study.id;
      }

      // Actualizar el reporte principal
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

      // Actualizar IDs de relaciones si cambiaron
      if (patientId !== currentReport.patientId) updateData.patientId = patientId;
      if (veterinarianId !== currentReport.veterinarianId) updateData.veterinarianId = veterinarianId;
      if (studyId !== currentReport.studyId) updateData.studyId = studyId;

      return await prisma.veterinaryReport.update({
        where: { id },
        data: updateData,
        include: {
          patient: true,
          veterinarian: true,
          study: true
        }
      });
    } catch (error) {
      logger.error('Error al actualizar reporte:', error);
      throw new Error('Error al actualizar el reporte');
    }
  }

  // Eliminar un reporte
  async deleteReport(id: string): Promise<VeterinaryReportWithRelations> {
    if (!id || typeof id !== 'string') {
      throw new Error('ID de reporte inválido');
    }

    try {
      return await prisma.veterinaryReport.delete({
        where: { id },
        include: {
          patient: true,
          veterinarian: true,
          study: true
        }
      });
    } catch (error) {
      logger.error('Error al eliminar reporte:', error);
      throw new Error('Error al eliminar el reporte');
    }
  }

  // Buscar reportes
  async searchReports(query: string, options: { page: number; limit: number }): Promise<PaginatedResponse<VeterinaryReportWithRelations>> {
    if (!query || typeof query !== 'string' || query.trim().length === 0) {
      throw new Error('Query de búsqueda inválida');
    }

    if (!options || typeof options.page !== 'number' || typeof options.limit !== 'number') {
      throw new Error('Opciones de paginación inválidas');
    }

    const { page, limit } = options;
    const skip = (page - 1) * limit;

    const where = {
      OR: [
        { extractedText: { contains: query, mode: 'insensitive' as const } },
        { diagnosis: { contains: query, mode: 'insensitive' as const } },
        { findings: { contains: query, mode: 'insensitive' as const } },
        { patient: { name: { contains: query, mode: 'insensitive' as const } } },
        { veterinarian: { name: { contains: query, mode: 'insensitive' as const } } }
      ]
    };

    try {
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
        data: reports as VeterinaryReportWithRelations[],
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      logger.error('Error al buscar reportes:', error);
      throw new Error('Error al buscar reportes');
    }
  }

  // Obtener estadísticas
  async getStats(): Promise<ReportStats> {
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

  // Parsear fecha para la base de datos - maneja zona horaria argentina
  private parseDateForDatabase(dateString: string | Date): Date {
    try {
      logger.debug('Parseando fecha para BD:', dateString);
      
      // Si ya es un objeto Date, retornarlo
      if (dateString instanceof Date) {
        return dateString;
      }
      
      // Si es un string ISO (YYYY-MM-DD), crear Date en zona horaria local
      if (dateString.includes('-') && dateString.length === 10) {
        // Crear fecha en zona horaria local para evitar problemas de UTC
        const [year, month, day] = dateString.split('-').map(Number);
        const localDate = new Date(year, month - 1, day); // month es 0-indexado
        logger.debug('Fecha creada en zona local:', localDate);
        return localDate;
      }
      
      // Para otros formatos, usar Date normal
      const parsedDate = new Date(dateString);
      if (isNaN(parsedDate.getTime())) {
        throw new Error(`Fecha inválida: ${dateString}`);
      }
      
      logger.debug('Fecha parseada:', parsedDate);
      return parsedDate;
      
    } catch (error) {
      logger.error('Error al parsear fecha para BD:', error);
      // Fallback: fecha actual
      return new Date();
    }
  }
}
