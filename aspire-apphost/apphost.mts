import { createBuilder } from './.aspire/modules/aspire.mjs';

const builder = await createBuilder();

const postgres = await builder.addPostgres('pg').withDataVolume();
const database = await postgres.addDatabase('crm');
const databaseUrl = await database.uriExpression();

// Install the shared root package once, before generating Prisma or starting services.
const migrations = await builder
  .addJavaScriptApp('migrations', '..', { runScriptName: 'db:deploy' })
  .withNpm({ installCommand: 'ci' })
  .withEnvironment('DATABASE_URL', databaseUrl)
  .waitFor(database);

const seed = await builder
  .addJavaScriptApp('seed', '..', { runScriptName: 'db:seed' })
  .withNpm({ install: false })
  .withEnvironment('DATABASE_URL', databaseUrl)
  .waitForCompletion(migrations);

const api = await builder
  .addJavaScriptApp('api', '..', { runScriptName: 'server' })
  .withNpm({ install: false })
  .withEnvironment('NODE_ENV', 'development')
  .withEnvironment('DATABASE_URL', databaseUrl)
  .withHttpEndpoint({ env: 'PORT' })
  .withHttpHealthCheck({ path: '/api/v1/health' })
  .waitForCompletion(seed);

const web = await builder
  .addViteApp('web', '..', { runScriptName: 'client' })
  .withNpm({ install: false })
  .withEnvironment('API_URL', api.getEndpoint('http'))
  .withEnvironment('BROWSER', 'none')
  .withHttpHealthCheck({ path: '/' })
  .waitFor(api);

await api.withEnvironment('FRONTEND_URL', web.getEndpoint('http'));

await builder.build().run();
