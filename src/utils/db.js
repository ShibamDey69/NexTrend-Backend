import userSchema from "../models/users.js";
import { eq } from "drizzle-orm";
import { addMinutes, addHours, isBefore } from "date-fns";
import nodemailer from "nodemailer";
import { v4 as uuid } from "uuid";
import config from "../configs/config.js";

export default class Database {
   constructor(db) {
      this.db = db;
   }

   // Insert a new user into the database
   createUser = async (user) => {
      try {
         await this.db.insert(userSchema).values(user);
         return true;
      } catch (error) {
         console.log(error);
         throw new Error(error);
      }
   };

   // Fetch a user by email
   getUser = async (email) => {
      try {
         const [user] = await this.db
            .select()
            .from(userSchema)
            .where(eq(userSchema.email, email));
         return user;
      } catch (error) {
         throw new Error(error);
      }
   };

   // Update a user's data
   updateUser = async (user, data = {}) => {
      try {
         await this.db
            .update(userSchema)
            .set({
               updated_at: new Date(),
               ...data,
            })
            .where(eq(userSchema.user_id, user.user_id));
         return true;
      } catch (error) {
         throw new Error(error);
      }
   };

   // Verify the user's email using a token
   verifyEmail = async (token) => {
      try {
         const [data] = await this.db
            .select()
            .from(userSchema)
            .where(eq(userSchema.verification_token, token));

         if (!data) {
            return {
               INVALID_TOKEN: {
                  statusCode: 401,
                  code: "INVALID_TOKEN",
                  message:
                     "The provided token is invalid or expired. Please request a new token again.",
               },
            };
         }

         const now = new Date();
         const { vt_created_at } = data;
         const expiration_time = addMinutes(vt_created_at, 30);
         if (isBefore(now, expiration_time)) {
            await this.updateUser(data, {
               is_verified: true,
               verification_token: '',
               vt_gen_count: 0,
            });
            return {
               SUCCESS: {
                  statusCode: 200,
                  code: "SUCCESS",
                  message: "Email verified successfully",
               },
            };
         } else {
            return {
               EXPIRED_TOKEN: {
                  statusCode: 401,
                  code: "EXPIRED_TOKEN",
                  message:
                     "The provided token is invalid or expired. Please request a new token again.",
               },
            };
         }
      } catch (error) {
         throw new Error(error);
      }
   };

   // Send an email using nodemailer
   sendEmail = async (obj) => {
      try {
         const transporter = nodemailer.createTransport({
            host: config.EMAIL_HOST,
            port: config.EMAIL_PORT,
            auth: {
               user: config.EMAIL_USER,
               pass: config.EMAIL_PASSWORD,
            },
         });

         await transporter.sendMail({
            from: config.EMAIL_USER,
            to: obj.email,
            subject: obj.reset ? "Password Reset" : "Verification Email",
            text: obj.reset ? "Reset Your Password" : "Please Confirm Your Email",
            html: `
               <!DOCTYPE html>
               <html lang="en">
               <head>
                   <meta charset="UTF-8">
                   <meta name="viewport" content="width=device-width, initial-scale=1.0">
                   <title>${obj.reset ? "Reset Password" : "Confirm Email"}</title>
               </head>
               <body>
                   <a href="https://${obj.hostname}/${
              obj.reset ? "reset-password" : "verify-email"
            }?token=${obj.token}" style="
                       display: inline-block;
                       padding: 10px 20px;
                       color: white;
                       background-color: blue;
                       text-decoration: none;
                       border-radius: 5px;
                       font-size: 16px;
                       text-align: center;
                   ">${obj.reset ? "Reset Password" : "Confirm Email"}</a>
               </body>
               </html>
            `,
         });

         return {
            statusCode: 200,
            code: "SUCCESS",
            message: obj.reset ? "Password reset email sent successfully" : "Verification email sent successfully",
         };
      } catch (error) {
         console.log(error);
         throw new Error(error);
      }
   };

   // Generate a verification token for a user
   generateVerificationToken = async (user) => {
      try {
         let token = uuid();
         if (!user.verification_token || !isBefore(new Date(), addHours(user.vt_created_at, 3))) {
            await this.updateUser(user, {
               verification_token: token,
               vt_created_at: new Date(),
               vt_gen_count: 1,
            });
            return {
               SUCCESS: {
                  statusCode: 200,
                  code: "SUCCESS",
                  token,
                  message: "Password reset token generated successfully",
               },
            };
         } else if (user.vt_gen_count >= 5) {
            return {
               GEN_LIMIT_EXCEEDED: {
                  statusCode: 429,
                  code: "GEN_LIMIT_EXCEEDED",
                  message:
                     "You have reached the limit of verification tokens generated. Please try again later.",
               },
            };
         } else {
            await this.updateUser(user, {
               verification_token: token,
               vt_gen_count: ++user.vt_gen_count,
            });
            return {
            SUCCESS: {
               statusCode: 200,
               code: "SUCCESS",
               token,
               message: "Password reset token generated successfully",
            },
         };
         }

         return {
            SUCCESS: {
               statusCode: 200,
               code: "SUCCESS",
               token,
               message: "Email verification token generated successfully!",
            },
         };
      } catch (error) {
         throw new Error(error);
      }
   };

   // Generate a reset password token for a user
   generateResetToken = async (user) => {
      try {
         let token = uuid();
         await this.updateUser(user, {
            reset_token: token,
            rt_created_at: new Date(),
         });
         return {
            SUCCESS: {
               statusCode: 200,
               code: "SUCCESS",
               token,
               message: "Password reset token generated successfully",
            },
         };
      } catch (error) {
         throw new Error(error);
      }
   };

   // Verify the reset token
   verifyResetToken = async (token) => {
      try {
         const [user] = await this.db
            .select()
            .from(userSchema)
            .where(eq(userSchema.reset_token, token));

         if (!user) {
            return {
               INVALID_TOKEN: {
                  statusCode: 401,
                  code: "INVALID_TOKEN",
                  message:
                     "The provided reset token is invalid or expired. Please request a new token again.",
               },
            };
         }

         const now = new Date();
         const expiration_time = addMinutes(user.rt_created_at, 30);
         if (isBefore(now, expiration_time)) {
            await this.updateUser(user,{
               reset_token: '',
            })
            return {
               SUCCESS: {
                  statusCode: 200,
                  code: "SUCCESS",
                  message: "Password reset token verified successfully",
               },
            };
         } else {
            return {
               EXPIRED_TOKEN: {
                  statusCode: 401,
                  code: "EXPIRED_TOKEN",
                  message:
                     "The provided reset token is invalid or expired. Please request a new token again.",
               },
            };
         }
      } catch (error) {
         throw new Error(error);
      }
   };

   // Get a user by user_id
   getUserById = async (user_id) => {
      try {
         const [user] = await this.db
            .select()
            .from(userSchema)
            .where(eq(userSchema.user_id, user_id));
         return user;
      } catch (error) {
         throw new Error(error);
      }
   };
}