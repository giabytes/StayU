import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { DataBaseService } from '../data-base/data-base.service';

@Module({
  controllers: [AuthController],
  providers: [DataBaseService],
})
export class AuthModule {}
