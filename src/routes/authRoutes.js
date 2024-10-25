import fp from "fastify-plugin";
import Auth from "../controllers/authController.js";

const authRoutes = fp(async (fastify) => {
   try {
      let auth = new Auth(fastify);
      fastify.route({
         method: "POST",
         url: "/register",
         schema: {
            body: {
               type: "object",
               required: ["email", "password"],
               properties: {
                  username: { type: "string" },
                  email: { type: "string" },
                  password: { type: "string" },
                  role: { type: "string", enum: ["admin", "user"] },
                  role_secret: { type: "string" }
               },
            },
         },
         handler: auth.register,
      });

       fastify.route({
          method: "POST",
          url: "/login",
          schema: {
             body: {
                type: "object",
                required: ["email", "password"],
                properties: {
                   email: { type: "string" },
                   password: { type: "string" },
                },
             },
          },
          handler: auth.login
       })
      
       fastify.route({
          method: "GET",
          url: "/verify-email",
          schema: {
             querystring: {
                type: "object",
                required: ["token"],
                properties: {
                   token: { type: "string" },
                },
             },
          },
          handler: auth.verifyEmail,
       })

       fastify.route({
          method: "POST",
          url: "/forgot-password",
          schema: {
             body: {
                type: "object",
                required: ["email"],
                properties: {
                   email: { type: "string" },
                },
             },
          },
          handler: auth.forgotPassword,
       })

      fastify.route({
          method: "POST",
          url: "/reset-password",
          schema: {
             body: {
                type: "object",
                required: ["token", "password"],
                properties: {
                   token: { type: "string" },
                   password: { type: "string" },
                },
             },
          },
          handler: auth.resetPassword,
       })

       fastify.route({
          method: "POST",
          url: "/logout",
          handler: auth.logout,
       })

      fastify.route({
          method: "POST",
          url: "/refresh-token",
          schema: {
             body: {
                type: "object",
                required: ["refresh_token"],
                properties: {
                   refresh_token: { type: "string" },
                },
             },
          },
          handler: auth.refreshToken,
       })
   } catch (error) {
      fastify.log.error(error);
      throw error;
   }
});

export default authRoutes;
