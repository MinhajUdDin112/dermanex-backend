import { DocumentBuilder } from '@nestjs/swagger';
import { SwaggerTheme, SwaggerThemeNameEnum } from 'swagger-themes';

export const swaggerConfig = new DocumentBuilder()
  .setTitle('Fitness apis')
  .setDescription('API documentation for app')
  .setVersion('1.0')
  .addBearerAuth(
    // 👈 This adds the Bearer Token option in Swagger UI
    {
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
      name: 'Authorization',
      description: 'Enter JWT token (without "Bearer " prefix)',
      in: 'header',
    },
    'access-token', // name used for @ApiBearerAuth() reference
  )
  //   .addGlobalParameters({
  //     name: 'x-lang',
  //     in: 'header',
  //     required: false,
  //     description:
  //       "Language preference for API responses. Supported values: en (English), es (Spanish). Defaults to 'en'.",
  //     schema: {
  //       type: 'string',
  //       enum: ['en', 'es'],
  //       default: 'en',
  //     },
  //   })
  .build();

const theme = new SwaggerTheme();

export const swaggerCustomOptions = {
  customCss: theme.getBuffer(SwaggerThemeNameEnum.CLASSIC),
  customSiteTitle: 'Fitness APIs',
  swaggerOptions: {
    persistAuthorization: true,
    filter: true,
    tagsSorter: 'alpha',
    tryItOutEnabled: true,
    useUnsafeMarkdown: true,
  },
};
