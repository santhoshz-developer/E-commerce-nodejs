"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginUserHandler = exports.createUserHandler = void 0;
const userModel_1 = __importDefault(require("../models/userModel"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const uuid_1 = require("uuid");
const client_dynamodb_1 = require("@aws-sdk/client-dynamodb");
const client = new client_dynamodb_1.DynamoDBClient({ region: 'ap-south-1' });
const createUserHandler = async (req, res) => {
    const { name, email, password, phoneNumber } = req.body;
    try {
        // Hash the password
        const hashedPassword = await bcryptjs_1.default.hash(password, 12);
        const userId = (0, uuid_1.v4)();
        // Create user in MongoDB
        const newUser = new userModel_1.default({
            userId,
            name,
            email,
            password: hashedPassword,
            phoneNumber,
        });
        await newUser.save();
        // Save user to DynamoDB
        const params = {
            TableName: process.env.USERS_TABLE,
            Item: {
                userId: { S: userId },
                name: { S: name },
                email: { S: email },
                password: { S: hashedPassword },
                phoneNumber: { S: phoneNumber },
            },
        };
        await client.send(new client_dynamodb_1.PutItemCommand(params));
        res.status(201).json({ message: 'User created successfully', user: { userId, name, email, phoneNumber } });
    }
    catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.createUserHandler = createUserHandler;
const loginUserHandler = async (req, res) => {
    const { email, password } = req.body;
    try {
        // Check user in MongoDB
        const user = await userModel_1.default.findOne({ email });
        if (!user) {
            res.status(400).json({ message: 'Invalid credentials' });
            return;
        }
        // Compare password
        const isMatch = await bcryptjs_1.default.compare(password, user.password);
        if (!isMatch) {
            res.status(400).json({ message: 'Invalid credentials' });
            return;
        }
        // Generate JWT token
        const token = jsonwebtoken_1.default.sign({ userId: user.userId }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.status(200).json({ message: 'Login successful', token });
    }
    catch (error) {
        console.error('Error logging in user:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.loginUserHandler = loginUserHandler;
