import { Request, Response } from "express";
import User from "../models/userModel";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb";
import { successResponse, errorResponse } from "../utils/responseUtils";
import messages from "../utils/commonFile.json";
const dynamoDBClient = new DynamoDBClient({ region: "ap-south-1" });

export const handleUserSignup = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { firstName, lastName, email, password, phoneNumber } = req.body;

  try {
    // Validate input
    if (!firstName || !lastName || !email || !password || !phoneNumber) {
      const errors = [
        {
          type: "field",
          msg: messages.validation.firstNameRequired,
          path: "firstName",
          location: "body",
        },
        {
          type: "field",
          msg: messages.validation.lastNameRequired,
          path: "lastName",
          location: "body",
        },
        {
          type: "field",
          msg: messages.validation.emailInvalid,
          path: "email",
          location: "body",
        },
        {
          type: "field",
          msg: messages.validation.passwordRequired,
          path: "password",
          location: "body",
        },
        {
          type: "field",
          msg: messages.validation.phoneNumberInvalid,
          path: "phoneNumber",
          location: "body",
        },
      ].filter((error) => !req.body[error.path]);
      return errorResponse(res, 400, messages.validation.missingFields, errors);
    }

    // Check for existing user
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return errorResponse(res, 400, messages.auth.emailInUse, [
        {
          type: "field",
          msg: messages.auth.emailInUse,
          path: "email",
          location: "body",
        },
      ]);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);
    const userId = uuidv4();

    // Create new user
    const newUser = new User({
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
      TableName: process.env.USERS_TABLE!,
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
      await dynamoDBClient.send(new PutItemCommand(dynamoParams));
    } catch (dynamoError) {
      console.error("Error saving to DynamoDB:", dynamoError);
      return errorResponse(
        res,
        500,
        messages.server.dynamoDBError,
        null,
        dynamoError.message
      );
    }

    // Respond with success
    return successResponse(res, 201, messages.auth.signupSuccessful, {
      userId,
      firstName,
      lastName,
      email,
      phoneNumber,
    });
  } catch (error) {
    console.error("Error creating user:", error);
    return errorResponse(
      res,
      500,
      messages.server.internalError,
      null,
      error.message
    );
  }
};

export const handleUserLogin = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { email, password } = req.body;

  try {
    // Validate input
    if (!email || !password) {
      return errorResponse(res, 400, messages.validation.emailInvalid);
    }

    // Check for user existence
    const user = await User.findOne({ email });
    if (!user) {
      return errorResponse(res, 400, messages.auth.invalidCredentials);
    }

    // Validate password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return errorResponse(res, 400, messages.auth.invalidCredentials);
    }

    // Generate JWT token
    const token = jwt.sign({ userId: user.userId }, process.env.JWT_SECRET!, {
      expiresIn: "1h",
    });

    // Respond with success
    return successResponse(res, 200, messages.auth.loginSuccessful, { token });
  } catch (error) {
    console.error("Error logging in user:", error);
    return errorResponse(
      res,
      500,
      messages.server.internalError,
      null,
      error.message
    );
  }
};
