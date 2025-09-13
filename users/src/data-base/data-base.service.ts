// src/data-base/data-base.service.ts
import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class DataBaseService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  //Create Student Record
  async createStudentRecord(data: {
    student_id: string;
    average: number;
    attendance: number;
    amount_due: number;
    amount_paid: number;
    late_payment: boolean;
    risk_level: number;
  }) {
    //  simple validation de attendance
    if (data.attendance < 0 || data.attendance > 100) {
      throw new Error('Attendance debe estar entre 0 y 100');
    }

    return this.studentRecord.create({ data });
  }

  // read all records
  async getAllRecords() {
    return this.studentRecord.findMany();
  }

  // read one record by student_id
  async getRecordByStudentId(student_id: string) {
    return this.studentRecord.findUnique({
      where: { student_id },
    });
  }

  // update record by student_id
  async updateRecord(
    student_id: string,
    updateData: Partial<{
      average: number;
      attendance: number;
      amount_due: number;
      amount_paid: number;
      late_payment: boolean;
      risk_level: number;
    }>,
  ) {
    return this.studentRecord.update({
      where: { student_id },
      data: updateData,
    });
  }

  // delete record by student_id
  async deleteRecord(student_id: string) {
    return this.studentRecord.delete({
      where: { student_id },
    });
  }

  // Métodos CRUD para el modelo Student
  async createStudent(data: {
    student_id: string;
    email: string;
    name?: string;
    role: any;
    academic_program?: string;
    birth_date?: string;
    citizen_id?: string;
    phone_number?: string;
    risk_level?: number;
  }) {
    return this.student.create({ data });
  }

  async getAllStudents() {
    return this.student.findMany();
  }

  async getStudentById(student_id: string) {
    return this.student.findUnique({ where: { student_id } });
  }

  async updateStudent(
    student_id: string,
    updateData: Partial<{
      student_id?: string;
      email?: string;
      name?: string;
      role?: any;
      academic_program?: string;
      birth_date?: string;
      citizen_id?: string;
      phone_number?: string;
      risk_level?: number;
    }>,
  ) {
    return this.student.update({
      where: { student_id },
      data: updateData,
    });
  }

  async deleteStudent(id: string) {
    return this.student.delete({ where: { id } });
  }

  // Métodos CRUD para el modelo Professor
  async createProfessor(data: { email: string; name?: string; role: any }) {
    return this.professor.create({ data });
  }

  async getAllProfessors() {
    return this.professor.findMany();
  }

  async getProfessorById(id: string) {
    return this.professor.findUnique({ where: { id } });
  }

  async updateProfessor(
    id: string,
    updateData: Partial<{ email?: string; name?: string; role?: any }>,
  ) {
    return this.professor.update({
      where: { id },
      data: updateData,
    });
  }

  async deleteProfessor(id: string) {
    return this.professor.delete({ where: { id } });
  }

  // Métodos CRUD para el modelo AcademicCoordinator
  async createAcademicCoordinator(data: {
    email: string;
    name?: string;
    role: any;
  }) {
    return this.academicCoordinator.create({ data });
  }

  async getAllAcademicCoordinators() {
    return this.academicCoordinator.findMany();
  }

  async getAcademicCoordinatorById(id: string) {
    return this.academicCoordinator.findUnique({ where: { id } });
  }

  async updateAcademicCoordinator(
    id: string,
    updateData: Partial<{ email?: string; name?: string; role?: any }>,
  ) {
    return this.academicCoordinator.update({
      where: { id },
      data: updateData,
    });
  }

  async deleteAcademicCoordinator(id: string) {
    return this.academicCoordinator.delete({ where: { id } });
  }

  // Métodos CRUD para el modelo WellbeingStaff
  async createWellbeingStaff(data: {
    email: string;
    name?: string;
    role: any;
  }) {
    return this.wellbeingStaff.create({ data });
  }

  async getAllWellbeingStaff() {
    return this.wellbeingStaff.findMany();
  }

  async getWellbeingStaffById(id: string) {
    return this.wellbeingStaff.findUnique({ where: { id } });
  }

  async updateWellbeingStaff(
    id: string,
    updateData: Partial<{ email?: string; name?: string; role?: any }>,
  ) {
    return this.wellbeingStaff.update({
      where: { id },
      data: updateData,
    });
  }

  async deleteWellbeingStaff(id: string) {
    return this.wellbeingStaff.delete({ where: { id } });
  }
}
