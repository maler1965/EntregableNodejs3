const express = require('express');
const authController = require('../controllers/auth.controller2');
const validationMiddleware = require('../middlewares/validations.middleware2');
const router = express.Router();

router.post(
  '/',
  validationMiddleware.updatePasswordValidation,
  authController.updatePassword
);

module.exports = router;
