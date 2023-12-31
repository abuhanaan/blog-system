import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe, BadRequestException } from '@nestjs/common';
import { BadRequestExceptionFilter } from './utils/badRequestExceptionFilter';
import { GlobalExceptionFilter } from './utils/globalExceptionFilter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      enableDebugMessages: true,
      exceptionFactory: (errors) => {
        throw new BadRequestException(errors);
      },
    }),
  );

  // Register the global exception filter
  // app.useGlobalFilters(new ValidationExceptionFilter());
  app.useGlobalFilters(
    new GlobalExceptionFilter(),
    new BadRequestExceptionFilter(),
  );
  // app.useGlobalFilters(new GlobalExceptionFilter());

  // SwaggerUI Setup
  const config = new DocumentBuilder()
    .setTitle('Median')
    .setDescription('The Blog API description')
    .setVersion('0.1')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(3000);
}
bootstrap();
