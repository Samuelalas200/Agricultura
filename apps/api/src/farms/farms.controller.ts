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
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { FarmsService } from './farms.service';
import { CreateFarmDto, UpdateFarmDto } from './dto/create-farm.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Fincas')
@ApiBearerAuth()
@Controller('farms')
@UseGuards(JwtAuthGuard)
export class FarmsController {
  constructor(private readonly farmsService: FarmsService) {}

  @Post()
  @ApiOperation({ summary: 'Crear nueva finca' })
  @ApiResponse({ status: 201, description: 'Finca creada exitosamente' })
  create(@Body() createFarmDto: CreateFarmDto, @Request() req) {
    return this.farmsService.create(createFarmDto, req.user.id);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todas las fincas del usuario' })
  @ApiResponse({ status: 200, description: 'Lista de fincas obtenida exitosamente' })
  findAll(@Request() req) {
    return this.farmsService.findAll(req.user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener finca por ID' })
  @ApiResponse({ status: 200, description: 'Finca obtenida exitosamente' })
  @ApiResponse({ status: 404, description: 'Finca no encontrada' })
  findOne(@Param('id') id: string, @Request() req) {
    return this.farmsService.findOne(id, req.user.id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar finca' })
  @ApiResponse({ status: 200, description: 'Finca actualizada exitosamente' })
  @ApiResponse({ status: 404, description: 'Finca no encontrada' })
  update(
    @Param('id') id: string,
    @Body() updateFarmDto: UpdateFarmDto,
    @Request() req,
  ) {
    return this.farmsService.update(id, updateFarmDto, req.user.id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar finca' })
  @ApiResponse({ status: 200, description: 'Finca eliminada exitosamente' })
  @ApiResponse({ status: 404, description: 'Finca no encontrada' })
  remove(@Param('id') id: string, @Request() req) {
    return this.farmsService.remove(id, req.user.id);
  }
}
