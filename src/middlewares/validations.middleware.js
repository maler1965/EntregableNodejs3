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

exports.updateUserValidation = [
  body('name').notEmpty().withMessage('Name is required'),
  body('description')
    .notEmpty()
    .withMessage('Description is required')
    .isLength({ min: 10 })
    .withMessage('Description must be at least 10 characters long'),
  validFields,
];

exports.createUserValidation = [
  body('name').notEmpty().withMessage('Name is required'),
  body('email')
    .notEmpty()
    .withMessage('Email is required')
    .isEmail() //para que tenga el formato de email
    .withMessage('Email must be a correct format'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must have a least 8 characters')
    .matches(/[a-zA-Z]/) //la contrasena debe tener al menos una letra
    .withMessage('Password must have cotain a least one letter'),
  body('description').notEmpty().withMessage('Description is required'),
  validFields, //lo llamamos para hacer la importacion
];

exports.loginUserValidation = [
  body('email')
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Email must be a correct format'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must have a least 8 characters')
    .matches(/[a-zA-Z]/)
    .withMessage('Password must have cotain a least one letter'),
  validFields,
];

exports.updatePasswordValidation = [
  body('currentPassword')
    .isLength({ min: 8 })
    .withMessage('Password must have a least 8 characters')
    .matches(/[a-zA-Z]/)
    .withMessage('Password must have cotain a least one letter'),
  body('newPassword')
    .isLength({ min: 8 })
    .withMessage('Password must have a least 8 characters')
    .matches(/[a-zA-Z]/)
    .withMessage('Password must have cotain a least one letter'),
  validFields,
];
