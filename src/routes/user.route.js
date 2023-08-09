const express = require('express');

//Controlle
const userController = require('../controllers/user.controller');

//Middleware
const userMiddleware = require('../middlewares/user.middleware');
const authMiddleware = require('../middlewares/auth.middleware');

const router = express.Router();

router.use(authMiddleware.protect);

router.get(
  '/:id/history',
  userMiddleware.validUser,
  authMiddleware.protectAccountOwner,
  userController.findAllTransfers
);

module.exports = router;
