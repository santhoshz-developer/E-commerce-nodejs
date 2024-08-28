import { Request, Response } from 'express';
import User from '../models/userModel';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { DynamoDBClient, PutItemCommand, GetItemCommand } from '@aws-sdk/client-dynamodb';


const client = new DynamoDBClient({ region: 'ap-south-1' });

export const createUserHandler = async (req: Request, res: Response): Promise<void> => {
  const { name, email, password, confirmPassword, phoneNumber } = req.body;

  // Validate request body
  if (!name || !email || !password || !confirmPassword || !phoneNumber) {
    res.status(400).json({ message: 'Missing required fields' });
    return;
  }

  if (password !== confirmPassword) {
    res.status(400).json({ message: 'Passwords do not match' });
    return;
  }

  try {
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400).json({ message: 'User already exists' });
      return;
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 12);
    const userId = uuidv4();

    // Create user in MongoDB
    const newUser = new User({
      userId,
      name,
      email,
      password: hashedPassword,
      phoneNumber,
    });
    await newUser.save();

    // Save user to DynamoDB
    const params = {
      TableName: process.env.USERS_TABLE!,
      Item: {
        userId: { S: userId },
        name: { S: name },
        email: { S: email },
        password: { S: hashedPassword },
        phoneNumber: { S: phoneNumber },
      },
    };

    try {
      await client.send(new PutItemCommand(params));
    } catch (dynamoError) {
      console.error('Error saving to DynamoDB:', dynamoError);
      res.status(500).json({ message: 'Error saving to DynamoDB', error: dynamoError.message });
      return;
    }

    res.status(201).json({ message: 'User created successfully', user: { userId, name, email, phoneNumber } });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ message: 'Internal server errors', error: error.message });
  }
};



export const loginUserHandler = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;

  // Validate request body
  if (!email || !password) {
    res.status(400).json({ message: 'Missing required fields' });
    return;
  }

  try {
    // Check user in MongoDB
    const user = await User.findOne({ email });
    if (!user) {
      res.status(400).json({ message: 'Invalid credentials' });
      return;
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(400).json({ message: 'Invalid credentials' });
      return;
    }

    // Generate JWT token
    const token = jwt.sign({ userId: user.userId }, process.env.JWT_SECRET!, { expiresIn: '1h' });

    res.status(200).json({ message: 'Login successful', token });
  } catch (error) {
    console.error('Error logging in user:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};