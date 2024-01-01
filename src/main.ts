import { HttpAdapterHost, NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import {
  ValidationPipe,
  BadRequestException,
  ClassSerializerInterceptor,
} from '@nestjs/common';
import { BadRequestExceptionFilter } from './utils/badRequestExceptionFilter';
import { GlobalExceptionFilter } from './utils/globalExceptionFilter';
import { PrismaClientExceptionFilter } from './prisma-client-exception/prisma-client-exception.filter';

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

  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

  // const { httpAdapter } = app.get(HttpAdapterHost);

  // Register the global exception filter
  app.useGlobalFilters(
    new GlobalExceptionFilter(),
    // new PrismaClientExceptionFilter(httpAdapter),
    new BadRequestExceptionFilter(),
  );

  // SwaggerUI Setup
  const config = new DocumentBuilder()
    .setTitle('Median')
    .setDescription('The Blog API description')
    .setVersion('0.1')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(3000);
}
bootstrap();
