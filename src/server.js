
import config from './configs/config.js';
const server = (fastify) => {
  return new Promise(async (resolve,reject) => {
    try {
      fastify.register(await import('./plugins/dbPlugin.js'))
      fastify.register(await import('@fastify/jwt'),{
        secret:config.JWT_SECRET,
      })
      fastify.register(await import('@fastify/cookie'),{
        secret:config.COOKIE_SECRET,
      })
      fastify.register(await import('./routes/authRoutes.js'),{prefix:'/auth'});
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