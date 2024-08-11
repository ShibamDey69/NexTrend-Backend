import fp from 'fastify-plugin';


const categoriesRoutes = fp(async (fastify) => {
  try {
     
  } catch (error) {
     fastify.log.error(error);
     throw error;
  }
})

export default categoriesRoutes;