"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const userController_1 = require("../controllers/userController");
const userValidation_1 = require("../validator/userValidation");
const express_validator_1 = require("express-validator");
const router = express_1.default.Router();
router.post('/signup', userValidation_1.validateUserSignup, (req, res, next) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
}, userController_1.createUserHandler);
router.post('/login', userValidation_1.validateLogin, (req, res, next) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
}, userController_1.loginUserHandler);
exports.default = router;
