import { Module } from '@nestjs/common';
import { StudentsController } from './data-base.controller';
import { DataBaseService } from './data-base.service';
import { AcademicCoordinatorsController } from './academic-coordinators.controller';
import { ProfessorsController } from './professors.controller';
import { StudentRecordsController } from './student-records.controller';
import { WellbeingStaffController } from './wellbeing-staff.controller';
@Module({
  imports: [],
  controllers: [
    AcademicCoordinatorsController,
    ProfessorsController,
    StudentRecordsController,
    StudentsController,
    WellbeingStaffController,
  ],
  providers: [DataBaseService],
})
export class DataBaseModule {}


