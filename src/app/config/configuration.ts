const appEnvs = ['development', 'test', 'staging', 'production'];

export default () => {
  let appEnv = process.env['NODE_ENV'];

  if (appEnv === undefined || !appEnvs.includes(appEnv)) {
    appEnv = 'development';
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

  return {
    appEnv,
    appPort: appPort,
    appName: 'Personify',
    mongodb: {
      host: process.env['MONGODB_HOST'] ?? 'localhost',
      user: process.env['MONGODB_USER'] ?? 'root',
      port: mongodbPort,
      useMock: mongodbUseMock,
    },
    aws: {
      accessKey: process.env['AWS_ACCESS_KEY'],
      secretKey: process.env['AWS_SECRET_KEY'],
      regionName: process.env['AWS_REGION_NAME'],
    },
  };
};
