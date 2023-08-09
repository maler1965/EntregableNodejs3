const express = require('express');

//Controller
const transferController = require('../controllers/transfer.controller');

//Middleware
const validationMiddleware = require('../middlewares/validations.middleware');
const authMiddleware = require('../middlewares/auth.middleware');

const router = express.Router();

router.use(authMiddleware.protect);

router.post(
  '/',
  validationMiddleware.updateValidation,
  transferController.updateTransfer
);

module.exports = router;
