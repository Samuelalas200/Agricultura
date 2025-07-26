import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCropDto, UpdateCropDto } from './dto/create-crop.dto';

@Injectable()
export class CropsService {
  constructor(private prisma: PrismaService) {}

  async create(createCropDto: CreateCropDto, userId: string) {
    const { farmId, parcelId, ...cropData } = createCropDto;

    // Verificar que la finca pertenezca al usuario
    const farm = await this.prisma.farm.findUnique({
      where: { id: farmId },
    });

    if (!farm) {
      throw new NotFoundException('Finca no encontrada');
    }

    if (farm.ownerId !== userId) {
      throw new ForbiddenException('No tienes acceso a esta finca');
    }

    // Si se especifica parcela, verificar que pertenezca a la finca
    if (parcelId) {
      const parcel = await this.prisma.parcel.findUnique({
        where: { id: parcelId },
      });

      if (!parcel || parcel.farmId !== farmId) {
        throw new NotFoundException('Parcela no encontrada o no pertenece a la finca');
      }
    }

    return this.prisma.crop.create({
      data: {
        ...cropData,
        plantingDate: new Date(cropData.plantingDate),
        expectedHarvestDate: cropData.expectedHarvestDate
          ? new Date(cropData.expectedHarvestDate)
          : null,
        farmId,
        parcelId: parcelId || null,
      },
      include: {
        farm: {
          select: {
            id: true,
            name: true,
            location: true,
          },
        },
        parcel: {
          select: {
            id: true,
            name: true,
            area: true,
          },
        },
        _count: {
          select: {
            tasks: true,
          },
        },
      },
    });
  }

  async findAll(userId: string, farmId?: string) {
    const where: any = {};

    if (farmId) {
      // Verificar que la finca pertenezca al usuario
      const farm = await this.prisma.farm.findUnique({
        where: { id: farmId },
      });

      if (!farm) {
        throw new NotFoundException('Finca no encontrada');
      }

      if (farm.ownerId !== userId) {
        throw new ForbiddenException('No tienes acceso a esta finca');
      }

      where.farmId = farmId;
    } else {
      // Si no se especifica finca, obtener cultivos de todas las fincas del usuario
      where.farm = {
        ownerId: userId,
      };
    }

    return this.prisma.crop.findMany({
      where,
      include: {
        farm: {
          select: {
            id: true,
            name: true,
            location: true,
          },
        },
        parcel: {
          select: {
            id: true,
            name: true,
            area: true,
          },
        },
        _count: {
          select: {
            tasks: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, userId: string) {
    const crop = await this.prisma.crop.findUnique({
      where: { id },
      include: {
        farm: {
          select: {
            id: true,
            name: true,
            location: true,
            ownerId: true,
          },
        },
        parcel: {
          select: {
            id: true,
            name: true,
            area: true,
            soilType: true,
          },
        },
        tasks: {
          include: {
            assignedUser: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
          },
          orderBy: { scheduledDate: 'desc' },
        },
      },
    });

    if (!crop) {
      throw new NotFoundException('Cultivo no encontrado');
    }

    if (crop.farm.ownerId !== userId) {
      throw new ForbiddenException('No tienes acceso a este cultivo');
    }

    return crop;
  }

  async update(id: string, updateCropDto: UpdateCropDto, userId: string) {
    const crop = await this.prisma.crop.findUnique({
      where: { id },
      include: {
        farm: true,
      },
    });

    if (!crop) {
      throw new NotFoundException('Cultivo no encontrado');
    }

    if (crop.farm.ownerId !== userId) {
      throw new ForbiddenException('No tienes acceso a este cultivo');
    }

    const { parcelId, ...updateData } = updateCropDto;

    // Si se especifica nueva parcela, verificar que pertenezca a la finca
    if (parcelId) {
      const parcel = await this.prisma.parcel.findUnique({
        where: { id: parcelId },
      });

      if (!parcel || parcel.farmId !== crop.farmId) {
        throw new NotFoundException('Parcela no encontrada o no pertenece a la finca');
      }
    }

    return this.prisma.crop.update({
      where: { id },
      data: {
        ...updateData,
        ...(updateData.plantingDate && {
          plantingDate: new Date(updateData.plantingDate),
        }),
        ...(updateData.expectedHarvestDate && {
          expectedHarvestDate: new Date(updateData.expectedHarvestDate),
        }),
        ...(updateData.actualHarvestDate && {
          actualHarvestDate: new Date(updateData.actualHarvestDate),
        }),
        ...(parcelId !== undefined && { parcelId: parcelId || null }),
      },
      include: {
        farm: {
          select: {
            id: true,
            name: true,
            location: true,
          },
        },
        parcel: {
          select: {
            id: true,
            name: true,
            area: true,
          },
        },
        _count: {
          select: {
            tasks: true,
          },
        },
      },
    });
  }

  async remove(id: string, userId: string) {
    const crop = await this.prisma.crop.findUnique({
      where: { id },
      include: {
        farm: true,
      },
    });

    if (!crop) {
      throw new NotFoundException('Cultivo no encontrado');
    }

    if (crop.farm.ownerId !== userId) {
      throw new ForbiddenException('No tienes acceso a este cultivo');
    }

    await this.prisma.crop.delete({
      where: { id },
    });

    return { message: 'Cultivo eliminado exitosamente' };
  }
}
