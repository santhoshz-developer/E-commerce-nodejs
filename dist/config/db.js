"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const connectDatabase = async () => {
    const mongoURI = process.env.MONGODB_URI;
    if (!mongoURI) {
        throw new Error('MONGODB_URI is not defined in environment variables');
    }
    try {
        await mongoose_1.default.connect(mongoURI);
        console.log('MongoDB connected');
    }
    catch (err) {
        console.error('MongoDB connection error:', err);
        throw new Error('Failed to connect to MongoDB');
    }
};
exports.default = connectDatabase;
