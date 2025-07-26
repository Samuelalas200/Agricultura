import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TasksService {
  constructor(private prisma: PrismaService) {}

  async create(createTaskDto: any, userId: string) {
    // Verificar que la finca pertenece al usuario
    const farm = await this.prisma.farm.findFirst({
      where: {
        id: createTaskDto.farmId,
        ownerId: userId,
      },
    });

    if (!farm) {
      throw new ForbiddenException('No tienes permisos para crear tareas en esta finca');
    }

    // Si se especifica un cultivo, verificar que pertenece a la finca
    if (createTaskDto.cropId) {
      const crop = await this.prisma.crop.findFirst({
        where: {
          id: createTaskDto.cropId,
          farmId: createTaskDto.farmId,
        },
      });

      if (!crop) {
        throw new NotFoundException('El cultivo especificado no existe en esta finca');
      }
    }

    return this.prisma.task.create({
      data: {
        ...createTaskDto,
        assignedUserId: userId,
      },
      include: {
        farm: {
          select: {
            id: true,
            name: true,
            location: true,
          },
        },
        crop: {
          select: {
            id: true,
            name: true,
            variety: true,
          },
        },
        assignedUser: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });
  }

  async findAll(userId: string) {
    return this.prisma.task.findMany({
      where: {
        assignedUserId: userId,
      },
      include: {
        farm: {
          select: {
            id: true,
            name: true,
            location: true,
          },
        },
        crop: {
          select: {
            id: true,
            name: true,
            variety: true,
          },
        },
        assignedUser: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: { scheduledDate: 'asc' },
    });
  }

  async findOne(id: string, userId: string) {
    const task = await this.prisma.task.findFirst({
      where: {
        id,
        assignedUserId: userId,
      },
      include: {
        farm: {
          select: {
            id: true,
            name: true,
            location: true,
          },
        },
        crop: {
          select: {
            id: true,
            name: true,
            variety: true,
          },
        },
        assignedUser: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    if (!task) {
      throw new NotFoundException('Tarea no encontrada');
    }

    return task;
  }

  async update(id: string, updateTaskDto: any, userId: string) {
    // Verificar que la tarea pertenece al usuario
    const existingTask = await this.prisma.task.findFirst({
      where: {
        id,
        assignedUserId: userId,
      },
    });

    if (!existingTask) {
      throw new NotFoundException('Tarea no encontrada');
    }

    // Si se actualiza la finca, verificar permisos
    if (updateTaskDto.farmId && updateTaskDto.farmId !== existingTask.farmId) {
      const farm = await this.prisma.farm.findFirst({
        where: {
          id: updateTaskDto.farmId,
          ownerId: userId,
        },
      });

      if (!farm) {
        throw new ForbiddenException('No tienes permisos para asignar tareas a esta finca');
      }
    }

    // Si se actualiza el cultivo, verificar que pertenece a la finca
    if (updateTaskDto.cropId) {
      const farmId = updateTaskDto.farmId || existingTask.farmId;
      const crop = await this.prisma.crop.findFirst({
        where: {
          id: updateTaskDto.cropId,
          farmId,
        },
      });

      if (!crop) {
        throw new NotFoundException('El cultivo especificado no existe en la finca');
      }
    }

    return this.prisma.task.update({
      where: { id },
      data: updateTaskDto,
      include: {
        farm: {
          select: {
            id: true,
            name: true,
            location: true,
          },
        },
        crop: {
          select: {
            id: true,
            name: true,
            variety: true,
          },
        },
        assignedUser: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });
  }

  async remove(id: string, userId: string) {
    const task = await this.prisma.task.findFirst({
      where: {
        id,
        assignedUserId: userId,
      },
    });

    if (!task) {
      throw new NotFoundException('Tarea no encontrada');
    }

    await this.prisma.task.delete({
      where: { id },
    });

    return { message: 'Tarea eliminada exitosamente' };
  }
}
