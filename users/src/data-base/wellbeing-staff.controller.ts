import { Body, Controller, Delete, Get, Param, Post, Put, HttpCode } from '@nestjs/common';
import { DataBaseService } from '../data-base/data-base.service';

@Controller('wellbeing-staff')
export class WellbeingStaffController {
  constructor(private readonly dbService: DataBaseService) {}

  @Post()
  async create(@Body() body: any) {
    return this.dbService.createWellbeingStaff(body);
  }

  @Get()
  async findAll() {
    return this.dbService.getAllWellbeingStaff();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.dbService.getWellbeingStaffById(id);
  }
  
  @Put(':id')
  async update(@Param('id') id: string, @Body() body: any) {
    return this.dbService.updateWellbeingStaff(id, body);
  }

  @Delete(':id')
  @HttpCode(204)
  async delete(@Param('id') id: string) {
    await this.dbService.deleteWellbeingStaff(id);
  }
}
