import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DataBaseModule } from './data-base/data-base.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [DataBaseModule, AuthModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
