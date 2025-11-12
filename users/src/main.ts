import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: [
      'http://localhost:5173',
      'http://54.210.10.174', // IP pública de tu instancia
      'https://tudominio.com', // (si vas a usar dominio)
    ],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });


  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(` Users microservice running on: http://localhost:${port}`);
}
bootstrap();
