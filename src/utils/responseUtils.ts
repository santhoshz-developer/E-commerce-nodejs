import { Response } from 'express';

export interface IErrorDetail {
  type: string;
  msg: string;
  path?: string;
  location?: string;
}

export const successResponse = (res: Response, statusCode: number, message: string, data: any = null): void => {
  res.status(statusCode).json({
    success: true,
    statusCode,
    message,
    data,
  });
};

export const errorResponse = (
  res: Response,
  statusCode: number,
  message: string,
  errors: IErrorDetail[] | null = null,
  errorDetail: any = null
): void => {
  res.status(statusCode).json({
    success: false,
    statusCode,
    message,
    errors,
    errorDetail,
  });
};
