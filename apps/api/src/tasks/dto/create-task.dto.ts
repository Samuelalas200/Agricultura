import { IsString, IsOptional, IsDateString, IsNumber, IsIn } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateTaskDto {
  @ApiProperty({ description: 'Título de la tarea' })
  @IsString()
  title: string;

  @ApiPropertyOptional({ description: 'Descripción de la tarea' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ 
    description: 'Tipo de tarea',
    enum: ['PLANTING', 'IRRIGATION', 'FERTILIZATION', 'PEST_CONTROL', 'HARVESTING', 'SOIL_PREPARATION', 'MAINTENANCE', 'MONITORING', 'OTHER']
  })
  @IsString()
  @IsIn(['PLANTING', 'IRRIGATION', 'FERTILIZATION', 'PEST_CONTROL', 'HARVESTING', 'SOIL_PREPARATION', 'MAINTENANCE', 'MONITORING', 'OTHER'])
  type: string;

  @ApiProperty({ 
    description: 'Estado de la tarea',
    enum: ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'OVERDUE'],
    default: 'PENDING'
  })
  @IsOptional()
  @IsString()
  @IsIn(['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'OVERDUE'])
  status?: string = 'PENDING';

  @ApiProperty({ description: 'Fecha programada para la tarea' })
  @IsDateString()
  scheduledDate: string;

  @ApiPropertyOptional({ description: 'Fecha de finalización de la tarea' })
  @IsOptional()
  @IsDateString()
  completedDate?: string;

  @ApiProperty({ 
    description: 'Prioridad de la tarea',
    enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'],
    default: 'MEDIUM'
  })
  @IsOptional()
  @IsString()
  @IsIn(['LOW', 'MEDIUM', 'HIGH', 'URGENT'])
  priority?: string = 'MEDIUM';

  @ApiPropertyOptional({ description: 'Duración estimada en minutos' })
  @IsOptional()
  @IsNumber()
  estimatedDuration?: number;

  @ApiPropertyOptional({ description: 'Duración real en minutos' })
  @IsOptional()
  @IsNumber()
  actualDuration?: number;

  @ApiPropertyOptional({ description: 'Costo estimado de la tarea' })
  @IsOptional()
  @IsNumber()
  cost?: number;

  @ApiPropertyOptional({ description: 'Notas adicionales' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({ description: 'ID de la finca' })
  @IsString()
  farmId: string;

  @ApiPropertyOptional({ description: 'ID del cultivo (opcional)' })
  @IsOptional()
  @IsString()
  cropId?: string;
}
