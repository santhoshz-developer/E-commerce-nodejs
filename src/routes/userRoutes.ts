import express, { Request, Response, NextFunction } from 'express';
import { createUserHandler, loginUserHandler } from '../controllers/userController';
import { validateUserSignup, validateLogin } from '../validator/userValidation'; // Updated import
import { validationResult } from 'express-validator';

const router = express.Router();

// *********************** SIGNUP **********************

router.post('/signup', validateUserSignup, (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
}, createUserHandler);

// *********************** LOGIN **********************

router.post('/login', validateLogin, (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
}, loginUserHandler);

export default router;
