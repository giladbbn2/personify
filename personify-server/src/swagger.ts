import { CreateNestApplication } from './app/app';
import { writeFileSync } from 'fs';

async function saveSwaggerDocument() {
  const { swaggerDocument } = await CreateNestApplication();
  const json = JSON.stringify(swaggerDocument);
  writeFileSync('./swagger.json', json);
}

void saveSwaggerDocument();
