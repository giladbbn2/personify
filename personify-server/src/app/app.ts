import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './filters/http-exception.filter';
import {
  ConsoleLogger,
  INestApplication,
  LogLevel,
  ValidationPipe,
} from '@nestjs/common';
import { DocumentBuilder, OpenAPIObject, SwaggerModule } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';
import configuration from './config/configuration';

const config = configuration();

export async function CreateNestApplication(): Promise<{
  app: INestApplication;
  swaggerDocument: OpenAPIObject;
}> {
  let logLevels: LogLevel[];

  if (config.appEnv === 'production') {
    logLevels = ['log', 'error', 'fatal'];
  } else {
    logLevels = ['log', 'error', 'warn', 'debug', 'verbose', 'fatal'];
  }

  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: new ConsoleLogger({
      json: true,
      logLevels: logLevels,
    }),
  });

  app.disable('x-powered-by');

  const swaggerConfig = new DocumentBuilder()
    .setTitle(config.appName)
    .addBearerAuth()
    .build();

  const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig);

  SwaggerModule.setup('swagger', app, swaggerDocument);

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
    }),
  );

  app.useGlobalFilters(new HttpExceptionFilter());

  return {
    app,
    swaggerDocument,
  };
}

export async function RunNestApplication(
  app: INestApplication,
  port?: number,
): Promise<void> {
  if (port === undefined) {
    port = config.appPort;
  }

  await app.listen(port);
}
