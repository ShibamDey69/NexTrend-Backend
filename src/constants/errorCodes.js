
const errorCodes = {
  BAD_REQUEST: {
    statusCode: 400,
    code: 'BAD_REQUEST',
    message: 'The request is invalid or cannot be served. Please check your input.',
  },
  UNAUTHORIZED: {
    statusCode: 401,
    code: 'UNAUTHORIZED',
    message: 'You must be logged in to perform this action.',
  },
  FORBIDDEN: {
    statusCode: 403,
    code: 'FORBIDDEN',
    message: 'You do not have permission to perform this action.',
  },
  NOT_FOUND: {
    statusCode: 404,
    code: 'NOT_FOUND',
    message: 'The requested resource or product was not found.',
  },
  METHOD_NOT_ALLOWED: {
    statusCode: 405,
    code: 'METHOD_NOT_ALLOWED',
    message: 'The request method is not supported for the requested resource.',
  },
  CONFLICT: {
    statusCode: 409,
    code: 'CONFLICT',
    message: 'There was a conflict with the current state of the resource. Please try again.',
  },
  INVALID_CREDENTIALS: {
    statusCode: 401,
    code: 'INVALID_CREDENTIALS',
    message: 'The email or password you provided is incorrect.',
  },
  EMAIL_ALREADY_EXISTS: {
    statusCode: 409,
    code: 'EMAIL_ALREADY_EXISTS',
    message: 'An account with this email already exists. Please login or use a different email.',
  },
  ITEM_OUT_OF_STOCK: {
    statusCode: 409,
    code: 'ITEM_OUT_OF_STOCK',
    message: 'The item you are trying to purchase is out of stock.',
  },
  PAYMENT_REQUIRED: {
    statusCode: 402,
    code: 'PAYMENT_REQUIRED',
    message: 'Payment is required to complete the purchase.',
  },
  INTERNAL_SERVER_ERROR: {
    statusCode: 500,
    code: 'INTERNAL_SERVER_ERROR',
    message: 'An unexpected error occurred. Please try again later.',
  },
  NOT_IMPLEMENTED: {
    statusCode: 501,
    code: 'NOT_IMPLEMENTED',
    message: 'This feature is not yet implemented. Please check back later.',
  },
  BAD_GATEWAY: {
    statusCode: 502,
    code: 'BAD_GATEWAY',
    message: 'The server received an invalid response from the upstream server.',
  },
  SERVICE_UNAVAILABLE: {
    statusCode: 503,
    code: 'SERVICE_UNAVAILABLE',
    message: 'The server is currently unavailable. Please try again later.',
  },
  GATEWAY_TIMEOUT: {
    statusCode: 504,
    code: 'GATEWAY_TIMEOUT',
    message: 'The server did not receive a timely response from the upstream server.',
  },
};


export default errorCodes;