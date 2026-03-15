import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { swaggerConfig, swaggerCustomOptions } from './config/swagger.config';
import * as dotenv from 'dotenv';
import * as swaggerUi from 'swagger-ui-express';
import { SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import * as express from 'express';
import * as bodyParser from 'body-parser';

async function bootstrap() {
  dotenv.config();

  const app = await NestFactory.create(AppModule);

  app.enableCors();

  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      disableErrorMessages: false,
    }),
  );

  const document = SwaggerModule.createDocument(app, swaggerConfig);

  app.use(
    '/docs',
    swaggerUi.serve,
    swaggerUi.setup(document, swaggerCustomOptions),
  );

  const port = process.env.PORT || 3000;
  await app.listen(port);

  console.log(`Server running on http://localhost:${port}`);
  console.log(` Swagger Docs available at http://localhost:${port}/docs`);
}
bootstrap();
