import fp from 'fastify-plugin';


const authRoutes = fp(async (fastify) => {
  try {
     
  } catch (error) {
     fastify.log.error(error);
     throw error;
  }
})

export default authRoutes