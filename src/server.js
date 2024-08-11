
import config from './configs/config.js';
const server = (fastify) => {
  return new Promise(async (resolve,reject) => {
    try {
      fastify.register(await import('@fastify/jwt'),{
        secret:config.JWT_SECRET,
      })
      fastify.register(await import('./routes/authRoutes.js'));
      fastify.register(await import('./routes/categoriesRoutes.js'));
      fastify.register(await import('./routes/productsRoutes.js'));
      fastify.register(await import('./routes/usersRoutes.js'));
      resolve(fastify);
    } catch (error) {
      reject(error)
    }
  })
}

export default server;