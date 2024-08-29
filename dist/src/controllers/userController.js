"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleUserLogin = exports.handleUserSignup = void 0;
const userModel_1 = __importDefault(require("../models/userModel"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const uuid_1 = require("uuid");
const client_dynamodb_1 = require("@aws-sdk/client-dynamodb");
const responseUtils_1 = require("../utils/responseUtils");
const commonFile_json_1 = __importDefault(require("../utils/commonFile.json"));
const dynamoDBClient = new client_dynamodb_1.DynamoDBClient({ region: "ap-south-1" });
const handleUserSignup = async (req, res) => {
    const { firstName, lastName, email, password, phoneNumber } = req.body;
    try {
        // Validate input
        const errors = [];
        if (!firstName)
            errors.push({
                type: "field",
                msg: commonFile_json_1.default.validation.firstNameRequired,
                path: "firstName",
                location: "body",
            });
        if (!lastName)
            errors.push({
                type: "field",
                msg: commonFile_json_1.default.validation.lastNameRequired,
                path: "lastName",
                location: "body",
            });
        if (!email)
            errors.push({
                type: "field",
                msg: commonFile_json_1.default.validation.emailInvalid,
                path: "email",
                location: "body",
            });
        if (!password)
            errors.push({
                type: "field",
                msg: commonFile_json_1.default.validation.passwordRequired,
                path: "password",
                location: "body",
            });
        if (!phoneNumber)
            errors.push({
                type: "field",
                msg: commonFile_json_1.default.validation.phoneNumberInvalid,
                path: "phoneNumber",
                location: "body",
            });
        if (errors.length > 0) {
            return (0, responseUtils_1.errorResponse)(res, 400, commonFile_json_1.default.validation.missingFields, errors);
        }
        // Check for existing user
        const existingUser = await userModel_1.default.findOne({ email });
        if (existingUser) {
            return (0, responseUtils_1.errorResponse)(res, 400, commonFile_json_1.default.auth.emailInUse, [
                {
                    type: "field",
                    msg: commonFile_json_1.default.auth.emailInUse,
                    path: "email",
                    location: "body",
                },
            ]);
        }
        // Hash password
        const hashedPassword = await bcryptjs_1.default.hash(password, 12);
        const userId = (0, uuid_1.v4)();
        // Create new user
        const newUser = new userModel_1.default({
            userId,
            firstName,
            lastName,
            email,
            password: hashedPassword,
            phoneNumber,
        });
        await newUser.save();
        // Save user to DynamoDB
        const dynamoParams = {
            TableName: process.env.USERS_TABLE,
            Item: {
                userId: { S: userId },
                firstName: { S: firstName },
                lastName: { S: lastName },
                email: { S: email },
                password: { S: hashedPassword },
                phoneNumber: { S: phoneNumber },
            },
        };
        try {
            await dynamoDBClient.send(new client_dynamodb_1.PutItemCommand(dynamoParams));
        }
        catch (dynamoError) {
            console.error("Error saving to DynamoDB:", dynamoError);
            return (0, responseUtils_1.errorResponse)(res, 500, commonFile_json_1.default.server.dynamoDBError, null, dynamoError.message);
        }
        // Respond with success
        return (0, responseUtils_1.successResponse)(res, 201, commonFile_json_1.default.auth.signupSuccessful, {
            userId,
            firstName,
            lastName,
            email,
            phoneNumber,
        });
    }
    catch (error) {
        console.error("Error creating user:", error);
        return (0, responseUtils_1.errorResponse)(res, 500, commonFile_json_1.default.server.internalError, null, error.message);
    }
};
exports.handleUserSignup = handleUserSignup;
const handleUserLogin = async (req, res) => {
    const { email, password } = req.body;
    try {
        // Validate input
        if (!email || !password) {
            return (0, responseUtils_1.errorResponse)(res, 400, commonFile_json_1.default.validation.emailInvalid);
        }
        // Check for user existence
        const user = await userModel_1.default.findOne({ email });
        if (!user) {
            return (0, responseUtils_1.errorResponse)(res, 400, commonFile_json_1.default.auth.invalidCredentials);
        }
        // Validate password
        const isMatch = await bcryptjs_1.default.compare(password, user.password);
        if (!isMatch) {
            return (0, responseUtils_1.errorResponse)(res, 400, commonFile_json_1.default.auth.invalidCredentials);
        }
        // Generate JWT token
        const token = jsonwebtoken_1.default.sign({ userId: user.userId }, process.env.JWT_SECRET, {
            expiresIn: "1h",
        });
        // Respond with success
        return (0, responseUtils_1.successResponse)(res, 200, commonFile_json_1.default.auth.loginSuccessful, { token });
    }
    catch (error) {
        console.error("Error logging in user:", error);
        return (0, responseUtils_1.errorResponse)(res, 500, commonFile_json_1.default.server.internalError, null, error.message);
    }
};
exports.handleUserLogin = handleUserLogin;
