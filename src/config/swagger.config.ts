import { DocumentBuilder } from '@nestjs/swagger';
import { SwaggerTheme, SwaggerThemeNameEnum } from 'swagger-themes';

export const swaggerConfig = new DocumentBuilder()
  .setTitle('dermanex apis')
  .setDescription('API documentation for dermanex app')
  .setVersion('1.0')
  .addBearerAuth(
    {
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
      name: 'Authorization',
      description: 'Enter JWT token (without "Bearer " prefix)',
      in: 'header',
    },
    'access-token',
  )
  .build();

const theme = new SwaggerTheme();

export const swaggerCustomOptions = {
  customCss: theme.getBuffer(SwaggerThemeNameEnum.CLASSIC),
  customSiteTitle: 'dermanex APIs',
  swaggerOptions: {
    persistAuthorization: true,
    filter: true,
    tagsSorter: 'alpha',
    tryItOutEnabled: true,
    useUnsafeMarkdown: true,
  },
};
