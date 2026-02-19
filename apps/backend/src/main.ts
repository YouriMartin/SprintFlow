import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { createLogger } from './infrastructure/logging/logger.config';
import { initTelemetry } from './infrastructure/telemetry/telemetry.config';

async function bootstrap() {
  // Initialize OpenTelemetry
  if (process.env.ENABLE_TELEMETRY === 'true') {
    initTelemetry();
  }

  const app = await NestFactory.create(AppModule, {
    logger: createLogger(),
  });

  // Parse cookies (required for HTTP-only refresh token cookie)
  app.use(cookieParser());

  // Enable CORS
  app.enableCors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3001',
    credentials: true,
  });

  // Enable validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Swagger configuration
  const config = new DocumentBuilder()
    .setTitle('SprintFlow API')
    .setDescription('The SprintFlow API - Jira and Monday\'s Killer')
    .setVersion('1.0')
    .addTag('tasks')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}`);
  console.log(`Swagger documentation: http://localhost:${port}/api`);
}
bootstrap();
