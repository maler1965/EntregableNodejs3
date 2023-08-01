const express = require('express');

//controllers
const authController = require('./../controllers/auth.controller2');

//middlewares
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
/**/
router.get(
  '/:id/history',
  //validationMiddleware.updatePasswordValidation,
  userMiddleware.validUser,
  authMiddleware.protectAccountOwner,
  authController.findAllUsers //updatePassword
);

module.exports = router;
