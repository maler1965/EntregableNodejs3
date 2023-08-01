const express = require('express');

//controllers
const authController = require('../controllers/auth.controller2');

//middlewares
const validationMiddleware = require('../middlewares/validations.middleware2');
//const userMiddleware = require('../middlewares/user.middleware');
//const authMiddleware = require('../middlewares/auth.middleware');

const router = express.Router();

//router.use(authMiddleware.protect);

router.post(
  '/',
  validationMiddleware.updatePasswordValidation,
  // userMiddleware.validUser,
  //authMiddleware.protectAccountOwner,
  authController.updatePassword
);

module.exports = router;
