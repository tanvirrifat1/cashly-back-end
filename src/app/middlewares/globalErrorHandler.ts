import { ErrorRequestHandler } from 'express';
import config from '../../config';
import ApiError from '../../errors/ApiError';
import handleValidationError from '../../errors/handleValidationError';
import handleZodError from '../../errors/handleZodError';
import { errorLogger } from '../../shared/logger';
import { IErrorMessage } from '../../types/errors.types';
import { StatusCodes } from 'http-status-codes';
import mongoose from 'mongoose';

const globalErrorHandler: ErrorRequestHandler = (error, req, res, next) => {
  config.node_env === 'development'
    ? console.log('🚨 globalErrorHandler ~~ ', error)
    : errorLogger.error('🚨 globalErrorHandler ~~ ', error);

  let statusCode = 500;
  let message = 'Something went wrong';
  let errorMessages: IErrorMessage[] = [];

  if (error.name === 'ZodError') {
    const simplifiedError = handleZodError(error);
    statusCode = simplifiedError.statusCode;
    message = simplifiedError.message;
    errorMessages = simplifiedError.errorMessages;
  } else if (error.name === 'ValidationError') {
    const simplifiedError = handleValidationError(error);
    statusCode = simplifiedError.statusCode;
    message = simplifiedError.message;
    errorMessages = simplifiedError.errorMessages;
  } else if (error.name === 'TokenExpiredError') {
    statusCode = StatusCodes.UNAUTHORIZED;
    message = 'Session Expired';
    errorMessages = error?.message
      ? [
          {
            path: '',
            message:
              'Your session has expired. Please log in again to continue.',
          },
        ]
      : [];
  } else if (error.name === 'JsonWebTokenError') {
    statusCode = StatusCodes.UNAUTHORIZED;
    message = 'Invalid Token';
    errorMessages = error?.message
      ? [
          {
            path: '',
            message: 'Your token is invalid. Please log in again to continue.',
          },
        ]
      : [];
  } else if (error instanceof ApiError) {
    statusCode = error.statusCode;
    message = error.message;
    errorMessages = error.message
      ? [
          {
            path: '',
            message: error.message,
          },
        ]
      : [];
  } else if (error instanceof Error) {
    message = error.message;
    errorMessages = error.message
      ? [
          {
            path: '',
            message: error?.message,
          },
        ]
      : [];
  }

  res.status(statusCode).json({
    success: false,
    message,
    errorMessages,
    stack: config.node_env !== 'production' ? error?.stack : undefined,
  });
};

export default globalErrorHandler;

// const globalErrorHandler: ErrorRequestHandler = (error, req, res, next) => {
//   // Log the error
//   if (config.node_env === 'development') {
//     console.error('🚨 globalErrorHandler ~~ ', error);
//   } else {
//     errorLogger.error('🚨 globalErrorHandler ~~ ', error);
//   }

//   // Default error values
//   let statusCode = StatusCodes.INTERNAL_SERVER_ERROR;
//   let message = 'Something went wrong';
//   let errorMessages: { path: string; message: string }[] = [];

//   // Handle Mongoose ObjectId Cast Errors (Invalid ID Format)
//   if (error instanceof mongoose.Error.CastError) {
//     statusCode = StatusCodes.BAD_REQUEST;
//     message = `Invalid ${error.path}: ${error.value}`;
//     errorMessages = [{ path: error.path, message }];
//   }

//   // Handle Mongoose Validation Errors
//   else if (error instanceof mongoose.Error.ValidationError) {
//     statusCode = StatusCodes.BAD_REQUEST;
//     message = 'Validation failed';
//     errorMessages = Object.values(error.errors).map(err => ({
//       path: err.path,
//       message: err.message,
//     }));
//   }

//   // Handle Zod Validation Errors
//   else if (error.name === 'ZodError') {
//     statusCode = StatusCodes.BAD_REQUEST;
//     message = 'Validation error';
//     errorMessages = error.issues.map((issue: any) => ({
//       path: issue.path.join('.'),
//       message: issue.message,
//     }));
//   }

//   // Handle JWT Expired Error
//   else if (error.name === 'TokenExpiredError') {
//     statusCode = StatusCodes.UNAUTHORIZED;
//     message = 'Session Expired';
//     errorMessages = [
//       {
//         path: '',
//         message: 'Your session has expired. Please log in again to continue.',
//       },
//     ];
//   }

//   // Handle JWT Invalid Token Error
//   else if (error.name === 'JsonWebTokenError') {
//     statusCode = StatusCodes.UNAUTHORIZED;
//     message = 'Invalid Token';
//     errorMessages = [
//       {
//         path: '',
//         message: 'Your token is invalid. Please log in again to continue.',
//       },
//     ];
//   }

//   // Handle Custom API Errors
//   else if (error instanceof ApiError) {
//     statusCode = error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR;
//     message = error.message;
//     errorMessages = error.message ? [{ path: '', message: error.message }] : [];
//   }

//   // Handle Generic Errors
//   else {
//     statusCode = error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR;
//     message = error.message || 'Something went wrong';
//     errorMessages = [
//       {
//         path: '',
//         message: message,
//       },
//     ];
//   }

//   // Send Error Response
//   res.status(statusCode).json({
//     success: false,
//     message,
//     errorMessages,
//     stack: config.node_env !== 'production' ? error.stack : undefined,
//   });
// };

// export default globalErrorHandler;
