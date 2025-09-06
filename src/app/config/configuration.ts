const appEnvs = ['development', 'test', 'staging', 'production'];

export default () => {
  let appEnv = process.env['NODE_ENV'];

  if (appEnv === undefined || !appEnvs.includes(appEnv)) {
    appEnv = 'production';
  }

  const appPortStr = process.env['APP_PORT'];
  let appPort = 3000;

  if (appPortStr !== undefined) {
    appPort = parseInt(appPortStr);
  }

  const mongodbPortStr = process.env['MONGODB_PORT'];
  let mongodbPort = 27017;

  if (mongodbPortStr !== undefined) {
    mongodbPort = parseInt(mongodbPortStr);
  }

  const mongodbUseMockStr = process.env['MONGODB_USE_MOCK'];
  let mongodbUseMock = false;
  if (mongodbUseMockStr !== undefined) {
    if (
      mongodbUseMockStr === '1' ||
      mongodbUseMockStr.toLowerCase() === 'true'
    ) {
      mongodbUseMock = true;
    }
  }

  const messageGenerationUseMockStr = process.env['MSG_GEN_PROVIDER_USE_MOCK'];
  let messageGenerationUseMock = false;
  if (messageGenerationUseMockStr !== undefined) {
    if (
      messageGenerationUseMockStr === '1' ||
      messageGenerationUseMockStr.toLowerCase() === 'true'
    ) {
      messageGenerationUseMock = true;
    }
  }

  const facebookProviderUseMockStr = process.env['FB_PROVIDER_USE_MOCK'];
  let facebookProviderUseMock = false;
  if (facebookProviderUseMockStr !== undefined) {
    if (
      facebookProviderUseMockStr === '1' ||
      facebookProviderUseMockStr.toLowerCase() === 'true'
    ) {
      facebookProviderUseMock = true;
    }
  }

  return {
    appEnv,
    appPort: appPort,
    appName: 'Personify',
    mongodb: {
      host: process.env['MONGODB_HOST'] ?? 'localhost',
      port: mongodbPort,
      user: process.env['MONGODB_USER'],
      pass: process.env['MONGODB_PASS'],
      dbName: process.env['MONGODB_DBNAME'] ?? 'personify',
      useMock: mongodbUseMock,
    },
    aws: {
      accessKey: process.env['AWS_ACCESS_KEY'],
      secretKey: process.env['AWS_SECRET_KEY'],
      regionName: process.env['AWS_REGION_NAME'],
    },
    maxFetchLastMessages: process.env['MAX_FETCH_LAST_MSGS'] ?? 50,
    messageGeneratorProvider: {
      useMock: messageGenerationUseMock,
    },
    facebookProvider: {
      useMock: facebookProviderUseMock,
    },
  };
};
