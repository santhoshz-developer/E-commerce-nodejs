import express, { Request, Response, NextFunction } from 'express';
import { handleUserSignup, handleUserLogin } from '../controllers/userController';
import { validateUserSignup, validateUserLogin } from '../validator/userValidation';
import { validationResult } from 'express-validator';

const router = express.Router();

router.post('/signup', validateUserSignup, (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
}, handleUserSignup);

router.post('/login', validateUserLogin, (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
}, handleUserLogin);

export default router;
