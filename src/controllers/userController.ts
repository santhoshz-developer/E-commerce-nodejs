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
    if (!firstName || !lastName || !email || !password || !phoneNumber) {
      return errorResponse(res, 400, messages.validation.firstNameRequired, [
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
          msg: messages.validation.phoneNumberInvalid,
          path: "phoneNumber",
          location: "body",
        },
      ]);
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return errorResponse(res, 400, messages.auth.userAlreadyExists, [
        {
          type: "field",
          msg: messages.validation.emailInUse,
          path: "email",
          location: "body",
        },
      ]);
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const userId = uuidv4();

    const newUser = new User({
      userId,
      firstName,
      lastName,
      email,
      password: hashedPassword,
      phoneNumber,
    });
    await newUser.save();

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

    return successResponse(res, 201, messages.auth.userAlreadyExists, {
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
    if (!email || !password) {
      return errorResponse(res, 400, messages.validation.emailInvalid);
    }

    const user = await User.findOne({ email });
    if (!user) {
      return errorResponse(res, 400, messages.auth.invalidCredentials);
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return errorResponse(res, 400, messages.auth.invalidCredentials);
    }

    const token = jwt.sign({ userId: user.userId }, process.env.JWT_SECRET!, {
      expiresIn: "1h",
    });

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
