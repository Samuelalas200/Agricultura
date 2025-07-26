import { IsString, IsDateString, IsNumber, IsOptional, IsEnum, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { CropStatus } from '@campo360/lib';

export class CreateCropDto {
  @ApiProperty({ example: 'Café Arábica' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'Caturra' })
  @IsString()
  variety: string;

  @ApiProperty({ example: '2024-03-15T00:00:00.000Z' })
  @IsDateString()
  plantingDate: string;

  @ApiProperty({ example: '2024-12-15T00:00:00.000Z', required: false })
  @IsOptional()
  @IsDateString()
  expectedHarvestDate?: string;

  @ApiProperty({ example: 8.5 })
  @IsNumber()
  @Min(0.1)
  area: number;

  @ApiProperty({ example: 'Plantas en buen estado', required: false })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({ example: 'cluid123' })
  @IsString()
  farmId: string;

  @ApiProperty({ example: 'cluid456', required: false })
  @IsOptional()
  @IsString()
  parcelId?: string;
}

export class UpdateCropDto {
  @ApiProperty({ example: 'Café Arábica Premium', required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ example: 'Bourbon', required: false })
  @IsOptional()
  @IsString()
  variety?: string;

  @ApiProperty({ example: '2024-03-20T00:00:00.000Z', required: false })
  @IsOptional()
  @IsDateString()
  plantingDate?: string;

  @ApiProperty({ example: '2024-12-20T00:00:00.000Z', required: false })
  @IsOptional()
  @IsDateString()
  expectedHarvestDate?: string;

  @ApiProperty({ example: '2024-12-18T00:00:00.000Z', required: false })
  @IsOptional()
  @IsDateString()
  actualHarvestDate?: string;

  @ApiProperty({ example: 10.0, required: false })
  @IsOptional()
  @IsNumber()
  @Min(0.1)
  area?: number;

  @ApiProperty({ enum: CropStatus, required: false })
  @IsOptional()
  @IsEnum(CropStatus)
  status?: CropStatus;

  @ApiProperty({ example: 'Notas actualizadas', required: false })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({ example: 'cluid789', required: false })
  @IsOptional()
  @IsString()
  parcelId?: string;
}
