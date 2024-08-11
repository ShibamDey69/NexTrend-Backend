import fp from 'fastify-plugin';


const productsRoutes = fp(async (fastify) => {
	try {

	} catch (error) {
		 fastify.log.error(error);
		 throw error;
	}
})

export default productsRoutes;