const { body, validationResult } = require('express-validator');

const validFields = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: 'error',
      errors: errors.mapped(),
    });
  }

  next();
};

exports.createUserValidation = [
  body('name').notEmpty().withMessage('Name is required'),
  body('amount')
    .notEmpty()
    .withMessage('amount is required')
    .isInt()
    .withMessage('Amount must be an integer'),

  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 8 })
    .withMessage('Password must have a least 8 characters')
    .matches(/[a-zA-Z]/) //la contrasena debe tener al menos una letra
    .withMessage('Password must have cotain a least one letter'),

  validFields,
];

exports.loginUserValidation = [
  body('accountNumber')
    .notEmpty()
    .withMessage('accountNumber is required')
    .isInt()
    .withMessage('accountNumber must be an integer'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 8 })
    .withMessage('Password must have a least 8 characters')
    .matches(/[a-zA-Z]/)
    .withMessage('Password must have cotain a least one letter'),
  validFields,
];

exports.updatePasswordValidation = [
  body('amount')
    .notEmpty()
    .withMessage('amount is required')
    .isInt()
    .withMessage('Amount must be an integer'),
  body('senderUserId')
    .notEmpty()
    .withMessage('accountNumber is required')
    .isInt()
    .withMessage('accountNumber must be an integer'),
  body('receiverUserId')
    .notEmpty()
    .withMessage('accountNumber is required')
    .isInt()
    .withMessage('accountNumber must be an integer'),
  validFields,
];
