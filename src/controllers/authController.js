import { v4 as uuid } from "uuid";
import errorCodes from "../constants/errorCodes.js";
import { StatusCodes } from "http-status-codes";
import bcrypt from "bcryptjs";
import Database from "../utils/db.js";
import CryptoService from "../utils/jwt.js";
import config from "../configs/config.js";

export default class Auth {
  constructor(fastify) {
    this.fastify = fastify;
    this.db = new Database(this.fastify.db);
    this.crypto = new CryptoService(config.ENCRYPTION_KEY);
  }

  /**
   * Registers a new user in the system.
   * 
   * - Checks if the email is already associated with a verified or unverified user.
   * - Hashes the password and creates a new user record if the email is not in use.
   * - Generates and encrypts JWT tokens (access and refresh).
   * - Sends a verification email to the user.
   * - Sets the JWT tokens in secure cookies and sends a success response.
   * 
   * @param {Object} req - The Fastify request object containing user data.
   * @param {Object} res - The Fastify response object used to send the response.
   */
  async register(req, res) {
    try {
      const { username, email, password, role, role_secret } = req.body;
      const user = await this.db.getUser(email);

      if (user) {
        return res
          .code(user.is_verified ? StatusCodes.CONFLICT : StatusCodes.UNAUTHORIZED)
          .send(user.is_verified ? errorCodes.EMAIL_ALREADY_EXISTS : errorCodes.EMAIL_NOT_VERIFIED);
      }
      if (role && role_secret !== config.ROLE_SECRET) {
        return res.code(StatusCodes.UNAUTHORIZED).send(errorCodes.UNAUTHORIZED);
      }
      const hashedPass = await bcrypt.hash(password, 10);
      const user_id = uuid();
      const refreshToken = this.crypto.encrypt(await res.jwtSign({ user_id }, { expiresIn: '7d' }));
      const accessToken = this.crypto.encrypt(await res.jwtSign({ user_id, role }, { expiresIn: '15m' }));

      const userData = { user_id, username, email, password: hashedPass, role, refresh_token: refreshToken };
      const newUser = await this.db.createUser(userData);

      await this.db.sendEmail({
        email,
        hostname: req.hostname,
        token: (await this.db.generateVerificationToken(userData)).SUCCESS?.token,
      });

      if (newUser) {
        return res
          .code(StatusCodes.CREATED)
          .setCookie('refresh_token', refreshToken, this._cookieOptions())
          .setCookie('access_token', accessToken, this._cookieOptions())
          .send({ statusCode: StatusCodes.CREATED, code: "CREATED", message: "User registered successfully" });
      }
    } catch (error) {
      return await res.code(StatusCodes.INTERNAL_SERVER_ERROR).send(errorCodes.INTERNAL_SERVER_ERROR);
    }
  }
  /**
   * Logs in an existing user.
   * 
   * - Verifies that the email is associated with a user and that the user is verified.
   * - Checks the provided password against the stored hashed password.
   * - Generates and encrypts new JWT tokens (access and refresh).
   * - Updates the user record with the new refresh token.
   * - Sets the JWT tokens in secure cookies and sends a success response.
   * 
   * @param {Object} req - The Fastify request object containing user credentials.
   * @param {Object} res - The Fastify response object used to send the response.
   */
  async login(req, res) {
    try {
      const { email, password } = req.body;
      const user = await this.db.getUser(email);

      if (!user || !user.is_verified || !await bcrypt.compare(password, user.password)) {
        return res.code(StatusCodes.UNAUTHORIZED).send(errorCodes.INVALID_CREDENTIALS);
      }

      const refreshToken = this.crypto.encrypt(await res.jwtSign({ user_id: user.user_id }, { expiresIn: '7d' }));
      const accessToken = this.crypto.encrypt(await res.jwtSign({ user_id: user.user_id, role: user.role }, { expiresIn: '15m' }));

      await this.db.updateUser(user, { refresh_token: refreshToken });

      return res
        .code(StatusCodes.OK)
        .setCookie('refresh_token', refreshToken, this._cookieOptions())
        .setCookie('access_token', accessToken, this._cookieOptions())
        .send({ statusCode: StatusCodes.OK, code: "OK", message: "User logged in successfully" });
    } catch (error) {
      return await res.code(StatusCodes.INTERNAL_SERVER_ERROR).send(errorCodes.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Resends the verification token to the user if their email is not verified.
   * 
   * - Checks if the user exists and is not already verified.
   * - Generates a new verification token and sends it via email.
   * - If the token generation is successful, responds with the token.
   * - If the token generation limit is exceeded, responds with an appropriate error.
   * 
   * @param {Object} req - The Fastify request object containing the user's email.
   * @param {Object} res - The Fastify response object used to send the response.
   */
  async resetVerificationToken(req, res) {
    try {
      const { email } = req.body;
      const user = await this.db.getUser(email);

      if (!user) {
        return res.code(StatusCodes.NOT_FOUND).send(errorCodes.USER_NOT_FOUND);
      }

      if (user.is_verified) {
        return await res.code(StatusCodes.OK).send(errorCodes.EMAIL_ALREADY_VERIFIED);
      }

      const token = await this.db.generateVerificationToken(user);

      if (token.SUCCESS) {
        await this.db.sendEmail({ email, hostname: req.hostname, token: token.SUCCESS?.token });
        return await res.code(StatusCodes.OK).send(token.SUCCESS);
      } else {
        return await res.code(StatusCodes.TOO_MANY_REQUESTS).send(token.GEN_LIMIT_EXCEEDED);
      }
    } catch (error) {
      return await res.code(StatusCodes.INTERNAL_SERVER_ERROR).send(errorCodes.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Verifies a user's email using the token provided in the query string.
   * 
   * - Retrieves the verification token from the query string.
   * - Verifies the token against the database to activate the user's account.
   * - Responds with success if the token is valid, otherwise sends an error message.
   * 
   * @param {Object} req - The Fastify request object containing the verification token.
   * @param {Object} res - The Fastify response object used to send the response.
   */
  async verifyEmail(req, res) {
    try {
      const data = await this.db.verifyEmail(req.query.token);
      return res.code(data.SUCCESS ? StatusCodes.OK : StatusCodes.BAD_REQUEST).send(data.SUCCESS || data.INVALID_TOKEN || data.EXPIRED_TOKEN);
    } catch (error) {
      return await res.code(StatusCodes.INTERNAL_SERVER_ERROR).send(errorCodes.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Logs out the user by clearing the JWT tokens stored in cookies and updating the refresh token in the database.
   * 
   * - Clears the `refresh_token` and `access_token` cookies by setting them to expire immediately.
   * - Updates the user's refresh token in the database to invalidate the current session.
   * - Sends a success response indicating the user has been logged out.
   * 
   * @param {Object} req - The Fastify request object containing the user information.
   * @param {Object} res - The Fastify response object used to send the response.
   */
  async logout(req, res) {
    try {
      const { refresh_token } = req.cookies;
      const user = await this.db.getUser(refresh_token);
      if (!user) {
        return res.code(StatusCodes.UNAUTHORIZED).send(errorCodes.UNAUTHORIZED);
      }
      await this.db.updateUser( user, { refresh_token: '' });

      return res
        .clearCookie('refresh_token', this._cookieOptions())
        .clearCookie('access_token', this._cookieOptions())
        .code(StatusCodes.OK)
        .send({ statusCode: StatusCodes.OK, code: "OK", message: "User logged out successfully" });
    } catch (error) {
      return res.code(StatusCodes.INTERNAL_SERVER_ERROR).send(errorCodes.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Initiates the password reset process by sending a reset link to the user's email.
   * 
   * - Checks if the email is associated with a user in the database.
   * - Generates a password reset token and sends it to the user's email.
   * - Sends a success response indicating that the reset link has been sent if the email exists.
   * 
   * @param {Object} req - The Fastify request object containing the user's email.
   * @param {Object} res - The Fastify response object used to send the response.
   */
  async forgotPassword(req, res) {
    try {
      const { email } = req.body;
      const user = await this.db.getUser(email);

      if (!user) {
        return res.code(StatusCodes.OK).send({ statusCode: StatusCodes.OK, code: "OK", message: "If the email exists, a reset link has been sent." });
      }

      const resetToken = await this.db.generateResetToken(user);

      await this.db.sendEmail({
        email,
        hostname: req.hostname,
        token: resetToken.SUCCESS?.token,
        reset: true,
      });

      return res.code(StatusCodes.OK).send({ statusCode: StatusCodes.OK, code: "OK", message: "If the email exists, a reset link has been sent." });
    } catch (error) {
      return res.code(StatusCodes.INTERNAL_SERVER_ERROR).send(errorCodes.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Resets the user's password using a valid reset token.
   * 
   * - Verifies the provided reset token.
   * - Updates the user's password if the token is valid and not expired.
   * - Responds with success if the password is successfully reset, or sends an error if the token is invalid/expired.
   * 
   * @param {Object} req - The Fastify request object containing the reset token and new password.
   * @param {Object} res - The Fastify response object used to send the response.
   */
  async resetPassword(req, res) {
    try {
      const { token, newPassword } = req.body;
      const resetData = await this.db.verifyResetToken(token);

      if (!resetData.SUCCESS) {
        return res.code(StatusCodes.BAD_REQUEST).send(resetData.INVALID_TOKEN || resetData.EXPIRED_TOKEN);
      }

      const hashedPass = await bcrypt.hash(newPassword, 10);
      await this.db.updateUser(resetData.user, { password: hashedPass });

      return res.code(StatusCodes.OK).send({ statusCode: StatusCodes.OK, code: "OK", message: "Password reset successfully" });
    } catch (error) {
      return res.code(StatusCodes.INTERNAL_SERVER_ERROR).send(errorCodes.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Refreshes the user's access token using a valid refresh token.
   * 
   * - Checks if the provided refresh token is valid and matches the user's stored refresh token.
   * - Generates and encrypts a new access token.
   * - Sets the new access token in a secure cookie and sends it in the response.
   * 
   * @param {Object} req - The Fastify request object containing the refresh token.
   * @param {Object} res - The Fastify response object used to send the response.
   */
  async refreshAccessToken(req, res) {
    try {
      const { refresh_token } = req.cookies;
      const { user_id } = this.crypto.decrypt(refresh_token);

      const user = await this.db.getUserById(user_id);

      if (!user || user.refresh_token !== refresh_token) {
        return res.code(StatusCodes.UNAUTHORIZED).send(errorCodes.INVALID_REFRESH_TOKEN);
      }

      const newAccessToken = this.crypto.encrypt(await res.jwtSign({ user_id: user.user_id, role: user.role }, { expiresIn: '15m' }));

      return res
        .setCookie('access_token', newAccessToken, this._cookieOptions())
        .code(StatusCodes.OK)
        .send({ statusCode: StatusCodes.OK, code: "OK", message: "Access token refreshed successfully" });
    } catch (error) {
      return res.code(StatusCodes.INTERNAL_SERVER_ERROR).send(errorCodes.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Generates common options for setting cookies.
   * 
   * - Configures domain, path, httpOnly, secure, and sameSite attributes based on the environment.
   * 
   * @returns {Object} - The configuration object for cookie options.
   */
  _cookieOptions() {
    return {
      domain: config.JWT_COOKIE_DOMAIN,
      path: config.JWT_COOKIE_PATH,
      httpOnly: config.JWT_COOKIE_HTTP_ONLY,
      secure: config.NODE_ENV === "production",
      sameSite: config.NODE_ENV === "production",
    };
  }
}