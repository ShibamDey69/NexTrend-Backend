import Fastify from 'fastify';
import server from './server.js';
import config from './configs/config.js';
import Logger from './utils/logger.js';

const fastifyServer = Fastify({
  logger: Logger[config.NODE_ENV],
});

(async (fastify) => {
  try {
    await server(fastify);
    fastify.listen({
      port: config.SERVER_PORT,
      host: config.SERVER_HOST
    }, () => {
      fastify.log.info(`Server listening on port ${fastify.server?.address()?.port}`);
    });
  } catch (err) {
    console.log(err)
    fastify.log.error(err);
    process.exit(1);
  }
})(fastifyServer);