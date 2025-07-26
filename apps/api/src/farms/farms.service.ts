import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateFarmDto, UpdateFarmDto } from './dto/create-farm.dto';

@Injectable()
export class FarmsService {
  constructor(private prisma: PrismaService) {}

  async create(createFarmDto: CreateFarmDto, userId: string) {
    return this.prisma.farm.create({
      data: {
        ...createFarmDto,
        ownerId: userId,
      },
      include: {
        owner: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phone: true,
          },
        },
        _count: {
          select: {
            crops: true,
            parcels: true,
          },
        },
      },
    });
  }

  async findAll(userId: string) {
    return this.prisma.farm.findMany({
      where: { ownerId: userId },
      include: {
        owner: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phone: true,
          },
        },
        _count: {
          select: {
            crops: true,
            parcels: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, userId: string) {
    const farm = await this.prisma.farm.findUnique({
      where: { id },
      include: {
        owner: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phone: true,
          },
        },
        crops: {
          include: {
            parcel: true,
            _count: {
              select: {
                tasks: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
        parcels: {
          include: {
            _count: {
              select: {
                crops: true,
              },
            },
          },
          orderBy: { name: 'asc' },
        },
        _count: {
          select: {
            crops: true,
            parcels: true,
            tasks: true,
          },
        },
      },
    });

    if (!farm) {
      throw new NotFoundException('Finca no encontrada');
    }

    if (farm.ownerId !== userId) {
      throw new ForbiddenException('No tienes acceso a esta finca');
    }

    return farm;
  }

  async update(id: string, updateFarmDto: UpdateFarmDto, userId: string) {
    const farm = await this.prisma.farm.findUnique({
      where: { id },
    });

    if (!farm) {
      throw new NotFoundException('Finca no encontrada');
    }

    if (farm.ownerId !== userId) {
      throw new ForbiddenException('No tienes acceso a esta finca');
    }

    return this.prisma.farm.update({
      where: { id },
      data: updateFarmDto,
      include: {
        owner: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phone: true,
          },
        },
        _count: {
          select: {
            crops: true,
            parcels: true,
          },
        },
      },
    });
  }

  async remove(id: string, userId: string) {
    const farm = await this.prisma.farm.findUnique({
      where: { id },
    });

    if (!farm) {
      throw new NotFoundException('Finca no encontrada');
    }

    if (farm.ownerId !== userId) {
      throw new ForbiddenException('No tienes acceso a esta finca');
    }

    await this.prisma.farm.delete({
      where: { id },
    });

    return { message: 'Finca eliminada exitosamente' };
  }
}
