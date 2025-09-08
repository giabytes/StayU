import { Body, Controller, Delete, Get, Param, Post, Put, HttpCode } from '@nestjs/common';
import { DataBaseService } from './data-base.service';

@Controller('professors')
export class ProfessorsController {
  constructor(private readonly dbService: DataBaseService) {}

  @Post()
  async create(@Body() body: any) {
    return this.dbService.createProfessor(body);
  }

  @Get()
  async findAll() {
    return this.dbService.getAllProfessors();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.dbService.getProfessorById(id);
  }
  
  @Put(':id')
  async update(@Param('id') id: string, @Body() body: any) {
    return this.dbService.updateProfessor(id, body);
  }

  @Delete(':id')
  @HttpCode(204)
  async delete(@Param('id') id: string) {
    await this.dbService.deleteProfessor(id);
  }
}
