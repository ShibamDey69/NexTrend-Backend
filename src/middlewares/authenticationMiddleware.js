import fp from 'fastify-plugin';
import config from '../configs/config.js';
import CryptoService from '../utils/jwt.js';
import { StatusCodes } from 'http-status-codes';
import errorCodes from '../constants/errorCodes.js';
const jwtVerify = fp(async (fastify) => {
  fastify.addHook('preHandler', async (req, res) => {
    try {
      const token = req.cookies.access_token;
      const cryptoservice = new CryptoService(config.ENCRYPTION_KEY);
      const decryptedToken = await cryptoservice.decrypt(token);
      await res.jwtVerify(decryptedToken);
    } catch (error) {
      res.status(StatusCodes.UNAUTHORIZED).send(errorCodes.UNAUTHORIZED);
    }
  })
});

export default jwtVerify;