// src/data-base/data-base.controller.ts
import { Body, Controller, Delete, Get, Param, Post, Put, HttpCode } from '@nestjs/common';
import { DataBaseService } from './data-base.service';

@Controller('students')
export class StudentsController {
  constructor(private readonly dbService: DataBaseService) {}

  @Post()
  async create(@Body() body: any) {
    return this.dbService.createStudent(body);
  }

  @Get()
  async findAll() {
    return this.dbService.getAllStudents();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.dbService.getStudentById(id);
  }
  
  @Put(':id')
  async update(@Param('id') id: string, @Body() body: any) {
    return this.dbService.updateStudent(id, body);
  }

  @Delete(':id')
  @HttpCode(204)
  async delete(@Param('id') id: string) {
    await this.dbService.deleteStudent(id);
  }

  
}
