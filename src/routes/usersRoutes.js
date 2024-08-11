import fp from 'fastify-plugin';


const usersRoutes = fp(async (fastify) => {
	try {

	} catch (error) {
		 fastify.log.error(error);
		 throw error;
	}
})

export default usersRoutes;