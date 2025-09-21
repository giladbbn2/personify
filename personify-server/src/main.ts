import { CreateNestApplication, RunNestApplication } from './app/app';

async function bootstrap() {
  const { app } = await CreateNestApplication();
  await RunNestApplication(app);
}

void bootstrap();
