import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: 'http://localhost:5173', // frontend
  });

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(` Users microservice running on: http://localhost:${port}`);
}
bootstrap();
