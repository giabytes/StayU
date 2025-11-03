import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  HttpCode,
} from '@nestjs/common';
import { DataBaseService } from './data-base.service';

@Controller('academic-coordinators')
export class AcademicCoordinatorsController {
  constructor(private readonly dbService: DataBaseService) {}

  @Post()
  async create(@Body() body: any) {
    return this.dbService.createAcademicCoordinator(body);
  }

  @Get()
  async findAll() {
    return this.dbService.getAllAcademicCoordinators();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.dbService.getAcademicCoordinatorById(id);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() body: any) {
    return this.dbService.updateAcademicCoordinator(id, body);
  }

  @Delete(':id')
  @HttpCode(204)
  async delete(@Param('id') id: string) {
    await this.dbService.deleteAcademicCoordinator(id);
  }
}
