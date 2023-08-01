const express = require('express');

const authController = require('./../controllers/auth.controller2');

const validationMiddleware = require('./../middlewares/validations.middleware2');
const userMiddleware = require('./../middlewares/user.middleware');
const authMiddleware = require('./../middlewares/auth.middleware');

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

router.use(authMiddleware.protect);

router.get(
  '/:id/history',
  userMiddleware.validUser,
  authMiddleware.protectAccountOwner,
  authController.findAllTransfers
);

module.exports = router;
