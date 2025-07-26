import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Configuración global de validación
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Configuración de CORS usando variables de entorno
  const corsOrigins = process.env.CORS_ORIGIN?.split(',') || [
    'http://localhost:5173', 
    'http://localhost:5174', 
    'http://localhost:5175', 
    'http://localhost:5176', 
    'http://localhost:5177',
    'http://localhost:5178',
    'http://localhost:5179',
    'http://localhost:5180',
    'http://localhost:5181'
  ];
  
  app.enableCors({
    origin: corsOrigins,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });

  // Configuración de Swagger usando variables de entorno
  const config = new DocumentBuilder()
    .setTitle(process.env.API_TITLE || 'Campo360 Manager API')
    .setDescription(process.env.API_DESCRIPTION || 'API para el sistema de gestión agrícola Campo360')
    .setVersion(process.env.API_VERSION || '1.0')
    .addBearerAuth()
    .build();
  
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 3001;
  await app.listen(port);
  
  console.log(`🚀 Campo360 API ejecutándose en: http://localhost:${port}`);
  console.log(`📚 Documentación disponible en: http://localhost:${port}/api/docs`);
}

bootstrap();
