import { Request, Response, NextFunction } from 'express';

export interface CustomError extends Error {
  statusCode?: number;
  status?: string;
  isOperational?: boolean;
}

export const errorHandler = (
  err: CustomError,
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  const statusCode = err.statusCode || 500;
  const status = err.status || 'error';

  console.error('错误详情:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    timestamp: new Date().toISOString()
  });

  // 开发环境返回详细错误信息
  if (process.env.NODE_ENV === 'development') {
    return res.status(statusCode).json({
      status,
      error: err,
      message: err.message,
      stack: err.stack
    });
  }

  // 生产环境返回简化错误信息
  if (err.isOperational) {
    return res.status(statusCode).json({
      status,
      message: err.message
    });
  }

  // 对于未知错误，返回通用错误信息
  return res.status(500).json({
    status: 'error',
    message: '服务器内部错误'
  });
};

export const createError = (message: string, statusCode: number): CustomError => {
  const error = new Error(message) as CustomError;
  error.statusCode = statusCode;
  error.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
  error.isOperational = true;
  return error;
};

export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};