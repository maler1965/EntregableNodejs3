const express = require('express');

//Controlle
const authController = require('../controllers/auth.controller');

//Middleware
const validationMiddleware = require('../middlewares/validations.middleware');

const router = express.Router();

router.post(
  '/signup',
  validationMiddleware.createUserValidation,
  authController.signUp
);

router.post(
  '/signin',
  validationMiddleware.loginUserValidation,
  authController.signIn
);
module.exports = router;
