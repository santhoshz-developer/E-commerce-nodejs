"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateUserLogin = exports.validateUserSignup = void 0;
const express_validator_1 = require("express-validator");
const userModel_1 = __importDefault(require("../models/userModel"));
const commonFile_json_1 = __importDefault(require("../utils/commonFile.json"));
// Validation for Signup
exports.validateUserSignup = [
    (0, express_validator_1.body)("firstName")
        .notEmpty()
        .withMessage(commonFile_json_1.default.validation.firstNameRequired),
    (0, express_validator_1.body)("lastName").notEmpty().withMessage(commonFile_json_1.default.validation.lastNameRequired),
    (0, express_validator_1.body)("email")
        .isEmail()
        .withMessage(commonFile_json_1.default.validation.emailInvalid)
        .custom(async (email) => {
        const existingUser = await userModel_1.default.findOne({ email });
        if (existingUser) {
            throw new Error(commonFile_json_1.default.validation.emailInUse);
        }
        return true;
    }),
    (0, express_validator_1.body)("password")
        .isLength({ min: 6 })
        .withMessage(commonFile_json_1.default.validation.passwordShort),
    (0, express_validator_1.body)("phoneNumber")
        .isMobilePhone("any")
        .withMessage(commonFile_json_1.default.validation.phoneNumberInvalid),
];
// Validation for Login
exports.validateUserLogin = [
    (0, express_validator_1.body)("email").isEmail().withMessage(commonFile_json_1.default.validation.emailInvalid),
    (0, express_validator_1.body)("password").notEmpty().withMessage(commonFile_json_1.default.validation.passwordRequired),
];
