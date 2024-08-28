"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateLogin = exports.validateUserSignup = void 0;
const express_validator_1 = require("express-validator");
const userModel_1 = __importDefault(require("../models/userModel"));
exports.validateUserSignup = [
    (0, express_validator_1.body)('name').notEmpty().withMessage('Name is required'),
    (0, express_validator_1.body)('email')
        .isEmail()
        .withMessage('Enter a valid email')
        .custom(async (email) => {
        const existingUser = await userModel_1.default.findOne({ email });
        if (existingUser) {
            throw new Error('Email is already in use');
        }
        return true;
    }),
    (0, express_validator_1.body)('password')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters long'),
    (0, express_validator_1.body)('confirmPassword')
        .custom((value, { req }) => value === req.body.password)
        .withMessage('Passwords do not match'),
    (0, express_validator_1.body)('phoneNumber')
        .isMobilePhone('any')
        .withMessage('Enter a valid phone number'),
];
exports.validateLogin = [
    (0, express_validator_1.body)('email').isEmail().withMessage('Enter a valid email'),
    (0, express_validator_1.body)('password').notEmpty().withMessage('Password is required'),
];
