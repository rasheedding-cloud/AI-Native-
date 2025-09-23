import { Request, Response, NextFunction } from 'express';

export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();

  // 记录请求开始
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);

  // 监听响应结束
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url} - ${res.statusCode} - ${duration}ms`);
  });

  next();
};