import { Controller, Post, Body, UnauthorizedException } from '@nestjs/common';
import { DataBaseService } from '../data-base/data-base.service';
import * as jwt from 'jsonwebtoken';
import * as bcrypt from 'bcrypt';

@Controller('auth')
export class AuthController {
  constructor(private readonly dbService: DataBaseService) {}

  @Post('login')
  async login(@Body() body: { email: string; password: string; role: string }) {
    const { email, password, role } = body;

    const user = await this.dbService.getUserByEmail(email);
    if (!user) throw new UnauthorizedException('Usuario no encontrado');

    const match = await bcrypt.compare(password, user.password);
    if (!match) throw new UnauthorizedException('Contraseña incorrecta');
    if (user.role !== role) throw new UnauthorizedException('Rol no coincide');

    const payload = { sub: user.id, email: user.email, role: user.role };
    const token = jwt.sign(payload, process.env.JWT_SECRET || 'secret', { expiresIn: '1h' });

    return {
    access_token: token,
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      professorId: user.professorId ?? null
    }};
  }

  @Post('register')
  async register(@Body() body: { email: string; password: string; name?: string; role: string }) {
    const { email, password, name, role } = body;

    if (!['PROFESSOR', 'ACADEMIC_COORDINATOR', 'WELLBEING_STAFF'].includes(role)) {
    throw new Error('Solo profesores, coordinadores y staff pueden registrarse');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await this.dbService.createUser({ email, password: hashedPassword, name, role });
    
    // Crear entidad asociada
    let roleRecord: any;
    switch (role) {
        case 'PROFESSOR':
        roleRecord = await this.dbService.createProfessor({ email, name, role });
        break;
        case 'ACADEMIC_COORDINATOR':
        roleRecord = await this.dbService.createAcademicCoordinator({ email, name, role });
        break;
        case 'WELLBEING_STAFF':
        roleRecord = await this.dbService.createWellbeingStaff({ email, name, role });
        break;
    }

    await this.dbService.linkUserToRole(user.id, roleRecord.id, role);

    return { message: 'Usuario registrado correctamente', user, roleRecord };
  }
}
