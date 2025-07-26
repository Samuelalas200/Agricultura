import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { CropsService } from './crops.service';
import { CreateCropDto, UpdateCropDto } from './dto/create-crop.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Cultivos')
@ApiBearerAuth()
@Controller('crops')
@UseGuards(JwtAuthGuard)
export class CropsController {
  constructor(private readonly cropsService: CropsService) {}

  @Post()
  @ApiOperation({ summary: 'Crear nuevo cultivo' })
  @ApiResponse({ status: 201, description: 'Cultivo creado exitosamente' })
  create(@Body() createCropDto: CreateCropDto, @Request() req) {
    return this.cropsService.create(createCropDto, req.user.id);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todos los cultivos del usuario' })
  @ApiQuery({ name: 'farmId', required: false, description: 'ID de la finca para filtrar' })
  @ApiResponse({ status: 200, description: 'Lista de cultivos obtenida exitosamente' })
  findAll(@Request() req, @Query('farmId') farmId?: string) {
    return this.cropsService.findAll(req.user.id, farmId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener cultivo por ID' })
  @ApiResponse({ status: 200, description: 'Cultivo obtenido exitosamente' })
  @ApiResponse({ status: 404, description: 'Cultivo no encontrado' })
  findOne(@Param('id') id: string, @Request() req) {
    return this.cropsService.findOne(id, req.user.id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar cultivo' })
  @ApiResponse({ status: 200, description: 'Cultivo actualizado exitosamente' })
  @ApiResponse({ status: 404, description: 'Cultivo no encontrado' })
  update(
    @Param('id') id: string,
    @Body() updateCropDto: UpdateCropDto,
    @Request() req,
  ) {
    return this.cropsService.update(id, updateCropDto, req.user.id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar cultivo' })
  @ApiResponse({ status: 200, description: 'Cultivo eliminado exitosamente' })
  @ApiResponse({ status: 404, description: 'Cultivo no encontrado' })
  remove(@Param('id') id: string, @Request() req) {
    return this.cropsService.remove(id, req.user.id);
  }
}
