const catchAsync = require('../utils/catchAsync');
const User = require('../models/users.model');
const bcrypt = require('bcryptjs');
const generateJWT = require('../utils/jwt');
const AppError = require('../utils/appError');

exports.signUp = catchAsync(async (req, res, next) => {
  const { name, password, amount } = req.body;

  const salt = await bcrypt.genSalt(12);
  const encryptedPassword = await bcrypt.hash(password, salt);

  // generateRandomNumber
  const maxNumber = Math.pow(10, 6) * 9;
  const randomNumber = Math.floor(Math.random() * maxNumber) + Math.pow(10, 6);

  let checkAmount;

  if (parseFloat(amount) < 1000) {
    throw new Error(
      'The initial amount must be equal to or greater than $1000'
    );
  } else {
    checkAmount = amount;
  }

  const user = await User.create({
    name: name.toLowerCase().trim(),
    accountNumber: randomNumber,
    password: encryptedPassword,
    amount: checkAmount,
  });

  const token = await generateJWT(user.id);

  res.status(200).json({
    status: 'success',
    message: 'The user has been created',
    token,
    user: {
      id: user.id,
      name: user.name,
      accountNumber: user.accountNumber,
      amount: user.amount,
    },
  });
});

exports.signIn = catchAsync(async (req, res, next) => {
  const { accountNumber, password } = req.body;

  const user = await User.findOne({
    where: {
      accountNumber: accountNumber,
      status: 'active',
    },
  });

  if (!user) {
    return next(
      new AppError(`User with accountNumber: ${accountNumber} not found`, 404)
    );
  }

  if (!(await bcrypt.compare(password, user.password))) {
    return next(new AppError('Incorrect accountNumber or password', 401));
  }

  const token = await generateJWT(user.id);

  res.status(200).json({
    status: 'success',
    token,
    user: {
      id: user.id,
      name: user.name,
      accountNumber: user.accountNumber,
      amount: user.amount,
    },
  });
});
