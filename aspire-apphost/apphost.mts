import { createBuilder } from './.aspire/modules/aspire.mjs';

const builder = await createBuilder();

const postgres = await builder.addPostgres('pg').withDataVolume();
const database = await postgres.addDatabase('crm');
const databaseUrl = await database.uriExpression();

// All three processes share the root package; install once before starting Aspire.
const migrations = await builder
  .addJavaScriptApp('migrations', '..', { runScriptName: 'db:deploy' })
  .withNpm({ install: false })
  .withEnvironment('DATABASE_URL', databaseUrl)
  .waitFor(database);

const api = await builder
  .addJavaScriptApp('api', '..', { runScriptName: 'server' })
  .withNpm({ install: false })
  .withEnvironment('NODE_ENV', 'development')
  .withEnvironment('DATABASE_URL', databaseUrl)
  .withHttpEndpoint({ env: 'PORT' })
  .withHttpHealthCheck({ path: '/api/v1/health' })
  .waitForCompletion(migrations);

const web = await builder
  .addViteApp('web', '..', { runScriptName: 'client' })
  .withNpm({ install: false })
  .withEnvironment('API_URL', api.getEndpoint('http'))
  .withEnvironment('BROWSER', 'none')
  .withHttpHealthCheck({ path: '/' })
  .waitFor(api);

await api.withEnvironment('FRONTEND_URL', web.getEndpoint('http'));

await builder.build().run();
