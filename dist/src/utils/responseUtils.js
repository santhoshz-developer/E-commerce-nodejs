"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorResponse = exports.successResponse = void 0;
const successResponse = (res, statusCode, message, data = null) => {
    res.status(statusCode).json({
        success: true,
        statusCode,
        message,
        data,
    });
};
exports.successResponse = successResponse;
const errorResponse = (res, statusCode, message, errors = null, errorDetail = null) => {
    res.status(statusCode).json({
        success: false,
        statusCode,
        message,
        errors,
        errorDetail,
    });
};
exports.errorResponse = errorResponse;
