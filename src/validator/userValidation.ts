import { body } from "express-validator";
import User from "../models/userModel";
import messages from "../utils/commonFile.json";

// Validation for Signup
export const validateUserSignup = [
  body("firstName")
    .notEmpty()
    .withMessage(messages.validation.firstNameRequired),
  body("lastName").notEmpty().withMessage(messages.validation.lastNameRequired),
  body("email")
    .isEmail()
    .withMessage(messages.validation.emailInvalid)
    .custom(async (email) => {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        throw new Error(messages.validation.emailInUse);
      }
      return true;
    }),
  body("password")
    .isLength({ min: 6 })
    .withMessage(messages.validation.passwordShort),
  body("phoneNumber")
    .isMobilePhone("any")
    .withMessage(messages.validation.phoneNumberInvalid),
];

// Validation for Login
export const validateUserLogin = [
  body("email").isEmail().withMessage(messages.validation.emailInvalid),
  body("password").notEmpty().withMessage(messages.validation.passwordRequired),
];
