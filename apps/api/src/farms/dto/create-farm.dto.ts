import { IsString, IsNumber, IsOptional, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateFarmDto {
  @ApiProperty({ example: 'Finca El Paraíso' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'Antioquia, Colombia' })
  @IsString()
  location: string;

  @ApiProperty({ example: 25.5 })
  @IsNumber()
  @Min(0.1)
  totalArea: number;

  @ApiProperty({ example: 'Finca dedicada al cultivo de café y aguacate', required: false })
  @IsOptional()
  @IsString()
  description?: string;
}

export class UpdateFarmDto {
  @ApiProperty({ example: 'Finca El Paraíso Renovada', required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ example: 'Antioquia, Colombia', required: false })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiProperty({ example: 30.0, required: false })
  @IsOptional()
  @IsNumber()
  @Min(0.1)
  totalArea?: number;

  @ApiProperty({ example: 'Descripción actualizada', required: false })
  @IsOptional()
  @IsString()
  description?: string;
}
