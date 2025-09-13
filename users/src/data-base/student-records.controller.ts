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

@Controller('student-records')
export class StudentRecordsController {
  constructor(private readonly dbService: DataBaseService) {}

  @Post()
  async create(@Body() body: any) {
    return this.dbService.createStudentRecord(body);
  }

  @Get()
  async findAll() {
    return this.dbService.getAllRecords();
  }

  @Get(':student_id')
  async findOne(@Param('student_id') student_id: string) {
    return this.dbService.getRecordByStudentId(student_id);
  }

  @Put(':student_id')
  async update(@Param('student_id') student_id: string, @Body() body: any) {
    return this.dbService.updateRecord(student_id, body);
  }

  @Delete(':student_id')
  @HttpCode(204)
  async delete(@Param('student_id') student_id: string) {
    await this.dbService.deleteRecord(student_id);
  }
}
